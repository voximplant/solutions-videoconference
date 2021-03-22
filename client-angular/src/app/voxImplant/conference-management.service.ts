import { Injectable, OnDestroy } from '@angular/core';
import {
  DataBusMessageType,
  DataBusService,
  IDataBusMessage,
  INotifyStatusMessage,
  IToggleLocalCameraMessage,
  IToggleLocalMicMessage,
  Route,
} from './data-bus.service';
import { SDKService } from './sdk.service';
import { CurrentUserService } from './current-user.service';
import { VIManagerService } from './vimanager.service';
import { IIDClass } from './interfaces/IIDClass';
import { createLogger } from '@core';
import { CallManagerService } from './call-manager.service';
import { WSService } from './ws.service';
import { Subscription } from 'rxjs';

@Injectable()
export class ConferenceManagementService implements IIDClass, OnDestroy {
  readonly ID = 'ConferenceManagementService';
  private logger = createLogger(this.ID);
  private subscriptions: Subscription = new Subscription();

  constructor(
    private dataBusService: DataBusService,
    private sdkService: SDKService,
    private currentUserService: CurrentUserService,
    private vimanagerService: VIManagerService,
    private callManagerService: CallManagerService,
    private wsService: WSService
  ) {
    this.subscriptions.add(
      this.dataBusService.inner$.pipe().subscribe((message: IDataBusMessage) => {
        switch (message.type) {
          case DataBusMessageType.ReConnect:
            this.sdkService.reconnect();
            break;

          case DataBusMessageType.MicToggle:
            {
              if ((<IToggleLocalMicMessage>message).data?.status) {
                switch ((<IToggleLocalMicMessage>message).data.status) {
                  case 'mute':
                    this.currentUserService.microphoneEnabled = false;
                    break;
                  case 'unmute':
                    this.currentUserService.microphoneEnabled = true;
                    break;
                }
              } else {
                this.currentUserService.microphoneEnabled = !this.currentUserService.microphoneEnabled;
              }
              this.dataBusService.send({
                data: {
                  microphoneEnabled: this.currentUserService.microphoneEnabled,
                },
                route: [Route.Inner],
                sign: this.ID,
                type: DataBusMessageType.MicToggled,
              });
            }
            break;

          case DataBusMessageType.CameraToggle:
            {
              if (this.vimanagerService.permissions.video === false) {
                this.logger.warn('it impossible switch local video when it is not allow');
              } else {
                if ((<IToggleLocalCameraMessage>message).data?.status) {
                  switch ((<IToggleLocalCameraMessage>message).data.status) {
                    case 'hide':
                      this.currentUserService.cameraStatus = false;
                      break;
                    case 'show':
                      this.currentUserService.cameraStatus = true;
                      break;
                  }
                } else {
                  this.currentUserService.cameraStatus = !this.currentUserService.cameraStatus;
                }
              }
            }

            this.dataBusService.send({
              data: {
                cameraEnabled: this.currentUserService.cameraStatus,
              },
              route: [Route.Inner],
              sign: this.ID,
              type: DataBusMessageType.CameraToggled,
            });

            break;

          case DataBusMessageType.InitCall: {
            this.sdkService.joinConf();
            break;
          }

          case DataBusMessageType.CallConnected:
            {
              this.wsService.login(
                message.data.e.headers['X-Conf-Sess'],
                message.data.e.headers['X-Conf-Call'],
                !this.currentUserService.microphoneEnabled,
                false,
                this.currentUserService.cameraStatus
              );
            }
            break;

          case DataBusMessageType.LeaveRoom:
            {
              this.logger.info('Leave Room');
              this.sdkService.onLeaveRoom();
              this.callManagerService.onLeaveRoom();
            }
            break;

          case DataBusMessageType.SendMessageToCall:
            {
              this.callManagerService.sendMessage(message.data);
            }
            break;

          case DataBusMessageType.ShareScreenStopped:
            {
              this.logger.info('Share screen stopped');
              this.dataBusService.send(<INotifyStatusMessage>{
                data: {
                  microphoneEnabled: this.currentUserService.microphoneEnabled,
                  cameraEnabled: this.currentUserService.cameraStatus,
                },
                route: [Route.Inner],
                sign: this.ID,
                type: DataBusMessageType.NotifyStatuses,
              });
            }
            break;

          case DataBusMessageType.ShareScreenStarted:
            {
            }
            break;

          case DataBusMessageType.ShareScreenStartedError:
            {
              this.logger.info('sharescreen start canceled by an error');
            }
            break;
          default:
            break;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
