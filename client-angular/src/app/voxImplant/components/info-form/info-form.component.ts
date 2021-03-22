import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IIDClass } from '../../interfaces/IIDClass';
import { createLogger } from '@core';
import { CurrentUserService } from '../../current-user.service';
import { UIService } from '../../ui.service';

@Component({
  selector: 'app-info-form',
  templateUrl: './info-form.component.html',
  styleUrls: ['./info-form.component.scss'],
})
export class InfoFormComponent implements OnInit, IIDClass {
  readonly ID = 'InfoFormComponent';
  private logger = createLogger(this.ID);
  infoForm: FormGroup;
  constructor(private userService: CurrentUserService, private uiService: UIService) {}

  ngOnInit(): void {
    this.infoForm = new FormGroup({
      userName: new FormControl(this.userService.name, Validators.required),
      userEmail: new FormControl(this.userService.email, [Validators.email]),
      serviceId: new FormControl(this.userService.serviceId, [Validators.required, Validators.pattern('[0-9]{5,10}')]),
    });
  }

  submit(event: Event) {
    event.preventDefault();
    this.logger.info('form', { myForm: this.infoForm });
    this.uiService.onJoin(this.infoForm.value.serviceId, this.infoForm.value.userEmail, this.infoForm.value.userName);
  }
}
