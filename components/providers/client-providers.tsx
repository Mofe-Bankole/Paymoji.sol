"use client";
import type { ReactNode } from "react";
import { PrivyAppProvider } from "@/privy/PrivyProvider";
import { DialectProvider } from "@/components/dialect/dialect-provider";
import { PaymojiToastProvider } from "@/components/notifications/paymoji-toast-provider";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <PrivyAppProvider>
      <PaymojiToastProvider>
        <DialectProvider>{children}</DialectProvider>
      </PaymojiToastProvider>
    </PrivyAppProvider>
  );
}
