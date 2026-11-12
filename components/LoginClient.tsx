"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Icon from "@/components/Icon";

export default function LoginClient() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleGoogleSignIn() {
    setBusy(true);
    setError("");
    try {
      await signInWithGoogle();
      router.push("/planner");
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setError("Sign-in window was closed before completing.");
      } else if (code === "auth/popup-blocked") {
        setError("Allow pop-ups for this site and try signing in again.");
      } else {
        setError("Could not complete Google sign-in. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    setError("");
    try {
      await signOutUser();
      router.refresh();
    } catch {
      setError("Could not sign out cleanly. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!loading && user) {
    return (
      <section className="panel auth-card" aria-label="Account access">
        <p className="eyebrow">Signed in</p>
        <h1 className="auth-card__title">Welcome back, {user.displayName || "hopper"}.</h1>
        <p className="auth-card__lead">
          Your PandalPass routes are saved to your account ({user.email}).
        </p>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="auth-actions">
          <Link className="btn btn--wine auth-form__submit" href="/planner">
            Open the planner
          </Link>
          <button
            className="btn btn--ghost auth-form__submit"
            type="button"
            onClick={handleSignOut}
            disabled={busy}
          >
            {busy ? "Signing out" : "Sign out"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel auth-card" aria-label="Account access">
      <p className="eyebrow">PandalPass account</p>
      <h1 className="auth-card__title">Sign in for your Pujo night.</h1>
      <p className="auth-card__lead">
        Continue with your Google account to save your PandalPass itinerary and pick up your route across sessions.
      </p>

      <div className="auth-form">
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          className="btn btn--wine auth-form__submit"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={busy || loading}
        >
          <Icon name="logIn" size={18} />
          <span>{busy ? "Signing in" : "Sign in with Google"}</span>
        </button>
      </div>
    </section>
  );
}
