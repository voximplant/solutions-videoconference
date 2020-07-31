/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import VoxImplantSDK

final class ManageConferenceUseCase: ManageConference {
    private let conferenceService: ConferenceService
    var participants: [ConferenceParticipant] = []
    
    weak var observer: ConferenceObserver? {
        didSet {
            if let observer = observer {
                conferenceService.endpointAddedHandler = { [weak self] id, name, place in
                    guard let self = self else { return }
                    if self[participantWithID: id] == nil {
                        let participant = ConferenceParticipant(id: id, name: name, place: place)
                        self.participants.append(participant)
                        observer.didAddParticipant(participant)
                    }
                }
                conferenceService.endpointRemovedHandler = { [weak self] id in
                    guard let self = self else { return }
                    if let index = self[indexOf: id] {
                        self.participants.remove(at: index)
                        observer.didRemoveParticioant(withID: id)
                    }
                }
                conferenceService.endpointMuteUpdated = { [weak self] id, isMuted in
                    guard let self = self else { return }
                    if let index = self[indexOf: id],
                        self.participants[index].isMuted != isMuted {
                        self.participants[index].isMuted = isMuted
                        observer.didUpdateParticipant(self.participants[index])
                    }
                }
                conferenceService.endpointNameUpdated = { [weak self] id, name in
                    guard let self = self else { return }
                    if let index = self[indexOf: id],
                        self.participants[index].name != name {
                        self.participants[index].name = name
                        observer.didUpdateParticipant(self.participants[index])
                    }
                }
                conferenceService.endpointPlaceUpdated = { [weak self] id, place in
                    guard let self = self else { return }
                    if let index = self[indexOf: id],
                        self.participants[index].place != place {
                        self.participants[index].place = place
                        observer.didUpdateParticipant(self.participants[index])
                    }
                }
                conferenceService.endpointSendingVideoUpdated = { [weak self] id, isSending in
                    guard let self = self else { return }
                    if let index = self[indexOf: id],
                        self.participants[index].isSendingVideo != isSending {
                        self.participants[index].isSendingVideo = isSending
                        observer.didUpdateParticipant(self.participants[index])
                    }
                }
                conferenceService.endpointSharingScreenUpdated = { [weak self] id, isSharing in
                    guard let self = self else { return }
                    if let index = self[indexOf: id],
                        self.participants[index].isSharingScreen != isSharing {
                        self.participants[index].isSharingScreen = isSharing
                        observer.didUpdateParticipant(self.participants[index])
                    }
                }
                conferenceService.ownerUpdated = { [weak self] id in
                    guard let self = self else { return }
                    for participant in self.participants {
                        let shouldBeOwner = participant.id == id
                        if participant.isOwner != shouldBeOwner {
                            self[participantWithID: id]?.isOwner = shouldBeOwner
                            observer.didUpdateParticipant(participant)  
                        }
                    }
                }
                conferenceService.didConnect = {
                    observer.didChangeState(to: .connected)
                }
                conferenceService.didFail = { error in
                    observer.didChangeState(to: .ended(reason: .failed(error: error)))
                }
                conferenceService.didDisconnect = {
                    observer.didChangeState(to: .ended(reason: .disconnected))
                }
                conferenceService.didBeginReconnecting = {
                    observer.didChangeState(to: .reconnecting)
                }
                conferenceService.hasBeenKicked = {
                    observer.didChangeState(to: .ended(reason: .kicked))
                }
                conferenceService.socketConnected = observer.socketConnected(_:)
            } else {
//                conferenceService.endpointAddedHandler = nil
//                conferenceService.endpointRemovedHandler = nil
//                conferenceService.endpointMuteUpdated = nil
//                conferenceService.endpointNameUpdated = nil
//                conferenceService.endpointPlaceUpdated = nil
//                conferenceService.endpointSendingVideoUpdated = nil
//                conferenceService.endpointSharingScreenUpdated = nil
//                conferenceService.ownerUpdated = nil
//                conferenceService.didConnect = nil
//                conferenceService.didFail = nil
//                conferenceService.didDisconnect = nil
//                conferenceService.didBeginReconnecting = nil
//                conferenceService.hasBeenKicked = nil
//                conferenceService.socketConnected = nil
            }
        }
    }
    
    weak var videoStreamObserver: VideoStreamObserver? {
        didSet {
            if let observer = videoStreamObserver {
                conferenceService.localVideoStreamAddedHandler = { id, renderer in
                    observer.didAddVideoStream(for: id, renderOn: renderer)
                }
                conferenceService.remoteVideoStreamAddedHandler = { id, renderer in
                    observer.didAddVideoStream(for: id, renderOn: renderer)
                }
                conferenceService.localVideoStreamRemovedHandler = { id in
                    observer.didRemoveVideoStream(for: id)
                }
                conferenceService.remoteVideoStreamRemovedHandler = { id in
                    observer.didRemoveVideoStream(for: id)
                }
            } else {
//                conferenceService.localVideoStreamAddedHandler = nil
//                conferenceService.remoteVideoStreamAddedHandler = nil
//                conferenceService.localVideoStreamRemovedHandler = nil
//                conferenceService.remoteVideoStreamRemovedHandler = nil
            }
        }
    }
    
    init(_ conferenceService: ConferenceService) {
        self.conferenceService = conferenceService
    }
    
//    deinit {
//        conferenceService.endpointAddedHandler = nil
//        conferenceService.endpointRemovedHandler = nil
//        conferenceService.endpointMuteUpdated = nil
//        conferenceService.endpointNameUpdated = nil
//        conferenceService.endpointPlaceUpdated = nil
//        conferenceService.endpointSendingVideoUpdated = nil
//        conferenceService.endpointSharingScreenUpdated = nil
//        conferenceService.ownerUpdated = nil
//        conferenceService.didConnect = nil
//        conferenceService.didFail = nil
//        conferenceService.didDisconnect = nil
//        conferenceService.didBeginReconnecting = nil
//        conferenceService.hasBeenKicked = nil
//        conferenceService.socketConnected = nil
//        conferenceService.localVideoStreamAddedHandler = nil
//        conferenceService.remoteVideoStreamAddedHandler = nil
//        conferenceService.localVideoStreamRemovedHandler = nil
//        conferenceService.remoteVideoStreamRemovedHandler = nil
//    }
    
    func sendVideo(_ send: Bool, completion: @escaping (Error?) -> Void) {
        conferenceService.sendVideo(send, completion: completion)
    }
    
    func mute(_ mute: Bool) throws {
        try conferenceService.mute(mute)
    }
    
    func switchCamera() {
        conferenceService.switchCamera()
    }
    
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
