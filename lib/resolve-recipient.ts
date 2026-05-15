import { resolveEmoji, getIdentityByWallet } from "@/lib/supabase";

const EMOJI_COMBO = /^(\p{Extended_Pictographic}\uFE0F?){3}$/u;

export type ResolvedRecipient = {
  wallet: string;
  emoji_combo?: string;
  sol_name?: string | null;
};

export async function resolveRecipientIdentifier(
  identifier: string,
): Promise<ResolvedRecipient | null> {
  const raw = identifier.trim();
  if (!raw) return null;

  if (/^[1-9A-HJ-NP-Za-km-z]{32,48}$/.test(raw)) {
    const identity = await getIdentityByWallet(raw);
    return {
      wallet: raw,
      emoji_combo: identity?.emoji_combo,
      sol_name: identity?.sol_name,
    };
  }

  if (EMOJI_COMBO.test(raw)) {
    const wallet = await resolveEmoji(raw);
    if (!wallet) return null;
    const identity = await getIdentityByWallet(wallet);
    return {
      wallet,
      emoji_combo: raw,
      sol_name: identity?.sol_name,
    };
  }

  const solName = raw.toLowerCase().endsWith(".sol") ? raw.toLowerCase() : `${raw.toLowerCase()}.sol`;
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && key) {
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("identities")
      .select("wallet, emoji_combo, sol_name")
      .eq("sol_name", solName)
      .maybeSingle();
    if (data?.wallet) {
      return {
        wallet: data.wallet,
        emoji_combo: data.emoji_combo,
        sol_name: data.sol_name,
      };
    }
  }

  return null;
}
