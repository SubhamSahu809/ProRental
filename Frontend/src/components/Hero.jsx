import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, MessageCircle, BadgeIndianRupee } from "lucide-react";

const HIGHLIGHTS = [
  { icon: BadgeIndianRupee, title: "Zero brokerage", text: "Deal directly with owners" },
  { icon: MessageCircle, title: "Direct contact", text: "Message owners in one click" },
  { icon: ShieldCheck, title: "Honest reviews", text: "From real tenants" },
];

export default function Hero() {
  const navigate = useNavigate();
  const [type, setType] = useState("rent");
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ type });
    if (query.trim()) params.set("q", query.trim());
    navigate(`/properties?${params}`);
  };

  return (
    <section className="relative w-[calc(100%-1rem)] sm:w-[95%] max-w-7xl mt-2 sm:mt-4 mx-auto rounded-2xl md:rounded-3xl overflow-hidden text-white bg-[url('/images/hero.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />

      <div className="relative z-[2] px-5 py-12 sm:p-10 lg:p-16 max-w-3xl min-h-[480px] lg:min-h-[560px] flex flex-col justify-center">
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-tight mb-4">
          Find your next home, <br className="hidden sm:block" />
          without the broker.
        </h1>
        <p className="text-base sm:text-lg text-neutral-200 leading-relaxed mb-8 max-w-xl">
          Browse verified rental homes, flats and commercial spaces, and talk directly to the people who own them.
        </p>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-xl text-gray-900 w-full max-w-2xl">
          <div className="flex gap-1 p-1 mb-2 bg-gray-100 rounded-xl w-fit" role="tablist" aria-label="Listing type">
            {[
              { value: "rent", label: "Rent" },
              { value: "buy", label: "Buy" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={type === opt.value}
                onClick={() => setType(opt.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  type === opt.value ? "bg-black text-white" : "text-gray-600 hover:text-black"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <label htmlFor="hero-search" className="sr-only">Search by city, locality or project</label>
            <input
              id="hero-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, locality or project"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold">
              <Search size={18} /> Search
            </button>
          </div>
        </form>

        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-2xl">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
                <Icon size={20} />
              </span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-neutral-300">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
