"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  id: number;
  customer_name: string;
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

  const getYearlyData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData: { [key: string]: number } = {};
  
  months.forEach(m => monthlyData[m] = 0);

  // Group sold items from your inventory state
  inventory.filter(item => item.status === 'sold').forEach(item => {
    // Uses the ID timestamp as a fallback for the date
    const date = new Date(item.id); 
    const monthName = months[date.getMonth()];
    monthlyData[monthName] += item.sale_price_listing || 0;
  });

  return months.map(m => ({ month: m, amount: monthlyData[m] }));
};

  const handlePublish = async (id: number, price: number) => {
    const { error } = await supabase
      .from("inventory")
      .update({
        is_public: true,
        sale_price_listing: price,
        status: "for_sale",
      })
      .eq("id", id);

    if (!error) {
      setRefreshSignal((s) => s + 1);
      setActiveModal(null);
    } else {
      alert("Error publishing: " + error.message);
    }
  };

  // This function closes the modal and clears the data
  const closeModal = () => {
    setActiveModal(null);
  };
  const router = useRouter();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      // 1. Get the current logged-in user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 2. Strict Check: If no session OR email isn't yours, kick them out
      if (!session || session.user.email !== "anthony.c.joyner@gmail.com") {
        alert("Access Denied: Admins Only.");
        router.push("/login"); // Send them to the customer login page
        return;
      }

      // 3. If they ARE the admin, fetch the business data
      const [qResponse, iResponse] = await Promise.all([
        supabase.from("quotes").select("*").order("id", { ascending: false }),
        supabase
          .from("inventory")
          .select("*")
          .order("id", { ascending: false }),
      ]);

      if (qResponse.data) setQuotes(qResponse.data);
      if (iResponse.data) setInventory(iResponse.data);
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [router, refreshSignal]);

  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    itemId: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `${itemId}-${new Date().getTime()}.${file.name
      .split(".")
      .pop()}`;
    const { error } = await supabase.storage
      .from("laptop-photos")
      .upload(fileName, file);
    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("laptop-photos").getPublicUrl(fileName);
      await supabase
        .from("inventory")
        .update({ image_url: publicUrl })
        .eq("id", itemId);
      setRefreshSignal((s) => s + 1);
    }
  };

  const saveSpecs = async (id: number, updates: Partial<InventoryItem>) => {
    const { error } = await supabase
      .from("inventory")
      .update(updates)
      .eq("id", id);
    if (!error) {
      setRefreshSignal((s) => s + 1); // Triggers re-fetch
      setActiveModal(null); // Closes modal
    }
  };

  const handleBuyLead = async (quote: LaptopQuote, price: number) => {
    const { error: invError } = await supabase.from("inventory").insert([
      {
        brand: "Unknown",
        model: quote.laptop_details,
        status: "intake",
        purchase_price: price,
      },
    ]);

    if (!invError) {
      // Update the quote status so it moves out of "Incoming Leads"
      await supabase
        .from("quotes")
        .update({ status: "purchased" })
        .eq("id", quote.id);
      setRefreshSignal((s) => s + 1);
      setActiveModal(null);
    }
  };

  // Update the status of a customer's repair
  const updateRepairStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from("quotes")
      .update({ repair_status: status })
      .eq("id", id);

    if (!error) {
      setRefreshSignal((s) => s + 1);
    }
  };

  // Calculate financial "Gravy"
  const soldHistory = inventory.filter((item) => item.status === "sold");
  const totalRevenue = soldHistory.reduce(
    (acc, item) => acc + (item.sale_price_listing || 0),
    0
  );
  const totalCost = soldHistory.reduce(
    (acc, item) => acc + (item.purchase_price || 0),
    0
  );
  const netProfit = totalRevenue - totalCost;

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <section className="mb-16 bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-3xl font-black uppercase italic mb-6 text-black">
          Annual Revenue
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getYearlyData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#000", fontWeight: "bold" }}
              />
              <YAxis tick={{ fill: "#000", fontWeight: "bold" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "4px solid black",
                  color: "#000",
                }}
              />
              <Bar
                dataKey="amount"
                fill="#2563eb"
                stroke="#000"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* REPAIR TRACKER SECTION */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-4 uppercase italic text-blue-700 underline">
          Active Customer Repairs
        </h2>
        <div className="border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b-4 border-black font-black uppercase text-sm">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Device</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotes
                .filter((q) => q.status === "purchased")
                .map((quote) => (
                  <tr key={quote.id} className="border-b-2 border-black">
                    <td className="p-4 font-bold">{quote.customer_name}</td>
                    <td className="p-4">{quote.laptop_details}</td>
                    <td className="p-4 text-center">
                      <select
                        defaultValue={quote.repair_status}
                        onChange={(e) =>
                          updateRepairStatus(quote.id, e.target.value)
                        }
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

      {/* RE-ADDED PHOTO UPLOAD TO PIPELINE */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-4 uppercase italic text-green-700">
          Refurb Pipeline
        </h2>
        <div className="border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b-4 border-black font-black uppercase text-sm">
              <tr>
                <th className="p-4">Model</th>
                <th className="p-4 text-center">Photo</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory
                .filter((i) => i.status !== "sold")
                .map((item) => (
                  <tr key={item.id} className="border-b-2 border-black">
                    <td className="p-4 font-black text-xl italic">
                      {item.brand} {item.model}
                    </td>
                    <td className="p-4 text-center">
                      <label className="cursor-pointer bg-black text-white px-3 py-1 text-[10px] font-black border-2 border-black uppercase hover:bg-white hover:text-black">
                        {item.image_url ? "Change" : "Upload"}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => uploadImage(e, item.id)}
                        />
                      </label>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          setActiveModal({ type: "publish", data: item })
                        }
                        className="bg-blue-600 text-white px-4 py-1 font-black text-xs border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Publish
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* 1. REPAIR TRACKER SECTION */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-4 uppercase italic text-blue-700 underline">
          Active Customer Repairs
        </h2>
        <div className="border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <table className="w-full text-left text-black">
            <thead className="bg-gray-100 border-b-4 border-black font-black uppercase text-sm">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Device</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotes
                .filter((q) => q.status === "purchased")
                .map((quote) => (
                  <tr key={quote.id} className="border-b-2 border-black">
                    <td className="p-4 font-bold">{quote.customer_name}</td>
                    <td className="p-4 font-medium">{quote.laptop_details}</td>
                    <td className="p-4 text-center">
                      <select
                        defaultValue={quote.repair_status || "pending"}
                        onChange={(e) =>
                          updateRepairStatus(quote.id, e.target.value)
                        }
                        className="border-2 border-black p-2 font-black uppercase text-xs bg-white text-black"
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

      {/* 2. PROFIT HISTORY (THE GRAVY) */}
      <section className="mb-16">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-3xl font-black uppercase italic text-black">
            Profit History
          </h2>
          <div className="bg-green-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase block text-black">
              Net Profit
            </span>
            <span className="text-3xl font-black text-black">
              ${netProfit.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <table className="w-full text-left text-black">
            <thead className="bg-black text-white font-black uppercase text-sm">
              <tr>
                <th className="p-4">Laptop Model</th>
                <th className="p-4 text-center">Cost</th>
                <th className="p-4 text-center">Sale</th>
                <th className="p-4 text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {soldHistory.map((item) => (
                <tr key={item.id} className="border-b-2 border-black">
                  <td className="p-4 font-bold">
                    {item.brand} {item.model}
                  </td>
                  <td className="p-4 text-center text-red-600 font-bold">
                    -${item.purchase_price}
                  </td>
                  <td className="p-4 text-center font-bold">
                    ${item.sale_price_listing}
                  </td>
                  <td className="p-4 text-right font-black text-green-700">
                    +$
                    {(
                      (item.sale_price_listing || 0) - item.purchase_price
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* INCOMING LEADS SECTION */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-4 uppercase italic text-blue-700 underline">
          Incoming Leads
        </h2>
        <div className="border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b-4 border-black font-black uppercase text-sm">
              <tr>
                <th className="p-4 text-black">Customer</th>
                <th className="p-4 text-black">Laptop Details</th>
                <th className="p-4 text-center text-black">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes
                .filter((q) => q.status === "new")
                .map((quote) => (
                  <tr key={quote.id} className="border-b-2 border-black">
                    <td className="p-4 font-bold text-black">
                      {quote.customer_name}
                    </td>
                    <td className="p-4 text-black">{quote.laptop_details}</td>
                    <td className="p-4 text-center space-x-2">
                      {/* THIS IS YOUR MISSING BUY OPTION */}
                      <button
                        onClick={() =>
                          setActiveModal({ type: "buy", data: quote })
                        }
                        className="bg-green-500 border-2 border-black font-black px-4 py-1 text-black hover:bg-green-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        BUY
                      </button>
                      <button
                        onClick={() => handleBuyLead(quote, 0)}
                        className="bg-blue-500 border-2 border-black font-black px-4 py-1 text-white hover:bg-blue-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        RECYCLE
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      {activeModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-8 border-black p-8 max-w-md w-full shadow-[20px_20px_0px_0px_rgba(255,255,255,0.2)]">
            {/* 1. BUY LEAD MODAL */}
            {activeModal.type === "buy" && (
              <>
                <h2 className="text-3xl font-black uppercase mb-4 italic text-black">
                  Purchase Lead
                </h2>
                <p className="font-bold mb-4 text-black">
                  Buying: {activeModal.data.laptop_details}
                </p>
                <input
                  id="buyPrice"
                  type="number"
                  placeholder="$ Amount"
                  className="w-full border-4 border-black p-4 text-2xl font-black mb-6 bg-white text-black outline-none"
                />
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      handleBuyLead(
                        activeModal.data as LaptopQuote,
                        Number(
                          (
                            document.getElementById(
                              "buyPrice"
                            ) as HTMLInputElement
                          ).value
                        )
                      )
                    }
                    className="flex-1 bg-green-500 border-4 border-black p-4 font-black text-black"
                  >
                    CONFIRM
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 bg-gray-200 border-4 border-black p-4 font-black text-black"
                  >
                    CANCEL
                  </button>
                </div>
              </>
            )}

            {/* 2. PUBLISH MODAL */}
            {activeModal.type === "publish" && (
              <>
                <h2 className="text-3xl font-black uppercase mb-4 italic text-black">
                  Set Sale Price
                </h2>
                <input
                  id="pubPrice"
                  type="number"
                  placeholder="$ Sale Price"
                  className="w-full border-4 border-black p-4 text-3xl font-black mb-6 bg-white text-black"
                />
                <button
                  onClick={() =>
                    handlePublish(
                      activeModal.data.id,
                      Number(
                        (
                          document.getElementById(
                            "pubPrice"
                          ) as HTMLInputElement
                        ).value
                      )
                    )
                  }
                  className="w-full bg-blue-600 text-white border-4 border-black p-4 font-black text-xl uppercase"
                >
                  Go Live
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-4 font-bold text-gray-400 uppercase text-xs"
                >
                  Cancel
                </button>
              </>
            )}

            {/* 3. SPECS & DIAGNOSTICS MODAL */}
            {activeModal.type === "specs" && (
              <>
                <h2 className="text-3xl font-black uppercase mb-4 italic text-black">
                  Health Check
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">
                      CPU
                    </label>
                    <input
                      id="m_cpu"
                      defaultValue={activeModal.data.cpu}
                      className="w-full border-2 border-black p-2 font-bold bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                      Battery Health %
                    </label>
                    <input
                      id="m_bat"
                      defaultValue={activeModal.data.battery_health}
                      className="w-full border-2 border-black p-2 font-black text-green-700 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                      SSD Health %
                    </label>
                    <input
                      id="m_ssd"
                      defaultValue={activeModal.data.ssd_health}
                      className="w-full border-2 border-black p-2 font-black text-blue-700 bg-white"
                    />
                  </div>
                </div>
                <button
                  onClick={() =>
                    saveSpecs(activeModal.data.id, {
                      cpu: (
                        document.getElementById("m_cpu") as HTMLInputElement
                      ).value,
                      battery_health: (
                        document.getElementById("m_bat") as HTMLInputElement
                      ).value,
                      ssd_health: (
                        document.getElementById("m_ssd") as HTMLInputElement
                      ).value,
                    })
                  }
                  className="w-full bg-yellow-400 border-4 border-black p-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black"
                >
                  Save & Update
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-4 font-bold text-gray-400 uppercase text-xs"
                >
                  Close without saving
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
