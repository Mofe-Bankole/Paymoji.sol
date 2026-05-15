"use client";

import { useEffect, useRef } from "react";
import { useHistory, useSubscribe } from "@dialectlabs/react-sdk";
import { usePrivyWallet } from "@/privy/PrivyProvider";
import { getDialectClientConfig } from "@/lib/dialect/config";
import { usePaymojiToast } from "@/components/notifications/paymoji-toast-provider";
import type { PaymojiToastKind } from "@/lib/notifications/types";

const SEEN_KEY = "paymoji_dialect_seen_alerts";

function loadSeen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>) {
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-200)));
  } catch {
    /* ignore */
  }
}

function classifyAlert(title: string, body: string): PaymojiToastKind {
  const t = title.toLowerCase();
  const b = body.toLowerCase();
  if (t.includes("payment") || b.includes("sent you")) return "payment_received";
  if (t.includes("mint") || b.includes("minted")) return "identity_minted";
  return "info";
}

/**
 * Subscribes the connected wallet to Dialect IN_APP alerts and surfaces
 * new messages as Paymoji-styled toasts (bottom-right).
 */
export function DialectInAppListener() {
  const { address, isLoggedIn, isReady } = usePrivyWallet();
  const { pushToast } = usePaymojiToast();
  const { subscribe } = useSubscribe({ channel: "IN_APP" });
  const { history } = useHistory({ refreshInterval: 5000 });
  const seenRef = useRef<Set<string>>(loadSeen());
  const subscribedRef = useRef(false);

  const dialectEnabled = Boolean(getDialectClientConfig());

  useEffect(() => {
    if (!dialectEnabled || !isReady || !isLoggedIn || !address) return;
    if (subscribedRef.current) return;

    subscribedRef.current = true;
    subscribe().catch(() => {
      subscribedRef.current = false;
    });
  }, [dialectEnabled, isReady, isLoggedIn, address, subscribe]);

  useEffect(() => {
    if (!dialectEnabled || !history?.alerts?.length) return;

    const seen = seenRef.current;
    const fresh = [...history.alerts].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    for (const alert of fresh) {
      if (seen.has(alert.id)) continue;
      seen.add(alert.id);

      pushToast({
        kind: classifyAlert(alert.title, alert.body),
        title: alert.title,
        message: alert.body,
        href: alert.actions?.[0]?.url,
      });
    }

    saveSeen(seen);
  }, [dialectEnabled, history, pushToast]);

  return null;
}
