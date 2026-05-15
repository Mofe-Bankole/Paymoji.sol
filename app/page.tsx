"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ── Transaction feed data ───────────────────────────────────────────────────
const FEED = [
  {
    combo: "🐉🌙⚡",
    name: "stormdragon.paymoji.sol",
    action: "sent",
    amount: "2.5 SOL",
    time: "just now",
  },
  {
    combo: "🦁🔥💎",
    name: "lionflame.paymoji.sol",
    action: "received",
    amount: "50 USDC",
    time: "12s ago",
  },
  {
    combo: "🌊🦋🏔",
    name: "waverift.paymoji.sol",
    action: "sent",
    amount: "0.1 SOL",
    time: "1m ago",
  },
  {
    combo: "🦊🐬🦚",
    name: "happyfox.paymoji.sol",
    action: "received",
    amount: "5 SOL",
    time: "2m ago",
  },
  {
    combo: "⚡🦈💀",
    name: "deepfin.paymoji.sol",
    action: "sent",
    amount: "0.3 SOL",
    time: "3m ago",
  },
  {
    combo: "🎯🌙⚙",
    name: "targetmoon.paymoji.sol",
    action: "received",
    amount: "1 SOL",
    time: "5m ago",
  },
  {
    combo: "🧊🔮🌙",
    name: "frostmage.paymoji.sol",
    action: "sent",
    amount: "12 USDC",
    time: "7m ago",
  },
  {
    combo: "🔥🦈💀",
    name: "sharkfire.paymoji.sol",
    action: "received",
    amount: "100 USDC",
    time: "9m ago",
  },
];

const TECH = [
  { name: "Solana", desc: "Sub-second settlement, near-zero fees" },
  { name: "Metaplex", desc: "Core NFT — your emoji identity on-chain" },
  { name: "Privy", desc: "Embedded wallets, Google login, no seed phrase" },
  { name: "Helius", desc: "RPC + instant emoji resolution" },
  { name: "Bonfida SNS", desc: "Subdomain under paymoji.sol" },
  { name: "Jupiter", desc: "Auto-swap any token on send" },
];

const STEPS = [
  {
    n: "01",
    title: "Google login",
    sub: "No seed phrase. No wallet install.",
    emoji: "🔑",
  },
  {
    n: "02",
    title: "Pick 3 emojis",
    sub: "46 billion combos. Only one is yours.",
    emoji: "🎨",
  },
  {
    n: "03",
    title: "AI names you",
    sub: "Generates your .sol handle instantly.",
    emoji: "✨",
  },
  {
    n: "04",
    title: "NFT minted",
    sub: "On Solana Devnet. You own it.",
    emoji: "💎",
  },
];

const MARQUEE_TECH = [
  "Built on Solana",
  "Metaplex Core NFTs",
  "Privy Embedded Wallets",
  "Helius RPC",
  "Bonfida SNS",
  "Jupiter Swap",
  "MagicBlock Privacy",
];

const MARQUEE_EMOJI = [
  "🦊🐬🦚",
  "🐉🌙⚡",
  "🦁🔥💎",
  "🌊🦋🏔",
  "🎯🌙⚙",
  "🧊🔮🌙",
  "⚡🦋🎭",
  "🔥🦈💀",
  "🦄🌈🔮",
  "🎪🦋🌙",
  "🐺⚡🎯",
  "🦅🔥💫",
];

// ── Fade-in-up on scroll ────────────────────────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function FadeSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: "translateY(32px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      {children}
    </div>
  );
}

// ── Live feed ───────────────────────────────────────────────────────────────
function LiveFeed() {
  const [items, setItems] = useState(FEED);
  const [fading, setFading] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const next = FEED[Math.floor(Math.random() * FEED.length)];
      setFading(0);
      setTimeout(() => {
        setItems((prev) => [next, ...prev.slice(0, 5)]);
        setFading(null);
      }, 300);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mt-14 space-y-2">
      {items.slice(0, 5).map((tx, i) => (
        <div
          key={`${tx.name}-${i}`}
          className="flex items-center gap-4 border border-white/8 bg-white/[0.025] px-5 py-3"
          style={{
            opacity: i === 0 && fading === 0 ? 0 : 1,
            transform:
              i === 0 && fading === 0 ? "translateY(-8px)" : "translateY(0)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          <span className="text-2xl leading-none flex-shrink-0">
            {tx.combo}
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-white/80">
              {tx.name}
            </span>
            <span className="text-sm text-white/40"> {tx.action} </span>
            <span
              className={`text-sm font-bold ${tx.action === "received" ? "text-[#5de6ff]" : "text-white/60"}`}
            >
              {tx.amount}
            </span>
          </div>
          <span className="text-xs text-white/25 flex-shrink-0">{tx.time}</span>
        </div>
      ))}
    </div>
  );
}

// ── Blink mock ──────────────────────────────────────────────────────────────
function BlinkMock() {
  return (
    <div className="border border-white/10 bg-white/[0.02]  w-full">
      <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b76dff] to-[#00cbe6] flex items-center justify-center text-sm">
          P
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Paymoji</p>
          <p className="text-xs text-white/35">@paymojionsol</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-white/60 mb-3">
          Pay 🦊🐬🦚 directly from X — no wallet needed
        </p>
        <div className="border border-white/10 bg-white/[0.03] p-4 mb-3 text-center">
          <p className="text-3xl mb-1">🦊🐬🦚</p>
          <p className="text-sm font-semibold text-white">
            foxwave.paymoji.sol
          </p>
          <p className="text-xs text-white/35 font-mono mt-0.5">
            2BrEDJ3...o34R
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {["0.1 SOL", "0.5 SOL", "1 SOL"].map((amt) => (
            <button
              key={amt}
              className="border border-white/10 bg-white/[0.03] py-2 text-xs text-white/70 hover:bg-white/[0.08] transition-colors"
            >
              {amt}
            </button>
          ))}
        </div>
        <button className="w-full py-2 bg-gradient-to-r from-[#b76dff] to-[#00cbe6] text-xs font-bold text-white">
          Custom amount
        </button>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main
      className="relative min-h-screen bg-[#0b1326] text-white overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_5%_10%,_rgba(183,109,255,0.22),_transparent_35%),radial-gradient(circle_at_90%_15%,_rgba(0,203,230,0.16),_transparent_30%)]" />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0b1326]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-white"
          >
            Paymoji
            <span className="bg-gradient-to-r from-[#b76dff] to-[#00cbe6] bg-clip-text text-transparent">
              .sol
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/50">
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              How it works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#blinks" className="hover:text-white transition-colors">
              Blinks
            </a>
          </nav>
          <Link
            href="/register"
            className="bg-gradient-to-r from-[#b76dff] to-[#00cbe6] px-5 py-2 text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
          >
            Claim your identity
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-24 pb-16 text-center">
        <div
          className="inline-block border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/50 mb-8"
          style={{ animation: "fadeUp 0.6s ease forwards", opacity: 0 }}
        >
          Live on Solana Devnet
        </div>

        <h1
          className="text-[clamp(40px,8vw,80px)] font-black tracking-tight leading-[1.02] mb-6"
          style={{ animation: "fadeUp 0.7s 0.1s ease forwards", opacity: 0 }}
        >
          Send crypto to <span className="whitespace-nowrap">🦊🐬🦚</span>
          <br />
          <span className="text-white/30">not 7xK9...mR3q</span>
        </h1>

        <p
          className="text-lg text-white/55 max-w-4xl mt-5 leading-relaxed mb-10"
          style={{ animation: "fadeUp 0.7s 0.2s ease forwards", opacity: 0 }}
        >
          Every person on earth gets a unique 3-emoji Solana identity. Claim
          yours in 30 seconds. No seed phrase. No wallet install.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-3"
          style={{ animation: "fadeUp 0.7s 0.3s ease forwards", opacity: 0 }}
        >
          <Link
            href="/register"
            className="bg-gradient-to-r from-[#b76dff] to-[#00cbe6] px-8 py-3.5 text-sm font-bold tracking-wide hover:opacity-90 transition-all hover:scale-[1.02]"
          >
            Claim your identity →
          </Link>
          <a
            href="#how-it-works"
            className="border border-white/15 px-8 py-3.5 text-sm font-bold text-white/70 hover:text-white hover:border-white/30 transition-colors"
          >
            See how it works
          </a>
        </div>

        <div
          style={{ animation: "fadeUp 0.8s 0.4s ease forwards", opacity: 0 }}
        >
          <LiveFeed />
        </div>
      </section>

      {/* ── Marquee ── */}
      <section className="border-y border-white/[0.06] bg-white/[0.015] py-4 overflow-hidden">
        <div className="flex gap-10 animate-marquee whitespace-nowrap mb-3">
          {[...MARQUEE_TECH, ...MARQUEE_TECH].map((item, i) => (
            <span
              key={i}
              className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 flex-shrink-0"
            >
              {item} <span className="text-white/15 mx-4">·</span>
            </span>
          ))}
        </div>
        <div
          className="flex gap-8"
          style={{
            animation: "marqueeReverse 18s linear infinite",
            whiteSpace: "nowrap",
          }}
        >
          {[...MARQUEE_EMOJI, ...MARQUEE_EMOJI].map((item, i) => (
            <span key={i} className="text-2xl flex-shrink-0">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Three Pillars ── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <FadeSection>
          <p className="text-xs uppercase tracking-widest text-white/35 text-center mb-3">
            The foundation
          </p>
          <h2 className="text-center text-4xl font-black tracking-tight text-white mb-16">
            Built for humans.
            <br className="hidden sm:block" /> Ready for everyone.
          </h2>
        </FadeSection>

        <div className="grid md:grid-cols-3 gap-0 border border-white/8">
          {[
            {
              num: "01",
              title: "Identity",
              headline: "Your 3 emojis. Forever.",
              desc: "Pick any combo from 46 billion possibilities. Minted as a Metaplex Core NFT. Yours on-chain. Nobody else can claim it.",
              emoji: "🦊🐬🦚",
            },
            {
              num: "02",
              title: "Payments",
              headline: "Send money like texting.",
              desc: "Type 3 emojis, enter an amount, hit send. Resolves to any Solana wallet instantly via Helius. Works with SOL, USDC, any token.",
              emoji: "⚡",
            },
            {
              num: "03",
              title: "Privacy",
              headline: "Anonimoji. Your choice.",
              desc: "Toggle private mode. MagicBlock's Private Ephemeral Rollup shields amounts and counterparts. Zero on-chain link between sender and receiver.",
              emoji: "👻",
            },
          ].map((p, i) => (
            <FadeSection
              key={i}
              className={`p-8 ${i > 0 ? "border-l border-white/8" : ""}`}
            >
              <p className="text-xs font-bold tracking-widest text-white/25 uppercase mb-6">
                {p.num} · {p.title}
              </p>
              <p className="text-4xl mb-5 leading-none">{p.emoji}</p>
              <h3 className="text-xl font-black text-white mb-3 tracking-tight">
                {p.headline}
              </h3>
              <p className="text-sm text-white/45 leading-relaxed">{p.desc}</p>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="border-y border-white/[0.06] bg-white/[0.01] py-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          <FadeSection>
            <p className="text-xs uppercase tracking-widest text-white/35 text-center mb-3">
              The flow
            </p>
            <h2 className="text-center text-4xl font-black tracking-tight text-white mb-16">
              Zero to identity in 30 seconds.
            </h2>
          </FadeSection>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-0 border border-white/8">
            {STEPS.map((s, i) => (
              <FadeSection
                key={i}
                className={`p-8 ${i > 0 ? "border-l border-white/8 border-t-0 sm:border-t-0" : ""}`}
                // style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <p className="text-xs font-bold tracking-widest text-white/20 uppercase mb-6">
                  {s.n}
                </p>
                <p className="text-4xl mb-4 leading-none">{s.emoji}</p>
                <h3 className="text-base font-black text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.sub}</p>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Send Flow Demo ── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <FadeSection>
            {/* Mock send UI */}
            <div className="border border-white/10 bg-white/[0.02]">
              <div className="border-b border-white/8 px-5 py-3">
                <p className="text-xs uppercase tracking-widest text-white/30">
                  Send
                </p>
              </div>
              <div className="p-5 space-y-3">
                <div className="border border-white/10 bg-black/20 flex items-center gap-3 px-4 py-3">
                  <span className="text-2xl">🦊🐬🦚</span>
                  <span className="text-sm text-white/50">
                    foxwave.paymoji.sol
                  </span>
                  <span className="ml-auto text-xs text-[#5de6ff] border border-[#5de6ff]/20 px-2 py-0.5">
                    Available
                  </span>
                </div>
                <div className="border border-white/10 bg-black/20 flex items-center gap-3 px-4 py-2">
                  <span className="text-2xl font-bold text-white">5</span>
                  <span className="text-sm text-white/30">SOL</span>
                  <span className="ml-auto text-xs text-white/25">≈ $730</span>
                </div>
                <div className="border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs text-white/30 mb-1">Resolves to</p>
                  <p className="text-xs font-mono text-white/50">
                    2BrEDJ3mrJ2ev14YgeW2g9LWYLdQCaR9m4ZpSQqEo34R
                  </p>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-[#b76dff] to-[#00cbe6] text-sm font-bold hover:opacity-90 transition-opacity">
                  Send 5 SOL →
                </button>
              </div>
            </div>
          </FadeSection>

          <FadeSection>
            <p className="text-xs uppercase tracking-widest text-white/30 mb-4">
              Send flow
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white mb-5">
              Send to anyone.
              <br />
              Even if you don't know their wallet.
            </h2>
            <div className="space-y-4">
              {[
                {
                  emoji: "⚡",
                  text: "Resolves emoji → wallet instantly via Supabase + Helius",
                },
                {
                  emoji: "🔄",
                  text: "Jupiter auto-swap — send any token, receiver gets what they want",
                },
                {
                  emoji: "👻",
                  text: "Toggle Anonimoji for private sends via MagicBlock",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 border border-white/8 bg-white/[0.02] px-4 py-4"
                >
                  <span className="text-xl flex-shrink-0">{item.emoji}</span>
                  <p className="text-sm text-white/55 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── Blinks ── */}
      <section
        id="blinks"
        className="border-y border-white/[0.06] bg-white/[0.01] py-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeSection>
              <p className="text-xs uppercase tracking-widest text-white/30 mb-4">
                Solana Blinks
              </p>
              <h2 className="text-3xl font-black tracking-tight text-white mb-5">
                Your identity.blinks
                <br />
                Shareable anywhere.
              </h2>
              <p className="text-sm text-white/45 leading-relaxed mb-6">
                Every Paymoji identity generates a Solana Action — a shareable
                link that renders a payment card inside X/Twitter, Telegram, and
                any Blink-compatible client.
              </p>
              <div className="space-y-3">
                {[
                  "Works inside X/Twitter with the Dialect extension",
                  "Recipients pay without leaving the page",
                  "Pre-set amounts or custom — your choice",
                ].map((txt, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-white/45"
                  >
                    <span className="text-[#5de6ff] flex-shrink-0">✓</span>
                    {txt}
                  </div>
                ))}
              </div>
              <div className="mt-6 border border-white/8 bg-black/20 px-4 py-3 font-mono text-xs text-white/30 overflow-x-auto">
                paymoji.xyz/api/actions/pay/🦊🐬🦚
              </div>
            </FadeSection>

            <FadeSection className="flex justify-center md:justify-end">
              <BlinkMock />
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <FadeSection>
          <p className="text-xs uppercase tracking-widest text-white/30 text-center mb-3">
            The stack
          </p>
          <h2 className="text-center text-4xl font-black tracking-tight text-white mb-16">
            Built on the best of Solana.
          </h2>
        </FadeSection>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-0 border border-white/8">
          {TECH.map((t, i) => (
            <FadeSection
              key={i}
              className={`p-6 ${i % 3 !== 0 ? "border-l border-white/8" : ""} ${i >= 3 ? "border-t border-white/8" : ""}`}
            >
              <p className="text-sm font-black text-white mb-1">{t.name}</p>
              <p className="text-xs text-white/35 leading-relaxed">{t.desc}</p>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <FadeSection>
          <div className="border border-white/8 bg-white/[0.02] p-16 text-center relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(183,109,255,0.12),_transparent_60%)]" />
            <p className="text-6xl mb-6">🦊🐬🦚</p>
            <h2 className="text-4xl font-black tracking-tight text-white mb-3">
              Your 3 emojis are waiting.
            </h2>
            <p className="text-white/45 mb-10 text-lg">
              46 billion combinations. Only one is yours.
            </p>
            <Link
              href="/register"
              className="inline-block bg-gradient-to-r from-[#b76dff] to-[#00cbe6] px-10 py-4 text-sm font-black tracking-widest uppercase hover:opacity-90 transition-all hover:scale-[1.02]"
            >
              Claim your identity
            </Link>
          </div>
        </FadeSection>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-lg font-black text-white">
              Paymoji
              <span className="bg-gradient-to-r from-[#b76dff] to-[#00cbe6] bg-clip-text text-transparent">
                .sol
              </span>
            </p>
            <p className="text-xs text-white/30 mt-1">
              Built on Solana Devnet · Made in Lagos 🇳🇬
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/35">
            <a
              href="https://twitter.com/paymojionsol"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://github.com/Mofe-Bankole/Paymoji.sol"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marqueeReverse {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </main>
  );
}
