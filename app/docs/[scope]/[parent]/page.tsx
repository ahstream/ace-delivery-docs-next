import Link from "next/link";
import { DocsLayout } from "@/components/docs-layout";
import { getAllVersions, getSummaries } from "@/lib/content";

export function generateStaticParams() {
  const groups = new Set(
    getAllVersions().map((item) => {
      const scope = item.section ? "general" : "topics";
      return `${scope}/${item.section ?? item.topic}`;
    }),
  );

  return [...groups].map((value) => {
    const [scope, parent] = value.split("/");
    return { scope, parent };
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ scope: string; parent: string }>;
}) {
  const { scope, parent } = await params;
  const documents = getSummaries().filter(
    (item) => (scope === "general" ? item.section : item.topic) === parent,
  );

  return (
    <DocsLayout>
      <div className="page-heading">
        <p className="eyebrow">{scope === "general" ? "General" : "Topics"}</p>
        <h1>{parent.replaceAll("-", " ")}</h1>
        <p className="hero-copy">Browse the documentation in this category.</p>
      </div>
      <div className="doc-grid">
        {documents.map((document) => (
          <Link
            className="doc-card"
            href={`/docs/${scope}/${parent}/${document.slug}`}
            key={document.id}
          >
            <div className="card-top">
              <span className={`status status-${document.status}`}>
                {document.status}
              </span>
              <span>v{document.latestVersion}</span>
            </div>
            <h2>{document.title}</h2>
            <p>{document.description ?? "Versioned delivery documentation."}</p>
          </Link>
        ))}
      </div>
    </DocsLayout>
  );
}
