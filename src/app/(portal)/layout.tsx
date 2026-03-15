import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow pt-[120px] md:pt-[144px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
