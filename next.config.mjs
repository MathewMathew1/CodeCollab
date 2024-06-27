import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory name (__dirname equivalent for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



/** @type {import("next").NextConfig} */
const config = {
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  reactStrictMode: false,
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  webpack: (config) => {
    config.resolve.alias['~'] = path.resolve(__dirname, 'src/dist');
    return config;
  }
};

export default config;
