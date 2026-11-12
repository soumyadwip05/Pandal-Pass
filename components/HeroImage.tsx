"use client";

import { useEffect, useRef } from "react";

export default function HeroImage() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const rect = element.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const windowHeight = window.innerHeight;
      if (rect.bottom < 0 || rect.top > windowHeight) return;

      const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
      const translateY = progress * 90;
      const opacity = 1 - progress * 0.6;

      element.style.transform = `translate3d(0, ${translateY}px, 0)`;
      element.style.opacity = String(opacity);
    };

    const applyResponsive = () => {
      if (window.innerWidth <= 760) {
        element.style.backgroundPosition = "center";
        element.style.webkitMaskImage = "radial-gradient(circle at 50% 40%, black 48%, transparent 82%)";
        element.style.maskImage = "radial-gradient(circle at 50% 40%, black 48%, transparent 82%)";
      } else {
        element.style.backgroundPosition = "";
        element.style.webkitMaskImage = "";
        element.style.maskImage = "";
      }
    };

    update();
    applyResponsive();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("resize", applyResponsive, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("resize", applyResponsive);
    };
  }, []);

  return (
    <div className="hero-image">
      <div className="hero-image__layer" ref={ref} aria-hidden="true" />
<div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "linear-gradient(90deg, rgba(17,17,17,0.75) 0%, rgba(17,17,17,0.35) 42%, rgba(17,17,17,0.1) 50%)",
          pointerEvents: "none",
        }}
      />
      <span className="sr-only">
        Kumartuli Park Durga Puja pandal at night, illuminated with traditional lighting and artistic
        decorations. Photo by Tanuj Adhikary (@_tanuj_) on Unsplash.
      </span>
    </div>
  );
}