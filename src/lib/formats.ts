export type OutputFormat = "jpg" | "png" | "webp";

export const formatDisplayName = (value: OutputFormat) =>
  value === "webp" ? "WebP" : value.toUpperCase();
