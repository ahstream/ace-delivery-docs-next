import type { NextConfig } from "next";
import { siteBasePath } from "./lib/site";

const nextConfig: NextConfig = {
  output: "export",
  basePath: siteBasePath,
  trailingSlash: true,
};

export default nextConfig;
