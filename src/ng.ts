/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page } from 'playwright';
import type { TestModuleMetadata } from '@angular/core/testing';
// import type DynamicTesting from '@angular/platform-browser-dynamic/testing';
import type * as PlatformBrowser from '@angular/platform-browser';
import type { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { state } from './state';
import {
  RenderOptions,
  SAFETEST_INTERFACE,
  render as renderCommon,
} from './render';
import { isInNode } from './is-in-node';
import { anythingProxy } from './anythingProxy';

type Ng = typeof import('@angular/core');

declare interface Type<T> extends Function {
  new (...args: any[]): T;
}
type Renderable = () => Promise<Type<any>>;
interface RenderReturn {
  /** The Playwright page object of the rendered component. */
  page: Page;
  /** Pause current test. */
  pause: () => Promise<void>;
}

type RenderFn = {
  (elementToRender: Renderable, options?: RenderOptions): Promise<RenderReturn>;
};

interface MakeSafetestBedArguments<Components> {
  PlatformBrowser: Promise<typeof PlatformBrowser>;
  components?: Components;
}
interface SafetestBed<Components> {
  render: RenderFn;
  components: Components;
  ng: typeof import('@angular/core');
  // makeComponent: <T>(template: string, Class: Type<T>) => Type<T>;
}
export const makeSafetestBed = <Imports>(
  renderArgs: () => MakeSafetestBedArguments<Imports>
): SafetestBed<Imports> => {
  if (isInNode) {
    return {
      render: render as any,
      components: {} as any,
      ng: anythingProxy,
      // makeComponent: () => ({} as any),
    };
  }

  const args = renderArgs();

  const PlatformBrowser = args.PlatformBrowser;

  const ngPromise = import('@angular/core');
  let actualNg: Ng | undefined = undefined;
  ngPromise.then((ng) => {
    actualNg = ng;
  });
  const ng: Ng = new Proxy(
    {},
    {
      get: (target, prop) => {
        if (!actualNg) throw new Error('ng can only be used within a test');
        return (actualNg as any)[prop as any];
      },
    }
  ) as any;

  return {
    ng,
    render: render as any,
    components: args.components ?? ({} as any),
    // makeComponent: (template, Class) => {
    //   return ng.Component({
    //     selector: 'dummy-testing-component',
    //     template: template,
    //   })(Class);
    // },
  };

  async function render(...args: Parameters<RenderFn>): ReturnType<RenderFn> {
    let elementToRender = args[0];
    let options = args[1] ?? {};

    if (!isInNode) {
      if (
        typeof elementToRender === 'string' ||
        (typeof elementToRender === 'function' &&
          !elementToRender?.prototype?.constructor?.name)
      ) {
        const rendered =
          typeof elementToRender === 'function'
            ? (elementToRender as any)(
                state.browserState?.renderElement.value ?? ({} as any)
              ) ?? {}
            : elementToRender;
        elementToRender = await rendered;

        const Browser = isInNode ? {} : (await PlatformBrowser).BrowserModule;

        const isModule =
          typeof elementToRender === 'function' && 'ɵmod' in elementToRender;

        if (typeof elementToRender === 'string') {
          const error = () => {
            throw new Error('string not supported yet');
          };
          error();

          const TestComponent = ng.Component({
            selector: 'app-root',
            template: elementToRender,
          })(class TestComponent {});
          elementToRender = ng.NgModule({
            declarations: [TestComponent],
            imports: [Browser as any],
            providers: [],
            bootstrap: [TestComponent],
          })(class TestModule {}) as any;
        } else if (!isModule) {
          elementToRender = ng.NgModule({
            declarations: [elementToRender as any],
            imports: [Browser as any],
            providers: [],
            bootstrap: [elementToRender as any],
          })(class TestModule {}) as any;
        } else {
        }
      }
    }

    return renderCommon(
      { __isRenderable: true, thing: elementToRender },
      options,
      async (e) => {
        const ng = await import('@angular/core');
        if (typeof e.thing === 'string') {
          e.thing = ng.Component({
            selector: 'dummy-testing-component',
            template: e.thing,
          })(class {});
        }
        // const TestBed = await TestBedPromise;
        // await TestBed.configureTestingModule({
        //   declarations: [e.thing],
        // }).compileComponents();
        // const fixture = TestBed.createComponent(e.thing);
        // fixture.autoDetectChanges();
        // await fixture.whenStable();
        state.browserState?.renderFn?.(e.thing);
      }
    );
  }
};

interface BootstrapArgs {
  import: (s: string) => Promise<any>;
  platformBrowserDynamic: typeof platformBrowserDynamic;
  Module: Type<any>;
}

export const bootstrap = async (args: BootstrapArgs): Promise<void> => {
  let searchParams: URLSearchParams | undefined;
  state.browserState = {
    retryAttempt: 0,
    renderElement: { __type: 'renderElement', value: args.Module },
    renderContainer: { __type: 'renderContainer', value: undefined },
    renderFn: (Module: Type<any>) =>
      args
        .platformBrowserDynamic()
        .bootstrapModule(Module)
        .catch((err) => console.error(err)),
  };

  try {
    searchParams = new URLSearchParams(window.location.search);
  } catch (e) {}
  let testName = searchParams?.get('test_name');
  let testPath = searchParams?.get('test_path');
  let retryAttempt = 0;

  if (!testPath && !testName && (window as any)[SAFETEST_INTERFACE]) {
    ({ testPath, testName, retryAttempt } =
      (await (window as any)[SAFETEST_INTERFACE]?.('GET_INFO')) ?? {});
  }
  if (testName && testPath) {
    await args.import(testPath);
    state.browserState.retryAttempt = retryAttempt;
    state.tests[testName]?.();
  } else {
    args
      .platformBrowserDynamic()
      .bootstrapModule(args.Module)
      .catch((err) => console.error(err));
  }
};
