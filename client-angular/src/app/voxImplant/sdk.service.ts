import { Injectable } from '@angular/core';
import * as VoxImplant from 'voximplant-websdk';
import { environment } from '@env/environment';
import { IAppCredentials } from './interfaces/IAppCredentials';
import { DataBusMessageType, DataBusService, ErrorId, Route } from './data-bus.service';
import { IIDClass } from './interfaces/IIDClass';
import { createLogger } from '@core/logger.service';
import { CallManagerService } from './call-manager.service';
import { CurrentUserService } from './current-user.service';
import { LogRecord } from 'voximplant-websdk/Structures';
import { LogLevel } from 'voximplant-websdk';
import { ChatManagerService } from './chat-manager.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Injectable()
export class SDKService implements IIDClass {
  readonly ID = 'SDKService';
  private isReconnecting: boolean;
  private reconnectedTimes: number = 0;
  private sdk: any;
  private logger = createLogger(this.ID);
  constructor(
    private dataBusService: DataBusService,
    private callManagerService: CallManagerService,
    private chatManagerService: ChatManagerService,
    private currentUserService: CurrentUserService
  ) {
    this.isReconnecting = false;
    this.sdk = VoxImplant.getInstance();
    this.sdk.on(VoxImplant.Events.ConnectionClosed, () => {
      this.logger.error('[WebSDk] Connection was closed');
      this.reconnect();
    });
  }

  isReconnectedAllowed(): boolean {
    return environment.reconnectTimes < 0 || environment.reconnectTimes < this.reconnectedTimes;
  }

  get credentials(): IAppCredentials {
    return environment.appConfig.credentials;
  }

  init() {
    return new Promise((resolve, reject) => {
      if (this.sdk.getClientState() === 'DISCONNECTED') {
        this.sdk
          .init({
            // showDebugInfo: true,
            localVideoContainerId: 'localVideoNode',
            remoteVideoContainerId: 'hiddenRemote',
            queueType: VoxImplant.QueueTypes.SmartQueue,
          })
          .then((_: any) => {
            this.logger.warn('[WebSDk] Init completed');
            this.sdk.setLoggerCallback((record: LogRecord) => {
              const { formattedText, category, label, level } = record;
              switch (level) {
                case LogLevel.WARNING:
                  this.logger.warn(VoxImplant.LogCategory[category], label, formattedText);
                  break;
                case LogLevel.ERROR:
                  this.logger.error(VoxImplant.LogCategory[category], label, formattedText);
                  break;
                default:
                  this.logger.log(VoxImplant.LogCategory[category], label, formattedText);
                  break;
              }
            });

            resolve(_);
          })
          .catch(reject);
      } else {
        resolve();
      }
    });
  }

  connectToVoxCloud(isReconnect = false) {
    this.sdk
      .connect(false)
      .then(() => {
        this.logger.warn('[WebSDk] Connection was established successfully');
        this.signIn(isReconnect).then(() => {
          if (isReconnect) this.rejoinConf();
        });

        this.dataBusService.sendError({
          id: ErrorId.NoError,
        });
      })
      .catch(() => {
        this.logger.error('[WebSDk] Connection failed');
        this.reconnect();
      });
  }

  signIn(isReconnect: boolean) {
    return new Promise((resolve, reject) => {
      const login = `${this.credentials.userName}@${this.credentials.appName}.${this.credentials.accountName}.voximplant.com`;
      this.sdk
        .login(login, this.credentials.password)
        .then(() => {
          this.logger.warn('[WebSDk] Auth completed');
          if (!isReconnect) {
            this.dataBusService.send({
              type: DataBusMessageType.SignIn,
              route: [Route.Inner],
              sign: this.ID,
              data: {},
            });
          }
          resolve();
        })
        .catch((e: any) => {
          const errorDescription = marker('Wrong login or password');
          this.dataBusService.sendError({
            id: ErrorId.SDKError,
            description: errorDescription,
            data: e,
          });
          this.logger.warn(errorDescription);
          reject(e);
        });
    });
  }

  rejoinConf() {
    this.isReconnecting = false;
    this.callManagerService.init(this.currentUserService.getCallSettings(), this.sdk);
    this.chatManagerService.setConnectionId(this.currentUserService.uuid);
    this.chatManagerService.setDisplayName(this.currentUserService.name);
  }

  joinConf() {
    this.callManagerService.init(this.currentUserService.getCallSettings(), this.sdk);

    this.chatManagerService.setConnectionId(this.currentUserService.uuid);
    this.chatManagerService.setDisplayName(this.currentUserService.name);

    this.logger.info(` Call create from serviceID: conf_${this.currentUserService.serviceId}`);
  }

  reconnect() {
    if (!this.isReconnecting && this.isReconnectedAllowed()) {
      this.reconnectedTimes++;

      const errorDescription = marker('Connection problem');

      this.dataBusService.sendError({
        id: ErrorId.ConnectionProblem,
        description: errorDescription,
        data: {
          reconnection: true,
        },
      });
      this.logger.warn(errorDescription);

      this.callManagerService.destroyCurrentConf();
      this.sdk.showLocalVideo(false);
      if (VoxImplant.getInstance().getClientState() === VoxImplant.ClientState.LOGGING_IN) {
        this.rejoinConf();
      } else {
        this.connectToVoxCloud(true);
      }
    } else {
      console.warn('[WebSDk] We are waiting while another reconnect will be finished');
    }
  }

  login() {
    this.init().then(() => {
      this.connectToVoxCloud();
    });
  }

  onLeaveRoom() {
    VoxImplant.getInstance().showLocalVideo(false);
  }
}
