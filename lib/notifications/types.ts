export type PaymojiToastKind = "payment_received" | "identity_minted" | "info";

export type PaymojiToastInput = {
  kind?: PaymojiToastKind;
  title: string;
  message: string;
  href?: string;
  durationMs?: number;
};

export type PaymojiToast = PaymojiToastInput & {
  id: string;
};
