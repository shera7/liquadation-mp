import type { Metadata } from "next";
import { Archivo, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-archivo",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.metaTitle || `${settings.siteName} — Имущество и оборудование по специальным ценам`;
  const description =
    settings.metaDescription ||
    "Оборудование, материалы, запчасти и другие активы в наличии. Оставьте заявку — мы свяжемся с вами.";

  return {
    title,
    description,
    icons: settings.faviconUrl ? { icon: settings.faviconUrl } : undefined,
    openGraph: {
      title,
      description,
      images: settings.ogImageUrl ? [settings.ogImageUrl] : undefined,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="ru">
      <body className={`${archivo.variable} ${inter.variable} ${plexMono.variable} font-body antialiased`}>
        <Header siteName={settings.siteName} />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
