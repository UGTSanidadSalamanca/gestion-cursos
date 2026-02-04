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

export const viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Formación UGT Salamanca - Gestión de Cursos",
  description: "Sistema integral de gestión de cursos para UGT Sanidad Salamanca",
  keywords: ["Gestión de Cursos", "UGT", "Salamanca", "Formación", "Sanidad"],
  authors: [{ name: "Formación UGT Salamanca" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UGT Formación",
  },
  openGraph: {
    title: "Formación UGT Salamanca",
    description: "Gestión Académica Integral",
    url: "https://gestion-cursos-ashy.vercel.app",
    siteName: "Formación UGT Salamanca",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formación UGT Salamanca",
    description: "Gestión Académica Integral",
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
