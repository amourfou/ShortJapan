import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-kr",
  weight: ["400", "500", "600", "700"],
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "ShortJapan — 일본어 글자 암기",
  description: "아이들과 함께 히라가나·카타카나를 재미있게 외워요",
  applicationName: "ShortJapan",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${notoSansJp.variable}`}>
      <body className="font-sans antialiased text-slate-50">{children}</body>
    </html>
  );
}
