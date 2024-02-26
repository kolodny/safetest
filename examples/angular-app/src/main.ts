import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule, HelloWorldModule } from './app/app.module';

import { bootstrap } from 'safetest/ng';

const webpackContext = import.meta.webpackContext('.', {
  recursive: true,
  regExp: /\.safetest$/,
  mode: 'lazy',
});

const keys = webpackContext.keys();
webpackContext.keys = () => keys.filter((k) => k.startsWith('.'));

bootstrap({
  platformBrowserDynamic,
  webpackContext,
  Module: AppModule,
});

// platformBrowserDynamic()
//   .bootstrapModule(AppModule)
//   .catch((err) => console.error(err));
