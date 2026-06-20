import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["900"] });

export const metadata: Metadata = {
  title: "YouQuiz IA — Generador de exámenes con IA",
  description: "Genera exámenes personalizados con inteligencia artificial para docentes latinoamericanos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} h-full antialiased dark-theme`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem('quizia-theme')||'dark';document.documentElement.classList.remove('dark-theme','light-theme');document.documentElement.classList.add(t+'-theme');}catch(e){}`
        }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}