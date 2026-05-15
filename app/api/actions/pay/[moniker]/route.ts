import { getConnection } from "@/lib/getConnection";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  Transaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  PublicKey,
} from "@solana/web3.js";

const connection = getConnection();

// ✅ service key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

async function resolveMoniker(
  moniker: string,
): Promise<{ wallet: string; sol_name: string; emoji_combo: string } | null> {
  const decoded = decodeURIComponent(moniker);

  const { data: byEmoji } = await supabase
    .from("identities")
    .select("wallet, sol_name, emoji_combo")
    .eq("emoji_combo", decoded)
    .maybeSingle();

  if (byEmoji) return byEmoji;

  const { data: byName } = await supabase
    .from("identities")
    .select("wallet, sol_name, emoji_combo")
    .eq("sol_name", decoded)
    .maybeSingle();

  return byName ?? null;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ moniker: string }> },
) {
  const { moniker } = await context.params;
  const identity = await resolveMoniker(moniker);

  if (!identity) {
    return NextResponse.json(
      { message: "Paymoji identity not found" },
      { status: 404 },
    );
  }

  const label = identity.sol_name || identity.emoji_combo;

  return NextResponse.json({
    icon: `${BASE_URL}/logo.png`,
    label: `Pay ${identity.emoji_combo}`,
    title: `Send to ${label}`,
    description: `Pay ${label} instantly on Solana via Paymoji`,
    links: {
      actions: [
        {
          label: "Send 0.1 SOL",
          href: `${BASE_URL}/api/actions/pay/${moniker}?amount=0.1`, // ✅ absolute
        },
        {
          label: "Send 0.5 SOL",
          href: `${BASE_URL}/api/actions/pay/${moniker}?amount=0.5`,
        },
        {
          label: "Send 1 SOL",
          href: `${BASE_URL}/api/actions/pay/${moniker}?amount=1`,
        },
        {
          label: "Custom amount",
          href: `${BASE_URL}/api/actions/pay/${moniker}?amount={amount}`,
          parameters: [
            {
              name: "amount",
              label: "Amount in SOL",
              required: true,
            },
          ],
        },
      ],
    },
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ moniker: string }> },
) {
  const { moniker } = await context.params;
  const { account } = await req.json();
  const amount = parseFloat(req.nextUrl.searchParams.get("amount") ?? "0");

  if (!account || !amount || amount <= 0) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const identity = await resolveMoniker(moniker);
  if (!identity) {
    return NextResponse.json(
      { message: "Identity not found" },
      { status: 404 },
    );
  }

  const sender = new PublicKey(account);
  const recipient = new PublicKey(identity.wallet);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: recipient,
      lamports: Math.floor(amount * LAMPORTS_PER_SOL),
    }),
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed"); // ✅ confirmed not finalized — faster

  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = sender;

  const serialized = tx.serialize({ requireAllSignatures: false });
  const base64 = Buffer.from(serialized).toString("base64");

  return NextResponse.json({
    transaction: base64,
    message: `Sent ${amount} SOL to ${identity.sol_name || identity.emoji_combo} via Paymoji 🦊`,
  });
}
