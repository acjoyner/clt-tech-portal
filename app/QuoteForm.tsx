'use client';
import React, { useState } from 'react';
import { supabase } from '../src/lib/supabase';

export default function QuoteForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    serviceType: 'sell',
    method: 'local',
    brand: '',
    model: '',
    specs: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // We map your state to the exact column names in your SQL table
    const { data, error } = await supabase
      .from('quotes')
      .insert([
        { 
          customer_name: formData.name, 
          email: formData.email,
          service_type: formData.serviceType,
          laptop_details: `${formData.brand} ${formData.model} - ${formData.specs}`,
          method: formData.method,
          status: 'new'
        }
      ]);

    if (error) {
      console.error("Supabase Error:", error.message);
      alert("Error: " + error.message);
    } else {
      alert("Success! Your quote request has been sent.");
      // Optional: Clear form
    }
  };

  // Reusable Tailwind class for dark, visible text
  const inputClass = "w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none";

 return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-black uppercase text-xs mb-2">I want to:</label>
          <select className="w-full border-4 border-black p-4 font-bold bg-white text-black outline-none focus:bg-yellow-50">
            <option>Sell my Laptop for Cash</option>
            <option>Recycle for Free</option>
          </select>
        </div>
        <div>
          <label className="block font-black uppercase text-xs mb-2">Location:</label>
          <select className="w-full border-4 border-black p-4 font-bold bg-white text-black outline-none focus:bg-yellow-50">
            <option>Local Drop-off (Charlotte, NC)</option>
            <option>Mail-in (Nationwide)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block font-black uppercase text-xs mb-2">Device Details</label>
        <input 
          type="text" 
          placeholder="Brand (e.g. Dell, Apple)" 
          className="w-full border-4 border-black p-4 font-bold mb-4 bg-white text-black placeholder:text-gray-400 outline-none focus:bg-blue-50"
        />
        <input 
          type="text" 
          placeholder="Model Name/Number" 
          className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-400 outline-none focus:bg-blue-50"
        />
      </div>

      <div>
        <label className="block font-black uppercase text-xs mb-2">Specs & Condition</label>
        <textarea 
          rows={4}
          placeholder="CPU, RAM, Storage & any issues..." 
          className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-400 outline-none focus:bg-blue-50"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="text" placeholder="Your Name" className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-400 outline-none focus:bg-blue-50" />
        <input type="email" placeholder="Email Address" className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-400 outline-none focus:bg-blue-50" />
      </div>

      <button className="w-full bg-blue-600 text-white border-4 border-black py-6 font-black uppercase text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
        Submit Quote Request
      </button>
    </form>
  );
}