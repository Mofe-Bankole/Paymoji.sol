"use client";
import { PrivyAppProvider } from "@/privy/PrivyProvider";

import dynamic from "next/dynamic";
import { useMemo, type ReactNode } from "react";
import { DialectSolanaSdk } from "@dialectlabs/react-sdk-blockchain-solana";
import type { DialectSolanaWalletAdapter } from "@dialectlabs/react-sdk-blockchain-solana";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { useWallets } from "@privy-io/react-auth/solana";
import { getDialectClientConfig } from "@/lib/dialect/config";
// import { PrivyWalletProvider } from "@/privy/PrivyProvider";

const DialectInAppListener = dynamic(
  () =>
    import("@/components/dialect/dialect-in-app-listener").then(
      (m) => m.DialectInAppListener,
    ),
  { ssr: false },
);

function isSolanaWallet(w: unknown) {
  const wallet = w as { standardWallet?: { chains?: string[] } };
  return wallet.standardWallet?.chains?.some((c) =>
    c.toLowerCase().includes("solana"),
  );
}

function useDialectWalletAdapter(): DialectSolanaWalletAdapter | null {
  const { wallets, ready } = useWallets();

  return useMemo(() => {
    if (!ready) return null;
    const wallet = wallets.find(isSolanaWallet);
    if (!wallet?.address) return null;

    let publicKey: PublicKey | null = null;
    try {
      publicKey = new PublicKey(wallet.address);
    } catch {
      return null;
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
    <PrivyAppProvider>
      <DialectSolanaSdk
        // provider={PrivyAppProvid}
        dappAddress={config.dappAddress}
        config={{ environment: config.environment }}
        customWalletAdapter={walletAdapter ?? undefined}
      >
        {children}
      </DialectSolanaSdk>
    </PrivyAppProvider>
  );
}
