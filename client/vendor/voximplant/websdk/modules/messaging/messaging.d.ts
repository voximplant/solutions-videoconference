declare enum MsgAction {
    createConversation = "createConversation",
    editConversation = "editConversation",
    removeConversation = "removeConversation",
    joinConversation = "joinConversation",
    leaveConversation = "leaveConversation",
    getConversation = "getConversation",
    getConversations = "getConversations",
    getPublicConversations = "getPublicConversations",
    searchConversations = "searchConversations",
    removeEmptyConversation = "removeEmptyConversation",
    addParticipants = "addParticipants",
    editParticipants = "editParticipants",
    removeParticipants = "removeParticipants",
    getUser = "getUser",
    getUsers = "getUsers",
    editUser = "editUser",
    setStatus = "setStatus",
    sendMessage = "sendMessage",
    editMessage = "editMessage",
    removeMessage = "removeMessage",
    typingMessage = "typingMessage",
    isRead = "isRead",
    subscribe = "subscribe",
    unsubscribe = "unsubscribe",
    manageNotification = "manageNotification",
    getSubscriptionList = "getSubscriptionList",
    createBot = "createBot",
    removeBot = "removeBot",
    retransmitEvents = "retransmitEvents",
    UNKNOWN = "UNKNOWN"
}

declare enum MsgSignalingEvents {
    onError = "onError",
    onCreateConversation = "onCreateConversation",
    onEditConversation = "onEditConversation",
    onRemoveConversation = "onRemoveConversation",
    onGetConversation = "onGetConversation",
    onGetPublicConversations = "onGetPublicConversations",
    onGetUser = "onGetUser",
    onEditUser = "onEditUser",
    onSetStatus = "onSetStatus",
    onSendMessage = "onSendMessage",
    onEditMessage = "onEditMessage",
    onRemoveMessage = "onRemoveMessage",
    isRead = "isRead",
    isDelivered = "isDelivered",
    onTyping = "onTyping",
    onSubscribe = "onSubscribe",
    onUnsubscribe = "onUnsubscribe",
    onGetSubscriptionList = "onGetSubscriptionList",
    onCreateBot = "onCreateBot",
    onRemoveBot = "onRemoveBot",
    onRetransmitEvents = "onRetransmitEvents"
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

interface MessengerEvent extends CoreEvent {
    name: MsgSignalingEvents;
    initiator: number;
    messengerAction: MsgAction;
    requestUuid: string;
    timestamp?: number;
}

interface User {
    userId: number;
    userName: string;
    displayName: string;
    deleted?: boolean;
    conversationsList: string[] | undefined;
    leaveConversationList?: string[];
    notificationEvents: MessengerEvent[] | undefined;
    customData: {
        [key: string]: string | number | boolean;
    };
    privateCustomData: {
        [key: string]: string | number | boolean;
    };
}

interface UserEvent extends MessengerEvent {
    user: User;
}

interface SetStatusEvent extends MessengerEvent {
    online: boolean;
}

interface ConversationParticipant {
    userId: number;
    isOwner?: boolean;
    canWrite?: boolean;
    canEdit?: boolean;
    canRemove?: boolean;
    canManageParticipants?: boolean;
    canEditAll?: boolean;
    canRemoveAll?: boolean;
    lastRead?: number;
}
interface ConversationParticipantAPI {
    user_id: number;
    last_read?: number;
    flags?: number;
}

interface ConversationParams {
    participants: ConversationParticipant[];
    title?: string;
    direct: boolean;
    enablePublicJoin: boolean;
    uberConversation: boolean;
    customData: Record<string, unknown>;
}
interface ConversationParamsAPI {
    participants: ConversationParticipantAPI[];
    title: string;
    direct: boolean;
    enable_public_join: boolean;
    uber_conversation: boolean;
    custom_data: Record<string, unknown>;
}
interface ConversationSettings {
    customData: Record<string, unknown>;
    direct: boolean;
    participants: ConversationParticipant[];
    enablePublicJoin: boolean;
    title: string;
    uberConversation: boolean;
    uuid: string;
    createdAt: number;
    lastSeq: number;
    lastUpdate: number;
}

interface MessageSettings {
    uuid: string;
    conversation: string;
    text: string;
    payload: Record<string, unknown>[];
    sender: number;
    timestamp: number;
    seq: string;
}
interface MessageEvent extends MessengerEvent {
    message: MessageSettings;
}

declare class Message {
    uuid: string;
    readonly conversation: string;
    text: string;
    payload: Record<string, unknown>[];
    readonly sender: number;
    timestamp: number;
    seq: string;
    constructor(event: MessageEvent);
    edit(text: string, payload: Record<string, unknown>[]): Promise<Message>;
    remove(): Promise<void>;
    private _update;
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

declare class Conversation extends EventBusClass {
    customData: Record<string, unknown>;
    direct: boolean;
    participants: ConversationParticipant[];
    enablePublicJoin: boolean;
    title: string;
    uberConversation: boolean;
    uuid: string;
    createdAt: number;
    lastSeq: number;
    lastUpdate: number;
    constructor(params: ConversationParams);
    _update(params: ConversationSettings): void;
    _serializeToPayload(): ConversationParamsAPI;
    _onSendMessage(event: MessageEvent): void;
    _onEditConversation(event: MessageEvent): void;
    private _serializeParticipants;
    private _getUserPermissions;
    retransmitEvents(eventsTo: number, count: number): Promise<MessengerEvent[]>;
    sendMessage(text: string, payload?: Record<string, unknown>[]): Promise<Message>;
}

declare function getMyId(): Promise<number>;
declare function getMe(): string;
declare function getUserById(user_id: number): Promise<UserEvent>;
declare function getUser(user_name: string): Promise<UserEvent>;
declare function editUser(customData?: Record<string, unknown>, privateCustomData?: Record<string, unknown>): Promise<UserEvent>;
declare function getUsers(users: string[]): Promise<UserEvent[]>;
declare function getUsersById(userIds: number[]): Promise<UserEvent[]>;
declare function setStatus(online: boolean): Promise<SetStatusEvent>;
declare function createConversation(conversationParams: ConversationParams): Promise<Conversation>;
declare function getConversation(uuid: string): Promise<Conversation>;
declare function joinConversation(uuid: string): Promise<Conversation>;
declare function getConversations(conversations: string[]): Promise<Conversation[]>;
declare function getPublicConversations(): Promise<Conversation[]>;
declare const Messaging: {
    getMe: typeof getMe;
    getMyId: typeof getMyId;
    getUserById: typeof getUserById;
    getUsersById: typeof getUsersById;
    getUser: typeof getUser;
    getUsers: typeof getUsers;
    editUser: typeof editUser;
    setStatus: typeof setStatus;
    createConversation: typeof createConversation;
    getConversation: typeof getConversation;
    joinConversation: typeof joinConversation;
    getConversations: typeof getConversations;
    getPublicConversations: typeof getPublicConversations;
};

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

declare const MessagingLoader: () => ModuleLoader;

declare const MessageReceived: SdkEventName<{
    message: Message;
} & SdkEvent>;
declare const EditConversation: SdkEventName<{
    message: Message;
} & SdkEvent>;
declare const UsersAdded: SdkEventName<SdkEvent>;
declare const UsersRemoved: SdkEventName<SdkEvent>;

declare const MsgEvent_d_MessageReceived: typeof MessageReceived;
declare const MsgEvent_d_EditConversation: typeof EditConversation;
declare const MsgEvent_d_UsersAdded: typeof UsersAdded;
declare const MsgEvent_d_UsersRemoved: typeof UsersRemoved;
declare namespace MsgEvent_d {
  export {
    MsgEvent_d_MessageReceived as MessageReceived,
    MsgEvent_d_EditConversation as EditConversation,
    MsgEvent_d_UsersAdded as UsersAdded,
    MsgEvent_d_UsersRemoved as UsersRemoved,
  };
}

export { MsgEvent_d as Events, Messaging, MessagingLoader };
