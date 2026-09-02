// ─── analyzeURL.ts ───────────────────────────────────────────────────
// Safe URL analysis — NEVER visits URLs. Pure static parsing only.

export interface URLFinding {
  type: string;
  severity: 'info' | 'warning' | 'danger';
  detail: string;
}

export interface SingleURLAnalysis {
  originalURL: string;
  protocol: string;
  hostname: string;
  path: string;
  isIPAddress: boolean;
  isShortener: boolean;
  hasHomoglyph: boolean;
  suspiciousKeywords: string[];
  claimedBrand: string | null;
  domainMismatch: boolean;
  findings: URLFinding[];
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
}

export interface AnalyzeURLResult {
  urls: SingleURLAnalysis[];
  overallURLRisk: 'none' | 'safe' | 'suspicious' | 'dangerous';
  hasURLs: boolean;
}

const SHORTENER_DOMAINS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd',
  'buff.ly', 'adf.ly', 'bl.ink', 'lnkd.in', 'rb.gy', 'cutt.ly',
  'short.io', 'tiny.cc',
];

const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'sign-in', 'verify', 'secure', 'update',
  'confirm', 'account', 'password', 'banking', 'paypal', 'wallet',
  'suspend', 'locked', 'alert', 'urgent', 'reset', 'auth',
];

const KNOWN_BRANDS: Record<string, string[]> = {
  'Microsoft': ['microsoft.com', 'office.com', 'outlook.com', 'live.com', 'hotmail.com'],
  'Google': ['google.com', 'gmail.com', 'googleapis.com'],
  'Apple': ['apple.com', 'icloud.com'],
  'Amazon': ['amazon.com', 'aws.amazon.com'],
  'PayPal': ['paypal.com'],
  'Netflix': ['netflix.com'],
  'Facebook': ['facebook.com', 'fb.com'],
  'LinkedIn': ['linkedin.com'],
  'Dropbox': ['dropbox.com'],
  'Bank': ['chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citi.com'],
};

// Common homoglyph substitutions
const HOMOGLYPHS: Record<string, string[]> = {
  'a': ['а', 'ą', 'ά'],  // Cyrillic а, etc.
  'e': ['е', 'ε', 'ë'],
  'o': ['о', 'ο', '0', 'ö'],
  'i': ['і', 'ι', '1', 'l', '!'],
  'l': ['1', 'I', 'ĺ'],
  'c': ['с', 'ç'],
  's': ['ѕ', '$', '5'],
  't': ['τ', '+'],
  'n': ['п'],
  'r': ['г'],
};

function parseURLSafe(urlStr: string): { protocol: string; hostname: string; path: string } | null {
  try {
    // Try to parse as-is
    const url = new URL(urlStr);
    return { protocol: url.protocol, hostname: url.hostname, path: url.pathname + url.search };
  } catch {
    // Try adding https://
    try {
      const url = new URL('https://' + urlStr);
      return { protocol: url.protocol, hostname: url.hostname, path: url.pathname + url.search };
    } catch {
      return null;
    }
  }
}

function isIPAddress(hostname: string): boolean {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
         hostname.startsWith('['); // IPv6
}

function checkHomoglyphs(hostname: string): boolean {
  for (const [_char, glyphs] of Object.entries(HOMOGLYPHS)) {
    for (const glyph of glyphs) {
      if (hostname.includes(glyph)) return true;
    }
  }
  // Also check numeric substitutions in brand-like domains
  if (/(?:micr0|g00g|amaz0n|paypa1|app1e|faceb00k|netf1ix)/.test(hostname)) return true;
  return false;
}

function detectClaimedBrand(hostname: string, fullText: string): string | null {
  const combined = (hostname + ' ' + fullText).toLowerCase();
  for (const [brand] of Object.entries(KNOWN_BRANDS)) {
    if (combined.includes(brand.toLowerCase())) return brand;
  }
  // Check for brand mentions in domain
  if (/microsoft|office|outlook/i.test(hostname)) return 'Microsoft';
  if (/google|gmail/i.test(hostname)) return 'Google';
  if (/apple|icloud/i.test(hostname)) return 'Apple';
  if (/amazon|aws/i.test(hostname)) return 'Amazon';
  if (/paypal/i.test(hostname)) return 'PayPal';
  if (/netflix/i.test(hostname)) return 'Netflix';
  return null;
}

function checkDomainMismatch(hostname: string, claimedBrand: string | null): boolean {
  if (!claimedBrand) return false;
  const legitimateDomains = KNOWN_BRANDS[claimedBrand] || [];
  // Check if hostname is or ends with any legitimate domain
  return !legitimateDomains.some(
    (d) => hostname === d || hostname.endsWith('.' + d)
  );
}

function analyzeOneURL(urlStr: string, messageText: string): SingleURLAnalysis {
  const parsed = parseURLSafe(urlStr);
  const findings: URLFinding[] = [];

  if (!parsed) {
    return {
      originalURL: urlStr,
      protocol: 'unknown',
      hostname: 'unparseable',
      path: '',
      isIPAddress: false,
      isShortener: false,
      hasHomoglyph: false,
      suspiciousKeywords: [],
      claimedBrand: null,
      domainMismatch: false,
      findings: [{ type: 'parse_error', severity: 'warning', detail: 'URL could not be safely parsed' }],
      riskLevel: 'suspicious',
    };
  }

  const { protocol, hostname, path } = parsed;

  // Check HTTP (not HTTPS)
  if (protocol === 'http:') {
    findings.push({ type: 'insecure_protocol', severity: 'warning', detail: 'URL uses insecure HTTP instead of HTTPS' });
  }

  // Check IP address
  const ipAddr = isIPAddress(hostname);
  if (ipAddr) {
    findings.push({ type: 'ip_address', severity: 'danger', detail: `URL uses an IP address (${hostname}) instead of a domain name` });
  }

  // Check shortener
  const shortener = SHORTENER_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d));
  if (shortener) {
    findings.push({ type: 'url_shortener', severity: 'warning', detail: `URL uses a shortener service (${hostname}) which hides the real destination` });
  }

  // Check homoglyphs
  const homoglyph = checkHomoglyphs(hostname);
  if (homoglyph) {
    findings.push({ type: 'homoglyph', severity: 'danger', detail: `Domain may use character substitution to impersonate a legitimate site` });
  }

  // Suspicious subdomains (many levels)
  const subdomainParts = hostname.split('.');
  if (subdomainParts.length > 3) {
    findings.push({ type: 'excessive_subdomains', severity: 'warning', detail: `Domain has ${subdomainParts.length} levels which may indicate impersonation` });
  }

  // Suspicious keywords in URL
  const foundKeywords: string[] = [];
  const fullURLLower = (hostname + path).toLowerCase();
  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (fullURLLower.includes(kw)) {
      foundKeywords.push(kw);
    }
  }
  if (foundKeywords.length > 0) {
    findings.push({
      type: 'suspicious_keywords',
      severity: foundKeywords.length >= 3 ? 'danger' : 'warning',
      detail: `URL contains suspicious keywords: ${foundKeywords.join(', ')}`,
    });
  }

  // Brand/domain mismatch
  const claimedBrand = detectClaimedBrand(hostname, messageText);
  const domainMismatch = checkDomainMismatch(hostname, claimedBrand);
  if (domainMismatch) {
    findings.push({
      type: 'domain_mismatch',
      severity: 'danger',
      detail: `URL claims to be ${claimedBrand} but domain "${hostname}" is not an official ${claimedBrand} domain`,
    });
  }

  // Check for .test domains (our fictional safe domains)
  if (hostname.endsWith('.test')) {
    findings.push({ type: 'test_domain', severity: 'info', detail: 'This is a fictional .test domain used in simulation' });
  }

  // Determine risk level
  let riskLevel: SingleURLAnalysis['riskLevel'] = 'safe';
  if (findings.some((f) => f.severity === 'danger')) {
    riskLevel = 'dangerous';
  } else if (findings.some((f) => f.severity === 'warning')) {
    riskLevel = 'suspicious';
  }

  return {
    originalURL: urlStr,
    protocol,
    hostname,
    path,
    isIPAddress: ipAddr,
    isShortener: shortener,
    hasHomoglyph: homoglyph,
    suspiciousKeywords: foundKeywords,
    claimedBrand,
    domainMismatch,
    findings,
    riskLevel,
  };
}

export function analyzeURL(urls: string[], messageText: string): AnalyzeURLResult {
  if (!urls || urls.length === 0) {
    return { urls: [], overallURLRisk: 'none', hasURLs: false };
  }

  const analyzed = urls.map((url) => analyzeOneURL(url, messageText));

  let overallURLRisk: AnalyzeURLResult['overallURLRisk'] = 'safe';
  if (analyzed.some((u) => u.riskLevel === 'dangerous')) {
    overallURLRisk = 'dangerous';
  } else if (analyzed.some((u) => u.riskLevel === 'suspicious')) {
    overallURLRisk = 'suspicious';
  }

  return { urls: analyzed, overallURLRisk, hasURLs: true };
}
