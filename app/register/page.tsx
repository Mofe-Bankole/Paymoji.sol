"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { LayoutDashboard, Sparkles } from "lucide-react";

export default function Register() {
  const { login, logout, user } = usePrivy();
  const loggedIn = Boolean(user);

  return (
    <>
      <main className="z-10 mx-auto flex w-full max-w-[480px] flex-col items-center gap-lg px-md py-xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] left-[-10%] h-64 w-64 rounded-full bg-primary-container/20 blur-[80px]" />
          <div className="absolute right-[-10%] bottom-[20%] h-72 w-72 rounded-full bg-secondary/10 blur-[100px]" />
        </div>
        <Link
          href="/"
          className="text-2xl font-black tracking-[-0.08em] text-white"
        >
          Paymoji
        </Link>

        <div className="space-y-sm text-center">
          <div className="mb-sm inline-flex items-center justify-center rounded-full border-white/5 bg-white/5 p-sm glass-surface">
            <span className="font-display-emoji text-display-emoji">
              🚀 🌈 ✨
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-white">
            {loggedIn ? "You're in" : "Welcome back"}
          </h1>
          <p className="mx-auto max-w-[280px] font-body-sm text-body-sm text-on-surface-variant">
            {loggedIn
              ? "Head to your wallet or pick a new emoji trio to claim a Paymoji."
              : "Your Web3 identity is one tap away. Sign in to continue."}
          </p>
        </div>

        <div className="relative w-full space-y-lg overflow-hidden rounded-lg glass-surface p-md shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {!loggedIn ? (
            <>
              <div className="flex rounded-full bg-surface-container-low p-1">
                <button
                  type="button"
                  onClick={() => login()}
                  className="flex-1 rounded-full bg-white/10 px-md py-sm font-label-bold text-label-bold text-white shadow-sm transition-all"
                >
                  LOGIN
                </button>
              </div>
              <button
                type="button"
                onClick={() => login()}
                className="flex w-full items-center justify-center gap-sm rounded-full border-white/10 bg-white/5 py-sm px-md transition-all hover:border-secondary active:scale-[0.98] glass-surface"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- small external brand asset */}
                <img
                  alt="Google"
                  className="h-5 w-5"
                  src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s96-fcrop64=1,00000000ffffffff-rw"
                />
                <span className="font-label-bold text-label-bold uppercase tracking-widest text-white">
                  Continue with Google
                </span>
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/wallet"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-electric py-3.5 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_0_30px_rgba(0,203,230,0.2)] transition-transform hover:scale-[1.02]"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                Open wallet
              </Link>
              <Link
                href="/emogen"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 py-3.5 text-sm font-extrabold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/10"
              >
                <Sparkles className="h-4 w-4 text-secondary" aria-hidden />
                Claim a Paymoji
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="mt-1 w-full py-2 text-center text-xs font-semibold uppercase tracking-widest text-white/45 transition-colors hover:text-white"
              >
                Sign out
              </button>
            </div>
          )}

          <div className="flex flex-col items-center gap-xs pt-sm">
            <p className="cursor-pointer font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-[0.2em] text-slate-500 opacity-60">
              Powered by Privy
            </p>
          </div>
        </div>
      </main>
      <footer className="mx-auto mt-auto flex w-full max-w-[480px] flex-col items-center gap-4 pb-8 pt-4">
        <div className="flex items-center gap-6 opacity-80 transition-all hover:opacity-100">
          <span className="cursor-pointer font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-cyan-400">
            Terms
          </span>
          <span className="cursor-pointer font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-cyan-400">
            Privacy
          </span>
          <span className="cursor-pointer font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-cyan-400">
            Docs
          </span>
        </div>
        <p className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-slate-500">
          © 2026 paymoji.sol
        </p>
      </footer>
      <div className="pointer-events-none fixed top-0 left-0 -z-10 h-full w-full opacity-40">
        <div className="absolute top-[10%] right-[5%] h-[300px] w-[300px] rounded-full bg-primary blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[10%] left-[5%] h-[300px] w-[300px] rounded-full bg-secondary blur-[120px] mix-blend-screen" />
      </div>
    </>
  );
}
