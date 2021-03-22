import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataBusMessageType, DataBusService, ErrorId, Route } from '../../data-bus.service';
import { filter } from 'rxjs/operators';

import { UIService, UIState } from '../../ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private supportMessageTypes: DataBusMessageType[] = [
    DataBusMessageType.HideInviteForm,
    DataBusMessageType.ShowInviteForm,
  ];
  isLoading = false;
  states = UIState;
  isSidePanelOpen: boolean = false;
  private subscriptions: Subscription = new Subscription();
  constructor(public dataBusService: DataBusService, public uiService: UIService) {
    this.subscriptions.add(
      this.dataBusService.inner$
        .pipe(filter((message) => this.supportMessageTypes.includes(message.type)))
        .subscribe((message) => {
          switch (message.type) {
            case DataBusMessageType.ShowInviteForm:
              //inviteForm.classList.remove("hidden", "popup-view");
              break;
            case DataBusMessageType.HideInviteForm:
              //inviteForm.classList.add("hidden", "popup-view");
              break;
          }
        })
    );
  }

  ngOnInit() {
    this.isLoading = true;
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onClose($event: boolean) {
    this.isSidePanelOpen = false;
  }

  onSidePanelOpen($event: boolean) {
    this.isSidePanelOpen = !this.isSidePanelOpen;
  }
  errors = ErrorId;
  sendError(id: ErrorId) {
    this.dataBusService.sendError({
      id: id,
    });
  }
}
