import Image from "next/image";
import Link from "next/link";

import type { Project } from "@/data/projects";

/**
 * Project card — image-led with adjacent metadata. Hovering eases the cover
 * upward by a few pixels; the whole card is the link.
 */
export function ProjectCard({ project, index }: { project: Project; index?: number }) {
  return (
    <Link href={`/work/${project.slug}`} className="group block">
      <div className="overflow-hidden">
        <Image
          src={project.cover}
          alt={project.coverAlt}
          width={1344}
          height={768}
          className="aspect-[3/2] w-full object-cover transition-transform duration-700 ease-out group-hover:-translate-y-2"
        />
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-6">
        <div className="flex items-baseline gap-4">
          {typeof index === "number" ? (
            <span className="text-xs tabular-nums text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
          <h3 className="font-serif text-2xl leading-snug tracking-tight md:text-3xl">
            {project.title}
          </h3>
        </div>
        <span className="flex-none text-xs text-muted-foreground">{project.year}</span>
      </div>
      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
        {project.summary}
      </p>
      <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {project.services.join(" · ")}
      </p>
    </Link>
  );
}
