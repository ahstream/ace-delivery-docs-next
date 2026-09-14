"use client";

import type { DocumentVersion } from "@/lib/types";

export function VersionSelector({
  base,
  current,
  versions,
}: {
  base: string;
  current: string;
  versions: DocumentVersion[];
}) {
  return (
    <select
      aria-label="Document version"
      defaultValue={current}
      onChange={(event) => {
        window.location.href = new URL(`${base}/v${event.target.value}`, window.location.origin).toString();
      }}
    >
      {versions.map((version) => (
        <option key={version.version} value={version.version}>
          v{version.version} · {version.status}
        </option>
      ))}
    </select>
  );
}
