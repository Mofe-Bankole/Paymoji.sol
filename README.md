# Paymoji.sol

A UX‑first Solana frontend and API for sending native SOL or SPL‑token payments, minting a memorable 3‑emoji wallet identity, and eventually enabling private (confidential) transfers via MagicBlock’s epoch‑olymp rollups.

## Features
- **Public payments** – stake or wallet‑to‑wallet SOL/SPL transfers via a connected Privy wallet.
- **Emoji identity** – mint a 3‑emoji NFT that registers on the Solana Name Service (SNS) and instantly resolves to your wallet address.
- **MagicBlock private transfers** – (planned) Ephemeral rollup‑enabled confidential transfers that keep amounts hidden from the public ledger.
- **Developer friendly** – well‑documented server‑route handlers (`/api/mint`, `/api/resolve`), easy‑to‑extend payment helpers, and a thin Next.js UI.

## Quickstart
```bash
npm install
npm run dev
```

## Usage
### 1. Mint your Paymoji (emoji identity)
```ts
// Next.js handler (app/api/mint/route.ts) automatically handles the mint.

// Client example
const { emojis, solName } = usePaymojiStore();
const response = await fetch("/api/mint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    owner: walletAddr,
    emojis,          // 3‑emoji array
    solName,          // short .sol name
    wallet: walletAddr,
  }),
});
const result = await response.json();
```

### 2. Resolve an emoji or .sol name to a Solana wallet
```ts
const res = await fetch("/api/resolve", {
  method: "POST",
  body: JSON.stringify({ identifier: "👻🦊🦚" }),
});
const { wallet, emoji_combo, sol_name } = await res.json();
```

### 3. Send a public transaction
```ts
import { publicPayment } from "@/lib/payments";
const tx = await publicPayment(
  {
    mode: "public",
    amount: 0.1,
    recipient: resolvedAddress,
    network: "devnet",
    chain: "solana",
    token: "SOL",
    publicKey: walletAddr,
  },
  wallet,
);
```

### 4. MagicBlock Private Transfer (future)
MagicBlock provides a zero‑knowledge API for private transfers. Once hooked, the flow becomes:

1. Create a **transfer intent** (JSON body with `from`, `to`, `amount`, `token`).
2. Sign the intent off‑chain with the user’s private key.
3. POST signed intent to **MagicBlock private‑transfer endpoint**.
4. MagicBlock rolls the transfer, writes a commitment on‑chain, and returns a transaction ID and explorer URL.

> ⚠️ The private‑transfer route is *not* yet implemented; this section serves as a roadmap.

## Build & Test
```bash
# Install dependencies
npm ci
# Run tests (to be added)
npm test
# Run lint & format checks
npm run lint
npm run format
```

## Contributing
Pull requests are welcome. Run the full test suite before submitting:
```bash
npm test
```

## License
MIT
