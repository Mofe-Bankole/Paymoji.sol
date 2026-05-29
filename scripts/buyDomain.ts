import { devnet } from "@bonfida/spl-name-service";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const raw = process.env.OPERATOR_PRIVATE_KEY || process.env.PAYER_PRIVATE_KEY;
if (!raw) {
  console.error("Set OPERATOR_PRIVATE_KEY or PAYER_PRIVATE_KEY in .env");
  process.exit(1);
}

const operatorKeypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(raw)),
);

const name = "paymoji";
const space = 1000;

async function main() {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_DEVNET_RPC_URL!,
    "confirmed",
  );

  const usdcMint = devnet.constants.USDC_MINT;
  const usdcAta = getAssociatedTokenAddressSync(
    usdcMint,
    operatorKeypair.publicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const ixGroups = await devnet.bindings.registerDomainName(
    connection,
    name,
    space,
    operatorKeypair.publicKey,
    usdcAta,
  );
  const registerIxs = ixGroups.flat();

  const transaction = new Transaction().add(...registerIxs);

  const sig = await sendAndConfirmTransaction(connection, transaction, [
    operatorKeypair,
  ]);

  console.log("✅ Success : ", sig);
}

main().catch((err) => {
  console.error("❌ Error during domain registration:", err);
});
