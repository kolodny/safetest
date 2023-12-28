import { state } from './state';
import { RenderOptions, render as renderCommon } from './render';
import { Importer, bootstrap as bootstrapCommon } from './bootstrap';
import type {
  App,
  Component,
  ComponentPublicInstance,
} from '@vue/runtime-core';

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

let renderFn: (element: Renderable) => Promise<ComponentPublicInstance>;
const assertAndRender = (element: Renderable) => {
  if (!renderFn) {
    throw new Error(
      'App is not bootstrapped, did you forget to call `bootstrap({ /* ... */ })`?'
    );
  }
  return renderFn(element);
};

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
    async (e) => assertAndRender(e.thing) // createApp(e.thing, options.props).mount(c as any)
  );
}

type BootstrapElement<Element> = Parameters<CreateAppFunction<Element>>[0];

type BootstrapArgs<Element> = Importer & {
  element: BootstrapElement<Element>;
  container: Element | string;
  render: (e: Renderable) => Promise<ComponentPublicInstance>;
};

export const bootstrap = async <Element>(
  args: BootstrapArgs<Element>
): Promise<Component> => {
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
