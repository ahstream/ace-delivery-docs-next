import { notFound, redirect } from "next/navigation";
import { getDocumentVersions, getLatestPublishedVersion } from "@/lib/content";

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
