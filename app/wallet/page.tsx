"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { PAYMOJI_BRAND_IMAGE_URL } from "@/lib/paymojiBrand";
import { usePrivyWallet } from "../../privy/PrivyProvider";

const CLUSTER = "devnet" as const;
const TX_LIMIT = 25;

function formatSolFromLamports(lamports: number): string {
  const sol = lamports / 1e9;
  if (!Number.isFinite(sol)) return "—";
  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

function shortenAddress(addr: string, head = 4, tail = 4): string {
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

function formatRelativeTime(blockTimeSec: number | null | undefined): string {
  if (blockTimeSec == null) return "—";
  const now = Date.now() / 1000;
  const diff = Math.max(0, now - blockTimeSec);
  if (diff < 45) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(blockTimeSec * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`;
}

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-surface rounded-[28px] p-6 md:p-8 ${className ?? ""}`}>
      {children}
    </div>
  );
}

type SignatureRow = {
  signature: string;
  blockTime: number | null;
  err: unknown;
};

type WalletIdentity = {
  emoji_combo: string;
  sol_name: string | null;
  nft_address: string | null;
};

function explorerAddressUrl(pubkey: string): string {
  return `https://explorer.solana.com/address/${pubkey}?cluster=${CLUSTER}`;
}

export default function WalletPage() {
  const {
    connection,
    address,
    publicKey,
    isReady,
    isLoggedIn,
    login,
    logout,
  } = usePrivyWallet();

  const [balanceLamports, setBalanceLamports] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [history, setHistory] = useState<SignatureRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [identity, setIdentity] = useState<WalletIdentity | null>(null);
  const [identityLoading, setIdentityLoading] = useState(false);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!publicKey) return;

    let cancelled = false;
    (async () => {
      setBalanceLoading(true);
      try {
        const lamports = await connection.getBalance(publicKey);
        if (!cancelled) setBalanceLamports(lamports);
      } catch {
        if (!cancelled) setBalanceLamports(null);
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [connection, publicKey, refreshKey]);

  useEffect(() => {
    if (!publicKey) return;

    let cancelled = false;
    (async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const sigs = await connection.getSignaturesForAddress(publicKey, {
          limit: TX_LIMIT,
        });
        if (cancelled) return;
        setHistory(
          sigs.map((s) => ({
            signature: s.signature,
            blockTime: s.blockTime ?? null,
            err: s.err,
          })),
        );
      } catch (e) {
        if (!cancelled) {
          setHistory([]);
          setHistoryError(
            e instanceof Error ? e.message : "Could not load activity.",
          );
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [connection, publicKey, refreshKey]);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;
    (async () => {
      setIdentityLoading(true);
      try {
        const res = await fetch(
          `/api/identity?wallet=${encodeURIComponent(address)}`,
        );
        const json: { identity?: WalletIdentity | null } = await res.json();
        if (!cancelled) setIdentity(json.identity ?? null);
      } catch {
        if (!cancelled) setIdentity(null);
      } finally {
        if (!cancelled) setIdentityLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, refreshKey]);

  const copyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [address]);

  const balanceLabel = useMemo(() => {
    if (balanceLamports === null && balanceLoading) return "…";
    if (balanceLamports === null) return "—";
    return formatSolFromLamports(balanceLamports);
  }, [balanceLamports, balanceLoading]);

  if (!isReady) {
    return (
      <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />
        <Loader2
          className="h-10 w-10 animate-spin text-secondary"
          aria-hidden
        />
        <span className="sr-only">Loading wallet</span>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="relative isolate min-h-screen overflow-hidden px-6 py-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

        <div className="mx-auto max-w-md text-center">
          <GlassCard>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
              <Wallet className="h-8 w-8 text-primary" aria-hidden />
            </div>
            <h1 className="text-2xl font-black tracking-[-0.06em] text-white md:text-3xl">
              Your Paymoji wallet
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Sign in to see your Solana balance, receive with a QR code, and
              review recent on-chain activity.
            </p>
            <button
              type="button"
              onClick={() => login()}
              className="mt-8 w-full rounded-full bg-electric py-3.5 text-sm font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_0_30px_rgba(0,203,230,0.2)] transition-transform hover:scale-[1.02]"
            >
              Sign in
            </button>
            <Link
              href="/"
              className="mt-6 inline-block text-sm font-semibold text-secondary transition-colors hover:text-white"
            >
              ← Back to home
            </Link>
          </GlassCard>
        </div>
      </main>
    );
  }

  if (!address || !publicKey) {
    return (
      <main className="relative isolate flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />
        <Loader2
          className="h-10 w-10 animate-spin text-secondary"
          aria-hidden
        />
        <p className="text-sm text-on-surface-variant">
          Preparing your Solana wallet…
        </p>
      </main>
    );
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="text-lg font-black tracking-[-0.08em] text-white md:text-xl"
          >
            Paymoji
          </Link>
          <nav className="flex items-center gap-3 text-sm font-semibold">
            <Link
              href="/send"
              className="rounded-full px-4 py-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              Send
            </Link>
            <span className="rounded-full bg-white/10 px-4 py-2 text-white">
              Wallet
            </span>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-6 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/80">
              Devnet
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-white md:text-4xl">
              Wallet
            </h1>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={balanceLoading || historyLoading}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 disabled:opacity-50"
            aria-label="Refresh balance and activity"
          >
            <RefreshCw
              className={`h-4 w-4 ${balanceLoading || historyLoading ? "animate-spin" : ""}`}
              aria-hidden
            />
            Refresh
          </button>
        </div>

        <GlassCard>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface-variant">
                Available balance
              </p>
              <p className="mt-1 text-4xl font-black tracking-[-0.04em] text-white tabular-nums md:text-5xl">
                {balanceLabel}
                <span className="ml-2 text-xl font-bold text-secondary md:text-2xl">
                  SOL
                </span>
              </p>
            </div>
            <Link
              href="/send"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-electric px-8 py-3.5 text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_0_30px_rgba(0,203,230,0.2)] transition-transform hover:scale-[1.02]"
            >
              Send
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Address
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <code className="min-w-0 flex-1 break-all rounded-2xl border border-white/10 bg-black/25 px-4 py-3 font-mono text-sm text-white/90">
                {address}
              </code>
              <button
                type="button"
                onClick={copyAddress}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                aria-label="Copy wallet address"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-secondary" aria-hidden />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </GlassCard>

        {(identityLoading || identity?.nft_address) && (
          <GlassCard>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary/80">
              Your identity
            </p>
            {identityLoading ? (
              <div className="mt-6 flex items-center gap-3 text-on-surface-variant">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                <span className="text-sm">Loading Paymoji…</span>
              </div>
            ) : identity?.nft_address ? (
              <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center">
                <div className="relative mx-auto w-full max-w-[220px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_20px_50px_rgba(0,0,0,0.35)] md:mx-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote avatar / brand URL */}
                  <img
                    src={PAYMOJI_BRAND_IMAGE_URL}
                    alt="Paymoji"
                    width={400}
                    height={400}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <p className="text-4xl font-black tracking-[-0.06em] text-white md:text-5xl">
                    {identity.emoji_combo}
                  </p>
                  {identity.sol_name ? (
                    <p className="text-lg font-semibold text-secondary">
                      {identity.sol_name}
                    </p>
                  ) : null}
                  <p className="text-sm text-on-surface-variant">
                    Your Paymoji NFT is on Solana devnet. This art matches your
                    on-chain metadata (
                    <a
                      href="https://x.com/paymojionsol"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      @paymojionsol
                    </a>
                    ).
                  </p>
                  <a
                    href={explorerAddressUrl(identity.nft_address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-white"
                  >
                    View NFT on Explorer
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </div>
            ) : null}
          </GlassCard>
        )}

        <GlassCard>
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="w-full max-w-sm space-y-2 lg:max-w-xs">
              <h2 className="text-lg font-bold tracking-[-0.04em] text-white">
                Receive
              </h2>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                Scan this code to send SOL or tokens to this wallet on devnet.
              </p>
            </div>

            <div className="flex flex-col items-center gap-5">
              <div
                className="rounded-[32px] bg-[linear-gradient(135deg,#ddb7ff_0%,#00cbe6_50%,#ffafd3_100%)] p-[3px] shadow-[0_24px_64px_rgba(0,0,0,0.35)]"
                aria-hidden
              >
                <div className="rounded-[29px] bg-surface-container-lowest p-6 md:p-8">
                  <div className="rounded-2xl bg-white p-4 shadow-inner ring-1 ring-black/5">
                    <QRCode
                      value={address}
                      size={192}
                      level="M"
                      fgColor="#0b1326"
                      bgColor="#ffffff"
                    />
                  </div>
                </div>
              </div>
              <p className="text-center font-mono text-xs text-white/50">
                {shortenAddress(address, 6, 6)}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-8">
            <h2 className="text-lg font-bold tracking-[-0.04em] text-white">
              Recent activity
            </h2>
            {history.length > 0 ? (
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                Last {history.length}
              </span>
            ) : null}
          </div>

          <div className="px-6 py-4 md:px-8">
            {historyError ? (
              <p className="text-sm text-error">{historyError}</p>
            ) : historyLoading && history.length === 0 ? (
              <div className="flex items-center justify-center gap-3 py-12 text-on-surface-variant">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                <span className="text-sm">Loading transactions…</span>
              </div>
            ) : history.length === 0 ? (
              <p className="py-10 text-center text-sm text-on-surface-variant">
                No transactions yet. Fund this wallet on devnet or send your
                first payment to see activity here.
              </p>
            ) : (
              <ul className="divide-y divide-white/8">
                {history.map((row) => {
                  const ok = row.err == null;
                  return (
                    <li key={row.signature}>
                      <a
                        href={explorerTxUrl(row.signature)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 py-4 transition-colors hover:bg-white/[0.03] md:-mx-2 md:rounded-xl md:px-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm text-white/90">
                              {shortenAddress(row.signature, 6, 6)}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                                ok
                                  ? "bg-secondary/15 text-secondary"
                                  : "bg-error/15 text-error"
                              }`}
                            >
                              {ok ? "Success" : "Failed"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-white/45">
                            {formatRelativeTime(row.blockTime)}
                          </p>
                        </div>
                        <ExternalLink
                          className="h-4 w-4 shrink-0 text-white/35 transition-colors group-hover:text-secondary"
                          aria-hidden
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </GlassCard>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <Link
            href="/"
            className="text-sm font-semibold text-white/55 transition-colors hover:text-white"
          >
            ← Home
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="text-sm font-semibold text-white/55 transition-colors hover:text-error"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
