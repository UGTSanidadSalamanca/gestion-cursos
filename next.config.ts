import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ['**/*'], // 忽略所有文件变化
      };
    }
    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Páginas públicas de curso: permitir embeber en iframes (Google Sites)
        source: '/p/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://sites.google.com https://*.google.com" },
        ],
      },
      {
        // Imágenes de cursos: servir sin restricciones de acceso cruzado
        source: '/Imagenes/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
          { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' },
        ],
      },
    ]
  },
};

export default withPWA(nextConfig);

