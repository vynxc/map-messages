import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App.tsx";
import "./index.css";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class">
      <ConvexProvider client={convex}>
        <ConvexQueryCacheProvider>
          <App />
        </ConvexQueryCacheProvider>
      </ConvexProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

