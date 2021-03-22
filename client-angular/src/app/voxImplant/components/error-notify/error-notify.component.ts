import { Component, OnDestroy } from '@angular/core';
import { DataBusService, ErrorId, IErrorMessage } from '../../data-bus.service';
import { IIDClass } from '../../interfaces/IIDClass';
import { Subscription } from 'rxjs';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { createLogger } from '@core';

@Component({
  selector: 'app-error-notify',
  templateUrl: './error-notify.component.html',
  styleUrls: ['./error-notify.component.scss'],
  animations: [
    trigger('closeOpen', [
      transition(':enter', [
        style({
          top: '0%',
          transform: 'translateY(-110%) translateX(-50%)',
        }),
        animate(
          '0.5s',
          keyframes([
            style({
              top: '3%',
              transform: 'translateY(-50%) translateX(-50%)',
            }),
            style({
              top: '53%',
              transform: 'translateY(-50%) translateX(-50%)',
            }),
            style({
              top: '49%',
              transform: 'translateY(-50%) translateX(-50%)',
            }),
            style({
              top: '50%',
              transform: 'translateY(-50%) translateX(-50%)',
            }),
          ])
        ),
      ]),
      transition(':leave', [
        animate(
          '0.5s',
          style({
            top: '0%',
            transform: 'translateY(-110%) translateX(-50%)',
          })
        ),
      ]),
    ]),
  ],
})
export class ErrorNotifyComponent implements IIDClass, OnDestroy {
  readonly ID = 'ErrorNotify';
  text: string = 'Some error happens somewhere';
  defaultShowTimeMs: number = 300 * 1000;
  timeoutId: any;
  show: boolean = false;
  private logger = createLogger(this.ID);
  private subscriptions: Subscription = new Subscription();

  constructor(private dataBusService: DataBusService) {
    this.subscriptions.add(
      this.dataBusService.errorBus$.pipe().subscribe((e: IErrorMessage) => {
        this.text = e.description;
        this.logger.debug('error=', { e });
        switch (e.id) {
          case ErrorId.SDKError:
            if (!this.text) {
              this.text = marker('SDK error');
            }
            break;
          case ErrorId.BrowserIsNotSupported:
            if (!this.text) {
              this.text = marker('This browser is not supported');
            }
            break;
          case ErrorId.XMultipleLogin:
            if (!this.text) {
              this.text = marker('conference in another browser');
            }
            break;
          case ErrorId.ConnectionProblem:
            if (!this.text) {
              this.text = marker('Connection problem');
            }
            break;
          case ErrorId.OutOfMoney:
            if (!this.text) {
              this.text = marker('Payment Required');
            }
            break;
          case ErrorId.NoError:
            this.show = false;
            return;
        }

        let time = this.defaultShowTimeMs;
        if (e?.data?.showTime) {
          time = e.data.showTime;
        }

        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }
        this.show = true;
        this.timeoutId = setTimeout(() => {
          this.show = false;
        }, time);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onClickClose() {
    this.show = false;
  }
}
