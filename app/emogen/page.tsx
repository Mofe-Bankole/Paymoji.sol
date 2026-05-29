"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePaymojiStore } from "@/lib/emojistore";
import { useState, useMemo, useEffect } from "react";
import emojiData from "emoji-datasource/emoji.json";
import {
  paymojiSubdomainsEnabled,
  paymojiSnsParentLabel,
} from "@/lib/paymojiSns";

const groups: any = {
  "Smileys & Emotion": "Smileys",
  "People & Body": "People",
  "Animals & Nature": "Animals",
  "Food & Drink": "Food",
  "Travel & Places": "Travel",
  Activities: "Activities",
  Objects: "Objects",
  Symbols: "Symbols",
  Flags: "Flags",
};

// Transform raw datasource into a structure we can render quickly
const allEmojis = emojiData.map((e) => ({
  char: e.unified
    .split("-")
    .map((u) => String.fromCodePoint(parseInt(u, 16)))
    .join(""),
  name: e.short_name,
  group: groups[e.category] || "Other",
}));

// Create a map of group → emojis (limit to first 200 per group for UI simplicity)
const grouped = allEmojis.reduce(
  (acc, cur) => {
    if (!acc[cur.group]) acc[cur.group] = [];
    if (acc[cur.group].length < 200) acc[cur.group].push(cur);
    return acc;
  },
  {} as Record<string, typeof allEmojis>,
);

// Convert map into an ordered array for rendering filter rows
const filterOrder = Object.keys(groups)
  .map((k) => groups[k])
  .filter((g) => !!grouped[g]);

export default function Emogen() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [solName, setSolName] = useState<string>("");
  const { setStoreEmojis, setStoreSolName } = usePaymojiStore();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>(
    filterOrder[0] ?? "",
  );

  useEffect(() => {
    if (selected.length !== 3) return;

    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      try {
        const res = await fetch("/api/generate-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emojis: selected }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generation failed");
        if (!cancelled) setSolName(data.name);
      } catch (err) {
        console.error("Sol name generation failed:", err);
        const fallback =
          selected.map((e) => e.codePointAt(0)?.toString(16)).join("") + ".sol";
        if (!cancelled) setSolName(fallback);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selected]);

  // Filtered list for the current category
  const emojis = useMemo(() => grouped[activeFilter] ?? [], [activeFilter]);

  const toggleEmoji = (char: string) => {
    setSelected((prev) => {
      if (prev.includes(char)) return prev.filter((c) => c !== char);
      if (prev.length < 3) return [...prev, char];
      return prev;
    });
  };

  const renderGrid = () => (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 sm:gap-2.5 md:grid-cols-10 md:gap-3 lg:grid-cols-14">
      {emojis.map((e) => {
        const isSelected = selected.includes(e.char);
        return (
          <button
            key={e.char}
            type="button"
            onClick={() => toggleEmoji(e.char)}
            className={`flex min-h-[52px] items-center justify-center rounded-sm border py-2.5 transition-colors md:min-h-[30px] md:py-3 ${
              isSelected
                ? "border-primary bg-primary/20"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <span
              className="text-4xl leading-none md:text-xl lg:text-[1.6rem]"
              aria-hidden
            >
              {e.char}
            </span>
            <span className="sr-only">{e.name}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <main className="relative isolate overflow-hidden min-h-screen">
      {/* Background matching Home page */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(183,109,255,0.28),_transparent_28%),radial-gradient(circle_at_80%_22%,_rgba(0,203,230,0.22),_transparent_24%),linear-gradient(180deg,_rgba(6,14,32,0.96),_rgba(11,19,38,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
      <div className="flex flex-col items-center mx-auto xl:max-w-7xl max-w-4xl py-6 gap-8">
        {/* Selected display */}
        <Link
          href="/"
          className="text-2xl font-black tracking-[-0.08em] text-white"
        >
          Paymoji
        </Link>
        <div className="flex gap-5 text-7xl md:gap-6 md:text-8xl">
          {selected.map((c, i) => (
            <span key={i} className="leading-none font-display-emoji">
              {c}
            </span>
          ))}
          {Array.from({ length: 3 - selected.length }).map((_, i) => (
            <span
              key={"ph" + i}
              className="font-display-emoji leading-none text-white/30"
            >
              ❓
            </span>
          ))}
        </div>
        {selected.length === 3 && (
          <div className="mt-1 flex flex-col items-center gap-3">
            {solName && (
              <div className="flex flex-col items-center gap-1">
                {paymojiSubdomainsEnabled() ? (
                  <p className="max-w-2xl mt-3 text-center text-xs text-on-surface-variant">
                    On chain this becomes{" "}
                    <span className="font-medium text-secondary">
                      {`*.${paymojiSnsParentLabel()}.sol`}
                    </span>{" "}
                    (subdomain of {paymojiSnsParentLabel()}.sol).
                  </p>
                ) : null}
              </div>
            )}

            {/* Button area — spinner while loading, button once ready */}
            {loading ? (
              <div className="mt-4 px-8 py-3 flex items-center gap-2 text-sm text-white/50">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Generating your identity...
              </div>
            ) : solName ? (
              <button
                onClick={() => {
                  setStoreEmojis(selected);
                  setStoreSolName(solName);
                  router.push("/mint");
                }}
                className="mt-4 px-8 py-3 rounded-full text-sm font-bold text-white bg-electric shadow-[0_0_30px_rgba(0,203,230,0.2)] hover:scale-[1.02] transition-transform duration-150"
              >
                Continue as {solName}
              </button>
            ) : null}
          </div>
        )}
        {/* Filter tabs – minimal radius (5px) */}
        <nav className="flex flex-wrap gap-2 justify-center">
          {filterOrder.map((group) => (
            <button
              key={group}
              onClick={() => setActiveFilter(group)}
              className={`px-3 py-1 text-sm rounded-[5px] border ${activeFilter === group ? "bg-primary/30 border-primary" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
            >
              {group}
            </button>
          ))}
        </nav>

        {/* Emoji grid – occupies ~90% of viewport height */}
        <div className="w-full" style={{ height: "100vh" }}>
          {renderGrid()}
        </div>

        {/* Continue button */}
      </div>
    </main>
  );
}
