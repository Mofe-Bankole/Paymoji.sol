import { NextResponse } from "next/server";
import { getStreak } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }
    const streak = await getStreak(wallet);
    return NextResponse.json({ streak });
  } catch (err) {
    console.error("[streaks]", err);
    return NextResponse.json({ streak: null });
  }
}
