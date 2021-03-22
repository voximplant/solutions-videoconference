import { Injectable } from '@angular/core';
import { HelperService } from '@core/helper.service';
import { environment } from '@env/environment';

interface IStorageUserData {
  isConfOwner: boolean;
  name: string;
  email: string;
  cameraStatus: boolean;
  microphoneEnabled: boolean;
  uuid: string;
  serviceId: string;
}

type KeysEnum<T> = { [P in keyof Required<T>]: true };
const StorageUserDataKeys: KeysEnum<IStorageUserData> = {
  isConfOwner: true,
  name: true,
  email: true,
  cameraStatus: true,
  microphoneEnabled: true,
  uuid: true,
  serviceId: true,
};

@Injectable()
export class CurrentUserService {
  get isConfOwner(): boolean {
    return this.getLocalStorageValue('isConfOwner');
  }

  set isConfOwner(value: boolean) {
    this.setLocalStorageValue('isConfOwner', value);
  }

  get email(): string {
    return this.getLocalStorageValue('email');
  }

  set email(value: string) {
    this.setLocalStorageValue('email', value);
  }

  get cameraStatus(): boolean {
    return this.getLocalStorageValue('cameraStatus');
  }

  set cameraStatus(value: boolean) {
    this.setLocalStorageValue('cameraStatus', value);
  }

  get microphoneEnabled(): boolean {
    return this.getLocalStorageValue('microphoneEnabled');
  }

  set microphoneEnabled(value: boolean) {
    this.setLocalStorageValue('microphoneEnabled', value);
  }
  get serviceId(): string {
    return this.getLocalStorageValue('serviceId');
  }

  set serviceId(value: string) {
    this.setLocalStorageValue('serviceId', value);
  }
  get uuid(): string {
    return this.getLocalStorageValue('uuid');
  }

  set uuid(value: string) {
    this.setLocalStorageValue('uuid', value);
  }

  get name(): string {
    return this.getLocalStorageValue('name');
  }

  set name(value: string) {
    this.setLocalStorageValue('name', value);
  }

  private setLocalStorageValue(key: keyof IStorageUserData, value: any) {
    let data: any = this.getLocalStorage();
    if (data === null) {
      data = {};
    }
    data[key] = value;
    localStorage.setItem('user_data', JSON.stringify(data));
  }

  private getLocalStorageValue(key: keyof IStorageUserData): any {
    let data: any = this.getLocalStorage();
    if (data === null) {
      return undefined;
    }
    return data[key];
  }

  constructor() {
    this.isConfOwner = this.isConferenceOwner();
    this.serviceId = this.getServiceIdFromUrl(window.location);
    this.cameraStatus = true;
    this.microphoneEnabled = true;
    this.uuid = HelperService.uuid();
  }

  getCallSettings() {
    const config = {
      number: `conf_${this.serviceId}`,
      video: { sendVideo: this.cameraStatus, receiveVideo: true },
      extraHeaders: {
        'X-Display-Name': this.name,
        'X-Email': this.email,
      },
    };
    if (environment.appConfig.sendUID) config.extraHeaders['X-UUID'] = this.uuid;
    return config;
  }

  isConferenceOwner() {
    return !this.getServiceIdFromUrl(window.location);
  }

  getServiceIdFromUrl(url: Location) {
    const params = url.pathname.split('/');
    if (params.length === 2) return params[1];
    return null;
  }

  getLocalStorage(): IStorageUserData {
    return localStorage.getItem('user_data') ? JSON.parse(localStorage.user_data) : null;
  }
}
