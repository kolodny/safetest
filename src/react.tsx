/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page } from 'playwright';
import merge from 'deepmerge';

import { state } from './state';
import { render as renderCommon } from './render';
import { RenderOptions } from './get-page';

import { render as reactRender } from 'react-dom';

interface RenderReturn {
  /** The Playwright page object of the rendered component. */
  page: Page;
  /** Pause current test. */
  pause: () => Promise<void>;
}

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
  elementToRender: (app: JSX.Element) => { element: JSX.Element; api: API },
  options?: RenderOptions
): Promise<RenderReturnWithApi<API>>;
export async function render(
  elementToRender: (app: JSX.Element) => JSX.Element,
  options?: RenderOptions
): Promise<RenderReturn>;
export async function render(
  elementToRender: JSX.Element,
  options?: RenderOptions
): Promise<RenderReturn>;
export async function render<API>(
  elementToRender:
    | JSX.Element
    | ((app: JSX.Element) => JSX.Element | { element: JSX.Element; api: API }),
  options: RenderOptions = {}
): Promise<RenderReturn> {
  if (typeof process !== 'undefined' && process.env.PLAYWRIGHT_OPTIONS) {
    options = merge(
      JSON.parse(process.env.PLAYWRIGHT_OPTIONS) as RenderOptions,
      options
    );
  }

  let api: API = undefined as any;
  if (typeof elementToRender === 'function') {
    const rendered = elementToRender(
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
    async (e, c) => reactRender(e.thing, c as any)
  );
}

interface BootstrapArgs {
  import: (s: string) => Promise<any>;
  element: JSX.Element;
  container: HTMLElement | null;
}

export const bootstrap = async (args: BootstrapArgs): Promise<void> => {
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
    reactRender(args.element, args.container);
  }
};
