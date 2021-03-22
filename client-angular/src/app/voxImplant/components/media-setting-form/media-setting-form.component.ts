import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { CurrentUserService } from '../../current-user.service';
import { IIDClass } from '../../interfaces/IIDClass';
import { createLogger } from '@core';
import { VIManagerService } from '../../vimanager.service';
import * as VoxImplant from 'voximplant-websdk';
import { AudioOutputInfo, AudioSourceInfo, VideoSourceInfo } from 'voximplant-websdk/Structures';
import { FormGroup } from '@angular/forms';
import { DataBusMessageType, DataBusService, Route } from '../../data-bus.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-media-setting-form',
  templateUrl: './media-setting-form.component.html',
  styleUrls: ['./media-setting-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MediaSettingFormComponent implements OnInit, AfterViewInit, IIDClass, OnDestroy {
  readonly ID = 'MediaSettingFormComponent';
  settingForm: FormGroup;
  @ViewChild('videoContainer') videoContainer: ElementRef;
  @ViewChild('micLevelValue') micLevelValue: ElementRef;
  @Input() showAsPopup: boolean = false;

  public cameraItems: { id: number | string; name: string }[] = [];
  public currentCamera = 'Choose';
  public isCameraOpen = false;
  public microphoneItems: { id: number | string; name: string }[] = [];
  public currentMicrophone = 'Choose';
  public isMicrophoneOpen = false;
  public speakerItems: { id: number | string; name: string }[] = [];
  public currentSpeaker = 'Choose';
  public isSpeakerOpen = false;
  subscriptions: Subscription = new Subscription();
  private logger = createLogger(this.ID);
  private localVideoElement: HTMLVideoElement;
  private subscribeToTypes = [DataBusMessageType.MicToggled, DataBusMessageType.CameraToggled];

  constructor(
    private viManagerService: VIManagerService,
    private renderer: Renderer2,
    private currentUserService: CurrentUserService,
    private dataBusService: DataBusService
  ) {}

  get isMicEnabled() {
    return this.currentUserService.microphoneEnabled;
  }

  get isCameraEnabled(): boolean {
    return this.currentUserService.cameraStatus;
  }

  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.togglePopupSetting();
    }
  }

  ngOnInit() {
    this.logger.info('Init');
    this.settingForm = new FormGroup({});
    this.subscriptions.add(
      this.dataBusService.inner$
        .pipe(filter((message) => this.subscribeToTypes.includes(message.type)))
        .subscribe((message) => {
          switch (message.type) {
            case DataBusMessageType.CameraToggled:
              this.onCameraToggled();
              break;
            case DataBusMessageType.MicToggled:
              this.onMicrophoneToggled();
              break;
          }
        })
    );
  }

  async ngAfterViewInit() {
    await this.viManagerService.initAudioMeter(this.micLevelValue.nativeElement);
    if (this.viManagerService.permissions.video) {
      this.localVideoElement = document.createElement('video');
      this.localVideoElement.setAttribute('muted', 'muted');
      this.localVideoElement.setAttribute('playsinline', 'true');
      this.localVideoElement.setAttribute('autoplay', 'true');
      this.renderer.appendChild(this.videoContainer.nativeElement, this.localVideoElement);
      try {
        await this.updateLocalVideoSrc();
      } catch (e) {}
    } else {
      this.currentUserService.cameraStatus = false;
    }
    this.getSettings();
  }

  onCameraSettingButton(_$event: MouseEvent) {
    if (this.cameraItems.length > 0) {
      this.isCameraOpen = !this.isCameraOpen;
    }
  }

  public changeCamera(cameraId?: number | string) {
    this.viManagerService
      .changeLocalCam(cameraId)
      .then((e: MediaStream) => {
        this.localVideoElement.srcObject = e;
        this.localVideoElement.play().catch((reason) => {
          this.logger.error('Video play fail. By reason', { reason });
        });
      })
      .catch((_e) => {
        // this strange try to switch to default camera is not working
        //setTimeout(() => this.changeCamera(), 0);
      });
  }

  onMicrophoneSettingButton(_$event: MouseEvent) {
    this.isMicrophoneOpen = !this.isMicrophoneOpen;
  }

  public changeMicrophone(newMic?: number | string) {
    this.viManagerService
      .changeLocalMic(newMic)
      .then((_e) => {
        let name = this.viManagerService.getMicName();
        if (name) {
          this.currentMicrophone = name;
        }
      })
      .catch((_e) => {
        // do nothing?
        //setTimeout(()=>this.changeMicrophone(), 0);
      })
      .finally(() => {
        this.isMicrophoneOpen = false;
      });
  }

  onSpeakerSettingButton(_$event: MouseEvent) {
    if (this.speakerItems.length > 0) {
      this.isSpeakerOpen = !this.isSpeakerOpen;
    }
  }

  public changeSpeakers(newSpeaker: number | string) {
    this.viManagerService.changeLocalSpeakers(newSpeaker);
    const speakerId = this.viManagerService.getSpeakerId();
    this.currentSpeaker = this.speakerItems.find((item) => item.id === speakerId).name;
    this.isSpeakerOpen = false;
  }

  updateUserStatus() {}

  onSubmit(e: Event) {
    e.preventDefault();

    this.viManagerService.stopLocalMedia();
    this.viManagerService.setSettings();
    if (this.showAsPopup) {
      this.togglePopupSetting();
    } else {
      this.dataBusService.send({
        data: {},
        route: [Route.Inner],
        sign: this.ID,
        type: DataBusMessageType.InitCall,
      });
    }

    this.logger.info(`[WebSDk] About create call from serviceID: conf_${this.currentUserService.serviceId}`);
  }

  toggleMicrophone() {
    this.dataBusService.send({
      type: DataBusMessageType.MicToggle,
      data: {},
      route: [Route.Inner],
      sign: this.ID,
    });
    this.onMicrophoneToggled();
  }

  toggleLocalVideo() {
    if (this.viManagerService.permissions.video === false) {
      this.logger.warn('it impossible switch local video when it is not allow');
    } else {
      this.dataBusService.send({
        type: DataBusMessageType.CameraToggle,
        data: {},
        route: [Route.Inner],
        sign: this.ID,
      });
    }
  }

  closePopUp() {
    this.togglePopupSetting();
  }

  ngOnDestroy() {
    this.logger.info('Destroyed');
    this.subscriptions.unsubscribe();
  }

  private togglePopupSetting() {
    this.dataBusService.send({
      type: DataBusMessageType.ToggleShowSetting,
      data: {},
      route: [Route.Inner],
      sign: this.ID,
    });
  }

  private onMicrophoneToggled() {
    this.viManagerService.enableLocalMic(this.currentUserService.microphoneEnabled);
  }

  private onCameraToggled() {
    (this.viManagerService.enableLocalCam(this.currentUserService.cameraStatus) as Promise<any>)
      .then((_e: any) => {
        this.updateLocalVideoSrc().catch((reason) => {
          this.logger.warn("Can't update local video Source. reason", { reason });
        });
      })
      .catch(() => {
        this.logger.warn("Can't change the camera state");
      });
  }

  private async updateLocalVideoSrc() {
    await this.viManagerService.isLocalStream();
    this.localVideoElement.srcObject = new MediaStream(this.viManagerService.localStream.getVideoTracks());
    if (this.viManagerService.permissions.video !== false && this.currentUserService.cameraStatus) {
      this.localVideoElement.play().catch(this.logger.error);
    }
  }

  private getSettings() {
    this.getCameraSettings();
    this.getMicrophoneSettings();
    this.getSpeakersSettings();
    this.updateUserStatus();
  }

  private getCameraSettings() {
    VoxImplant.Hardware.CameraManager.get()
      .getInputDevices()
      .then((devices: VideoSourceInfo[]) => {
        this.cameraItems = [];
        if (devices.length === 0) {
          this.currentCamera = 'No available microphone';
        } else if (devices.length === 1) {
          this.currentCamera = devices[0].name;
        } else {
          this.currentCamera = this.viManagerService.getMicName().toString();
          devices.forEach((device: VideoSourceInfo) => {
            this.cameraItems.push({ id: device.id, name: device.name });
          });
        }
      });
  }

  private getMicrophoneSettings() {
    VoxImplant.Hardware.AudioDeviceManager.get()
      .getInputDevices()
      .then((devices: AudioSourceInfo[]) => {
        this.microphoneItems = [];
        if (devices.length === 0) {
          this.currentMicrophone = 'No available microphone';
        } else if (devices.length === 1) {
          this.currentMicrophone = devices[0].name;
        } else {
          this.currentMicrophone = this.viManagerService.getMicName().toString();
          devices.forEach((device: AudioSourceInfo) => {
            this.microphoneItems.push({ id: device.id, name: device.name });
          });
        }
      });
  }

  private getSpeakersSettings() {
    VoxImplant.Hardware.AudioDeviceManager.get()
      .getOutputDevices()
      .then((devices: AudioOutputInfo[]) => {
        this.speakerItems = [];
        if (devices.length === 0) {
          this.currentSpeaker = 'No available microphone';
        } else if (devices.length === 1) {
          this.currentSpeaker = devices[0].name;
        } else {
          this.currentSpeaker = this.viManagerService.getMicName().toString();
          devices.forEach((device: AudioOutputInfo) => {
            this.speakerItems.push({ id: device.id, name: device.name });
          });
        }
      });
  }
}
