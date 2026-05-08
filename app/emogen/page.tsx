"use client";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useState, useMemo, useEffect } from "react";
import emojiData from "emoji-datasource/emoji.json";
import { generateSolName } from "@/lib/generateSolName";
import { createMetaPlexCollection } from "@/scripts/createCollection";

const groups = {
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
  const { user } = usePrivy();
  console.log(user);
  const [activeFilter, setActiveFilter] = useState<string>(
    filterOrder[0] ?? "",
  );

  const handleSolName = async (selected: string[]) => {
    const name = await generateSolName(selected);
    setSolName(name);
    await createMetaPlexCollection(selected);
  };

  useEffect(() => {
    setSolName("");

    if (selected.length === 3) {
      setLoading(true);
      generateSolName(selected)
        .then((name) => setSolName(name))
        .catch((err) => {
          console.error("Sol name generation failed:", err);
          // Fallback so the button still appears
          const fallback =
            selected.map((e) => e.codePointAt(0)?.toString(16)).join("") +
            ".sol";
          setSolName(fallback);
        })
        .finally(() => setLoading(false));
    }
  }, [selected]);

  // Filtered list for the current category
  const emojis = useMemo(() => grouped[activeFilter] ?? [], [activeFilter]);

  const toggleEmoji = (char: string) => {
    console.log(char);
    setSelected((prev) => {
      if (prev.includes(char)) return prev.filter((c) => c !== char);
      if (prev.length < 3) return [...prev, char];
      return prev;
    });
  };

  // Render emojis using a plain CSS grid (6 columns). Emojis are slightly smaller for a compact view.
  const renderGrid = () => (
    <div className="grid grid-cols-12 gap-2">
      {emojis.map((e) => {
        const isSelected = selected.includes(e.char);
        return (
          <button
            key={e.char}
            onClick={() => toggleEmoji(e.char)}
            className={`flex items-center justify-center py-2 rounded border ${isSelected ? "bg-primary/20 border-primary" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            <span className="text-xl" aria-label={e.char}>
              {e.char}
            </span>
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
        <div className="flex gap-4 text-6xl">
          {selected.map((c, i) => (
            <span key={i} className="text-display-emoji">
              {c}
            </span>
          ))}
          {Array.from({ length: 3 - selected.length }).map((_, i) => (
            <span key={"ph" + i} className="text-display-emoji text-white/30">
              ❓
            </span>
          ))}
        </div>
        {selected.length === 3 && (
          <div className="flex flex-col items-center gap-3 mt-1">
            {/* Sol name display — only show once we have it */}
            {solName && (
              <div className="px-5 py-2 text-sm rounded-[5px] border bg-white/5 border-white/10">
                {solName}
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
                onClick={() => handleClaim()}
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
