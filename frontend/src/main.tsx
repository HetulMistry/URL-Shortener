import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import { validateProductionEnv } from "@/lib/env";
import "@/styles/globals.css";

validateProductionEnv();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
