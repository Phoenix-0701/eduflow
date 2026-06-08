import type { Metadata } from "next";
import "./globals.css";
import "material-symbols/outlined.css";

export const metadata: Metadata = {
  title: "EduFlow - The Future of Academic Management is Here",
  description: "Streamline your institution with AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
        {children}
      </body>
    </html>
  );
}
