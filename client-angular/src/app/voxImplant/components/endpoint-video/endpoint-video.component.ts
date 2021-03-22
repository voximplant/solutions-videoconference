import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FullScreenService } from '../../full-screen.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DataBusMessageType, DataBusService, IMuteMessage } from '../../data-bus.service';

@Component({
  selector: 'app-endpoint-video',
  templateUrl: './endpoint-video.component.html',
  styleUrls: ['./endpoint-video.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EndpointVideoComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private subscribeToTypes: DataBusMessageType[] = [
    DataBusMessageType.Mute,
    DataBusMessageType.FullScreenStarted,
    DataBusMessageType.FullScreenStopped,
  ];
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private fullScreenService: FullScreenService,
    private dataBusService: DataBusService,
    private renderer: Renderer2
  ) {
    this.subscriptions.add(
      this.dataBusService.inward$
        .pipe(filter((message) => this.subscribeToTypes.includes(message.type)))
        .subscribe((message) => {
          switch (message.type) {
            case DataBusMessageType.Mute:
              {
                if ((<IMuteMessage>message).data.endpointId === this.id) {
                  this.isMicrophoneMuted = !!(<IMuteMessage>message).data.value;
                }
              }
              break;

            case DataBusMessageType.FullScreenStopped:
              this.renderer.setAttribute(this.theElementRef.nativeElement, 'style', this.attribute);
              break;

            case DataBusMessageType.FullScreenStarted:
              this.renderer.removeAttribute(this.theElementRef.nativeElement, 'style');
              break;
          }
        })
    );
  }

  @Input() id: string;
  @Input() name: string;
  //template.content.querySelector('.js__endpoint').style.order = place;
  @Input() place: string;

  @ViewChild('theElement') theElementRef: ElementRef;
  isMicrophoneMuted: boolean = false;

  ngOnInit(): void {}

  attribute: any;
  toggleFullScreen() {
    let el: HTMLElement = this.theElementRef.nativeElement;
    if (!this.fullScreenService.isFullScreen) {
      // take style out of the element - fix Safari issue
      this.attribute = el.getAttribute('style');
      this.renderer.removeAttribute(el, 'style');
    } else {
      this.renderer.setAttribute(el, 'style', this.attribute);
    }
    // to prevent race also ask to remove style in fullScreenService
    this.fullScreenService.toggleFullScreen(el, true);
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
