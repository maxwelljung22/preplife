export function getServerSecret(envName: string, developmentFallback: string) {
  const value = process.env[envName]?.trim();

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing required ${envName}. Configure it before running HawkLife in production.`);
  }

  return developmentFallback;
}
