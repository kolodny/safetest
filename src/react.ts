import { render as renderCommon, RenderOptions } from './render';
import { bootstrap as bootstrapCommon, Importer } from './bootstrap';
import { state } from './state';
import { isInNode } from './is-in-node';
import { configureCreateOverride } from 'react-override';
import React from 'react';

export { Override } from 'react-override';

export const createOverride = configureCreateOverride(false);

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
    async (e, c) => {
      const rendered = state.browserState!.renderFn!(e.thing, c as any);
      await new Promise((r) => setTimeout(r, 0));
      return rendered;
    }
  );
}

type BootstrapArgs = Importer & {
  element: React.ReactNode;
  container: HTMLElement | null;
  render: (e: React.ReactNode, c: HTMLElement) => void;
};

export const bootstrap = async (args: BootstrapArgs): Promise<void> => {
  state.browserState = {
    retryAttempt: 0,
    renderElement: { __type: 'renderElement', value: args.element },
    renderContainer: { __type: 'renderContainer', value: args.container },
    renderFn: args.render,
  };

  return bootstrapCommon({
    ...args,
    defaultRender: () =>
      state.browserState?.renderFn!(args.element, args.container!),
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
      container: null,
      element: props.children,
      render: (element) => setChild(element),
    });
  }, [props.children]);

  return child || props.children;
};
