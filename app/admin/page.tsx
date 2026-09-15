import {
  AdminDocumentTable,
  type AdminDocument,
} from "@/components/admin-document-table";
import { DocsLayout } from "@/components/docs-layout";
import { getAllVersions } from "@/lib/content";

export default function AdminPage() {
  const documents: AdminDocument[] = getAllVersions()
    .sort(
      (left, right) =>
        left.pageTitle.localeCompare(right.pageTitle) ||
        right.version.localeCompare(left.version),
    )
    .map(
      ({
        id,
        pageTitle,
        version,
        status,
        owner,
        author,
        approvedDate,
        publishedDate,
        updatedDate,
        siteSection,
        scope,
        parent,
        topic,
        slug,
        sourcePath,
      }) => ({
        id,
        pageTitle,
        version,
        status,
        owner,
        author,
        approvedDate,
        publishedDate,
        updatedDate,
        siteSection,
        scope,
        parent,
        topic,
        slug,
        sourcePath,
      }),
    );

  return (
    <DocsLayout section="admin">
      <div className="page-heading">
        <p className="eyebrow">Administration</p>
        <h1>Document inventory</h1>
        <p className="hero-copy">
          Metadata for every versioned document in the delivery docs library.
        </p>
      </div>
      <AdminDocumentTable documents={documents} />
    </DocsLayout>
  );
}
