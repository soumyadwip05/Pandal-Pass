import Link from "next/link";
import Icon from "@/components/Icon";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/planner", label: "Planner" },
  { href: "/explore", label: "Explore pandals" },
  { href: "/food", label: "Food stops" },
  { href: "/route", label: "Route map" },
  { href: "/pass", label: "My Pass" },
];

export default function Footer({ siteName, note }: { siteName: string; note: string }) {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div>
          <Link className="brand brand--light" href="/" aria-label={`${siteName} home`}>
            <span className="brand__mark" aria-hidden="true">
              <Icon name="sparkles" size={22} strokeWidth={2.4} />
            </span>
            <span className="brand__name">{siteName}</span>
          </Link>
          <p>A planning companion for Kolkata&apos;s PandalPass. {note}</p>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="shell site-footer__bottom">
        <span>{siteName} · a PandalPass planning project</span>
        <span>Built for the city that never sleeps during PandalPass.</span>
      </div>
    </footer>
  );
}
