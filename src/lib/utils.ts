import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidHttpUrl(inputUrl: string): boolean {
  try {
    const parsed = new URL(inputUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function generateFallbackTitleFromUrl(rawUrl: string): string {
  try {
    const normalized = normalizeUrl(rawUrl);
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./, "");
    const segments = parsed.pathname.split("/").filter(Boolean);

    // LeetCode problems
    if (host.includes("leetcode.com")) {
      const probIndex = segments.indexOf("problems");
      if (probIndex !== -1 && segments[probIndex + 1]) {
        const slug = segments[probIndex + 1];
        const titleCase = slug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return `${titleCase} — LeetCode`;
      }
    }

    // GitHub repositories
    if (host.includes("github.com")) {
      if (segments.length >= 2) {
        return `${segments[0]}/${segments[1]} — GitHub`;
      }
    }

    // MDN Docs
    if (host.includes("developer.mozilla.org")) {
      if (segments.length > 0) {
        const lastTwo = segments.slice(-2).join(" ");
        return `${lastTwo} — MDN Web Docs`;
      }
    }

    // YouTube
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      return "YouTube Video";
    }

    // General slug parsing from path
    if (segments.length > 0) {
      const lastSegment = decodeURIComponent(segments[segments.length - 1])
        .replace(/\.[a-z0-9]+$/i, "")
        .replace(/[-_]+/g, " ")
        .trim();
      if (lastSegment && lastSegment.length > 1) {
        const titleCase = lastSegment
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return `${titleCase} — ${host}`;
      }
    }

    return host;
  } catch {
    return rawUrl;
  }
}

export function extractHostname(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return rawUrl;
  }
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  return due.getTime() < now.getTime();
}
