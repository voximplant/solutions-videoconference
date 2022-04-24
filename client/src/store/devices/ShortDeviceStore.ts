import { DevicesStore } from '@/store/devicesInfo';

export type ShortDeviceStore = Pick<
  DevicesStore,
  'videoDevices' | 'audioDevices' | 'speakerDevices' | 'videoQuality'
  >;