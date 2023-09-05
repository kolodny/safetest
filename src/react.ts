import { render as renderCommon, RenderOptions } from './render';
import { bootstrap as bootstrapCommon } from './bootstrap';
import { state } from './state';

export * from 'react-override';

export async function render(
  elementToRender: JSX.Element | ((app: JSX.Element) => JSX.Element) = state
    .browserState?.renderElement.value,
  options: RenderOptions = {}
) {
  if (typeof elementToRender === 'function') {
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

interface BootstrapArgs {
  import: (s: string) => Promise<any>;
  element: JSX.Element;
  container: HTMLElement | null;
  render: (e: JSX.Element, c: HTMLElement) => { unmount: () => void };
}

export const bootstrap = async (args: BootstrapArgs): Promise<void> => {
  let searchParams: URLSearchParams | undefined;
  state.browserState = {
    retryAttempt: 0,
    renderElement: { __type: 'renderElement', value: args.element },
    renderContainer: { __type: 'renderContainer', value: args.container },
    renderFn: args.render,
  };

  return bootstrapCommon({
    import: args.import,
    defaultRender: () =>
      state.browserState?.renderFn!(args.element, args.container!),
  });
};
