import Link from "next/link";
import type { Metadata } from "next";

import { Reveal } from "@/components/reveal";
import { Container, SectionLabel } from "@/components/ui";
import { SERVICES } from "@/data/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Brand identity, visual design systems, art direction, brand guidelines, naming, and packaging — six practices, one standard of care.",
};

export default function ServicesPage() {
  return (
    <Container className="py-16 md:py-24">
      <Reveal>
        <SectionLabel>Services</SectionLabel>
        <h1 className="mt-4 max-w-[20ch] font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight">
          Six practices, one standard of care.
        </h1>
        <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
          Engagements are scoped to the decision in front of you — never to a fixed package. Each
          practice below can stand alone or combine; most engagements draw on two or three. Ranges
          in the estimator are honest starting points, not anchors.
        </p>
      </Reveal>

      <div className="mt-16 md:mt-24">
        {SERVICES.map((service, index) => (
          <Reveal key={service.id} delay={40}>
            <section
              id={service.id}
              className="grid scroll-mt-28 gap-8 border-t border-border py-12 last:border-b md:grid-cols-12 md:gap-10 md:py-16"
            >
              <div className="md:col-span-5">
                <span className="text-xs tabular-nums text-muted-foreground">{service.number}</span>
                <h2 className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">
                  {service.name}
                </h2>
                <p className="mt-4 font-serif text-lg italic text-muted-foreground md:text-xl">
                  {service.tagline}
                </p>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </div>

              <div className="md:col-span-6 md:col-start-7">
                <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  What&apos;s included
                </h3>
                <ul className="mt-5 space-y-3">
                  {service.includes.map((item) => (
                    <li key={item} className="flex items-baseline gap-3 border-b border-border pb-3 text-sm">
                      <span aria-hidden="true" className="text-muted-foreground">—</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                      Best for
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed">{service.bestFor}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                      Investment
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed">
                      {service.estimatorId ? (
                        <Link
                          href={`/contact?service=${service.estimatorId}#estimator`}
                          className="link-underline font-medium"
                        >
                          Get an estimate
                        </Link>
                      ) : (
                        <Link href="/contact#contact-form" className="link-underline font-medium">
                          Request a custom quote
                        </Link>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
