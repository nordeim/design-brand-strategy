import Link from "next/link";

import { Container } from "@/components/ui";
import { NAV_LINKS, SITE, SOCIAL_LINKS } from "@/data/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-5">
            <Link href="/" className="font-serif text-3xl tracking-tight">
              {SITE.name}
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {SITE.role} building considered identities, systems, and art direction for ambitious
              companies and cultural institutions.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="link-underline mt-6 inline-block text-sm font-medium"
            >
              {SITE.email}
            </a>
          </div>

          <div className="md:col-span-3 lg:col-span-3 lg:col-start-8">
            <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Navigation
            </h2>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 lg:col-span-4">
            <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Connect
            </h2>
            <ul className="mt-5 space-y-3">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {social.label} <span className="text-muted-foreground/70">— {social.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {SITE.name}. All rights reserved.
          </p>
          <p className="uppercase tracking-[0.18em]">{SITE.location}</p>
        </div>
      </Container>
    </footer>
  );
}
