import { NextResponse } from "next/server";
import { getPaymentCountForWallet } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }
    const count = await getPaymentCountForWallet(wallet);
    return NextResponse.json({ count });
  } catch (err) {
    console.error("[payments/count]", err);
    return NextResponse.json({ count: 0 });
  }
}
