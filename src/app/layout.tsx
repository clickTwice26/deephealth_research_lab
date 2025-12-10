import { Space_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata = {
  title: 'DeepHealth Research Lab',
  description: 'Pioneering AI Healthcare Research',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
