"use client";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const showcaseNames = [
  "RAINBOWPIZZA.SOL",
  "UNICORNPIZZA.SOL",
  "TIGERSHOCK.SOL",
  "SURFWAVE.SOL",
  "PIXELPRO.SOL",
  "DREAMER.SOL",
  "FOODIE.SOL",
  "COSMOS.SOL",
  "ROCKSTAR.SOL",
  "CODECAT.SOL",
];

const featureCards: {
  emoji: string;
  accent: "primary" | "secondary" | "tertiary";
  title: string;
  description: string;
  footer?: string[];
}[] = [
  {
    emoji: "∞",
    accent: "primary",
    title: "Millions of identity combinations",
    description:
      "Explore thousands of emoji characters and mint a three-symbol identity that feels unmistakably yours.",
    footer: ["🦁🏀⚡️", "🌊🏄‍♂️💎", "👾🎮🔥", "🌸🦋✨", "🍕🍟🍔", "🛸🪐🌌"],
  },
  {
    emoji: "✦",
    accent: "secondary",
    title: "Chat-first onboarding",
    description:
      "Check availability, claim names, and send funds through a Telegram-style flow that feels familiar from day one.",
  },
  {
    emoji: "◌",
    accent: "tertiary",
    title: "Private or public transfers",
    description:
      "Choose whether each payment is visible or stealthy so identity stays expressive without sacrificing privacy.",
  },
  {
    emoji: "↗",
    accent: "primary",
    title: "Simple social sign-in",
    description:
      "Lower the onboarding barrier with familiar authentication while keeping the wallet experience crypto-native.",
  },
  {
    emoji: "⚡",
    accent: "secondary",
    title: "Built for Solana speed",
    description:
      "Fast settlement and low fees make emoji-based payments feel instant enough for everyday use.",
  },
  {
    emoji: "☺",
    accent: "tertiary",
    title: "Human-readable by default",
    description:
      "Swap copy-pasted wallet strings for memorable emoji names people can recognize and reuse anywhere.",
  },
];

const steps = [
  {
    title: "Pick your trio",
    description:
      "Browse combinations until you land on the three emojis that best match your identity.",
    preview: "🐯 🏀 ⚡",
  },
  {
    title: "Mint the name",
    description:
      "Confirm once and anchor the identity onchain with a lightweight Solana transaction.",
    preview: "Minting 65%",
  },
  {
    title: "Use it everywhere",
    description:
      "Receive payments, log in to apps, and make your wallet address instantly recognizable.",
    preview: "Wallet • Send • Login",
  },
];

function accentClasses(accent: "primary" | "secondary" | "tertiary") {
  if (accent === "secondary") {
    return "bg-secondary/15 text-secondary ring-secondary/30";
  }

  if (accent === "tertiary") {
    return "bg-tertiary/15 text-tertiary ring-tertiary/30";
  }

  return "bg-primary/15 text-primary ring-primary/30";
}

function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-7xl flex-col justify-center px-6 py-20 md:py-28">
      <div className="max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          <span aria-hidden>⚡</span>
          Emoji identity on Solana
        </div>

        <h1 className="mt-6 text-5xl font-black tracking-[-0.07em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
          Your wallet should feel
          <span className="block text-gradient-sol">human, not hexadecimal.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-xl">
          Claim a memorable emoji identity, mint it onchain, and send payments
          with a name people can actually remember.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-electric px-8 py-3.5 text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_0_30px_rgba(0,203,230,0.3)] transition-transform hover:scale-[1.02]"
          >
            Claim your Paymoji
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-white/90 transition-colors hover:bg-white/10"
          >
            See how it works
          </a>
        </div>
      </div>

      <div className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
        <div className="glass-surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">
            Identity
          </p>
          <p className="mt-2 text-xl font-black text-white">3 emojis</p>
          <p className="mt-1 text-sm text-on-surface-variant">One name, yours forever.</p>
        </div>
        <div className="glass-surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">
            Transfer
          </p>
          <p className="mt-2 text-xl font-black text-white">Fast on devnet</p>
          <p className="mt-1 text-sm text-on-surface-variant">Low-friction send and receive.</p>
        </div>
        <div className="glass-surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">
            Ownership
          </p>
          <p className="mt-2 text-xl font-black text-white">Minted NFT</p>
          <p className="mt-1 text-sm text-on-surface-variant">Onchain proof of identity.</p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, login, logout } = usePrivy();
  return (
    <main className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-black tracking-[-0.08em] text-white"
          >
            Paymoji
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-white/70 md:flex">
            <a className="transition-colors hover:text-white" href="#features">
              Features
            </a>
            <a
              className="transition-colors hover:text-white"
              href="#how-it-works"
            >
              How it works
            </a>
          </nav>

          {user ? (
            <a
              href=""
              onClick={() => logout()}
              className="bg-electric rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(0,203,230,0.2)] transition-transform duration-150 hover:scale-[1.02]"
            >
              Logout
            </a>
          ) : (
            <a
              href="/register"
              onClick={() => login()}
              className="bg-electric rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(0,203,230,0.2)] transition-transform duration-150 hover:scale-[1.02]"
            >
              Login
            </a>
          )}
        </div>
      </header>

      <Hero />

      <section className="overflow-hidden border-y border-white/5 bg-surface-container-lowest/50 py-5">
        <div className="animate-marquee flex min-w-max gap-10 px-6">
          {[...showcaseNames, ...showcaseNames].map((name, index) => (
            <div
              key={`${name}-${index}`}
              className="flex shrink-0 items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-white/75"
            >
              <span className="text-2xl">
                {["🚀💎🔥", "🌈🦄🍕", "🦁🏀⚡️", "🌊🏄‍♂️💎", "👾🎮🔥"][index % 5]}
              </span>
              <span>{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary/80">
            Why it clicks
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-white md:text-5xl">
            Where form meets function—and both swipe right.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="glass-surface flex h-full flex-col rounded-[28px] p-6"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${accentClasses(
                  feature.accent,
                )}`}
              >
                <span className="text-xl font-bold">{feature.emoji}</span>
              </div>

              <h3 className="mt-6 text-2xl font-bold tracking-[-0.04em] text-white">
                {feature.title}
              </h3>

              <p className="mt-4 text-sm leading-6 text-on-surface-variant">
                {feature.description}
              </p>

              {feature.footer ? (
                <div className="mt-6 overflow-hidden rounded-[20px] border border-white/8 bg-black/20 px-4 py-3 text-xl text-white/55">
                  <div className="animate-marquee flex min-w-max gap-4">
                    {[...feature.footer, ...feature.footer].map(
                      (item, index) => (
                        <span key={`${item}-${index}`}>{item}</span>
                      ),
                    )}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-white/5 bg-surface-container-low/60 px-6 py-20 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-white md:text-5xl">
              Three steps from idea to identity.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="glass-surface rounded-[28px] p-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl font-black text-white">
                  {index + 1}
                </div>
                <h3 className="mt-6 text-2xl font-bold tracking-[-0.04em] text-white">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-on-surface-variant">
                  {step.description}
                </p>
                <div className="mt-8 rounded-[22px] border border-white/10 bg-black/20 px-4 py-5 text-center text-lg font-semibold text-white/85">
                  {step.preview}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="claim" className="mx-auto max-w-5xl px-6 py-20">
        <div className="glass-surface neon-glow-purple rounded-[36px] p-8 text-center md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-tertiary/80">
            Ready to claim
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.06em] text-white md:text-5xl">
            Pick your trio and make your wallet memorable.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-on-surface-variant md:text-lg">
            The page is now structured for real product work: easier to edit,
            easier to expand, and much safer inside Next’s App Router.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/register"
              onClick={() => router.push("/register")}
              className="bg-electric rounded-full px-8 py-4 text-sm font-extrabold uppercase tracking-[0.22em] text-white"
            >
              Get your paymoji
            </a>
            <a
              href="#features"
              className="rounded-full border border-white/12 bg-white/5 px-8 py-4 text-sm font-extrabold uppercase tracking-[0.22em] text-white/85"
            >
              Explore features
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <div className="text-xl font-black tracking-[-0.08em] text-white">
              paymoji<span className="text-gradient-sol">.sol</span>
            </div>
            <p className="mt-2 text-sm text-white/45">
              Digital identity for the emoji generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-white/55">
            <a href="#" className="transition-colors hover:text-white">
              Twitter
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Discord
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Docs
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
