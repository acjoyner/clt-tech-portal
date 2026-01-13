export default function PrivacyPolicy() {
  return (
    <div className="p-8 md:p-20 bg-white min-h-screen text-black">
      <header className="mb-16 border-b-8 border-black pb-8">
        <h1 className="text-6xl font-black uppercase italic leading-none">Privacy <span className="text-blue-600">Policy</span></h1>
        <p className="font-bold mt-4 uppercase text-gray-500">Effective: January 2026</p>
      </header>

      <div className="max-w-4xl space-y-12">
        <section className="border-l-8 border-black pl-6">
          <h2 className="text-2xl font-black uppercase mb-4">Data Collection</h2>
          <p className="font-bold leading-relaxed">
            We collect your name, email, and device specifications to provide repair tracking and quotes. 
            We do not sell your personal data to third parties.
          </p>
        </section>

        <section className="border-l-8 border-black pl-6">
          <h2 className="text-2xl font-black uppercase mb-4">Cookies & Tracking</h2>
          <p className="font-bold leading-relaxed">
            We use Google Tag Manager and basic session cookies to analyze traffic and keep you logged 
            into your CLT SYSTEMS portal.
          </p>
        </section>

        <section className="border-l-8 border-black pl-6">
          <h2 className="text-2xl font-black uppercase mb-4">Contact</h2>
          <p className="font-bold leading-relaxed">
            For data inquiries, contact us at: <br />
            <span className="underline decoration-blue-600">anthony.c.joyner@gmail.com</span>
          </p>
        </section>
      </div>
    </div>
  );
}