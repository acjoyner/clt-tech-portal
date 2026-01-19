"use client";
import { useEffect, useState } from "react";
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
  cpu?: string;
  battery_health?: string;
}

interface LaptopQuote {
  last_active: string | null;
  id: number;
  customer_name: string;
  email: string;
  laptop_details: string;
  status: string;
  repair_status?: string;
  notes?: string;
  lead_origin?: string;
}

type ModalState =
  | { type: "specs"; data: InventoryItem }
  | { type: "publish"; data: InventoryItem }
  | { type: "notes"; data: LaptopQuote };

export default function AdminDashboard() {
  const [quotes, setQuotes] = useState<LaptopQuote[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalState | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // --- Data Fetching ---
  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || session.user.email !== "anthony.c.joyner@gmail.com") {
        router.push("/login");
        return;
      }
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

  // --- Handlers ---
  const updateRepairStatus = async (
    id: number,
    newRepairStatus: string,
    quote: LaptopQuote
  ) => {
    const { error: dbError } = await supabase
      .from("quotes")
      .update({
        repair_status: newRepairStatus,
        status: "active",
        last_active: new Date().toISOString(),
      })
      .eq("id", id);

    if (!dbError) {
      setRefreshSignal((s) => s + 1);
      fetch("/api/status-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: quote.email ?? "",
          customerName: quote.customer_name ?? "Customer",
          device: quote.laptop_details ?? "Device",
          status: newRepairStatus,
        }),
      }).catch(() => console.warn("Email blocked, but DB updated."));
    }
  };

  const archiveRepair = async (id: number) => {
    const { error } = await supabase
      .from("quotes")
      .update({ status: "completed" })
      .eq("id", id);
    if (!error) setRefreshSignal((s) => s + 1);
  };

  const saveNotes = async (id: number, notes: string) => {
    const { error } = await supabase
      .from("quotes")
      .update({ notes, last_active: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      setRefreshSignal((s) => s + 1);
      setActiveModal(null);
    }
  };

  const saveSpecs = async (id: number, updates: Partial<InventoryItem>) => {
    const { error } = await supabase
      .from("inventory")
      .update(updates)
      .eq("id", id);
    if (!error) {
      setRefreshSignal((s) => s + 1);
      setActiveModal(null);
    }
  };

  const exportProfits = () => {
    const soldItems = inventory.filter((i) => i.status === "sold");
    const csvRows = [
      ["Model", "Cost", "Sale", "Profit"],
      ...soldItems.map((i) => [
        `${i.brand} ${i.model}`,
        i.purchase_price,
        i.sale_price_listing,
        (i.sale_price_listing || 0) - i.purchase_price,
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "clt_systems_profits.csv");
    document.body.appendChild(link);
    link.click();
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return "New";
    const now = new Date();
    const updated = new Date(dateString);
    const diffInMin = Math.floor((now.getTime() - updated.getTime()) / 60000);
    if (diffInMin < 60) return `${diffInMin}m ago`;
    const diffInHrs = Math.floor(diffInMin / 60);
    if (diffInHrs < 24) return `${diffInHrs}h ago`;
    return `${Math.floor(diffInHrs / 24)}d ago`;
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
      console.error("Publishing failed:", error.message);
    }
  };

  const soldHistory = inventory.filter((item) => item.status === "sold");
  const netProfit = soldHistory.reduce(
    (acc, item) => acc + ((item.sale_price_listing || 0) - item.purchase_price),
    0
  );

  if (loading)
    return (
      <div className="p-20 font-black uppercase text-center">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen text-black">
      {/* DEBUG STRIP */}
      <div className="mb-8 p-4 border-4 border-dashed border-red-500 bg-red-50 flex gap-6 font-mono text-xs overflow-x-auto">
        <div className="font-black uppercase">Debug Info:</div>
        <div className="text-yellow-600 font-bold">
          Pending:{" "}
          {quotes.filter((q) => q.status?.toLowerCase() === "pending").length}
        </div>
        <div className="text-blue-600 font-bold">
          Active:{" "}
          {quotes.filter((q) => q.status?.toLowerCase() === "active").length}
        </div>
        <div className="text-gray-400 font-bold">
          Completed:{" "}
          {quotes.filter((q) => q.status?.toLowerCase() === "completed").length}
        </div>
      </div>

      {/* NEW LEADS */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-4 uppercase italic text-yellow-600 underline leading-none">
          New Quote Leads
        </h2>
        <div className="border-4 border-black overflow-x-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-yellow-100 border-b-4 border-black font-black uppercase text-sm">
              <tr>
                <th className="p-4">Customer & Origin</th>
                <th className="p-4">Device Details</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes
                .filter((q) => q.status?.toLowerCase() === "pending")
                .map((quote) => (
                  <tr key={quote.id} className="border-b-2 border-black">
                    <td className="p-4">
                      <span className="font-bold block">
                        {quote.customer_name}
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        {quote.email}
                      </span>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase">
                        {quote.lead_origin || "Unknown"}
                      </span>
                    </td>
                    <td className="p-4">{quote.laptop_details}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          updateRepairStatus(quote.id, "diagnosing", quote)
                        }
                        className="bg-black text-white px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]"
                      >
                        Approve & Start
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ACTIVE WORKBENCH */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-4 uppercase italic text-blue-700 underline leading-none">
          Active Workbench
        </h2>
        <div className="border-4 border-black overflow-x-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-100 border-b-4 border-black font-black uppercase text-sm">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Device</th>
                <th className="p-4 text-center">Status & Logs</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes
                .filter((q) => q.status?.toLowerCase() === "active")
                .map((quote) => (
                  <tr key={quote.id} className="border-b-2 border-black">
                    <td className="p-4 font-bold">{quote.customer_name}</td>
                    <td className="p-4 text-xs">{quote.laptop_details}</td>
                    <td className="p-4">
                      <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                        <select
                          defaultValue={quote.repair_status || "pending"}
                          onChange={(e) =>
                            updateRepairStatus(quote.id, e.target.value, quote)
                          }
                          className="border-2 border-black p-1 font-black uppercase text-[10px] bg-white"
                        >
                          <option value="pending">Diagnosing</option>
                          <option value="parts">Waiting for Parts</option>
                          <option value="fixing">On Bench</option>
                          <option value="ready">Ready for Pickup</option>
                        </select>
                        <button
                          onClick={() =>
                            setActiveModal({ type: "notes", data: quote })
                          }
                          className="bg-yellow-400 border-2 border-black px-2 py-1 font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          Logs {quote.notes ? "●" : ""}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => archiveRepair(quote.id)}
                        className="bg-green-500 border-2 border-black px-2 py-1 font-black text-[10px] uppercase text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-600 transition-colors"
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* REFURB PIPELINE */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-4 uppercase italic text-green-700 underline">
          Refurb Pipeline
        </h2>
        <div className="border-4 border-black overflow-x-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-100 border-b-4 border-black font-black uppercase text-sm">
              <tr>
                <th className="p-4">Model</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory
                .filter(
                  (i) =>
                    i.status !== "sold" &&
                    i.status?.toLowerCase() !== "for_sale"
                )
                .map((item) => (
                  <tr key={item.id} className="border-b-2 border-black">
                    <td className="p-4 font-black italic">
                      {item.brand} {item.model}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() =>
                          setActiveModal({ type: "specs", data: item })
                        }
                        className="bg-yellow-400 border-2 border-black px-2 py-1 font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Specs
                      </button>
                      <button
                        onClick={() =>
                          setActiveModal({ type: "publish", data: item })
                        }
                        className="bg-blue-600 text-white px-4 py-1 font-black text-xs border-2 border-black"
                      >
                        Publish
                      </button>
                      <button
                        onClick={() => setItemToDelete(item.id)}
                        className="bg-red-500 text-white px-2 py-1 font-black text-[10px] uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Delete
                      </button>
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
          <h2 className="text-3xl font-black uppercase italic leading-none underline">
            Profit History
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={exportProfits}
              className="bg-blue-600 text-white border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 transition-all"
            >
              Download CSV
            </button>
            <div className="bg-green-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-xs font-black uppercase block leading-none mb-1">
                Net Profit
              </span>
              <span className="text-3xl font-black">
                ${netProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className="border-4 border-black overflow-x-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white text-black">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-black text-white font-black uppercase text-sm">
              <tr>
                <th className="p-4">Model</th>
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

      {/* MASTER MODAL SYSTEM */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 text-black">
          <div className="bg-white border-8 border-black p-8 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            {/* LOGS MODAL */}
            {activeModal.type === "notes" && (
              <>
                <h2 className="text-3xl font-black uppercase mb-2 italic">
                  Internal Logs
                </h2>
                <p className="text-xs font-bold text-blue-600 mb-2 uppercase">
                  Customer: {activeModal.data.customer_name}
                </p>
                <div className="mb-4 text-[10px] font-mono bg-gray-100 p-2 border-2 border-black max-h-24 overflow-y-auto">
                  <strong>History:</strong>{" "}
                  {activeModal.data.notes || "No previous logs."}
                </div>
                <textarea
                  id="m_notes"
                  defaultValue={activeModal.data.notes}
                  className="w-full border-4 border-black p-4 font-bold min-h-[150px] mb-6 focus:bg-yellow-50 outline-none text-black"
                  placeholder="Type new updates here..."
                />
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      saveNotes(
                        activeModal.data.id,
                        (document.getElementById("m_notes") as HTMLInputElement)
                          .value
                      )
                    }
                    className="flex-1 bg-black text-white p-4 font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] active:shadow-none transition-all"
                  >
                    Save Update
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 border-4 border-black font-black uppercase text-black"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {/* SPECS MODAL */}
            {activeModal.type === "specs" && (
              <>
                <h2 className="text-3xl font-black uppercase mb-4 italic">
                  Health Check
                </h2>
                <div className="space-y-4 mb-6 text-black">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">
                      CPU
                    </label>
                    <input
                      id="m_cpu"
                      defaultValue={activeModal.data.cpu}
                      className="w-full border-2 border-black p-2 font-bold text-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">
                      Battery %
                    </label>
                    <input
                      id="m_battery"
                      defaultValue={activeModal.data.battery_health}
                      className="w-full border-2 border-black p-2 font-bold text-black"
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
                        document.getElementById("m_battery") as HTMLInputElement
                      ).value,
                    })
                  }
                  className="w-full bg-yellow-400 border-4 border-black p-4 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  Save Specs
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-4 font-bold text-gray-400 uppercase text-xs text-black"
                >
                  Close
                </button>
              </>
            )}

            {/* PUBLISH MODAL */}
            {activeModal.type === "publish" && (
              <>
                <h2 className="text-3xl font-black uppercase mb-4 italic">
                  Set Sale Price
                </h2>
                <input
                  id="pubPrice"
                  type="number"
                  placeholder="$ Price"
                  className="w-full border-4 border-black p-4 text-3xl font-black mb-6 text-black"
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
                  className="w-full bg-blue-600 text-white border-4 border-black p-4 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  Go Live
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-4 font-bold text-gray-400 uppercase text-xs text-black"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
