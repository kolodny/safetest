// import { Vue } from './safe-node-imports';
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page } from 'playwright';
import { createApp } from 'vue';
import merge from 'deepmerge';

import { state } from './state';
import { render as renderCommon } from './render';
import { RenderOptions } from './get-page';
import type { App, Component } from '@vue/runtime-core';

interface VueRenderOptions extends RenderOptions {
  /** Props passed to the Vue component to render */
  props?: Record<string, any>;
}

// For some reason if we import this from vue then `let app = <App />` in React code breaks. Fun!
type CreateAppFunction<HostElement> = (
  rootComponent: Component,
  rootProps?: Record<string, unknown> | null
) => App<HostElement>;

interface RenderReturn {
  /** The Playwright page object of the rendered component. */
  page: Page;
  /** Pause current test. */
  pause: () => Promise<void>;
}

type Renderable = Component;

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

export async function render<
  API extends { [K: string]: (...args: any[]) => any }
>(
  elementToRender: (app: Renderable) => { element: Renderable; api: API },
  options?: VueRenderOptions
): Promise<RenderReturnWithApi<API>>;
export async function render(
  elementToRender: (app: Renderable) => Renderable,
  options?: VueRenderOptions
): Promise<RenderReturn>;
export async function render(
  elementToRender: Renderable,
  options?: VueRenderOptions
): Promise<RenderReturn>;
export async function render<API>(
  elementToRender:
    | Renderable
    | ((app: Renderable) => Renderable | { element: Renderable; api: API }),
  options: VueRenderOptions = {}
): Promise<RenderReturn> {
  if (typeof process !== 'undefined' && process.env.PLAYWRIGHT_OPTIONS) {
    options = merge(
      JSON.parse(process.env.PLAYWRIGHT_OPTIONS) as RenderOptions,
      options
    );
  }

  let api: API = undefined as any;
  if (typeof elementToRender === 'function') {
    const rendered = (elementToRender as any)(
      state.browserState?.renderElement.value ?? ({} as any)
    );
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
    async (e, c) => createApp(e.thing, options.props).mount(c as any)
  );
}

type BootstrapElement<Element> = Parameters<CreateAppFunction<Element>>[0];

interface BootstrapArgs<Element> {
  import: (s: string) => Promise<any>;
  element: BootstrapElement<Element>;
  container: Element | string;
}

export const bootstrap = async <Element>(
  args: BootstrapArgs<Element>
): Promise<Component> => {
  let searchParams: URLSearchParams | undefined;
  state.browserState = {
    retryAttempt: 0,
    renderElement: { __type: 'renderElement', value: args.element },
    renderContainer: { __type: 'renderContainer', value: args.container },
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
    const app = createApp(args.element as any).mount(args.container as any);
    return app;
  }
  return {} as any;
};
