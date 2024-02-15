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
  elementToRender: (app: () => JSXElement) => JSXElement = state.browserState
    ?.renderElement.value,
  options: RenderOptions = {}
) {
  let functionToRender: () => JSXElement = () => null;
  if (!isInNode) {
    functionToRender = () =>
      elementToRender(
        () => state.browserState?.renderElement.value ?? ({} as any)
      );
  }

  return renderCommon(
    { __isRenderable: true, thing: functionToRender },
    options,
    async (e) => {
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

  return bootstrapCommon({
    ...args,
    defaultRender: () => {
      return assertAndRender(args.element);
    },
  });
};

export const Bootstrap: Component<
  {
    children: JSXElement;
    Solid: Pick<
      typeof Solid,
      'createRenderEffect' | 'createSignal' | 'createMemo'
    >;
    /** Note that using this in SSR mode this will cause the page to start with the loading component before the page is ready. */
    loading?: JSXElement;
  } & Importer
> = (props) => {
  const Solid = props.Solid;
  const initial = () => props.loading ?? props.children;
  const [child, setChild] = Solid.createSignal<Component>(initial);
  Solid.createRenderEffect(() => {
    bootstrap({
      ...props,
      element: () => props.children,
      render: (element) => setChild(() => element),
    });
  });

  return Solid.createMemo(
    () => child()({}) ?? props.children
  ) as unknown as JSXElement;
};
