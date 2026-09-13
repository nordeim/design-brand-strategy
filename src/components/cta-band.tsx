import type { ReactNode } from "react";

import { Reveal } from "@/components/reveal";
import { Container, PillLink } from "@/components/ui";

/**
 * Closing CTA band — the site's standard conversion close: a light muted band
 * with an ink pill action (the inverted band lives on in the collage poster
 * and the estimator's selected states, not here).
 */
export function CtaBand({
  label,
  title,
  body,
  href,
  linkText,
}: {
  label: string;
  title: ReactNode;
  body: string;
  href: string;
  linkText: string;
}) {
  return (
    <section className="border-t border-border bg-muted py-20 md:py-28">
      <Container>
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </p>
          <h2 className="mt-6 max-w-[16ch] font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight">
            {title}
          </h2>
          <p className="mt-6 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">{body}</p>
          <div className="mt-10">
            <PillLink href={href}>{linkText}</PillLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
