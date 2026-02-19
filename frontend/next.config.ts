import type { NextConfig } from "next";
import { codeInspectorPlugin } from "code-inspector-plugin";

const isDevelopment = true;
const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  turbopack: {
    rules: {
      // ...(isDevelopment
      //   ? codeInspectorPlugin({
      //       bundler: "turbopack",
      //     })
      //   : {}),
    },
  },
};

export default nextConfig;
