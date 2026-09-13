export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="mx-auto flex min-h-[60vh] w-full max-w-[1400px] items-center px-6 py-24 md:px-10 lg:px-16"
    >
      <p className="font-serif text-2xl tracking-tight text-muted-foreground">Loading…</p>
    </div>
  );
}
