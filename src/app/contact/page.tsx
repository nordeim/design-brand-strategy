import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { Estimator } from "@/components/estimator";
import { Reveal } from "@/components/reveal";
import { Container, SectionLabel } from "@/components/ui";
import { ESTIMATOR_SERVICES, SITE, type EstimatorServiceId } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project with Elena Vance — estimate your investment, then tell me about the work.",
  openGraph: {
    images: [
      {
        url: "/images/detail-monogram.webp",
        width: 1344,
        height: 576,
        alt: "Debossed monogram detail on cotton paper",
      },
    ],
  },
};

type PageProps = {
  searchParams: Promise<{ service?: string }>;
};

export default async function ContactPage({ searchParams }: PageProps) {
  const { service } = await searchParams;
  const isValid = ESTIMATOR_SERVICES.some((s) => s.id === service);
  const initialServiceId = isValid ? (service as EstimatorServiceId) : undefined;

  return (
    <>
      <Container className="py-16 md:py-24">
        <Reveal>
          <SectionLabel>Contact</SectionLabel>
          <h1 className="mt-4 max-w-[20ch] font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight">
            Start with a conversation.
          </h1>
          <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
            The first question is always about the business, not the deliverables. Use the
            estimator to set expectations, then send a few lines about where you&apos;re headed —
            I reply to every inquiry personally.
          </p>
        </Reveal>
      </Container>

      {/* Four-step investment estimator */}
      <Container className="pb-16 md:pb-24" >
        <Reveal variant="card">
          <div id="estimator" className="scroll-mt-28">
            <Estimator initialServiceId={initialServiceId} />
          </div>
        </Reveal>
      </Container>

      {/* Inquiry form + practical details — form left, studio info right
          (source geometry: form x=160, mailto x=843). */}
      <Container className="border-t border-border py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7" id="contact-form">
            <Reveal>
              <ContactForm />
            </Reveal>
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <div className="md:sticky md:top-28">
              <Reveal>
                <SectionLabel>The studio</SectionLabel>
                <a href={`mailto:${SITE.email}`} className="link-underline mt-5 block font-serif text-2xl tracking-tight md:text-3xl">
                  {SITE.email}
                </a>
                <p className="mt-4 text-sm text-muted-foreground">{SITE.location}</p>
                <p className="mt-1 text-sm text-muted-foreground">{SITE.availability}</p>

                <h2 className="mt-12 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  What happens next
                </h2>
                <ol className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-xs tabular-nums text-muted-foreground">01</span>
                    A personal reply within two business days.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-xs tabular-nums text-muted-foreground">02</span>
                    A 30-minute scoping call if the project looks like a fit.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-xs tabular-nums text-muted-foreground">03</span>
                    A written proposal with scope, timing, and investment — no surprises later.
                  </li>
                </ol>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
