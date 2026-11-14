import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ClimateStories — Citizen Journalism Platform",
    short_name: "ClimateStories",
    description: "Platform jurnalisme warga dan berita sosial independen",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#059669",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  }
}
