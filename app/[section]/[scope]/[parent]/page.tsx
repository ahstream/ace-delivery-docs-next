import Link from "next/link";
import { DocsLayout } from "@/components/docs-layout";
import { getAllVersions, getSummaries } from "@/lib/content";

export function generateStaticParams() {
  const groups = new Set(
    getAllVersions().map((item) => {
      const scope = item.scope;
      return `${item.siteSection}/${scope}/${item.parent}`;
    }),
  );

  return [...groups].map((value) => {
    const [section, scope, parent] = value.split("/");
    return { section, scope, parent };
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ section: string; scope: string; parent: string }>;
}) {
  const { section, scope, parent } = await params;
  const documents = getSummaries().filter(
    (item) =>
      item.siteSection === section &&
      item.scope === scope &&
      item.parent === parent,
  );

  return (
    <DocsLayout
      section={section as "delivery" | "developer" | "customer" | "technology"}
    >
      <div className="page-heading">
        <p className="eyebrow">{scope === "general" ? "General" : "Topics"}</p>
        <h1>{parent.replaceAll("-", " ")}</h1>
        <p className="hero-copy">Browse the documentation in this category.</p>
      </div>
      <div className="doc-grid">
        {documents.map((document) => (
          <Link
            className="doc-card"
            href={`/${section}/${scope}/${parent}/${document.slug}`}
            key={document.id}
          >
            <div className="card-top">
              <span className={`status status-${document.status}`}>
                {document.status}
              </span>
              <span>v{document.latestVersion}</span>
            </div>
            <h2>{document.pageTitle}</h2>
            <p>
              {document.pageDescription ?? "Versioned delivery documentation."}
            </p>
          </Link>
        ))}
      </div>
    </DocsLayout>
  );
}
