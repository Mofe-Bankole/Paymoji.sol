/**
 * Paymoji SNS layout: parent `paymoji.sol` on devnet, user identities as
 * `{slug}.paymoji.sol` subdomains created by the operator wallet.
 *
 * Disable subdomains: `NEXT_PUBLIC_PAYMOJI_SUBDOMAINS=false`
 * Custom parent label: `NEXT_PUBLIC_PAYMOJI_SNS_PARENT=mybrand` (default `paymoji`)
 */
export function paymojiSubdomainsEnabled(): boolean {
  const v = (
    process.env.NEXT_PUBLIC_PAYMOJI_SUBDOMAINS ??
    process.env.PAYMOJI_SUBDOMAINS ??
    ""
  )
    .trim()
    .toLowerCase();
  return v !== "false" && v !== "0" && v !== "no";
}

export function paymojiSnsParentLabel(): string {
  const raw =
    process.env.PAYMOJI_SNS_PARENT?.trim() ||
    process.env.NEXT_PUBLIC_PAYMOJI_SNS_PARENT?.trim() ||
    "paymoji";
  return raw.toLowerCase() || "paymoji";
}

/**
 * Normalize client / LLM output to the domain we mint on SNS.
 * - With subdomains on (default): `foxwave.sol` → `foxwave.paymoji.sol`
 * - Already `foxwave.paymoji.sol` → unchanged
 * - Subdomains off: ensure trailing `.sol` only
 */
export function resolvePaymojiSnsDomain(raw: string): string {
  const n0 = raw.trim().toLowerCase();
  if (!n0) return n0;

  if (!paymojiSubdomainsEnabled()) {
    return n0.endsWith(".sol") ? n0 : `${n0}.sol`;
  }

  const parent = paymojiSnsParentLabel();
  const withSol = n0.endsWith(".sol") ? n0 : `${n0}.sol`;

  if (withSol.endsWith(`.${parent}.sol`)) {
    return withSol;
  }

  const slug = withSol
    .replace(/\.sol$/i, "")
    .split(".")[0]
    .replace(/[^a-z0-9-]/g, "");

  if (!slug) {
    return withSol;
  }

  return `${slug}.${parent}.sol`;
}
