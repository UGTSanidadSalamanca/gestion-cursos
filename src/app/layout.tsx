import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Gestión de Cursos",
  description: "Sistema integral de gestión académica para centros educativos",
  keywords: ["Gestión de Cursos", "Educación", "Académico", "Next.js", "TypeScript"],
  authors: [{ name: "Centro Educativo" }],
  manifest: "/manifest.json",
  themeColor: "#0ea5e9",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gestión Cursos",
  },
  openGraph: {
    title: "Sistema de Gestión de Cursos",
    description: "Sistema integral de gestión académica para centros educativos",
    url: "https://gestion-cursos-ashy.vercel.app",
    siteName: "Centro Educativo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema de Gestión de Cursos",
    description: "Sistema integral de gestión académica para centros educativos",
  },
};

import { AuthProvider } from "@/components/providers/session-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
