interface SDKModuleVersion {
    major: number;
    minor: number;
    rev: number;
}

declare type ModuleDepsCompType = 'strict' | 'less' | 'grater' | 'lessOrEqual' | 'graterOrEqual' | 'sameMajor' | 'sameMinor';

interface ModuleDepsVersion extends SDKModuleVersion {
    comparator: ModuleDepsCompType;
}

interface ModuleDeps {
    require?: {
        [moduleName: string]: ModuleDepsVersion;
    };
    conflicts?: {
        [moduleName: string]: ModuleDepsVersion;
    };
}

interface CoreEvent {
    name: string;
    service?: string;
    [fields: string]: any;
}
interface ReachCoreEvent extends CoreEvent {
    handler: (event: CoreEvent) => Promise<void> | void;
}
interface CoreEventMeta {
    toGW: boolean;
}

declare type CoreFactoryHandler = (event: CoreEvent) => ReachCoreEvent | false;
declare type CoreHandler = (event: CoreEvent) => void | Promise<void>;

interface OAuthParams {
    accessExpire: number;
    accessToken: string;
    refreshExpire: number;
    refreshToken: string;
}

interface AuthResult {
    result: boolean;
    code?: number;
    reason?: string;
    OAuth?: OAuthParams;
    connectionId?: string;
    displayName?: string;
}

interface AuthProvider {
    auth(core: CoreInterface): Promise<AuthResult>;
    state: number;
    readonly username: string;
}

interface SdkEventName<T> {
    name: string;
    [key: string]: any;
}

declare function makeEvent<Payload extends SdkEvent>(name: string): SdkEventName<Payload>;

interface SdkEvent {
    readonly target: unknown;
    readonly type: ReturnType<typeof makeEvent>;
    readonly timeStamp: number;
    [key: string]: any;
}

declare type SDKEnvironment = 'development' | 'production';

interface SDKConnectionConfig {
    servers?: string[];
    connectivityCheck?: boolean;
    reconnectOnFail?: boolean;
    balancerUrl?: string;
    imVersion?: number;
    acdVersion?: number;
}

declare const VILoggerLevel: {
    trace: number;
    verbose: number;
    info: number;
    warning: number;
    error: number;
    none: number;
};
declare type VILoggerLevelStrings = keyof typeof VILoggerLevel;

interface VILoggerMeta {
    logLevel: VILoggerLevelStrings;
    metaRay: string;
    deviceId: string;
    connectionId: string;
    applicationName: string;
    customerName: string;
    userName: string;
    sessionId: string;
    callId: string;
    serverCallId: string;
}

interface VILoggerInit {
    logLevel: VILoggerLevelStrings;
}

declare abstract class VILogger {
    commonSettings: VILoggerInit;
    protected constructor(logLevel?: VILoggerLevelStrings);
    protected abstract handleLog(message: string, meta: VILoggerMeta): void;
    writeLog(message: string, meta: VILoggerMeta): void;
    setup(sdkInstance: CoreInterface): this;
}

declare type SDKExperimentsFlags = {
    [key: string]: boolean;
};
declare type ModuleBuilderType = () => ModuleLoader[] | Promise<ModuleLoader[]>;
interface SDKConfig {
    environment?: SDKEnvironment;
    connection?: SDKConnectionConfig;
    deviceId?: string;
    logger?: VILogger | (() => Promise<VILogger> | VILogger);
    experiments?: SDKExperimentsFlags;
    modules?: ModuleBuilderType | ModuleLoader[];
}

interface SDKInterface {
    configure: (config?: SDKConfig) => Promise<void>;
    clear: () => void;
    log: (message: string, meta: Partial<VILoggerMeta>) => void;
    connect: () => Promise<void>;
    login: (provider: AuthProvider) => Promise<AuthResult>;
    state: string;
    config: SDKConfig;
    version: '5.0.0-alpha0';
}

interface CoreInterface {
    registerModule: (eventFactory: CoreFactoryHandler, preHandler?: CoreHandler, postHandler?: CoreHandler) => void;
    clear: () => void;
    login: (provider: AuthProvider) => Promise<AuthResult>;
    send: (payload: CoreEvent, meta: CoreEventMeta) => Promise<void>;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    connectionState: () => number;
    loginState: () => number;
    username: () => string;
    setSdk: (sdk: SDKInterface) => void;
}

interface ModuleLoader {
    version: SDKModuleVersion;
    name: string;
    setup: (core: CoreInterface) => void | Promise<void>;
    dependencies: ModuleDeps;
}

interface MediaDescription {
    track: MediaStreamTrack;
    kind: MediaTrackKind;
    simulcast?: boolean;
}
declare type MediaTrackKind = 'audio' | 'video' | 'screen_video' | 'screen_audio';

interface CallConferenceOptions {
    number: string;
    sendOptions?: {
        media: MediaDescription[];
    };
    customData?: string;
    extraHeaders?: Record<string, string>;
    simulcast?: boolean;
    firstPc?: string;
}

interface ListenerOptions {
    once?: boolean;
    signal?: AbortSignal;
}

declare type AddEventListenerType = <M = any>(event: SdkEventName<M>, listener: (event: M) => void, options?: ListenerOptions) => void;
declare type RemoveEventListenerType = <M = any>(event: SdkEventName<M>, listener?: (event: M) => void) => void;
declare type DispatchEventType = (event: SdkEvent) => void;
declare class EventBusClass {
    addEventListener: AddEventListenerType;
    removeEventListener: RemoveEventListenerType;
    dispatchEvent: DispatchEventType;
    constructor();
}

declare type ConferenceState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed';

declare class Conference extends EventBusClass {
    readonly uuid: string;
    private readonly peerConnectionList;
    private readonly mediaPcMap;
    constructor(initOptions: CallConferenceOptions & {
        core: CoreInterface;
    });
    get state(): ConferenceState | undefined;
    get outgoingMedia(): MediaDescription[];
    init(): Promise<void>;
    start(): Promise<void>;
    hangup(): Promise<void>;
    sendMessage(message: string): void;
    addMedia(media: MediaDescription[]): Promise<void>;
    replaceMedia(from: MediaDescription, to: MediaDescription | null): Promise<void>;
    removeMedia(media: MediaDescription[]): Promise<void>;
    isFirstConnection(peerConnectionId: string): boolean;
    getTracks(peerConnectionId: string, mids: {
        [key: string]: string;
    }): {
        [key: string]: MediaStreamTrack;
    };
    onConnected(peerConnectionId: string): void;
    private _generatePair;
    private _addTracks;
    private _handleStopTrack;
    private closePeerConnections;
    private findPC;
    private reverseTrackPCmap;
    private activatePc;
}

declare const EndpointAdded: SdkEventName<{
    endpointId: string;
    displayName: string;
    userName: string;
    mids: {
        [key: string]: string;
    };
    tracks: {
        [key: string]: MediaStreamTrack;
    };
} & SdkEvent>;
declare const EndpointRemoved: SdkEventName<{
    endpointId: string;
} & SdkEvent>;
declare const EndpointUpdated: SdkEventName<{
    endpointId: string;
} & SdkEvent>;
declare const MessageReceived: SdkEventName<{
    message: string;
} & SdkEvent>;
declare const Connected: SdkEventName<SdkEvent>;
declare const Disconnected: SdkEventName<SdkEvent>;

declare const ConferenceEvents_d_EndpointRemoved: typeof EndpointRemoved;
declare const ConferenceEvents_d_EndpointUpdated: typeof EndpointUpdated;
declare const ConferenceEvents_d_EndpointAdded: typeof EndpointAdded;
declare const ConferenceEvents_d_MessageReceived: typeof MessageReceived;
declare const ConferenceEvents_d_Connected: typeof Connected;
declare const ConferenceEvents_d_Disconnected: typeof Disconnected;
declare namespace ConferenceEvents_d {
  export {
    ConferenceEvents_d_EndpointRemoved as EndpointRemoved,
    ConferenceEvents_d_EndpointUpdated as EndpointUpdated,
    ConferenceEvents_d_EndpointAdded as EndpointAdded,
    ConferenceEvents_d_MessageReceived as MessageReceived,
    ConferenceEvents_d_Connected as Connected,
    ConferenceEvents_d_Disconnected as Disconnected,
  };
}

declare const ConferenceLoader: () => ModuleLoader;
declare function joinConference(options: CallConferenceOptions): Promise<Conference>;

export { CallConferenceOptions, ConferenceLoader, ConferenceEvents_d as Events, joinConference };
