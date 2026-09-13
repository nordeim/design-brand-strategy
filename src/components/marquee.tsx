import Image from "next/image";

import { getMarqueeItems } from "@/data/projects";

/**
 * The studio marquee — a 24-item strip of project covers, studio detail
 * imagery, and typographic tiles scrolling continuously. Pure CSS motion
 * (paused on hover, disabled under prefers-reduced-motion via globals.css).
 * The track renders the sequence twice and shifts by -50% for a seamless loop.
 */
export function Marquee() {
  const items = getMarqueeItems();

  return (
    <div
      className="group relative overflow-hidden border-y border-border py-6"
      role="region"
      aria-label="Studio imagery and practice areas"
    >
      <div className="flex w-max animate-marquee items-stretch gap-4 group-hover:[animation-play-state:paused]">
        {[...items, ...items].map((item, index) => (
          <div
            key={index}
            aria-hidden={index >= items.length}
            className="shrink-0"
          >
            {item.kind === "image" ? (
              <figure className="flex h-44 w-64 flex-col">
                <Image
                  src={item.src}
                  alt={index >= items.length ? "" : item.alt}
                  width={256}
                  height={176}
                  className="h-36 w-64 flex-none object-cover"
                />
                <figcaption className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </figcaption>
              </figure>
            ) : (
              <div className="flex h-44 w-64 flex-col justify-between border border-border bg-muted p-5">
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
