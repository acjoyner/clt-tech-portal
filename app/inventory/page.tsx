"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabase";
import Image from "next/image";
import { useCart } from "@/src/context/CartContext";

interface InventoryItem {
  id: number;
  brand: string;
  model: string;
  sale_price_listing: number;
  image_url: string;
  cpu: string;
  condition: string; // New field
  status: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPublicInventory = async () => {
      const { data } = await supabase
        .from("inventory")
        .select("*")
        .eq("is_public", true)
        .eq("status", "for_sale");
      if (data) setItems(data);
    };
    fetchPublicInventory();
  }, []);

  const filteredItems = items.filter(item => 
    `${item.brand} ${item.model} ${item.cpu}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to color-code conditions
  const getConditionStyle = (cond: string) => {
    switch(cond.toLowerCase()) {
      case 'mint': return 'bg-purple-400';
      case 'excellent': return 'bg-green-400';
      case 'good': return 'bg-yellow-400';
      default: return 'bg-orange-400';
    }
  };

  const { addToCart } = useCart();

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <header className="mb-12 border-b-8 border-black pb-8">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter">
          CLT <span className="text-blue-600">INVENTORY</span>
        </h1>
        
        {/* NEOBRUTALIST SEARCH BAR */}
        <div className="mt-8 flex gap-0 max-w-2xl">
          <div className="bg-black text-white p-4 font-black uppercase flex items-center border-4 border-black border-r-0">
            Search
          </div>
          <input 
            type="text"
            placeholder="e.g. 'MacBook' or 'i7'..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-4 border-black p-4 font-bold uppercase outline-none focus:bg-blue-50"
          />
        </div>
      </header>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredItems.map((item) => (
          <div key={item.id} className="relative group border-4 border-black p-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all bg-white overflow-hidden">
            
            {/* CONDITION BADGE */}
            <div className={`absolute top-4 right-4 z-10 border-2 border-black px-3 py-1 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${getConditionStyle(item.condition)}`}>
              {item.condition}
            </div>

            <div className="h-56 w-full border-b-4 border-black relative bg-gray-100">
              <Image 
                src={item.image_url || "/placeholder-laptop.png"} 
                alt={item.model} 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-black uppercase leading-none">{item.brand}</h2>
                <div className="bg-black text-white px-2 py-1 font-black text-xl italic border-2 border-black">
                  ${item.sale_price_listing}
                </div>
              </div>
              
              <p className="font-bold text-lg mb-1">{item.model}</p>
              <p className="font-bold text-sm text-gray-500 uppercase mb-6 tracking-widest">{item.cpu}</p>
              
              <button 
  onClick={() => addToCart({
    id: item.id,
    brand: item.brand,
    model: item.model,
    price: item.sale_price_listing,
    image: item.image_url
  })}
  className="w-full bg-blue-600 text-white p-4 font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
>
  Add to Cart
</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}