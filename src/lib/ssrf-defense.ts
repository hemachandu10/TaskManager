import dns from "dns/promises";
import net from "net";
import { generateFallbackTitleFromUrl } from "./utils";

export interface UrlMetadata {
  title: string | null;
  description: string | null;
  hostname: string;
  faviconUrl: string | null;
}

export function isValidHttpUrl(inputUrl: string): boolean {
  try {
    const parsed = new URL(inputUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isPrivateIp(ip: string): boolean {
  if (!net.isIP(ip)) {
    return true; // If not a valid IP, reject for safety
  }

  // IPv4 checks
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4) return true;

    const [a, b, c, d] = parts;

    // 0.0.0.0/8 (Current network)
    if (a === 0) return true;

    // 10.0.0.0/8 (Private network)
    if (a === 10) return true;

    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;

    // 169.254.0.0/16 (Link-local, including Cloud metadata 169.254.169.254)
    if (a === 169 && b === 254) return true;

    // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
    if (a === 172 && b >= 16 && b <= 31) return true;

    // 192.168.0.0/16 (Private network)
    if (a === 192 && b === 168) return true;

    // 100.64.0.0/10 (Carrier-grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;

    // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (TEST-NET)
    if (a === 192 && b === 0 && c === 2) return true;
    if (a === 198 && b === 51 && c === 100) return true;
    if (a === 203 && b === 0 && c === 113) return true;

    // 224.0.0.0/4 (Multicast)
    if (a >= 224 && a <= 239) return true;

    // 240.0.0.0/4 (Reserved)
    if (a >= 240) return true;

    // 255.255.255.255 (Broadcast)
    if (a === 255 && b === 255 && c === 255 && d === 255) return true;

    return false;
  }

  // IPv6 checks
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();

    // Loopback ::1
    if (normalized === "::1" || normalized === "0000:0000:0000:0000:0000:0000:0000:0001") {
      return true;
    }

    // Unspecified ::
    if (normalized === "::") return true;

    // IPv4-mapped IPv6 (::ffff:127.0.0.1, etc.)
    if (normalized.startsWith("::ffff:") || normalized.startsWith("0:0:0:0:0:ffff:")) {
      const ipv4Part = normalized.split(":").pop();
      if (ipv4Part && net.isIPv4(ipv4Part)) {
        return isPrivateIp(ipv4Part);
      }
      return true;
    }

    // Unique Local Addresses (fc00::/7 -> fc00 to fdff)
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

    // Link-Local Addresses (fe80::/10 -> fe80 to febf)
    if (
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb")
    ) {
      return true;
    }

    // Multicast (ff00::/8)
    if (normalized.startsWith("ff")) return true;

    return false;
  }

  return true;
}

export async function validateDestinationSafe(urlStr: string): Promise<{ safe: boolean; reason?: string; url?: URL }> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlStr);
  } catch {
    return { safe: false, reason: "Invalid URL syntax" };
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return { safe: false, reason: "Only HTTP and HTTPS protocols are permitted" };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Prohibited hostnames
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan")
  ) {
    return { safe: false, reason: "Access to local and internal hostnames is prohibited" };
  }

  // If hostname is directly an IP literal
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      return { safe: false, reason: "Access to private or loopback IP addresses is prohibited" };
    }
  }

  // Resolve hostname via DNS to ensure underlying IP is safe
  try {
    const lookupResults = await dns.lookup(hostname, { all: true });
    for (const record of lookupResults) {
      if (isPrivateIp(record.address)) {
        return {
          safe: false,
          reason: `Resolved IP address ${record.address} belongs to a private/internal range`,
        };
      }
    }
  } catch (err: any) {
    return { safe: false, reason: `DNS resolution failed: ${err.message}` };
  }

  return { safe: true, url: parsedUrl };
}

export function extractMetadataFromHtml(html: string, baseUrl: URL): {
  title: string | null;
  description: string | null;
  faviconUrl: string | null;
} {
  // Title extraction: <title> or <meta property="og:title">
  let title: string | null = null;
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/i);

  if (ogTitleMatch && ogTitleMatch[1]) {
    title = ogTitleMatch[1].trim();
  }

  if (!title) {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    }
  }

  // Description extraction: <meta name="description"> or <meta property="og:description">
  let description: string | null = null;
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:description["']/i);

  if (descMatch && descMatch[1]) {
    description = descMatch[1].replace(/\s+/g, " ").trim().slice(0, 300);
  }

  // Favicon extraction
  let faviconUrl: string | null = null;
  const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]*href=["']([^"']*)["']/i) ||
    html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:shortcut icon|icon|apple-touch-icon)["']/i);

  if (iconMatch && iconMatch[1]) {
    const rawIcon = iconMatch[1].trim();
    try {
      faviconUrl = new URL(rawIcon, baseUrl.origin).toString();
    } catch {
      faviconUrl = null;
    }
  }

  // Fallback to standard /favicon.ico on the host
  if (!faviconUrl) {
    faviconUrl = `${baseUrl.origin}/favicon.ico`;
  }

  return { title, description, faviconUrl };
}

export async function fetchSafeMetadata(targetUrl: string): Promise<UrlMetadata> {
  const initialValidation = await validateDestinationSafe(targetUrl);
  if (!initialValidation.safe || !initialValidation.url) {
    throw new Error(initialValidation.reason || "Prohibited target URL");
  }

  let currentUrl = initialValidation.url;
  const maxRedirects = 3;
  let redirectsCount = 0;
  let html = "";

  while (redirectsCount <= maxRedirects) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    try {
      const response = await fetch(currentUrl.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "manual", // Handle manually to validate each redirect step against SSRF
      });

      clearTimeout(timeoutId);

      // Handle Redirects defensively
      if (response.status >= 300 && response.status < 400) {
        const locationHeader = response.headers.get("location");
        if (!locationHeader) {
          break;
        }

        const nextUrl = new URL(locationHeader, currentUrl.origin);
        const redirectValidation = await validateDestinationSafe(nextUrl.toString());
        if (!redirectValidation.safe || !redirectValidation.url) {
          throw new Error(`Unsafe redirect destination: ${redirectValidation.reason}`);
        }

        currentUrl = redirectValidation.url;
        redirectsCount++;
        continue;
      }

      if (!response.ok) {
        // Anti-bot challenge or restricted response (e.g. 403 Forbidden on LeetCode/Cloudflare)
        // Fall back gracefully to smart URL title extraction
        const fallbackTitle = generateFallbackTitleFromUrl(currentUrl.toString());
        return {
          title: fallbackTitle,
          description: null,
          hostname: currentUrl.hostname.replace(/^www\./, ""),
          faviconUrl: `${currentUrl.origin}/favicon.ico`,
        };
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
        // Non-HTML page, return basic hostname metadata
        return {
          title: generateFallbackTitleFromUrl(currentUrl.toString()),
          description: null,
          hostname: currentUrl.hostname.replace(/^www\./, ""),
          faviconUrl: `${currentUrl.origin}/favicon.ico`,
        };
      }

      // Read max 512KB to protect against huge payload DoS
      const reader = response.body?.getReader();
      if (!reader) break;

      const decoder = new TextDecoder();
      let bytesRead = 0;
      const MAX_BYTES = 512 * 1024; // 512KB

      while (bytesRead < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        bytesRead += value.length;
        html += decoder.decode(value, { stream: true });
        // Optimization: stop reading if we already found </head>
        if (html.includes("</head>")) break;
      }

      reader.cancel();
      break;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Metadata fetch timed out");
      }
      throw err;
    }
  }

  const extracted = extractMetadataFromHtml(html, currentUrl);
  // If title was missing or caught by anti-bot interstitial like "Just a moment..."
  const isAntiBotTitle =
    !extracted.title ||
    extracted.title.toLowerCase().includes("just a moment") ||
    extracted.title.toLowerCase().includes("attention required") ||
    extracted.title.toLowerCase().includes("cloudflare");

  const title = isAntiBotTitle
    ? generateFallbackTitleFromUrl(currentUrl.toString())
    : extracted.title;

  return {
    title,
    description: isAntiBotTitle ? null : extracted.description,
    hostname: currentUrl.hostname.replace(/^www\./, ""),
    faviconUrl: extracted.faviconUrl,
  };
}
