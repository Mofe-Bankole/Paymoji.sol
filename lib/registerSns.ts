import { devnet } from "@bonfida/spl-name-service";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  type PublicKey,
  type TransactionInstruction,
} from "@solana/web3.js";

/** Normalize to lowercase `*.sol` */
export function normalizeSolName(name: string): string {
  const t = name.trim().toLowerCase();
  return t.endsWith(".sol") ? t : `${t}.sol`;
}

/**
 * Devnet SNS registration instructions.
 *
 * **Root `name.sol`:** use `devnet.bindings.registerDomainName` (v1). It resolves
 * payment against devnet `PYTH_FEEDS` (legacy Pyth layout). Do **not** use
 * `registerDomainNameV2` here — v2 looks up `PYTH_PULL_FEEDS` from mainnet-style
 * constants and throws `PythFeedNotFound` for devnet USDC.
 *
 * **Subdomain `child.paymoji.sol`:** `createSubdomain` (parent must exist; `buyer`
 * must be the parent-domain owner).
 *
 * `buyerTokenAccount` in params is ignored for roots; the buyer's **devnet USDC ATA**
 * is derived automatically (same pattern as Bonfida / Tendr devnet scripts).
 */
export async function buildSnsRegistrationInstructions(
  connection: Connection,
  params: {
    name: string;
    buyer: PublicKey;
    /** @deprecated Ignored for root registration; USDC ATA is derived from `buyer`. */
    buyerTokenAccount?: PublicKey;
  },
): Promise<TransactionInstruction[]> {
  const domain = normalizeSolName(params.name);
  const withoutSol = domain.replace(/\.sol$/i, "");

  if (withoutSol.includes(".")) {
    const nested = await devnet.bindings.createSubdomain(
      connection,
      domain,
      params.buyer,
    );
    return nested.flat();
  }

  const usdcMint = devnet.constants.USDC_MINT;
  const buyerUsdcAta = getAssociatedTokenAddressSync(
    usdcMint,
    params.buyer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const ixGroups = await devnet.bindings.registerDomainName(
    connection,
    withoutSol,
    1_000,
    params.buyer,
    buyerUsdcAta,
  );

  return ixGroups.flat();
}

export async function checkSnsAvailability(name: string): Promise<boolean> {
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed",
  );

  try {
    const domain = normalizeSolName(name);
    const { pubkey } = devnet.utils.getDomainKeySync(domain);
    const account = await connection.getAccountInfo(pubkey);
    return account === null;
  } catch (err) {
    console.error("Error checking domain:", err);
    return false;
  }
}
