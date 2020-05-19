'use strict';

import Env from './Env.js';

function uuid() {
  const buf = new Uint32Array(4);
  window.crypto.getRandomValues(buf);
  let idx = -1;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    idx++;
    const r = (buf[idx >> 3] >> ((idx % 8) * 4)) & 15;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class UserClass {
  constructor() {
    this.isConfOwner = this.isConferenceOwner();
    this.serviceId = this.getServiceIdFromUrl(window.location);

    this.name = 'John Doe';
    this.email = 'Email';
    this.cameraStatus = 1;
    this.microphoneEnabled = true;
    this.uuid = uuid();
  }

  getCallSettings() {
    const config = {
      number: `conf_${this.serviceId}`,
      video: { sendVideo: this.cameraStatus === 1 ? true : false, receiveVideo: true },
      extraHeaders: {
        'X-Display-Name': this.name,
        'X-Email': this.email,
      },
    };
    if (Env.sendUID) config.extraHeaders['X-UUID'] = this.uuid;
    return config;
  }

  isConferenceOwner() {
    return !this.getServiceIdFromUrl(window.location);
  }

  getServiceIdFromUrl(url) {
    return Env.getServiceIdFromUrl(url);
  }

  setLocalStorage() {
    const userData = {
      isConfOwner: this.isConfOwner,
      name: this.name,
      email: this.email,
      cameraStatus: this.cameraStatus,
      microphoneEnabled: this.microphoneEnabled,
      uuid: this.uuid,
    };

    localStorage.user_data = JSON.stringify(userData);
  }

  getLocalStorage() {
    return localStorage.getItem('user_data') ? JSON.parse(localStorage.user_data) : null;
  }
}

const currentUser = new UserClass();

export { currentUser };
