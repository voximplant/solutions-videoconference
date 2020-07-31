/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import Foundation

final class GetShareLinkUseCase: GetShareLink {
    private let conferenceService: ConferenceService
    
    init(_ conferenceService: ConferenceService) {
        self.conferenceService = conferenceService
    }
    
    func callAsFunction() throws -> URL {
        if let conferenceID = conferenceService.conferenceID {
            if let url = URL(string: "https://videoconf.voximplant.com/\(conferenceID)") {
                return url
            } else {
                throw ConferenceError.failedToBuildURL
            }
        } else {
            throw ConferenceError.noActiveConferenceFound
        }
    }
}
