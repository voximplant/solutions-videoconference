/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

final class LoginTextField: UITextField {
    private let padding = UIEdgeInsets(top: 0, left: 8, bottom: 0, right: 8)

    override public func textRect(forBounds bounds: CGRect) -> CGRect {
        bounds.inset(by: padding)
    }

    override public func placeholderRect(forBounds bounds: CGRect) -> CGRect {
        bounds.inset(by: padding)
    }

    override public func editingRect(forBounds bounds: CGRect) -> CGRect {
        bounds.inset(by: padding)
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        sharedInit()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        sharedInit()
    }
    
    private func sharedInit() {
        layer.borderWidth = 1
        layer.borderColor = #colorLiteral(red: 0.8470588235, green: 0.862745098, blue: 0.9019607843, alpha: 1).cgColor
        layer.cornerRadius = 4
        borderStyle = .none
    }
}
