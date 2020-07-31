/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

final class LeaveConferenceUseCase: LeaveConference {
    private let conferenceService: ConferenceService
    
    init(_ conferenceService: ConferenceService) {
        self.conferenceService = conferenceService
    }
    
    func callAsFunction() {
        conferenceService.leaveConference()
        conferenceService.manuallyDisconnect(nil)
    }
}
