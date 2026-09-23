import type {
  NextConfig,
} from "next";

const ngrokDevOrigin =
  process.env.NGROK_DEV_ORIGIN;

const nextConfig:
  NextConfig = {
  allowedDevOrigins:
    ngrokDevOrigin
      ? [ngrokDevOrigin]
      : [],
};

export default nextConfig;