import Image from "next/image";
import Link from "next/link";

import type { Project } from "@/data/projects";

/** Cover render classes per project aspect — the mixed editorial grid rhythm. */
const COVER_ASPECT_CLASS = {
  landscape: "aspect-[8/5]",
  portrait: "aspect-[4/5]",
} as const;

/**
 * Project card — image-led with the source's minimal editorial meta grammar:
 * title, uppercase practice line, year. The whole card is the link; hovering
 * eases the cover upward by a few pixels. Case-study depth (summaries,
 * deliverables) lives on the detail pages, not the cards.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/work/${project.slug}`} className="group block">
      <div className="overflow-hidden">
        <Image
          src={project.cover}
          alt={project.coverAlt}
          width={project.coverAspect === "portrait" ? 864 : 1344}
          height={project.coverAspect === "portrait" ? 1080 : 840}
          className={`${COVER_ASPECT_CLASS[project.coverAspect]} w-full object-cover transition-transform duration-700 ease-out group-hover:-translate-y-2`}
        />
      </div>
      <h3 className="mt-5 font-serif text-2xl leading-snug tracking-tight md:text-3xl">
        {project.title}
      </h3>
      <p className="mt-2 flex items-baseline justify-between gap-6 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{project.services.join(" · ")}</span>
        <span className="flex-none tabular-nums">{project.year}</span>
      </p>
    </Link>
  );
}
