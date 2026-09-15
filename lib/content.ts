import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import semver from "semver";
import type {
  AssetMetadata,
  Breadcrumb,
  DocumentMetadata,
  DocumentStatus,
  DocumentSummary,
  DocumentVersion,
  NavigationNode,
  DocumentScope,
  SiteSection,
} from "./types";
import { DOCUMENT_STATUSES, SITE_SECTIONS } from "./types";
export { SITE_SECTIONS } from "./types";

const docsRoot = path.join(process.cwd(), "docs");
const assetExtensions = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "svg",
  "pdf",
  "docx",
  "pptx",
  "xlsx",
  "json",
  "yaml",
  "yml",
  "xml",
  "csv",
  "zip",
  "mmd",
  "puml",
  "drawio",
  "excalidraw",
]);

function parseVersion(value: unknown): string {
  let version = String(value ?? "").replace(/^v/, "");
  if (/^\d+$/.test(version)) version = `${version}.0`;
  if (!semver.valid(semver.coerce(version)))
    throw new Error(`Invalid document version: ${version}`);
  return version;
}

function compareVersions(
  left: DocumentVersion,
  right: DocumentVersion,
): number {
  return semver.rcompare(
    semver.coerce(left.version) ?? "0.0.0",
    semver.coerce(right.version) ?? "0.0.0",
  );
}

function validateMetadata(
  data: Record<string, unknown>,
  filePath: string,
): DocumentMetadata {
  const required = ["id", "title", "version", "status", "author", "owner"];
  for (const field of required)
    if (!data[field])
      throw new Error(`${filePath} is missing required metadata: ${field}`);
  const status = String(data.status) as DocumentStatus;
  if (!DOCUMENT_STATUSES.includes(status))
    throw new Error(`${filePath} has an unsupported status: ${status}`);
  return {
    id: String(data.id),
    title: String(data.title),
    navbarTitle: data.navbarTitle ? String(data.navbarTitle) : undefined,
    description: data.description ? String(data.description) : undefined,
    version: parseVersion(data.version),
    status,
    author: String(data.author),
    owner: String(data.owner),
    reviewer: data.reviewer ? String(data.reviewer) : undefined,
    approved: Boolean(data.approved),
    approvedDate: data.approvedDate ? String(data.approvedDate) : undefined,
    published: data.published ? String(data.published) : undefined,
    supersedes: data.supersedes ? parseVersion(data.supersedes) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    category: data.category ? String(data.category) : undefined,
    navbarCategory: data.navbarCategory
      ? String(data.navbarCategory)
      : undefined,
  };
}

function listFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? listFiles(fullPath)
      : entry.name.endsWith(".md")
        ? [fullPath]
        : [];
  });
}

function listAssetFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listAssetFiles(fullPath) : [fullPath];
  });
}

function discoverAssets(documentDirectory: string): AssetMetadata[] {
  const assetsDirectory = path.join(documentDirectory, "assets");
  if (!fs.existsSync(assetsDirectory)) return [];
  return listAssetFiles(assetsDirectory).flatMap((absolutePath) => {
    const name = path.basename(absolutePath);
    const extension = path.extname(name).slice(1).toLowerCase();
    if (!assetExtensions.has(extension)) return [];
    const isDiagram =
      ["mmd", "puml", "drawio", "svg"].includes(extension) ||
      name.includes("diagram");
    const type = isDiagram
      ? "diagram"
      : ["png", "jpg", "jpeg", "webp", "svg"].includes(extension)
        ? "image"
        : ["pdf", "docx", "pptx", "xlsx"].includes(extension)
          ? "document"
          : ["json", "yaml", "yml", "xml", "csv"].includes(extension)
            ? "data"
            : ["zip", "excalidraw"].includes(extension)
              ? "archive"
              : "other";
    return [
      {
        name,
        path: `/assets/${path.relative(docsRoot, absolutePath).replaceAll("\\", "/")}`,
        type,
        extension,
        isDiagram,
      },
    ];
  });
}

function parseFile(filePath: string): DocumentVersion {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const relative = path.relative(docsRoot, filePath).replaceAll("\\", "/");
  const segments = relative.split("/");
  const siteSection = segments[0] as SiteSection;
  const scope = segments[1] as DocumentScope;
  const parent = segments[2] ?? "";
  const slug = segments.at(-2) ?? "";
  if (!SITE_SECTIONS.includes(siteSection))
    throw new Error(
      `${relative} uses an unsupported site section: ${siteSection}`,
    );
  if (scope !== "general" && scope !== "topics")
    throw new Error(`${relative} uses an unsupported document scope: ${scope}`);
  const version = validateMetadata(parsed.data, relative);
  const documentDirectory = path.dirname(filePath);
  return {
    ...version,
    slug,
    siteSection,
    scope,
    parent,
    topic: scope === "topics" ? parent : undefined,
    contentPath: relative,
    sourcePath: `docs/${relative}`,
    content: parsed.content.trim(),
    readTime: Math.max(
      1,
      Math.ceil(parsed.content.trim().split(/\s+/).length / 220),
    ),
    assets: discoverAssets(documentDirectory),
  };
}

export function getAllVersions(): DocumentVersion[] {
  return listFiles(docsRoot).map(parseFile);
}

export function getDocumentVersions(
  siteSection: SiteSection,
  scope: DocumentScope,
  parent: string,
  slug: string,
): DocumentVersion[] {
  return getAllVersions()
    .filter(
      (document) =>
        document.siteSection === siteSection &&
        document.scope === scope &&
        document.parent === parent &&
        document.slug === slug,
    )
    .sort(compareVersions);
}

export function getLatestPublishedVersion(
  versions: DocumentVersion[],
): DocumentVersion {
  const published = versions.filter(
    (version) => version.status === "published",
  );
  return (published.length ? published : versions).sort(compareVersions)[0];
}

export function getVersion(
  siteSection: SiteSection,
  scope: DocumentScope,
  parent: string,
  slug: string,
  version: string,
): DocumentVersion | undefined {
  return getDocumentVersions(siteSection, scope, parent, slug).find(
    (document) => document.version === version.replace(/^v/, ""),
  );
}

export function getSummaries(): DocumentSummary[] {
  const groups = new Map<string, DocumentVersion[]>();
  for (const version of getAllVersions()) {
    const key = `${version.siteSection}/${version.scope}/${version.parent}/${version.slug}`;
    groups.set(key, [...(groups.get(key) ?? []), version]);
  }
  return [...groups.values()].map((versions) => {
    const latest = getLatestPublishedVersion(versions);
    return {
      id: latest.id,
      slug: latest.slug,
      title: latest.title,
      navbarTitle: latest.navbarTitle,
      description: latest.description,
      category: latest.category,
      navbarCategory: latest.navbarCategory,
      siteSection: latest.siteSection,
      scope: latest.scope,
      parent: latest.parent,
      latestVersion: latest.version,
      status: latest.status,
      tags: latest.tags,
    };
  });
}

export function getNavigation(siteSection: SiteSection): NavigationNode[] {
  const summaries = getSummaries().filter(
    (item) => item.siteSection === siteSection,
  );
  const makeTree = (scope: DocumentScope) => {
    const groups = new Map<string, DocumentSummary[]>();
    summaries
      .filter((item) => item.scope === scope)
      .forEach((item) => {
        const key = item.navbarCategory ?? item.parent;
        groups.set(key, [...(groups.get(key) ?? []), item]);
      });
    return [...groups.entries()].map(([group, documents]) => ({
      label: group.replaceAll("-", " "),
      kind: "group" as const,
      children: documents.map((document) => ({
        label: document.navbarTitle ?? document.title,
        kind: "document" as const,
        href: `/${siteSection}/${scope}/${document.parent}/${document.slug}`,
      })),
    }));
  };
  return [
    { label: "General", kind: "group", children: makeTree("general") },
    { label: "Topics", kind: "group", children: makeTree("topics") },
  ];
}

export function getBreadcrumbs(document: DocumentVersion): Breadcrumb[] {
  return [
    { label: document.siteSection, href: `/${document.siteSection}` },
    {
      label: document.scope === "general" ? "General" : "Topics",
      href: `/${document.siteSection}/${document.scope}`,
    },
    {
      label: document.parent.replaceAll("-", " "),
      href: `/${document.siteSection}/${document.scope}/${document.parent}`,
    },
    { label: document.title },
  ];
}

export function getGitHubUrls(document: DocumentVersion) {
  const base =
    process.env.NEXT_PUBLIC_GITHUB_REPOSITORY_URL ??
    "https://github.com/ahstream/ace-delivery-docs-next";
  const encoded = document.sourcePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return {
    edit: `${base}/edit/main/${encoded}`,
    source: `${base}/blob/main/${encoded}`,
    history: `${base}/commits/main/${encoded}`,
    pulls: `${base}/pulls?q=path%3A${encoded}`,
  };
}
