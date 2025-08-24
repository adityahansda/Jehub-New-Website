// src/components/NewPageLayout.tsx
import { Inter, Roboto_Mono } from "next/font/google";

// Replace Geist with a real Google font if needed
const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function NewPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      {children}
    </div>
  );
}
