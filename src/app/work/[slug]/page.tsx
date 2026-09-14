import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Reveal } from "@/components/reveal";
import { ArrowLink, Container, SectionLabel } from "@/components/ui";
import { getNextProject, getProject, PROJECTS } from "@/data/projects";

/** Case hero renders as a uniform 7:3 wide banner (source-measured:
 * every case hero is 2.33, object-cropped from the cover). */
const COVER_ASPECT_CLASS = "aspect-[7/3]";

/** Detail render classes — wide banners, landscape, and 4:5 portrait studies. */
const DETAIL_ASPECT_CLASS = {
  wide: "aspect-[7/3]",
  landscape: "aspect-[3/2]",
  portrait: "aspect-[4/5]",
} as const;

type PageProps = { params: Promise<{ slug: string }> };

/**
 * SSG-only route (ADR-012): every valid slug comes from generateStaticParams
 * over PROJECTS. Unknown slugs must hard-404 at the router — never render
 * on demand — so a bogus slug can never produce a 200 response that the
 * CDN caches for a year (measured live bug: /work/<bogus> → 200 +
 * s-maxage=31536000).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Work" };

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: `${project.title} — case study`,
      description: project.summary,
      images: [
        {
          url: project.cover,
          width: project.coverAspect === "portrait" ? 864 : 1344,
          height: project.coverAspect === "portrait" ? 1152 : 840,
          alt: project.coverAlt,
        },
      ],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const next = getNextProject(project.slug);

  return (
    <article>
      {/* Case header */}
      <Container className="py-16 md:py-24">
        <Reveal>
          <Link href="/work" className="link-underline text-xs uppercase tracking-[0.18em] text-muted-foreground">
            ← All work
          </Link>
          <div className="mt-10 grid gap-8 md:grid-cols-12">
            <div className="md:col-span-8">
              <h1 className="font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[1.02] tracking-tight">
                {project.title}
              </h1>
              <p className="mt-6 max-w-[52ch] font-serif text-xl leading-relaxed text-muted-foreground md:text-2xl">
                {project.summary}
              </p>
            </div>
            <div className="flex flex-col justify-end md:col-span-3 md:col-start-10">
              <SectionLabel>{project.sector}</SectionLabel>
              <p className="mt-2 text-sm text-muted-foreground">
                {project.client} · {project.location}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal variant="card" delay={100} className="mt-12">
          <Image
            src={project.cover}
            alt={project.coverAlt}
            width={project.coverAspect === "portrait" ? 864 : 1344}
            height={project.coverAspect === "portrait" ? 1080 : 576}
            priority
            className={`${COVER_ASPECT_CLASS} w-full object-cover`}
          />
        </Reveal>
      </Container>

      {/* Body + sticky meta sidebar */}
      <Container className="grid gap-12 pb-16 md:grid-cols-12 md:gap-10 md:pb-24">
        <div className="md:col-span-8">
          <Reveal>
            <SectionLabel>Overview</SectionLabel>
            {project.overview.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal className="mt-14">
            <h2 className="font-serif text-3xl tracking-tight md:text-4xl">The challenge</h2>
            <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted-foreground">
              {project.challenge}
            </p>
          </Reveal>

          <Reveal className="mt-14">
            <h2 className="font-serif text-3xl tracking-tight md:text-4xl">The approach</h2>
            <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted-foreground">
              {project.solution}
            </p>
          </Reveal>

          <Reveal className="mt-14">
            <div className="border-l-2 border-foreground pl-6">
              <SectionLabel>After launch</SectionLabel>
              <p className="mt-4 max-w-[60ch] font-serif text-xl leading-relaxed md:text-2xl">
                {project.outcome}
              </p>
            </div>
          </Reveal>

          {/* Detail imagery — mixed aspects: wide banner, landscape, portrait */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {project.details.map((detail, index) => (
              <Reveal key={detail.src + index} variant="card" delay={index * 60}>
                <figure>
                  <Image
                    src={detail.src}
                    alt={detail.alt}
                    width={detail.aspect === "portrait" ? 864 : 1344}
                    height={
                      detail.aspect === "portrait"
                        ? 1080
                        : detail.aspect === "wide"
                          ? 576
                          : 896
                    }
                    className={`${DETAIL_ASPECT_CLASS[detail.aspect]} w-full object-cover`}
                  />
                  <figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {detail.caption}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Sticky project meta */}
        <aside className="md:col-span-3 md:col-start-10">
          <div className="sticky top-28 border border-border p-6">
            <SectionLabel>Project</SectionLabel>
            <dl className="mt-5 space-y-5 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Client</dt>
                <dd className="mt-1">{project.client}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Year</dt>
                <dd className="mt-1 tabular-nums">{project.year}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Sector</dt>
                <dd className="mt-1">{project.sector}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Location</dt>
                <dd className="mt-1">{project.location}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Services</dt>
                <dd className="mt-1">{project.services.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Deliverables</dt>
                <dd className="mt-1">{project.deliverables.join(", ")}</dd>
              </div>
            </dl>
            <div className="mt-7 border-t border-border pt-5">
              <ArrowLink href="/contact">Start a similar project</ArrowLink>
            </div>
          </div>
        </aside>
      </Container>

      {/* Next project */}
      <Link href={`/work/${next.slug}`} className="group block border-t border-border">
        <Container className="py-14 md:py-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <SectionLabel>Next project</SectionLabel>
              <p className="mt-4 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-none tracking-tight transition-transform duration-300 group-hover:translate-x-3">
                {next.title}
              </p>
            </div>
            <span aria-hidden="true" className="pb-3 font-serif text-3xl text-muted-foreground">
              →
            </span>
          </div>
        </Container>
      </Link>
    </article>
  );
}
