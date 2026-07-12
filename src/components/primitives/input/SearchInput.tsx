"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { Input } from "./Input";

export type SearchInputProps = Omit<ComponentPropsWithoutRef<typeof Input>, "leadingIcon" | "type">;

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(props, ref) {
    return (
      <Input
        {...props}
        ref={ref}
        autoComplete="off"
        inputMode="search"
        leadingIcon="search"
        type="search"
      />
    );
  },
);

SearchInput.displayName = "SearchInput";
