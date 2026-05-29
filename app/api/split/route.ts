import { NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

type SplitRecipient = {
  wallet: string;
  amount: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender, recipients, network = "devnet" } = body;

    if (!sender || !Array.isArray(recipients) || recipients.length < 2) {
      return NextResponse.json(
        { error: "Provide sender wallet and at least 2 recipients" },
        { status: 400 },
      );
    }

    const rpcUrl =
      network === "mainnet"
        ? process.env.NEXT_PUBLIC_MAINNET_RPC_URL!
        : process.env.NEXT_PUBLIC_DEVNET_RPC_URL!;

    const connection = new Connection(rpcUrl, "confirmed");
    const senderPubkey = new PublicKey(sender);
    const transaction = new Transaction();

    let totalLamports = 0;

    for (const r of recipients) {
      const lamports = Math.round(r.amount * LAMPORTS_PER_SOL);
      totalLamports += lamports;
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderPubkey,
          toPubkey: new PublicKey(r.wallet),
          lamports,
        }),
      );
    }

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = senderPubkey;

    const serialized = transaction.serialize({ requireAllSignatures: false });
    const base64 = Buffer.from(serialized).toString("base64");

    return NextResponse.json({
      transaction: base64,
      totalAmount: totalLamports / LAMPORTS_PER_SOL,
      recipientCount: recipients.length,
      message: `Split ${totalLamports / LAMPORTS_PER_SOL} SOL among ${recipients.length} recipients`,
    });
  } catch (err) {
    console.error("[api/split]", err);
    return NextResponse.json({ error: "Split failed" }, { status: 500 });
  }
}
