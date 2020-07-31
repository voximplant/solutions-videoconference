/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import VoxImplantSDK

typealias EndpointID = String
typealias EndpointAdded = (EndpointID, String?, Int) -> Void
typealias EndpointUpdated<T> = (EndpointID, T) -> Void
typealias EndpointRemoved = (EndpointID) -> Void
typealias VideoStreamAdded = (String, (VIVideoRendererView?) -> Void) -> Void
typealias VideoStreamRemoved = (String) -> Void

protocol ConferenceService: AnyObject {
    var conferenceID: String? { get }
    
    func joinConference(withID id: String, name: String, sendVideo video: Bool) throws
    func leaveConference()
    func mute(_ mute: Bool) throws
    func sendVideo(_ send: Bool, completion: @escaping (Error?) -> Void)
    func switchCamera()
    func manuallyDisconnect(_ completion: (() -> Void)?)
    func cancelReconnect()
    
    // Endpoint change handlers
    var endpointAddedHandler: EndpointAdded? { get set }
    var endpointMuteUpdated: EndpointUpdated<Bool>? { get set }
    var endpointSendingVideoUpdated: EndpointUpdated<Bool>? { get set }
    var endpointSharingScreenUpdated: EndpointUpdated<Bool>? { get set }
    var endpointNameUpdated: EndpointUpdated<String?>? { get set }
    var endpointPlaceUpdated: EndpointUpdated<Int>? { get set }
    var endpointRemovedHandler: EndpointRemoved? { get set }
    var ownerUpdated: ((EndpointID) -> Void)? { get set }
    // Video stream handlers
    var localVideoStreamAddedHandler: VideoStreamAdded? { get set }
    var localVideoStreamRemovedHandler: VideoStreamRemoved? { get set }
    var remoteVideoStreamAddedHandler: VideoStreamAdded? { get set }
    var remoteVideoStreamRemovedHandler: VideoStreamRemoved? { get set }
    // Connection handlers
    var didConnect: (() -> Void)? { get set }
    var didFail: ((Error) -> Void)? { get set }
    var didDisconnect: (() -> Void)? { get set }
    var hasBeenKicked: (() -> Void)? { get set }
    var didBeginReconnecting: (() -> Void)? { get set }
    
    //internal
    var socketConnected: ((Bool) -> Void)? { get set }
}
