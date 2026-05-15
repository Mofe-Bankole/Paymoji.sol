import { NextResponse } from "next/server";
import { sendPaymentReceivedAlert } from "@/lib/dialect/send-alert";
import { getIdentityByWallet } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const recipientWallet = body.recipientWallet as string | undefined;
    const amount = Number(body.amount);
    const token = (body.token as string) || "SOL";
    const senderWallet = body.senderWallet as string | undefined;
    const senderLabelInput = body.senderLabel as string | undefined;

    if (!recipientWallet || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    let senderLabel = senderLabelInput?.trim() || "Someone";
    if (senderWallet && !senderLabelInput) {
      const identity = await getIdentityByWallet(senderWallet);
      if (identity?.emoji_combo) {
        senderLabel = identity.emoji_combo;
      } else if (identity?.sol_name) {
        senderLabel = identity.sol_name;
      } else {
        senderLabel = `${senderWallet.slice(0, 4)}…${senderWallet.slice(-4)}`;
      }
    }

    const sent = await sendPaymentReceivedAlert({
      recipientWallet,
      senderLabel,
      amount,
      token,
    });

    return NextResponse.json({ ok: true, dialect: sent });
  } catch (err) {
    console.error("[notifications/payment]", err);
    return NextResponse.json({ error: "Notification failed" }, { status: 500 });
  }
}
