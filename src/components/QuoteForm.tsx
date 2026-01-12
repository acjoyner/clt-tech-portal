'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react'; // Added ChangeEvent and FormEvent
import { supabase } from '../../src/lib/supabase';

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

  // Explicitly typing the change event to avoid "Unexpected any"
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
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
    // Inside handleSubmit...
if (!error) {
  // Trigger the email notification
  await fetch('/api/send', {
    method: 'POST',
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      details: `${formData.brand} ${formData.model}`
    }),
  });
  
  alert("Success! Your quote request has been sent.");
}

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Success! Your quote request has been sent.");
      // Clear form after success
      setFormData({
        name: '', email: '', serviceType: 'sell', method: 'local', brand: '', model: '', specs: ''
      });
    }
  };

 return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-black uppercase text-xs mb-2 text-black">I want to:</label>
          <select 
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full border-4 border-black p-4 font-bold bg-white text-black outline-none focus:bg-yellow-50"
          >
            <option value="sell">Sell my Laptop for Cash</option>
            <option value="recycle">Recycle for Free</option>
          </select>
        </div>
        <div>
          <label className="block font-black uppercase text-xs mb-2 text-black">Location:</label>
          <select 
            name="method"
            value={formData.method}
            onChange={handleChange}
            className="w-full border-4 border-black p-4 font-bold bg-white text-black outline-none focus:bg-yellow-50"
          >
            <option value="local">Local Drop-off (Charlotte, NC)</option>
            <option value="mail">Mail-in (Nationwide)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block font-black uppercase text-xs mb-2 text-black">Device Details</label>
        <input 
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          type="text" 
          placeholder="Brand (e.g. Dell, Apple)" 
          className="w-full border-4 border-black p-4 font-bold mb-4 bg-white text-black placeholder:text-gray-400 outline-none focus:bg-blue-50"
        />
        <input 
          name="model"
          value={formData.model}
          onChange={handleChange}
          type="text" 
          placeholder="Model Name/Number" 
          className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-400 outline-none focus:bg-blue-50"
        />
      </div>

      <div>
        <label className="block font-black uppercase text-xs mb-2 text-black">Specs & Condition</label>
        <textarea 
          name="specs"
          value={formData.specs}
          onChange={handleChange}
          rows={4}
          placeholder="CPU, RAM, Storage & any issues..." 
          className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-400 outline-none focus:bg-blue-50"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input 
          name="name"
          value={formData.name}
          onChange={handleChange}
          type="text" 
          placeholder="Your Name" 
          className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-400 outline-none focus:bg-blue-50" 
        />
        <input 
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email" 
          placeholder="Email Address" 
          className="w-full border-4 border-black p-4 font-bold bg-white text-black placeholder:text-gray-400 outline-none focus:bg-blue-50" 
        />
      </div>

      <button 
        type="submit"
        className="w-full bg-blue-600 text-white border-4 border-black py-6 font-black uppercase text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
      >
        Submit Quote Request
      </button>
    </form>
  );
}