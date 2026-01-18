"use client";

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div className={`fixed bottom-10 right-10 z-50 p-6 border-4 border-black font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 animate-in fade-in slide-in-from-right-10 
      ${type === 'success' ? 'bg-green-400' : 'bg-red-400'}`}>
      <span>{message}</span>
      <button onClick={onClose} className="bg-black text-white px-2 py-1 text-xs border-2 border-black">X</button>
    </div>
  );
}