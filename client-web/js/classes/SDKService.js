import { LayerManager } from './LayerManager.js';
import CallManager from './CallManager.js';
import { currentUser } from './User.js';
import Env from './Env.js';

const credentials = Env.credentials;

const errorMessage = document.querySelector('.js__error-notify');

class SDKServiceClass {
  maxReconnectAmount=10;
  reconnectAttempts=0;
  constructor() {
    this.isReconnecting = false;
    this.sdk = window.VoxImplant.getInstance();
    this.sdk.on(window.VoxImplant.Events.ConnectionClosed, () => {
      console.error('[WebSDk] Connection was closed');
      this.reconnect();
    });
  }

  init() {
    return new Promise((resolve, reject) => {
      if (this.sdk.getClientState() === 'DISCONNECTED') {
        this.sdk
          .init({
            // showDebugInfo: true,
            localVideoContainerId: 'localVideoNode',
            remoteVideoContainerId: 'hiddenRemote',
            queueType: VoxImplant.QueueTypes.SmartQueue,
          })
          .then((_) => {
            console.warn('[WebSDk] Init completed');
            // this.sdk.setLoggerCallback((record) => {
            //   const { formattedText, category, label, level } = record;
            //   switch (level) {
            //     case 2:
            //    // case LogLevel.WARNING:
            //        console.warn(VoxImplant.LogCategory[category], label, formattedText);
            //       break;
            //     case 1:
            //    // case LogLevel.ERROR:
            //       console.error(VoxImplant.LogCategory[category], label, formattedText);
            //       break;
            //     default:
            //       console.log(VoxImplant.LogCategory[category], label, formattedText);
            //       break;
            //   }
            // });

            resolve(_);
          })
          .catch(reject);
      } else {
        resolve();
      }
    });
  }

  connectToVoxCloud(isReconnect = false) {
    this.sdk
      .connect(false)
      .then(() => {
        console.warn('[WebSDk] Connection was established successfully');
        this.signIn(isReconnect).then(() => {
          if (isReconnect) this.rejoinConf();
        });
      })
      .catch(() => {
        console.error('[WebSDk] Connection failed');
        this.reconnect();
      });
  }

  signIn(isReconnect) {
    return new Promise((resolve, reject) => {
      const login = `${credentials.userName}@${credentials.appName}.${credentials.accountName}.voximplant.com`;
      this.sdk
        .login(login, credentials.password)
        .then(() => {
          console.warn('[WebSDk] Auth completed');
          if (!isReconnect) LayerManager.show('conf__form');
          resolve();
        })
        .catch((e) => {
          LayerManager.show('conf__error');
          errorMessage.appendChild(document.createTextNode('SDK Error'));
          console.warn('[WebSDk] Wrong login or password');
          reject(e);
        });
    });
  }

  rejoinConf() {
    this.isReconnecting = false;
    new CallManager(currentUser.getCallSettings());
  }

  login() {
    this.init().then(() => {
      this.connectToVoxCloud();
    });
  }

  reconnect() {
    if (!this.isReconnecting) {
      this.reconnectAttempts++;
      while (errorMessage.firstChild) {
        errorMessage.removeChild(errorMessage.lastChild);
      }
      errorMessage.appendChild(
        document.createTextNode(
          'Connection problem, reconnecting you to the conference, please wait…'
        )
      );
      console.warn('[WebSDk] Start to reconnect');
      this.isReconnecting = true;
      LayerManager.show('conf__error');
      CallManager.currentConf = null;

      this.sdk.showLocalVideo(false);
      if(this.reconnectAttempts< this.maxReconnectAmount) {
        if (VoxImplant.getInstance().getClientState() === 'LOGGED_IN') {
          this.rejoinConf();
        } else {
          this.connectToVoxCloud(true);
        }
      } else {
        console.warn('[WebSDk] Reconnect attempts done!');
      }
    } else {
      console.warn('[WebSDk] We are waiting while another reconnect will be finished');
    }
  }
}

const SDKService = new SDKServiceClass();
export { SDKService };
