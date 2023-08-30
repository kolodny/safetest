import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { TestBed } from '@angular/core/testing';

import { AppModule } from './app/app.module';

import { bootstrap } from 'safetest/ng';

const importer = (s: string) => import(`./${s}.module`);
const importer2 = (s: string) => import(`./${s}.safetest`);

// (window as any).render = render;
(window as any).importer = importer;
(window as any).importer2 = importer2;

// TestBed.configureTestingModule({
//   declarations: [],
// });

bootstrap({
  platformBrowserDynamic,
  import: (s) =>
    import(`${s.replace(/.*src/, '.').replace(/\.safetest$/, '')}.safetest`),
  Module: AppModule,
});

// platformBrowserDynamic()
//   .bootstrapModule(AppModule)
//   .catch((err) => console.error(err));
