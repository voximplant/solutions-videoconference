const CONNECTION_STRING = '';

class WSServiceClass {
  constructor(connectionString) {
    this._gracefulShutdown = false;
    this._eventListeners = new Map();
    this._connectionString = connectionString;
  }

  _connectAndLogin() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this._connectionString);
      this.ws.addEventListener('open', () => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              cmd: 'hello',
              content: {
                userId: this._userId,
                sessionId: this._sessionId,
                mute: this.muteState,
                sharing: this.sharingState,
                video: this.videoState,
              },
            })
          );
          resolve();
        } else {
          this.ws.close();
        }
      });
      this.ws.addEventListener('error', () => {
        reject();
      });
      this.ws.addEventListener('close', () => {
        if (!this._gracefulShutdown) this._connectAndLogin();
        else this._gracefulShutdown = false;
      });
      this.ws.addEventListener('message', (event) => {
        this._processIncommingMessage(event.data);
      });
    });
  }

  _processIncommingMessage(data) {
    try {
      const message = JSON.parse(data);
      switch (message.cmd) {
        case 'vad':
          this._dispatch('vad', {
            value: message.content,
            endpointId: message.from,
          });
          break;
        case 'mute':
          this._dispatch('mute', {
            value: message.content,
            endpointId: message.from,
          });
          break;
        case 'video':
          this._dispatch('video', {
            value: message.content,
            endpointId: message.from,
          });
          break;
        case 'sharing':
          this._dispatch('sharing', {
            value: message.content,
            endpointId: message.from,
          });
          break;
      }
    } catch (e) {}
  }

  _dispatch(event, message) {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        listener(message);
      });
    }
  }

  _sendRawMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  async login(sessionId, userId, mute, sharing, video) {
    this._sessionId = sessionId;
    this._userId = userId;
    this.muteState = mute;
    this.sharingState = sharing;
    this.videoState = video;
    return this._connectAndLogin();
  }

  notifyVAD(isVAD) {
    const message = {
      cmd: 'vad',
      content: isVAD,
    };
    this._sendRawMessage(message);
  }

  notifyMute(isMute) {
    const message = {
      cmd: 'mute',
      content: isMute,
    };
    this.muteState = isMute;
    this._sendRawMessage(message);
  }

  notifySharing(isSharing) {
    const message = {
      cmd: 'sharing',
      content: isSharing,
    };
    this.sharingState = isSharing;
    this._sendRawMessage(message);
  }

  notifyVideo(isVideo) {
    const message = {
      cmd: 'video',
      content: isVideo,
    };
    this.videoState = isVideo;
    this._sendRawMessage(message);
  }

  addEventListener(event, listener) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Set());
    }
    const listenerSet = this._eventListeners.get(event);
    listenerSet.add(listener);
  }

  removeEventListener(event, listener) {
    if (this._eventListeners.has(event)) {
      const listenerSet = this._eventListeners.get(event);
      if (listener) {
        listenerSet.delete(listener);
      } else {
        listenerSet.clear();
      }
    }
  }

  close() {
    this._gracefulShutdown = true;
    this.ws.close();
  }
}

const WSService = new WSServiceClass(CONNECTION_STRING);

export { WSService };
