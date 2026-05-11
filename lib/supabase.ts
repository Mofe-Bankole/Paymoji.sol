import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Identity {
  privy_user_id: string;
  emoji_combo: string;
  emoji_1: string;
  emoji_2: string;
  emoji_3: string;
  sol_name?: string | null;
  wallet: string;
  nft_address?: string | null;
  claimed_at?: string;
  is_active?: boolean;
}

let client: SupabaseClient | null | undefined;

function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.warn(
      "[supabase] Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY).",
    );
    client = null;
    return client;
  }

  client = createClient(url, key);
  return client;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}

export async function registerPaymoji(payload: Identity) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase
    .from("identities")
    .insert([
      {
        privy_user_id: payload.privy_user_id,
        emoji_combo: payload.emoji_combo,
        emoji_1: payload.emoji_1,
        emoji_2: payload.emoji_2,
        emoji_3: payload.emoji_3,
        sol_name: payload.sol_name ?? null,
        wallet: payload.wallet,
        nft_address: payload.nft_address ?? null,
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    console.error("Failed to register Paymoji identity:", error);
    throw error;
  }
  return data as Identity | null;
}

export async function isEmojiAvailable(combo: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true;

  const { data, error } = await supabase
    .from("identities")
    .select("emoji_combo")
    .eq("emoji_combo", combo)
    .maybeSingle();

  if (error) {
    console.error("isEmojiAvailable:", error);
    return true;
  }
  return !data;
}

export async function hasIdentity(privyUserId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("identities")
    .select("privy_user_id")
    .eq("privy_user_id", privyUserId)
    .maybeSingle();

  if (error) {
    console.error("hasIdentity:", error);
    return false;
  }
  return !!data;
}

export async function getUserIdentity(privyUserId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("identities")
    .select("*")
    .eq("privy_user_id", privyUserId)
    .maybeSingle();

  if (error) {
    console.error("getUserIdentity:", error);
    return null;
  }
  return data;
}

/** Public lookup by wallet (for wallet dashboard). */
export async function getIdentityByWallet(wallet: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("identities")
    .select(
      "emoji_combo, sol_name, nft_address, emoji_1, emoji_2, emoji_3, wallet",
    )
    .eq("wallet", wallet)
    .maybeSingle();

  if (error) {
    console.error("getIdentityByWallet:", error);
    return null;
  }
  return data;
}

export async function resolveEmoji(combo: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("identities")
    .select("wallet")
    .eq("emoji_combo", combo)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("resolveEmoji:", error);
    return null;
  }
  return data?.wallet ?? null;
}
