/**
 * Extract broker name from platform server string
 * Examples:
 * - "Exness-MT5Real23" -> "Exness"
 * - "ICMarkets-Live01" -> "IC Markets"
 * - "XM-Real 5" -> "XM"
 */
export function extractBrokerName(platformServer: string | null | undefined): string | null {
  if (!platformServer) return null;
  
  // Remove common suffixes and numbers
  const cleaned = platformServer
    .replace(/-MT[45]/gi, "")
    .replace(/-Real\d*/gi, "")
    .replace(/-Live\d*/gi, "")
    .replace(/-Demo\d*/gi, "")
    .replace(/\d+$/g, "")
    .trim();
  
  // Split by dash or space and take first part
  const parts = cleaned.split(/[-\s]+/);
  const brokerName = parts[0];
  
  // Handle special cases
  const brokerMap: Record<string, string> = {
    "IC": "IC Markets",
    "FXTM": "ForexTime",
    "HF": "HotForex",
    "FBS": "FBS",
    "Exness": "Exness",
    "XM": "XM",
    "Pepperstone": "Pepperstone",
    "OANDA": "OANDA",
    "IG": "IG Group",
  };
  
  return brokerMap[brokerName] || brokerName;
}

/**
 * Get a fallback/default broker logo based on broker name
 * Returns a placeholder or generic forex icon
 */
export function getDefaultBrokerLogo(brokerName: string): string {
  // Map of known broker logos (using public CDN URLs or local assets)
  const knownLogos: Record<string, string> = {
    "Exness": "https://www.exness.com/favicon.ico",
    "IC Markets": "https://www.icmarkets.com/favicon.ico",
    "XM": "https://www.xm.com/favicon.ico",
    "Pepperstone": "https://www.pepperstone.com/favicon.ico",
    "OANDA": "https://www.oanda.com/favicon.ico",
    "ForexTime": "https://www.forextime.com/favicon.ico",
    "FBS": "https://fbs.com/favicon.ico",
    "HotForex": "https://www.hotforex.com/favicon.ico",
    "IG Group": "https://www.ig.com/favicon.ico",
  };
  
  return knownLogos[brokerName] || "/default-broker-logo.svg";
}

/**
 * Get broker logo URL for display
 * This function returns either a known logo or a default placeholder
 */
export function getBrokerLogoUrl(platformServer: string | null | undefined): string {
  const brokerName = extractBrokerName(platformServer);
  
  if (!brokerName) {
    return "/default-broker-logo.svg";
  }
  
  return getDefaultBrokerLogo(brokerName);
}
