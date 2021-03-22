import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { merge, Subscription } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { environment } from '@env/environment';
import { createLogger, untilDestroyed } from '@core';
import { I18nService } from '@app/i18n';

const log = createLogger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translateService: TranslateService,
    private i18nService: I18nService
  ) {}
  private subscriptions: Subscription = new Subscription();
  ngOnInit() {
    // Setup logger

    log.debug('init');

    // Setup translations
    this.i18nService.init(environment.defaultLanguage, environment.supportedLanguages);

    const onNavigationEnd = this.router.events.pipe(filter((event) => event instanceof NavigationEnd));

    // Change page title on navigation or language change, based on route data
    this.subscriptions.add(
      merge(this.translateService.onLangChange, onNavigationEnd)
        .pipe(
          map(() => {
            let route = this.activatedRoute;
            while (route.firstChild) {
              route = route.firstChild;
            }
            return route;
          }),
          filter((route) => route.outlet === 'primary'),
          switchMap((route) => route.data),
          untilDestroyed(this)
        )
        .subscribe((event) => {
          const title = event.title;
          if (title) {
            this.titleService.setTitle(this.translateService.instant(title));
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.i18nService.destroy();
  }
}
