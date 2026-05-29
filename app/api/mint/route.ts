// app/api/mint/route.ts
import { NextResponse } from "next/server";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  create,
  fetchCollection,
  mplCore,
} from "@metaplex-foundation/mpl-core";
import {
  generateSigner,
  keypairIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { devnet } from "@bonfida/spl-name-service";
import { PAYMOJI_BRAND_IMAGE_URL } from "@/lib/paymojiBrand";
import {
  buildSnsRegistrationInstructions,
  checkSnsAvailability,
  normalizeSolName,
} from "@/lib/registerSns";
import { resolvePaymojiSnsDomain } from "@/lib/paymojiSns";
import { sendIdentityMintedAlert } from "@/lib/dialect/send-alert";
import { isEmojiAvailable, registerPaymoji } from "@/lib/supabase";

export type ClaimRequest = {
  owner: string;
  emojis: string[];
  solName: string;
  privy_user_id: string;
  emoji_1: string;
  emoji_2: string;
  emoji_3: string;
  sol_name: string;
  wallet: string;
};

export async function POST(request: Request) {
  try {
    const connection = new Connection(process.env.NEXT_PUBLIC_DEVNET_RPC_URL!, "finalized");

    const keyMaterial = process.env.OPERATOR_PRIVATE_KEY;
    if (!keyMaterial) {
      return NextResponse.json(
        { error: "Server operator key is not configured." },
        { status: 500 },
      );
    }

    let operatorKeypair: Keypair;
    try {
      operatorKeypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(keyMaterial)),
      );
    } catch {
      return NextResponse.json(
        { error: "Invalid operator key JSON on the server." },
        { status: 500 },
      );
    }

    console.log(operatorKeypair.publicKey.toString());

    const {
      owner,
      emojis,
      solName,
      wallet,
      privy_user_id,
      emoji_1,
      emoji_2,
      emoji_3,
    } = await request.json();

    // Resolve the user‑provided domain. We keep the helper for consistency but
    // we no longer perform any SNS registration or availability checks.
    const effectiveSolName = resolvePaymojiSnsDomain(solName);
    console.log(
      "Domain resolved : ",
      solName,
      "→ effective:",
      effectiveSolName,
    );
    // The original implementation attempted to register an SNS name and
    // transfer ownership. Those steps are intentionally omitted – we only mint
    // the NFT and store the claim in our database.

    if (
      typeof owner !== "string" ||
      !Array.isArray(emojis) ||
      emojis.length !== 3 ||
      typeof solName !== "string" ||
      typeof privy_user_id !== "string" ||
      typeof emoji_1 !== "string" ||
      typeof emoji_2 !== "string" ||
      typeof emoji_3 !== "string" ||
      !emojis.includes(emoji_1) ||
      !emojis.includes(emoji_2) ||
      !emojis.includes(emoji_3)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    // if (!snsIsAvailable) {
    //   return NextResponse.json(
    //     { error: "SNS is not available for this name . Name Taken" },
    //     { status: 400 },
    //   );
    // }

    const combo = emojis.join("");
    if (!(await isEmojiAvailable(combo))) {
      return NextResponse.json(
        { error: "This emoji combination is already claimed." },
        { status: 400 },
      );
    }

    // const snsInstructions = await buildSnsRegistrationInstructions(connection, {
    //   name: effectiveSolName,
    //   buyer: operatorKeypair.publicKey,
    // });

    // Initialise Metaplex UMI client (devnet)
    const umi = createUmi("https://api.devnet.solana.com").use(mplCore());
    umi.use(keypairIdentity(fromWeb3JsKeypair(operatorKeypair)));
    // Generate a new signer for the NFT asset
    const asset = generateSigner(umi);

    // Fetch the collection that the NFT belongs to
    const collection = await fetchCollection(
      umi,
      publicKey(process.env.NEXT_PUBLIC_METAPLEX_COLLECTION_ADDRESS!),
    );

    const displayName = emojis.join("");
    const metadata = {
      name: displayName,
      symbol: "PAYMOJI",
      description: `Paymoji identity ${solName} on Solana`,
      image: PAYMOJI_BRAND_IMAGE_URL,
      external_url: "https://x.com/paymojionsol",
      attributes: [
        { trait_type: "emoji_1", value: emojis[0] },
        { trait_type: "emoji_2", value: emojis[1] },
        { trait_type: "emoji_3", value: emojis[2] },
        { trait_type: "combo", value: displayName },
      ],
    };

    // Encode metadata as a data URI (no external storage required)
    const uri = `data:application/json;base64,${Buffer.from(
      JSON.stringify(metadata),
    ).toString("base64")}`;

    // const transaction = new Transaction().add(...snsInstructions);

    // transaction.feePayer = operatorKeypair.publicKey;
    // const { blockhash } = await connection.getLatestBlockhash("finalized");

    // transaction.recentBlockhash = blockhash;

    // transaction.sign(operatorKeypair);
    // const snsTXsignature = await connection.sendRawTransaction(
    //   transaction.serialize(),
    // );
    // await connection.confirmTransaction(snsTXsignature, "finalized");

    // if (snsTXsignature) {
    //   const transferIx = await devnet.bindings.transferNameOwnership(
    //     connection,
    //     normalizeSolName(effectiveSolName).replace(/\.sol$/i, ""),
    //     new PublicKey(wallet),
    //     undefined,
    //     undefined,
    //     operatorKeypair.publicKey,
    //   );

    //   const transferTx = new Transaction().add(transferIx);
    //   transferTx.feePayer = operatorKeypair.publicKey;
    //   const { blockhash: transferBh } =
    //     await connection.getLatestBlockhash("finalized");

    //   transferTx.recentBlockhash = transferBh;
    //   transferTx.sign(operatorKeypair);
    //   const transferTXsignature = await connection.sendRawTransaction(
    //     transferTx.serialize(),
    //   );
    //   await connection.confirmTransaction(transferTXsignature, "finalized");

    //   if (transferTXsignature) {
    //     console.log("Transfer Successfull");
    //     finaltransferTXsignature = transferTXsignature;
    //   }
    // }
    // Create the NFT on‑chain
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
    const explorerUrl = `https://explorer.solana.com/address/${nftAddress}?cluster=devnet`;
    // const snsTxnUrl = `https://explorer.solana.com/tx/${finaltransferTXsignature}?cluster=devnet`;

    try {
      const user = await registerPaymoji({
        privy_user_id: privy_user_id,
        emoji_1,
        emoji_2,
        emoji_3,
        emoji_combo: combo,
        sol_name: effectiveSolName,
        nft_address: nftAddress,
        wallet: wallet,
      });
      console.log("User registered : ", user);
    } catch (dbErr) {
      console.error("Mint succeeded but Supabase identity save failed:", dbErr);
    }

    void sendIdentityMintedAlert({
      recipientWallet: wallet,
      emojiCombo: combo,
      solName: effectiveSolName,
    }).catch((err) => console.warn("[Dialect] mint alert:", err));

    // Log for server‑side visibility
    console.log("✅ Minted successfully!");
    console.log("NFT Address :", nftAddress);
    console.log("View on explorer :", explorerUrl);
    // console.log("SNS Transaction :", snsTxnUrl);

    return NextResponse.json({
      success: true,
      nftAddress,
      explorerUrl,
      // finaltransferTXsignature,
      brandImageUrl: PAYMOJI_BRAND_IMAGE_URL,
      emojiCombo: combo,
      solName: effectiveSolName,
      solNameClient: solName,
    });
  } catch (err) {
    console.error("NFT Minting failed:", err);
    return NextResponse.json(
      { error: "Minting failed – see server logs for details." },
      { status: 500 },
    );
  }
}
