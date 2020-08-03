/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import VoxImplantSDK

final class VoximplantService:
    NSObject,
    ConferenceService,
    AuthService,
    VICallDelegate,
    VIEndpointDelegate,
    VIAudioManagerDelegate,
    VIClientSessionDelegate,
    Reconnecting,
    SpeakerAutoselecting
{
    private let client: VIClient
    private var socketCompanion: VoximplantSocketComplanion?
    private var managedConference: ConferenceWrapper?
    private var connectCompletion: ((Error?) -> Void)?
    private var disconnectCompletion: (() -> Void)?
    
    weak var endpointObserver: EndpointObserver?
    weak var videoStreamObserver: VideoStreamObserver?
    weak var connectionObserver: ConnectionObserver?
    weak var socketObserver: SocketObserver?
    
    var conferenceID: String? { managedConference?.ID }
    
    private var reconnectOperation: ReconnectOperation?
    private let serviceQueue: OperationQueue = {
        let queue = OperationQueue()
        queue.name = "reconnectQueue"
        queue.qualityOfService = .utility
        return queue
    }()
    
    required init(client: VIClient) {
        self.client = client
        super.init()
        client.sessionDelegate = self
        VIAudioManager.shared().delegate = self
    }
    
    // MARK: - Join -
    func joinConference(withID id: String, name: String, sendVideo video: Bool) throws {
        guard let conference = client.callConference("conf_\(id)",
            settings: makeSettings(with: name, sendVideo: video))
            else {
                throw ConferenceError.unableToCreateConference
        }
        
        self.managedConference = ConferenceWrapper(
            conference: conference,
            ID: id,
            myName: name,
            permissions: ConferencePermissions()
        )
        
        conference.start()
        conference.add(self)
        
        selectSpeaker()
    }
    
    private func rejoinConference() throws {
        guard let oldConference = managedConference
            else {
                throw ReconnectError.conferenceNotFound
        }
        
        guard let conference = client.callConference("conf_\(oldConference.ID)",
            settings: makeSettings(with: oldConference.myName, sendVideo: oldConference.isSendingVideo))
            else {
                throw ReconnectError.unableToCreateConference
        }
        
        self.managedConference = ConferenceWrapper(
            conference: conference,
            ID: oldConference.ID,
            myName: oldConference.myName,
            isSendingAudio: oldConference.isSendingAudio,
            isSharingScreen: oldConference.isSharingScreen,
            isSendingVideo: oldConference.isSendingVideo,
            permissions: oldConference.permissions
        )
        
        conference.start()
        conference.add(self)
        
        if !oldConference.isSendingAudio {
            conference.sendAudio = false
        }
        
        if let preferedAudioDevice = oldConference.preferedAudioDevice {
            selectIfAvailable(preferedAudioDevice)
        } else {
            selectSpeaker()
        }
    }
    
    // MARK: - Conference actions -
    func mute(_ mute: Bool) throws {
        guard let conferenceWrapper = managedConference else {
            throw ConferenceError.noActiveConferenceFound
        }
        if !mute && !conferenceWrapper.permissions.isSendingAudioAllowed {
            throw ConferenceError.permissionError
        }
        
        conferenceWrapper.conference.sendAudio = !mute
        managedConference?.isSendingAudio = !mute
        endpointObserver?.endpointMuteChanged(to: mute, endpoint: myID)
        
        do {
            try socketCompanion?.send(command: .isMuted(muted: mute))
        } catch (let error) {
            log("There was an error sending ws mute command \(error.localizedDescription)")
        }
    }
    
    func sendVideo(_ send: Bool, completion: @escaping (Error?) -> Void) {
        guard let conferenceWrapper = managedConference else {
            completion(ConferenceError.noActiveConferenceFound)
            return
        }
        if send && !conferenceWrapper.permissions.isSendingVideoAllowed {
            completion(ConferenceError.permissionError)
        }
        
        conferenceWrapper.conference.setSendVideo(send) { [weak self] error in
            if let error = error {
                completion(error)
                return
            }
            
            self?.managedConference?.isSendingVideo = send
            self?.endpointObserver?.endpointSendingVideoChanged(to: send, endpoint: myID)
            completion(nil)
            
            do {
                try self?.socketCompanion?.send(command: .isSendingVideo(sending: send))
            } catch (let error) {
                log("There was an error sending ws video command \(error.localizedDescription)")
            }
        }
    }
    
    func switchCamera() {
        VICameraManager.shared().useBackCamera.toggle()
    }
    
    // MARK: - Auth -
    func login(completion: @escaping LoginHandler) {
        connect { [weak self] error in
            if let error = error {
                completion(error)
                return
            }
            #error("Enter Voximplant Account credentials")
            self?.client.login(
                withUser: "",
                password: "",
                success: { _, _ in completion(nil) },
                failure: { completion($0) }
            )
        }
    }
    
    // MARK: - Connect
    private func connect(completion: @escaping (Error?) -> Void) {
        if self.client.clientState == .disconnected || self.client.clientState == .connecting {
            self.connectCompletion = { error in
                self.connectCompletion = nil
                completion(error)
            }
            self.client.connect()
        } else {
            log("Already connected - executing completion")
            completion(nil)
        }
    }
    
    func leaveConference() {
        log("Leave conference called")
        managedConference?.ended = true
        managedConference?.conference.hangup(withHeaders: nil)
    }
    
    func manuallyDisconnect(_ completion: (() -> Void)?) {
        disconnect(completion)
        cleanResources()
    }
    
    private func disconnect(_ completion: (() -> Void)?) {
        if client.clientState == .disconnected {
            log("Already disconnected - executing completion")
            completion?()
        } else {
            disconnectCompletion = {
                self.disconnectCompletion = nil
                self.connectionObserver?.didDisconnect()
                completion?()
            }
            client.disconnect()
        }
    }
    
    // MARK: - Reconnect
    private func reconnect(completion: @escaping (Error?) -> Void) {
        log("Did begin reconnecting ")
        connectionObserver?.didBeginReconnecting()
        
        let reconnectOperation = ReconnectOperation(
            attemptsLimit: 6,
            waitForTheNextAttempt: 3,
            timeout: 60,
            completion: completion,
            login: login(completion:),
            join: rejoinConference
        )
        self.reconnectOperation = reconnectOperation
        serviceQueue.addOperation(reconnectOperation)
    }
    
    func cancelReconnect() {
        self.reconnectOperation?.cancel()
        self.reconnectOperation = nil
        self.manuallyDisconnect { }
    }
    
    // MARK: - VIClientSessionDelegate -
    func clientSessionDidConnect(_ client: VIClient) {
        serviceQueue.addOperation {
            self.connectCompletion?(nil)
        }
    }
    
    func client(_ client: VIClient, sessionDidFailConnectWithError error: Error) {
        serviceQueue.addOperation {
            self.connectCompletion?(error)
        }
    }
    
    func clientSessionDidDisconnect(_ client: VIClient) {
        serviceQueue.addOperation {
            self.disconnectCompletion?()
        }
    }
    
    // MARK: - VICallDelegate -
    func call(_ call: VICall, didConnectWithHeaders headers: [AnyHashable : Any]?) {
        connectionObserver?.didConnect()
        endpointObserver?.endpointAdded(endpoint: myID, name: managedConference?.myName, place: 0)
        if let headers = headers,
            let sessionID = headers[HeaderKey.sessionID] as? String,
            let conference = headers[HeaderKey.userID] as? String,
            let socketString = headers[HeaderKey.socket] as? String,
            let socket = URL(string: socketString) {
            socketCompanion = VoximplantSocketComplanion(sessionID: sessionID, conference: conference, socket: socket)
            socketCompanion?.commandObserver = didReceive(command:)
            socketCompanion?.isConnectedObserver = socketConnectionObserver(isConnected:)
            socketCompanion?.connect()
        }
    }
    
    func call(_ call: VICall, didDisconnectWithHeaders headers: [AnyHashable : Any]?, answeredElsewhere: NSNumber) {
        if managedConference?.ended ?? true { return }
        managedConference?.ended = true
        
        if let headers = headers, headers[HeaderKey.kick] != nil {
            log("Has been kicked")
            manuallyDisconnect {
                self.connectionObserver?.hasBeenKicked()
            }
        } else {
            reconnect { error in
                log("Reconnect ended \(error != nil ? "with error \((error as? ReconnectError)?.localizedDescription ?? "")" : "")")
                if let error = error {
                    self.manuallyDisconnect {
                        self.connectionObserver?.didFail(with: error)
                    }
                }
                self.reconnectOperation?.cancel()
                self.reconnectOperation = nil
            }
        }
    }
    
    func call(_ call: VICall, didFailWithError error: Error, headers: [AnyHashable : Any]?) {
        if managedConference?.ended ?? true { return }
        managedConference?.ended = true
        manuallyDisconnect {
            self.connectionObserver?.didFail(with: error)
        }
    }
    
    func call(_ call: VICall, didAddLocalVideoStream videoStream: VIVideoStream) {
        videoStreamObserver?.didAddVideoStream(for: myID, renderOn: { renderer in
            if let renderer = renderer {
                videoStream.addRenderer(renderer)
            }
        })
    }
    
    func call(_ call: VICall, didRemoveLocalVideoStream videoStream: VIVideoStream) {
        videoStreamObserver?.didRemoveVideoStream(for: myID)
        videoStream.removeAllRenderers()
    }
    
    func call(_ call: VICall, didAdd endpoint: VIEndpoint) {
        if endpoint.endpointId == managedConference?.conference.callId { return }
        log("didAdd endpoint displayName: \(endpoint.userDisplayName ?? "nil") user: \(endpoint.user ?? "nil") id: \(endpoint.endpointId)")
        endpoint.delegate = self
        endpointObserver?.endpointAdded(
            endpoint: endpoint.endpointId,
            name: endpoint.userDisplayName ?? endpoint.user,
            place: Int(truncating: endpoint.place ?? 0)
        )
    }
    
    // MARK: - VIEndpointDelegate -
    func endpointInfoDidUpdate(_ endpoint: VIEndpoint) {
        if endpoint.endpointId == managedConference?.conference.callId { return }
        log("endpointInfoDidUpdate displayName: \(endpoint.userDisplayName ?? "nil") user: \(endpoint.user ?? "") id: \(endpoint.endpointId)")
        endpointObserver?.endpointPlaceChanged(
            to: Int(truncating: endpoint.place ?? 0),
            endpoint: endpoint.endpointId
        )
        endpointObserver?.endpointNameChanged(
            to: endpoint.userDisplayName ?? endpoint.user,
            endpoint: endpoint.endpointId
        )
    }
    
    func endpointDidRemove(_ endpoint: VIEndpoint) {
        endpointObserver?.endpointRemoved(endpoint: endpoint.endpointId)
    }
    
    func endpoint(_ endpoint: VIEndpoint, didAddRemoteVideoStream videoStream: VIVideoStream) {
        videoStreamObserver?.didAddVideoStream(for: endpoint.endpointId, renderOn: { renderer in
            if let renderer = renderer {
                videoStream.addRenderer(renderer)
            }
        })
    }
    
    func endpoint(_ endpoint: VIEndpoint, didRemoveRemoteVideoStream videoStream: VIVideoStream) {
        videoStreamObserver?.didRemoveVideoStream(for: endpoint.endpointId)
        videoStream.removeAllRenderers()
    }
    
    // MARK: - VIAudioManagerDelegate -
    func audioDeviceChanged(_ audioDevice: VIAudioDevice) {
        if let conferenceWrapper = managedConference, !conferenceWrapper.ended {
            managedConference?.preferedAudioDevice = audioDevice.type
        }
    }
    
    func audioDeviceUnavailable(_ audioDevice: VIAudioDevice) { }
    
    func audioDevicesListChanged(_ availableAudioDevices: Set<VIAudioDevice>) {
        selectSpeaker(from: availableAudioDevices)
    }
    
    // MARK: - Private -
    private enum HeaderKey {
        static let displayName = "X-Display-Name"
        static let email = "X-Email"
        static let deviceUUID = "X-UUID"
        static let sessionID = "X-Conf-Sess"
        static let userID = "X-Conf-Call"
        static let socket = "X-WS"
        static let kick = "X-Kick"
    }
    
    private func socketConnectionObserver(isConnected connected: Bool) {
        socketObserver?.socketConnectedStateChanged(to: connected)
        if connected {
            do {
                guard let conferenceWrapper = managedConference else {
                    return
                }
                try socketCompanion?.sayHello(
                    deviceUUID: Device.uuid.uuidString,
                    isMuted: !conferenceWrapper.isSendingAudio,
                    isSharingScreen: conferenceWrapper.isSharingScreen,
                    isSendingVideo: conferenceWrapper.isSendingVideo
                )
            } catch (let error) {
                log("There was an error \(error.localizedDescription) sending ws hello command. Closing socket")
                socketCompanion = nil
            }
        }
        else if !connected && managedConference != nil {
            socketCompanion?.connect()
        }
    }
    
    private func didReceive(command: VoximplantSocketCommand) {
        switch command {
        case .changeLevel(let level):
            managedConference?.permissions.audioLevel = level
            log("Did receive command change level to \(level)")
        case .changeVideo(let allowed):
            managedConference?.permissions.isSendingVideoAllowed = allowed
            log("Did receive command change video to \(allowed)")
        case .changeAudio(let allowed):
            managedConference?.permissions.isSendingAudioAllowed = allowed
            log("Did receive command change audio to \(allowed)")
        case .changeSharing(let allowed):
            managedConference?.permissions.isSharingScreenAllowed = allowed
            log("Did receive command change sharing to \(allowed)")
        case .owner(let id):
            // todo: save owner to permissions
            endpointObserver?.ownerChanged(to: id)
        case .isMuted(let isMuted, let id):
            if let id = id {
                endpointObserver?.endpointMuteChanged(to: isMuted, endpoint: id)
            }
        case .isSendingVideo(let sending, let id):
            if let id = id {
                endpointObserver?.endpointSendingVideoChanged(to: sending, endpoint: id)
            }
        case .isSharingScreen(let sharing, let id):
            if let id = id {
                endpointObserver?.endpointSharingScreenChanged(to: sharing, endpoint: id)
            }
        default:
            log("Did receive unhandled command \(command)")
            break
        }
    }
    
    private func makeSettings(with name: String, sendVideo video: Bool) -> VICallSettings {
        let settings = VICallSettings()
        settings.extraHeaders = [
            HeaderKey.displayName: name,
            HeaderKey.email: "",
            HeaderKey.deviceUUID: Device.uuid.uuidString
        ]
        settings.preferredVideoCodec = .VP8
        settings.videoFlags = VIVideoFlags.videoFlags(receiveVideo: true, sendVideo: video)
        return settings
    }
    
    private func cleanResources() {
        managedConference = nil
        socketCompanion = nil
    }
    
    private struct ConferenceWrapper {
        let conference: VICall
        let ID: String
        var myName: String
        var isSendingAudio: Bool = true
        var isSharingScreen: Bool = false
        var isSendingVideo: Bool = true
        var permissions: ConferencePermissions
        var ended: Bool = false
        var preferedAudioDevice: VIAudioDeviceType? = nil
    }

    private struct ConferencePermissions {
        var isOwner: Bool = false
        var isSharingScreenAllowed: Bool = true
        var isSendingVideoAllowed: Bool = true
        var isSendingAudioAllowed: Bool = true
        var audioLevel: Double = 1
    }
}
