// next.config.mjs
var nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "replicate.delivery" }
    ]
  }
};
var next_config_default = nextConfig;
export {
  next_config_default as default
};
