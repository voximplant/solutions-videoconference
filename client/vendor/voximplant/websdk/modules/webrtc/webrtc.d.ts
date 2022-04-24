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

interface WatchEvent<T> extends SdkEvent {
    oldValue: T;
    newValue: T;
}

interface ListenerOptions {
    once?: boolean;
    signal?: AbortSignal;
}

interface WatchableValue<T> {
    value: T | undefined;
    watch: (watcher: WatchListener<T>, options?: ListenerOptions) => void;
}
declare type WatchListener<T> = (listener: WatchEvent<T>) => void;

interface MediaDescription {
    track: MediaStreamTrack;
    kind: MediaTrackKind;
    simulcast?: boolean;
}
declare type MediaTrackKind = 'audio' | 'video' | 'screen_video' | 'screen_audio';

interface PeerConnectionInit {
    isSendOnly?: boolean;
}

declare class PeerConnection {
    readonly id: string;
    state: WatchableValue<RTCPeerConnectionState>;
    readonly canReceive: boolean;
    isInnocent: boolean;
    private impl;
    private readonly mediaKindMap;
    private readonly candidatePool;
    private readonly coreInstance;
    private readonly iceConfig;
    private readonly mediaSlots;
    private readonly polly;
    constructor(config: {
        coreInstance: CoreInterface;
        iceConfig: RTCConfiguration;
        initConfig?: PeerConnectionInit;
    });
    private get extra();
    getOffer(): Promise<[RTCSessionDescriptionInit, {
        mids: Record<string, string>;
    }]>;
    setPoliteIndex(newPoliteIndex: number): void;
    setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
    setIceServers(iceServers: RTCIceServer[]): Promise<void>;
    addIceCandidate(rawCandidate: [number, string]): Promise<void>;
    addMedia(media: MediaDescription): Promise<void>;
    /**
     * replace or remove track
     * @param from
     * @param to
     */
    replaceMedia(from: MediaDescription, to?: MediaDescription | null): Promise<void>;
    sendDTMF(): Promise<void>;
    stop(): void;
    receiveReinvite(description: RTCSessionDescription, politeIndex: number): Promise<void>;
    getTransceivers(): RTCRtpTransceiver[];
    receiveReinviteAnswer(description: RTCSessionDescription): Promise<void>;
    private readonly onIceCandidate;
    private sendCandidates;
    private isConnectionReady;
    private sendReinvite;
    private receiveReject;
}

declare const WebrtcLoader: () => ModuleLoader;
interface WebRtcCapabilities {
    webrtc: boolean;
    desktopSharing: boolean;
    insertableStreams: boolean;
    webCodecs: boolean;
}
declare const getWebRtcCapabilities: () => WebRtcCapabilities;
/**
 * Create our own peerConnection
 */
declare const createPeerConnection: (initConfig?: PeerConnectionInit | undefined) => Promise<PeerConnection>;

export { PeerConnection, WebRtcCapabilities, WebrtcLoader, createPeerConnection, getWebRtcCapabilities };
