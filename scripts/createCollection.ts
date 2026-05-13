// // import { config } from "@/lib/config";
// import { createCollection, mplCore } from "@metaplex-foundation/mpl-core";
// import {
//   generateSigner,
//   keypairIdentity,
//   keypairPayer,
// } from "@metaplex-foundation/umi";
// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
// import { Keypair } from "@solana/web3.js";

// const operatorKeypair = Keypair.fromSecretKey(
//   Uint8Array.from(JSON.parse(process.env.NEXT_PUBLIC_PRIVATE_KEY!)),
// );

// export async function createMetaPlexCollection() {
//   const umi = createUmi("https://api.devnet.solana.com").use(mplCore());
//   umi.use(keypairIdentity(fromWeb3JsKeypair(operatorKeypair)));

//   const collection = generateSigner(umi);
//   console.log("Creating Collection.........");

//   await createCollection(umi, {
//     collection,
//     name: "Paymoji Identies",
//     uri: "https://raw.githubusercontent.com/Mofe-Bankole/Paymoji.sol/refs/heads/main/public/metadata/collection.json",
//   }).sendAndConfirm(umi);

//   console.log("DONE");
//   console.log(`COLLECTION ADDRESS : ${collection.publicKey.toString()}`);
// }
