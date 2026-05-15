"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  PrivyProvider as PrivySDKProvider,
  usePrivy,
  PrivyClientConfig,
} from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { DEVNET_RPC, MAINNET_RPC } from "@/lib/solana-network";

function httpToWs(httpUrl: string) {
  return httpUrl.replace(/^https?:\/\//, (m) =>
    m.startsWith("https") ? "wss://" : "ws://",
  );
}

const PRIVY_SOLANA_CONFIG = {
  loginMethods: ["google", "email"] as const,
  embeddedWallets: {
    solana: {
      createOnLogin: "users-without-wallets" as const,
    },
  },
  solana: {
    rpcs: {
      "solana:mainnet": {
        rpc: createSolanaRpc(MAINNET_RPC),
        rpcSubscriptions: createSolanaRpcSubscriptions(httpToWs(MAINNET_RPC)),
      },
      "solana:devnet": {
        rpc: createSolanaRpc(DEVNET_RPC),
        rpcSubscriptions: createSolanaRpcSubscriptions(httpToWs(DEVNET_RPC)),
      },
    },
  },
};

type PrivyContextProps = {
  connection: Connection;
  address?: string;
  publicKey?: PublicKey;
  isReady: boolean;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  // signTransaction: <T extends Transaction | VersionedTransaction>(
  //   tx: T,
  // ) => Promise<T>;
  // signMessage: (msg: Uint8Array) => Promise<Uint8Array>;
};

const PrivyContext = createContext<PrivyContextProps | undefined>(undefined);

/* -------------------- Helpers -------------------- */

const isSolanaWallet = (w: unknown) => {
  // The wallet object returned by Privy has a `standardWallet` field with a list of chain names.
  // We narrow the type safely to avoid using `any`.
  const wallet = w as { standardWallet?: { chains?: string[] } };
  return wallet.standardWallet?.chains?.some((c) =>
    c.toLowerCase().includes("solana"),
  );
};

/* -------------------- Wallet Provider -------------------- */

export function PrivyWalletProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const connection = useMemo(() => new Connection(DEVNET_RPC, "confirmed"), []);

  const [address, setAddress] = useState<string>();
  const [publicKey, setPublicKey] = useState<PublicKey>();

  useEffect(() => {
    if (!ready || !authenticated) {
      setAddress(undefined);
      setPublicKey(undefined);
      return;
    }

    const wallet = wallets.find(isSolanaWallet);

    if (wallet?.address) {
      setAddress(wallet.address);
      setPublicKey(new PublicKey(wallet.address));
    }
  }, [ready, authenticated, wallets]);

  const getWallet = () => {
    const wallet = wallets.find(isSolanaWallet);

    if (!wallet) {
      throw new Error(
        "Solana wallet not ready yet. Please log in and ensure you have an embedded Solana wallet.",
      );
    }

    return wallet;
  };

  // const signTransaction = async <T extends Transaction | VersionedTransaction>(
  //   tx: T,
  // ): Promise<T> => {
  //   const wallet = getWallet();
  //   const signed = await wallet.signTransaction(tx);
  //   return signed as unknown as T;
  // };

  // const signMessage = async (msg: Uint8Array): Promise<Uint8Array> => {
  //   const wallet = getWallet();
  //   const { signature } = await wallet.signMessage(msg);
  //   return signature;
  // };

  return (
    <PrivyContext.Provider
      value={{
        connection,
        address,
        publicKey,
        isReady: ready,
        isLoggedIn: authenticated,
        login,
        logout,
        // signTransaction,
        // signMessage,
      }}
    >
      {children}
    </PrivyContext.Provider>
  );
}

/* -------------------- App Provider -------------------- */

export function PrivyAppProvider({ children }: { children: ReactNode }) {
  // Ensure the Privy App ID is present; otherwise the SDK will throw at runtime.
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    console.error(
      "NEXT_PUBLIC_PRIVY_APP_ID is not defined. Privy will not work.",
    );
  }
  return (
    <PrivySDKProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={PRIVY_SOLANA_CONFIG as unknown as PrivyClientConfig}
    >
      <PrivyWalletProvider>{children}</PrivyWalletProvider>
    </PrivySDKProvider>
  );
}

/* -------------------- Hook -------------------- */

export const usePrivyWallet = () => {
  const ctx = useContext(PrivyContext);

  if (!ctx) {
    throw new Error("usePrivyWallet must be used within PrivyAppProvider");
  }

  return ctx;
};
