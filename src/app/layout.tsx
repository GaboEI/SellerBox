'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/settings/theme-provider';
import { FirebaseProvider, initializeFirebase } from '@/firebase';

// Metadata ya no puede exportarse desde un layout de cliente,
// pero el título se puede establecer en la plantilla HTML si es necesario.
// export const metadata: Metadata = {
//   title: "SellerBox",
//   description: 'Your all-in-one sales management toolkit.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Inicializa Firebase directamente en el layout del cliente.
  const { firebaseApp, auth, firestore, storage } = initializeFirebase();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>SellerBox</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FirebaseProvider
            firebaseApp={firebaseApp}
            auth={auth}
            firestore={firestore}
            storage={storage}
          >
            {children}
          </FirebaseProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
