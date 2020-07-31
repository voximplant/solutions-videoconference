/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import VoxImplantSDK

final class ReconnectOperation: Operation {
    private let attemptsLimit: Int
    private let sleepTime: UInt32
    private let timeout: TimeInterval
    private let resultCompletion: (Error?) -> Void
    private let login: (@escaping LoginHandler) -> Void
    private let join: () throws -> Void
    private var attempt = 0
    private var timer: Timer?
    
    override var isAsynchronous: Bool { true }
    override var isFinished: Bool { state == .done }
    override var isExecuting: Bool { state == .started }
    private var state: State = .initial {
        willSet {
            // due to a legacy issue, these have to be strings. Don't make them key paths.
            willChangeValue(forKey: "isExecuting")
            willChangeValue(forKey: "isFinished")
        }
        didSet {
            log("ReconnectOperation state changed \(state)")
            didChangeValue(forKey: "isFinished")
            didChangeValue(forKey: "isExecuting")
        }
    }
    
    init(attemptsLimit: Int,
         waitForTheNextAttempt period: Int,
         timeout: Int,
         completion: @escaping (Error?) -> Void,
         login: @escaping (@escaping LoginHandler) -> Void,
         join: @escaping () throws -> Void
    ) {
        self.attemptsLimit = attemptsLimit
        self.sleepTime = UInt32(period)
        self.resultCompletion = completion
        self.login = login
        self.join = join
        self.timeout = TimeInterval(timeout)
        super.init()
    }
    
    override func main() {
        super.main()
        
        if isCancelled { return }
        
        state = .started
        let timer = Timer(timeInterval: timeout, repeats: false) { _ in
            log("ReconenctOperation timer fired")
            self.cancel()
            self.resultCompletion(ReconnectError.timeout)
        }
        self.timer = timer
        RunLoop.main.add(timer, forMode: .default)
        attemptToReconnect(completion: resultCompletion)
    }
    
    override func cancel() {
        super.cancel()
        timer?.invalidate()
        state = .done
    }
    
    private func attemptToReconnect(completion: @escaping (Error?) -> Void) {
        if isCancelled { return }
        
        attempt += 1
        
        log("Reconnecting operation, attempt \(attempt)")
        if attempt >= attemptsLimit {
            completion(ReconnectError.timeout)
            state = .done
            return
        }
        login { [weak self] error in
            guard let self = self else { return }
            if self.isCancelled { return }
            
            if let error = error {
                self.handleError(error: error, completion: completion)
                return
            }
            do {
                try self.join()
                completion(nil)
                self.state = .done
            } catch (let error) {
                self.handleError(error: error, completion: completion)
            }
        }
    }
    
    private func handleError(error: Error, completion: @escaping (Error?) -> Void) {
        log("ReconnectOperation is about to handle error \(error)")
        if isCancelled { return }
        if let error = error as NSError? {
            switch error.code {
            case VIConnectivityError.Code.connectivityCheckFailed.rawValue:
                sleep(sleepTime)
                attemptToReconnect(completion: completion)
            case VIConnectivityError.Code.connectionFailed.rawValue:
                sleep(sleepTime)
                attemptToReconnect(completion: completion)
            case VILoginError.Code.networkIssues.rawValue:
                sleep(sleepTime)
                attemptToReconnect(completion: completion)
            case VILoginError.Code.timeout.rawValue:
                attemptToReconnect(completion: completion)
            default:
                completion(ReconnectError.reconnectFailed)
                state = .done
            }
        }
    }
    
    private enum State {
        case initial
        case started
        case done
    }
}
