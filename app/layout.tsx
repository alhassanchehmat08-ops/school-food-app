import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEA Snack Stop",
  description: "Order your favorite Southeast Asian snacks at school.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
