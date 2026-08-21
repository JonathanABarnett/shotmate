import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { AppData } from "../types";
import { reducer, type Action } from "./reducer";
import { loadStoredData, saveStoredData } from "./persistence";

/** Stamp every local change so sync can tell which side is newer; synced-in data keeps its own stamp. */
function stampedReducer(state: AppData, action: Action): AppData {
  const next = reducer(state, action);
  if (next === state || action.type === "replaceFromSync") return next;
  return { ...next, updatedAt: Date.now() };
}

interface StoreValue {
  data: AppData;
  dispatch: (action: Action) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(stampedReducer, undefined, loadStoredData);

  useEffect(() => {
    saveStoredData(data);
  }, [data]);

  const value = useMemo(() => ({ data, dispatch }), [data]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
