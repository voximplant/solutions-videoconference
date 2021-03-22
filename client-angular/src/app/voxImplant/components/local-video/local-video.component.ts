import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CurrentUserService } from '../../current-user.service';

@Component({
  selector: 'app-local-video',
  templateUrl: './local-video.component.html',
  styleUrls: ['./local-video.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LocalVideoComponent implements OnInit {
  constructor(public currentUserService: CurrentUserService) {}

  ngOnInit(): void {}
}
