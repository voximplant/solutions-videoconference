/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

struct ConferenceParticipant {
    let id: String
    var name: String?
    var place: Int
    var isOwner: Bool = false
    var isMuted: Bool = false
    var isSharingScreen: Bool = false
    var isSendingVideo: Bool = true
}
