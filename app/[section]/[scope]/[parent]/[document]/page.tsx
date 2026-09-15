import { notFound, redirect } from "next/navigation";
import {
  getAllVersions,
  getDocumentVersions,
  getLatestPublishedVersion,
} from "@/lib/content";

export function generateStaticParams() {
  const documents = new Map<
    string,
    {
      section: string;
      scope: string;
      parent: string;
      document: string;
    }
  >();

  for (const item of getAllVersions()) {
    const scope = item.scope;
    const parent = item.parent;
    const key = `${item.siteSection}/${scope}/${parent}/${item.slug}`;
    documents.set(key, {
      section: item.siteSection,
      scope,
      parent,
      document: item.slug,
    });
  }

  return [...documents.values()];
}

export default async function DocumentRedirect({
  params,
}: {
  params: Promise<{
    section: string;
    scope: string;
    parent: string;
    document: string;
  }>;
}) {
  const { section, scope, parent, document } = await params;
  if (scope !== "general" && scope !== "topics") notFound();
  const versions = getDocumentVersions(
    section as "delivery" | "developer" | "customer" | "technology",
    scope as "general" | "topics",
    parent,
    document,
  );
  if (!versions.length) notFound();
  redirect(
    `/${section}/${scope}/${parent}/${document}/v${getLatestPublishedVersion(versions).version}`,
  );
}
