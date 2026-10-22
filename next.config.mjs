/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // RAG answers can take longer than the default 30s timeout for proxied backend requests.
    proxyTimeout: 120_000,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
