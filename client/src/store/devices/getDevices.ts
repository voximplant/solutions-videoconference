import { getDevices } from '@/store/devices/index';
import { ShortDeviceStore } from '@/store/devices/ShortDeviceStore';
import { AudioDeviceInfo } from '@/store/devices/AudioDeviceInfo';
import { VideoDeviceInfo } from '@/store/devices/VideoDeviceInfo';

getDevices.use(
  async (): Promise<ShortDeviceStore> => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices: AudioDeviceInfo[] = [];
    const speakerDevices: AudioDeviceInfo[] = [];
    const videoDevices: VideoDeviceInfo[] = [];
    const videoQuality: Record<string, string>[] = [
      { label: 'FullHD video', value: '1080' },
      { label: 'HD video', value: '720' },
      { label: '360p', value: '360' },
    ];
    const audioDevicesArray = devices.filter((device) => device.kind === 'audioinput');
    const speakerDevicesArray = devices.filter((device) => device.kind === 'audiooutput');
    const videoDevicesArray = devices.filter((device) => device.kind === 'videoinput');
    audioDevicesArray.forEach((device, idx) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore chrome-specific
      const capabilities = device.getCapabilities ? device.getCapabilities() : null;
      const deviceInfo: AudioDeviceInfo = {
        label: device.label || `Microphone ${idx + 1}`,
        groupId: device.groupId,
        value: device.deviceId,
        kind: device.kind,
      };
      if (capabilities) {
        const {
          autoGainControl,
          echoCancellation,
          latency,
          noiseSuppression,
          channelCount,
          sampleSize,
          sampleRate,
        } = capabilities;
        deviceInfo.capabilities = {
          autoGainControl,
          echoCancellation,
          latency,
          noiseSuppression,
          channelCount,
          sampleSize,
          sampleRate,
        };
      }
      audioDevices.push(deviceInfo);
    });
    speakerDevicesArray.forEach((device, idx) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore chrome-specific
      const capabilities = device.getCapabilities ? device.getCapabilities() : null;
      const deviceInfo: AudioDeviceInfo = {
        label: device.label || `Speaker ${idx + 1}`,
        groupId: device.groupId,
        value: device.deviceId,
        kind: device.kind,
      };
      if (capabilities) {
        const {
          autoGainControl,
          echoCancellation,
          latency,
          noiseSuppression,
          channelCount,
          sampleSize,
          sampleRate,
        } = capabilities;
        deviceInfo.capabilities = {
          autoGainControl,
          echoCancellation,
          latency,
          noiseSuppression,
          channelCount,
          sampleSize,
          sampleRate,
        };
      }
      speakerDevices.push(deviceInfo);
    });
    videoDevicesArray.forEach((device, idx) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore chrome-specific
      const capabilities = device.getCapabilities ? device.getCapabilities() : null;
      const deviceInfo: VideoDeviceInfo = {
        label: device.label || `Camera ${idx + 1}`,
        groupId: device.groupId,
        value: device.deviceId,
      };
      if (capabilities) {
        const { aspectRatio, facingMode, frameRate, resizeMode, height, width } = capabilities;
        deviceInfo.capabilities = {
          aspectRatio,
          facingMode,
          frameRate,
          resizeMode,
          height,
          width,
        };
      }
      videoDevices.push(deviceInfo);
    });
    return {
      audioDevices,
      speakerDevices,
      videoDevices,
      videoQuality,
    };
  }
);

export { getDevices };
