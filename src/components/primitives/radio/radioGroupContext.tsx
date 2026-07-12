"use client";

import { createContext, useContext, type ReactNode } from "react";

export type RadioGroupContextValue = {
  name: string;
  disabled: boolean;
  required: boolean;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function RadioGroupProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: RadioGroupContextValue;
}) {
  return <RadioGroupContext.Provider value={value}>{children}</RadioGroupContext.Provider>;
}

export function useOptionalRadioGroupContext() {
  return useContext(RadioGroupContext);
}
