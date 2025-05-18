import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteMetadata } from '../components/site-metadata';
import { Footer } from '@/components/footer';
import GoToTopButton from '@/components/GoToTopButton';
import "./globals.css";

// Import Material Icons in globals.css instead of as a link tag

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: 'swap',
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Portfolio | Creative Developer & Designer",
  description: "Interactive portfolio showcasing graphic design, 3D animation, and web development work with AI-powered features.",
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <SiteMetadata />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased font-body bg-background text-text dark:bg-primary dark:text-background`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Footer />
          <GoToTopButton />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
