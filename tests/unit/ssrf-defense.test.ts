import { describe, it, expect } from "vitest";
import { isPrivateIp, extractMetadataFromHtml } from "@/lib/ssrf-defense";

describe("SSRF Defense and HTML Metadata Extraction", () => {
  describe("isPrivateIp", () => {
    it("should flag IPv4 loopback and local networks as private", () => {
      expect(isPrivateIp("127.0.0.1")).toBe(true);
      expect(isPrivateIp("127.0.1.5")).toBe(true);
      expect(isPrivateIp("10.0.0.1")).toBe(true);
      expect(isPrivateIp("10.254.254.1")).toBe(true);
      expect(isPrivateIp("192.168.1.1")).toBe(true);
      expect(isPrivateIp("172.16.0.1")).toBe(true);
      expect(isPrivateIp("172.31.255.255")).toBe(true);
    });

    it("should flag cloud metadata endpoint 169.254.169.254 as private/link-local", () => {
      expect(isPrivateIp("169.254.169.254")).toBe(true);
      expect(isPrivateIp("169.254.1.1")).toBe(true);
    });

    it("should flag IPv6 loopback, link-local, and unique-local as private", () => {
      expect(isPrivateIp("::1")).toBe(true);
      expect(isPrivateIp("fe80::1")).toBe(true);
      expect(isPrivateIp("fc00::1")).toBe(true);
      expect(isPrivateIp("fd12:3456:789a:1::1")).toBe(true);
    });

    it("should allow safe public IP addresses", () => {
      expect(isPrivateIp("8.8.8.8")).toBe(false);
      expect(isPrivateIp("1.1.1.1")).toBe(false);
      expect(isPrivateIp("93.184.216.34")).toBe(false);
      expect(isPrivateIp("104.244.42.1")).toBe(false);
    });
  });

  describe("extractMetadataFromHtml", () => {
    const baseUrl = new URL("https://example.com/tutorials/react");

    it("should extract title, description and favicon from standard HTML", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>React 19 Deep Dive — Complete Guide</title>
            <meta name="description" content="A comprehensive tutorial on React 19 Server Components.">
            <link rel="icon" href="/assets/favicon.png">
          </head>
          <body>
            <h1>React 19</h1>
          </body>
        </html>
      `;

      const meta = extractMetadataFromHtml(html, baseUrl);
      expect(meta.title).toBe("React 19 Deep Dive — Complete Guide");
      expect(meta.description).toBe("A comprehensive tutorial on React 19 Server Components.");
      expect(meta.faviconUrl).toBe("https://example.com/assets/favicon.png");
    });

    it("should extract Open Graph tags when standard tags are absent", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="Open Graph Title">
            <meta property="og:description" content="Open Graph Description">
          </head>
          <body></body>
        </html>
      `;

      const meta = extractMetadataFromHtml(html, baseUrl);
      expect(meta.title).toBe("Open Graph Title");
      expect(meta.description).toBe("Open Graph Description");
      expect(meta.faviconUrl).toBe("https://example.com/favicon.ico");
    });
  });
});
