import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BK Online — SMP Negeri 1 Genteng",
    short_name: "BK Online",
    description: "Aplikasi Bimbingan Konseling Digital & Eksplorasi Potensi Siswa SMP Negeri 1 Genteng",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#4F46E5",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  }
}
