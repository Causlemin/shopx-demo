import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Toaster } from 'sonner';
import { Nunito as FontSans } from "next/font/google";
import { AuthProvider } from '@/components/AuthProvider';

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: 'ShopX - Demo',
  description: 'Harika bir alışveriş deneyimi için ShopX E-Ticaret platformu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning
    className={`${fontSans.variable} antialiased`}
    >
      <body className='min-h-screen flex flex-col'>
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}