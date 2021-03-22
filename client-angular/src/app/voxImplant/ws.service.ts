import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '@env/environment';
import { DataBusMessageType, DataBusService, IMuteMessage, INotifyStatusMessage, Route } from './data-bus.service';
import { IIDClass } from './interfaces/IIDClass';
import { createLogger } from '@core';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface IWSMessage {
  value: any;
  endpointId: any;
}

interface IWSOutputMessage {
  cmd: string;
  content: boolean;
}

/**
 * adapted from videoconf_ws_srv
 */
@Injectable()
export class WSService implements OnDestroy, IIDClass {
  readonly ID: string = 'WSService';

  private logger = createLogger(this.ID);
  private _gracefulShutdown: boolean = false;
  private _eventListeners = new Map();
  private _connectionString: string;
  private _userId: string;
  private _sessionId: string;
  private muteState: boolean;
  private sharingState: boolean;
  private videoState: boolean;

  private ws: WebSocket;
  private subscribeToTypes = [
    DataBusMessageType.MicToggled,
    DataBusMessageType.CameraToggled,
    DataBusMessageType.ShareScreenStarted,
    DataBusMessageType.ShareScreenStopped,
    DataBusMessageType.NotifyStatuses,
  ];
  private subscriptions: Subscription = new Subscription();
  constructor(private dataBusService: DataBusService) {
    this._connectionString = environment.appConfig.webSocketConnectionString;

    this.subscriptions.add(
      this.dataBusService.inner$
        .pipe(filter((message) => this.subscribeToTypes.includes(message.type)))
        .subscribe((message) => {
          switch (message.type) {
            case DataBusMessageType.MicToggled:
              this.notifyMute(!message.data.microphoneEnabled);
              break;

            case DataBusMessageType.CameraToggled:
              this.notifyVideo(message.data.cameraEnabled);
              break;

            case DataBusMessageType.ShareScreenStarted:
              this.notifySharing(true);
              break;

            case DataBusMessageType.ShareScreenStopped:
              this.notifySharing(false);
              break;

            case DataBusMessageType.NotifyStatuses:
              if ((message as INotifyStatusMessage).data.cameraEnabled !== undefined) {
                this.notifyMute(!message.data.cameraEnabled);
              }
              if ((message as INotifyStatusMessage).data.microphoneEnabled !== undefined) {
                this.notifyMute(!message.data.microphoneEnabled);
              }
              break;
          }
        })
    );
  }

  _connectAndLogin() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this._connectionString);
      this.ws.addEventListener('open', () => {
        this.logger.info('loggined');
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              cmd: 'hello',
              content: {
                userId: this._userId,
                sessionId: this._sessionId,
                mute: this.muteState,
                sharing: this.sharingState,
                video: this.videoState,
              },
            })
          );
          resolve();
        } else {
          this.ws.close();
        }
      });
      this.ws.addEventListener('error', () => {
        reject();
      });
      this.ws.addEventListener('close', () => {
        if (!this._gracefulShutdown) this._connectAndLogin();
        else this._gracefulShutdown = false;
      });
      this.ws.addEventListener('message', (event) => {
        this._processIncommingMessage(event.data);
      });
    });
  }

  _processIncommingMessage(data: any) {
    try {
      const message = JSON.parse(data);
      this.logger.info('incoming message:', data);
      const messageData = <IWSMessage>{
        value: message.content,
        endpointId: message.from,
      };
      switch (message.cmd) {
        case 'vad':
          this._dispatch('vad', messageData);
          break;

        case 'mute':
          this._dispatch('mute', messageData);
          this.dataBusService.send(<IMuteMessage>{
            data: messageData,
            route: [Route.Inward],
            sign: this.ID,
            type: DataBusMessageType.Mute,
          });
          break;

        case 'video':
          this._dispatch('video', messageData);
          break;
        case 'sharing':
          this._dispatch('sharing', messageData);
          break;
      }
    } catch (e) {}
  }

  _dispatch(event: string, message: IWSMessage) {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener: (message: IWSMessage) => void) => {
        listener(message);
      });
    }
  }

  _sendRawMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  async login(sessionId: string, userId: string, mute: boolean, sharing: boolean, video: boolean) {
    this._sessionId = sessionId;
    this._userId = userId;
    this.muteState = mute;
    this.sharingState = sharing;
    this.videoState = video;
    return this._connectAndLogin();
  }

  notifyVAD(isVAD: any) {
    const message = {
      cmd: 'vad',
      content: isVAD,
    };
    this._sendRawMessage(message);
  }

  notifyMute(isMute: boolean) {
    const message = {
      cmd: 'mute',
      content: isMute,
    };
    this.muteState = isMute;
    this._sendRawMessage(message);
  }

  notifySharing(isSharing: boolean) {
    const message = {
      cmd: 'sharing',
      content: isSharing,
    };
    this.sharingState = isSharing;
    this._sendRawMessage(message);
  }

  notifyVideo(isVideo: boolean) {
    const message: IWSOutputMessage = {
      cmd: 'video',
      content: isVideo,
    };
    this.videoState = isVideo;
    this._sendRawMessage(message);
  }

  addEventListener(event: string, listener: any) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Set());
    }
    const listenerSet = this._eventListeners.get(event);
    listenerSet.add(listener);
  }

  removeEventListener(event: string, listener: any) {
    if (this._eventListeners.has(event)) {
      const listenerSet = this._eventListeners.get(event);
      if (listener) {
        listenerSet.delete(listener);
      } else {
        listenerSet.clear();
      }
    }
  }

  close() {
    this._gracefulShutdown = true;
    this.ws.close();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.close();
  }
}
