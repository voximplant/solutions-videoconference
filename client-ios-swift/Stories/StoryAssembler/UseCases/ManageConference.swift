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
    
    func observeVideoStream(_ observer: VideoStreamObserver)
    func observeConference(_ observer: ConferenceObserver)
    func observeSocket(_ observer: SocketObserver)
}

protocol ConferenceObserver: AnyObject {
    func didChangeState(to state: ConferenceState)
    func didAddParticipant(_ participant: ConferenceParticipant)
    func didRemoveParticipant(withID id: ParticipantID)
    func didUpdateParticipant(_ participant: ConferenceParticipant)
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
