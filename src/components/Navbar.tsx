"use client";
import Link from "next/link";
import { supabase } from "../../src/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Check authentication status on load
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-[100] bg-white border-b-8 border-black p-4 md:p-6 flex justify-between items-center">
      <Link href="/" className="font-black italic text-2xl md:text-3xl uppercase tracking-tighter hover:text-blue-600 transition-colors text-black">
        CLT <span className="text-blue-600">SYSTEMS</span>
      </Link>
      
      <div className="flex gap-2 md:gap-4 items-center">
        <Link href="/inventory" className="font-black uppercase border-4 border-black px-3 py-1 md:px-6 md:py-2 hover:bg-yellow-400 transition-all text-black text-sm md:text-base">
          Shop
        </Link>

        {/* Show Admin only if logged in as YOU */}
        {user?.email === 'anthony.c.joyner@gmail.com' && (
          <Link href="/admin" className="font-black uppercase bg-black text-white border-4 border-black px-3 py-1 md:px-6 md:py-2 hover:bg-white hover:text-black transition-all text-sm md:text-base">
            Admin
          </Link>
        )}

        {/* Dynamic Login/Logout Button */}
        {user ? (
          <button 
            onClick={handleLogout}
            className="font-black uppercase bg-red-600 text-white border-4 border-black px-4 py-1 md:px-6 md:py-2 hover:bg-white hover:text-red-600 transition-all text-sm md:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
          >
            Logout
          </button>
        ) : (
          <Link 
            href="/login" 
            className="font-black uppercase bg-blue-600 text-white border-4 border-black px-4 py-1 md:px-6 md:py-2 hover:bg-white hover:text-blue-600 transition-all text-sm md:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}