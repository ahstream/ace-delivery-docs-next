import Link from "next/link";
import { notFound } from "next/navigation";
import { getSummaries, SITE_SECTIONS } from "@/lib/content";
import { DocsLayout } from "@/components/docs-layout";

const descriptions = {
  delivery: "Operational guidance for configuring and running ACE services.",
  developer: "Integration patterns, APIs, and implementation guidance.",
  customer: "Product overviews and practical guidance for ACE customers.",
  technology: "Architecture, security, and platform engineering references.",
};
const sectionTitles = {
  delivery: "ACE Delivery Docs",
  developer: "ACE Developer Docs",
  customer: "ACE Customer Docs",
  technology: "ACE Technology Docs",
};

export function generateStaticParams() {
  return SITE_SECTIONS.map((section) => ({ section }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!SITE_SECTIONS.includes(section as (typeof SITE_SECTIONS)[number]))
    notFound();
  const documents = getSummaries().filter(
    (document) => document.siteSection === section,
  );

  return (
    <DocsLayout section={section as (typeof SITE_SECTIONS)[number]}>
      <div className="page-heading">
        <p className="eyebrow">Documentation section</p>
        <h1>{sectionTitles[section as keyof typeof sectionTitles]}</h1>
        <p className="hero-copy">
          {descriptions[section as keyof typeof descriptions]}
        </p>
      </div>
      <div className="home-content">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recently published</p>
          </div>
          <span className="count">{documents.length} documents</span>
        </div>
        <div className="section-document-list">
          {documents.map((document) => (
            <Link
              className="section-document-item"
              href={`/${section}/${document.scope}/${document.parent}/${document.slug}`}
              key={document.id}
            >
              <div className="section-document-meta">
                <span className={`status status-${document.status}`}>
                  {document.status}
                </span>
                <span>v{document.latestVersion}</span>
              </div>
              <h3 className="section-document-title">{document.pageTitle}</h3>
              <p>
                {document.pageDescription ??
                  "Maintained guidance for ACE teams."}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </DocsLayout>
  );
}
