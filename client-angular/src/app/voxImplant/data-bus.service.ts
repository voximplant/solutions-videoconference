import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IParticipant } from './/interfaces/IParticipant';
import { IChatMessage } from './/interfaces/IChatMessage';

export enum ErrorId {
  //hide any errors
  NoError,
  SDKError = 'SDK Error',

  XMultipleLogin = 'X-Multiple-Login',

  ConnectionProblem = 'Connection problem',

  BrowserIsNotSupported = 'BrowserIsNotSupported',

  // Happens when there are no funds on account
  OutOfMoney = 'OutOfMoney',
}

export interface IErrorMessage {
  id: ErrorId;
  description?: string;
  data?: any;
}

export enum Route {
  Inner = 'Inner',
  Inward = 'Inward',
  Outward = 'Outward',
}

export enum DataBusMessageType {
  SignIn = 'SignIn', // happens on success sdk.login
  // [ LayerManager.show('conf__form');]
  InitCall = 'InitCall', // provoke init a call
  CallInit = 'CallInit', // happens on call start init
  CallInited = 'CallInited', // happens on call inited
  // settingsApplyButton.disabled = true;
  // settingsApplyButton.classList.add("loading");
  CallConnected = 'CallConnected', // happens on call init
  // CallConnected - logic on conference-management

  SendMessageToCall = 'SendMessageToCall',

  CameraToggle = 'CameraToggle', // toggle camera - toggle camera setting
  CameraToggled = 'CameraToggled', // when camera setting toggled
  MicToggle = 'MicToggle', // toggle microphone  - toggle mic setting
  MicToggled = 'MicToggled', // when camera mic toggled
  NotifyStatuses = 'NotifyStatuses', // ask to notify microphone, video, sharing status
  ReConnect = 'ReConnect', // invoke reconnect sdk
  JoinToChat = 'JoinToChat', //
  ChatMessage = 'ChatMessage', //send message to render
  SendMessageToChat = 'SendMessageToChat', //send message to render
  Participants = 'Participants', //send participants to render data:IEndpointParticipantMessage
  EndpointAdded = 'EndpointAdded', // on Endpoint added
  EndpointRemoved = 'EndpointRemoved', // on Endpoint removed
  RemoteMediaAdded = 'RemoteMediaAdded', // on RemoteMedia added
  RemoteMediaRemoved = 'RemoteMediaRemoved', // on RemoteMedia removed
  ShowInviteForm = 'ShowInviteForm',
  HideInviteForm = 'ShowInviteForm',
  LeaveRoom = 'LeaveRoom',
  ToggleShowSetting = 'ToggleShowSetting',
  StartShareScreen = 'StartShareScreen',

  StopShareScreen = 'StopShareScreen',
  ShareScreenStarted = 'ShareScreenStarted',
  ShareScreenStartedError = 'ShareScreenStartedError',
  ShareScreenStopped = 'ShareScreenStopped',

  FullScreenStopped = 'FullScreenStopped',
  FullScreenStarted = 'FullScreenStarted',
  Mute = 'Mute',
}

export interface IDataBusMessage {
  type: DataBusMessageType;
  route: Route[];
  senderId?: string;
  // class ID which send the message
  sign: string;
  data: any;
}

export interface IEndpointParticipantMessage extends IDataBusMessage {
  type: DataBusMessageType.Participants;
  route: [Route.Inner];
  data: IParticipant[];
}

export interface IDataBusChatMessage extends IDataBusMessage {
  type: DataBusMessageType.ChatMessage;
  route: [Route.Inner];
  data: IChatMessage;
}

export interface IToggleLocalMicMessage extends IDataBusMessage {
  type: DataBusMessageType.MicToggle;
  route: [Route.Inner];
  data: {
    status?: 'mute' | 'unmute';
  };
}

export interface IToggleCameraMessage extends IDataBusMessage {
  type: DataBusMessageType.CameraToggle;
  data: {
    status?: 'hide' | 'show';
  };
}

export interface IToggleLocalCameraMessage extends IToggleCameraMessage {
  route: [Route.Inner];
}

export interface INotifyStatusMessage extends IDataBusMessage {
  type: DataBusMessageType.NotifyStatuses;
  route: [Route.Inner];
  data: {
    microphoneEnabled?: boolean;
    cameraEnabled?: boolean;
  };
}

export interface IEndpointMessage extends IDataBusMessage {
  type: DataBusMessageType.EndpointAdded | DataBusMessageType.EndpointRemoved;
  route: [Route.Inner];
  data: {
    endpoint: {
      id: string;
      displayName: string;
      place: number;
      isDefault: boolean;
    };
    isNeedReCalcView: boolean;
  };
}

export interface IMuteMessage extends IDataBusMessage {
  type: DataBusMessageType.Mute;
  data: {
    value: any;
    endpointId: string;
  };
}

@Injectable()
export class DataBusService {
  // Observable string sources
  private dataBus = new Subject<IDataBusMessage>();
  // Observable string streams
  public dataBus$ = this.dataBus.asObservable();

  public inward$ = this.dataBus$.pipe(filter((message) => message.route.indexOf(Route.Inward) !== -1));
  public outward$ = this.dataBus$.pipe(filter((message) => message.route.indexOf(Route.Outward) !== -1));
  public inner$ = this.dataBus$.pipe(filter((message) => message.route.indexOf(Route.Inner) !== -1));

  private errorBus = new Subject<IErrorMessage>();
  public errorBus$ = this.errorBus.asObservable();

  constructor() {}

  sendError(errorMessage: IErrorMessage) {
    this.errorBus.next(errorMessage);
  }

  send(message: IDataBusMessage) {
    this.dataBus.next(message);
  }
}
