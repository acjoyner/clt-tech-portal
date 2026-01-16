"use client";
import { useCart } from "@/src/context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CartPage() {
  const { cart, total, removeFromCart } = useCart();

  const handleCheckout = async () => {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: cart }),
  });

  const session = await response.json();

  if (session.url) {
    // This is the modern, faster way to redirect
    window.location.href = session.url;
  } else {
    console.error("Failed to create checkout session");
  }
};

  return (
    <div className="p-8 md:p-20 bg-white min-h-screen text-black">
      <h1 className="text-6xl font-black uppercase italic mb-12 border-b-8 border-black pb-4">
        Your <span className="text-blue-600">Cart</span>
      </h1>

      {cart.length === 0 ? (
        <div className="border-4 border-dashed border-black p-12 text-center">
          <p className="font-black text-2xl uppercase italic text-gray-400">Your cart is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="border-4 border-black p-6 flex flex-col md:flex-row justify-between items-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white gap-4">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 border-2 border-black relative bg-gray-100">
                      <Image src={item.image || "/placeholder.png"} alt={item.model} fill className="object-cover" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black uppercase italic">{item.brand} {item.model}</h3>
                      <p className="font-bold text-blue-600 text-xl">${item.price}</p>
                   </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-500 text-white px-6 py-2 font-black border-2 border-black hover:bg-white hover:text-red-500 transition-all uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="border-8 border-black p-8 bg-white h-fit shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black uppercase mb-6 italic">Summary</h2>
            <div className="flex justify-between font-bold text-xl mb-4 border-b-2 border-black pb-2">
              <span>Total:</span>
              <span>${total}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-black text-white p-4 font-black uppercase text-xl italic hover:bg-blue-600 transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Checkout Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}