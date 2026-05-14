/**
 * Devnet SNS helpers for Paymoji:
 *
 *   1) Register the parent once (you own paymoji.sol):
 *        npm run sns:register-root
 *
 *   2) Create user subdomains under paymoji (operator must own paymoji.sol):
 *        npm run sns:create-sub -- barbadosfire
 *
 * Root registration uses registerDomainName **v1** + devnet USDC ATA (not v2).
 *
 * Requires PAYER_PRIVATE_KEY or NEXT_PUBLIC_PRIVATE_KEY in .env (JSON byte array),
 * plus devnet SOL + devnet USDC on the operator wallet.
 */
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

const RPC = "https://api.devnet.solana.com";
const PARENT = "paymoji";

function getPayer(): Keypair {
  loadDotEnv();
  const raw =
    process.env.PAYER_PRIVATE_KEY ?? process.env.NEXT_PUBLIC_PRIVATE_KEY;
  if (!raw) {
    throw new Error("Set PAYER_PRIVATE_KEY or NEXT_PUBLIC_PRIVATE_KEY in .env");
  }
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

async function registerRoot() {
  const connection = new Connection(RPC, "confirmed");
  const payer = getPayer();
  console.log("Payer:", payer.publicKey.toBase58());

  const usdcMint = devnet.constants.USDC_MINT;
  const usdcAta = getAssociatedTokenAddressSync(
    usdcMint,
    payer.publicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const ataInfo = await connection.getAccountInfo(usdcAta);
  if (!ataInfo) {
    console.error("No devnet USDC ATA. Fund:", usdcAta.toBase58());
    console.error("USDC mint:", usdcMint.toBase58());
    console.error("https://spl-token-faucet.com");
    process.exit(1);
  }

  console.log(`Registering ${PARENT}.sol (registerDomainName v1 + devnet Pyth)…`);

  const ixGroups = await devnet.bindings.registerDomainName(
    connection,
    PARENT,
    1_000,
    payer.publicKey,
    usdcAta,
  );
  const ixs = ixGroups.flat();

  const sig = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(...ixs),
    [payer],
    { commitment: "confirmed" },
  );

  console.log("✅ Registered", `${PARENT}.sol`, "signature:", sig);
  console.log(
    "Explorer:",
    `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
  );
}

async function createSub(label: string) {
  const clean = label.trim().toLowerCase().replace(/\.paymoji\.sol$/i, "");
  if (!clean || clean.includes(".")) {
    throw new Error(
      "Pass a single label, e.g. `barbadosfire` (creates barbadosfire.paymoji.sol)",
    );
  }

  const connection = new Connection(RPC, "confirmed");
  const payer = getPayer();
  const full = `${clean}.${PARENT}.sol`;
  console.log("Payer (must own paymoji.sol):", payer.publicKey.toBase58());
  console.log("Creating subdomain:", full);

  const nested = await devnet.bindings.createSubdomain(
    connection,
    full,
    payer.publicKey,
  );
  const ixs = nested.flat();

  const sig = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(...ixs),
    [payer],
    { commitment: "confirmed" },
  );

  console.log("✅ Created", full, "signature:", sig);
  console.log(
    "Explorer:",
    `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
  );
}

async function main() {
  const [, , cmd, arg] = process.argv;
  if (cmd === "register-root") {
    await registerRoot();
    return;
  }
  if (cmd === "create-sub" && arg) {
    await createSub(arg);
    return;
  }

  console.log(`
Usage:
  npm run sns:register-root
  npm run sns:create-sub -- <label>

Examples:
  npm run sns:register-root
  npm run sns:create-sub -- barbadosfire
`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
