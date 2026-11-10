/** @type {import('next').NextConfig} */
const nextConfig = {
  // The Vite build read VITE_* names - an existing Vercel project keeps working
  // with its old variables until they are renamed to NEXT_PUBLIC_*.
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL || "",
    NEXT_PUBLIC_APPTHETA_PUBLIC_KEY: process.env.NEXT_PUBLIC_APPTHETA_PUBLIC_KEY || process.env.VITE_APPTHETA_PUBLIC_KEY || "",
  },
};

export default nextConfig;
