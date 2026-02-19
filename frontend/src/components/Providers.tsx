"use client";

import * as React from "react";
// Removed RainbowKit import

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { config } from "@/lib/wagmi";
import { WalletSync } from "@/components/WalletSync";

import { GameSocketListener } from "@/components/GameSocketListener";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletSync />
        <GameSocketListener />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
