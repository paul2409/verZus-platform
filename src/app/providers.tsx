"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { IntelCardOverlayHost, IntelCardProvider } from "@/components/primitives/intel-card";
import { createQueryClient } from "@/lib/query/create-query-client";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <IntelCardProvider>
        {children}
        <IntelCardOverlayHost />
      </IntelCardProvider>
    </QueryClientProvider>
  );
}
