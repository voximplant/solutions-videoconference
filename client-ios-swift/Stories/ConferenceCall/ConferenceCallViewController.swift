/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

final class ConferenceCallViewController:
    UIViewController,
    AudioDeviceAlertSelecting,
    ConferenceObserver,
    SocketObserver
{
    @IBOutlet private weak var conferenceView: ConferenceView!
    @IBOutlet private weak var muteButton: CallOptionButton!
    @IBOutlet private weak var chooseAudioButton: CallOptionButton!
    @IBOutlet private weak var switchCameraButton: CallOptionButton!
    @IBOutlet private weak var videoButton: CallOptionButton!
    @IBOutlet private weak var shareButton: CallOptionButton!
    @IBOutlet private weak var exitButton: CallOptionButton!
    
    @IBOutlet weak var socketView: UIView! //internal
    var manageConference: ManageConference! // DI
    var leaveConference: LeaveConference! // DI
    var getShareLink: GetShareLink! // DI
    var storyAssembler: StoryAssembler! // DI
    var video: Bool! // DI
    private var muted = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        muteButton.doInitialSetup(
            with: CallOptionButtonModels.mute,
            and: { [weak self] button in
                guard let self = self else { return }
                do {
                    try self.manageConference.mute(!self.muted)
                    self.muted.toggle()
                    button.state = self.self.muted ? .selected : .normal
                } catch (let error) {
                    AlertHelper.showError(message: error.localizedDescription, on: self)
                }
            }
        )
        
        chooseAudioButton.doInitialSetup(
            with: CallOptionButtonModels.chooseAudio,
            and: { [weak self] button in
                self?.showAudioDevicesActionSheet(sourceView: button)
            }
        )
        
        switchCameraButton.doInitialSetup(
            with: CallOptionButtonModels.switchCamera,
            and: { [weak self] button in
                self?.manageConference.switchCamera()
            }
        )
        
        videoButton.doInitialSetup(
            with: CallOptionButtonModels.video,
            and: { [weak self] button in
                guard let self = self else { return }
                let previousState = button.state
                button.state = .unavailable
                self.manageConference.sendVideo(!self.video) { [weak self] error in
                    guard let self = self else { return }
                    if let error = error {
                        AlertHelper.showError(message: error.localizedDescription, on: self)
                        button.state = previousState
                    } else {
                        self.video.toggle()
                        button.state = self.video ? .normal : .selected
                    }
                }
            }
        )
        
        shareButton.doInitialSetup(
            with: CallOptionButtonModels.share,
            and: { [weak self] button in
                guard let self = self else { return }
                do {
                    let link = try self.getShareLink()
                    let text = "Join my conference"
                    let activityViewController = UIActivityViewController(
                        activityItems: [text, link],
                        applicationActivities: nil
                    )
                    activityViewController.popoverPresentationController?.sourceView = self.shareButton
                    self.present(activityViewController, animated: true, completion: nil)
                } catch (let error) {
                    log("presenting share menu failed due to \(error.localizedDescription)")
                }
            }
        )
        
        exitButton.doInitialSetup(
            with: CallOptionButtonModels.exit,
            and: { [weak self] button in
                button.state = .unavailable
                self?.leaveConference()
            }
        )
        
        socketView.isHidden = true
        socketView.layer.cornerRadius = 10
        
        videoButton.state = video ? .normal : .selected
        
        manageConference.observeVideoStream(conferenceView)
        manageConference.observeConference(self)
        manageConference.observeSocket(self)
    }
    
    // MARK: - ConferenceObserver -
    func didChangeState(to state: ConferenceState) {
        DispatchQueue.main.async {
            switch state {
            case .connected:
                self.navigationController?.popToViewController(self, animated: true)
            case .reconnecting:
                self.navigationController?.pushViewController(
                    self.storyAssembler.assembleProgress(
                        reason: .reconnecting,
                        onCancel: {
                            self.dismiss(animated: true)
                            self.manageConference = nil
                    }),
                    animated: true
                )
            case .ended(let reason):
                if case .disconnected = reason {
                    self.dismiss(animated: true)
                    return
                }
                
                var title: String = ""
                var description = ""
                
                if case .failed(let error as ReconnectError) = reason {
                    title = "Reconnect failed"
                    description = error.localizedDescription
                    self.navigationController?.popToViewController(self, animated: true)
                    
                } else if case .failed(let error) = reason {
                    title = "Disconnected"
                    description = "You've been disconnected due to \((error as? ConferenceError)?.localizedDescription ?? "internal error")"
                    
                } else if case .kicked = reason {
                    title = "You've been kicked"
                    description = "The owner of the conference kicked you"
                }
                
                AlertHelper.showAlert(
                    title: title,
                    message: description,
                    actions: [UIAlertAction(title: "Close", style: .default) { _ in
                        self.dismiss(animated: true)
                        self.manageConference = nil
                        }
                    ],
                    on: self
                )
            }
        }
    }
    
    func didAddParticipant(_ participant: ConferenceParticipant) {
        conferenceView.addParticipant(participant)
    }
    
    func didRemoveParticipant(withID id: ParticipantID) {
        conferenceView.removeParticipant(withID: id)
    }
    
    func didUpdateParticipant(_ participant: ConferenceParticipant) {
        conferenceView.updateParticipant(participant)
    }
    
    // MARK: - SocketObserver - 
    func socketConnectedStateChanged(to connected: Bool) {
        socketView.backgroundColor = connected ? .green : #colorLiteral(red: 0.9610000253, green: 0.2939999998, blue: 0.3689999878, alpha: 1)
    }
}
