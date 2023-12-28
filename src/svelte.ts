import type { SvelteComponent } from 'svelte';
import { Page } from 'playwright';

import { state } from './state';
import { RenderOptions, render as renderCommon } from './render';
import { Importer, bootstrap as bootstrapCommon } from './bootstrap';

interface RenderReturn {
  /** The Playwright page object of the rendered component. */
  page: Page;
  /** Pause current test. */
  pause: () => Promise<void>;
}

type Renderable = typeof SvelteComponent;

let renderFn: (element: Renderable) => Promise<SvelteComponent>;
const assertAndRender = (element: Renderable) => {
  if (!renderFn) {
    throw new Error(
      'App is not bootstrapped, did you forget to call `bootstrap({ /* ... */ })`?'
    );
  }
  return renderFn(element);
};

export async function render(
  elementToRender: Renderable | ((app: Renderable) => Renderable),
  options: RenderOptions = {}
): Promise<RenderReturn> {
  if (
    typeof elementToRender === 'function' &&
    !elementToRender?.prototype?.constructor?.name &&
    !elementToRender?.prototype?.constructor?.toString().startsWith('class')
  ) {
    const rendered = (elementToRender as any)(
      state.browserState?.renderElement.value ?? ({} as any)
    );
    elementToRender = rendered;
  }

  return renderCommon(
    { __isRenderable: true, thing: elementToRender },
    options,
    async (e) => assertAndRender(e.thing)
  );
}

type BootstrapArgs = Importer & {
  element: typeof SvelteComponent;
  render: (e: Renderable) => Promise<SvelteComponent>;
};

export const bootstrap = async (
  args: BootstrapArgs
): Promise<SvelteComponent> => {
  renderFn = args.render;
  state.browserState = {
    retryAttempt: 0,
    renderElement: { __type: 'renderElement', value: args.element },
  };

  return bootstrapCommon({
    ...args,
    defaultRender: () => assertAndRender(args.element),
  });
};
