import Image from "next/image";

import { seededCharBlock } from "@/lib/char-block";

/**
 * The collage strip — three staggered elements floating on the cream
 * background below the hero: a studio flat-lay, a typographic poster card,
 * and the signature dense character block. Deterministic character output
 * keeps server and client markup identical.
 */
export function CollageStrip() {
  return (
    <section aria-label="Studio collage" className="py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-[1400px] items-end gap-6 px-6 md:grid-cols-12 md:px-10 lg:px-16">
        <figure className="md:col-span-4 md:translate-y-6">
          <div className="overflow-hidden">
            <Image
              src="/images/workspace.png"
              alt="Studio desk with printed brand collateral, color swatches, and type specimen books"
              width={1344}
              height={768}
              priority={false}
              className="aspect-[7/4] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
          <figcaption className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            The studio table
          </figcaption>
        </figure>

        <div className="md:col-span-4 md:-translate-y-8">
          {/* Typographic poster — a pure-CSS print piece. */}
          <div className="flex aspect-[7/8] flex-col justify-between bg-foreground p-7 text-background">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] opacity-70">
                Elena Vance
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] opacity-70">No. 01</span>
            </div>
            <p className="font-serif text-[clamp(3rem,6vw,4.5rem)] leading-[0.95] tracking-tight">
              Considered
              <br />
              <em className="italic">by</em>
              <br />
              Design
            </p>
            <p className="max-w-[26ch] text-xs leading-relaxed opacity-70">
              A quarterly note on identity systems, typography, and the craft
              of building brands that hold.
            </p>
          </div>
        </div>

        <figure className="md:col-span-4 md:translate-y-10">
          {/* Signature character block — dense, deterministic, untouchable. */}
          <div className="aspect-[7/8] bg-accent p-6" aria-hidden="true">
            <pre className="char-block h-full font-sans text-foreground/80">
              {seededCharBlock(20260913, 14, 18)}
            </pre>
          </div>
          <figcaption className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Studio cipher — texture study
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
