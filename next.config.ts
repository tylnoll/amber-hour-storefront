import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserOrOrgSite = repo.endsWith(".github.io");
const basePath = isStaticExport && process.env.GITHUB_ACTIONS && !isUserOrOrgSite ? `/${repo}` : "";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
        basePath,
        assetPrefix: basePath || undefined,
      }
    : {}),
};

export default nextConfig;
