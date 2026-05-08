// import { config } from "@/lib/config";
import { createCollection, mplCore } from "@metaplex-foundation/mpl-core";
import {
  generateSigner,
  keypairIdentity,
  keypairPayer,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair } from "@solana/web3.js";

const operatorKeypair = Keypair.fromSecretKey(
  Uint8Array.from([
    124, 229, 56, 205, 106, 195, 19, 22, 206, 95, 145, 70, 34, 151, 34, 24, 233,
    131, 206, 198, 147, 216, 120, 95, 130, 70, 219, 103, 51, 140, 99, 145, 209,
    162, 4, 18, 85, 86, 144, 21, 25, 113, 237, 80, 214, 112, 64, 206, 172, 53,
    129, 126, 117, 22, 173, 144, 212, 208, 28, 22, 81, 223, 3, 159,
  ]),
);

export async function createMetaPlexCollection(emojis: string[]) {
  const umi = createUmi("https://api.devnet.solana.com").use(mplCore());
  umi.use(keypairIdentity(fromWeb3JsKeypair(operatorKeypair)));

  const collection = generateSigner(umi);
  console.log("Creating Collection.........");

  await createCollection(umi, {
    collection,
    name: "Paymoji Identies",
    uri: "",
  }).sendAndConfirm(umi);

  console.log("DONE");
  console.log(`COLLECTION ADDRESS : ${collection.publicKey.toString}`);
}
