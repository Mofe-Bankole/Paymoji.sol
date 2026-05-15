"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { usePrivyWallet } from "../../privy/PrivyProvider";

const TX_LIMIT = 25;

function formatSol(lamports: number): string {
  const sol = lamports / 1e9;
  if (!Number.isFinite(sol)) return "—";
  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function shorten(addr: string | undefined, h = 4, t = 4): string {
  if (!addr) return "—";
  return addr.length <= h + t + 3
    ? addr
    : `${addr.slice(0, h)}…${addr.slice(-t)}`;
}

function relTime(ts: number | null | undefined): string {
  if (ts == null) return "—";
  const d = Math.max(0, Date.now() / 1000 - ts);
  if (d < 45) return "Just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`;
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

type SigRow = { signature: string; blockTime: number | null; err: unknown };
type Identity = {
  emoji_combo: string;
  sol_name: string | null;
  nft_address: string | null;
};

export default function WalletPage() {
  const { connection, address, publicKey, isReady, isLoggedIn, login, logout } =
    usePrivyWallet();

  const [lamports, setLamports] = useState<number | null>(null);
  const [balLoading, setBalLoading] = useState(true);
  const [history, setHistory] = useState<SigRow[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const [histError, setHistError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sendTo, setSendTo] = useState("");
  const [sendAmt, setSendAmt] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [identity, setIdentity] = useState<Identity | null>(null);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!publicKey) return;
    let dead = false;
    connection
      .getBalance(publicKey)
      .then((l) => {
        if (!dead) setLamports(l);
      })
      .catch(() => {
        if (!dead) setLamports(null);
      })
      .finally(() => {
        if (!dead) setBalLoading(false);
      });
    return () => {
      dead = true;
    };
  }, [connection, publicKey, refreshKey]);

  useEffect(() => {
    if (!publicKey) return;
    let dead = false;
    setHistError(null);
    connection
      .getSignaturesForAddress(publicKey, { limit: TX_LIMIT })
      .then((sigs) => {
        if (dead) return;
        setHistory(
          sigs.map((s) => ({
            signature: s.signature,
            blockTime: s.blockTime ?? null,
            err: s.err,
          })),
        );
      })
      .catch((e) => {
        if (!dead) {
          setHistory([]);
          setHistError(e?.message ?? "Could not load activity.");
        }
      })
      .finally(() => {
        if (!dead) setHistLoading(false);
      });
    return () => {
      dead = true;
    };
  }, [connection, publicKey, refreshKey]);

  useEffect(() => {
    if (!address) return;
    let dead = false;
    fetch(`/api/identity?wallet=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then((j: { identity?: Identity | null }) => {
        if (!dead) setIdentity(j.identity ?? null);
      })
      .catch(() => {
        if (!dead) setIdentity(null);
      });
    return () => {
      dead = true;
    };
  }, [address, refreshKey]);

  const copyAddress = useCallback(async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const balLabel = useMemo(() => {
    if (lamports === null) return balLoading ? "…" : "—";
    return formatSol(lamports);
  }, [lamports, balLoading]);

  // ── Not ready ──────────────────────────────────────────────────────────────
  if (!isReady)
    return (
      <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </main>
    );

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!isLoggedIn)
    return (
      <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />
        <div className="w-full max-w-sm border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-6">
            Paymoji
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white mb-3">
            Your wallet
          </h1>
          <p className="text-sm text-white/50 mb-8 leading-relaxed">
            Sign in to see your balance, receive payments, and review on-chain
            activity.
          </p>
          <button
            onClick={() => login()}
            className="w-full py-3 bg-electric text-white text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
          >
            Sign in
          </button>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-white/40 hover:text-white transition-colors"
          >
            ← Back
          </Link>
        </div>
      </main>
    );

  // ── Main wallet ────────────────────────────────────────────────────────────
  return (
    <main className="relative isolate min-h-screen overflow-hidden pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />

      {/* Nav */}
      <header className="border-b border-white/10 bg-[#0b1326]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-black tracking-tight text-white"
          >
            Paymoji
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link
              href="/wallet/send"
              className="px-4 py-2 text-white/50 hover:text-white transition-colors"
            >
              Send
            </Link>
            <span className="px-4 py-2 bg-white/10 text-white">Wallet</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 pt-8 space-y-0">
        {/* Page title + refresh */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-secondary/70 mb-1">
              Devnet
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Wallet
            </h1>
          </div>
          <button
            onClick={refresh}
            disabled={balLoading || histLoading}
            className="flex items-center gap-2 border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${balLoading || histLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Identity bar — only if identity exists */}
        {identity && (
          <div className="flex items-center gap-4 border border-white/10 bg-white/[0.02] px-5 py-4 mb-0">
            <span className="text-3xl leading-none">
              {identity.emoji_combo}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {identity.sol_name || "—"}
              </p>
              <p className="text-xs text-white/35 font-mono mt-0.5">
                {shorten(address!, 6, 4)}
              </p>
            </div>
            <a
              href={`https://explorer.solana.com/address/${identity.nft_address}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/30 hover:text-secondary transition-colors flex items-center gap-1"
            >
              NFT <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Three-column panel — Balance | Send | Receive */}
        <div className="grid grid-cols-3 border border-white/10 border-t-0">
          {/* Balance */}
          <div className="bg-white/[0.02] p-5 border-r border-white/10">
            <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">
              Balance
            </p>
            <p className="text-4xl font-black tracking-tight text-white leading-none tabular-nums">
              {balLabel}
            </p>
            <p className="text-xs text-white/35 mt-1.5">SOL</p>
            <div className="mt-4 flex flex-col gap-1.5">
              <span className="text-[11px] text-white/35 border border-white/10 px-2 py-1 inline-block w-fit">
                Solana Devnet
              </span>
              {identity?.nft_address && (
                <span className="text-[11px] text-secondary/60 border border-secondary/20 px-2 py-1 inline-block w-fit">
                  NFT owned
                </span>
              )}
            </div>
          </div>

          {/* Send */}
          <div className="bg-white/[0.02] p-5 border-r border-white/10">
            <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">
              Send
            </p>
            <div className="border border-white/10 bg-black/20 flex items-center px-3 py-2 mb-2">
              <input
                type="text"
                placeholder="🔍 emoji combo"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                maxLength={6}
                className="bg-transparent outline-none text-lg text-white placeholder:text-white/25 w-full font-[inherit]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="0.00"
                value={sendAmt}
                onChange={(e) => setSendAmt(e.target.value)}
                className="bg-black/20 border border-white/10 outline-none px-2 py-1.5 text-sm text-white w-20 font-[inherit]"
              />
              <span className="text-xs text-white/35">SOL</span>
              <Link
                href={`/wallet/send${sendTo ? `?to=${encodeURIComponent(sendTo)}` : ""}`}
                className="ml-auto bg-white text-[#0b1326] text-xs font-bold px-4 py-2 flex items-center gap-1 hover:opacity-90 transition-opacity"
              >
                Send <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Receive */}
          <div className="bg-white/[0.02] p-5">
            <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">
              Receive
            </p>
            {address ? (
              <div className="bg-white p-2 w-fit mb-3">
                <QRCode
                  value={address}
                  size={80}
                  level="M"
                  fgColor="#0b1326"
                  bgColor="#ffffff"
                />
              </div>
            ) : null}
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 border border-white/10 bg-black/20 px-2 py-1.5 w-full text-left hover:border-white/20 transition-colors"
            >
              <span className="text-[11px] font-mono text-white/35 flex-1 truncate">
                {shorten(address!, 6, 4)}
              </span>
              {copied ? (
                <Check className="h-3 w-3 text-secondary flex-shrink-0" />
              ) : (
                <Copy className="h-3 w-3 text-white/25 flex-shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Transaction history */}
        <div className="mt-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-0">
            <p className="text-[11px] uppercase tracking-widest text-white/35">
              Recent activity
            </p>
            {history.length > 0 && (
              <p className="text-[11px] text-white/25">Last {history.length}</p>
            )}
          </div>

          <div className="border border-white/10 border-t-0">
            {histError ? (
              <p className="px-5 py-6 text-sm text-red-400">{histError}</p>
            ) : histLoading && history.length === 0 ? (
              <div className="flex items-center justify-center gap-3 py-12 text-white/40">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading transactions…</span>
              </div>
            ) : history.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-white/30">
                No transactions yet. Fund this wallet on devnet to get started.
              </p>
            ) : (
              history.map((row, i) => {
                const ok = row.err == null;
                return (
                  <a
                    key={row.signature}
                    href={`https://explorer.solana.com/tx/${row.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 px-5 py-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors ${i > 0 ? "border-t border-white/[0.06]" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white/80 truncate">
                          {shorten(row.signature, 8, 6)}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 flex-shrink-0 ${ok ? "text-secondary/80 bg-secondary/10" : "text-red-400/80 bg-red-400/10"}`}
                        >
                          {ok ? "OK" : "Fail"}
                        </span>
                      </div>
                      <p className="text-xs text-white/25 mt-1">
                        {relTime(row.blockTime)}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-white/20 flex-shrink-0" />
                  </a>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-8">
          <Link
            href="/"
            className="text-sm text-white/35 hover:text-white transition-colors"
          >
            ← Home
          </Link>
          <button
            onClick={() => logout()}
            className="text-sm text-white/35 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
