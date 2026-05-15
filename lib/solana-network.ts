/** Privy / wallet-standard cluster id */
export type PaymojiSolanaCluster = "solana:devnet" | "solana:mainnet";

export const DEFAULT_CLUSTER: PaymojiSolanaCluster = "solana:devnet";

export const DEVNET_RPC =
  process.env.NEXT_PUBLIC_DEVNET_RPC_URL ?? "https://api.devnet.solana.com";

export const MAINNET_RPC =
  process.env.NEXT_PUBLIC_MAINNET_RPC_URL ??
  "https://api.mainnet-beta.solana.com";

export function clusterFromNetwork(
  network: "devnet" | "mainnet",
): PaymojiSolanaCluster {
  return network === "mainnet" ? "solana:mainnet" : "solana:devnet";
}

export function rpcUrlForNetwork(network: "devnet" | "mainnet"): string {
  return network === "mainnet" ? MAINNET_RPC : DEVNET_RPC;
}
