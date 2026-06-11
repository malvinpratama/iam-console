import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const display = Archivo({
  variable: "--font-display-src",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});
const sans = IBM_Plex_Sans({
  variable: "--font-sans-src",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const mono = IBM_Plex_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "IAM Console",
  description: "Admin console for the IAM platform — Login with iam (OIDC).",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
