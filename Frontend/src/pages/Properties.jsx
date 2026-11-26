import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal, X, ChevronLeft, ChevronRight, Search, Building, Home as HomeIcon, Castle,
  BedSingle, Users, Briefcase, Store, LandPlot, LayoutGrid, RotateCcw,
} from "lucide-react";
import PropertyCard, { PropertyCardSkeleton } from "../components/PropertyCard";
import usePageTitle from "../hooks/usePageTitle";
import { api } from "../utils/api";
import {
  AMENITIES, FURNISHING_OPTIONS, PROPERTY_CATEGORIES, MAIN_CATEGORIES, categoryLabel, formatCompactPrice, labelOf,
} from "../utils/property";

const PAGE_SIZE = 12;

const QUICK_CATEGORIES = [
  { value: "", label: "All", icon: LayoutGrid },
  { value: "apartment", label: "Apartments", icon: Building },
  { value: "house", label: "Houses", icon: HomeIcon },
  { value: "villa", label: "Villas", icon: Castle },
  { value: "studio", label: "Studio / 1RK", icon: BedSingle },
  { value: "pg", label: "PG / Hostel", icon: Users },
  { value: "office", label: "Offices", icon: Briefcase },
  { value: "retail", label: "Shops", icon: Store },
  { value: "residential_plot", label: "Plots", icon: LandPlot },
];

// One-tap budget ranges; rent is monthly, sale is total price
const BUDGETS = {
  rent: [
    { label: "Under ₹10k", max: 10000 },
    { label: "₹10k – 20k", min: 10000, max: 20000 },
    { label: "₹20k – 40k", min: 20000, max: 40000 },
    { label: "₹40k+", min: 40000 },
  ],
  buy: [
    { label: "Under ₹25L", max: 2500000 },
    { label: "₹25L – 50L", min: 2500000, max: 5000000 },
    { label: "₹50L – 1Cr", min: 5000000, max: 10000000 },
    { label: "₹1Cr+", min: 10000000 },
  ],
};

const POPULAR_AMENITIES = ["Parking", "Power Backup", "Security", "Air Conditioning", "Elevator", "Gym", "Balcony", "Swimming Pool"];
const ALL_AMENITIES = new Set(Object.values(AMENITIES).flat());

const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition";

function FilterSection({ title, children }) {
  return (
    <fieldset className="py-5 border-b border-gray-100 last:border-0">
      <legend className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">{title}</legend>
      {children}
    </fieldset>
  );
}

function Chip({ active, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-gray-200">
      <svg viewBox="0 0 200 140" className="w-48 mx-auto mb-6" aria-hidden="true">
        <ellipse cx="100" cy="128" rx="80" ry="8" fill="#f3f4f6" />
        <path d="M40 70 L100 28 L160 70 V125 H40 Z" fill="#eff6ff" stroke="#93c5fd" strokeWidth="3" strokeLinejoin="round" />
        <rect x="86" y="88" width="28" height="37" rx="3" fill="#bfdbfe" />
        <rect x="55" y="80" width="20" height="18" rx="3" fill="#dbeafe" />
        <rect x="125" y="80" width="20" height="18" rx="3" fill="#dbeafe" />
        <circle cx="150" cy="40" r="18" fill="white" stroke="#2563eb" strokeWidth="4" />
        <line x1="163" y1="53" x2="178" y2="68" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
        <path d="M143 40 h14" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No properties match your search</h2>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">Try a wider budget, fewer amenities, or a different area.</p>
      <button onClick={onReset} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800">
        <RotateCcw size={16} /> Reset filters
      </button>
    </div>
  );
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  // First, last, and a window around the current page, with gaps as "…"
  const nums = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const items = nums.flatMap((n, i) => (i > 0 && n - nums[i - 1] > 1 ? ["gap" + n, n] : [n]));

  const btn = "min-w-10 h-10 px-3 rounded-full text-sm font-medium flex items-center justify-center transition-colors";
  return (
    <nav className="flex items-center justify-center gap-1.5 mt-12" aria-label="Pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className={`${btn} border border-gray-200 hover:bg-gray-50 disabled:opacity-40`} aria-label="Previous page">
        <ChevronLeft size={18} />
      </button>
      {items.map((n) =>
        typeof n === "string" ? (
          <span key={n} className="px-1 text-gray-400">…</span>
        ) : (
          <button key={n} onClick={() => onChange(n)} aria-current={n === page ? "page" : undefined} className={`${btn} ${n === page ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-700"}`}>
            {n}
          </button>
        )
      )}
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className={`${btn} border border-gray-200 hover:bg-gray-50 disabled:opacity-40`} aria-label="Next page">
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type") || "";
  const heading = type === "rent" ? "Homes for rent" : type === "buy" ? "Properties for sale" : "All properties";
  usePageTitle(heading);

  const [data, setData] = useState({ listings: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [retry, setRetry] = useState(0);

  const queryString = searchParams.toString();
  const get = (key) => searchParams.get(key) || "";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const params = new URLSearchParams(queryString);
    params.set("limit", String(PAGE_SIZE));
    api(`/api/listings?${params}`)
      .then((res) => !cancelled && setData(res))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [queryString, retry]);

  // Keep the search box in sync when the URL changes (navbar links, back button)
  useEffect(() => setQuery(searchParams.get("q") || ""), [searchParams]);

  // Lock page scroll while the mobile filter drawer is open
  useEffect(() => {
    if (!showFilters) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showFilters]);

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === "" || value == null) next.delete(key);
      else next.set(key, String(value));
    }
    if (!("page" in changes)) next.delete("page"); // filter changes go back to page 1
    setSearchParams(next);
  };

  const selectedAmenities = get("amenities").split(",").filter(Boolean);
  const toggleAmenity = (amenity) => {
    const next = selectedAmenities.includes(amenity) ? selectedAmenities.filter((a) => a !== amenity) : [...selectedAmenities, amenity];
    updateParams({ amenities: next.join(",") });
  };

  const budgets = BUDGETS[type] || BUDGETS.rent;
  const isBudget = (b) => get("minPrice") === String(b.min ?? "") && get("maxPrice") === String(b.max ?? "");

  // Active filter chips shown above the results
  const active = [];
  if (get("q")) active.push({ key: "q", label: `“${get("q")}”`, clear: { q: "" } });
  if (get("category")) active.push({ key: "category", label: categoryLabel(get("category")), clear: { category: "" } });
  if (get("minPrice") || get("maxPrice")) {
    const min = Number(get("minPrice")), max = Number(get("maxPrice"));
    const label = min && max ? `${formatCompactPrice(min)} – ${formatCompactPrice(max)}` : min ? `${formatCompactPrice(min)}+` : `Under ${formatCompactPrice(max)}`;
    active.push({ key: "price", label, clear: { minPrice: "", maxPrice: "" } });
  }
  if (get("bedrooms")) active.push({ key: "bedrooms", label: `${get("bedrooms")}+ BHK`, clear: { bedrooms: "" } });
  if (get("furnishing")) active.push({ key: "furnishing", label: labelOf(FURNISHING_OPTIONS, get("furnishing")), clear: { furnishing: "" } });
  selectedAmenities.forEach((a) =>
    active.push({ key: `a-${a}`, label: a, clear: { amenities: selectedAmenities.filter((x) => x !== a).join(",") } })
  );

  const filterCount = active.filter((f) => f.key !== "q").length;
  const resetFilters = () => setSearchParams(type ? { type } : {});

  const goToPage = (page) => {
    updateParams({ page: page > 1 ? page : "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filters = (
    <div>
      <FilterSection title={`Budget${type === "rent" ? " / month" : ""}`}>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {budgets.map((b) => (
            <Chip key={b.label} active={isBudget(b)} onClick={() => updateParams(isBudget(b) ? { minPrice: "", maxPrice: "" } : { minPrice: b.min ?? "", maxPrice: b.max ?? "" })}>
              {b.label}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input type="number" min="0" inputMode="numeric" placeholder="Min ₹" aria-label="Minimum price" className={inputClass} defaultValue={get("minPrice")} key={`min-${get("minPrice")}`} onBlur={(e) => e.target.value !== get("minPrice") && updateParams({ minPrice: e.target.value })} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
          <span className="text-gray-400">–</span>
          <input type="number" min="0" inputMode="numeric" placeholder="Max ₹" aria-label="Maximum price" className={inputClass} defaultValue={get("maxPrice")} key={`max-${get("maxPrice")}`} onBlur={(e) => e.target.value !== get("maxPrice") && updateParams({ maxPrice: e.target.value })} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
        </div>
      </FilterSection>

      <FilterSection title="Bedrooms">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {["", "1", "2", "3", "4"].map((b) => (
            <button
              key={b || "any"}
              type="button"
              onClick={() => updateParams({ bedrooms: b })}
              aria-pressed={get("bedrooms") === b}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${get("bedrooms") === b ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              {b ? `${b}+` : "Any"}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Property type">
        <select className={inputClass} value={get("category")} onChange={(e) => updateParams({ category: e.target.value })} aria-label="Property type">
          <option value="">Any type</option>
          {MAIN_CATEGORIES.map((main) => (
            <optgroup key={main.value} label={main.label}>
              {PROPERTY_CATEGORIES[main.value].map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </optgroup>
          ))}
        </select>
      </FilterSection>

      {type !== "buy" && (
        <FilterSection title="Furnishing">
          <div className="flex flex-wrap gap-2">
            {FURNISHING_OPTIONS.map((o) => (
              <Chip key={o.value} active={get("furnishing") === o.value} onClick={() => updateParams({ furnishing: get("furnishing") === o.value ? "" : o.value })}>
                {o.label}
              </Chip>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Amenities">
        <div className="flex flex-wrap gap-2">
          {[...new Set([...POPULAR_AMENITIES, ...selectedAmenities])].filter((a) => ALL_AMENITIES.has(a)).map((a) => (
            <Chip key={a} active={selectedAmenities.includes(a)} onClick={() => toggleAmenity(a)}>{a}</Chip>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 text-white">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-20">
          <nav className="text-sm text-white/60 mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white">Home</Link> <span className="mx-1.5">/</span> <span className="text-white/90">{heading}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{heading}</h1>
              <p className="text-white/70 mt-2">
                {loading ? "Finding properties..." : `${data.total.toLocaleString("en-IN")} ${data.total === 1 ? "property" : "properties"} listed directly by owners`}
              </p>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur rounded-full p-1 w-fit ring-1 ring-white/15">
              {[{ v: "rent", l: "Rent" }, { v: "buy", l: "Buy" }, { v: "", l: "All" }].map(({ v, l }) => (
                <button key={l} onClick={() => updateParams({ type: v, minPrice: "", maxPrice: "" })} aria-pressed={type === v} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${type === v ? "bg-white text-gray-900 shadow" : "text-white/80 hover:text-white"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative">
        {/* Floating search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ q: query.trim() });
          }}
          className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-2 flex gap-2"
        >
          <label htmlFor="search-q" className="sr-only">Search by city, locality or title</label>
          <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
            <Search size={20} className="text-gray-400 shrink-0" />
            <input id="search-q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search city, locality or project…" className="w-full py-2.5 outline-none text-gray-900 placeholder:text-gray-400 bg-transparent" />
            {query && (
              <button type="button" onClick={() => { setQuery(""); updateParams({ q: "" }); }} aria-label="Clear search" className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                <X size={16} />
              </button>
            )}
          </div>
          <button type="button" onClick={() => setShowFilters(true)} className="lg:hidden relative inline-flex items-center gap-2 px-4 rounded-xl border border-gray-200 text-gray-700" aria-label="Show filters">
            <SlidersHorizontal size={18} />
            {filterCount > 0 && <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center">{filterCount}</span>}
          </button>
          <button type="submit" className="px-5 sm:px-7 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">Search</button>
        </form>

        {/* Quick category chips */}
        <div className="flex gap-2 overflow-x-auto py-5 -mx-4 px-4 [scrollbar-width:none]" role="group" aria-label="Property categories">
          {QUICK_CATEGORIES.map(({ value, label, icon: Icon }) => {
            const isActive = get("category") === value;
            return (
              <button
                key={label}
                onClick={() => updateParams({ category: value })}
                aria-pressed={isActive}
                className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  isActive ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-8 pb-8">
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm ring-1 ring-black/5 px-5 py-2">
              <div className="flex items-center justify-between pt-3">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2"><SlidersHorizontal size={16} /> Filters</h2>
                {filterCount > 0 && <button onClick={resetFilters} className="text-xs font-medium text-blue-600 hover:underline">Reset</button>}
              </div>
              {filters}
            </div>
          </aside>

          {/* Mobile filter drawer */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-[120] bg-black/40" onClick={() => setShowFilters(false)}>
              <div role="dialog" aria-modal="true" aria-label="Filters" className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Filters</h2>
                  <button onClick={() => setShowFilters(false)} aria-label="Close filters" className="p-1.5 rounded-full hover:bg-gray-100"><X size={20} /></button>
                </div>
                <div className="overflow-y-auto px-5">{filters}</div>
                <div className="flex gap-3 p-4 border-t border-gray-100">
                  <button onClick={resetFilters} className="px-5 py-3 rounded-full border border-gray-200 font-medium">Reset</button>
                  <button onClick={() => setShowFilters(false)} className="flex-1 py-3 rounded-full bg-gray-900 text-white font-medium">
                    {loading ? "Searching..." : `Show ${data.total} ${data.total === 1 ? "property" : "properties"}`}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex flex-wrap items-center gap-2 min-h-8">
                {active.length > 0 ? (
                  <>
                    {active.map((f) => (
                      <button key={f.key} onClick={() => updateParams(f.clear)} className="inline-flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100" aria-label={`Remove filter ${f.label}`}>
                        {f.label} <X size={14} />
                      </button>
                    ))}
                    {active.length > 1 && <button onClick={() => setSearchParams(type ? { type } : {})} className="text-xs text-gray-500 hover:text-gray-900 underline">Clear all</button>}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">{loading ? "Loading…" : `Showing ${data.listings.length} of ${data.total}`}</p>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-500">
                Sort by
                <select className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={get("sort") || "newest"} onChange={(e) => updateParams({ sort: e.target.value === "newest" ? "" : e.target.value })}>
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </label>
            </div>

            {error ? (
              <div className="text-center py-16 bg-white rounded-3xl">
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={() => setRetry((n) => n + 1)} className="px-5 py-2 rounded-full border border-gray-300 font-medium">Try again</button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading properties">
                {Array.from({ length: 6 }, (_, i) => <PropertyCardSkeleton key={i} />)}
              </div>
            ) : data.listings.length === 0 ? (
              <EmptyState onReset={() => { setQuery(""); setSearchParams(type ? { type } : {}); }} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {data.listings.map((listing) => <PropertyCard key={listing._id} listing={listing} />)}
                </div>
                <Pagination page={data.page} pages={data.pages} onChange={goToPage} />
              </>
            )}

            {/* Owner call-to-action */}
            <div className="mt-14 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="absolute -right-10 -bottom-16 w-64 h-64 rounded-full bg-white/10" aria-hidden="true" />
              <div className="relative">
                <h2 className="text-2xl font-bold">Own a property?</h2>
                <p className="text-blue-100 mt-1">List it for free and get enquiries straight from tenants and buyers.</p>
              </div>
              <Link to="/add-property" className="relative shrink-0 w-fit px-6 py-3 bg-white text-blue-700 rounded-full font-semibold hover:bg-blue-50 transition-colors">
                List your property
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
