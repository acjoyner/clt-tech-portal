export default function TermsOfService() {
  return (
    <div className="p-8 md:p-20 bg-white min-h-screen text-black">
      <header className="mb-16 border-b-8 border-black pb-8">
        <h1 className="text-6xl font-black uppercase italic italic leading-none">Terms of <span className="text-blue-600">Service</span></h1>
        <p className="font-bold mt-4 uppercase text-gray-500">Last Updated: January 2026</p>
      </header>

      <div className="max-w-4xl space-y-12">
        <section>
          <h2 className="text-2xl font-black uppercase mb-4 bg-yellow-400 w-fit px-2 border-2 border-black">1. Repair Risk</h2>
          <p className="font-bold leading-relaxed">
            By submitting a device to CLT SYSTEMS, you acknowledge that electronic repairs carry inherent risks. 
            We are not responsible for data loss. **Always back up your device before service.**
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black uppercase mb-4 bg-yellow-400 w-fit px-2 border-2 border-black">2. Abandoned Property</h2>
          <p className="font-bold leading-relaxed">
            Devices left for more than 60 days after a &quot;Ready for Pickup&quot; notification will be 
            considered abandoned and may be recycled or sold to cover storage and repair costs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black uppercase mb-4 bg-yellow-400 w-fit px-2 border-2 border-black">3. Payouts & Quotes</h2>
          <p className="font-bold leading-relaxed">
            All buy-back quotes are subject to physical inspection. If the device condition differs from 
            the initial submission, CLT SYSTEMS reserves the right to adjust the final payout offer.
          </p>
        </section>
      </div>
    </div>
  );
}