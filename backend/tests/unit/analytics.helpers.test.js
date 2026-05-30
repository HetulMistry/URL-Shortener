import { describe, it, expect } from "vitest";
import {
  parseBrowserFromUserAgent,
  extractReferrerDomain,
  formatBrowserStats,
  formatTopReferrers,
} from "../../utils/analytics.helpers.js";

describe("analytics helpers", () => {
  it("parses common browsers from user agent", () => {
    expect(parseBrowserFromUserAgent("Mozilla/5.0 Edg/120.0")).toBe("Edge");
    expect(parseBrowserFromUserAgent("Mozilla/5.0 OPR/120.0")).toBe("Opera");
    expect(
      parseBrowserFromUserAgent("Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36"),
    ).toBe("Chrome");
    expect(parseBrowserFromUserAgent("Mozilla/5.0 Firefox/120.0")).toBe(
      "Firefox",
    );
    expect(parseBrowserFromUserAgent(null)).toBe("Other");
  });

  it("extracts referrer domain", () => {
    expect(extractReferrerDomain("https://www.google.com/search?q=test")).toBe(
      "google.com",
    );
    expect(extractReferrerDomain("invalid")).toBeNull();
    expect(extractReferrerDomain(null)).toBeNull();
  });

  it("formats browser stats object", () => {
    expect(
      formatBrowserStats([
        { browser: "Chrome", clicks: 10 },
        { browser: "Firefox", clicks: 5 },
      ]),
    ).toEqual({ Chrome: 10, Firefox: 5 });
  });

  it("formats top referrers list", () => {
    expect(
      formatTopReferrers([
        { referrer: "google.com", clicks: 12 },
        { referrer: "github.com", clicks: 3 },
      ]),
    ).toEqual([
      { referrer: "google.com", clicks: 12 },
      { referrer: "github.com", clicks: 3 },
    ]);
  });
});
