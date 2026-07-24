import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import { AppProvider } from "@/providers/app-provider";
import { RestaurantService } from "@/services";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const restaurant =
      (await RestaurantService.getRestaurant("smart-tech-food-hub")) ||
      (await RestaurantService.getRestaurant("le-gourmet-bistro"));

    const title =
      restaurant?.metaTitle ||
      (restaurant?.name
        ? `${restaurant.name} — ${restaurant.tagline || "Digital Menu"}`
        : siteConfig.name);
    const description =
      restaurant?.metaDescription || restaurant?.description || siteConfig.description;

    return {
      title: {
        default: title,
        template: `%s | ${restaurant?.name || siteConfig.name}`,
      },
      description,
      keywords: restaurant?.keywords ? restaurant.keywords.split(",").map((k) => k.trim()) : undefined,
      icons: {
        icon: restaurant?.favicon || "/favicon.ico",
      },
    };
  } catch {
    return {
      title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
      },
      description: siteConfig.description,
      icons: {
        icon: "/favicon.ico",
      },
    };
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen font-sans ${inter.variable}`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
