"use client";
import { IBM_Plex_Mono } from "next/font/google";
import { useEffect } from "react";
import Prism from "prismjs";

import "prismjs/themes/prism-tomorrow.min.css";
import "prismjs/components/prism-properties";
import "prismjs/components/prism-php";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400"],
  subsets: ["latin"],
});

interface CodeBlockProps {
  language: "properties" | "php";
  code: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  useEffect(function () {
    Prism.highlightAll();
  }, []);

  return (
    <pre
      tabIndex={0}
      style={{
        backgroundColor: "var(--color-stone-800) !important",
      }}
      className="mt-2 p-4 rounded-lg bg-stone-800 language-properties"
    >
      <code
        className={`language-${language}`}
        style={{
          fontFamily: ibmPlexMono.style.fontFamily + " !important",
        }}
      >
        {code}
      </code>
    </pre>
  );
}
