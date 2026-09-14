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
} from "./types";
import { DOCUMENT_STATUSES } from "./types";

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

function discoverAssets(documentDirectory: string): AssetMetadata[] {
  const assetsDirectory = path.join(documentDirectory, "assets");
  if (!fs.existsSync(assetsDirectory)) return [];
  return fs
    .readdirSync(assetsDirectory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(assetsDirectory, entry.name);
      if (entry.isDirectory()) return [];
      const extension = path.extname(entry.name).slice(1).toLowerCase();
      if (!assetExtensions.has(extension)) return [];
      const isDiagram =
        ["mmd", "puml", "drawio", "svg"].includes(extension) ||
        entry.name.includes("diagram");
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
          name: entry.name,
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
  const scope = segments[0];
  const parent = segments.slice(1, -1);
  const slug = parent.at(-1) ?? "";
  const version = validateMetadata(parsed.data, relative);
  const documentDirectory = path.dirname(filePath);
  return {
    ...version,
    slug,
    section: scope === "general" ? parent[0] : undefined,
    topic: scope === "topics" ? parent[0] : undefined,
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
  scope: "general" | "topics",
  parent: string,
  slug: string,
): DocumentVersion[] {
  return getAllVersions()
    .filter(
      (document) =>
        (scope === "general"
          ? document.section === parent
          : document.topic === parent) && document.slug === slug,
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
  scope: "general" | "topics",
  parent: string,
  slug: string,
  version: string,
): DocumentVersion | undefined {
  return getDocumentVersions(scope, parent, slug).find(
    (document) => document.version === version.replace(/^v/, ""),
  );
}

export function getSummaries(): DocumentSummary[] {
  const groups = new Map<string, DocumentVersion[]>();
  for (const version of getAllVersions()) {
    const key = `${version.section ?? version.topic}/${version.slug}`;
    groups.set(key, [...(groups.get(key) ?? []), version]);
  }
  return [...groups.values()].map((versions) => {
    const latest = getLatestPublishedVersion(versions);
    return {
      id: latest.id,
      slug: latest.slug,
      title: latest.title,
      description: latest.description,
      category: latest.category,
      topic: latest.topic,
      section: latest.section,
      latestVersion: latest.version,
      status: latest.status,
      tags: latest.tags,
    };
  });
}

export function getNavigation(): NavigationNode[] {
  const summaries = getSummaries();
  const makeTree = (scope: "general" | "topics") => {
    const groups = new Map<string, DocumentSummary[]>();
    summaries
      .filter((item) => (scope === "general" ? item.section : item.topic))
      .forEach((item) => {
        const key = item.section ?? item.topic ?? "";
        groups.set(key, [...(groups.get(key) ?? []), item]);
      });
    return [...groups.entries()].map(([group, documents]) => ({
      label: group.replaceAll("-", " "),
      kind: "group" as const,
      children: documents.map((document) => ({
        label: document.title,
        kind: "document" as const,
        href: `/docs/${scope}/${group}/${document.slug}`,
      })),
    }));
  };
  return [
    { label: "General", kind: "group", children: makeTree("general") },
    { label: "Topics", kind: "group", children: makeTree("topics") },
  ];
}

export function getBreadcrumbs(document: DocumentVersion): Breadcrumb[] {
  const scope = document.section ? "general" : "topics";
  const parent = document.section ?? document.topic ?? "";
  return [
    { label: scope === "general" ? "General" : "Topics", href: "/" },
    {
      label: parent.replaceAll("-", " "),
      href: `/docs/${scope}/${parent}`,
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
