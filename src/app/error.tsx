"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure for observability tooling to pick up.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[1400px] flex-col items-start justify-center px-6 py-24 md:px-10 lg:px-16">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Something went sideways
      </p>
      <h1 className="mt-4 max-w-[20ch] font-serif text-4xl tracking-tight md:text-5xl">
        The page stumbled — the studio didn&apos;t.
      </h1>
      <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
        An unexpected error interrupted this page. Trying again usually resolves it; if it
        persists, the incident has been logged for review.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center rounded-full bg-foreground px-7 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-background transition-opacity duration-300 hover:opacity-80"
      >
        Try again
      </button>
    </div>
  );
}
