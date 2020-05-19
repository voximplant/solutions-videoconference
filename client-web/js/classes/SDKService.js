import { LayerManager } from './LayerManager.js';
import CallManager from './CallManager.js';
import { currentUser } from './User.js';
import Env from './Env.js';

const credentials = Env.credentials;

const errorMessage = document.querySelector('.js__error-notify');

class SDKServiceClass {
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
      if (VoxImplant.getInstance().getClientState() === 'LOGGED_IN') {
        this.rejoinConf();
      } else {
        this.connectToVoxCloud(true);
      }
    } else {
      console.warn('[WebSDk] We are waiting while another reconnect will be finished');
    }
  }
}

const SDKService = new SDKServiceClass();
export { SDKService };
