"use client";

import type { DocumentVersion } from "@/lib/types";
import { withBasePath } from "@/lib/site";

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
        window.location.href = withBasePath(`${base}/v${event.target.value}`);
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
