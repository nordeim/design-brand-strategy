import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[1400px] flex-col items-start justify-center px-6 py-24 md:px-10 lg:px-16">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        404 — Not found
      </p>
      <h1 className="mt-4 max-w-[20ch] font-serif text-4xl tracking-tight md:text-5xl">
        This page was decided against.
      </h1>
      <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
        The address doesn&apos;t lead anywhere — the work, however, does.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/"
          className="link-underline text-sm font-medium uppercase tracking-[0.14em]"
        >
          Back home
        </Link>
        <Link
          href="/work"
          className="link-underline text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground"
        >
          View the work
        </Link>
      </div>
    </div>
  );
}
