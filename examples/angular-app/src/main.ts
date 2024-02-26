import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule, HelloWorldModule } from './app/app.module';

import { bootstrap } from 'safetest/ng';

const importer = (s: string) => import(`./${s}.module`);
const importer2 = (s: string) => import(`./${s}.safetest`);

// (window as any).render = render;
(window as any).importer = importer;
(window as any).importer2 = importer2;

// TestBed.configureTestingModule({
//   declarations: [],
// });

const webpackContext = import.meta.webpackContext('.', {
  recursive: true,
  regExp: /\.safetest$/,
  mode: 'lazy',
});

const keys = webpackContext.keys();
webpackContext.keys = () => keys.filter((k) => k.startsWith('./'));

bootstrap({
  platformBrowserDynamic,
  webpackContext,
  Module: AppModule,
});

// platformBrowserDynamic()
//   .bootstrapModule(AppModule)
//   .catch((err) => console.error(err));
