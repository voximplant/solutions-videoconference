/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

final class ProgressView: UIView {
    @IBOutlet private weak var titleLabel: UILabel!
    @IBOutlet private weak var descriptionLabel: UILabel!
    @IBOutlet private weak var activityIndicator: UIActivityIndicatorView!
    private var cancelHandler: (() -> Void)?
    
    func configure(with model: ProgressViewModel) {
        titleLabel.text = model.title
        descriptionLabel.text = model.description
        cancelHandler = model.cancelHandler
    }
    
    @IBAction private func cancelTouchUp(_ sender: ColoredButton) {
        cancelHandler?()
    }
}
