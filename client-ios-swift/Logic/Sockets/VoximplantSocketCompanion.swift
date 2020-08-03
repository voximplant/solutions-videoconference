/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import Foundation
import SocketRocket

final class VoximplantSocketComplanion: NSObject, SRWebSocketDelegate {
    private let sessionID: String
    private let conference: String
    private let socketRequest: URLRequest
    private var socket: SRWebSocket?
    private var isConnected: Bool = false {
        didSet {
            if isConnected == oldValue { return }
            isConnectedObserver?(isConnected)
        }
    }
    private var pendingCommands: [JSON] = []
    var commandObserver: ((VoximplantSocketCommand) -> Void)?
    var isConnectedObserver: ((Bool) -> Void)?
    
    init(sessionID: String, conference: String, socket: URL) {
        self.sessionID = sessionID
        self.conference = conference
        self.socketRequest = URLRequest(url: socket)
        super.init()
    }
    
    deinit {
        pendingCommands.removeAll()
        socket?.delegate = nil
        socket?.close()
    }
    
    func connect() {
        socket = SRWebSocket(urlRequest: socketRequest)
        socket?.delegate = self
        socket?.open()
    }
    
    func sayHello(deviceUUID: String, isMuted: Bool, isSharingScreen: Bool, isSendingVideo: Bool) throws {
        try send(
            command: .hello(
                content: VoximplantSocketCommand.HelloContent(
                    conference: conference,
                    sessionID: sessionID,
                    deviceUUID: deviceUUID,
                    isMuted: isMuted,
                    isSharingScreen: isSharingScreen,
                    isSendingVideo: isSendingVideo
                )
            )
        )
    }
    
    func send(command: VoximplantSocketCommand) throws {
        let data = try JSONEncoder().encode(command)
        if let json = JSON(with: data) {
            send(command: json)
        }
    }
    
    // MARK: - SRWebSocketDelegate -
    func webSocket(_ webSocket: SRWebSocket, didReceiveMessage message: Any) {
        if let json = message as? JSON {
            do {
                let command = try JSONDecoder().decode(VoximplantSocketCommand.self, from: json.data)
                log("Did receive ws command \(command)")
                commandObserver?(command)
            } catch let error as VoximplantSocketCommand.CodingError {
                log("There was an error parsing ws message \(error.localizedDescription)")
            } catch (let error) {
                log("There was an error parsing ws message \(error.localizedDescription)")
            }
        } else {
            log("Did receive an unknown typed ws message \(message)")
        }
    }
    
    func webSocketDidOpen(_ webSocket: SRWebSocket) {
        log("Did open web socket")
        isConnected = true
        pendingCommands.forEach { send(command: $0) }
        pendingCommands.removeAll()
    }
    
    func webSocket(_ webSocket: SRWebSocket, didFailWithError error: Error) {
        log("Ws did fail with error \(error.localizedDescription)")
        isConnected = false
    }
    
    func webSocket(_ webSocket: SRWebSocket, didCloseWithCode code: Int, reason: String, wasClean: Bool) {
        log("Ws did close with code \(code) and reason \(reason)")
        isConnected = false
    }
    
    // MARK: - Private -
    private func send(command: JSON) {
        if isConnected {
            log("Did send ws command \(command)")
            socket?.send(command)
        } else {
            pendingCommands.append(command)
        }
    }
}
