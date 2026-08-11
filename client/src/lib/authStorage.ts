const ACCESS_TOKEN_KEY = "accessToken";
const ACCESS_TOKEN_CHANGE_EVENT = "clickrush:access-token-change";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(accessToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  notifyAccessTokenChange();
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  notifyAccessTokenChange();
}

export function subscribeToAccessToken(onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.storageArea !== localStorage) {
      return;
    }

    // A null key means the whole store was cleared.
    if (event.key === ACCESS_TOKEN_KEY || event.key === null) {
      onChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(ACCESS_TOKEN_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(ACCESS_TOKEN_CHANGE_EVENT, onChange);
  };
}

// The `storage` event only reaches other tabs, so writes from this tab are announced explicitly.
function notifyAccessTokenChange(): void {
  window.dispatchEvent(new Event(ACCESS_TOKEN_CHANGE_EVENT));
}
