import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "Fix-IT - AI-Powered Study Assistant",
  description: "Transform your learning journey with our magical AI study assistant. Get personalized quizzes and watch your knowledge bloom.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`antialiased ${inter.className}`}>{children}</body>
    </html>
  )
}
