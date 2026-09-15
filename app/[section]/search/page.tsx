import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsLayout } from "@/components/docs-layout";
import { PagefindSearch } from "@/components/pagefind-search";
import { getAllVersions, SITE_SECTIONS } from "@/lib/content";
import { siteBasePath } from "@/lib/site";

export function generateStaticParams() {
  return SITE_SECTIONS.map((section) => ({ section }));
}

export default async function SectionSearchPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!SITE_SECTIONS.includes(section as (typeof SITE_SECTIONS)[number]))
    notFound();
  const documentCount = getAllVersions().filter(
    (document) => document.siteSection === section,
  ).length;

  return (
    <DocsLayout section={section as (typeof SITE_SECTIONS)[number]} hideSidebar>
      <div className="search-page">
        <p className="eyebrow">{section} search</p>
        <h1>Search {section}</h1>
        <p className="hero-copy">Search only the documents in this section.</p>
        <PagefindSearch basePath={siteBasePath} section={section} />
        <div className="search-hint">
          {documentCount} versioned pages are available in this section.
        </div>
        <p>
          <Link href={`/${section}`}>Back to {section}</Link>
        </p>
      </div>
    </DocsLayout>
  );
}
