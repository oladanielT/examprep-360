import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import AllProvider from "@/providers/all-provider";

const work_sans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exam Prep Admin App",
  description: "Admin app for managing exam preparation content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${work_sans.variable} antialiased`}>
        <AllProvider>{children}</AllProvider>
      </body>
    </html>
  );
}
