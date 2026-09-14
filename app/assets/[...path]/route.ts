import fs from "node:fs/promises";
import path from "node:path";

const docsRoot = path.resolve(process.cwd(), "docs");
const contentTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  json: "application/json",
  excalidraw: "application/json",
  yaml: "application/yaml",
  yml: "application/yaml",
  xml: "application/xml",
  csv: "text/csv",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: assetPath } = await params;
  const filePath = path.resolve(docsRoot, ...assetPath);
  const relativePath = path.relative(docsRoot, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(filePath);
    const extension = path.extname(filePath).slice(1).toLowerCase();
    return new Response(file, {
      headers: {
        "Content-Type": contentTypes[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
