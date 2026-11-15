import { useEffect } from "react";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
} from "../lib/seo";

interface SeoProps {
  title: string;
  description: string;
  /** Route path used for the canonical URL and og:url. Defaults to "/". */
  path?: string;
  /** Absolute or root-relative social preview image. */
  image?: string;
  /** Open Graph type. Defaults to "website"; editorial pages use "article". */
  type?: "website" | "article";
  /** Structured data object (schema.org JSON-LD) injected into <head>. */
  jsonLd?: Record<string, unknown>;
}

const JSONLD_ID = "heicconvert-jsonld";

/** Create-or-update a <meta> tag selected by `name` or `property`. */
function setMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const url = absoluteUrl(path);

    document.title = title;

    // Core meta
    setMeta("name", "description", description);
    setMeta("name", "robots", "index, follow, max-image-preview:large");
    setMeta("name", "googlebot", "index, follow");
    setMeta("name", "author", SITE_NAME);

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "en_US");

    // Twitter / X Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);

    // Canonical link
    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // JSON-LD structured data (single managed script, replaced on each route)
    let script = document.getElementById(JSONLD_ID) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.id = JSONLD_ID;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, path, image, type, jsonLd]);

  return null;
}
