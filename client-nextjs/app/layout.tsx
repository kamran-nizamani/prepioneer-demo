import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrepPioneer - Master Pakistani Competitive Exams",
  description: "AI-powered test preparation platform for CSS, MDCAT, ECAT, LAT, NAT, PMS, GAT, and NTS exams",
  keywords: ["CSS", "MDCAT", "ECAT", "LAT", "NAT", "PMS", "GAT", "NTS", "Pakistan", "exam prep"],
  authors: [{ name: "PrepPioneer Team" }],
  openGraph: {
    title: "PrepPioneer - AI Test Prep",
    description: "Master Pakistani competitive exams with AI-powered personalized learning",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
