import type { Metadata } from "next";
import LoginClient from "@/components/LoginClient";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to PandalPass with your Google account to save your Durga Pujo itinerary.",
};

export default function LoginPage() {
  return (
    <div className="page">
      <div className="shell auth-layout">
        <LoginClient />
        <aside className="panel auth-aside" aria-label="About accounts">
          <p className="eyebrow">Why sign in</p>
          <h2>Save your night, hop faster.</h2>
          <ul className="auth-aside__list">
            <li>Sign in securely with Google using Firebase Authentication.</li>
            <li>Your generated PandalPass route and preferences stay saved across sessions.</li>
            <li>Browse pandals, food stops, and plan routes freely even before signing in.</li>
          </ul>
          <p className="note">Crowd, time and cost on the routes remain planning estimates.</p>
        </aside>
      </div>
    </div>
  );
}
