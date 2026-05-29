import { getConnection } from "@/lib/getConnection";
import { devnet } from "@bonfida/spl-name-service";
import { Connection } from "@solana/web3.js";
const rpc = getConnection();
async function main() {
  const tendrParentPk = devnet.utils.getDomainKeySync(`paymoji.sol`).pubkey;
  const parentInfo = await rpc.getAccountInfo(tendrParentPk, "confirmed");
  if (!parentInfo) {
    console.log("No Owner");
  }

  console.log(parentInfo?.owner.toString());
}

main();
