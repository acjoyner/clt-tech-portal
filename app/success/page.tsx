"use client";
import { useEffect } from "react";
import { useCart } from "@/src/context/CartContext";
import Link from "next/link";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart once the payment is successful
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white text-black">
      <div className="border-8 border-black p-12 shadow-[16px_16px_0px_0px_rgba(34,197,94,1)] max-w-2xl w-full text-center bg-white">
        <h1 className="text-7xl font-black uppercase italic mb-6 leading-none">
          Payment <span className="text-green-500">Received!</span>
        </h1>
        <p className="text-2xl font-bold uppercase mb-8">
          Your gear is being prepped for shipment. Check your email for a receipt.
        </p>
        <Link 
          href="/profile" 
          className="inline-block bg-black text-white px-8 py-4 font-black uppercase text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          Track Order
        </Link>
      </div>
    </div>
  );
}