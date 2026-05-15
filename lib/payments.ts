// paymoji.sol/lib/payments.ts
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export interface PaymentRequest {
  mode: "public" | "private";
  amount: number;
  recipient: string;
  network: "devnet" | "mainnet";
  chain: "solana";
  token?: "SOL" | string;
}

export interface TransferPayload {
  mode: "public" | "private";
  amount: number;
  recipient: string;
  network: "devnet" | "mainnet";
  chain: "solana";
  token?: "SOL" | string;
  publicKey: string; // sender’s wallet address (base‑58)
}

/**
 * Public (transparent) SOL or SPL‑token transfer.
 *
 * Returns a JSON‑like object that the UI can inspect
 * (status, explorer URL, signature, etc.).
 */
export async function publicPayment(
  payload: TransferPayload,
  solanaWallet: any,
) {
  // ---------- Guard clauses ----------
  if (!payload) {
    return {
      status: "failed",
      id: "",
      explorer: "",
      recipient: "",
      signer: "",
      network: "devnet",
      chain: "solana",
      error: "PAYLOAD NOT FOUND",
    };
  }

  if (payload.mode !== "public") {
    return {
      status: "failed",
      id: "",
      explorer: "",
      recipient: "",
      signer: "",
      network: payload.network,
      chain: "solana",
      error: "Transfer mode must be 'public'",
    };
  }

  const connection = new Connection(
    payload.network === "mainnet"
      ? "https://api.mainnet-beta.solana.com"
      : "https://api.devnet.solana.com",
    "confirmed",
  );

  // ---------- Build transaction ----------
  const recipientPubkey = new PublicKey(payload.recipient);
  const senderPubkey = new PublicKey(payload.publicKey);
  const transaction = new Transaction();

  // ---- Native SOL transfer (default) ----
  if (!payload.token || payload.token === "SOL") {
    const lamports = Math.round(payload.amount * LAMPORTS_PER_SOL);
    // **Corrected** – funds move FROM the sender TO the recipient
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: recipientPubkey,
        lamports,
      }),
    );
  } else {
    // ---- SPL‑token transfer (e.g. USDC) ----
    const mint = new PublicKey(payload.token);
    const senderTokenAccount = await getAssociatedTokenAddress(
      mint,
      senderPubkey,
    );
    const recipientTokenAccount = await getAssociatedTokenAddress(
      mint,
      recipientPubkey,
    );
    const mintInfo = await getMint(connection, mint);
    const decimals = mintInfo.decimals;
    const amountInSmallest = Math.round(
      payload.amount * Math.pow(10, decimals),
    );

    transaction.add(
      createTransferCheckedInstruction(
        senderTokenAccount,
        mint,
        recipientTokenAccount,
        senderPubkey,
        amountInSmallest,
        decimals,
        [],
        TOKEN_PROGRAM_ID,
      ),
    );
  }

  // Recent blockhash + fee payer
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("finalized");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = senderPubkey;

  // ---------- Send transaction ----------
  try {
    // In a real app the wallet signs this transaction client‑side.
    // Here we assume the server holds a temporary keypair for demo purposes.
    // Replace `sendAndConfirmTransaction` with a call that asks the user's wallet
    // to sign the tx (e.g. via `window.solana.signAndSendTransaction`).
    const signed = await solanaWallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
    await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed",
    );

    const explorerBase =
      payload.network === "mainnet"
        ? "https://solscan.io"
        : "https://solscan.io";
    const explorer = `${explorerBase}/tx/${signature}${
      payload.network === "devnet" ? "?cluster=devnet" : ""
    }`;

    return {
      status: "successful",
      id: signature,
      explorer,
      recipient: payload.recipient,
      signer: payload.publicKey,
      network: payload.network,
      chain: "solana",
      error: null,
    };
  } catch (err: any) {
    console.error("[publicPayment] error:", err);
    return {
      status: "failed",
      id: "",
      explorer: "",
      recipient: payload.recipient,
      signer: payload.publicKey,
      network: payload.network,
      chain: "solana",
      error: err?.message ?? "Unknown error",
    };
  }
}
