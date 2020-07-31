/*
 *  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
 */

import UIKit

@IBDesignable
final class ColoredButton: PressableButton {
    override init(frame: CGRect) {
        super.init(frame: frame)
        sharedInit()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        sharedInit()
    }
    
    private func sharedInit() {
        backgroundColor = Color.button
        layer.cornerRadius = Theme.defaultCornerRadius
    }
}
