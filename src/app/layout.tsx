import type { Metadata, Viewport } from "next"
import { Roboto } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"
import "./globals.css"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
})

export const metadata: Metadata = {
  title: "BK — SMP Negeri 1 Genteng",
  description: "Aplikasi Bimbingan Konseling Digital untuk Siswa SMP Negeri 1 Genteng",
  applicationName: "BK Online",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BK Online",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={roboto.variable} suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
