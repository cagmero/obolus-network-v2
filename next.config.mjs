/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'github.githubassets.com',
      },
      {
        protocol: 'https',
        hostname: 'www.adobe.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org'
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      path: false,
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    }
    // Externalize server-only modules in API routes
    if (isServer) {
      config.externals = [...(config.externals || []), 'eciesjs']
    }
    return config
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://209.38.22.81:3001/api/v1/:path*',
      },
    ]
  },
}

export default nextConfig

