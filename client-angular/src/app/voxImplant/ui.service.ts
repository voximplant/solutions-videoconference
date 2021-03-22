import { Injectable, OnDestroy } from '@angular/core';
import { SDKService } from './sdk.service';
import { environment } from '@env/environment';
import { CurrentUserService } from './current-user.service';
import { IIDClass } from './interfaces/IIDClass';
import { createLogger } from '@core';
import { VIManagerService } from './vimanager.service';
import {
  DataBusMessageType,
  DataBusService,
  ErrorId,
  IDataBusMessage,
  IEndpointParticipantMessage,
  Route,
} from './data-bus.service';
import { ConferenceManagementService } from './conference-management.service';

import { Subscription } from 'rxjs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IChatMessage } from './/interfaces/IChatMessage';
import { IParticipant } from './/interfaces/IParticipant';

export enum UIState {
  needRoomId = 'needRoomId',
  needInfo = 'needInfo',
  needAccessAllow = 'conf__access-allow',
  needMediaSetting = 'conf__setting',
  browserIsSupported = 'conf__access-not-supported',
  mediaAccessError = 'mediaAccessError',
  videoWall = 'conf__video-section-wrapper',
  leaveRoom = 'conf__leave',
}

@Injectable()
export class UIService implements IIDClass, OnDestroy {
  readonly ID = 'UIService';
  private logger = createLogger(this.ID);

  participants: IParticipant[] = [];

  chatMessages: IChatMessage[] = [];
  subscriptions: Subscription = new Subscription();
  constructor(
    private sdkService: SDKService,
    private currentUserService: CurrentUserService,
    private viManagerServer: VIManagerService,
    private dataBusService: DataBusService,
    //it's not non-use it is just need to load it
    private conferenceManagement: ConferenceManagementService
  ) {
    if (this.roomId) {
      this.onWelcome();
    } else {
      this.state = UIState.needRoomId;
    }

    this.subscriptions.add(
      this.dataBusService.inner$.pipe().subscribe((message: IDataBusMessage) => {
        switch (message.type) {
          case DataBusMessageType.CallInit:
            //case DataBusMessageType.CallConnected:
            this.state = UIState.videoWall;
            break;

          case DataBusMessageType.LeaveRoom:
            //case DataBusMessageType.CallConnected:
            this.state = UIState.leaveRoom;
            break;

          case DataBusMessageType.ToggleShowSetting:
            //case DataBusMessageType.CallConnected:
            this.isSettingsShown = !this.isSettingsShown;
            break;

          case DataBusMessageType.Participants:
            {
              this.participants = [...(message as IEndpointParticipantMessage).data];
            }
            break;

          case DataBusMessageType.ChatMessage:
            {
              this.chatMessages.push(message.data);
            }
            break;
        }
      })
    );
  }

  get roomId(): string {
    return this.currentUserService.serviceId;
  }

  get selfName(): string {
    return this.currentUserService.name;
  }

  onWelcome(e?: MouseEvent | TouchEvent) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    //there is login to cloud
    this.sdkService.login();

    if (this.currentUserService.isConfOwner) {
      this.currentUserService.serviceId = `${Math.floor(Math.random() * 99999999) + 1000000}`;
      window.history.replaceState(
        {},
        '',
        environment.appConfig.replaceHistoryPrefix + this.currentUserService.serviceId
      );
    }
    this.state = UIState.needInfo;
  }
  isSettingsShown: boolean = false;
  state: UIState;
  onJoin(serviceId: string, userEmail: string, userName: string) {
    this.currentUserService.serviceId = serviceId;
    this.currentUserService.email = userEmail;
    this.currentUserService.name = userName;

    this.logger.info('New User:', { user: this.currentUserService.name });

    this.participants = [];

    if (this.viManagerServer.checkBrowser()) {
      this.logger.info('[WebSDk] RTC SUPPORTED');
      this.state = UIState.needAccessAllow;
    } else {
      this.state = UIState.browserIsSupported;
      this.dataBusService.sendError({
        id: ErrorId.BrowserIsNotSupported,
        description: marker('This browser is not supported'),
      });
      this.logger.warn('[WebSDk] RTC NOT SUPPORTED!');
      return;
    }

    this.viManagerServer
      .getLocalMedia()
      .then((e) => {
        this.state = UIState.needMediaSetting;
      })
      .catch(() => {
        this.state = UIState.mediaAccessError;
      });
  }

  onNewChatMessage($event: string) {
    this.dataBusService.send({
      data: { text: $event },
      route: [Route.Inner],
      sign: this.ID,
      type: DataBusMessageType.SendMessageToChat,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
