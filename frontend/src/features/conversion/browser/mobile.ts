const LEGACY_MOBILE_USER_AGENT = /iPhone|iPad|iPod|Android/i;

export function isLegacyMobileUserAgent(userAgent: string): boolean {
  return LEGACY_MOBILE_USER_AGENT.test(userAgent);
}
