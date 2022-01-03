import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { bootstrap } from 'safetest/ng';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { importMap } from './import-map';

if (environment.production) {
  enableProdMode();
}

bootstrap({
  platformBrowserDynamic,
  import: (s) => (importMap as any)[s](),
  Module: AppModule,
});
