import { ReactNode } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Fireman - Build PHP-Laravel Apps in Seconds with AI",
  description:
    "Create, edit, and deploy PHP-Laravel applications instantly with Fireman. Powered by AI, this free tool transforms your ideas into full-stack solutions effortlessly. Start now at fireman.ink!",
  keywords:
    "PHP, Laravel, AI development, web app builder, full-stack development, PHP framework, rapid prototyping, developer tools, Fireman, fireman.ink",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>{children}</body>
    </html>
  );
}
