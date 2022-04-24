declare const SDKState: {
    NOT_CONFIGURED: string;
    DISCONNECTED: string;
    CONNECTING: string;
    CONNECTED: string;
    AUTHORIZING: string;
    AUTHORIZED: string;
    AUTHORIZATION_FAILED: string;
    CONNECTION_FAILED: string;
    RECONNECTING: string;
    UNKNOWN: string;
};

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

interface ModuleLoader {
    version: SDKModuleVersion;
    name: string;
    setup: (core: CoreInterface) => void | Promise<void>;
    dependencies: ModuleDeps;
}

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

interface AuthProvider {
    auth(core: CoreInterface): Promise<AuthResult>;
    state: number;
    readonly username: string;
}

/**
 * VoxImplant login options
 * @class
 */
interface AuthOptions {
    /**
     * If set to false Web SDK can be used only for ACD status management
     */
    receiveCalls?: boolean;
    /**
     * @hidden
     */
    accessToken?: string;
    /**
     * A unique token for the current device. Use Client.getGUID() and save it at client storage (foe LocalStorage or IndexedDB)
     * @hidden
     */
    deviceToken?: string;
}

/**
 * @deprecated
 */

interface PasswordAuthParams {
    username: string;
    password: string;
    options?: AuthOptions;
}
declare class PasswordAuth implements AuthProvider {
    readonly username: string;
    readonly password: string;
    readonly options: AuthOptions;
    state: number;
    constructor({ username, password, options }: PasswordAuthParams);
    auth(core: CoreInterface): Promise<AuthResult>;
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

declare const Configured: SdkEventName<{
    name: string;
    value: number;
} & SdkEvent>;
declare const Connected: SdkEventName<SdkEvent>;
declare const ConnectionFailed: SdkEventName<SdkEvent>;
declare const Disconnected: SdkEventName<SdkEvent>;
declare const AuthSuccess: SdkEventName<SdkEvent>;
declare const AuthFailed: SdkEventName<SdkEvent>;

declare const index_d_Configured: typeof Configured;
declare const index_d_Connected: typeof Connected;
declare const index_d_ConnectionFailed: typeof ConnectionFailed;
declare const index_d_Disconnected: typeof Disconnected;
declare const index_d_AuthSuccess: typeof AuthSuccess;
declare const index_d_AuthFailed: typeof AuthFailed;
declare namespace index_d {
  export {
    index_d_Configured as Configured,
    index_d_Connected as Connected,
    index_d_ConnectionFailed as ConnectionFailed,
    index_d_Disconnected as Disconnected,
    index_d_AuthSuccess as AuthSuccess,
    index_d_AuthFailed as AuthFailed,
  };
}

interface OtpAuthParams {
    username: string;
    onOneTimeLoginKey: (key: string) => Promise<string>;
    options?: AuthOptions;
}
declare class OtpAuth implements AuthProvider {
    readonly username: string;
    readonly onOneTimeLoginKey: (key: string) => Promise<string>;
    readonly options: AuthOptions;
    state: number;
    constructor({ username, onOneTimeLoginKey, options }: OtpAuthParams);
    auth(core: CoreInterface): Promise<AuthResult>;
}

declare type SDKEnvironment = 'development' | 'production';
declare const SDK: SDKInterface;
declare const auth: {
    PasswordAuth: typeof PasswordAuth;
    OtpAuth: typeof OtpAuth;
};

export { index_d as Events, SDK, SDKEnvironment, SDKState, auth };
