import { MediaDeviceInfo } from './MediaDeviceInfo';

export interface VideoDeviceInfo extends MediaDeviceInfo {
  capabilities?: {
    aspectRatio?: { max: number; min: number };
    facingMode?: [string];
    frameRate?: { max: number; min: number };
    height?: { max: number; min: number };
    resizeMode?: ('none' | 'crop-and-scale')[];
    width?: { max: number; min: number };
  };
}
