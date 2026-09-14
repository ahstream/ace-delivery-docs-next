import type { NextConfig } from "next";

const siteBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? "/ace-delivery-docs-next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: siteBasePath,
  assetPrefix: siteBasePath,
  trailingSlash: true,
};

export default nextConfig;
