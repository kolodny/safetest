import { Page } from 'playwright';
import type { TestModuleMetadata } from '@angular/core/testing';
import type TestBed from '@angular/core/testing';
import type DynamicTesting from '@angular/platform-browser-dynamic/testing';
import type { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { state } from './state';
import { RenderOptions, render as renderCommon } from './render';
import { Importer, bootstrap as bootstrapCommon } from './bootstrap';
import { isInNode } from './is-in-node';

type Ng = typeof import('@angular/core');

declare interface Type<T> extends Function {
  new (...args: any[]): T;
}
type Renderable = ((ng: Ng) => Promise<Type<any> | string>) | string;
interface RenderReturn {
  /** The Playwright page object of the rendered component. */
  page: Page;
  /** Pause current test. */
  pause: () => Promise<void>;
}

type RenderFn = {
  (elementToRender: Renderable, options?: RenderOptions): Promise<RenderReturn>;
  configure: (metadata: TestModuleMetadata) => void;
};

interface MakeSafetestBedArguments {
  DynamicTesting: Promise<typeof DynamicTesting>;
  Ng: Promise<typeof import('@angular/core')>;
  TestBed: Promise<typeof TestBed>;
  configure?: (ng: Ng) => Promise<TestModuleMetadata>;
}
interface SafetestBed {
  render: RenderFn;
}

export const makeSafetestBed = (
  renderArgs: () => MakeSafetestBedArguments
): SafetestBed => {
  if (isInNode) {
    (render as RenderFn).configure = () => {};
    return {
      render: render as any,
    };
  }

  const renderArgsValue = renderArgs();

  let actualNg: Ng | undefined = undefined;

  const ngPromise = renderArgsValue.Ng.then(async (ng) => {
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
      get: (_target, prop) => {
        if (!actualNg) throw new Error('ng can only be used within a test');
        return (actualNg as any)[prop as any];
      },
    }
  ) as any;

  let renderMeta: undefined | TestModuleMetadata = undefined;
  afterEach(() => (renderMeta = undefined));
  (render as RenderFn).configure = (meta) => (renderMeta = meta);

  return {
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
          ...((renderMeta || (await renderArgsValue.configure?.(ng))) ?? {}),
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

type BootstrapArgs = Importer & {
  Module: Type<any>;
  platformBrowserDynamic: typeof platformBrowserDynamic;
};

export const bootstrap = async (args: BootstrapArgs) => {
  state.browserState = {
    retryAttempt: 0,
    renderElement: { __type: 'renderElement', value: args.Module },
    renderContainer: { __type: 'renderContainer', value: undefined },
  };

  return bootstrapCommon({
    ...args,
    defaultRender: () =>
      args
        .platformBrowserDynamic()
        .bootstrapModule(args.Module)
        .catch((err) => console.error(err)),
  });
};
