import { useEffect } from "react";
import type { ThemePref } from "../types";

/** Stamp the resolved theme on <html>; "auto" follows the OS and tracks changes live. */
export function useTheme(pref: ThemePref) {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = pref === "auto" ? (mq.matches ? "dark" : "light") : pref;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [pref]);
}
