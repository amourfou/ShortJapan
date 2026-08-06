import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // Enable in dev with ENABLE_PWA_DEV=1 to test push locally (prod build recommended)
  disable:
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_PWA_DEV !== "1",
  register: true,
  customWorkerSrc: "worker",
  fallbacks: {
    document: "/offline",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(nextConfig);
