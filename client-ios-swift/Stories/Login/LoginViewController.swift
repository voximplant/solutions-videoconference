/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

final class LoginViewController: UIViewController, ErrorHandling {
    @IBOutlet private var loginView: LoginView!
    
    var joinConference: JoinConference! // DI
    var generateRoom: GenerateRoom! // DI
    var storyAssembler: StoryAssembler! // DI
    
    @UserDefault<String>("previousName")
    private var previousName: String?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if let name = previousName {
            loginView.nameText = name
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        loginView.idText = generateRoom().description
    }
    
    @IBAction private func joinVideoTouchUp(_ sender: UIButton) {
        loginView.hideKeyboard()
        join(withVideo: true)
    }
    
    @IBAction private func joinAudioTouchUp(_ sender: UIButton) {
        loginView.hideKeyboard()
        join(withVideo: false)
    }
    
    private func join(withVideo video: Bool) {
        guard let id = loginView.idText,
            let name = loginView.nameText
            else {
                AlertHelper.showError(message: "Fields must not be empty", on: self)
                return
        }
        
        loginView.state = .loading
        
        joinConference(withId: id, andName: name, sendVideo: video) { [weak self] error in
            guard let self = self else { return }
            DispatchQueue.main.async {
                self.loginView.state = .normal
                if let error = error {
                    self.handleError(error)
                } else {
                    self.previousName = name
                    self.present(
                        AnimatedTransitionNavigationController(
                            rootViewController: self.storyAssembler.assembleConferenceCall(video: video)),
                        animated: true
                    )
                }
            }
        }
    }
}
