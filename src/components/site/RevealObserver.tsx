"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Subtle fade-up when sections scroll into view (elements with `data-reveal`).
 * The hidden start state only applies after this runs (html.reveal) and never
 * with "reduce motion", so content is never invisible if JavaScript fails.
 */
export default function RevealObserver() {
  const path = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    // Things already on screen are shown at once (no flash), the rest animate in.
    document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
      else io.observe(el);
    });
    document.documentElement.classList.add("reveal");
    return () => io.disconnect();
  }, [path]);
  return null;
}
