"use client";
import { useState } from "react";
import { supabase } from "../../src/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else alert(isSignUp ? "Check email for link!" : "Logged in!");
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white border-8 border-black p-10 max-w-md w-full shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-5xl font-black uppercase italic mb-8">
          {isSignUp ? "Join Us" : "Welcome Back"}
        </h1>
        <form onSubmit={handleAuth} className="space-y-6">
          {/* Update your input fields inside the auth form */}
          <input
            type="email"
            placeholder="Email"
            className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-600 outline-none focus:bg-blue-50"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-600 outline-none focus:bg-blue-50"
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Ensure the "Toggle" button at the bottom is also visible */}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-6 font-black uppercase text-xs text-black underline hover:text-blue-600"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Need an account? Sign Up"}
          </button>
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 font-bold uppercase text-xs underline"
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Need an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}
