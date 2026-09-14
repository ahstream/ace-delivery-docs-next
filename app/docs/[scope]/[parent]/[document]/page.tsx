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
      scope: string;
      parent: string;
      document: string;
    }
  >();

  for (const item of getAllVersions()) {
    const scope = item.section ? "general" : "topics";
    const parent = item.section ?? item.topic ?? "";
    const key = `${scope}/${parent}/${item.slug}`;
    documents.set(key, { scope, parent, document: item.slug });
  }

  return [...documents.values()];
}

export default async function DocumentRedirect({
  params,
}: {
  params: Promise<{ scope: string; parent: string; document: string }>;
}) {
  const { scope, parent, document } = await params;
  if (scope !== "general" && scope !== "topics") notFound();
  const versions = getDocumentVersions(scope, parent, document);
  if (!versions.length) notFound();
  redirect(
    `/docs/${scope}/${parent}/${document}/v${getLatestPublishedVersion(versions).version}`,
  );
}
