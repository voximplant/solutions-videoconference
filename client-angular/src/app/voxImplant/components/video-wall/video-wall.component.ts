import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  DataBusMessageType,
  DataBusService,
  IEndpointMessage,
  INotifyStatusMessage,
  Route,
} from '../../data-bus.service';
import { filter } from 'rxjs/operators';
import { createLogger } from '@core';
import { fromEvent, Subscription } from 'rxjs';
import { IIDClass } from '../../interfaces/IIDClass';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CurrentUserService } from '../../current-user.service';

import { DOCUMENT, PlatformLocation } from '@angular/common';

type VideoEnpointType = {
  id: string;
  displayName: string;
  place: number;
};
type scaleSelectorResult = { Nx: number; Ny: number; targetW: number; targetH: number };

@Component({
  selector: 'app-video-wall',
  templateUrl: './video-wall.component.html',
  styleUrls: ['./video-wall.component.scss'],
})
export class VideoWallComponent implements OnInit, AfterViewInit, OnDestroy, IIDClass {
  readonly ID = 'VideoWallComponent';
  inviteForm: FormGroup;
  isLoading = true;
  isLocalVideoShow = true;
  videoEndpoints: VideoEnpointType[] = [];
  roomId: string;
  initPromise: Promise<void>;
  initPromiseResolve: () => void;
  @Output() sidePanelEmitter: EventEmitter<boolean> = new EventEmitter();
  readonly dVideo = 360 / 640; // constant video proportions
  @ViewChild('videoSection') videoSection: ElementRef;
  isSharing: boolean = false;
  showPopupInvite: boolean = false;
  private logger = createLogger(this.ID);
  private supportMessageTypes: DataBusMessageType[] = [
    DataBusMessageType.EndpointAdded,
    DataBusMessageType.RemoteMediaAdded,
    DataBusMessageType.RemoteMediaRemoved,
    DataBusMessageType.EndpointRemoved,
    DataBusMessageType.ShareScreenStarted,
    DataBusMessageType.ShareScreenStopped,
    DataBusMessageType.Mute,
  ];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private currentUserService: CurrentUserService,
    private dataBusService: DataBusService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private platformLocation: PlatformLocation
  ) {
    this.subscriptions.add(
      dataBusService.inner$
        .pipe(filter((message) => this.supportMessageTypes.includes(message.type)))
        .subscribe((_message) => {
          switch (_message.type) {
            case DataBusMessageType.EndpointAdded:
              {
                let message: IEndpointMessage = _message as IEndpointMessage;

                let endpoint = message.data.endpoint;

                if (endpoint.isDefault) {
                  this.isLocalVideoShow = true;
                } else {
                  this.videoEndpoints.push({
                    id: endpoint.id,
                    displayName: endpoint.displayName,
                    place: 1 + endpoint.place,
                  });
                  this.logger.info(' video added by endpoint: ', endpoint);
                }

                this.dataBusService.send(<INotifyStatusMessage>{
                  data: {
                    microphoneEnabled: this.currentUserService.microphoneEnabled,
                    cameraEnabled: this.currentUserService.cameraStatus,
                  },
                  route: [Route.Inner],
                  sign: this.ID,
                  type: DataBusMessageType.NotifyStatuses,
                });

                setTimeout(() => {
                  this.setVideoSectionWidth().catch(() => {});
                }, 200);
              }
              break;

            case DataBusMessageType.RemoteMediaAdded:
              {
              }
              break;

            case DataBusMessageType.RemoteMediaRemoved:
              {
              }
              break;

            case DataBusMessageType.EndpointRemoved:
              {
                let message: IEndpointMessage = _message as IEndpointMessage;
                this.logger.info(' video removed by endpoint: ', message);
                const index = this.videoEndpoints.findIndex((item) => item.id === message.data.endpoint.id);
                if (index !== -1) {
                  this.videoEndpoints.splice(index, 1);
                }

                if (message.data.isNeedReCalcView) {
                  setTimeout(() => {
                    this.setVideoSectionWidth();
                  }, 0);
                }
              }
              break;

            case DataBusMessageType.ShareScreenStopped:
              {
                this.isSharing = false;
              }
              break;

            case DataBusMessageType.ShareScreenStarted:
              {
                this.isSharing = true;
              }
              break;
          }
        })
    );

    this.initPromise = new Promise<void>((resolve) => {
      this.logger.info('resolve');
      this.initPromiseResolve = resolve;
    });
  }

  get showInviteForm() {
    return !!!this.videoEndpoints.length;
  }

  get isMicMuted() {
    return !this.currentUserService.microphoneEnabled;
  }

  get isCameraMuted() {
    return !this.currentUserService.cameraStatus;
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.code) {
      case 'Space':
      case 'KeyM':
        this.toggleMic();
        break;
      case 'KeyV':
        if (event.ctrlKey === false) {
          this.toggleCam();
        }
        break;
    }
  }

  onToggleSidePanel() {
    this.sidePanelEmitter.emit();
  }

  ngOnInit(): void {
    let href = this.platformLocation.href;
    this.inviteForm = new FormGroup({
      roomId: new FormControl(href, Validators.required),
    });
    this.subscribeToResizeEvent();
  }

  ngAfterViewInit(): void {
    this.initPromiseResolve();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  subscribeToResizeEvent() {
    this.subscriptions.add(
      fromEvent(window, 'resize')
        .pipe()
        .subscribe((_) => {
          this.setVideoSectionWidth().catch();
        })
    );
  }

  getDVideo(containerW: number, containerH: number) {
    if (containerW >= containerH) {
      return this.dVideo;
    } else {
      return 1 / this.dVideo;
    }
  }
  // TODO move to service
  async setVideoSectionWidth() {
    //const perf1 = window.performance.now();
    await this.initPromiseResolve();
    this.isLoading = false;
    this.logger.info('Calculating layout');

    const videoSection = this.videoSection.nativeElement;
    //non -angular-way
    const calculatingVideo = [...videoSection.querySelectorAll('.conf__video')];
    let videoAmount = this.videoEndpoints.length + (this.isLocalVideoShow ? 1 : 0);
    const allVideo =
      videoAmount === 1 ? [...videoSection.querySelectorAll('.conf__video-section div.conf_vc')] : calculatingVideo;
    const containerW = videoSection.clientWidth - 20;
    const containerH = window.innerHeight - 88;
    const N = videoAmount > 1 ? videoAmount : containerW < 584 ? 1 : 2; // additional container for the invite block if needed

    let { Nx, Ny, targetW, targetH } = this.scaleSelector(N, containerW, containerH);

    allVideo.forEach((el) => {
      el.style.width = targetW + 'px';
      el.style.height = targetH + 'px';
      const video = el.querySelector('video');
      if (video) {
        let objectFit = this.getDVideo(containerW, containerH) !== this.dVideo ? 'cover' : 'contain';
        this.renderer.setStyle(video, 'object-fit', objectFit);
        this.renderer.setStyle(video, 'objectFit', objectFit);
        //video.style.objectFit = objectFit;
      } else {
        setTimeout(() => {
          if (video) {
            video.style.objectFit = this.getDVideo(containerW, containerH) !== this.dVideo ? 'cover' : 'contain';
          }
        }, 100);
      }
    });
    const containerPaddingW = (videoSection.clientWidth - targetW * Nx) / 2;
    const containerPaddingH = (containerH - targetH * Ny) / 2;
    if (containerPaddingW > 0 && containerPaddingH > 0)
      videoSection.style.padding = `${containerPaddingH}px ${containerPaddingW}px`;
    else if (containerPaddingH > 0) videoSection.style.padding = `${containerPaddingH}px 0`;
    else if (containerPaddingW > 0) videoSection.style.padding = `0 ${containerPaddingW}px`;
    else videoSection.style.padding = `0`;
    //const perf2 = window.performance.now();
    //console.log(`Layout calculating took ${perf2 - perf1} ms`);
  }

  toggleCam() {
    this.dataBusService.send({
      type: DataBusMessageType.CameraToggle,
      data: {},
      route: [Route.Inner],
      sign: this.ID,
    });
  }

  toggleMic() {
    this.dataBusService.send({
      type: DataBusMessageType.MicToggle,
      data: {},
      route: [Route.Inner],
      sign: this.ID,
    });
  }

  leaveRoom() {
    this.dataBusService.send({
      type: DataBusMessageType.LeaveRoom,
      data: {},
      route: [Route.Inner],
      sign: this.ID,
    });
  }

  toggleShowSetting() {
    this.dataBusService.send({
      type: DataBusMessageType.ToggleShowSetting,
      data: {},
      route: [Route.Inner],
      sign: this.ID,
    });
  }

  toggleSharing() {
    this.dataBusService.send({
      type: this.isSharing ? DataBusMessageType.StopShareScreen : DataBusMessageType.StartShareScreen,
      data: {},
      route: [Route.Inner],
      sign: this.ID,
    });
  }

  copy(inputElement: any) {
    inputElement.select();
    this.document.execCommand('copy');
    setTimeout(() => {
      inputElement.blur();
    }, 100);
  }

  openInvitePopup() {
    if (!this.showInviteForm) {
      this.showPopupInvite = !this.showPopupInvite;
    }
  }

  private scaleSelector(N: number, containerW: number, containerH: number) {
    if (N === 1) {
      return { Nx: 1, Ny: 1, targetW: containerW, targetH: containerH };
    }
    const scale1 = this.scaleSelectorW(N, containerW, containerH);
    const scale2 = this.scaleSelectorH(N, containerW, containerH);
    let targetScale = scale2;
    if (scale1.targetH * scale1.targetW > scale2.targetH * scale2.targetW) return scale1;
    if (this.isScaleLessMinimum(targetScale, containerW, containerH)) {
      targetScale = this.rescaleSelectorMini(N, containerW, containerH);
    }
    return targetScale;
  }

  private isScaleLessMinimum(scale: scaleSelectorResult, containerW: number, containerH: number) {
    const maxCols = containerW > containerH ? 5 : 3;
    return scale.Nx > maxCols;
  }

  private rescaleSelectorMini(N: number, containerW: number, containerH: number): scaleSelectorResult {
    const Nx = containerW >= containerH ? 5 : 3;
    const targetW = containerW / Nx;
    const targetH = targetW * this.getDVideo(containerW, containerH);
    const Ny = Math.ceil(N / Nx);
    return { Nx, Ny, targetW, targetH };
  }

  private scaleSelectorW(N: number, containerW: number, containerH: number): scaleSelectorResult {
    const sqrCont = containerW * containerH;
    let sqr = {};
    for (let i = 1; i <= N; i++) {
      const possibleTargetW = containerW / i;
      const possibleTargetH = possibleTargetW * this.getDVideo(containerW, containerH);
      sqr[i] = containerW * (possibleTargetH * Math.ceil(N / i));
      if (sqr[i] > sqrCont) sqr[i] = 0;
    }
    let Nx = parseInt(
      Object.entries(sqr).sort((a, b) => {
        if (a[1] > b[1]) return -1;
        if (a[1] < b[1]) return 1;
        return 0;
      })[0][0],
      10
    );
    let Ny = Math.ceil(N / Nx);
    let targetW = containerW / Nx;
    let targetH = targetW * this.getDVideo(containerW, containerH);
    if (targetH <= containerW && targetW <= containerH) {
      return { Nx, Ny, targetW, targetH };
    }
    return { Nx: 0, Ny: 0, targetW: 0, targetH: 0 };
  }

  private scaleSelectorH(N: number, containerW: number, containerH: number): scaleSelectorResult {
    const sqrCont = containerW * containerH;
    let sqr = {};
    for (let i = 1; i <= N; i++) {
      const possibleTargetH = containerH / i;
      const possibleTargetW = possibleTargetH / this.getDVideo(containerW, containerH);
      sqr[i] = containerH * (possibleTargetW * Math.ceil(N / i));
      if (sqr[i] > sqrCont) sqr[i] = 0;
    }
    let indexNy = Object.entries<number>(sqr).sort((a, b) => {
      if (a[1] > b[1]) return -1;
      if (a[1] < b[1]) return 1;
      return 0;
    })[0][0];
    let Ny = parseInt(indexNy, 10);
    let Nx = Math.ceil(N / Ny);
    let targetH = containerH / Ny;
    let targetW = targetH / this.getDVideo(containerW, containerH);
    if (targetH <= containerW && targetW <= containerH) {
      return { Nx, Ny, targetW, targetH };
    }
    return { Nx: 0, Ny: 0, targetW: 0, targetH: 0 };
  }
}
