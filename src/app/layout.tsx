import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import logoImg from "@/assets/logo.png";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Tahfiy - Tahfidz Digital System",
  description: "Tahfiy Digital System",
  icons: {
    icon: [{ url: logoImg.src, type: "image/png" }],
    shortcut: logoImg.src,
    apple: logoImg.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.className}  h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
