/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page } from 'playwright';
import type Ng from '@angular/core';
import type TestBed from '@angular/core/testing';
import type { TestModuleMetadata } from '@angular/core/testing';
import type { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import type DynamicTesting from '@angular/platform-browser-dynamic/testing';
import merge from 'deepmerge';

import { state } from './state';
import { render as renderCommon } from './render';
import { RenderOptions } from './get-page';
import { isInNode } from './is-in-node';

declare interface Type<T> extends Function {
  new (...args: any[]): T;
}
type Renderable = Type<any> | string;
interface RenderReturn {
  /** The Playwright page object of the rendered component. */
  page: Page;
  /** Pause current test. */
  pause: () => Promise<void>;
}

type RenderFn = {
  <
    API extends {
      [K: string]: (...args: any[]) => any;
    }
  >(
    elementToRender: (app: Renderable) => {
      element: Renderable;
      api: API;
    },
    options?: RenderOptions
  ): Promise<RenderReturnWithApi<API>>;
  (
    elementToRender: (app: Renderable) => any,
    options?: RenderOptions
  ): Promise<RenderReturn>;
  (elementToRender: Renderable, options?: RenderOptions): Promise<RenderReturn>;
};

interface RenderReturnWithApi<
  API extends { [K: string]: (...args: any[]) => any }
> extends RenderReturn {
  /** The API object to communicate with the rendered component */
  api: {
    // Strip off the `this` context on the node calling side.
    [K in keyof API]: (
      ...args: Parameters<API[K]>
    ) => ReturnType<API[K]> extends Promise<any>
      ? ReturnType<API[K]>
      : Promise<ReturnType<API[K]>>;
  };
}

interface MakeSafetestBedArguments<Components> {
  TestBed: typeof TestBed;
  ng: typeof Ng;
  dynamicTesting: typeof DynamicTesting;
  components?: Components;
}
interface SafetestBed<Components> {
  render: RenderFn;
  configure: (metadata: TestModuleMetadata) => Promise<void>;
  components: Components;
  makeComponent: <T>(template: string, Class: Type<T>) => Type<T>;
}
export const makeSafetestBed = async <Imports>(
  renderArgs: () => Promise<MakeSafetestBedArguments<Imports>>
): Promise<SafetestBed<Imports>> => {
  if (isInNode) {
    return {
      render: render as any,
      components: {} as any,
      configure: () => ({} as any),
      makeComponent: () => ({} as any),
    };
  }
  const resolvedArgs = await renderArgs();

  resolvedArgs.TestBed.TestBed.initTestEnvironment(
    resolvedArgs.dynamicTesting.BrowserDynamicTestingModule,
    resolvedArgs.dynamicTesting.platformBrowserDynamicTesting()
  );

  if (resolvedArgs.components) {
    await resolvedArgs.TestBed.TestBed.configureTestingModule({
      declarations: Object.values(resolvedArgs.components),
    }).compileComponents();
  }

  return {
    render: render as any,
    configure: async (metadata: TestModuleMetadata) => {
      await resolvedArgs.TestBed.TestBed.configureTestingModule(
        metadata
      ).compileComponents();
    },
    components: resolvedArgs.components ?? ({} as any),
    makeComponent: (template, Class) => {
      return resolvedArgs.ng.Component({
        selector: 'dummy-testing-component',
        template: template,
      })(Class);
    },
  };

  async function render<API>(
    ...args: Parameters<RenderFn>
  ): ReturnType<RenderFn> {
    let elementToRender = args[0];
    let options = args[1] ?? {};
    if (typeof process !== 'undefined' && process.env.PLAYWRIGHT_OPTIONS) {
      options = merge(
        JSON.parse(process.env.PLAYWRIGHT_OPTIONS) as RenderOptions,
        options
      );
    }

    let api: API = undefined as any;
    if (
      typeof elementToRender === 'function' &&
      !elementToRender?.prototype?.constructor?.name &&
      !elementToRender?.prototype?.constructor?.toString().startsWith('class')
    ) {
      const rendered =
        (elementToRender as any)(
          state.browserState?.renderElement.value ?? ({} as any)
        ) ?? {};
      if ('element' in rendered) {
        elementToRender = rendered.element;
        api = rendered.api;
      } else {
        elementToRender = rendered;
      }
    }

    return renderCommon(
      { __isRenderable: true, thing: elementToRender },
      api as any,
      options,
      async (e) => {
        if (typeof e.thing === 'string') {
          e.thing = resolvedArgs.ng.Component({
            selector: 'dummy-testing-component',
            template: e.thing,
          })(class {});
        }
        await resolvedArgs.TestBed.TestBed.configureTestingModule({
          declarations: [e.thing],
        }).compileComponents();
        const fixture = resolvedArgs.TestBed.TestBed.createComponent(e.thing);
        fixture.autoDetectChanges();
        await fixture.whenStable();
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
  };

  try {
    searchParams = new URLSearchParams(window.location.search);
  } catch (e) {}
  let testName = searchParams?.get('test_name');
  let testPath = searchParams?.get('test_path');
  let retryAttempt = 0;
  if (!testPath && !testName && (window as any).safetestApi) {
    ({ testPath, testName, retryAttempt } =
      (await (window as any).safetestApi?.('GET_INFO')) ?? {});
  }
  if (testName && testPath) {
    await args.import(testPath);
    state.browserState.retryAttempt = retryAttempt;
    state.tests[testName]();
  } else {
    args
      .platformBrowserDynamic()
      .bootstrapModule(args.Module)
      .catch((err) => console.error(err));
  }
};
