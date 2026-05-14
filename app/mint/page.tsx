"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { usePaymojiStore } from "@/lib/emojistore";
import { usePrivyWallet } from "../../privy/PrivyProvider";

export default function MintPage() {
  const router = useRouter();
  const { user } = usePrivy();
  const { address } = usePrivyWallet();
  const { emojis, solName, setStoreSolName } = usePaymojiStore();

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusVisible, setStatusVisible] = useState(false);

  const showStatus = async (message: string) => {
    setStatusVisible(false);
    await new Promise((r) => setTimeout(r, 220));
    setStatusMessage(message);
    requestAnimationFrame(() => setStatusVisible(true));
  };

  const handleMint = async () => {
    const walletAddr = address ?? user?.wallet?.address ?? "";
    if (!walletAddr || !user?.id) {
      setLoading(true);
      await showStatus("Sign in first — use Register, then return to mint.");
      setTimeout(() => setLoading(false), 2400);
      return;
    }

    try {
      setLoading(true);

      await showStatus("Preparing your Paymoji...");
      await new Promise((r) => setTimeout(r, 1000));

      await showStatus("Connecting to Solana Devnet...");
      await new Promise((r) => setTimeout(r, 1500));

      await showStatus("Minting your emoji identity...");

      const response = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: walletAddr,
          emojis,
          solName,
          wallet: walletAddr,
          privy_user_id: user?.id || "",
          emoji_1: emojis[0],
          emoji_2: emojis[1],
          emoji_3: emojis[2],
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Minting failed");

      if (typeof result.solName === "string" && result.solName) {
        setStoreSolName(result.solName);
      }

      await showStatus("Confirming transaction...");
      await new Promise((r) => setTimeout(r, 1700));

      await showStatus("✨ Paymoji minted successfully!");
      if (typeof window !== "undefined" && result?.nftAddress) {
        try {
          window.sessionStorage.setItem(
            "paymoji_last_mint",
            JSON.stringify({
              nftAddress: result.nftAddress,
              explorerUrl: result.explorerUrl,
              brandImageUrl: result.brandImageUrl,
              emojiCombo: result.emojiCombo,
              solName: result.solName,
            }),
          );
        } catch {
          /* ignore quota / private mode */
        }
      }
      setTimeout(() => {
        setLoading(false);
        router.push("/wallet");
      }, 1900);
    } catch (e) {
      console.error("Minting error", e);
      await showStatus("Mint failed — please try again.");
      setTimeout(() => setLoading(false), 1800);
    }
  };

  return (
    <main className="relative isolate overflow-hidden min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        {/* Emojis — always visible */}
        <div className="flex gap-4 mb-6">
          {emojis.map((e, i) => (
            <span key={i} className="text-display-emoji">
              {e}
            </span>
          ))}
        </div>

        {loading ? (
          /* Loading state — animated status text */
          <p
            className={`text-center mt-4 text-2xl font-medium text-white transition-all duration-700 ${
              statusVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            }`}
          >
            {statusMessage}
          </p>
        ) : (
          /* Default state — just the button */
          <button
            onClick={handleMint}
            disabled={emojis.length !== 3}
            className="mt-4 px-8 py-3 rounded-full bg-electric text-white font-bold shadow-[0_0_30px_rgba(0,203,230,0.2)] hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Continue as {solName || "your identity"}
          </button>
        )}
      </div>
    </main>
  );
}
