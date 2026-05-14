import { NextResponse } from "next/server";
import { getIdentityByWallet, isSupabaseConfigured } from "@/lib/supabase";

/** Base58 Solana pubkey length is 32–44 chars; keep a loose bound. */
function looksLikeSolanaAddress(s: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,48}$/.test(s);
}

/**
 * GET /api/identity?wallet=<pubkey>
 * Returns minted identity for the wallet dashboard (public-by-wallet).
 */
export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ identity: null, configured: false });
  }

  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet")?.trim() ?? "";

  if (!looksLikeSolanaAddress(wallet)) {
    return NextResponse.json({ identity: null, error: "invalid_wallet" });
  }

  try {
    const identity = await getIdentityByWallet(wallet);
    return NextResponse.json({ identity, configured: true });
  } catch (e) {
    console.error("[api/identity]", e);
    return NextResponse.json(
      { identity: null, error: "lookup_failed" },
      { status: 500 },
    );
  }
}
