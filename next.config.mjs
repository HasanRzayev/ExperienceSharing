/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  env: {
    REACT_APP_API_BASE_URL:
      process.env.REACT_APP_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
    REACT_APP_SIGNALR_HUB_URL:
      process.env.REACT_APP_SIGNALR_HUB_URL ?? process.env.NEXT_PUBLIC_SIGNALR_HUB_URL ?? "",
    REACT_APP_CLOUDINARY_ENDPOINT:
      process.env.REACT_APP_CLOUDINARY_ENDPOINT ?? process.env.NEXT_PUBLIC_CLOUDINARY_ENDPOINT ?? "",
    REACT_APP_GOOGLE_CLIENT_ID:
      process.env.REACT_APP_GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
    REACT_APP_GEMINI_API_KEY:
      process.env.REACT_APP_GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "",
    REACT_APP_GIPHY_API_URL:
      process.env.REACT_APP_GIPHY_API_URL ?? process.env.NEXT_PUBLIC_GIPHY_API_URL ?? "",
  },
};

export default nextConfig;
