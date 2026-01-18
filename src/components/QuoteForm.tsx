"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function QuoteForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      customer_name: formData.get("customer_name"),
      email: formData.get("email"),
      service_type: formData.get("service_type"), // "repair", "sell", or "recycle"
      laptop_details: formData.get("laptop_details"),
      status: "pending", // Initial status for Admin view
    };

    const { error } = await supabase.from("quotes").insert([data]);

    if (error) {
      setStatus({ msg: "Error: Could not submit quote.", type: "error" });
    } else {
      setStatus({ msg: "Quote Submitted! We'll email you soon.", type: "success" });
      (e.target as HTMLFormElement).reset();
    }
    
    setLoading(false);
    // Auto-hide snackbar after 5 seconds
    setTimeout(() => setStatus(null), 5000);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-black uppercase text-xs tracking-widest text-black">Name</label>
            <input
              name="customer_name"
              type="text"
              required
              placeholder="YOUR NAME"
              className="border-4 border-black p-4 font-bold uppercase outline-none focus:bg-blue-50 bg-white text-black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-black uppercase text-xs tracking-widest text-black">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="YOUR@EMAIL.COM"
              className="border-4 border-black p-4 font-bold uppercase outline-none focus:bg-blue-50 bg-white text-black"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-black uppercase text-xs tracking-widest text-black">I Want To:</label>
          <select
            name="service_type"
            required
            className="border-4 border-black p-4 font-black uppercase outline-none bg-white cursor-pointer text-black"
          >
            <option value="repair">Repair my Laptop</option>
            <option value="sell">Sell for Cash</option>
            <option value="recycle">Recycle for Free</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-black uppercase text-xs tracking-widest text-black">Device Details / Issues</label>
          <textarea
            name="laptop_details"
            required
            rows={4}
            placeholder="E.G. MACBOOK PRO M1 - CRACKED SCREEN OR SLOW PERFORMANCE"
            className="border-4 border-black p-4 font-bold uppercase outline-none focus:bg-blue-50 bg-white text-black"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white p-6 font-black text-2xl uppercase italic shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Submit Quote Request →"}
        </button>
      </form>

      {/* CUSTOM SNACKBAR */}
      {status && (
        <div
          className={`fixed bottom-10 right-10 z-50 p-6 border-8 border-black font-black uppercase italic shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 animate-in fade-in slide-in-from-bottom-10 
          ${status.type === "success" ? "bg-green-400" : "bg-red-500"}`}
        >
          <span className="text-xl text-black">{status.msg}</span>
          <button 
            onClick={() => setStatus(null)} 
            className="bg-black text-white px-3 py-1 text-xs border-2 border-black ml-4"
          >
            CLOSE
          </button>
        </div>
      )}
    </div>
  );
}