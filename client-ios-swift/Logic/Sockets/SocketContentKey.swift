/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import Foundation

enum SocketContentKey {
    static let hello = "hello"
    // events
    static let mute = "mute"
    static let sharing = "sharing"
    static let video = "video"
    // commands
    static let changeVideo = "changeVideo"
    static let changeAudio = "changeMute"
    static let changeSharing = "changeSharing"
    static let changeLevel = "changeLevel"
    static let owner = "owner"
}
