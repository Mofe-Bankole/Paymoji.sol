"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Sparkles, Wallet, X } from "lucide-react";
import type { PaymojiToast, PaymojiToastInput } from "@/lib/notifications/types";

type ToastContextValue = {
  pushToast: (toast: PaymojiToastInput) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toastIcon(kind: PaymojiToast["kind"]) {
  if (kind === "payment_received") {
    return <Wallet className="h-4 w-4 text-[#5de6ff]" aria-hidden />;
  }
  if (kind === "identity_minted") {
    return <Sparkles className="h-4 w-4 text-[#ddb7ff]" aria-hidden />;
  }
  return null;
}

function accentBar(kind: PaymojiToast["kind"]) {
  if (kind === "payment_received") return "bg-[#5de6ff]";
  if (kind === "identity_minted") {
    return "bg-gradient-to-b from-[#b76dff] to-[#00cbe6]";
  }
  return "bg-white/30";
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: PaymojiToast;
  onDismiss: (id: string) => void;
}) {
  const inner = (
    <div className="pointer-events-auto relative flex w-[min(100vw-2rem,380px)] overflow-hidden border border-white/10 bg-[#0b1326]/95 shadow-[0_24px_64px_rgba(0,0,0,0.45)] backdrop-blur-xl animate-[paymoji-toast-in_0.35s_ease-out]">
      <div className={`w-1 shrink-0 ${accentBar(toast.kind)}`} />
      <div className="flex min-w-0 flex-1 gap-3 px-4 py-3.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-white/10 bg-white/[0.04]">
          {toastIcon(toast.kind)}
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Paymoji
          </p>
          <p className="mt-1 text-sm font-bold tracking-tight text-white">
            {toast.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/55">
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center text-white/35 transition-colors hover:text-white"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );

  if (toast.href) {
    return (
      <Link href={toast.href} className="block" onClick={() => onDismiss(toast.id)}>
        {inner}
      </Link>
    );
  }

  return inner;
}

export function PaymojiToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<PaymojiToast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((input: PaymojiToastInput) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `toast-${Date.now()}`;
    const toast: PaymojiToast = {
      id,
      kind: input.kind ?? "info",
      title: input.title,
      message: input.message,
      href: input.href,
      durationMs: input.durationMs ?? 6000,
    };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
    return id;
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), toast.durationMs ?? 6000),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [toasts, dismissToast]);

  const value = useMemo(
    () => ({ pushToast, dismissToast }),
    [pushToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-3"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function usePaymojiToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("usePaymojiToast must be used within PaymojiToastProvider");
  }
  return ctx;
}
