/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import VoxImplantSDK

typealias ParticipantID = String

protocol ManageConference {
    func sendVideo(_ send: Bool, completion: @escaping (Error?) -> Void)
    func mute(_ mute: Bool) throws
    func switchCamera()
    
    var participants: [ConferenceParticipant] { get }
    var observer: ConferenceObserver? { get set }
    var videoStreamObserver: VideoStreamObserver? { get set }
}

protocol ConferenceObserver: AnyObject {
    func didChangeState(to state: ConferenceState)
    func didAddParticipant(_ participant: ConferenceParticipant)
    func didRemoveParticioant(withID id: ParticipantID)
    func didUpdateParticipant(_ participant: ConferenceParticipant)
    func socketConnected(_ connected: Bool)
}

protocol VideoStreamObserver: AnyObject {
    func didAddVideoStream(for participant: ParticipantID, renderOn: (VIVideoRendererView?) -> Void)
    func didRemoveVideoStream(for participant: ParticipantID)
}

enum ConferenceState {
    case connected
    case reconnecting
    case ended (reason: ConferenceDisconnectReason)
}

enum ConferenceDisconnectReason {
    case disconnected
    case failed (error: Error)
    case kicked
}
