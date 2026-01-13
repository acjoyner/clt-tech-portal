"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsMenuOpen(false);
    setShowWarning(false);
    router.push("/login");
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    let warnTimeout: NodeJS.Timeout;
    let logoutTimeout: NodeJS.Timeout;

    const resetTimer = () => {
      setShowWarning(false);
      clearTimeout(warnTimeout);
      clearTimeout(logoutTimeout);

      // Warn at 28 minutes (1680000 ms)
      warnTimeout = setTimeout(() => setShowWarning(true), 28 * 60 * 1000);
      // Logout at 30 minutes (1800000 ms)
      logoutTimeout = setTimeout(() => {
        handleLogout();
      }, 30 * 60 * 1000);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((name) => document.addEventListener(name, resetTimer));

    resetTimer();

    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer));
      clearTimeout(warnTimeout);
      clearTimeout(logoutTimeout);
    };
  }, [user, handleLogout]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-100 bg-white border-b-8 border-black p-4 md:p-6 flex justify-between items-center">
        <Link href="/" className="font-black italic text-2xl uppercase text-black">
          CLT <span className="text-blue-600">SYSTEMS</span>
        </Link>

        {/* BURGER ICON */}
        <button 
          className="md:hidden border-4 border-black p-1"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-6 h-1 bg-black mb-1"></div>
          <div className="w-6 h-1 bg-black mb-1"></div>
          <div className="w-6 h-1 bg-black"></div>
        </button>

        {/* NAV LINKS */}
        <div className={`${isMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row absolute md:relative top-full left-0 w-full md:w-auto bg-white border-b-8 md:border-none border-black p-6 md:p-0 gap-4 items-center`}>
          <Link href="/inventory" className="font-black uppercase text-black hover:text-blue-600">Shop</Link>
          
          {user ? (
            <>
              <Link href="/profile" className="font-black uppercase text-black border-b-4 border-black">Profile</Link>
              {user.email === "anthony.c.joyner@gmail.com" && (
                <Link href="/admin" className="bg-black text-white px-4 py-2 font-black uppercase border-4 border-black hover:bg-white hover:text-black">Admin</Link>
              )}
              <button onClick={handleLogout} className="font-black uppercase text-red-600 hover:underline">Logout</button>
            </>
          ) : (
            <Link href="/login" className="bg-blue-600 text-white border-4 border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white hover:text-blue-600">Login</Link>
          )}
        </div>
      </nav>

      {/* INACTIVITY SNACKBAR */}
      {showWarning && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-200 bg-yellow-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center animate-bounce">
          <p className="font-black uppercase text-black mb-4 text-center">
            ⚠️ Session Expiring in 2 Minutes!
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.dispatchEvent(new Event('mousedown'))} 
              className="bg-black text-white px-6 py-2 font-black uppercase border-2 border-black hover:bg-white hover:text-black transition-all">
              Stay Logged In
            </button>
            <button 
              onClick={() => setShowWarning(false)}
              className="text-xs font-bold uppercase underline">
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}