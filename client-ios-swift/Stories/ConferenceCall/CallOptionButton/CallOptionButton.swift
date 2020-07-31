/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

final class CallOptionButton: UIView, NibLoadable {
    @IBOutlet private weak var button: PressableButton!
    @IBOutlet private weak var buttonDescriptionLabel: UILabel!
    
    typealias TouchUpHandler = (CallOptionButton) -> Void
    var touchUpHandler: TouchUpHandler?
    
    enum State: Equatable {
        case initial (model: Model)
        case normal
        case selected
        case unavailable
    }
    var state: State? {
        didSet {
            if state == oldValue { return }
            switch state {
            case .initial(let model):
                self.model = model
                state = .normal
            case .unavailable:
                button.backgroundColor = defaultBackground
                button.isEnabled = false
                button.isSelected = false
            case .normal:
                button.backgroundColor = defaultBackground
                button.isEnabled = true
                button.isSelected = false
            case .selected:
                button.backgroundColor = #colorLiteral(red: 1, green: 0.02352941176, blue: 0.2549019608, alpha: 1)
                button.isEnabled = true
                button.isSelected = true
            case .none:
                break
            }
        }
    }
    
    struct Model: Equatable {
        let image: UIImage?
        let imageSelected: UIImage?
        let imageTint: UIColor?
        let background: UIColor?
        let text: String
        
        init(image: UIImage?, imageSelected: UIImage? = nil, imageTint: UIColor = .white, background: UIColor = #colorLiteral(red: 1, green: 1, blue: 1, alpha: 0.1), text: String) {
            self.image = image
            self.imageSelected = imageSelected ?? image
            self.imageTint = imageTint
            self.background = background
            self.text = text
        }
    }
    private var model: Model? {
        didSet {
            if model == oldValue { return }
            if let model = model {
                button.setImage(model.image, for: .normal)
                button.setImage(model.imageSelected, for: .selected)
                button.tintColor = model.imageTint
                defaultBackground = model.background
                button.backgroundColor = defaultBackground
                buttonDescriptionLabel.text = model.text
            }
        }
    }
    
    private var defaultBackground: UIColor?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        sharedInit()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        sharedInit()
    }
    
    private func sharedInit() {
        setupFromNib()
        button.layer.cornerRadius = 4
    }
    
    func doInitialSetup(with model: Model, and handler: @escaping TouchUpHandler) {
        state = .initial(model: model)
        touchUpHandler = handler
    }
    
    @IBAction private func touchUpInside(_ sender: UIButton) {
        touchUpHandler?(self)
    }
}
