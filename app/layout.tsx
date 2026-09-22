import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI WhatsApp Business OS | Operating System for WhatsApp Sales',
  description: 'Turn WhatsApp into your business operating system. Multi-tenant SaaS for SMEs, clinics, e-commerce, and service businesses in Morocco.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
