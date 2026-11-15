/**
 * Centralised SEO configuration and JSON-LD structured-data builders.
 *
 * All canonical URLs point at the production domain heicconvert.cc. If the
 * site is ever served from a different host, change SITE_URL here and every
 * canonical / sitemap / structured-data URL follows automatically.
 */
import type { FaqItem } from "../components/FaqList";

export const SITE_URL = "https://heicconvert.cc";
export const SITE_NAME = "heicconvert";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/heicconvert_demo.gif`;

/** Resolve a route path (e.g. "/heic-to-png") to an absolute canonical URL. */
export const absoluteUrl = (path: string) =>
  path === "/"
    ? `${SITE_URL}/`
    : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

type JsonLd = Record<string, unknown>;

/** Wrap one or more nodes in a schema.org @graph. */
export const graph = (...nodes: JsonLd[]): JsonLd => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});

/** WebApplication node — the core structured data for each converter page. */
export const webApplication = ({
  name,
  description,
  url,
  featureList,
}: {
  name: string;
  description: string;
  url: string;
  featureList: string[];
}): JsonLd => ({
  "@type": "WebApplication",
  name,
  url,
  description,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any (modern web browser)",
  browserRequirements: "Requires JavaScript. Works in current Chrome, Edge, Firefox, and Safari.",
  inLanguage: "en",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList,
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  },
});

/** FAQPage node — turns the on-page FAQ into eligible rich-result structured data. */
export const faqPage = (items: FaqItem[]): JsonLd => ({
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

/** BreadcrumbList node — [Home] for tool pages, [Home > …] for guides. */
export const breadcrumbs = (
  trail: { name: string; path: string }[],
): JsonLd => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});

/** Article node for the editorial how-to / comparison pages. */
export const article = ({
  headline,
  description,
  url,
  datePublished = "2026-11-08",
  dateModified = "2026-11-15",
}: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}): JsonLd => ({
  "@type": "Article",
  headline,
  description,
  mainEntityOfPage: { "@type": "WebPage", "@id": url },
  url,
  inLanguage: "en",
  datePublished,
  dateModified,
  author: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  },
});
