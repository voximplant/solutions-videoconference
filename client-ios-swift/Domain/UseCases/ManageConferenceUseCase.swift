/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import VoxImplantSDK

final class ManageConferenceUseCase:
    ManageConference,
    EndpointObserver,
    ConnectionObserver
{
    private let conferenceService: ConferenceService
    var participants: [ConferenceParticipant] = []
    
    private weak var videoStreamObserver: VideoStreamObserver?
    private weak var conferenceObserver: ConferenceObserver?
    private weak var socketObserver: SocketObserver?
    
    init(_ conferenceService: ConferenceService) {
        self.conferenceService = conferenceService
        self.conferenceService.endpointObserver = self
        self.conferenceService.connectionObserver = self
    }
    
    func observeVideoStream(_ observer: VideoStreamObserver) {
        conferenceService.videoStreamObserver = observer
    }
    
    func observeConference(_ observer: ConferenceObserver) {
        conferenceObserver = observer
    }
    
    func observeSocket(_ observer: SocketObserver) {
        conferenceService.socketObserver = observer
    }
    
    func sendVideo(_ send: Bool, completion: @escaping (Error?) -> Void) {
        conferenceService.sendVideo(send, completion: completion)
    }
    
    func mute(_ mute: Bool) throws {
        try conferenceService.mute(mute)
    }
    
    func switchCamera() {
        conferenceService.switchCamera()
    }
    
    // MARK: - EndpointObserver -
    func endpointAdded(endpoint: EndpointID, name: String?, place: Int) {
        if self[participantWithID: endpoint] == nil {
            let participant = ConferenceParticipant(id: endpoint, name: name, place: place)
            participants.append(participant)
            conferenceObserver?.didAddParticipant(participant)
        }
    }
    
    func endpointRemoved(endpoint: EndpointID) {
        if let index = self[indexOf: endpoint] {
            participants.remove(at: index)
            conferenceObserver?.didRemoveParticipant(withID: endpoint)
        }
    }
    
    func endpointMuteChanged(to mute: Bool, endpoint: EndpointID) {
        if let index = self[indexOf: endpoint],
            participants[index].isMuted != mute {
            participants[index].isMuted = mute
            conferenceObserver?.didUpdateParticipant(participants[index])
        }
    }
    
    func endpointSendingVideoChanged(to sendingVideo: Bool, endpoint: EndpointID) {
        if let index = self[indexOf: endpoint],
            participants[index].isSendingVideo != sendingVideo {
            participants[index].isSendingVideo = sendingVideo
            conferenceObserver?.didUpdateParticipant(participants[index])
        }
    }
    
    func endpointSharingScreenChanged(to sharingScreen: Bool, endpoint: EndpointID) {
        if let index = self[indexOf: endpoint],
            participants[index].isSharingScreen != sharingScreen {
            participants[index].isSharingScreen = sharingScreen
            conferenceObserver?.didUpdateParticipant(participants[index])
        }
    }
    
    func endpointNameChanged(to name: String?, endpoint: EndpointID) {
        if let index = self[indexOf: endpoint],
            participants[index].name != name {
            participants[index].name = name
            conferenceObserver?.didUpdateParticipant(participants[index])
        }
    }
    
    func endpointPlaceChanged(to place: Int, endpoint: EndpointID) {
        if let index = self[indexOf: endpoint],
            participants[index].place != place {
            participants[index].place = place
            conferenceObserver?.didUpdateParticipant(participants[index])
        }
    }
    
    func ownerChanged(to owner: EndpointID) {
        for participant in participants {
            let shouldBeOwner = participant.id == owner
            if participant.isOwner != shouldBeOwner {
                self[participantWithID: owner]?.isOwner = shouldBeOwner
                conferenceObserver?.didUpdateParticipant(participant)
            }
        }
    }
    
    // MARK: - ConnectionObserver -
    func didConnect() {
        conferenceObserver?.didChangeState(to: .connected)
    }
    
    func didFail(with error: Error) {
        conferenceObserver?.didChangeState(to: .ended(reason: .failed(error: error)))
    }
    
    func didDisconnect() {
        conferenceObserver?.didChangeState(to: .ended(reason: .disconnected))
    }
    
    func hasBeenKicked() {
        conferenceObserver?.didChangeState(to: .ended(reason: .kicked))
    }
    
    func didBeginReconnecting() {
        conferenceObserver?.didChangeState(to: .reconnecting)
    }
    
    // MARK: - Private -
    private subscript(participantWithID id: ParticipantID) -> ConferenceParticipant? {
        get {
            participants.first(where: { $0.id == id })
        }
        set {
            if let index = participants.firstIndex(where: { $0.id == id }),
                let value = newValue {
                participants[index] = value
            }
        }
    }
    
    private subscript (indexOf id: ParticipantID) -> Int? {
        participants.firstIndex(where: { $0.id == id })
    }
}
