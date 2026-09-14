import Link from "next/link";
import { DocsLayout } from "@/components/docs-layout";

export default function HelpPage() {
  return (
    <DocsLayout hideSidebar>
      <div className="page-heading">
        <p className="eyebrow">Help</p>
        <h1>Find your way around</h1>
        <p className="hero-copy">
          Browse the library by product area, search across all indexed content,
          or open a document to choose a specific version.
        </p>
      </div>
      <div className="prose">
        <h2>Search the library</h2>
        <p>
          Use the search page to find terms across document titles, metadata,
          and content.
        </p>
        <p>
          <Link href="/search">Open search</Link>
        </p>
        <h2>Read a specific version</h2>
        <p>
          Document pages link to their available versions so you can compare
          current guidance with earlier releases.
        </p>
      </div>
    </DocsLayout>
  );
}
