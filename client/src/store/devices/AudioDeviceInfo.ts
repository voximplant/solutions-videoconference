import { MediaDeviceInfo } from './MediaDeviceInfo';

export interface AudioDeviceInfo extends MediaDeviceInfo {
  kind: string;
  capabilities?: {
    autoGainControl?: boolean[];
    channelCount?: { max: number; min: number };
    echoCancellation?: boolean[];
    latency?: { max: number; min: number };
    noiseSuppression?: boolean[];
    sampleRate?: { max: number; min: number };
    sampleSize?: { max: number; min: number };
  };
}