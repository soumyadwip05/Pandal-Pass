"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AccountNav from "@/components/AccountNav";
import Icon from "@/components/Icon";

const links = [
  { href: "/", label: "Home" },
  { href: "/planner", label: "Planner" },
  { href: "/explore", label: "Explore" },
  { href: "/food", label: "Food" },
  { href: "/route", label: "Route" },
  { href: "/pass", label: "My Pass" },
];

export default function Header({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header className={`site-header${open ? " is-open" : ""}`} ref={headerRef}>
      <div className="shell site-header__inner">
        <Link className="brand" href="/" aria-label={`${siteName} home`}>
          <span className="brand__mark" aria-hidden="true">
            <Icon name="sparkles" size={22} strokeWidth={2.4} />
          </span>
          <span className="brand__name">{siteName}</span>
        </Link>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className="site-nav" id="site-nav" aria-label="Primary">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
                {link.label}
              </Link>
            );
          })}
          <AccountNav />
        </nav>

        <div className="site-header__actions">
          <Link className="btn btn--gold btn--sm" href="/planner">
            Plan my PandalPass
          </Link>
        </div>
      </div>
    </header>
  );
}
