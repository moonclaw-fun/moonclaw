"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useGameStore } from "@/lib/store";
import { useQueryClient } from "@tanstack/react-query";
import {
  useFindById,
  useCreate,
  getFindByIdQueryKey,
} from "@/services/queries";

export function WalletSync() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { wallet } = useGameStore();

  // API Integration: Check if user exists
  const {
    data: userData,
    isError: isUserError,
    isLoading: isUserLoading,
    error: userError,
  } = useFindById(address!, {
    query: {
      queryKey: getFindByIdQueryKey(address!),
      enabled: !!address && isConnected,
      retry: false,
      staleTime: 0,
    },
  });

  // API Integration: Create user if not exists
  const { mutate: createUser } = useCreate();
  const creationAttempted = useRef<string | null>(null);

  useEffect(() => {
    // 1. Sync Wallet Connection & API Balance
    // Use API balance instead of native wallet balance
    const apiBalance = userData?.balance ?? 0;

    // Update store if connection state or balance changes
    if (
      wallet.isConnected !== isConnected ||
      wallet.address !== address ||
      (isConnected && wallet.balance !== apiBalance)
    ) {
      useGameStore.setState((state) => ({
        wallet: {
          ...state.wallet,
          isConnected,
          address: address || null,
          balance: apiBalance,
          // Maintain userId if connected and it matches, otherwise null
          userId: isConnected ? state.wallet.userId : null,
        },
      }));
    }

    if (!isConnected) {
      creationAttempted.current = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("wallet-address");
      }
      return;
    }

    // 2. Handle User Login / Creation
    if (isUserLoading) return;

    if (userData && userData.id) {
      // User exists in backend, sync userId to store if not already set
      if (wallet.userId !== userData.id) {
        useGameStore.setState((state) => ({
          wallet: {
            ...state.wallet,
            userId: userData.id,
          },
        }));
        if (typeof window !== "undefined") {
          localStorage.setItem("wallet-address", userData.id);
        }
      }
    } else if (
      // If no user data and not loading, we assume user doesn't exist
      // We don't strictly require isUserError because API might return 200 with empty body
      !userData &&
      address &&
      creationAttempted.current !== address
    ) {
      // User not found (assumed from error), create new user
      // using the wallet address as the custom ID as requested.
      creationAttempted.current = address;

      console.log("123---- create user");

      createUser(
        {
          data: {
            id: address,
            username: address,
            balance: 2000,
          },
        },
        {
          onSuccess: (newUser) => {
            console.log("User created successfully:", newUser);
            // Update store immediately
            useGameStore.setState((state) => ({
              wallet: {
                ...state.wallet,
                userId: newUser.id,
              },
            }));

            if (typeof window !== "undefined") {
              localStorage.setItem("wallet-address", newUser.id);
            }

            // Invalidate query to ensure data consistency
            queryClient.invalidateQueries({
              queryKey: getFindByIdQueryKey(address),
            });
          },
          onError: (err) => {
            console.error("Failed to create user:", err);
            // Reset attempt to allow retry
            creationAttempted.current = null;
          },
        },
      );
    }
  }, [
    address,
    isConnected,
    userData,
    wallet.isConnected,
    wallet.address,
    wallet.balance,
    wallet.userId,
    isUserError,
    isUserLoading,
    createUser,
    queryClient,
  ]);

  return null;
}
