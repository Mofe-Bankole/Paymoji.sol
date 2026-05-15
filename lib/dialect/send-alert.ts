import "server-only";

import {
  getDialectServerConfig,
  type DialectServerConfig,
} from "@/lib/dialect/config";

type AlertRecipient =
  | { type: "subscriber"; walletAddress: string }
  | { type: "subscribers"; walletAddresses: string[] };

type SendAlertPayload = {
  title: string;
  body: string;
  recipient: AlertRecipient;
  data?: Record<string, string>;
  image?: string;
};

async function postAlert(
  config: DialectServerConfig,
  payload: SendAlertPayload,
): Promise<void> {
  const res = await fetch(`${config.baseUrl}/v2/${config.appId}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-dialect-api-key": config.apiKey,
    },
    body: JSON.stringify({
      channels: ["IN_APP"],
      message: {
        title: payload.title.slice(0, 60),
        body: payload.body.slice(0, 500),
        ...(payload.image ? { image: payload.image } : {}),
      },
      recipient: payload.recipient,
      ...(payload.data ? { data: payload.data } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Dialect send failed (${res.status}): ${text || res.statusText}`,
    );
  }
}

export async function sendDialectAlert(payload: SendAlertPayload): Promise<boolean> {
  const config = getDialectServerConfig();
  if (!config) {
    console.warn(
      "[Dialect] Skipping alert — set NEXT_DIALECT_API_KEY and NEXT_DIALECT_APP_ID in .env",
    );
    return false;
  }

  try {
    await postAlert(config, payload);
    return true;
  } catch (err) {
    console.warn("[Dialect] Alert delivery failed:", err);
    return false;
  }
}

export async function sendPaymentReceivedAlert({
  recipientWallet,
  senderLabel,
  amount,
  token,
}: {
  recipientWallet: string;
  senderLabel: string;
  amount: number;
  token: string;
}) {
  return sendDialectAlert({
    title: "Payment received",
    body: `${senderLabel} sent you ${amount} ${token}`,
    recipient: { type: "subscriber", walletAddress: recipientWallet },
    data: {
      type: "payment_received",
      amount: String(amount),
      token,
      sender: senderLabel,
    },
  });
}

export async function sendIdentityMintedAlert({
  recipientWallet,
  emojiCombo,
  solName,
}: {
  recipientWallet: string;
  emojiCombo: string;
  solName: string;
}) {
  return sendDialectAlert({
    title: "Paymoji minted",
    body: `${emojiCombo} is live as ${solName}`,
    recipient: { type: "subscriber", walletAddress: recipientWallet },
    data: {
      type: "identity_minted",
      emoji_combo: emojiCombo,
      sol_name: solName,
    },
  });
}
