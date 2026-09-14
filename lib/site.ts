export const siteBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? "/ace-delivery-docs-next";

export function withBasePath(path: string) {
  if (!path.startsWith("/") || path.startsWith(siteBasePath)) return path;
  return `${siteBasePath}${path}`;
}
