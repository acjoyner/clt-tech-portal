"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabase";
export const dynamic = 'force-dynamic';

interface InventoryItem {
  id: number;
  brand: string;
  model: string;
  sale_price_listing: number;
  image_url?: string;
  battery_health?: string;
  ssd_health?: string;
}

export default function PublicInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicStock = async () => {
      const { data } = await supabase.from("inventory").select("*").eq("is_public", true).order("id", { ascending: false });
      if (data) setItems(data);
      setLoading(false);
    };
    fetchPublicStock();
  }, []);

  if (loading) return <div className="p-20 font-black text-5xl italic uppercase text-black">Scanning Stock...</div>;

  return (
    <div className="min-h-screen bg-white text-black p-12">

      <h1 className="text-8xl font-black italic tracking-tighter uppercase border-b-8 border-black pb-4 mb-12">In Stock</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {items.map((item) => (
          <div key={item.id} className="border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white">
            <div className="h-64 border-b-8 border-black relative">
              {item.image_url && <img src={item.image_url} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />}
              
              {/* VERIFIED HEALTH BADGES */}
              <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                {item.battery_health && (
                  <div className="bg-green-400 border-2 border-black px-3 py-1 font-black text-[10px] uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    🔋 Health: {item.battery_health}%
                  </div>
                )}
                {item.ssd_health && (
                  <div className="bg-blue-400 text-white border-2 border-black px-3 py-1 font-black text-[10px] uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    💾 Drive: {item.ssd_health}%
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-8">
              <h2 className="text-4xl font-black uppercase italic border-b-4 border-black pb-2 mb-4">{item.brand} {item.model}</h2>
              <div className="bg-black text-white p-4 flex justify-between items-center mb-6">
                <span className="font-black italic uppercase text-xs">Price</span>
                <span className="text-4xl font-black">${item.sale_price_listing}</span>
              </div>
              <a href={`mailto:sales@cltlaptops.com?subject=Inquiry: ${item.model}`} className="block w-full bg-yellow-400 border-4 border-black py-4 text-center font-black uppercase text-xl hover:bg-black hover:text-white transition-all">I want this one</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}