import fs from "node:fs";
import path from "node:path";

const docsRoot = path.join(process.cwd(), "docs");
const required = ["id", "title", "version", "status", "author", "owner"];
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
  for (const field of required)
    if (!metadata[field])
      throw new Error(`${filePath} is missing required metadata: ${field}`);
  if (!statuses.has(metadata.status))
    throw new Error(`${filePath} has unsupported status: ${metadata.status}`);
  const key = `${metadata.id}:${metadata.version}`;
  if (keys.has(key)) throw new Error(`Duplicate document version: ${key}`);
  keys.add(key);
}
console.log(`Validated ${markdownFiles.length} document versions.`);
