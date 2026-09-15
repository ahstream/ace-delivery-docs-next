import Link from "next/link";
import { DocsLayout } from "@/components/docs-layout";

export default function AdminHelpPage() {
  return (
    <DocsLayout section="admin">
      <div className="page-heading">
        <p className="eyebrow">Administration help</p>
        <h1>Manage the documentation library</h1>
        <p className="hero-copy">
          Guidance for maintaining document metadata and releases.
        </p>
      </div>
      <div className="prose">
        <h2>Review documents</h2>
        <p>
          Use the inventory to inspect ownership, approval state, publication
          dates, and source paths.
        </p>
        <p>
          <Link href="/admin">Open document inventory</Link>
        </p>
        <h2>Publish changes</h2>
        <p>
          Update Markdown frontmatter in the repository, validate the documents,
          and publish through the normal build workflow.
        </p>
      </div>
    </DocsLayout>
  );
}
