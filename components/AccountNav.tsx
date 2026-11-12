"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function AccountNav() {
  const { user, loading, signOutUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOutUser();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Link className="site-nav__auth" href="/login" aria-current={pathname === "/login" ? "page" : undefined}>
        Sign in
      </Link>
    );
  }

  const label = user.displayName || user.email || "Signed in";

  return (
    <span className="site-nav__account">
      <span className="site-nav__user">{label}</span>
      <button className="site-nav__signout" type="button" onClick={handleSignOut} disabled={busy}>
        {busy ? "Signing out" : "Sign out"}
      </button>
    </span>
  );
}
