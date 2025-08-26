import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wine Pokédex - Gotta Taste Them All!",
  description: "A Pokémon-inspired wine collection experience. Scan bottles, collect wines, learn tasting, and become a wine master!",
  keywords: "wine, tasting, journal, pokedex, pokemon, WSET, wine collection, PWA, mobile",
  authors: [{ name: "Wine Pokédex Team" }],
  creator: "Wine Pokédex",
  publisher: "Wine Pokédex",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wine Pokédex",
  },
  openGraph: {
    type: "website",
    siteName: "Wine Pokédex",
    title: "Wine Pokédex - The Ultimate Wine Collection Experience",
    description: "Transform wine collecting into an engaging game. Scan bottles, build your collection, and master wine tasting with professional WSET methodology.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wine Pokédex - Collect wines like Pokémon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wine Pokédx - Gotta Taste Them All!",
    description: "The ultimate wine collection experience inspired by Pokémon",
    images: ["/twitter-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1d4ed8' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' },
  ],
  colorScheme: 'light dark',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* PWA iOS meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Wine Pokédex" />
        
        {/* Additional iOS meta tags */}
        <link rel="apple-touch-startup-image" href="/splash/startup-390x844.png" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/startup-428x926.png" media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
        
        {/* Android Chrome meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1d4ed8" />
        
        {/* Performance hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api.example.com" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 min-h-screen overscroll-contain`}
      >
        {children}
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
