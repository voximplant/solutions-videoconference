/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import VoxImplantSDK

protocol SpeakerAutoselecting: AudioDeviceSelecting { }

extension SpeakerAutoselecting {
    func selectSpeaker(
        from audioDevices: Set<VIAudioDevice> = VIAudioManager.shared().availableAudioDevices()
    ) {
        if headphonesNotConnected {
            selectIfAvailable(.speaker, from: audioDevices)
        }
    }
    
    private var headphonesNotConnected: Bool {
        !VIAudioManager.shared().availableAudioDevices().contains {
            $0.type == .wired || $0.type == .bluetooth
        }
    }
}
