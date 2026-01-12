"use client";
import { useState } from "react";
import { supabase } from "../../src/lib/supabase";
import { useRouter } from "next/navigation";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 text-black">
      <div className="border-8 border-black p-10 max-w-md w-full shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-black uppercase mb-6 italic">New Password</h1>
        {message && <div className="mb-4 p-3 border-4 border-black bg-blue-400 font-bold">{message}</div>}
        <form onSubmit={handleUpdate} className="space-y-4">
          <input 
            type="password" 
            placeholder="ENTER NEW PASSWORD" 
            className="w-full border-4 border-black p-4 font-bold bg-white text-black outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-black text-white border-4 border-black py-4 font-black uppercase">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}