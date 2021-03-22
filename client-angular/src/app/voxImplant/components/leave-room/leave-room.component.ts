import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CurrentUserService } from '../../current-user.service';
import Axios from 'axios';
import { IIDClass } from '../../interfaces/IIDClass';
import { createLogger } from '@core';

@Component({
  selector: 'app-leave-room',
  templateUrl: './leave-room.component.html',
  styleUrls: ['./leave-room.component.scss'],
})
export class LeaveRoomComponent implements OnInit, IIDClass {
  readonly ID = 'LeaveRoomComponent';
  private logger = createLogger(this.ID);
  leaveForm: FormGroup;
  private phone_number: string = '';
  private full_name: string = '';
  private company_name: string = '';
  private job_title: string = '';
  private work_email: string = '';
  private country: string = '';

  @ViewChild('submitButton') submitButtonRef: ElementRef;
  isFormSent: boolean = false;

  constructor(currentUserService: CurrentUserService, private renderer: Renderer2) {
    this.full_name = currentUserService.name;
    this.work_email = currentUserService.email;
  }

  ngOnInit(): void {
    this.leaveForm = new FormGroup({
      phone_number: new FormControl(this.phone_number, Validators.required),
      full_name: new FormControl(this.full_name, Validators.required),
      company_name: new FormControl(this.company_name, Validators.required),
      job_title: new FormControl(this.job_title, Validators.required),
      work_email: new FormControl(this.work_email, [Validators.required, Validators.email]),
      country: new FormControl(this.country, Validators.required),
    });
  }

  onSubmit() {
    setTimeout(() => {
      this.logger.info('submit leave room');
      this.submitButtonRef.nativeElement.disabled = true;
      this.renderer.addClass(this.submitButtonRef.nativeElement, 'loading');
      let formData = this.leaveForm.getRawValue();
      Axios.post('', formData, {
        headers: { 'content-type': 'multipart/form-data' },
      })
        .then((resp) => {
          if (resp.data.result) {
            this.isFormSent = true;
            this.submitButtonRef.nativeElement.disabled = false;
            this.renderer.removeClass(this.submitButtonRef.nativeElement, 'loading');
          }
        })
        .catch((err) => {
          this.logger.error(err);
        });
    }, 0);
  }
}
