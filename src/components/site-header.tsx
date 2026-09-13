"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_LINKS, SITE } from "@/data/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between px-6 md:px-10 lg:px-16">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="group flex flex-col leading-tight"
          aria-label={`${SITE.name} — home`}
        >
          <span className="font-serif text-xl tracking-tight md:text-2xl">{SITE.name}</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {SITE.shortLabel}
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium uppercase tracking-[0.16em] transition-colors duration-200 ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
          >
            {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Primary mobile"
          className="flex h-[calc(100dvh-5rem)] flex-col justify-between border-t border-border bg-background px-6 pb-10 pt-8 md:hidden"
        >
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between border-b border-border py-5"
                >
                  <span className="font-serif text-4xl">{link.label}</span>
                  <span className="text-xs text-muted-foreground">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {SITE.location} — {SITE.availability}
          </p>
        </nav>
      ) : null}
    </header>
  );
}
