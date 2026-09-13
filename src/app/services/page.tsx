import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { CtaBand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";
import { Container, SectionLabel } from "@/components/ui";
import { FAQ_ITEMS, PROCESS_STEPS, SERVICES } from "@/data/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Brand identity, visual design systems, art direction, brand guidelines, naming, and packaging — six practices, one standard of care.",
  openGraph: {
    images: [
      {
        url: "/images/detail-typography.webp",
        width: 1344,
        height: 768,
        alt: "Letterpress type blocks in a wooden tray",
      },
    ],
  },
};

export default function ServicesPage() {
  return (
    <>
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

      {/* ------------------------------------------------------------------
        How we work together — the five-step engagement process.
      ------------------------------------------------------------------ */}
      <Container className="border-t border-border py-16 md:py-24">
        <Reveal>
          <SectionLabel>Process</SectionLabel>
          <h2 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
            How we work together
          </h2>
        </Reveal>

        {/* Five steps side-by-side — the source renders the process as a
            horizontal 5-column band (Discovery…Delivery). */}
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS_STEPS.map((step, index) => (
            <Reveal key={step.number} delay={index * 60}>
              <div>
                <span className="text-xs tabular-nums text-muted-foreground">{step.number}</span>
                <h3 className="mt-3 font-serif text-2xl tracking-tight md:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* ------------------------------------------------------------------
        Common questions — native details/summary accordions, zero JS.
      ------------------------------------------------------------------ */}
      <Container className="border-t border-border py-16 md:py-24">
        <Reveal>
          <SectionLabel>Common questions</SectionLabel>
          <h2 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
            Answers, before you ask
          </h2>
        </Reveal>

        <div className="mt-12 max-w-3xl">
          {FAQ_ITEMS.map((item, index) => (
            <Reveal key={item.question} delay={index * 40}>
              <details className="group border-t border-border py-6 last:border-b">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 [&::-webkit-details-marker]:hidden">
                  <span className="font-serif text-xl leading-snug tracking-tight md:text-2xl">
                    {item.question}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 flex-none text-muted-foreground transition-transform duration-300 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* ------------------------------------------------------------------
        Closing CTA — light muted band with the ink pill action.
      ------------------------------------------------------------------ */}
      <CtaBand
        label="Next step"
        title={
          <>
            The work starts with a <em className="italic">question</em>.
          </>
        }
        body="Set expectations with the investment estimator, then send a few lines about where the business is headed. Every engagement begins with a scoping call and a written proposal — scope, timing, and investment agreed before any work begins."
        href="/contact"
        linkText="Start a project"
      />
    </>
  );
}
