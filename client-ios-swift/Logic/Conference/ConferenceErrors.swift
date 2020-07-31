/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
 */

enum ConferenceError: Error {
    case unableToCreateConference
    case unsupportedName
    case failedToBuildURL
    case noDataReceived
    case jsonDecodingFailed
    case noActiveConferenceFound
    case permissionError
    
    var localizedDescription: String {
        switch self {
        case .unableToCreateConference:
            return "Unable to create conference"
        case .unsupportedName:
            return "Given name is not supported by the system"
        case .failedToBuildURL:
            return "Could not start the conference. Please try again"
        case .noDataReceived:
            return "Could not start the conference. Please try again"
        case .jsonDecodingFailed:
            return "Could not start the conference. Please try again"
        case .noActiveConferenceFound:
            return "Active conference does not exist"
        case .permissionError:
            return "This action is disallowed by the owner"
        }
    }
}
