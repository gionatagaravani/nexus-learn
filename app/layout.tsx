import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles
import { ServerAuth } from '@/components/server-auth';
import { I18nProvider } from '@/lib/i18n/i18n-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Nexus Learn',
  description: 'University-focused AI learning platform',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased text-neutral-900 bg-neutral-50" suppressHydrationWarning>
        <ServerAuth>
          <I18nProvider>
            {children}
          </I18nProvider>
        </ServerAuth>
      </body>
    </html>
  );
}
