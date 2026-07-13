"use client";

import { createContext, useContext, type ReactNode } from "react";

export type FormFieldContextValue = {
  controlId: string;
  describedBy: string | undefined;
  disabled: boolean;
  invalid: boolean;
  required: boolean;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export type FormFieldProviderProps = {
  children: ReactNode;
  value: FormFieldContextValue;
};

export function FormFieldProvider({ children, value }: FormFieldProviderProps) {
  return <FormFieldContext.Provider value={value}>{children}</FormFieldContext.Provider>;
}

export function useOptionalFormFieldContext() {
  return useContext(FormFieldContext);
}
