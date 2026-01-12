"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

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
          <button onClick={() => supabase.auth.signOut()} className="font-bold uppercase text-red-600">Logout</button>
        ) : (
          <Link href="/login" className="font-bold uppercase text-blue-600">Login</Link>
        )}
      </div>
    </nav>
  );
}