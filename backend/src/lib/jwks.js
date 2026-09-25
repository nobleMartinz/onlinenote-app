import { createRemoteJWKSet } from "jose";

const supabaseProjectUrl = process.env.SUPABASE_URL;

if (!supabaseProjectUrl) {
  throw new Error("SUPABASE_URL environment variable is required");
}

const jwksUrl = `${supabaseProjectUrl.replace(/\/$/, "")}/auth/v1/.well-known/jwks.json`;

export const JWKS = createRemoteJWKSet(new URL(jwksUrl), {
  cacheMaxAge: 3600000,
  cooldownDuration: 300000
});