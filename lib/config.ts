const activeNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

export const config = {
  devnet_rpc: process.env.NEXT_PUBLIC_DEVNET_RPC_URL!,
  mainnet_rpc: process.env.NEXT_PUBLIC_MAINNET_RPC_URL!,
  network: activeNetwork,
  mainnet_rpc_subscription_url:
    process.env.NEXT_PUBLIC_MAINNET_RPC_SUBSCRIPTION_URL!,
  devnet_rpc_subscription_url:
    process.env.NEXT_PUBLIC_DEVNET_RPC_SUBSCRIPTION_URL!,
  indexerApiEndpoint: process.env.NEXT_PUBLIC_INDEXER_API_ENDPOINT!,
  usdc_mint: process.env.NEXT_PUBLIC_USDC_MINT!,
  umbra_relayer: process.env.NEXT_PUBLIC_UMBRA_RELAYER!,
  fee_payer: process.env.OPERATOR_PRIVATE_KEY!,
};
