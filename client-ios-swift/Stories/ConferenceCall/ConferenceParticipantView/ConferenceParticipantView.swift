/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

final class ConferenceParticipantView: UIView, NibLoadable {
    @IBOutlet private weak var labelContainer: UIView!
    @IBOutlet private weak var nameLabel: UILabel!
    @IBOutlet private weak var backgroundImage: UIImageView!
    @IBOutlet weak var micOffView: UIView!
    @IBOutlet weak var streamView: UIView!

    var videoEnabled: Bool = false {
        didSet {
            streamView.isHidden = !videoEnabled
        }
    }
    
    var audioEnabled: Bool = true {
        didSet {
            micOffView.isHidden = audioEnabled
        }
    }

    var name: String? {
        get { nameLabel.text }
        set {
            labelContainer.isHidden = newValue == nil || newValue == ""
            nameLabel.text = newValue
        }
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
        setupFromNib()
        isUserInteractionEnabled = true
        contentMode = .scaleAspectFit
        streamView.clipsToBounds = true
        micOffView.layer.cornerRadius = 4
        backgroundImage.layer.cornerRadius = 4
        streamView.layer.cornerRadius = 4
        labelContainer.layer.cornerRadius = 4
    }
}
