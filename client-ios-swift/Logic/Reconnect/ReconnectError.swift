/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

enum ReconnectError: Error {
    case conferenceNotFound
    case unableToCreateConference
    case reconnectFailed
    case timeout
    
    var localizedDescription: String {
        switch self {
        case .conferenceNotFound:
            return "Could'nt find the conference to reconnect"
        case .unableToCreateConference:
            return "Unable to create conference"
        case .reconnectFailed:
            return "Unable to reconnect to the conference"
        case .timeout:
            return "Reconnect timeout"
        }
    }
}
