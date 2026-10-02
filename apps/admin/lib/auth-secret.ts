export function getAdminJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is not configured");
    }
    return new TextEncoder().encode("fallback_secret_key_for_development_only_12345");
  }
  return new TextEncoder().encode(secret);
}