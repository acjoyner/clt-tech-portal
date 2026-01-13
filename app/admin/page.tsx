"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../src/lib/supabase";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// --- Interfaces ---
interface InventoryItem {
  created_at: string;
  id: number;
  brand: string;
  model: string;
  status: "intake" | "refurbishing" | "for_sale" | "sold";
  purchase_price: number;
  is_public: boolean;
  sale_price_listing?: number;
  image_url?: string;
  cpu?: string;
  battery_health?: string;
  ssd_health?: string;
}

interface LaptopQuote {
  last_active: string | null;
  id: number;
  customer_name: string;
  email: string;
  laptop_details: string;
  status: string;
  repair_status?: string;
}

type ModalState =
  | { type: "specs"; data: InventoryItem }
  | { type: "publish"; data: InventoryItem }
  | { type: "buy"; data: LaptopQuote };

export default function AdminDashboard() {
  const [quotes, setQuotes] = useState<LaptopQuote[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalState | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // --- Search Logic (Generic and Type-Safe) ---
  function filterData<T>(data: T[]): T[] {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((item) =>
      Object.values(item as object).some(
        (val) => typeof val === "string" && val.toLowerCase().includes(term)
      )
    );
  }

  // --- Auth & Data Fetching ---
  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== "anthony.c.joyner@gmail.com") {
        router.push("/login");
        return;
      }
      const [qResponse, iResponse] = await Promise.all([
        supabase.from("quotes").select("*").order("id", { ascending: false }),
        supabase.from("inventory").select("*").order("id", { ascending: false }),
      ]);
      if (qResponse.data) setQuotes(qResponse.data);
      if (iResponse.data) setInventory(iResponse.data);
      setLoading(false);
    };
    checkAdminAndFetch();
  }, [router, refreshSignal]);

  // --- Handlers ---
  const handlePublish = async (id: number, price: number) => {
    const { error } = await supabase
      .from("inventory")
      .update({ is_public: true, sale_price_listing: price, status: "for_sale" })
      .eq("id", id);
    if (!error) { setRefreshSignal(s => s + 1); setActiveModal(null); }
  };

  const handleFinalDelete = async () => {
    if (!itemToDelete) return;
    const { error } = await supabase.from("inventory").delete().eq("id", itemToDelete);
    if (!error) { setRefreshSignal(s => s + 1); setItemToDelete(null); }
  };

  const handleBuyLead = async (quote: LaptopQuote, price: number) => {
    const { error: invError } = await supabase.from("inventory").insert([
      { brand: "Unknown", model: quote.laptop_details, status: "intake", purchase_price: price },
    ]);
    if (!invError) {
      await supabase.from("quotes").update({ status: "purchased" }).eq("id", quote.id);
      setRefreshSignal(s => s + 1);
      setActiveModal(null);
    }
  };

  const updateRepairStatus = async (id: number, status: string, quote: LaptopQuote) => {
  // 1. Update the Database
  const { error } = await supabase
    .from("quotes")
    .update({ repair_status: status })
    .eq("id", id);

  if (!error) {
    setRefreshSignal((s) => s + 1);

    // 2. Trigger the Email Notification
    try {
      await fetch('/api/status-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: quote.email, // Ensure email is in your LaptopQuote interface
          customerName: quote.customer_name,
          device: quote.laptop_details,
          status: status
        }),
      });
    } catch (err) {
      console.error("Failed to send email notification:", err);
    }
  }
};

  
  const saveSpecs = async (id: number, updates: Partial<InventoryItem>) => {
    const { error } = await supabase.from("inventory").update(updates).eq("id", id);
    if (!error) { setRefreshSignal(s => s + 1); setActiveModal(null); }
  };

  // --- Financial Calculations ---
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = months.map((m, index) => {
    const monthlyTotal = inventory
      .filter((item) => {
        const itemDate = item.created_at ? new Date(item.created_at) : new Date(item.id);
        return item.status === "sold" && itemDate.getMonth() === index;
      })
      .reduce((sum, item) => sum + (item.sale_price_listing || 0), 0);
    return { month: m, amount: monthlyTotal };
  });

  const soldHistory = inventory.filter((item) => item.status === "sold");
  const netProfit = soldHistory.reduce((acc, item) => acc + ((item.sale_price_listing || 0) - item.purchase_price), 0);

  if (loading) return <div className="p-20 font-black uppercase text-center">Loading Dashboard...</div>;

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      {/* SEARCH BAR - Using canonical Tailwind classes top-20 and z-40 */}
      <div className="mb-12 sticky top-20 z-40 bg-white pb-4">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-8 border-black p-6 text-2xl font-black uppercase italic outline-none shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] focus:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
        />
      </div>

      {/* REVENUE CHART */}
      <section className="mb-16 bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-3xl font-black uppercase italic mb-6">Annual Revenue</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" />
              <XAxis dataKey="month" tick={{ fill: "#000", fontWeight: "bold" }} />
              <YAxis tick={{ fill: "#000", fontWeight: "bold" }} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "4px solid black" }} />
              <Bar dataKey="amount" fill="#2563eb" stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* REPAIR TRACKER */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-4 uppercase italic text-blue-700 underline">Active Customer Repairs</h2>
        <div className="border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b-4 border-black font-black uppercase text-sm">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Device</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filterData(quotes.filter(q => q.status === "purchased")).map((quote) => (
                <tr key={quote.id} className="border-b-2 border-black">
                  <td className="p-4 font-bold">{quote.customer_name}</td>
                  <td className="p-4">{quote.laptop_details}</td>
                  <td className="p-4 text-xs font-mono">
                    {quote.last_active ? new Date(quote.last_active).toLocaleString() : "N/A"}
                  </td>
                  <td className="p-4 text-center">
                    <select
                      defaultValue={quote.repair_status || "pending"}
                      onChange={(e) => updateRepairStatus(quote.id, e.target.value, quote)}
                      className="border-2 border-black p-1 font-black uppercase text-xs"
                    >
                      <option value="pending">Diagnosing</option>
                      <option value="parts">Waiting for Parts</option>
                      <option value="fixing">On Bench</option>
                      <option value="ready">Ready for Pickup</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* REFURB PIPELINE */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-4 uppercase italic text-green-700">Refurb Pipeline</h2>
        <div className="border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b-4 border-black font-black uppercase text-sm">
              <tr>
                <th className="p-4">Model</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filterData(inventory.filter(i => i.status !== "sold")).map((item) => (
                <tr key={item.id} className="border-b-2 border-black">
                  <td className="p-4 font-black text-xl italic">{item.brand} {item.model}</td>
                  <td className="p-4 text-center space-x-2">
                    <button onClick={() => setActiveModal({ type: "specs", data: item })} className="bg-yellow-400 border-2 border-black px-2 py-1 font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Specs</button>
                    <button onClick={() => setActiveModal({ type: "publish", data: item })} className="bg-blue-600 text-white px-4 py-1 font-black text-xs border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Publish</button>
                    <button onClick={() => setItemToDelete(item.id)} className="bg-red-500 text-white px-2 py-1 font-black text-[10px] uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PROFIT HISTORY */}
      <section className="mb-16">
        <div className="flex justify-between items-end mb-4 text-black">
          <h2 className="text-3xl font-black uppercase italic">Profit History</h2>
          <div className="bg-green-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase block">Net Profit</span>
            <span className="text-3xl font-black">${netProfit.toFixed(2)}</span>
          </div>
        </div>
        <div className="border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white text-black">
          <table className="w-full text-left">
            <thead className="bg-black text-white font-black uppercase text-sm">
              <tr>
                <th className="p-4">Laptop Model</th>
                <th className="p-4 text-center">Cost</th>
                <th className="p-4 text-center">Sale</th>
                <th className="p-4 text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {filterData(soldHistory).map((item) => (
                <tr key={item.id} className="border-b-2 border-black">
                  <td className="p-4 font-bold">{item.brand} {item.model}</td>
                  <td className="p-4 text-center text-red-600 font-bold">-${item.purchase_price}</td>
                  <td className="p-4 text-center font-bold">${item.sale_price_listing}</td>
                  <td className="p-4 text-right font-black text-green-700">
                    +${((item.sale_price_listing || 0) - item.purchase_price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
           <div className="bg-white border-8 border-black p-8 max-w-md w-full text-black">
              {activeModal.type === "buy" && (
                <>
                  <h2 className="text-3xl font-black uppercase mb-4 italic">Purchase Lead</h2>
                  <p className="font-bold mb-4">Buying: {activeModal.data.laptop_details}</p>
                  <input id="buyPrice" type="number" placeholder="$ Amount" className="w-full border-4 border-black p-4 text-2xl font-black mb-6" />
                  <div className="flex gap-4">
                    <button onClick={() => handleBuyLead(activeModal.data as LaptopQuote, Number((document.getElementById("buyPrice") as HTMLInputElement).value))} className="flex-1 bg-green-500 border-4 border-black p-4 font-black">CONFIRM</button>
                    <button onClick={() => setActiveModal(null)} className="flex-1 bg-gray-200 border-4 border-black p-4 font-black">CANCEL</button>
                  </div>
                </>
              )}
              {activeModal.type === "publish" && (
                <>
                  <h2 className="text-3xl font-black uppercase mb-4 italic">Set Sale Price</h2>
                  <input id="pubPrice" type="number" placeholder="$ Sale Price" className="w-full border-4 border-black p-4 text-3xl font-black mb-6" />
                  <button onClick={() => handlePublish(activeModal.data.id, Number((document.getElementById("pubPrice") as HTMLInputElement).value))} className="w-full bg-blue-600 text-white border-4 border-black p-4 font-black text-xl uppercase">Go Live</button>
                  <button onClick={() => setActiveModal(null)} className="w-full mt-4 font-bold text-gray-400 uppercase text-xs">Cancel</button>
                </>
              )}
              {activeModal.type === "specs" && (
                <>
                  <h2 className="text-3xl font-black uppercase mb-4 italic">Health Check</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">CPU</label>
                      <input id="m_cpu" defaultValue={activeModal.data.cpu} className="w-full border-2 border-black p-2 font-bold" />
                    </div>
                  </div>
                  <button onClick={() => saveSpecs(activeModal.data.id, { cpu: (document.getElementById("m_cpu") as HTMLInputElement).value })} className="w-full bg-yellow-400 border-4 border-black p-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Save</button>
                  <button onClick={() => setActiveModal(null)} className="w-full mt-4 font-bold text-gray-400 uppercase text-xs">Close</button>
                </>
              )}
           </div>
        </div>
      )}

      {/* SNACKBAR - Using canonical Tailwind z-200 */}
      {itemToDelete && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-200 bg-red-600 border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center min-w-[320px]">
          <p className="font-black uppercase text-white text-xl mb-6 italic">Confirm Deletion?</p>
          <div className="flex gap-4 w-full">
            <button onClick={handleFinalDelete} className="flex-1 bg-white text-black border-4 border-black p-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Yes, Delete</button>
            <button onClick={() => setItemToDelete(null)} className="flex-1 bg-gray-200 text-black border-4 border-black p-3 font-black uppercase">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}