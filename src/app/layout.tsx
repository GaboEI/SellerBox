'use client';

import React from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/settings/theme-provider';
import { I18nProvider } from '@/components/i18n/i18n-provider';
import { Providers } from '@/components/providers'; // Import the new Providers component

export default function RootLayout({
  children,
  drawer,
}: Readonly<{
  children: React.ReactNode;
  drawer?: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>SellerBox</title>
        <link rel="icon" href="/sellerbox_icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <Providers> { /* This now wraps everything */ }
          <I18nProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {[
                <React.Fragment key="page">{children}</React.Fragment>,
                drawer ? (
                  <React.Fragment key="drawer">{drawer}</React.Fragment>
                ) : null,
                <Toaster key="toaster" />,
              ]}
            </ThemeProvider>
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
