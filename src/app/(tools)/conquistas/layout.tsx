import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Desafio das Estrelas - Estação de Comando',
  description: 'Transforme responsabilidades em conquistas galácticas.',
  manifest: '/conquistas/manifest.json',
  themeColor: '#2dd4bf',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  appleWebApp: {
    capable: true,
    title: 'Desafio Estrelas',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/conquistas/icon.png',
    apple: '/conquistas/icon.png',
  },
};

export default function ConquistasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
