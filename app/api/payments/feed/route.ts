import { NextResponse } from "next/server";
import { getPaymentFeed, getPaymentsForWallet } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const payments = wallet
      ? await getPaymentsForWallet(wallet, limit)
      : await getPaymentFeed(limit);

    return NextResponse.json({ payments });
  } catch (err) {
    console.error("[payments/feed]", err);
    return NextResponse.json({ payments: [] });
  }
}
