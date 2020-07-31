/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

enum CallOptionButtonModels {
    static let mute = CallOptionButton.Model(
        image: UIImage(named: "micOn"),
        imageSelected: UIImage(named: "micOff"),
        text: "Mic"
    )
    static let chooseAudio = CallOptionButton.Model(
        image: UIImage(named: "audioDevice"),
        text: "Audio"
    )
    static let switchCamera = CallOptionButton.Model(
        image: UIImage(named: "switchCam"),
        text: "Switch"
    )
    static let video = CallOptionButton.Model(
        image: UIImage(named: "videoOn"),
        imageSelected: UIImage(named: "videoOff"),
        text: "Cam"
    )
    static let share = CallOptionButton.Model(
        image: UIImage(named: "share"),
        text: "Share"
    )
    static let exit = CallOptionButton.Model(
        image: UIImage(named: "exit"),
        imageTint: #colorLiteral(red: 1, green: 0.02352941176, blue: 0.2549019608, alpha: 1),
        text: "Leave"
    )
}
