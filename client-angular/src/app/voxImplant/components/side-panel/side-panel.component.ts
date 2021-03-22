import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IChatMessage } from '../../interfaces/IChatMessage';
import { IParticipant } from '../../interfaces/IParticipant';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
})
export class SidePanelComponent implements OnInit {
  isPeopleShow: boolean = true;

  @Input() selfName: string;

  @Input() messages: IChatMessage[];

  @Output() closePanelEmitter: EventEmitter<boolean> = new EventEmitter();

  @Output() chatMessage: EventEmitter<string> = new EventEmitter();

  @Input() participants: IParticipant[] = [];

  onClickClose() {
    this.closePanelEmitter.emit(true);
  }

  constructor() {}

  ngOnInit(): void {}

  sendChatMessage(value: string) {
    this.chatMessage.emit(value);
  }
}
