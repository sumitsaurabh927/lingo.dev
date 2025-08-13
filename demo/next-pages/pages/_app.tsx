import type { AppProps } from "next/app";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { LocaleSwitcher } from "lingo.dev/react/client";
import { LingoProvider, loadDictionary } from "lingo.dev/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LingoProvider loadDictionary={(locale) => loadDictionary(locale)}>
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="absolute top-2 right-3">
          <LocaleSwitcher
            locales={["en", "es", "zh", "ja", "fr", "de", "ru", "ar", "ko"]}
          />
        </div>
        <Component {...pageProps} />
      </div>
    </LingoProvider>
  );
}
