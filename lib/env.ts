const PLACEHOLDER_PATTERNS = [
  /\[ref\]/,
  /\[password\]/,
  /^your-/i,
  /your-secret-here/i,
  /your-client-id/i,
];

function isPlaceholder(value: string | undefined) {
  if (!value) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (isPlaceholder(value)) {
    throw new Error(
      `Missing valid ${name}. Update your local .env with the real value instead of the example placeholder.`
    );
  }
  return value;
}

export function getAuthEnv() {
  return {
    googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
    googleClientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    nextAuthSecret: requireEnv("NEXTAUTH_SECRET"),
    nextAuthUrl: requireEnv("NEXTAUTH_URL"),
  };
}

export function getDatabaseEnv() {
  return {
    databaseUrl: requireEnv("DATABASE_URL"),
    directUrl: requireEnv("DIRECT_URL"),
  };
}
