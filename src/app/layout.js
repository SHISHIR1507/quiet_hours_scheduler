import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Quiet Hours Scheduler",
  description: "Silent study scheduling app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-white text-black antialiased ${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
