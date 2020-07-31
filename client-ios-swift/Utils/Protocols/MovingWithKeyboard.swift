/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

protocol MovingWithKeyboard where Self: UIView {
    var adjusted: Bool { get set }
    var defaultPositionY: CGFloat { get set }
    var keyboardWillChangeFrameObserver: NSObjectProtocol? { get set }
    var keyboardWillHideObserver: NSObjectProtocol? { get set }
}

extension MovingWithKeyboard {
    func subscribeOnKeyboardEvents() {
        keyboardWillChangeFrameObserver = NotificationCenter.default.addObserver(
            forName: UIResponder.keyboardWillChangeFrameNotification,
            object: nil,
            queue: OperationQueue.main
        ) { notification in
            guard let keyboardValue = notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue
                else { return }
            let keyboardScreenEndFrame = keyboardValue.cgRectValue
            if !self.adjusted {
                self.defaultPositionY = self.frame.origin.y
                if #available(iOS 11.0, *) {
                    self.frame.origin.y -= (keyboardScreenEndFrame.height - self.safeAreaInsets.bottom) / 2
                } else {
                    self.frame.origin.y -= (keyboardScreenEndFrame.height) / 2
                }
                self.adjusted = true
            }
        }
        
        keyboardWillHideObserver = NotificationCenter.default.addObserver(
            forName: UIResponder.keyboardWillHideNotification,
            object: nil,
            queue: OperationQueue.main
        ) { notification in
            self.frame.origin.y = self.defaultPositionY
            self.adjusted = false
        }
    }
    
    func unsubscribeFromKeyboardEvents() {
        if let changeFrameObserver = keyboardWillChangeFrameObserver {
            NotificationCenter.default.removeObserver(changeFrameObserver)
        }
        if let willHideObserver = keyboardWillHideObserver {
            NotificationCenter.default.removeObserver(willHideObserver)
        }
    }
}
