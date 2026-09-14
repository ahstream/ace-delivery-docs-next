import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentPage } from "@/components/document-page";
import { getAllVersions, getDocumentVersions, getVersion } from "@/lib/content";

export function generateStaticParams() {
  return getAllVersions().map((item) => ({
    scope: item.section ? "general" : "topics",
    parent: item.section ?? item.topic,
    document: item.slug,
    version: `v${item.version}`,
  }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    scope: string;
    parent: string;
    document: string;
    version: string;
  }>;
}): Promise<Metadata> {
  const { scope, parent, document, version } = await params;
  const item = getVersion(
    scope as "general" | "topics",
    parent,
    document,
    version,
  );
  return item
    ? {
        title: `${item.title} v${item.version}`,
        description: item.description,
        alternates: {
          canonical: `/docs/${scope}/${parent}/${document}/v${item.version}`,
        },
        openGraph: { title: item.title, description: item.description },
      }
    : {};
}
export default async function VersionPage({
  params,
}: {
  params: Promise<{
    scope: string;
    parent: string;
    document: string;
    version: string;
  }>;
}) {
  const { scope, parent, document, version } = await params;
  const versions = getDocumentVersions(
    scope as "general" | "topics",
    parent,
    document,
  );
  const current = getVersion(
    scope as "general" | "topics",
    parent,
    document,
    version,
  );
  if (!current || !versions.length) notFound();
  return <DocumentPage document={current} versions={versions} />;
}
