import type { MetadataRoute } from "next";
import { getAllVersions } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://docs.example.com";
  return getAllVersions().map((item) => ({
    url: `${base}/docs/${item.section ? "general" : "topics"}/${item.section ?? item.topic}/${item.slug}/v${item.version}`,
    lastModified: item.published ? new Date(item.published) : undefined,
    changeFrequency: "monthly",
    priority: item.status === "published" ? 0.8 : 0.4,
  }));
}
