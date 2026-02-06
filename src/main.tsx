import * as React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

import App from "./app";

import "./index.css";

const rootEl = document.getElementById("root");

import ErrorBoundary from "./components/ErrorBoundary";

// Render react app
ReactDOM.createRoot(rootEl!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Toaster
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: { background: "#050816", opacity: 0.95 },
        }}
      />
      <App />
      <Analytics />
    </ErrorBoundary>
  </React.StrictMode>,
);
