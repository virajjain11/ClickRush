import { useEffect, useRef, useState } from "react";
import { env } from "../config/env";
import { useGoogleSignInMutation } from "../hooks/useGoogleSignInMutation";
import type { GoogleButtonText } from "../types/google";
import styles from "./Auth.module.css";

const GIS_SRC = "https://accounts.google.com/gsi/client";

type GoogleSignInButtonProps = {
  text: GoogleButtonText;
};

const BUTTON_LABELS: Record<GoogleButtonText, string> = {
  signin_with: "Sign in with Google",
  signup_with: "Sign up with Google",
  continue_with: "Continue with Google",
  signin: "Sign in",
};

export default function GoogleSignInButton({ text }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { mutate, isError, error, isPending } = useGoogleSignInMutation();
  const [localError, setLocalError] = useState<string | null>(null);
  const [officialButtonReady, setOfficialButtonReady] = useState(false);

  useEffect(() => {
    const container = buttonRef.current;
    if (!container || !env.googleClientId) {
      return;
    }

    let cancelled = false;

    const render = async () => {
      try {
        await loadGisScript();
      } catch {
        return;
      }

      if (cancelled || !buttonRef.current || !window.google?.accounts.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: env.googleClientId,
        callback: ({ credential }) => {
          if (credential) {
            mutate(credential);
          }
        },
        ux_mode: "popup",
        auto_select: false,
      });

      buttonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        text,
        shape: "rectangular",
        width: Math.round(buttonRef.current.offsetWidth) || 320,
      });

      if (!cancelled) {
        setOfficialButtonReady(true);
      }
    };

    void render();

    return () => {
      cancelled = true;
      container.replaceChildren();
      setOfficialButtonReady(false);
    };
  }, [mutate, text]);

  const displayError =
    localError ?? (isError ? error.message : null);

  return (
    <div className={styles.googleSection}>
      <div
        ref={buttonRef}
        className={styles.googleButton}
        hidden={!officialButtonReady}
      />
      {!officialButtonReady && (
        <button
          type="button"
          className={styles.googleFallback}
          disabled={isPending}
          onClick={() => {
            if (!env.googleClientId) {
              setLocalError(
                "Add VITE_GOOGLE_CLIENT_ID to client/.env and GOOGLE_CLIENT_ID to server/.env, then restart both servers.",
              );
              return;
            }

            setLocalError("Google sign-in is still loading. Try again.");
          }}
        >
          <GoogleMark />
          {BUTTON_LABELS[text]}
        </button>
      )}
      {displayError && (
        <p className={styles.error} role="alert">
          {displayError}
        </p>
      )}
      <div className={styles.divider} role="separator">
        <span>or</span>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg
      className={styles.googleMark}
      viewBox="0 0 18 18"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function loadGisScript(): Promise<void> {
  if (window.google?.accounts.id) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${GIS_SRC}"]`,
  );

  if (existing) {
    return waitForScript(existing);
  }

  const script = document.createElement("script");
  script.src = GIS_SRC;
  script.async = true;
  document.head.appendChild(script);

  return waitForScript(script);
}

function waitForScript(script: HTMLScriptElement): Promise<void> {
  if (window.google?.accounts.id) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Unable to load Google sign-in")),
      { once: true },
    );
  });
}
