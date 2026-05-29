import { NextResponse } from "next/server";
import { tickStreak } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { wallet } = await request.json();
    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }
    const streak = await tickStreak(wallet);
    return NextResponse.json(streak);
  } catch (err) {
    console.error("[streaks/tick]", err);
    return NextResponse.json({ current: 0, longest: 0 });
  }
}
