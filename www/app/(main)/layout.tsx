import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NextAuthProviderWrapper from "@/providers/NextAuthProviderWrappre";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayoutProps({ children }: MainLayoutProps) {
  return (
    <NextAuthProviderWrapper>
      <div className="h-screen w-screen overflow-auto bg-[#0a0a0a] text-white flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Content */}
        {children}

        {/* Footer */}
        <Footer />
      </div>
    </NextAuthProviderWrapper>
  );
}
