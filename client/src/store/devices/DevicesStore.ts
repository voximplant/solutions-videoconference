import { AudioDeviceInfo } from '@/store/devices/AudioDeviceInfo';
import { VideoDeviceInfo } from '@/store/devices/VideoDeviceInfo';

export interface DevicesStore {
  requestDone: boolean;
  videoDevices?: VideoDeviceInfo[];
  speakerDevices?: AudioDeviceInfo[];
  audioDevices?: AudioDeviceInfo[];
  videoDisabled: boolean;
  selectedVideoDevice?: VideoDeviceInfo;
  selectedSpeakerDevices?: AudioDeviceInfo;
  selectedAudioDevice?: AudioDeviceInfo;
  videoQuality?: Record<string, string>[];
  selectedQuality?: Record<string, string>;
  videoEnabled: boolean;
  audioEnabled: boolean;
}