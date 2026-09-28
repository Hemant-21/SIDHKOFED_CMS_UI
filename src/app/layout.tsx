import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AppProviders } from '@/providers/app-providers';
import { APP } from '@/constants/app';

const inter = localFont({
  src: './fonts/InterVariable.woff2',
  variable: '--font-sans',
  display: 'swap',
  weight: '100 900',
  style: 'normal',
});

export const metadata: Metadata = {
  title: { default: `${APP.name} — Admin`, template: `%s · ${APP.shortName} CMS` },
  description: 'SIDHKOFED CMS administration console.',
  robots: { index: false, follow: false }, // admin app — never indexed
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#16181d' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
