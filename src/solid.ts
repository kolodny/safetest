import { render as renderCommon, RenderOptions } from "./render";
import { bootstrap as bootstrapCommon, Importer } from "./bootstrap";
import { state } from "./state";
import { isInNode } from "./is-in-node";
import {
  createMemo,
  createRenderEffect,
  createSignal,
  JSXElement,
  Component,
} from "solid-js";

let renderFn: (element: JSXElement) => void;
const assertAndRender = (element: JSXElement) => {
  if (!renderFn) {
    throw new Error(
      "App is not bootstrapped, did you forget to call `bootstrap({ /* ... */ })`?"
    );
  }
  return renderFn(element);
};

export async function render(
  elementToRender: JSXElement | ((app: JSXElement) => JSXElement) = state
    .browserState?.renderElement.value,
  options: RenderOptions = {}
) {
  if (!isInNode && typeof elementToRender === "function") {
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
  element: JSXElement;
  render: (e: JSXElement) => void;
};

export const bootstrap = async (args: BootstrapArgs): Promise<void> => {
  renderFn = args.render;
  state.browserState = {
    retryAttempt: 0,
    renderElement: { __type: "renderElement", value: args.element },
  };

  return bootstrapCommon({
    ...args,
    defaultRender: () => assertAndRender(args.element),
  });
};

export const Bootstrap: Component<
  {
    children: JSXElement;
    /** Note that using this in SSR mode this will cause the page to start with the loading component before the page is ready. */
    loading?: JSXElement;
  } & Importer
> = (props) => {
  const initial = props.loading ?? props.children;
  const [child, setChild] = createSignal<JSXElement>(initial);
  createRenderEffect(() => {
    bootstrap({
      ...props,
      element: props.children,
      render: (element) => setChild(element),
    });
  });

  return createMemo(() => child() || props.children) as unknown as JSXElement;
};
