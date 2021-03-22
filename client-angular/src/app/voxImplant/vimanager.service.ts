import { Injectable } from '@angular/core';
import { IIDClass } from './interfaces/IIDClass';
import { createLogger } from '@core';
import * as VoxImplant from 'voximplant-websdk';
import { Call } from 'voximplant-websdk/Call/Call';

export interface IMediaPermission {
  video: boolean;
  audio: boolean;
}

@Injectable()
export class VIManagerService implements IIDClass {
  readonly ID = 'VIManagerService';
  public localStream: MediaStream = null;
  permissions: IMediaPermission;
  private logger = createLogger(this.ID);
  private cameraId: number | string = null;
  private micId: number | string = null;
  private speakerId: number | string = null;
  private micNode: MediaStreamAudioSourceNode;
  private audioContext: AudioContext;
  private audioLevelNode: AudioWorkletNode;
  private audioMeterHtmlElement: HTMLElement;
  private audioSource: MediaStreamAudioSourceNode;
  private audioAnalyser?: AnalyserNode;

  checkBrowser = () => {
    return VoxImplant.getInstance().isRTCsupported();
  };

  //this.audioMeterHtmlElement = document.querySelector('.mic__level-value');
  async initAudioMeter(el: HTMLElement) {
    this.audioMeterHtmlElement = el;
    await this.isLocalStream();
    this.prepareAudioNodes(this.localStream);
  }

  isLocalStream(): Promise<any> {
    if (this.localStream) {
      return Promise.resolve();
    }
    return this.getLocalMedia();
  }

  getLocalMedia() {
    this.getStoredCameraAndMic();
    return new Promise<IMediaPermission>((resolve, reject) => {
      const constraints: any = {
        audio: true,
        video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: 25 },
      };
      if (this.micId) {
        constraints.audio = { deviceId: this.micId };
      }
      if (this.cameraId) {
        constraints.video.deviceId = this.cameraId;
      } else {
        constraints.video.facingMode = 'user';
      }
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          this.localStream = stream;

          this.permissions = <IMediaPermission>{ video: true, audio: true };
          resolve(this.permissions);
        })
        .catch(() => {
          constraints.video = false;
          navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
              this.localStream = stream;
              this.permissions = <IMediaPermission>{ video: false, audio: true };
              resolve(this.permissions);
            })
            .catch(reject);
        });
    });
  }

  stopLocalMedia = () => {
    if (this.localStream) {
      this.logger.info('stopLocalMedia');
      this.localStream.getTracks().forEach((tr) => tr.stop());
      this.localStream = null;
    }
    if (this.audioContext) {
      this.logger.info('audioContext');
      this.audioContext.close();
    }
  };

  enableLocalCam = (flag: boolean) => {
    if (flag) {
      return this.refreshCamera();
    } else {
      this.localStream.getVideoTracks().forEach((tr) => tr.stop());
      return Promise.resolve();
    }
  };

  enableLocalMic = (flag: boolean) => {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((tr) => (tr.enabled = flag));
    }
  };

  changeLocalCam(newCameraId?: number | string): Promise<MediaStream> {
    this.cameraId = newCameraId;
    this.localStream.getVideoTracks().forEach((tr) => tr.stop());
    return this.refreshCamera();
  }

  changeLocalMic = (newMicId?: number | string) => {
    this.micId = newMicId;
    return new Promise((resolve, reject) => {
      let constraints = { audio: { deviceId: this.micId }, video: false };
      navigator.mediaDevices
        .getUserMedia(<any>constraints)
        .then((stream) => {
          this.localStream = new MediaStream([...stream.getAudioTracks(), ...this.localStream.getVideoTracks()]);
          try {
            this.micNode.disconnect(this.audioLevelNode);
            this.micNode = this.audioContext.createMediaStreamSource(new MediaStream(stream.getAudioTracks()));
            this.micNode.connect(this.audioLevelNode);
          } catch (e) {}
          resolve(stream);
        })
        .catch(reject);
    });
  };

  getCameraName = () => {
    const tracks = this.localStream.getVideoTracks();
    if (tracks.length > 0) {
      return tracks[0].label;
    }
    return false;
  };

  getMicName = () => {
    const tracks = this.localStream.getAudioTracks();
    if (tracks.length > 0) {
      return tracks[0].label;
    }
    return false;
  };

  changeLocalSpeakers(newSpeakerId: number | string) {
    this.speakerId = newSpeakerId;
  }

  getSpeakerId() {
    return this.speakerId;
  }

  setSettings = () => {
    this.setStoredCameraAndMic();
    const { videoSettings, audioSettings } = this.generateConstraints();
    VoxImplant.Hardware.CameraManager.get()
      .setDefaultVideoSettings(videoSettings)
      .catch((reason) => {
        this.logger.error('setDefaultVideoSettings fail:', { reason });
      });
    VoxImplant.Hardware.AudioDeviceManager.get().setDefaultAudioSettings(audioSettings);
  };

  setCallSettings = (call: Call) => {
    this.setStoredCameraAndMic();
    const { videoSettings, audioSettings } = this.generateConstraints();
    VoxImplant.Hardware.CameraManager.get()
      .setCallVideoSettings(call, videoSettings)
      .catch((reason) => {
        this.logger.error('setCallVideoSettings fail:', { reason });
      });
    VoxImplant.Hardware.AudioDeviceManager.get()
      .setCallAudioSettings(call, audioSettings)
      .catch((reason) => {
        this.logger.error('setCallAudioSettings fail:', { reason });
      });
  };

  detectAudioWorklet = () => {
    if (window['OfflineAudioContext']) {
      let context = new window['OfflineAudioContext'](1, 1, 44100);
      return context.audioWorklet && typeof context.audioWorklet.addModule === 'function';
    }
    return false;
  };

  prepareAudioNodes = async (stream: MediaStream) => {
    if (this.detectAudioWorklet()) {
      this.audioContext = new AudioContext();

      await this.audioContext.audioWorklet.addModule(
        '/assets/audio-level-processor.js'
        //environment.appConfig.baseUrl + 'js/audio_worklets/audio-level-processor.js'
      );

      this.audioLevelNode = new AudioWorkletNode(this.audioContext, 'audio-level-processor');
      this.audioLevelNode.port.onmessage = (event: any) => {
        if (this.audioMeterHtmlElement) {
          this.audioMeterHtmlElement.style.width = Math.ceil(event.data.level * 100) + '%';
        }
      };
      this.micNode = this.audioContext.createMediaStreamSource(new MediaStream(stream.getAudioTracks()));
      this.micNode.connect(this.audioLevelNode);
      this.audioLevelNode.connect(this.audioContext.destination);
    }
  };

  private createAudioContext(stream: MediaStream): AudioContext | undefined {
    const audioContext = new ((<any>window).AudioContext || (<any>window).webkitAudioContext)() as AudioContext;
    this.audioSource = audioContext.createMediaStreamSource(stream);
    this.audioAnalyser = audioContext.createAnalyser();
    this.audioSource.connect(this.audioAnalyser);
    this.audioSource.connect(audioContext.destination);
    return audioContext;
  }

  private refreshCamera(): Promise<MediaStream> {
    return new Promise<MediaStream>((resolve, reject) => {
      let constraints: any = {
        audio: false,
        video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: 25 },
      };
      if (this.cameraId) {
        constraints.video.deviceId = { exact: this.cameraId };
      } else {
        constraints.video.facingMode = 'user';
      }
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          this.localStream = new MediaStream([...this.localStream.getAudioTracks(), ...stream.getVideoTracks()]);
          resolve(stream);
        })
        .catch(reject);
    });
  }

  private generateConstraints() {
    const videoSettings: any = {
      frameWidth: 640,
      frameHeight: 360,
      frameRate: 25,
    };
    if (this.cameraId) {
      videoSettings.cameraId = this.cameraId;
    } else {
      videoSettings.facingMode = true;
    }
    const audioSettings: any = {
      echoCancellation: true,
      autoGainControl: true,
      noiseSuppression: true,
      advanced: [
        { googEchoCancellation: { exact: true } },
        { googExperimentalEchoCancellation: { exact: true } },
        { autoGainControl: { exact: true } },
        { noiseSuppression: { exact: true } },
        { googHighpassFilter: { exact: true } },
        { googAudioMirroring: { exact: true } },
      ],
    };
    if (this.micId) {
      audioSettings.inputId = this.micId;
    }
    if (this.speakerId) {
      audioSettings.outputId = this.speakerId;
    }
    return { videoSettings, audioSettings };
  }

  private getStoredCameraAndMic() {
    const mediaSettings: any = localStorage.getItem('mediaSettings');
    if (mediaSettings) {
      try {
        const store = JSON.parse(mediaSettings);
        if (store.micId) {
          this.micId = store.micId;
        }
        if (store.cameraId) {
          this.cameraId = store.cameraId;
        }
        if (store.speakerId) {
          this.speakerId = store.speakerId;
        }
      } catch (e) {
        this.logger.warn('getStoredCameraAndMic', { e });
      }
    }
  }

  private setStoredCameraAndMic() {
    const store: any = {};
    if (this.micId) {
      store.micId = this.micId;
    }
    if (this.cameraId) {
      store.cameraId = this.cameraId;
    }
    if (this.speakerId) {
      store.speakerId = this.speakerId;
    }
    localStorage.setItem('mediaSettings', JSON.stringify(store));
  }
}
