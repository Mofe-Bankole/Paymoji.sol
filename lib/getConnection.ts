import { Connection } from "@solana/web3.js";

if (!process.env.NEXT_PUBLIC_DEVNET_RPC_URL) {
  console.log("NEXT_PUBLIC_DEVNET_RPC_URL doesnt exist . Pls Affix that value");
}
const connection = new Connection(
  process.env.NEXT_PUBLIC_DEVNET_RPC_URL!,
  "finalized",
);
export function getConnection() {
  return connection;
}
