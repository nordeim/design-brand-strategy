import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

/** Page-width container — the single source of horizontal rhythm. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-16 ${className ?? ""}`}>
      {children}
    </div>
  );
}

/** Tiny uppercase section label with wide tracking — the site's wayfinding voice. */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground ${
        className ?? ""
      }`}
    >
      {children}
    </p>
  );
}

/** Text link with an arrow and animated underline — the site's primary inline CTA. */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] ${
        className ?? ""
      }`}
    >
      <span className="link-underline">{children}</span>
      <ArrowRight
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </Link>
  );
}

/** Pill button — used for the primary contact CTA. */
export function PillLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium
        uppercase tracking-[0.14em] text-background transition-opacity duration-300 hover:opacity-80 ${
        className ?? ""
      }`}
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
