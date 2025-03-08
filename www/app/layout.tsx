import { ReactNode } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${poppins.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
