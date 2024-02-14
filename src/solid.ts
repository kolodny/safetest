import { render as renderCommon, RenderOptions } from './render';
import { bootstrap as bootstrapCommon, Importer } from './bootstrap';
import { state } from './state';
import { isInNode } from './is-in-node';
import { type Component, type JSXElement } from 'solid-js';
import type Solid from 'solid-js';

let renderFn: (element: () => JSXElement) => void;
const assertAndRender = (element: () => JSXElement) => {
  if (!renderFn) {
    throw new Error(
      'App is not bootstrapped, did you forget to call `bootstrap({ /* ... */ })`?'
    );
  }
  return renderFn(element);
};

export async function render(
  elementToRender: (app: JSXElement) => JSXElement = state.browserState
    ?.renderElement.value,
  options: RenderOptions = {}
) {
  if (!isInNode && typeof elementToRender === 'function') {
    const rendered = elementToRender(
      state.browserState?.renderElement.value ?? ({} as any)
    );
    elementToRender = rendered as any;
  }

  return renderCommon(
    { __isRenderable: true, thing: elementToRender },
    options,
    async (e) => {
      console.log(1);
      const rendered = assertAndRender(e.thing);
      await new Promise((r) => setTimeout(r, 0));
      return rendered;
    }
  );
}

type BootstrapArgs = Importer & {
  element: () => JSXElement;
  render: (e: () => JSXElement) => void;
};

export const bootstrap = async (args: BootstrapArgs): Promise<void> => {
  renderFn = args.render;
  state.browserState = {
    retryAttempt: 0,
    renderElement: { __type: 'renderElement', value: args.element },
  };

  console.log(2);
  return bootstrapCommon({
    ...args,
    defaultRender: () => {
      console.log('in 2');
      return assertAndRender(args.element);
    },
  });
};

export const Bootstrap: Component<
  {
    children: JSXElement;
    Solid: typeof Solid;
    /** Note that using this in SSR mode this will cause the page to start with the loading component before the page is ready. */
    loading?: JSXElement;
  } & Importer
> = (props) => {
  const Solid = props.Solid;
  const initial = props.loading ?? props.children;
  const [child, setChild] = Solid.createSignal<JSXElement>(initial);
  Solid.createRenderEffect(() => {
    bootstrap({
      ...props,
      element: () => props.children,
      render: (element) => setChild(element),
    });
  });

  return Solid.createMemo(
    () => child() ?? props.children
  ) as unknown as JSXElement;
};
