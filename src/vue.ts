import { Page } from 'playwright';
import { createApp } from 'vue';

import { state } from './state';
import {
  RenderOptions,
  SAFETEST_INTERFACE,
  render as renderCommon,
} from './render';
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

const defaultRender = (app: Renderable) => app;

export async function render(
  elementToRender:
    | Renderable
    | ((app: Renderable) => Renderable) = defaultRender,
  options: VueRenderOptions = {}
): Promise<RenderReturn> {
  if (typeof elementToRender === 'function') {
    const rendered = (elementToRender as any)(
      state.browserState?.renderElement.value ?? ({} as any)
    );
    elementToRender = rendered;
  }

  return renderCommon(
    { __isRenderable: true, thing: elementToRender },
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
  if (!testPath && !testName && (window as any)[SAFETEST_INTERFACE]) {
    ({ testPath, testName, retryAttempt } =
      (await (window as any)[SAFETEST_INTERFACE]?.('GET_INFO')) ?? {});
  }
  if (testName && testPath) {
    await args.import(testPath);
    state.browserState.retryAttempt = retryAttempt;
    if (state.tests[testName]) state.tests[testName]!();
    else
      console.log(
        `Invalid test ${testName}, available tests: ${JSON.stringify(
          Object.keys(state.tests)
        )}`
      );
  } else {
    const app = createApp(args.element as any).mount(args.container as any);
    return app;
  }
  return {} as any;
};
