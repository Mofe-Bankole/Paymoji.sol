"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, SendHorizontal, ExternalLink } from "lucide-react";

type Identity = {
  wallet: string;
  sol_name: string;
  emoji_combo: string;
};

export default function PayMonikerPage() {
  const params = useParams();
  const moniker = params.moniker as string;

  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!moniker) return;
    let dead = false;
      fetch(`/api/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: moniker }),
      })
      .then((r) => r.json())
      .then((data) => {
        if (!dead) {
          if (data.wallet) {
            setIdentity({
              wallet: data.wallet,
              sol_name: data.sol_name ?? "",
              emoji_combo: data.emoji_combo ?? moniker,
            });
          } else {
            setError("Paymoji identity not found");
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (!dead) {
          setError("Failed to load identity");
          setLoading(false);
        }
      });
    return () => { dead = true; };
  }, [moniker]);

  if (loading) {
    return (
      <main className="relative isolate flex min-h-screen items-center justify-center bg-[#0b1326]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%)]" />
        <Loader2 className="h-8 w-8 animate-spin text-[#5de6ff]" />
      </main>
    );
  }

  if (error || !identity) {
    return (
      <main className="relative isolate flex min-h-screen items-center justify-center bg-[#0b1326] text-white px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%)]" />
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-4">❓</p>
          <h1 className="text-2xl font-black mb-2">Not found</h1>
          <p className="text-white/50 text-sm mb-6">
            {error || "This Paymoji identity doesn't exist yet."}
          </p>
          <Link
            href="/register"
            className="inline-block bg-gradient-to-r from-[#b76dff] to-[#00cbe6] px-6 py-3 text-sm font-bold hover:opacity-90"
          >
            Claim yours
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen bg-[#0b1326] text-white"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_5%_10%,_rgba(183,109,255,0.22),_transparent_35%),radial-gradient(circle_at_90%_15%,_rgba(0,203,230,0.16),_transparent_30%)]" />

      <div className="mx-auto max-w-lg px-6 py-16">
        {/* Identity card */}
        <div className="border border-white/10 bg-white/[0.02] text-center p-8 mb-6">
          <p className="text-7xl mb-4 leading-none">{identity.emoji_combo}</p>
          <h1 className="text-2xl font-black text-white mb-2">
            {identity.sol_name || identity.emoji_combo}
          </h1>
          <p className="text-xs font-mono text-white/40 mb-6 break-all">
            {identity.wallet}
          </p>

          <div className="space-y-3">
            <p className="text-sm text-white/50">Send SOL instantly</p>
            <div className="grid grid-cols-3 gap-2">
              {["0.1", "0.5", "1"].map((amt) => (
                <Link
                  key={amt}
                  href={`/wallet/send?to=${encodeURIComponent(identity.emoji_combo)}&amount=${amt}`}
                  className="border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold hover:bg-white/[0.08] transition-colors"
                >
                  {amt} SOL
                </Link>
              ))}
            </div>
            <Link
              href={`/wallet/send?to=${encodeURIComponent(identity.emoji_combo)}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#b76dff] to-[#00cbe6] text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Custom amount <SendHorizontal className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Blinks / Actions info */}
        <div className="border border-white/8 bg-white/[0.01] p-5">
          <p className="text-xs uppercase tracking-widest text-white/30 mb-2">
            Solana Action
          </p>
          <p className="text-xs text-white/30 font-mono break-all bg-black/20 px-3 py-2 border border-white/8">
            {typeof window !== "undefined" &&
              `${window.location.origin}/api/actions/pay/${moniker}`}
          </p>
          <p className="text-xs text-white/25 mt-2">
            Paste this link in any Blink-compatible client (X/Twitter, Telegram)
            to send payments without leaving the page.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            ← Powered by Paymoji
          </Link>
        </div>
      </div>
    </main>
  );
}
