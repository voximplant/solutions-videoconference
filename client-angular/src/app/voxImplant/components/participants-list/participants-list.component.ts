import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-participants-list',
  templateUrl: './participants-list.component.html',
  styleUrls: ['./participants-list.component.scss'],
})
export class ParticipantsListComponent implements OnInit, OnDestroy {
  @Input() participants: {
    id: string;
    displayName: string;
    isDefault: boolean;
  }[] = [];
  constructor() {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}
}
