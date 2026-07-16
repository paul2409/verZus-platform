"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type IntelEntityType = "player" | "crew" | "match" | "crewWar";

export type OpenIntelRequest = {
  type: IntelEntityType;
  id: string;
  label?: string;
};

type IntelCardContextValue = {
  open: boolean;
  request: OpenIntelRequest | null;
  openIntel: (request: OpenIntelRequest) => void;
  closeIntel: () => void;
};

const IntelCardContext = createContext<IntelCardContextValue | null>(null);

export function IntelCardProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<OpenIntelRequest | null>(null);

  const openIntel = useCallback((next: OpenIntelRequest) => {
    setRequest(next);
  }, []);

  const closeIntel = useCallback(() => {
    setRequest(null);
  }, []);

  const value = useMemo(
    () => ({
      open: request !== null,
      request,
      openIntel,
      closeIntel,
    }),
    [request, openIntel, closeIntel],
  );

  return <IntelCardContext.Provider value={value}>{children}</IntelCardContext.Provider>;
}

export function useIntelCard(): IntelCardContextValue {
  const context = useContext(IntelCardContext);

  if (!context) {
    throw new Error("useIntelCard must be used within IntelCardProvider");
  }

  return context;
}
