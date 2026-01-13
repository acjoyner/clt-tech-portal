"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";


interface LaptopQuote {
  id: number;
  laptop_details: string;
  status: string;
  repair_status?: string;
  email: string;
}


export default function UserProfile() {
const [user, setUser] = useState<User | null>(null);
  const [myItems, setMyItems] = useState<LaptopQuote[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      // Fetch only items belonging to THIS user via their email
      const { data } = await supabase
        .from("quotes")
        .select("*")
        .eq("email", session.user.email)
        .order("id", { ascending: false });

      if (data) setMyItems(data);
    };

    fetchUserData();
  }, [router]);

  if (!user) return <div className="p-20 font-black uppercase text-center">Loading Profile...</div>;

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <header className="mb-12 border-b-8 border-black pb-8">
        <h1 className="text-6xl font-black uppercase italic">My Account</h1>
        <p className="font-bold text-blue-600">{user.email}</p>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        {/* REPAIR & QUOTE TRACKER */}
        <section>
          <h2 className="text-3xl font-black uppercase mb-6 underline">Active Requests</h2>
          <div className="space-y-4">
            {myItems.length > 0 ? myItems.map(item => (
              <div key={item.id} className="border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black uppercase text-sm">{item.laptop_details}</p>
                    <p className="text-xs font-bold text-gray-500">Submitted: {new Date(item.id).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-black text-white px-2 py-1 text-[10px] font-black uppercase">
                    {item.repair_status || item.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="font-bold text-gray-400 italic">No items found.</p>
            )}
          </div>
        </section>

        {/* ACCOUNT ACTIONS */}
        <section className="bg-yellow-50 border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-black uppercase mb-6">Tools</h2>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => router.push('/forgot-password')}
              className="bg-white border-4 border-black p-4 font-black uppercase hover:bg-black hover:text-white transition-all text-left"
            >
              Update Password
            </button>
            <button 
              onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
              className="bg-red-500 text-white border-4 border-black p-4 font-black uppercase hover:bg-white hover:text-red-500 transition-all text-left"
            >
              Sign Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}