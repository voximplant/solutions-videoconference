/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

final class StoryAssembler {
    private let conferenceService: ConferenceService
    private let authService: AuthService
    private let reconnecting: Reconnecting
    
    init(_ conferenceService: ConferenceService,
         _ authService: AuthService,
         _ reconnecting: Reconnecting
    ) {
        self.conferenceService = conferenceService
        self.authService = authService
        self.reconnecting = reconnecting
    }
    
    var login: LoginViewController {
        let controller = Storyboard.main.instantiateViewController(of: LoginViewController.self)
        controller.joinConference = JoinConferenceUseCase(authService, conferenceService)
        controller.generateRoom = GenerateRoomUseCase()
        controller.storyAssembler = self
        return controller
    }
    
    func assembleConferenceCall(video: Bool) -> ConferenceCallViewController {
        let controller = Storyboard.main.instantiateViewController(
            of: ConferenceCallViewController.self
        )
        controller.leaveConference = LeaveConferenceUseCase(conferenceService)
        controller.manageConference = ManageConferenceUseCase(conferenceService)
        controller.getShareLink = GetShareLinkUseCase(conferenceService)
        controller.storyAssembler = self
        controller.video = video
        return controller
    }
    
    func assembleProgress(
        reason: ProgressViewController.ProgressState,
        onCancel completion: @escaping () -> Void
    ) -> ProgressViewController {
        let controller = Storyboard.main.instantiateViewController(of: ProgressViewController.self)
        controller.state = reason
        controller.cancelCompletion = completion
        controller.reconnecting = reconnecting
        return controller
    }
}
