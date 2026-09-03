import React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Rem - Hierarchical Todo & Directory Manager',
  description: 'Organize tasks and nested directories with Next.js, Material UI, and MongoDB',
  icons: {
    icon: '/rem.png',
  },
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1029384756-rem-todo.apps.googleusercontent.com';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <ThemeProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ThemeProvider>
          </GoogleOAuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
