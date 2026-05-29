import { NextResponse } from "next/server";
import { logPayment } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await logPayment({
      sender_wallet: body.sender_wallet,
      recipient_wallet: body.recipient_wallet,
      sender_emoji: body.sender_emoji,
      recipient_emoji: body.recipient_emoji,
      amount: body.amount,
      token: body.token,
      signature: body.signature,
      note: body.note,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[payments/log]", err);
    return NextResponse.json({ error: "Failed to log payment" }, { status: 500 });
  }
}
