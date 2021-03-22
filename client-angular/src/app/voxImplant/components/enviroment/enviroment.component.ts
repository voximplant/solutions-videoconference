import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataBusMessageType, DataBusService } from '../../data-bus.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-enviroment',
  templateUrl: './enviroment.component.html',
  styleUrls: ['./enviroment.component.scss'],
})
export class EnviromentComponent implements OnInit, OnDestroy {
  @ViewChild('soundAdd', { static: true }) soundAdd: ElementRef;
  @ViewChild('soundRemove', { static: true }) soundRemove: ElementRef;
  private subscriptions: Subscription = new Subscription();
  constructor(public dataBusService: DataBusService) {
    this.subscriptions.add(
      this.dataBusService.inner$
        .pipe(
          filter(
            (message) =>
              message.type === DataBusMessageType.EndpointAdded || message.type === DataBusMessageType.EndpointRemoved
          )
        )
        .subscribe((message) => {
          switch (message.type) {
            case DataBusMessageType.EndpointAdded:
              (this.soundAdd.nativeElement as HTMLAudioElement).play();
              break;
            case DataBusMessageType.EndpointRemoved:
              (this.soundRemove.nativeElement as HTMLAudioElement).play();
              break;
          }
        })
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
