/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import VoxImplantSDK

protocol AudioDeviceSelecting { }

extension AudioDeviceSelecting {
    func selectIfAvailable(
        _ audioDeviceType: VIAudioDeviceType,
        from audioDevices: Set<VIAudioDevice> = VIAudioManager.shared().availableAudioDevices()
    ) {
        if let device = audioDevices.first(where: { $0.type == audioDeviceType }) {
            VIAudioManager.shared().select(device)
        }
    }
}
