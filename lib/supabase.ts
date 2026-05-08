import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export default supabase;

export interface Identity {
  privy_user_id: string;
  emoji_combo: string;
  emoji_1: string;
  emoji_2: string;
  emoji_3: string;
  sol_name?: string | null;
  wallet: string;
  nft_address?: string | null;
  claimed_at?: string; // ISO timestamp, optional
  is_active?: boolean;
}
export async function registerPaymoji(payload: Identity) {
  // Insert a new row into the "identities" table.
  // We let PostgreSQL generate the UUID and timestamps.
  const { data, error } = await supabase.from("identities").insert([
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
  ]);

  if (error) {
    console.error("Failed to register Paymoji identity:", error);
    throw error;
  }
  return data?.[0] as Identity | undefined;
}

export async function isEmojiAvailable(combo: string): Promise<boolean> {
  const { data } = await supabase
    .from("identities")
    .select("id")
    .eq("emoji_combo", combo)
    .single();
  return !data;
}

export async function hasIdentity(privyUserId: string): Promise<boolean> {
  const { data } = await supabase
    .from("identities")
    .select("id")
    .eq("privy_user_id", privyUserId)
    .single();
  return !!data;
}

export async function getUserIdentity(privyUserId: string) {
  const { data } = await supabase
    .from("identities")
    .select("*")
    .eq("privy_user_id", privyUserId)
    .single();
  return data;
}

export async function resolveEmoji(combo: string): Promise<string | null> {
  const { data } = await supabase
    .from("identities")
    .select("wallet")
    .eq("emoji_combo", combo)
    .eq("is_active", true)
    .single();
  return data?.wallet ?? null;
}