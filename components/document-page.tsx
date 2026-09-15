import Link from "next/link";
import { getBreadcrumbs, getGitHubUrls } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import type { DocumentVersion } from "@/lib/types";
import { MarkdownContent } from "./markdown-content";
import { VersionSelector } from "./version-selector";
import { DocsLayout } from "./docs-layout";
import { siteBasePath, withBasePath } from "@/lib/site";

function formatApprovalDate(value?: string): string {
  if (!value) return "";
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  );
  if (Number.isNaN(date.getTime())) return value;
  return date.toDateString();
}

export async function DocumentPage({
  document,
  versions,
}: {
  document: DocumentVersion;
  versions: DocumentVersion[];
}) {
  const assetBase = `${siteBasePath}/assets/${document.siteSection}/${document.scope}/${document.parent}/${document.slug}`;
  const html = await renderMarkdown(document.content, assetBase);
  const currentIndex = versions.findIndex(
    (version) => version.version === document.version,
  );
  const newer = versions[currentIndex - 1];
  const older = versions[currentIndex + 1];
  const base = `/${document.siteSection}/${document.scope}/${document.parent}/${document.slug}`;
  const github = getGitHubUrls(document);
  return (
    <DocsLayout section={document.siteSection}>
      <div className="breadcrumbs">
        {getBreadcrumbs(document).map((crumb, index) => (
          <span key={crumb.label}>
            {index > 0 && " / "}
            {crumb.href ? (
              <Link href={crumb.href}>{crumb.label}</Link>
            ) : (
              crumb.label
            )}
          </span>
        ))}
      </div>
      <div className="doc-layout">
        <aside className="doc-aside">
          <p className="eyebrow">Document versions</p>
          <VersionSelector
            base={base}
            current={document.version}
            versions={versions}
          />
          <div className="aside-links">
            {older && (
              <Link href={`${base}/v${older.version}`}>
                ← v{older.version} older
              </Link>
            )}
            {newer && (
              <Link href={`${base}/v${newer.version}`}>
                v{newer.version} newer →
              </Link>
            )}
          </div>
          <div className="github-links">
            <a href={github.edit}>Edit in GitHub ↗</a>
            <a href={github.history}>View history ↗</a>
            <a href={github.pulls}>Related pull requests ↗</a>
          </div>
        </aside>
        <article className="document">
          <div className="document-kicker">
            <span className={`status status-${document.status}`}>
              {document.status}
            </span>
            <span>v{document.version}</span>
            <span>{document.readTime} min read</span>
          </div>
          <h1>{document.pageTitle}</h1>
          {document.pageDescription && (
            <p className="lede">{document.pageDescription}</p>
          )}
          <div className="meta-grid">
            <div>
              <span>OWNER</span>
              <strong>{document.owner}</strong>
            </div>
            <div>
              <span>AUTHOR</span>
              <strong>{document.author}</strong>
            </div>
            <div>
              <span>APPROVAL</span>
              <strong>
                {document.approvedDate
                  ? `Approved ${formatApprovalDate(document.approvedDate)}`
                  : "Pending review"}
              </strong>
            </div>
            <div>
              <span>UPDATED</span>
              <strong>{formatApprovalDate(document.updatedDate)}</strong>
            </div>
          </div>
          <div className="tag-row large">
            {document.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
          <MarkdownContent html={html} />
          {document.assets.length > 0 && (
            <section className="attachments">
              <p className="eyebrow">Attachments</p>
              {document.assets.map((asset) => (
                <a href={withBasePath(asset.path)} key={asset.path}>
                  {asset.name} <span>{asset.type}</span>
                </a>
              ))}
            </section>
          )}
        </article>
      </div>
    </DocsLayout>
  );
}
