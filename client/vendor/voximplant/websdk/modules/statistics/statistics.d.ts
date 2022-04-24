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

declare const StatisticsLoader: (config: SDKConfig) => ModuleLoader;

declare function registerSource(peerConnection: RTCPeerConnection, abortSignal: AbortSignal): void;

export { StatisticsLoader, registerSource };
