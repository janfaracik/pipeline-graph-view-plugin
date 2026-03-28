import { createRoot } from "react-dom/client";

const rootElement = document.querySelectorAll(
  '[data-type="pipeline-graph-host"]'
);

rootElement.forEach((element) => {
  const root = createRoot(element);
  root.render(<h1>Hello</h1>);
})
