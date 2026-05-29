/**
 * One-off: register `paymoji.sol` on **devnet** .
 *
 * Uses `devnet.bindings.registerDomainName` (v1) + buyer’s **USDC ATA**, not v2
 * (v2 → PythFeedNotFound on devnet USDC).
 *
 * Env:
 *   KEYPAIR_PATH — optional; default ~/.config/solana/id.json
 *   Else: PAYER_PRIVATE_KEY or OPERATOR_PRIVATE_KEY in `.env` (JSON bytes)
 *   SOLANA_RPC_URL — optional
 *
 * Devnet USDC: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
 * Faucet: https://spl-token-faucet.com  or  https://faucet.circle.com
 *
 *   npm run sns:register-paymoji-devnet
 */
import * as fs from "node:fs";
import * as path from "node:path";

import { devnet } from "@bonfida/spl-name-service";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { loadDotEnv } from "./load-dotenv";

const RPC =
  process.env.NEXT_PUBLIC_DEVNET_RPC_URL! ?? "https://api.devnet.solana.com";
const NAME = "paymoji";
const SPACE = 1000;

function loadKeypair(): Keypair {
  loadDotEnv();
  const fromEnv = process.env.KEYPAIR_PATH?.trim();
  const defaultPath = path.join(
    process.env.HOME ?? "",
    ".config/solana/id.json",
  );
  const kpPath = fromEnv || defaultPath;

  if (fs.existsSync(kpPath)) {
    const raw = fs.readFileSync(kpPath, "utf8");
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
  }

  const raw =
    process.env.PAYER_PRIVATE_KEY ?? process.env.OPERATOR_PRIVATE_KEY;
  if (!raw) {
    throw new Error(
      "Set KEYPAIR_PATH to a Solana keypair JSON file, or PAYER_PRIVATE_KEY / OPERATOR_PRIVATE_KEY in .env",
    );
  }
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

async function main() {
  console.log(`RPC : ${RPC}`);
  const connection = new Connection(RPC, "confirmed");
  const buyer = loadKeypair();
  console.log(`Buyer / parent owner: ${buyer.publicKey.toBase58()}\n`);

  const domainPubkey = devnet.utils.getDomainKeySync(NAME).pubkey;
  console.log(`${NAME}.sol PDA: ${domainPubkey.toBase58()}\n`);

  const existing = await connection.getAccountInfo(domainPubkey);
  if (existing) {
    console.log(`✓ ${NAME}.sol is already registered on devnet`);
    console.log(`  owner program: ${existing.owner.toBase58()}`);
    return;
  }

  const usdcMint = devnet.constants.USDC_MINT;
  const buyerUsdcAta = getAssociatedTokenAddressSync(
    usdcMint,
    buyer.publicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  console.log(`Buyer USDC ATA: ${buyerUsdcAta.toBase58()}`);
  const ataInfo = await connection.getAccountInfo(buyerUsdcAta);
  if (!ataInfo) {
    console.error(`\n✗ No devnet USDC token account.`);
    console.error(`  USDC mint: ${usdcMint.toBase58()}`);
    console.error(
      "  https://spl-token-faucet.com  or  https://faucet.circle.com",
    );
    process.exit(1);
  }

  const solBalance = await connection.getBalance(buyer.publicKey);
  console.log(`Buyer SOL: ${(solBalance / 1e9).toFixed(4)}`);
  if (solBalance < 0.01 * 1e9) {
    console.error("\n✗ Need at least ~0.01 devnet SOL for rent + fees.");
    process.exit(1);
  }

  console.log("\nBuilding registration (registerDomainName v1, devnet)…");
  const ixGroups = await devnet.bindings.registerDomainName(
    connection,
    NAME,
    SPACE,
    buyer.publicKey,
    buyerUsdcAta,
  );
  const ixs = ixGroups.flat();

  const sig = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(...ixs),
    [buyer],
    { commitment: "confirmed" },
  );

  console.log(`\n✓ ${NAME}.sol registered`);
  console.log(`  https://explorer.solana.com/tx/${sig}?cluster=devnet`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
