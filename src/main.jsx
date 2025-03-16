import * as ort from "onnxruntime-web";

// Set the wasm path globally BEFORE any vad-react usage
ort.env.wasm.wasmPaths = "/wasm/";

import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
