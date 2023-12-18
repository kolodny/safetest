/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/next-app',
  trailingSlash: true,
  output: 'export',
  distDir: 'build',
  ignoreBuildErrors: true,
};

module.exports = nextConfig;
