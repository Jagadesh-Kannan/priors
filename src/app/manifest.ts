import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Priors",
    short_name: "Priors",
    description: "Track household essentials and real prices at Costco and Lowe's.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1f6f50",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
