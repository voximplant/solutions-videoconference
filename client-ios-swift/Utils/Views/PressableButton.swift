/*
 *  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
 */

import UIKit

class PressableButton: UIButton {
    override init(frame: CGRect) {
        super.init(frame: frame)
        sharedInit()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        sharedInit()
    }
    
    private func sharedInit() {
        addTarget(self, action: #selector(backToNormalSize(_:)), for: [
            .touchUpInside,
            .touchDragOutside,
            .touchCancel,
            .touchUpOutside]
        )
        addTarget(self, action: #selector(decreaseButtonSize(_:)), for: [
            .touchDown,
            .touchDragInside]
        )
    }
    
    @objc private func decreaseButtonSize(_ sender: UIButton) {
        UIView.animate(withDuration: 0.1) {
            sender.transform = CGAffineTransform(scaleX: 0.97, y: 0.97)
        }
    }
    
    @objc private func backToNormalSize(_ sender: UIButton) {
        UIView.animate(withDuration: 0.1) {
            sender.transform = CGAffineTransform.identity
        }
    }
}
