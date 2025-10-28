/** @type {import('next').NextConfig} */

import envsConfig from './envs.js';

const envs = envsConfig[process.env.MODE];
if (envs) {
  console.log(`MODE: ${process.env.MODE}`);
  Object.keys(envs).forEach((key) => {
    process.env[key] = envs[key];
  });
  console.log(`Website Url: ${process.env.NEXT_PUBLIC_FE_URL}`);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removed to allow dynamic routing
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;