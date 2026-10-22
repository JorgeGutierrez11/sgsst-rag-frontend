/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server for the Docker runtime image.
  output: 'standalone',
  experimental: {
    // RAG answers can take longer than the default 30s timeout for proxied backend requests.
    proxyTimeout: 120_000,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
