import { Inject, Injectable } from '@angular/core';
import { DataBusMessageType, DataBusService, Route } from './data-bus.service';
import { DOCUMENT } from '@angular/common';
import { IIDClass } from './interfaces/IIDClass';
import * as screenfull from 'screenfull';

@Injectable()
export class FullScreenService implements IIDClass {
  readonly ID = 'FullScreenService';

  constructor(private dataBusService: DataBusService, @Inject(DOCUMENT) private document: Document) {}

  get isFullScreen(): boolean {
    if (screenfull.isEnabled) {
      return screenfull.isFullscreen;
    }
    return undefined;
  }

  toggleFullScreen(el: HTMLElement, removeStyle: boolean = false) {
    if (!el) return false;
    if (screenfull.isEnabled) {
      if (screenfull.isFullscreen) {
        screenfull.exit().then(() => {
          //this.document.exitFullscreen().then(() => {
          this.dataBusService.send({
            data: undefined,
            route: [Route.Inner],
            sign: this.ID,
            type: DataBusMessageType.FullScreenStopped,
          });
        });
      } else {
        screenfull.request(el).then(() => {
          if (removeStyle) {
            el.removeAttribute('style');
          }
          this.dataBusService.send({
            data: undefined,
            route: [Route.Inner],
            sign: this.ID,
            type: DataBusMessageType.FullScreenStarted,
          });
        });
      }
    }
  }
}
