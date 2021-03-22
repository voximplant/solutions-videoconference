import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '@env/environment';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { VoxImplantConferenceModule } from './voxImplant/vox-implant-conference.module';
import { ShellModule } from './shell/shell.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    CoreModule,
    SharedModule,
    ShellModule,
    VoxImplantConferenceModule,
    AppRoutingModule, // must be imported as the last module as it contains the fallback route
  ],
  declarations: [AppComponent],
  providers: [],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
