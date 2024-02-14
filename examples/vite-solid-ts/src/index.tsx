import { render } from "solid-js/web";
import * as safetestSolid from "safetest/solid";
console.log(safetestSolid);
// import { Bootstrap } from "safetest/solid";

import { TodoList as App } from "./todo-list";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

render(
  () => (
    <safetestSolid.Bootstrap
      importGlob={
        import.meta.env.DEV && import.meta.glob("./**/*.safetest.{j,t}s{,x}")
      }
    >
      <App />
    </safetestSolid.Bootstrap>
  ),
  root!
);
