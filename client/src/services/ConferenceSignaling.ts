interface RequestVideoSizePayload {
  [endpointId: string]: {
    [mid: string]: [width: number, height: number];
  };
}

interface ManageEndpointsPayload {
  [endpointId: string]: {
    audio: string[]; // в секции передаются только активные миды
    video: string[]; // в секции передаются только активные миды
  };
}

export interface ConferenceEventMap {
  vad: VadEvent;
  hello: HelloEvent;
  requestVideoSize: RequestVideoSizeEvent;
  manageEndpoints: ManageEndpointsEvent;
  mute: MuteEvent;
  responseEndpointsState: ResponseEndpointsStateEvent;
}

export type ConferenceEventName = keyof ConferenceEventMap;

export type ConferenceEvent = ConferenceEventMap[ConferenceEventName];

export interface BaseConferenceEvent<T extends string> {
  name: T;
  endpoint: string;
  enabled: boolean;
}

export interface HelloEvent {
  name: 'hello';
  from: string;
  content: string;
}

export type VadEvent = BaseConferenceEvent<'vad'>;

export interface RequestVideoSizeEvent {
  name: 'requestVideoSize';
  payload: RequestVideoSizePayload;
}

export interface ManageEndpointsEvent {
  name: 'manageEndpoints';
  payload: ManageEndpointsPayload;
}

export type MuteEvent = BaseConferenceEvent<'mute'>;

export interface ResponseEndpointsStateEvent {
  name: 'responseEndpointsState';
  endpointsState: {
    [endpoint: string]: {
      mute: boolean;
      vad: boolean;
    };
  };
}

type Listener<T extends ConferenceEvent> = (data: T) => unknown;

export class ConferenceSignaling {
  private static _rand = '';
  private static _ws: WebSocket | null = null;
  private static readonly _listenersMap: Map<
    ConferenceEventName,
    Listener<ConferenceEvent>[]
  > = new Map();
  private static _connected = false;
  private static readonly _beforeConnectQueue: Map<
    ConferenceEventName,
    ConferenceEvent
  > = new Map();

  private static onMessage({ data }: MessageEvent<string>) {
    try {
      const payload: ConferenceEvent = JSON.parse(data);

      this._listenersMap.get(payload.name)?.forEach((listener) => listener(payload));
    } catch (err) {
      console.error(`ConferenceSignaling: Failed to parse data ${data}`);
    }
  }

  private static sendDeferMessages() {
    this._beforeConnectQueue.forEach((value, key) => {
      this.send(key, value);
    });
    this._beforeConnectQueue.clear();
  }

  private static onOpen() {
    this._ws?.send(this._rand);
    this.on('hello', () => {
      this._connected = true;
      this._ws?.send(JSON.stringify({ name: 'requestEndpointsState' }));
      this.sendDeferMessages();
    });
  }

  private static onError(event: Event) {
    console.error(`[ConferenceSignaling]: error in ws connection`);
    this._ws?.close();
    this._ws = null;
  }

  private static onClose(event: CloseEvent) {
    this._ws = null;
  }

  static get connected() {
    return this._connected;
  }

  static get rand() {
    return this._rand;
  }

  static init(wsUrl: string, rand: string) {
    console.log('CONF SIGNALING: Started');
    try {
      this._rand = rand;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (evt) => this.onMessage(evt);
      ws.onopen = () => this.onOpen();
      ws.onclose = (evt) => this.onClose(evt);
      ws.onerror = (evt) => this.onError(evt);
      this._ws = ws;
    } catch (err) {
      console.error('Error occurred while creating ConferenceSignaling', err);
    }
  }

  static send<T extends ConferenceEventName>(
    name: T,
    payload: Pick<ConferenceEventMap[T], Exclude<keyof ConferenceEventMap[T], 'name' | 'endpoint'>>
  ) {
    const dto = {
      name,
      // TODO: Remove condition and handle sending endpoint property in smart way
      ...(name !== 'requestVideoSize' && { endpoint: this._rand }),
      ...payload,
    };

    if (this.connected) {
      this._ws?.send(JSON.stringify(dto));
    } else {
      this._beforeConnectQueue.set(name, (payload as unknown) as ConferenceEvent);
    }
  }

  static on<T extends ConferenceEventName>(event: T, listener: Listener<ConferenceEventMap[T]>) {
    const listeners = this._listenersMap.get(event) || [];
    listeners.push(listener as Listener<ConferenceEvent>);
    this._listenersMap.set(event, listeners);
  }

  static off<T extends ConferenceEventName>(event: T, listener?: Listener<ConferenceEventMap[T]>) {
    const listeners = this._listenersMap.get(event);
    if (!listeners) return;
    this._listenersMap.set(event, listener ? listeners.filter((l) => l !== listener) : []);
  }

  static disconnect() {
    this._ws?.close();
    this._ws = null;
    this._connected = false;
  }
}

export { RequestVideoSizePayload, ManageEndpointsPayload };
