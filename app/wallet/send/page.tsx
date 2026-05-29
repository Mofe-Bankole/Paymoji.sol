"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  SendHorizontal,
  ArrowLeft,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { publicPayment } from "@/lib/payments";
import { usePaymojiToast } from "@/components/notifications/paymoji-toast-provider";
import { Connection } from "@solana/web3.js";

const DEVNET_USDC_MINT =
  process.env.NEXT_PUBLIC_USDC_MINT ??
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
type SendStatus = "idle" | "resolving" | "pending" | "success" | "error";
type Token = "SOL" | "USDC";

const QUICK_AMOUNTS = ["0.1", "0.3", "0.5", "0.7", "1", "3", "5"];

// Emoji combo validator — exactly 3 emoji characters
function isEmojiCombo(val: string): boolean {
  const stripped = [...val.trim()];
  return stripped.length === 3;
}

function isValidRecipient(val: string): boolean {
  if (!val.trim()) return false;
  return (
    isEmojiCombo(val) ||
    val.includes(".sol") ||
    /^[1-9A-HJ-NP-Za-km-z]{32,48}$/.test(val)
  );
}

export default function SendPage() {
  const { user } = usePrivy();
  const { wallets, ready } = useWallets();
  const { pushToast } = usePaymojiToast();
  const solanaWallet = wallets[0];
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<Token>("SOL");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [resolvedWallet, setResolvedWallet] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [txSig, setTxSig] = useState("");
  const [feeEstimate, setFeeEstimate] = useState("~0.000005 SOL");
  const [feeLoading, setFeeLoading] = useState(false);

  const amountNumber = Number(amount);
  const isRecipientValid = useMemo(
    () => isValidRecipient(recipient),
    [recipient],
  );
  const isAmountValid = Number.isFinite(amountNumber) && amountNumber > 0;
  const canSubmit =
    isRecipientValid &&
    isAmountValid &&
    status !== "pending" &&
    status !== "resolving";

  // Auto-resolve emoji combo or .sol name as user types
  useEffect(() => {
    if (!isRecipientValid) {
      setResolvedWallet("");
      setResolvedName("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setStatus("resolving");
        const res = await fetch("/api/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: recipient.trim() }),
        });
        const data = await res.json();
        if (data.wallet) {
          setResolvedWallet(data.wallet);
          setResolvedName(data.sol_name || data.emoji_combo || recipient);
          setStatus("idle");
        } else {
          setResolvedWallet("");
          setResolvedName("");
          setStatus("idle");
        }
      } catch {
        setStatus("idle");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [recipient, isRecipientValid]);

  // Compute fee estimate when recipient is resolved
  useEffect(() => {
    if (!resolvedWallet || !amountNumber) {
      setFeeEstimate("~0.000005 SOL");
      return;
    }
    let dead = false;
    (async () => {
      setFeeLoading(true);
      try {
        const conn = new Connection(
          process.env.NEXT_PUBLIC_DEVNET_RPC_URL || "https://api.devnet.solana.com",
          "confirmed",
        );
        const { blockhash } = await conn.getLatestBlockhash();
        const tx = new (await import("@solana/web3.js")).Transaction();
        tx.recentBlockhash = blockhash;
        tx.feePayer = new (await import("@solana/web3.js")).PublicKey(solanaWallet?.address || "11111111111111111111111111111111");
        const message = tx.compileMessage();
        const fee = await conn.getFeeForMessage(message);
        const feeSol = (fee.value || 5000) / 1e9;
        if (!dead) {
          setFeeEstimate(`~${feeSol.toFixed(8)} SOL`);
        }
      } catch {
        if (!dead) setFeeEstimate("~0.000005 SOL");
      } finally {
        if (!dead) setFeeLoading(false);
      }
    })();
    return () => { dead = true; };
  }, [resolvedWallet, amountNumber, solanaWallet?.address]);

  const reset = () => {
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (!ready || !solanaWallet?.address) {
      setStatus("error");
      setErrorMessage("Connect your Solana wallet to send.");
      return;
    }

    const toWallet = resolvedWallet.trim();
    if (!toWallet) {
      setStatus("error");
      setErrorMessage(
        "Could not resolve recipient. Check the address or emoji.",
      );
      return;
    }

    setStatus("pending");
    setErrorMessage("");

    try {
      const result = await publicPayment(
        {
          mode: "public",
          amount: amountNumber,
          recipient: toWallet,
          network: "devnet",
          chain: "solana",
          token: token === "USDC" ? DEVNET_USDC_MINT : "SOL",
          publicKey: solanaWallet.address,
        },
        solanaWallet,
      );

      if (result.status !== "successful" || !result.id) {
        throw new Error(result.error || "Transfer failed.");
      }

      setTxSig(result.id);
      setStatus("success");

      pushToast({
        kind: "info",
        title: "Payment sent",
        message: `${amount} ${token} → ${resolvedName || recipient}`,
        href: `https://explorer.solana.com/tx/${result.id}?cluster=devnet`,
      });

      void fetch("/api/notifications/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientWallet: toWallet,
          senderWallet: solanaWallet.address,
          amount: amountNumber,
          token,
        }),
      });

      void fetch("/api/payments/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_wallet: solanaWallet.address,
          recipient_wallet: toWallet,
          amount: amountNumber,
          token: token === "USDC" ? "USDC" : "SOL",
          signature: result.id,
          recipient_emoji: isEmojiCombo(recipient) ? recipient : undefined,
          note
        }),
      });

      void fetch("/api/streaks/tick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: solanaWallet.address }),
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Transfer failed.");
    }
  };

  return (
    <main
      className="relative min-h-screen bg-[#0b1326] text-white overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_5%_10%,_rgba(183,109,255,0.22),_transparent_35%),radial-gradient(circle_at_90%_15%,_rgba(0,203,230,0.16),_transparent_30%)]" />

      {/* Nav */}
      <header className="border-b border-white/8 bg-[#0b1326]/85 backdrop-blur-xl">
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
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link
              href="/wallet"
              className="px-4 py-2 text-white/50 hover:text-white transition-colors"
            >
              Wallet
            </Link>
            <span className="px-4 py-2 bg-white/10 text-white">Send</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Page title */}
        <div className="mb-8">
          <Link
            href="/wallet"
            className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors mb-4"
          >
            <ArrowLeft className="h-3 w-3" /> Back to wallet
          </Link>
          <p className="text-[11px] uppercase tracking-widest text-white/30 mb-1">
            Transfer
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Send Paymoji
          </h1>
        </div>

        <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-0 border border-white/8">
          {/* ── Left — Form ── */}
          <div className="p-8 border-r border-white/8">
            {status === "success" ? (
              /* Success state */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 border border-[#5de6ff]/30 bg-[#5de6ff]/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-8 w-8 text-[#5de6ff]" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Sent!</h2>
                <p className="text-white/50 text-sm mb-1">
                  <span className="text-white font-semibold">
                    {amount} {token}
                  </span>{" "}
                  sent to{" "}
                  <span className="text-white font-semibold">
                    {resolvedName || recipient}
                  </span>
                </p>
                {/*{note && <p className="text-white/30 text-xs mb-6">"{note}"</p>}*/}
                {txSig && (
                  <a
                    href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/30 hover:text-[#5de6ff] transition-colors mb-8 flex items-center gap-1"
                  >
                    View on Explorer ↗
                  </a>
                )}
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      setStatus("idle");
                      setRecipient("");
                      setAmount("");
                      setNote("");
                      setTxSig("");
                    }}
                    className="flex-1 border border-white/10 py-3 text-sm font-bold text-white/60 hover:text-white hover:border-white/20 transition-colors"
                  >
                    Send again
                  </button>
                  <Link
                    href="/wallet"
                    className="flex-1 bg-gradient-to-r from-[#b76dff] to-[#00cbe6] py-3 text-sm font-bold text-center hover:opacity-90 transition-opacity"
                  >
                    Back to wallet
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-6">
                {/* Recipient */}
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">
                    To
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="🦊🐬🦚 or foxwave.sol or wallet address"
                      value={recipient}
                      onChange={(e) => {
                        setRecipient(e.target.value);
                        reset();
                      }}
                      className="w-full border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder:text-white/20 outline-none focus:border-white/25 transition-colors text-sm font-[inherit] pr-24"
                    />
                    {status === "resolving" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-white/30">
                        <Loader2 className="h-3 w-3 animate-spin" /> Resolving
                      </div>
                    )}
                    {resolvedWallet && status !== "resolving" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5de6ff]">
                        ✓ Found
                      </div>
                    )}
                  </div>

                  {/* Resolved identity preview */}
                  {resolvedWallet && status !== "resolving" && (
                    <div className="mt-2 flex items-center gap-3 border border-[#5de6ff]/15 bg-[#5de6ff]/[0.04] px-4 py-3">
                      <span className="text-lg leading-none">
                        {isEmojiCombo(recipient) ? recipient : "👤"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">
                          {resolvedName}
                        </p>
                        <p className="text-[10px] font-mono text-white/30 mt-0.5 truncate">
                          {resolvedWallet}
                        </p>
                      </div>
                    </div>
                  )}

                  {!isRecipientValid && recipient.length > 2 && (
                    <p className="mt-2 text-xs text-red-400/80">
                      Use a 3-emoji combo, .sol name, or Solana address.
                    </p>
                  )}
                </div>

                {/* Token selector + Amount */}
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">
                    Amount
                  </p>
                  <div className="flex border border-white/10">
                    {(["SOL", "USDC"] as Token[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setToken(t)}
                        className={`flex-1 py-2.5 text-xs font-bold tracking-wide transition-colors ${
                          token === t
                            ? "bg-white/10 text-white"
                            : "text-white/30 hover:text-white/60"
                        } ${t === "USDC" ? "border-l border-white/10" : ""}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="relative mt-0">
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        reset();
                      }}
                      className="w-full border border-white/10 border-t-0 bg-black/20 px-4 py-4 text-2xl font-black text-white placeholder:text-white/15 outline-none focus:border-white/25 transition-colors font-[inherit]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/25 font-semibold">
                      {token}
                    </span>
                  </div>

                  {/* Quick amount pills */}
                  <div className="flex gap-2 mt-2">
                    {QUICK_AMOUNTS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAmount(a)}
                        className={`flex-1 py-1.5 text-xs border transition-colors ${
                          amount === a
                            ? "border-white/30 bg-white/10 text-white"
                            : "border-white/8 text-white/30 hover:text-white/60 hover:border-white/15"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">
                    Note{" "}
                    <span className="normal-case text-white/20">
                      (optional)
                    </span>
                  </p>
                  <input
                    type="text"
                    maxLength={80}
                    placeholder="Dinner split, rent, etc."
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      reset();
                    }}
                    className="w-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/25 transition-colors font-[inherit]"
                  />
                </div>

                {/* Error */}
                {status === "error" && (
                  <div className="border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm text-red-300">
                    {errorMessage || "Something went wrong. Please retry."}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#b76dff] to-[#00cbe6] text-sm font-black tracking-wide text-white hover:opacity-90 transition-all hover:scale-[1.01] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {status === "pending" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      Confirm send <SendHorizontal className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── Right — Preview + Quick actions ── */}
          <div className="flex flex-col">
            {/* Transfer preview */}
            <div className="p-6 border-b border-white/8">
              <p className="text-[11px] uppercase tracking-widest text-white/30 mb-4">
                Preview
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: "To",
                    value: resolvedName || recipient || "—",
                    mono: false,
                  },
                  {
                    label: "Wallet",
                    value: resolvedWallet
                      ? `${resolvedWallet.slice(0, 6)}...${resolvedWallet.slice(-4)}`
                      : "—",
                    mono: true,
                  },
                  {
                    label: "Amount",
                    value: amount ? `${amount} ${token}` : "—",
                    mono: false,
                  },
                  { label: "Network", value: "Solana Devnet", mono: false },
                  { label: "Est. fee", value: feeLoading ? "Estimating..." : feeEstimate, mono: false },
                ].map(({ label, value, mono }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border border-white/[0.06] bg-black/15 px-3 py-2.5"
                  >
                    <span className="text-xs text-white/35">{label}</span>
                    <span
                      className={`text-xs font-semibold text-white truncate max-w-[60%] text-right ${mono ? "font-mono" : ""} ${label === "Network" ? "text-[#5de6ff]/70" : ""}`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="p-6 flex-1">
              <p className="text-[11px] uppercase tracking-widest text-white/30 mb-4">
                Quick actions
              </p>
              <div className="space-y-2">
                <Link
                  href="/wallet"
                  className="flex items-center justify-between border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-white/50 hover:text-white hover:border-white/15 transition-colors"
                >
                  Back to wallet <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/emogen"
                  className="flex items-center justify-between border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-white/50 hover:text-white hover:border-white/15 transition-colors"
                >
                  Claim an identity <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/wallet"
                  className="flex items-center justify-between border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-white/50 hover:text-white hover:border-white/15 transition-colors"
                >
                  View balance <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Tip */}
            <div className="border-t border-white/8 px-6 py-5">
              <p className="text-xs text-white/20 leading-relaxed">
                💡 You can send to any emoji combo, .sol name, or raw Solana
                wallet address.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
