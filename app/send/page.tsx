"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, SendHorizontal } from "lucide-react";

type SendStatus = "idle" | "pending" | "success" | "error";

/**
 * Production-style send screen with validation + deterministic UI states.
 * Replace mock network call with on-chain transfer when ready.
 */
export default function SendPage() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const amountNumber = Number(amount);
  const isRecipientValid = useMemo(() => {
    if (!recipient.trim()) return false;
    return recipient.includes(".sol") || /^[1-9A-HJ-NP-Za-km-z]{32,48}$/.test(recipient);
  }, [recipient]);

  const isAmountValid = Number.isFinite(amountNumber) && amountNumber > 0;
  const canSubmit = isRecipientValid && isAmountValid && status !== "pending";

  const resetFeedbackIfNeeded = () => {
    if (status !== "idle") setStatus("idle");
    if (errorMessage) setErrorMessage("");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRecipientValid) {
      setStatus("error");
      setErrorMessage("Enter a valid .sol identity or wallet address.");
      return;
    }
    if (!isAmountValid) {
      setStatus("error");
      setErrorMessage("Amount must be greater than 0.");
      return;
    }

    setStatus("pending");
    setErrorMessage("");

    try {
      await new Promise((res) => setTimeout(res, 1400));
      if (Math.random() < 0.12) throw new Error("Network is busy. Retry.");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Transfer failed.");
    }
  };

  return (
    <main className="relative isolate overflow-hidden min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="glass-surface rounded-[28px] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary/80">
            Transfer
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">
            Send Paymoji
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            Move SOL in seconds with a clean, verified send flow. Enter a
            recipient identity, review the amount, and confirm.
          </p>

          <form onSubmit={handleSend} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/80">
                Recipient
              </span>
              <input
                type="text"
                autoComplete="off"
                placeholder="foxwave.paymoji.sol or wallet address"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  resetFeedbackIfNeeded();
                }}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                required
              />
              {!isRecipientValid && recipient.length > 0 ? (
                <p className="mt-2 text-xs text-red-300">
                  Use a valid `.sol` name or Solana address.
                </p>
              ) : null}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/80">
                  Amount (SOL)
                </span>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    resetFeedbackIfNeeded();
                  }}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/80">
                  Note (optional)
                </span>
                <input
                  type="text"
                  maxLength={80}
                  autoComplete="off"
                  placeholder="Dinner split"
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    resetFeedbackIfNeeded();
                  }}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-electric px-8 py-3.5 text-sm font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_0_30px_rgba(0,203,230,0.2)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "pending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Sending
                </>
              ) : (
                <>
                  Confirm send
                  <SendHorizontal className="h-4 w-4" aria-hidden />
                </>
              )}
            </button>
          </form>

          {status === "success" ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                Sent <strong>{amount}</strong> SOL to{" "}
                <strong>{recipient}</strong>
                {note ? ` — "${note}"` : ""}.
              </p>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage || "Something went wrong. Please retry."}
            </div>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="glass-surface rounded-[28px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Transfer preview
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <span className="text-white/55">To</span>
                <span className="max-w-[70%] truncate font-mono text-white">
                  {recipient || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <span className="text-white/55">Amount</span>
                <span className="font-semibold text-white">
                  {amount || "0"} SOL
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <span className="text-white/55">Network</span>
                <span className="text-secondary">Solana Devnet</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <span className="text-white/55">Estimated fee</span>
                <span className="text-white">~0.000005 SOL</span>
              </div>
            </div>
          </div>

          <div className="glass-surface rounded-[28px] p-6">
            <p className="text-sm font-semibold text-white">Quick actions</p>
            <div className="mt-4 space-y-2">
              <Link
                href="/wallet"
                className="inline-flex min-h-11 w-full items-center justify-between rounded-xl border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Back to wallet
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/emogen"
                className="inline-flex min-h-11 w-full items-center justify-between rounded-xl border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Claim another identity
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
