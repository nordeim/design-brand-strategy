import Image from "next/image";
import type { Metadata } from "next";

import { CtaBand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";
import { ArrowLink, Container, SectionLabel } from "@/components/ui";
import { APPROACH_PRINCIPLES, AWARDS, BEYOND_WORK, SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Elena Vance is an independent designer and brand strategist in New York — identity systems, design systems, and art direction for ambitious companies.",
  openGraph: {
    images: [
      {
        url: "/images/portrait-about.webp",
        width: 864,
        height: 1152,
        alt: "Elena Vance working at a wooden studio desk",
      },
    ],
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero — split layout: label/h1/bio left, portrait right
          (source geometry: h1 x=80 w=627, portrait x=771 w=429). */}
      <Container className="py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="flex flex-col justify-center md:col-span-7">
            <Reveal>
              <SectionLabel>About</SectionLabel>
              <h1 className="mt-4 max-w-[20ch] font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight">
                The designer your brand will grow into.
              </h1>
            </Reveal>

            <Reveal delay={80}>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                I&apos;m {SITE.name}, a designer and brand strategist working from a small studio
                in New York. For the last ten years I&apos;ve built identities and systems for
                companies at every stage — ventures three weeks old defining themselves for the
                first time, and enterprises discovering that the identity which carried them here
                won&apos;t carry them further.
              </p>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                My training is in typography, which is a longer way of saying I was taught that
                details carry meaning whether or not anyone can name them. That belief runs the
                practice: identity work that starts with the business, systems designed to survive
                the tenth application, and craft treated as strategy rather than decoration.
              </p>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                I keep the studio deliberately small — a handful of engagements a year, each with
                my full attention, supported by a trusted bench of photographers, writers, and
                fabricators assembled per project. The work is better for it, and so is the
                working.
              </p>
            </Reveal>
          </div>

          <div className="md:col-span-5">
            <Reveal variant="card">
              <Image
                src="/images/portrait-main.webp"
                alt="Studio portrait of Elena Vance"
                width={768}
                height={960}
                priority
                className="aspect-[4/5] w-full object-cover"
              />
              <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {SITE.name} — {SITE.location}
              </p>
            </Reveal>
          </div>
        </div>
      </Container>

      {/* Approach — three principles as a 3-column grid (source geometry:
          titles side-by-side at x=160/491/821). */}
      <Container className="border-t border-border py-16 md:py-24">
        <Reveal>
          <SectionLabel>Approach</SectionLabel>
          <h2 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
            How the work happens
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {APPROACH_PRINCIPLES.map((principle, index) => (
            <Reveal key={principle.number} delay={index * 60}>
              <div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {principle.number}
                </span>
                <h3 className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">
                  {principle.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {principle.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* Recognition */}
      <Container className="border-t border-border py-16 md:py-24">
        <Reveal>
          <SectionLabel>Recognition</SectionLabel>
          <h2 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
            Selected recognition
          </h2>
        </Reveal>

        <div className="mt-12">
          {AWARDS.map((award, index) => (
            <Reveal key={`${award.year}-${award.title}`} delay={index * 40}>
              <div className="grid items-baseline gap-2 border-t border-border py-5 last:border-b sm:grid-cols-12 sm:gap-6">
                <span className="text-xs tabular-nums text-muted-foreground sm:col-span-2">
                  {award.year}
                </span>
                <p className="text-sm font-medium sm:col-span-6">{award.title}</p>
                <p className="text-sm text-muted-foreground sm:col-span-4">{award.org}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* Beyond the studio */}
      <Container className="border-t border-border py-16 md:py-24">
        <Reveal>
          <SectionLabel>Beyond the studio</SectionLabel>
          <h2 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
            Teaching, mentoring, speaking
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {BEYOND_WORK.map((item, index) => (
            <Reveal key={item.title} variant="card" delay={index * 60}>
              <div>
                <h3 className="font-serif text-2xl tracking-tight">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* Closing CTA — light muted band with the ink pill action. */}
      <CtaBand
        label={SITE.availability}
        title={
          <>
            The studio keeps a <em className="italic">small</em> list.
          </>
        }
        body="A handful of engagements a year, each with full attention. If the fit is right, the next step is a thirty-minute conversation about where the business is headed — and an honest answer about whether I'm the right designer for it."
        href="/contact"
        linkText="Work with me"
      />
    </>
  );
}
