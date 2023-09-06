import { createApp } from 'vue';

import { state } from './state';
import { RenderOptions, render as renderCommon } from './render';
import { Importer, bootstrap as bootstrapCommon } from './bootstrap';
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

type Renderable = Component;

const defaultRender = (app: Renderable) => app;

export async function render(
  elementToRender:
    | Renderable
    | ((app: Renderable) => Renderable) = defaultRender,
  options: VueRenderOptions = {}
) {
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

type BootstrapArgs<Element> = Importer & {
  element: BootstrapElement<Element>;
  container: Element | string;
};

export const bootstrap = async <Element>(
  args: BootstrapArgs<Element>
): Promise<Component> => {
  state.browserState = {
    retryAttempt: 0,
    renderElement: { __type: 'renderElement', value: args.element },
    renderContainer: { __type: 'renderContainer', value: args.container },
  };

  return bootstrapCommon({
    ...args,
    defaultRender: () =>
      createApp(args.element as any).mount(args.container as any),
  });
};
