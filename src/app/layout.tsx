import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { StoreHydration } from "@/components/StoreHydration";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Braspel WMS",
  description:
    "Demonstração do sistema de gestão de armazém inteligente para a Braspel Embalagens.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="h-full">
        <StoreHydration />
        {children}
      </body>
    </html>
  );
}
