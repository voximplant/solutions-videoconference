/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import VoxImplantSDK

typealias EndpointID = String

protocol ConferenceService: AnyObject {
    var conferenceID: String? { get }
    
    func joinConference(withID id: String, name: String, sendVideo video: Bool) throws
    func leaveConference()
    func mute(_ mute: Bool) throws
    func sendVideo(_ send: Bool, completion: @escaping (Error?) -> Void)
    func switchCamera()
    func manuallyDisconnect(_ completion: (() -> Void)?)
    func cancelReconnect()
    
    var endpointObserver: EndpointObserver? { get set }
    var videoStreamObserver: VideoStreamObserver? { get set }
    var connectionObserver: ConnectionObserver? { get set }
    var socketObserver: SocketObserver? { get set }
}

protocol EndpointObserver: AnyObject {
    func endpointAdded(endpoint: EndpointID, name: String?, place: Int)
    func endpointRemoved(endpoint: EndpointID)
    func endpointMuteChanged(to mute: Bool, endpoint: EndpointID)
    func endpointSendingVideoChanged(to sendingVideo: Bool, endpoint: EndpointID)
    func endpointSharingScreenChanged(to sharingScreen: Bool, endpoint: EndpointID)
    func endpointNameChanged(to name: String?, endpoint: EndpointID)
    func endpointPlaceChanged(to place: Int, endpoint: EndpointID)
    func ownerChanged(to owner: EndpointID)
}

protocol VideoStreamObserver: AnyObject {
    func didAddVideoStream(for participant: EndpointID, renderOn: (VIVideoRendererView?) -> Void)
    func didRemoveVideoStream(for participant: EndpointID)
}

protocol ConnectionObserver: AnyObject {
    func didConnect()
    func didFail(with error: Error)
    func didDisconnect()
    func hasBeenKicked()
    func didBeginReconnecting()
}

protocol SocketObserver: AnyObject {
    func socketConnectedStateChanged(to connected: Bool)
}
