"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useUserSync() {
  const { user, isLoaded } = useUser();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isLoaded && user ? undefined : "skip"
  );

  useEffect(() => {
    if (!isLoaded || !user) return;

    getOrCreateUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      name: user.fullName ?? user.username ?? "Unknown",
      avatarUrl: user.imageUrl ?? undefined,
    }).catch(console.error);
  }, [isLoaded, user, getOrCreateUser]);

  return currentUser;
}