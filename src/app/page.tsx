import Image from "next/image";
import Link from "next/link";

import { CollageStrip } from "@/components/collage-strip";
import { CtaBand } from "@/components/cta-band";
import { Marquee } from "@/components/marquee";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { ArrowLink, Container, SectionLabel } from "@/components/ui";
import { APPROACH_PRINCIPLES, SITE, SERVICES } from "@/data/site";
import { FEATURED_PROJECTS } from "@/data/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    images: [{ url: "/images/workspace.webp", width: 1344, height: 768, alt: "The studio table" }],
  },
};

export default function HomePage() {
  return (
    <>
      {/* ------------------------------------------------------------------
        Hero — 12-column split: statement left, portrait right, floating
        availability pill overlapping the portrait's corner.
      ------------------------------------------------------------------ */}
      <Container className="py-16 md:py-24 lg:py-32">
        <div className="grid items-center gap-12 md:grid-cols-12 lg:gap-10">
          <div className="md:col-span-7">
            <Reveal>
              <SectionLabel>{SITE.shortLabel} — {SITE.location}</SectionLabel>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 font-serif text-[clamp(3rem,8vw,6.5rem)] leading-[1.02] tracking-tight">
                Brands built on <em className="italic">intention and</em> clarity.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-8 max-w-[52ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                I&apos;m {SITE.name}, an independent designer and brand strategist in New York. I
                build identities, design systems, and art direction that help ambitious companies
                look like what they&apos;ve decided to be — at every size, on every surface, for
                years at a time.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-10">
                <ArrowLink href="/work">View selected work</ArrowLink>
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-5">
            <Reveal variant="card" delay={120}>
              <div className="relative">
                <div className="overflow-hidden">
                  <Image
                    src="/images/portrait-main.webp"
                    alt="Studio portrait of Elena Vance against a warm cream backdrop"
                    width={768}
                    height={1344}
                    priority
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
                <p className="absolute -bottom-4 -right-3 rounded-full bg-pill px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-pill-foreground md:-right-6">
                  {SITE.availability}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>

      {/* Signature collage strip + scrolling studio marquee */}
      <CollageStrip />
      <Marquee />

      {/* ------------------------------------------------------------------
        Selected work — four featured engagements.
      ------------------------------------------------------------------ */}
      <Container className="py-20 md:py-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel>Selected Work</SectionLabel>
              <h2 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
                Recent engagements
              </h2>
            </div>
            <ArrowLink href="/work">All projects</ArrowLink>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-x-10 gap-y-16 md:grid-cols-2">
          {FEATURED_PROJECTS.map((project, index) => (
            <Reveal key={project.slug} variant="card" delay={index * 60}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </Container>

      {/* ------------------------------------------------------------------
        About teaser — positioning and a pull quote left, portrait right
        (source geometry: text x≈80, portrait x=771).
      ------------------------------------------------------------------ */}
      <Container className="border-t border-border py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="flex flex-col justify-center md:col-span-7">
            <Reveal>
              <SectionLabel>About</SectionLabel>
              <h2 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
                A studio of one, built for considered work.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                Ten years of identity work taught me that the decisive work happens before the
                first sketch — in the questions, the positioning, and the discipline of saying no.
                I keep a deliberately small practice so every project gets that attention.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <blockquote className="mt-10 border-l-2 border-foreground pl-6 font-serif text-2xl leading-snug tracking-tight md:text-3xl">
                &ldquo;The strongest brands aren&apos;t decorated — they&apos;re decided.&rdquo;
              </blockquote>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-10">
                <ArrowLink href="/about">More about Elena</ArrowLink>
              </div>
            </Reveal>
          </div>
          <div className="md:col-span-5">
            <Reveal variant="card">
              <Image
                src="/images/portrait-about.webp"
                alt="Elena Vance working at a wooden studio desk with typography sketches"
                width={864}
                height={1080}
                className="aspect-[4/5] w-full object-cover"
              />
            </Reveal>
          </div>
        </div>
      </Container>

      {/* ------------------------------------------------------------------
        Services teaser — the first three practices as a 3-column row
        (source geometry: three w=341 cards, name + one-liner).
      ------------------------------------------------------------------ */}
      <Container className="border-t border-border py-20 md:py-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel>Services</SectionLabel>
              <h2 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">What I do</h2>
            </div>
            <ArrowLink href="/services">All services</ArrowLink>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {SERVICES.slice(0, 3).map((service, index) => (
            <Reveal key={service.id} delay={index * 60}>
              <Link href={`/services#${service.id}`} className="group block">
                <h3 className="font-serif text-3xl tracking-tight transition-transform duration-300 group-hover:translate-x-2 md:text-4xl">
                  {service.name}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {service.tagline}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* ------------------------------------------------------------------
        Closing CTA — light muted band with the ink pill action.
      ------------------------------------------------------------------ */}
      <CtaBand
        label={SITE.availability}
        title={
          <>
            Let&apos;s build something <em className="italic">considered</em>.
          </>
        }
        body="The best projects start with a conversation about the business, not the deliverables. Tell me where you're headed — I'll tell you honestly whether I'm the right designer for it."
        href="/contact"
        linkText="Start a conversation"
      />
    </>
  );
}
