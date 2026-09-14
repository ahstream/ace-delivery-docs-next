import type { NextConfig } from "next";

const siteBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.NODE_ENV === "production" ? "/ace-delivery-docs-next" : "");

const nextConfig: NextConfig = {
  output: "export",
  basePath: siteBasePath,
  assetPrefix: siteBasePath,
  trailingSlash: true,
};

export default nextConfig;
