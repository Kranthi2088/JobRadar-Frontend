const path = require("path");
const { loadEnvConfig } = require("@next/env");

const monorepoRoot = path.join(__dirname, "../..");
// Align with npm `db:*` scripts: Docker URLs from `docker/compose.override.env`, then `.env`.
require("dotenv").config({
  path: path.join(monorepoRoot, "docker/compose.override.env"),
});
require("dotenv").config({ path: path.join(monorepoRoot, ".env") });
loadEnvConfig(monorepoRoot);
loadEnvConfig(__dirname);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  transpilePackages: ["@jobradar/db", "@jobradar/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "logo.clearbit.com" },
    ],
  },
};

module.exports = nextConfig;
