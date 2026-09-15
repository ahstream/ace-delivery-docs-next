import { getAllVersions } from "@/lib/content";
import { siteBasePath } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `https://ahstream.github.io${siteBasePath}`;
  const entries = getAllVersions()
    .filter((item) => item.published)
    .sort((a, b) => String(b.published).localeCompare(String(a.published)))
    .map(
      (item) =>
        `<entry><title>${item.title} v${item.version}</title><link href="${base}/${item.siteSection}/${item.scope}/${item.parent}/${item.slug}/v${item.version}"/><updated>${item.published}</updated><id>${item.id}-${item.version}</id><summary>${item.description ?? ""}</summary></entry>`,
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Northstar Docs updates</title><link href="${base}/feed.xml"/><updated>${new Date().toISOString()}</updated>${entries}</feed>`,
    { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } },
  );
}
