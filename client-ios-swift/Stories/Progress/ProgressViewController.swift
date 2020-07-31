/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

final class ProgressViewController: UIViewController {
    @IBOutlet private var progressView: ProgressView!
    
    var cancelCompletion: (() -> Void)? // DI
    var reconnecting: Reconnecting! // DI
    var state: ProgressState! // DI
    
    enum ProgressState {
        case joining
        case reconnecting
        
        var title: String {
            switch self {
            case .joining:
                return "Cloud connection"
            case .reconnecting:
                return "Cloud connection"
            }
        }
        var description: String {
            switch self {
            case .joining:
                return "Joining the conference, please wait..."
            case .reconnecting:
                return "Connection problem, reconnecting you to the conference, please wait..."
            }
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        progressView.configure(
            with: ProgressViewModel(
                title: state.title,
                description: state.description,
                cancelHandler: { [weak self] in
                    self?.reconnecting.cancelReconnect()
                    self?.dismiss(animated: true, completion: self?.cancelCompletion)
            })
        )
    }
}
