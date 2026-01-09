import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화 비활성화 (현재 <img> 태그 방식 유지)
  images: {
    unoptimized: true,
  },

  // React Strict Mode
  reactStrictMode: true,

  // 정적 export 설정
  output: "export",

  // 빌드 결과물에서 _next 대신 next 폴더 사용
  assetPrefix: "",

  // Trailing slash 추가 (일부 서버 호환성)
  trailingSlash: true,

  // 루트 잠금: 상위 디렉터리 lockfile로 인한 잘못된 추론 방지
  outputFileTracingRoot: join(__dirname),
};

export default nextConfig;
