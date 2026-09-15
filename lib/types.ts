export const DOCUMENT_STATUSES = [
  "draft",
  "review",
  "published",
  "deprecated",
  "archived",
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
export type SiteSection = "delivery" | "developer" | "customer" | "technology";
export type DocumentScope = "general" | "topics";
export const SITE_SECTIONS: SiteSection[] = [
  "delivery",
  "developer",
  "customer",
  "technology",
];

export interface DocumentMetadata {
  id: string;
  pageTitle: string;
  pageDescription?: string;
  navbarTitle?: string;
  version: string;
  status: DocumentStatus;
  author: string;
  owner: string;
  approvedDate?: string;
  publishedDate?: string;
  updatedDate?: string;
  supersedes?: string;
  tags: string[];
  navbarParent?: string;
}

export interface AssetMetadata {
  name: string;
  path: string;
  type: "image" | "document" | "data" | "archive" | "diagram" | "other";
  extension: string;
  isDiagram: boolean;
}

export interface DiagramMetadata {
  source: string;
  rendered?: string;
  type: "mermaid" | "plantuml" | "drawio";
}

export interface DocumentVersion extends DocumentMetadata {
  siteSection: SiteSection;
  scope: DocumentScope;
  parent: string;
  slug: string;
  topic?: string;
  contentPath: string;
  sourcePath: string;
  content: string;
  readTime: number;
  assets: AssetMetadata[];
}

export interface DocumentContent {
  metadata: DocumentMetadata;
  html: string;
  version: DocumentVersion;
}

export interface DocumentSummary {
  id: string;
  slug: string;
  pageTitle: string;
  pageDescription?: string;
  navbarTitle?: string;
  navbarParent?: string;
  topic?: string;
  siteSection: SiteSection;
  scope: DocumentScope;
  parent: string;
  latestVersion: string;
  status: DocumentStatus;
  tags: string[];
}

export interface NavigationNode {
  label: string;
  href?: string;
  kind: "group" | "document";
  children?: NavigationNode[];
}

export interface SearchDocument {
  url: string;
  title: string;
  version: string;
  topic?: string;
  status: DocumentStatus;
  tags: string[];
  content: string;
}

export interface SearchResult extends SearchDocument {
  excerpt: string;
  score?: number;
}

export interface Breadcrumb {
  label: string;
  href?: string;
}
