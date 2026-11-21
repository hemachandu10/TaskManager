import { NextRequest, NextResponse } from "next/server";
import { fetchSafeMetadata } from "@/lib/ssrf-defense";
import { extractHostname, isValidHttpUrl, normalizeUrl, generateFallbackTitleFromUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "A valid URL string is required" }, { status: 400 });
    }

    const trimmedUrl = normalizeUrl(url);
    if (!isValidHttpUrl(trimmedUrl)) {
      return NextResponse.json(
        { error: "Invalid URL scheme. Only HTTP and HTTPS URLs are supported." },
        { status: 400 }
      );
    }

    try {
      const metadata = await fetchSafeMetadata(trimmedUrl);
      return NextResponse.json(metadata);
    } catch (fetchError: any) {
      // Safe fallback when metadata extraction fails (e.g. anti-bot blocking, network timeout, private IP)
      const hostname = extractHostname(trimmedUrl);
      let faviconUrl = null;
      try {
        const parsed = new URL(trimmedUrl);
        faviconUrl = `${parsed.origin}/favicon.ico`;
      } catch {
        // ignore
      }

      const fallbackTitle = generateFallbackTitleFromUrl(trimmedUrl);

      return NextResponse.json({
        title: fallbackTitle,
        description: null,
        hostname,
        faviconUrl,
        warning: fetchError.message || "Could not retrieve page metadata automatically. Generated title from link.",
      });
    }
  } catch (_err) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
