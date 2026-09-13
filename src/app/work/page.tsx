import type { Metadata } from "next";

import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { Container, SectionLabel } from "@/components/ui";
import { PROJECTS } from "@/data/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected identity systems, design systems, art direction, and packaging engagements — 2022 to today.",
  openGraph: {
    images: [
      {
        url: "/images/alder-pine-cover.webp",
        width: 1344,
        height: 840,
        alt: "Letterpress stationery for Alder & Pine",
      },
    ],
  },
};

export default function WorkPage() {
  return (
    <Container className="py-16 md:py-24">
      <Reveal>
        <SectionLabel>Work</SectionLabel>
        <h1 className="mt-4 max-w-[18ch] font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight">
          Eight projects, chosen with care.
        </h1>
        <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
          A selection of engagements from the last four years — each one a system built to
          outlast the project that created it. Every case covers the brief, the decisions,
          and what happened after launch.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-x-10 gap-y-16 md:grid-cols-2 md:gap-y-24">
        {PROJECTS.map((project, index) => (
          <Reveal key={project.slug} variant="card" delay={(index % 2) * 60}>
            <ProjectCard project={project} index={index} />
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
