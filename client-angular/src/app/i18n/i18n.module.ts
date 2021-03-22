import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { LanguageSelectorComponent } from './language-selector.component';

@NgModule({
  imports: [CommonModule, TranslateModule],
  declarations: [LanguageSelectorComponent],
  exports: [LanguageSelectorComponent],
})
export class I18nModule {}
