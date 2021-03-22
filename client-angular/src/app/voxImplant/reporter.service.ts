import { Injectable, OnDestroy } from '@angular/core';
import { createLogger } from '@core';
import { DataBusMessageType, DataBusService, INotifyStatusMessage } from './data-bus.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IIDClass } from './interfaces/IIDClass';

declare const callReporter: (
  currentConf: any,
  name: string,
  serviceId: string,
  uuid: string
) => {
  stopSharingScreen: () => void;
  sendVideo: () => void;
  stopSendVideo: () => void;
  shareScreen: (a: boolean, b: boolean) => void;
};

@Injectable()
export class ReporterService implements OnDestroy, IIDClass {
  readonly ID: string = 'ReporterService';

  private logger = createLogger(this.ID);
  private reporter: any;

  private subscribeToTypes = [
    DataBusMessageType.CameraToggled,
    DataBusMessageType.ShareScreenStarted,
    DataBusMessageType.ShareScreenStopped,
  ];
  private subscriptions: Subscription = new Subscription();
  constructor(private dataBusService: DataBusService) {}

  public init(currentConf: any, name: string, serviceId: string, uuid: string) {
    this.logger.info('initialized');
    if (!this.reporter) {
      this.reporter = callReporter(currentConf, name, serviceId, uuid);

      this.subscriptions.add(
        this.dataBusService.inner$
          .pipe(filter((message) => this.subscribeToTypes.includes(message.type)))
          .subscribe((message) => {
            this.logger.info('handle', message.type);
            switch (message.type) {
              case DataBusMessageType.CameraToggled:
                if (message.data.cameraEnabled) {
                  this.reporter.sendVideo();
                } else {
                  this.reporter.stopSendVideo();
                }
                break;

              case DataBusMessageType.ShareScreenStarted:
                this.reporter.shareScreen(true, true);
                break;

              case DataBusMessageType.ShareScreenStopped:
                this.reporter.stopSharingScreen();
                break;
            }
          })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
