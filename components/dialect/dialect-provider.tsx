"use client";

import dynamic from "next/dynamic";
import { useMemo, type ReactNode } from "react";
import { DialectSolanaSdk } from "@dialectlabs/react-sdk-blockchain-solana";
import type { DialectSolanaWalletAdapter } from "@dialectlabs/react-sdk-blockchain-solana";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { useWallets } from "@privy-io/react-auth/solana";
import { WalletAdapterShell } from "@/components/solana/wallet-adapter-shell";
import { getDialectClientConfig } from "@/lib/dialect/config";

// Dialect in-app listener
const DialectInAppListener = dynamic(
  () =>
    import("@/components/dialect/dialect-in-app-listener").then(
      (m) => m.DialectInAppListener,
    ),
  { ssr: false },
);

// Adaprter based on solana , dependent on publickey
const EMPTY_ADAPTER: DialectSolanaWalletAdapter = { publicKey: null };

function isSolanaWallet(w: unknown) {
  const wallet = w as { standardWallet?: { chains?: readonly string[] } };
  return wallet.standardWallet?.chains?.some((c) =>
    String(c).toLowerCase().includes("solana"),
  );
}

function useDialectWalletAdapter(): DialectSolanaWalletAdapter {
  const { wallets, ready } = useWallets();

  return useMemo(() => {
    if (!ready) return EMPTY_ADAPTER;

    const wallet = wallets.find(isSolanaWallet);
    if (!wallet?.address) return EMPTY_ADAPTER;

    let publicKey: PublicKey | null = null;
    try {
      publicKey = new PublicKey(wallet.address);
    } catch {
      return EMPTY_ADAPTER;
    }

    return {
      publicKey,
      signMessage: wallet.signMessage
        ? async (msg: Uint8Array) => {
            const { signature } = await wallet.signMessage!({ message: msg });
            return signature;
          }
        : undefined,
      signTransaction: wallet.signTransaction
        ? async <T extends Transaction | VersionedTransaction>(tx: T) => {
            const bytes =
              tx instanceof VersionedTransaction
                ? tx.serialize()
                : tx.serialize({
                    requireAllSignatures: false,
                    verifySignatures: false,
                  });
            const { signedTransaction } = await wallet.signTransaction!({
              transaction: bytes,
              chain: "solana:devnet",
            });
            if (tx instanceof VersionedTransaction) {
              return VersionedTransaction.deserialize(signedTransaction) as T;
            }
            return Transaction.from(signedTransaction) as T;
          }
        : undefined,
    };
  }, [ready, wallets]);
}

export function DialectProvider({ children }: { children: ReactNode }) {
  const config = getDialectClientConfig();
  const walletAdapter = useDialectWalletAdapter();

  if (!config) {
    return <>{children}</>;
  }

  return (
    <WalletAdapterShell>
      <DialectSolanaSdk
        dappAddress={config.dappAddress}
        config={{ environment: config.environment }}
        customWalletAdapter={walletAdapter}
      >
        {walletAdapter.publicKey ? <DialectInAppListener /> : null}
        {children}
      </DialectSolanaSdk>
    </WalletAdapterShell>
  );
}
