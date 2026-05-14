import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  create,
  fetchCollection,
  mplCore,
} from "@metaplex-foundation/mpl-core";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import { PAYMOJI_BRAND_IMAGE_URL } from "@/lib/paymojiBrand";

const DEVNET = "https://api.devnet.solana.com";

export type MintNftResult = {
  nftAddress: string;
};

/**
 * Standalone mint helper (scripts / tooling). Metadata matches /api/mint.
 */
export async function MintNFT(
  owner: string,
  emojis: string[],
  solName: string,
): Promise<MintNftResult> {
  const collectionId = process.env.NEXT_PUBLIC_METAPLEX_COLLECTION_ADDRESS;
  if (!collectionId) {
    throw new Error("NEXT_PUBLIC_METAPLEX_COLLECTION_ADDRESS is not set");
  }

  const umi = createUmi(DEVNET).use(mplCore());
  const asset = generateSigner(umi);

  const collection = await fetchCollection(umi, publicKey(collectionId));

  const displayName = emojis.join("");
  const metadata = {
    name: displayName,
    symbol: "PAYMOJI",
    description: `Paymoji identity ${solName} on Solana`,
    image: PAYMOJI_BRAND_IMAGE_URL,
    external_url: "https://x.com/paymojionsol",
    attributes: [
      { trait_type: "emoji_1", value: emojis[0] ?? "" },
      { trait_type: "emoji_2", value: emojis[1] ?? "" },
      { trait_type: "emoji_3", value: emojis[2] ?? "" },
      { trait_type: "combo", value: displayName },
    ],
  };

  const uri = `data:application/json;base64,${Buffer.from(
    JSON.stringify(metadata),
  ).toString("base64")}`;

  await create(umi, {
    asset,
    collection,
    name: displayName,
    uri,
    owner: publicKey(owner),
  }).sendAndConfirm(umi, {
    send: { commitment: "finalized" },
  });

  const nftAddress = asset.publicKey.toString();
  console.log("✅ Minted successfully!");
  console.log("NFT Address : ", nftAddress);
  console.log(
    `https://explorer.solana.com/address/${nftAddress}?cluster=devnet`,
  );

  return { nftAddress };
}
