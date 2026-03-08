import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Valente Conecta",
    short_name: "Valente Conecta",
    description:
      "Super app de Valente para ofertas, classificados, serviços e indicações.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    lang: "pt-BR",
    categories: ["business", "shopping", "utilities"],
    icons: [
      {
        src: "/icon?v=2",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon?v=2",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon?v=2",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon?v=2",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}