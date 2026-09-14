import Link from "next/link";
import { getSummaries } from "@/lib/content";
import { DocsLayout } from "@/components/docs-layout";

export default function Home() {
  const summaries = getSummaries();
  return (
    <DocsLayout>
      <div className="page-heading home-page-heading">
        <p className="eyebrow">Documentation library</p>
        <h1>ACE Delivery Documentation</h1>
        <p className="hero-copy">
          Versioned guidance for building, configuring, and operating Telia ACE.
        </p>
      </div>
      <div className="home-content">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recently published</p>
            <h2>Documents with a point of view</h2>
          </div>
          <span className="count">{summaries.length} documents</span>
        </div>
        <div className="doc-grid">
          {summaries.map((document) => (
            <Link
              className="doc-card"
              href={`/docs/${document.section ? "general" : "topics"}/${document.section ?? document.topic}/${document.slug}`}
              key={document.id}
            >
              <div className="card-top">
                <span className={`status status-${document.status}`}>
                  {document.status}
                </span>
                <span>v{document.latestVersion}</span>
              </div>
              <h3>{document.title}</h3>
              <p>
                {document.description ??
                  "Maintained guidance for building and operating our platform."}
              </p>
              <div className="tag-row">
                {document.tags.slice(0, 3).map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DocsLayout>
  );
}
