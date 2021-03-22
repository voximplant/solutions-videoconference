import { Component, OnInit } from '@angular/core';
import { UIService } from '../../ui.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  constructor(public uiService: UIService) {}

  ngOnInit(): void {}
}
