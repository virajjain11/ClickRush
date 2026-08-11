import { useSyncExternalStore } from "react";
import { getAccessToken, subscribeToAccessToken } from "../lib/authStorage";

export function useAccessToken(): string | null {
  return useSyncExternalStore(subscribeToAccessToken, getAccessToken, () => null);
}
