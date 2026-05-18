import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Desafio das Estrelas - Estação de Comando',
  description: 'Transforme responsabilidades em conquistas galácticas. O diário comportamental gamificado mais avançado.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Desafio Estrelas',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/conquistas/icon.png',
    apple: '/conquistas/icon.png',
  },
  openGraph: {
    title: 'Desafio das Estrelas',
    description: 'Transforme a rotina das crianças em uma aventura galáctica e desenvolva o comportamento de forma gamificada.',
    url: 'https://desafiodasestrelas.com',
    siteName: 'Desafio das Estrelas',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desafio das Estrelas',
    description: 'Transforme responsabilidades em conquistas galácticas.',
  }
};

export const viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0f172a]">
        <ToastProvider>
          {children}
        </ToastProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    if (process.env.NODE_ENV !== 'production') {
                      console.log('SW registrado com sucesso:', registration.scope);
                    }
                  }, function(err) {
                    if (process.env.NODE_ENV !== 'production') {
                      console.log('Falha no registro do SW:', err);
                    }
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
