import type { MetadataRoute } from "next";
import { getAllVersions } from "@/lib/content";
import { siteBasePath } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `https://ahstream.github.io${siteBasePath}`;
  return getAllVersions().map((item) => ({
    url: `${base}/${item.siteSection}/${item.scope}/${item.parent}/${item.slug}/v${item.version}`,
    lastModified: item.published ? new Date(item.published) : undefined,
    changeFrequency: "monthly",
    priority: item.status === "published" ? 0.8 : 0.4,
  }));
}
