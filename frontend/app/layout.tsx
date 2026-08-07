import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Navbar from '@/components/layout/Navbar';
import StarfieldCanvas from '@/components/core/StarfieldCanvas';
import InitialAppLoader from '@/components/core/InitialAppLoader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MedGuardian — AI Medical Document Analysis',
  description:
    'Upload prescriptions and lab reports. Get AI-powered plain-language explanations, safety analysis, and remedy suggestions. Always consult your doctor.',
  keywords: ['medical AI', 'prescription analysis', 'lab report', 'healthcare'],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body>
        <InitialAppLoader />
        <StarfieldCanvas />
        <div className="page-wrapper">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
