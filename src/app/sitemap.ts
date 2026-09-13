import type { MetadataRoute } from "next";

import { SITE } from "@/data/site";
import { PROJECTS } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  // Deterministic stamp: every URL carries the content revision date, not the
  // build time, so search engines see honest lastmod signals (see SITE.contentUpdatedAt).
  const lastModified = new Date(SITE.contentUpdatedAt);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/work`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/about`, lastModified, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE.url}/services`, lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE.url}/contact`, lastModified, changeFrequency: "yearly", priority: 0.8 },
  ];

  const projectPages: MetadataRoute.Sitemap = PROJECTS.map((project) => ({
    url: `${SITE.url}/work/${project.slug}`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticPages, ...projectPages];
}
