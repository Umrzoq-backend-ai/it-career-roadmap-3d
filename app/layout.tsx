import type {Metadata} from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Professional Map — Dasturlash kursi python backend xaritasi',
  description: 'Python, SQL, Telegram Bot, Django, DRF va FastAPI bo\'yicha 3D interaktiv shahar xaritasi va o\'quv platformasi.',
  openGraph: {
    title: 'Professional Map — Dasturlash kursi python backend xaritasi',
    description: 'Python, SQL, Telegram Bot, Django, DRF va FastAPI bo\'yicha 3D interaktiv shahar xaritasi va o\'quv platformasi.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Map — Dasturlash kursi python backend xaritasi',
    description: 'Python, SQL, Telegram Bot, Django, DRF va FastAPI bo\'yicha 3D interaktiv shahar xaritasi va o\'quv platformasi.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="uz" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body suppressHydrationWarning className="bg-[#090d16] text-white antialiased selection:bg-lime-400 selection:text-slate-950 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
