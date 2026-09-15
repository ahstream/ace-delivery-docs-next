"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE_SECTIONS } from "@/lib/types";

export interface AdminDocument {
  id: string;
  title: string;
  version: string;
  status: string;
  owner: string;
  author: string;
  approved?: boolean;
  approvedDate?: string;
  published?: string;
  siteSection: string;
  scope: string;
  parent: string;
  topic?: string;
  slug: string;
  sourcePath: string;
}

type SortKey =
  | "title"
  | "siteSection"
  | "version"
  | "status"
  | "owner"
  | "author"
  | "approved"
  | "approvedDate"
  | "published"
  | "age";
type SortDirection = "ascending" | "descending";

function compareVersions(left: string, right: string): number {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  return (
    (leftParts[0] ?? 0) - (rightParts[0] ?? 0) ||
    (leftParts[1] ?? 0) - (rightParts[1] ?? 0)
  );
}

function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toISOString().slice(0, 10);
}

function getAgeDays(value?: string): number | undefined {
  if (!value) return undefined;
  const published = new Date(value);
  if (Number.isNaN(published.getTime())) return undefined;
  const publishedDay = Date.UTC(
    published.getUTCFullYear(),
    published.getUTCMonth(),
    published.getUTCDate(),
  );
  const now = new Date();
  const currentDay = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return Math.max(0, Math.floor((currentDay - publishedDay) / 86400000));
}

function compareDocuments(
  left: AdminDocument,
  right: AdminDocument,
  sortKey: SortKey,
): number {
  if (sortKey === "version")
    return compareVersions(left.version, right.version);
  if (sortKey === "approved")
    return Number(Boolean(left.approved)) - Number(Boolean(right.approved));
  if (sortKey === "age")
    return (
      (getAgeDays(left.published) ?? Number.POSITIVE_INFINITY) -
      (getAgeDays(right.published) ?? Number.POSITIVE_INFINITY)
    );

  const leftValue = left[sortKey] ?? "";
  const rightValue = right[sortKey] ?? "";
  return String(leftValue).localeCompare(String(rightValue));
}

export function AdminDocumentTable({
  documents,
}: {
  documents: AdminDocument[];
}) {
  const [latestOnly, setLatestOnly] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | undefined>();
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("ascending");
  const latestById = new Map<string, AdminDocument>();

  for (const document of documents) {
    const current = latestById.get(document.id);
    if (!current || compareVersions(document.version, current.version) > 0)
      latestById.set(document.id, document);
  }

  const sectionDocuments = selectedSection
    ? documents.filter((document) => document.siteSection === selectedSection)
    : documents;
  const filteredDocuments = latestOnly
    ? sectionDocuments.filter(
        (document) => latestById.get(document.id) === document,
      )
    : sectionDocuments;
  const visibleDocuments = [...filteredDocuments].sort((left, right) => {
    const comparison = compareDocuments(left, right, sortKey);
    return sortDirection === "ascending" ? comparison : -comparison;
  });

  function toggleSort(nextSortKey: SortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((current) =>
        current === "ascending" ? "descending" : "ascending",
      );
      return;
    }
    setSortKey(nextSortKey);
    setSortDirection("ascending");
  }

  function renderHeader(label: string, nextSortKey: SortKey) {
    const isActive = sortKey === nextSortKey;
    return (
      <th aria-sort={isActive ? sortDirection : "none"} scope="col">
        <button
          aria-label={`Sort by ${label}`}
          className="admin-sort-button"
          onClick={() => toggleSort(nextSortKey)}
          type="button"
        >
          {label}
          <span aria-hidden="true">
            {isActive ? (sortDirection === "ascending" ? "↑" : "↓") : "↕"}
          </span>
        </button>
      </th>
    );
  }

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-section-filters" aria-label="Filter by section">
          <button
            className={`admin-filter-button${selectedSection === undefined ? " active" : ""}`}
            onClick={() => setSelectedSection(undefined)}
            type="button"
          >
            All sections
          </button>
          {SITE_SECTIONS.map((section) => (
            <button
              className={`admin-filter-button${selectedSection === section ? " active" : ""}`}
              key={section}
              onClick={() => setSelectedSection(section)}
              type="button"
            >
              {section}
            </button>
          ))}
        </div>
        <label className="admin-checkbox">
          <input
            checked={latestOnly}
            onChange={(event) => setLatestOnly(event.target.checked)}
            type="checkbox"
          />
          Latest version only
        </label>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <caption>{visibleDocuments.length} document versions</caption>
          <thead>
            <tr>
              {renderHeader("Document", "title")}
              {renderHeader("Section", "siteSection")}
              {renderHeader("Version", "version")}
              {renderHeader("Status", "status")}
              {renderHeader("Owner", "owner")}
              {renderHeader("Author", "author")}
              {renderHeader("Approved", "approved")}
              {renderHeader("Approved date", "approvedDate")}
              {renderHeader("Published", "published")}
              {renderHeader("Age", "age")}
            </tr>
          </thead>
          <tbody>
            {visibleDocuments.map((document) => {
              const href = `/${document.siteSection}/${document.scope}/${document.parent}/${document.slug}/v${document.version}`;

              return (
                <tr key={document.sourcePath}>
                  <th scope="row">
                    <Link href={href}>{document.title}</Link>
                  </th>
                  <td>{document.siteSection}</td>
                  <td>v{document.version}</td>
                  <td>
                    <span className={`status status-${document.status}`}>
                      {document.status}
                    </span>
                  </td>
                  <td>{document.owner}</td>
                  <td>{document.author}</td>
                  <td>{document.approved ? "Yes" : "No"}</td>
                  <td>{formatDate(document.approvedDate)}</td>
                  <td>{formatDate(document.published)}</td>
                  <td>
                    {getAgeDays(document.published) === undefined
                      ? "-"
                      : `${getAgeDays(document.published)} days`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
