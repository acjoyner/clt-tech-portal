import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../src/components/Navbar";
import Script from "next/script";
import Footer from "@/src/components/Footer";
import { CartProvider } from "../src/context/CartContext"; // Import the PROVIDER, not the context

export const metadata: Metadata = {
  title: "Sell & Recycle Laptops Charlotte | Fast Cash & Eco-Friendly Repair",
  description:
    "The #1 place in Charlotte, NC to sell used laptops, recycle old electronics, and get expert repairs.",
  keywords: [
    "Laptop Repair Charlotte",
    "Recycle Laptops NC",
    "Sell Laptop for Cash Charlotte",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-NBF27334');
        `}
        </Script>
      </head>
      <body className="bg-white text-black antialiased">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NBF27334"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        {/* WRAP EVERYTHING IN THE CART PROVIDER */}
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
