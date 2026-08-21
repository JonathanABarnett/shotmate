import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "./store/StoreProvider";
import App from "./App";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // offline support is a nice-to-have; the app works without it
    });
  });
}
