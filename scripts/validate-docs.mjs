import fs from "node:fs";
import path from "node:path";

const docsRoot = path.join(process.cwd(), "docs");
const required = ["pageTitle", "status", "author", "owner"];
const removed = ["approved", "published"];
const statuses = new Set([
  "draft",
  "review",
  "published",
  "deprecated",
  "archived",
]);
const markdownFiles = [];
function visit(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(fullPath);
    else if (entry.name.endsWith(".md")) markdownFiles.push(fullPath);
  }
}
function frontmatter(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) throw new Error(`${filePath} is missing frontmatter`);
  return Object.fromEntries(
    block[1]
      .split("\n")
      .filter((line) => line.includes(":"))
      .map((line) => {
        const [key, ...rest] = line.split(":");
        return [key.trim(), rest.join(":").trim()];
      }),
  );
}
visit(docsRoot);
const keys = new Set();
for (const filePath of markdownFiles) {
  const metadata = frontmatter(filePath);
  const filename = path.basename(filePath, ".md");
  const versionMatch = filename.match(/^v(.+)$/i);
  if (!versionMatch)
    throw new Error(`${filePath} must use a version filename such as v33.1.md`);
  const version = versionMatch[1].replace(/^v/i, "");
  if (!/^\d+(?:\.\d+){0,2}(?:-[0-9A-Za-z.-]+)?$/.test(version))
    throw new Error(
      `${filePath} has an invalid version filename: ${filename}.md`,
    );
  for (const field of required)
    if (!metadata[field])
      throw new Error(`${filePath} is missing required metadata: ${field}`);
  for (const field of removed)
    if (Object.hasOwn(metadata, field))
      throw new Error(`${filePath} uses removed metadata: ${field}`);
  if (!statuses.has(metadata.status))
    throw new Error(`${filePath} has unsupported status: ${metadata.status}`);
  const relative = path.relative(docsRoot, filePath).replaceAll("\\", "/");
  const pathParts = relative.split("/");
  const id = pathParts.slice(0, -1).join("/");
  const key = `${id}:${version}`;
  if (keys.has(key)) throw new Error(`Duplicate document version: ${key}`);
  keys.add(key);
}
console.log(`Validated ${markdownFiles.length} document versions.`);
