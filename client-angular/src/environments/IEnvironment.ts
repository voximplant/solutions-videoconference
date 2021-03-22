import { IDebugLevels } from '@app/IDebugLevels';
import { IAppCredentials } from '@app/voxImplant/interfaces/IAppCredentials';

export interface IAppConfig {
  baseUrl: string;
  replaceHistoryPrefix: string;
  url: string;
  sendUID: boolean;
  credentials: IAppCredentials;
  webSocketConnectionString: string;
}

export interface IEnvironment {
  production: boolean;
  // hot module replacement
  hmr: boolean;
  version: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  appConfig: IAppConfig;

  // negative means infinity
  reconnectTimes: number;
  logLevel: keyof IDebugLevels;
}
