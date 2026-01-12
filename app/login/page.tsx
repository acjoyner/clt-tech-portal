"use client";
import { useState } from "react";
import { supabase } from "../../src/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Toggle state
  const [message, setMessage] = useState({ text: "", isError: false });
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: "Processing...", isError: false });

    if (isSignUp) {
      // --- SIGN UP LOGIC ---
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ text: `Sign Up Failed: ${error.message}`, isError: true });
      } else if (data.user) {
        setMessage({
          text: "Check your email for a confirmation link!",
          isError: false,
        });
      }
    } else {
      // --- SIGN IN LOGIC ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ text: `Login Failed: ${error.message}`, isError: true });
      } else if (data.user) {
        setMessage({ text: "Success! Redirecting...", isError: false });
        setTimeout(() => router.push("/admin"), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white border-8 border-black p-10 max-w-md w-full shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-black uppercase italic mb-8 text-black">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>

        {message.text && (
          <div
            className={`mb-6 p-4 border-4 border-black font-black uppercase text-xs ${
              message.isError ? "bg-red-400" : "bg-green-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <input
            type="email"
            placeholder="EMAIL"
            className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-400 outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-400 outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-black text-white border-4 border-black py-4 font-black uppercase text-xl hover:bg-blue-600 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* TOGGLE BUTTON */}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage({ text: "", isError: false });
          }}
          className="w-full mt-6 font-black uppercase text-xs text-black underline hover:text-blue-600"
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Need an account? Sign Up"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/forgot-password")}
          className="w-full mt-2 font-black uppercase text-[10px] text-gray-500 hover:text-black transition-colors"
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
}
