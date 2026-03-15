import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "현대프리미엄아울렛 대전점 | SKY TERRACE 신청곡",
  description: "현대프리미엄아울렛 대전점 3F 스카이테라스 신청곡 웹앱",
};

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <main className="flex-grow pt-[120px] md:pt-[144px]">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
