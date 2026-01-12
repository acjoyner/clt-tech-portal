import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../src/components/Navbar"; // Import the new component

export const metadata: Metadata = {
  title: 'Sell & Recycle Laptops Charlotte | Fast Cash & Eco-Friendly Repair',
  description: 'The #1 place in Charlotte, NC to sell used laptops, recycle old electronics, and get expert repairs. Serving Uptown, Ballantyne, and University City.',
  keywords: ['Laptop Repair Charlotte', 'Recycle Laptops NC', 'Sell Laptop for Cash Charlotte'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-black antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}