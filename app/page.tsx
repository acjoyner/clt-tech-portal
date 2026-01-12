import React from "react";
import QuoteForm from "./QuoteForm";
import Link from "next/link";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Charlotte Laptop Buyers & Recycling",
  description: "Charlotte's premier high-contrast tech recycling hub.",
  // ... rest of your jsonLd
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-white font-sans text-black">
        {/* Navigation Bar matching Admin/Inventory */}


        {/* Hero Section - High Contrast Blue */}
        <section className="bg-blue-600 text-white py-24 px-4 border-b-8 border-black">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-black mb-6 uppercase italic tracking-tighter leading-none">
              Turn Your Old Laptop <br /> Into <span className="text-yellow-400">Cash</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 font-bold uppercase tracking-wide">
              Based in Charlotte, NC — Serving Customers Nationwide.
            </p>
            
            <div className="flex flex-col md:flex-row justify-center gap-8">
              <Link
                href="#quote"
                className="bg-yellow-400 border-4 border-black px-10 py-5 font-black text-2xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-black text-center"
              >
                Get a Quote
              </Link>
              <Link
                href="/inventory"
                /* EXPLICIT text-black here fixes your invisible text issue */
                className="bg-white border-4 border-black px-10 py-5 font-black text-2xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-black text-center"
              >
                Shop Inventory
              </Link>
            </div>
          </div>
        </section>

        {/* How it Works - Neobrutalist Cards */}
        <section className="max-w-6xl mx-auto py-20 px-4">
          <h2 className="text-5xl font-black text-center mb-16 uppercase italic underline decoration-blue-600">
            How to Work With Us
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Local Column */}
            <div className="bg-white p-10 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-6xl mb-6">📍</div>
              <h3 className="text-3xl font-black mb-4 uppercase">In Charlotte?</h3>
              <p className="text-lg font-bold mb-6 leading-tight text-gray-800">
                Visit us for an instant inspection and cash on the spot. We
                serve Uptown, Ballantyne, Lake Norman, and beyond.
              </p>
              <Link href="#quote" className="inline-block bg-black text-white font-black px-6 py-2 uppercase italic hover:bg-blue-600">
                Drop off today &rarr;
              </Link>
            </div>

            {/* Shipping Column */}
            <div className="bg-white p-10 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-6xl mb-6">📦</div>
              <h3 className="text-3xl font-black mb-4 uppercase">Nationwide?</h3>
              <p className="text-lg font-bold mb-6 leading-tight text-gray-800">
                Get an online quote, print a prepaid shipping label, and get
                paid via PayPal, Venmo, or Zelle as soon as we receive your
                device.
              </p>
              <Link href="#quote" className="inline-block bg-black text-white font-black px-6 py-2 uppercase italic hover:bg-green-600">
                Start mail-in &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section id="quote" className="py-24 px-4 bg-yellow-50 border-y-8 border-black">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-6xl font-black text-black uppercase italic">Get Started</h2>
              <p className="text-xl font-bold text-gray-700 mt-4">
                Fill out the details below for a same-day estimate.
              </p>
            </div>
            <div className="bg-white border-8 border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
              <QuoteForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}