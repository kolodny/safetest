/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page } from 'playwright';
import type { TestModuleMetadata } from '@angular/core/testing';
import type TestBed from '@angular/core/testing';
import type DynamicTesting from '@angular/platform-browser-dynamic/testing';
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
type Renderable = ((ng: Ng) => Promise<Type<any>>) | string;
interface RenderReturn {
  /** The Playwright page object of the rendered component. */
  page: Page;
  /** Pause current test. */
  pause: () => Promise<void>;
}

type RenderFn = {
  (elementToRender: Renderable, options?: RenderOptions): Promise<RenderReturn>;
};

interface MakeSafetestBedArguments {
  PlatformBrowser: Promise<typeof PlatformBrowser>;
  DynamicTesting: Promise<typeof DynamicTesting>;
  Ng: Promise<typeof import('@angular/core')>;
  TestBed: Promise<typeof TestBed>;
  configure?: (ng: Ng) => Promise<TestModuleMetadata>;
}
interface SafetestBed {
  render: RenderFn;
  ng: typeof import('@angular/core');
}
export const makeSafetestBed = (
  renderArgs: () => MakeSafetestBedArguments
): SafetestBed => {
  if (isInNode) {
    return {
      render: render as any,
      ng: anythingProxy,
    };
  }

  const renderArgsValue = renderArgs();

  const PlatformBrowser = renderArgsValue.PlatformBrowser;

  let actualNg: Ng | undefined = undefined;
  const ngPromise = import('@angular/core').then(async (ng) => {
    actualNg = ng;
    const { TestBed } = await renderArgsValue.TestBed;
    const DynamicTesting = await renderArgsValue.DynamicTesting;
    TestBed.initTestEnvironment(
      DynamicTesting.BrowserDynamicTestingModule,
      DynamicTesting.platformBrowserDynamicTesting()
    );
  });
  const ngProxy: Ng = new Proxy(
    {},
    {
      get: (target, prop) => {
        if (!actualNg) throw new Error('ng can only be used within a test');
        return (actualNg as any)[prop as any];
      },
    }
  ) as any;

  return {
    ng: ngProxy as any,
    render: render as any,
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
        const ng = await renderArgsValue.Ng;
        const rendered =
          typeof elementToRender === 'function'
            ? (elementToRender as any)(ng) ?? {}
            : elementToRender;
        elementToRender = await rendered;
      }
    }

    return renderCommon(
      { __isRenderable: true, thing: elementToRender },
      options,
      async (e) => {
        await ngPromise;
        // await new Promise((r) => setTimeout(r, 100));
        const ng = await renderArgsValue.Ng;
        const { TestBed } = await renderArgsValue.TestBed;
        lastRendered?.destroy();
        if (typeof e.thing === 'string') {
          e.thing = ng.Component({ template: e.thing })(class {});
        }

        const metadata: TestModuleMetadata = {
          ...((await renderArgsValue.configure?.(ng)) ?? {}),
        };
        if (!metadata.declarations) metadata.declarations = [];
        metadata.declarations.push(e.thing);

        await TestBed.configureTestingModule(metadata).compileComponents();

        const fixture = TestBed.createComponent(e.thing);
        lastRendered = fixture;
        fixture.autoDetectChanges();
        await fixture.whenStable();
      }
    );
  }
};
let lastRendered: TestBed.ComponentFixture<unknown> | undefined = undefined;

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
