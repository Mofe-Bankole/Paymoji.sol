import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative isolate overflow-hidden min-h-screen">
      {/* Background layers similar to Home page */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 text-center">
        <div className="text-7xl" aria-label="cross mark">
          ❌
        </div>
        <h1 className="text-5xl font-extrabold text-white">Page Not Found</h1>
        <p className="text-lg text-white/70">
          The link you followed may be broken, or the page may have been
          removed.
        </p>
        <Link
          href="/"
          className="bg-electric rounded-full px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(0,203,230,0.2)] transition-transform duration-300 hover:scale-[1.02]"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
