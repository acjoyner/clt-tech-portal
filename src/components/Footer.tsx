import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t-8 border-black pt-16 pb-8 px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        
        {/* BRAND COLUMN */}
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-black italic uppercase leading-none">
            CLT <span className="text-blue-600">SYSTEMS</span>
          </h2>
          <p className="font-bold text-lg max-w-sm">
            Charlotte&apos;s premier tech refurbishment portal. We buy, sell, and repair with transparency.
          </p>
          <div className="flex gap-4 mt-2">
            {/* Simple Social Icons - Represented by Boxes in Neobrutalism */}
            <div className="w-10 h-10 bg-black flex items-center justify-center hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer border-2 border-black">
               <span className="text-white font-black text-xs italic">IG</span>
            </div>
            <div className="w-10 h-10 bg-blue-600 flex items-center justify-center hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer border-2 border-black">
               <span className="text-white font-black text-xs italic">FB</span>
            </div>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-black uppercase underline decoration-blue-600 underline-offset-4">Portal</h3>
          <nav className="flex flex-col gap-2 font-bold uppercase">
            <Link href="/inventory" className="hover:text-blue-600 transition-colors w-fit">Shop Inventory</Link>
            <Link href="/profile" className="hover:text-blue-600 transition-colors w-fit">Track Repair</Link>
            <Link href="/#quote" className="hover:text-blue-600 transition-colors w-fit">Get a Quote</Link>
            <Link href="/login" className="hover:text-blue-600 transition-colors w-fit">User Login</Link>
          </nav>
        </div>

        {/* LEGAL & LOCATION */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-black uppercase underline decoration-blue-600 underline-offset-4">Location</h3>
          <p className="font-bold uppercase">
            Operating out of<br />
            Charlotte, NC 28202<br />
            <span className="text-blue-600">Mon-Fri: 9am - 6pm</span>
          </p>
          <div className="flex flex-col gap-2 font-bold text-sm text-gray-500 uppercase">
            <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-black">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="max-w-7xl mx-auto border-t-4 border-black pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-black uppercase text-xs">
          © {currentYear} CLT SYSTEMS. ALL RIGHTS RESERVED.
        </p>
        <p className="font-black uppercase text-xs bg-yellow-400 px-2 border-2 border-black">
          Built in the Queen City
        </p>
      </div>
    </footer>
  );
}