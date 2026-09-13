import Image from "next/image";

import { getMarqueeItems } from "@/data/projects";

/**
 * The studio marquee — a 24-item gallery strip of project covers, studio
 * detail imagery, and typographic tiles scrolling continuously. Items carry a
 * `shape` (tall / wide / landscape) so the strip renders as a mixed-aspect
 * gallery rather than a row of identical thumbnails. Pure CSS motion (paused
 * on hover, disabled under prefers-reduced-motion via globals.css). The track
 * renders the sequence twice and shifts by -50% for a seamless loop.
 */

/** Render geometry per shape — width and image height in one place. */
const SHAPE_CLASS = {
  tall: "h-59 w-44", // 4:5 portrait covers (176×236)
  wide: "h-45 w-72", // 8:5 landscape covers (288×180)
  landscape: "h-37 w-64", // 7:4 studio details (256×148)
} as const;

export function Marquee() {
  const items = getMarqueeItems();

  return (
    <div
      className="group relative overflow-hidden border-y border-border py-8"
      role="region"
      aria-label="Studio imagery and practice areas"
    >
      <div className="flex w-max animate-marquee items-center gap-4 group-hover:[animation-play-state:paused]">
        {[...items, ...items].map((item, index) => (
          <div
            key={index}
            aria-hidden={index >= items.length}
            className="shrink-0"
          >
            {item.kind === "image" ? (
              <figure className="flex w-max flex-col">
                <Image
                  src={item.src}
                  alt={index >= items.length ? "" : item.alt}
                  width={item.shape === "tall" ? 176 : item.shape === "wide" ? 288 : 256}
                  height={item.shape === "tall" ? 236 : item.shape === "wide" ? 180 : 148}
                  className={`${SHAPE_CLASS[item.shape]} flex-none object-cover`}
                />
                <figcaption className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </figcaption>
              </figure>
            ) : (
              <div className="flex h-44 w-44 flex-col justify-between border border-border bg-muted p-5">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {item.sub}
                </span>
                <span className="font-serif text-3xl leading-none">{item.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
