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

const operatorKeypair = Keypair.fromSecretKey(
  Uint8Array.from([
    124, 229, 56, 205, 106, 195, 19, 22, 206, 95, 145, 70, 34, 151, 34, 24, 233,
    131, 206, 198, 147, 216, 120, 95, 130, 70, 219, 103, 51, 140, 99, 145, 209,
    162, 4, 18, 85, 86, 144, 21, 25, 113, 237, 80, 214, 112, 64, 206, 172, 53,
    129, 126, 117, 22, 173, 144, 212, 208, 28, 22, 81, 223, 3, 159,
  ]),
);

const name = "paymoji";
const space = 1000;

async function main() {
  const connection = new Connection(
    "https://api.devnet.solana.com",
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
