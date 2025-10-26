import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { LanguageProvider } from "@/lib/i18n";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AgriSence - Stok Yönetim Sistemi",
  description: "Gübre fabrikası için CRM ve stok yönetim sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <LanguageProvider>
          <div className="flex min-h-screen bg-[var(--background)]">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 overflow-auto pt-16 lg:pt-8">
              {children}
            </main>
          </div>
          <Toaster 
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--card-background)',
                color: 'var(--primary-text)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </LanguageProvider>
      </body>
    </html>
  );
}
