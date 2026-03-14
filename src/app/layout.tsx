import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "현대프리미엄아울렛 대전점 | SKY TERRACE 신청곡",
  description: "현대프리미엄아울렛 대전점 3F 스카이테라스 신청곡 웹앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-hyundai-gray-200 py-4 px-6 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-hyundai-emerald rounded-full"></div>
              <h1 className="text-xl font-bold tracking-tight text-hyundai-emerald">HYUNDAI <span className="text-hyundai-black font-medium">PREMIUM OUTLET</span></h1>
            </div>
          </header>
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-hyundai-gray-100 border-t border-hyundai-gray-200 py-8 px-6 text-center text-sm text-hyundai-gray-500">
            <p>© {new Date().getFullYear()} HYUNDAI PREMIUM OUTLET DAEJEON. All rights reserved.</p>
            <p className="mt-1 text-xs">3F 스카이테라스 뮤직 플레이어</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
