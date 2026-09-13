"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper: content starts hidden (opacity 0 + a small
 * translate) and animates in over 300ms once it intersects the viewport.
 *
 * prefers-reduced-motion is handled in globals.css ([data-reveal] is forced
 * visible there), so no state is set synchronously in the effect body and
 * server/client markup always matches.
 */
const HIDDEN_VARIANT = {
  text: "translate-y-[26px]",
  card: "translate-y-10 scale-[0.98]",
} as const;

export function Reveal({
  children,
  variant = "text",
  delay = 0,
  className,
}: {
  children: ReactNode;
  variant?: "text" | "card";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal=""
      className={[
        "transition-all duration-300 ease-out",
        visible ? "translate-y-0 scale-100 opacity-100" : `opacity-0 ${HIDDEN_VARIANT[variant]}`,
        className ?? "",
      ].join(" ")}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
