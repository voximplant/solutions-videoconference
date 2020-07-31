/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

final class LoginView:
    UIView,
    UITextFieldDelegate,
    MovingWithKeyboard
{
    @IBOutlet private weak var fieldsContainerView: UIView!
    @IBOutlet private weak var joinWithVideoButton: PressableButton!
    @IBOutlet private weak var joinWithoutVideoButton: PressableButton!
    @IBOutlet private weak var IDField: LoginTextField!
    @IBOutlet private weak var nameField: LoginTextField!
    @IBOutlet private weak var activityIndicator: UIActivityIndicatorView!
    
    // MARK: MovingWithKeyboard
    var adjusted: Bool = false
    var defaultPositionY: CGFloat = 0
    var keyboardWillChangeFrameObserver: NSObjectProtocol?
    var keyboardWillHideObserver: NSObjectProtocol?
    //
    
    var idText: String? {
        get { IDField.text != "" ? IDField.text : nil }
        set { IDField.text = newValue }
    }
    
    var nameText: String? {
        get { nameField.text != "" ? nameField.text : nil }
        set { nameField.text = newValue }
    }
    
    enum LoginViewState {
        case normal
        case loading
    }
    
    var state: LoginViewState = .normal {
        didSet {
            switch state {
            case .normal:
                if (activityIndicator.isAnimating) {
                    activityIndicator.stopAnimating()
                }
                execute {
                    self.activityIndicator.alpha = 0
                    self.fieldsContainerView.alpha = 1
                }
            case .loading:
                activityIndicator.startAnimating()
                execute {
                    self.activityIndicator.alpha = 1
                    self.fieldsContainerView.alpha = 0
                }
            }
        }
    }
    
    override func awakeFromNib() {
        sharedInit()
    }
    
    private func sharedInit() {
        IDField.delegate = self
        nameField.delegate = self
        fieldsContainerView.layer.cornerRadius = 4
        
        joinWithVideoButton.layer.cornerRadius = 4
        joinWithoutVideoButton.layer.cornerRadius = 4
        subscribeOnKeyboardEvents()
    }
    
    func hideKeyboard() {
        if IDField.isFirstResponder {
            IDField.resignFirstResponder()
        } else if nameField.isFirstResponder {
            nameField.resignFirstResponder()
        }
    }
    
    deinit {
        unsubscribeFromKeyboardEvents()
    }
    
    // MARK: - Private -
    private func execute(animation: @escaping () -> Void) {
        DispatchQueue.main.async {
            UIView.animate(withDuration: 0.3, animations: animation, completion: nil)
        }
    }
    
    // MARK: - UITextFieldDelegate -
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        if textField == IDField {
            nameField.becomeFirstResponder()
        } else {
            textField.resignFirstResponder()
        }
        
        return true
    }
}
