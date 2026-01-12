"use client";
import { useState } from "react";
import { supabase } from "../../src/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", isError: false });

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setMessage({ text: error.message, isError: true });
    } else {
      setMessage({ text: "Check your email for the reset link!", isError: false });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 text-black">
      <div className="border-8 border-black p-10 max-w-md w-full shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-black uppercase mb-6 italic">Reset Password</h1>
        {message.text && (
          <div className={`mb-4 p-3 border-4 border-black font-bold ${message.isError ? 'bg-red-400' : 'bg-green-400'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleReset} className="space-y-4">
          <input 
            type="email" 
            placeholder="YOUR EMAIL" 
            className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-400 outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white border-4 border-black py-4 font-black uppercase">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}