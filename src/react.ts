import { render as renderCommon, RenderOptions } from './render';
import { bootstrap as bootstrapCommon, Importer } from './bootstrap';
import { state } from './state';
import { isInNode } from './is-in-node';
import { configureCreateOverride } from 'react-override';
import React from 'react';

export { Override } from 'react-override';

export const createOverride = configureCreateOverride(false);

let renderFn: (element: React.ReactNode) => void;
const assertAndRender = (element: React.ReactNode) => {
  if (!renderFn) {
    throw new Error(
      'App is not bootstrapped, did you forget to call `bootstrap({ /* ... */ })`?'
    );
  }
  return renderFn(element);
};

export async function render(
  elementToRender:
    | React.ReactNode
    | ((app: React.ReactNode) => React.ReactNode) = state.browserState
    ?.renderElement.value,
  options: RenderOptions = {}
) {
  if (!isInNode && typeof elementToRender === 'function') {
    const rendered = elementToRender(
      state.browserState?.renderElement.value ?? ({} as any)
    );
    elementToRender = rendered;
  }

  return renderCommon(
    { __isRenderable: true, thing: elementToRender },
    options,
    async (e) => {
      const rendered = assertAndRender(e.thing);
      await new Promise((r) => setTimeout(r, 0));
      return rendered;
    }
  );
}

type BootstrapArgs = Importer & {
  element: React.ReactNode;
  render: (e: React.ReactNode) => void;
};

export const bootstrap = async (args: BootstrapArgs): Promise<void> => {
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

export const Bootstrap: React.FunctionComponent<
  React.PropsWithChildren<
    {
      /** Note that using this in SSR mode this will cause the page to start with the loading component before the page is ready. */
      loading?: React.ReactNode;
    } & Importer
  >
> = (props) => {
  const initial = props.loading ?? props.children;
  const [child, setChild] = React.useState<React.ReactNode>(initial);
  React.useLayoutEffect(() => {
    bootstrap({
      ...props,
      element: props.children,
      render: (element) => setChild(element),
    });
  }, [props.children]);

  return child || props.children;
};
