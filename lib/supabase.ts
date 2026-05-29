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

export function getSupabase(): SupabaseClient | null {
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

export async function logPayment(payload: {
  sender_wallet: string;
  recipient_wallet: string;
  sender_emoji?: string;
  recipient_emoji?: string;
  amount: number;
  token: string;
  signature: string;
  note?: string;
}) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("payments").insert([{
    sender_wallet: payload.sender_wallet,
    recipient_wallet: payload.recipient_wallet,
    sender_emoji: payload.sender_emoji ?? null,
    recipient_emoji: payload.recipient_emoji ?? null,
    amount: payload.amount,
    token: payload.token,
    signature: payload.signature,
    note: payload.note ?? null,
  }]);

  if (error) console.error("[logPayment]", error);
}

export async function getPaymentFeed(limit = 20): Promise<any[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getPaymentFeed]", error);
    return [];
  }
  return data ?? [];
}

export async function getPaymentsForWallet(wallet: string, limit = 20): Promise<any[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .or(`sender_wallet.eq.${wallet},recipient_wallet.eq.${wallet}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getPaymentsForWallet]", error);
    return [];
  }
  return data ?? [];
}

export async function tickStreak(wallet: string): Promise<{ current: number; longest: number }> {
  const supabase = getSupabase();
  if (!supabase) return { current: 0, longest: 0 };

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("streaks")
    .select("*")
    .eq("wallet", wallet)
    .maybeSingle();

  if (!existing) {
    await supabase.from("streaks").insert([{
      wallet,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
    }]);
    return { current: 1, longest: 1 };
  }

  const lastDate = existing.last_active_date?.split("T")[0];
  let current = existing.current_streak ?? 0;
  let longest = existing.longest_streak ?? 0;

  if (lastDate === today) {
    return { current, longest };
  }

  if (lastDate === yesterday) {
    current += 1;
  } else {
    current = 1;
  }

  if (current > longest) longest = current;

  await supabase
    .from("streaks")
    .update({ current_streak: current, longest_streak: longest, last_active_date: today })
    .eq("wallet", wallet);

  return { current, longest };
}

export async function getStreak(wallet: string): Promise<{ current: number; longest: number } | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak")
    .eq("wallet", wallet)
    .maybeSingle();

  if (!data) return null;
  return { current: data.current_streak, longest: data.longest_streak };
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

export async function getPaymentCountForWallet(wallet: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from("payments")
    .select("id")
    .or(`sender_wallet.eq.${wallet},recipient_wallet.eq.${wallet}`);

  if (error) {
    console.error("[getPaymentCountForWallet]", error);
    return 0;
  }
  return data?.length ?? 0;
}

export function getBadges(paymentCount: number, streakDays: number): { label: string; emoji: string; earned: boolean }[] {
  return [
    { label: "First Payment", emoji: "🌟", earned: paymentCount >= 1 },
    { label: "Casual Sender", emoji: "📬", earned: paymentCount >= 5 },
    { label: "Power User", emoji: "⚡", earned: paymentCount >= 10 },
    { label: "Paymoji Pro", emoji: "💎", earned: paymentCount >= 25 },
    { label: "Whale", emoji: "🐋", earned: paymentCount >= 50 },
    { label: "3-Day Streak", emoji: "🔥", earned: streakDays >= 3 },
    { label: "7-Day Streak", emoji: "🔥🔥", earned: streakDays >= 7 },
    { label: "14-Day Streak", emoji: "🔥🔥🔥", earned: streakDays >= 14 },
  ];
}
