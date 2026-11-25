import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "../components/PropertyCard";
import Spinner from "../components/Spinner";
import usePageTitle from "../hooks/usePageTitle";
import { api } from "../utils/api";
import { AMENITIES, FURNISHING_OPTIONS, PROPERTY_CATEGORIES, MAIN_CATEGORIES } from "../utils/property";

const FILTER_KEYS = ["q", "type", "category", "minPrice", "maxPrice", "bedrooms", "furnishing", "amenities", "sort"];
const POPULAR_AMENITIES = ["Parking", "Power Backup", "Security", "Air Conditioning", "Elevator", "Gym", "Balcony", "Swimming Pool"];

const selectClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none";

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type") || "";
  usePageTitle(type === "rent" ? "Properties for rent" : type === "buy" ? "Properties for sale" : "Properties");

  const [data, setData] = useState({ listings: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const queryString = searchParams.toString();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const params = new URLSearchParams(queryString);
    params.set("limit", "12");
    api(`/api/listings?${params}`)
      .then((res) => !cancelled && setData(res))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  // Keep the search box in sync when the URL changes (e.g. navbar links, back button)
  useEffect(() => setQuery(searchParams.get("q") || ""), [searchParams]);

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === "" || value == null) next.delete(key);
      else next.set(key, value);
    }
    if (!("page" in changes)) next.delete("page"); // any filter change resets to page 1
    setSearchParams(next);
  };

  const selectedAmenities = (searchParams.get("amenities") || "").split(",").filter(Boolean);
  const toggleAmenity = (amenity) => {
    const next = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    updateParams({ amenities: next.join(",") });
  };

  const activeFilterCount = FILTER_KEYS.filter((k) => !["q", "type", "sort"].includes(k) && searchParams.get(k)).length;
  const clearFilters = () => setSearchParams(type ? { type } : {});

  const goToPage = (page) => {
    updateParams({ page: page > 1 ? String(page) : "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filters = (
    <div className="space-y-5">
      <div>
        <label htmlFor="f-category" className="block text-sm font-medium text-gray-700 mb-1">Property type</label>
        <select id="f-category" className={selectClass} value={searchParams.get("category") || ""} onChange={(e) => updateParams({ category: e.target.value })}>
          <option value="">Any</option>
          {MAIN_CATEGORIES.map((main) => (
            <optgroup key={main.value} label={main.label}>
              {PROPERTY_CATEGORIES[main.value].map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-1">Budget (₹{type === "rent" ? " / month" : ""})</legend>
        <div className="flex gap-2">
          <input type="number" min="0" inputMode="numeric" placeholder="Min" aria-label="Minimum price" className={selectClass} defaultValue={searchParams.get("minPrice") || ""} key={`min-${searchParams.get("minPrice")}`} onBlur={(e) => updateParams({ minPrice: e.target.value })} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
          <input type="number" min="0" inputMode="numeric" placeholder="Max" aria-label="Maximum price" className={selectClass} defaultValue={searchParams.get("maxPrice") || ""} key={`max-${searchParams.get("maxPrice")}`} onBlur={(e) => updateParams({ maxPrice: e.target.value })} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
        </div>
      </fieldset>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</legend>
        <div className="flex gap-2">
          {["", "1", "2", "3", "4"].map((b) => (
            <button
              key={b || "any"}
              type="button"
              onClick={() => updateParams({ bedrooms: b })}
              aria-pressed={(searchParams.get("bedrooms") || "") === b}
              className={`flex-1 py-1.5 rounded-lg border text-sm ${
                (searchParams.get("bedrooms") || "") === b ? "bg-black text-white border-black" : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {b ? `${b}+` : "Any"}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="f-furnishing" className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
        <select id="f-furnishing" className={selectClass} value={searchParams.get("furnishing") || ""} onChange={(e) => updateParams({ furnishing: e.target.value })}>
          <option value="">Any</option>
          {FURNISHING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">Amenities</legend>
        <div className="flex flex-wrap gap-2">
          {[...new Set([...POPULAR_AMENITIES, ...selectedAmenities])].filter((a) => Object.values(AMENITIES).flat().includes(a)).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              aria-pressed={selectedAmenities.includes(a)}
              className={`px-3 py-1 rounded-full text-xs border ${
                selectedAmenities.includes(a) ? "bg-blue-50 border-blue-500 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>

      {activeFilterCount > 0 && (
        <button type="button" onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {type === "rent" ? "Properties for rent" : type === "buy" ? "Properties for sale" : "All properties"}
          </h1>
          <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit">
            {[{ v: "rent", l: "Rent" }, { v: "buy", l: "Buy" }, { v: "", l: "All" }].map(({ v, l }) => (
              <button key={l} onClick={() => updateParams({ type: v })} className={`px-4 py-1.5 rounded-full text-sm font-medium ${type === v ? "bg-black text-white" : "text-gray-700 hover:bg-gray-200"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ q: query.trim() });
          }}
          className="flex gap-2"
        >
          <label htmlFor="search-q" className="sr-only">Search</label>
          <input id="search-q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by city, locality or title" className="flex-1 min-w-0 rounded-full border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
          <button type="submit" className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700">Search</button>
          <button type="button" onClick={() => setShowFilters(true)} className="lg:hidden inline-flex items-center gap-1 px-4 py-2.5 rounded-full border border-gray-300" aria-label="Show filters">
            <SlidersHorizontal size={18} />
            {activeFilterCount > 0 && <span className="text-xs bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </form>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>
            {filters}
          </div>
        </aside>

        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-[120] bg-black/40" onClick={() => setShowFilters(false)}>
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button onClick={() => setShowFilters(false)} aria-label="Close filters" className="p-1 rounded hover:bg-gray-100"><X /></button>
              </div>
              {filters}
              <button onClick={() => setShowFilters(false)} className="mt-6 w-full py-2.5 rounded-full bg-black text-white font-medium">
                Show {data.total} results
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 gap-3">
            <p className="text-sm text-gray-600">{loading ? "Searching..." : `${data.total} ${data.total === 1 ? "property" : "properties"} found`}</p>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Sort
              <select className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm bg-white" value={searchParams.get("sort") || "newest"} onChange={(e) => updateParams({ sort: e.target.value === "newest" ? "" : e.target.value })}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </label>
          </div>

          {loading ? (
            <Spinner label="Loading properties..." />
          ) : error ? (
            <p className="text-center text-red-600 py-12">{error}</p>
          ) : data.listings.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <p className="text-gray-700 text-lg mb-2">No properties match your search.</p>
              <button onClick={clearFilters} className="text-blue-600 hover:underline">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.listings.map((listing) => <PropertyCard key={listing._id} listing={listing} />)}
              </div>

              {data.pages > 1 && (
                <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
                  <button disabled={data.page <= 1} onClick={() => goToPage(data.page - 1)} className="p-2 rounded-full border border-gray-300 disabled:opacity-40" aria-label="Previous page">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm text-gray-700 px-3">Page {data.page} of {data.pages}</span>
                  <button disabled={data.page >= data.pages} onClick={() => goToPage(data.page + 1)} className="p-2 rounded-full border border-gray-300 disabled:opacity-40" aria-label="Next page">
                    <ChevronRight size={18} />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
