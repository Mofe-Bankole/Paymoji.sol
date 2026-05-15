import { NextResponse } from "next/server";
import { resolveRecipientIdentifier } from "@/lib/resolve-recipient";

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();
    if (typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json({ error: "identifier required" }, { status: 400 });
    }

    const resolved = await resolveRecipientIdentifier(identifier);
    if (!resolved) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(resolved);
  } catch (err) {
    console.error("[resolve]", err);
    return NextResponse.json({ error: "Resolve failed" }, { status: 500 });
  }
}
