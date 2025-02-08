// app/layout.js
import "./globals.css";  // Import global styles (Tailwind CSS)
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Fix-IT',
  description: 'Learn and improve your knowledge with AI-generated tests.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
