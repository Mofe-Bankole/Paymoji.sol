export type DialectEnvironment = "development" | "production";

export type DialectClientConfig = {
  dappAddress: string;
  environment: DialectEnvironment;
};

export type DialectServerConfig = {
  apiKey: string;
  appId: string;
  baseUrl: string;
};

const ALERTS_API = {
  development: "https://alerts.dialectapi.to",
  production: "https://alerts-api.dial.to",
} as const;

export function getDialectClientConfig(): DialectClientConfig | null {
  const dappAddress =
    process.env.NEXT_PUBLIC_DIALECT_DAPP_ADDRESS?.trim() ?? "";
  if (!dappAddress) return null;

  const envRaw = (
    process.env.NEXT_PUBLIC_DIALECT_ENVIRONMENT ?? "development"
  ).toLowerCase();

  const environment: DialectEnvironment =
    envRaw === "production" ? "production" : "development";

  return { dappAddress, environment };
}

export function getDialectServerConfig(): DialectServerConfig | null {
  const apiKey = process.env.NEXT_DIALECT_API_KEY?.trim() ?? "";
  const appId = process.env.NEXT_DIALECT_APP_ID?.trim() ?? "";
  if (!apiKey || !appId) return null;

  const envRaw = (process.env.NEXT_PUBLIC_DIALECT_ENVIRONMENT ?? "development").toLowerCase();
  const environment: DialectEnvironment =
    envRaw === "production" ? "production" : "development";

  return {
    apiKey,
    appId,
    baseUrl: ALERTS_API[environment],
  };
}

export function isDialectConfigured(): boolean {
  return getDialectClientConfig() !== null && getDialectServerConfig() !== null;
}
