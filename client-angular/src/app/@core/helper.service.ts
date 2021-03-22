import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor() {}

  public static uuid() {
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
}
