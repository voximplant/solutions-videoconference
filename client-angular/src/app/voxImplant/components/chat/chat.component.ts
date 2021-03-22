import { Component, Input, OnInit } from '@angular/core';
import anchorme from 'anchorme';
import { IChatMessage } from '../../interfaces/IChatMessage';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  @Input() selfName: string;

  @Input() messages: IChatMessage[];

  getFormattedTime(message: IChatMessage) {
    return new Date(message.payload.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  constructor() {}

  ngOnInit(): void {}

  processAnchorMe(input: string) {
    return anchorme({
      input,
      // use some options
      options: {
        // any link that has with "google.com/search?"
        // will be truncated to 40 characters,
        // github links will not be truncated
        // other links will truncated to 10 characters
        truncate: 40,
        // characters will be taken out of the middle
        middleTruncation: true,
        attributes: {
          target: '_blank',
        },
      },
    });
  }
}
