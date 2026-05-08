"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// Reusable glass card component for consistent styling
function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-surface rounded-2xl p-6 ${className ?? ""}`}>
      {children}
    </div>
  );
}

// Transaction status badge
function StatusBadge({ status }: { status: "success" | "pending" }) {
  const colors =
    status === "success"
      ? "bg-green-500/20 text-green-300"
      : "bg-amber-500/20 text-amber-300";
  return (
    <span
      className={`ml-4 px-2 py-0.5 rounded text-xs font-semibold ${colors}`}
    >
      {status}
    </span>
  );
}

export default function WalletDashboard() {
  // Mocked data – replace with real SDK calls later
  const [address] = useState("4Nd1m3Y5yJHvK9g7fF2dQ8hT9LkBvZc3xW6pQaR2");
  const [balance, setBalance] = useState("0.00 SOL");
  const [transactions, setTransactions] = useState<
    {
      id: string;
      from: string;
      to: string;
      amount: string;
      status: "success" | "pending";
    }[]
  >([]);

  useEffect(() => {
    // TODO: integrate Okto SDK / Helium RPC
    setBalance("12.34 SOL");
    setTransactions([
      {
        id: "tx1",
        from: "3Cw7…",
        to: `${address.slice(0, 4)}…`,
        amount: "0.5 SOL",
        status: "success",
      },
      {
        id: "tx2",
        from: `${address.slice(0, 4)}…`,
        to: "5Jk9…",
        amount: "1.2 SOL",
        status: "pending",
      },
    ]);
  }, [address]);

  return (
    <main className="relative isolate overflow-hidden min-h-screen">
      {/* Shared background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

      <section className="mx-auto max-w-5xl py-12 px-6 space-y-12">
        {/* Wallet header */}
        <GlassCard className="text-center">
          <h1 className="text-4xl font-black text-white mb-4">
            Your Paymoji Wallet
          </h1>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-white/70 mb-4">
            <span className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_14px_rgba(93,230,255,0.9)]" />
            {address}
          </div>
          <p className="text-3xl font-bold text-white">{balance}</p>
        </GlassCard>

        {/* Action buttons – keep same styling as other pages */}
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <Link
            href="/send"
            className="bg-electric rounded-full px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(0,203,230,0.2)] transition-transform hover:scale-[1.02]"
          >
            Send Paymoji
          </Link>
          <Link
            href="/receive"
            className="bg-primary rounded-full px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(219,111,255,0.2)] transition-transform hover:scale-[1.02]"
          >
            Receive Paymoji
          </Link>
        </div>

        {/* Recent activity */}
        <GlassCard className="neon-glow-cyan">
          <h2 className="text-2xl font-black text-white mb-4">
            Recent Activity
          </h2>
          <ul className="space-y-4">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between text-sm text-white/80"
              >
                <div className="flex-1">
                  <span className="font-medium text-white">{tx.amount}</span>{" "}
                  from <span className="text-white/60">{tx.from}</span> to{" "}
                  <span className="text-white/60">{tx.to}</span>
                </div>
                <StatusBadge status={tx.status} />
              </li>
            ))}
            {transactions.length === 0 && (
              <li className="text-center text-white/50">
                No transactions yet.
              </li>
            )}
          </ul>
        </GlassCard>
      </section>
    </main>
  );
}
