/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

protocol NibLoadable where Self: UIView {
    static var nibName: String { get }
}

extension NibLoadable {
    static var nibName: String { String(describing: Self.self) }
    static var nib: UINib { UINib(nibName: Self.nibName, bundle: Bundle(for: Self.self)) }

    func setupFromNib() {
        guard let view = Self.nib.instantiate(withOwner: self, options: nil).first as? UIView
            else { fatalError("Error loading \(self) from nib") }
        addSubview(view)
        view.frame = bounds
    }
}
