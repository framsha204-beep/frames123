import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Frames & Decor PK - Premium Photo Frames in Pakistan',
    template: '%s | Frames & Decor PK',
  },
  description:
    'Pakistan\'s premium destination for handcrafted photo frames and wall decor. Transform your memories into art with our curated collection of wooden, glass, acrylic, and luxury frames.',
  keywords: [
    'photo frames Pakistan',
    'picture frames',
    'wall decor',
    'wooden frames',
    'glass frames',
    'luxury frames',
    'home decor Pakistan',
  ],
  openGraph: {
    title: 'Frames & Decor PK - Premium Photo Frames',
    description: 'Transform your memories into art with premium photo frames.',
    type: 'website',
    locale: 'en_PK',
    siteName: 'Frames & Decor PK',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-WSVE5E72CE"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-WSVE5E72CE');
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
