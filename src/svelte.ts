import type { SvelteComponent } from 'svelte';
import { Page } from 'playwright';

import { state } from './state';
import {
  RenderOptions,
  SAFETEST_INTERFACE,
  render as renderCommon,
} from './render';
import { bootstrap as bootstrapCommon } from './bootstrap';

interface RenderReturn {
  /** The Playwright page object of the rendered component. */
  page: Page;
  /** Pause current test. */
  pause: () => Promise<void>;
}

type Renderable = typeof SvelteComponent;

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
    async (e, c) => new e.thing(c)
  );
}

type BootstrapOptions = ConstructorParameters<typeof SvelteComponent>[0];

interface BootstrapArgs {
  import: (s: string) => Promise<any>;
  element: typeof SvelteComponent;
  options: BootstrapOptions;
}

export const bootstrap = async (
  args: BootstrapArgs
): Promise<SvelteComponent> => {
  state.browserState = {
    retryAttempt: 0,
    renderElement: { __type: 'renderElement', value: args.element },
    renderContainer: { __type: 'renderContainer', value: args.options },
  };

  return bootstrapCommon({
    import: args.import,
    defaultRender: () => new args.element(args.options),
  });
};