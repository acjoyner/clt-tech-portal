"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";



export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Watch for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="flex justify-between items-center p-6 border-b-8 border-black bg-white">
      <Link href="/" className="font-black text-2xl italic uppercase">CLT SYSTEMS</Link>
      
      <div className="flex gap-4 items-center">
        <Link href="/inventory" className="font-bold uppercase text-black">Shop</Link>

        {/* ONLY show Admin if it is YOU */}
        {user?.email === "anthony.c.joyner@gmail.com" && (
          <Link href="/admin" className="bg-black text-white px-4 py-2 font-black uppercase border-4 border-black hover:bg-white hover:text-black">
            Admin
          </Link>
        )}

       {user ? (
  <div className="flex gap-4 items-center">
    <Link 
      href="/profile" 
      className="font-black uppercase text-sm md:text-base text-black border-b-4 border-black hover:text-blue-600 transition-all"
    >
      My Profile 
     
    </Link>
    
    <button 
      onClick={handleLogout} 
      className="font-black uppercase text-sm md:text-base text-red-600 hover:bg-red-600 hover:text-white px-2 py-1 transition-all border-2 border-transparent hover:border-black"
    >
      Logout
    </button>
  </div>
) : (
  <Link 
    href="/login" 
    className="bg-blue-600 text-white border-4 border-black px-4 py-2 font-black uppercase text-sm md:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
  >
    Login
  </Link>
)}
      </div>
    </nav>
  );
}