import { Link } from "react-router-dom";
import { Home, Building2, TreePine, KeyRound } from "lucide-react";
import usePageTitle from "../hooks/usePageTitle";

const SERVICES = [
  { icon: KeyRound, title: "Rental homes", text: "Flats, independent houses, villas, studios and PGs, with rent, deposit, furnishing and move-in date upfront.", link: "/properties?type=rent&category=apartment", cta: "Browse rentals" },
  { icon: Home, title: "Homes for sale", text: "Apartments, houses and villas listed directly by their owners.", link: "/properties?type=buy", cta: "Browse homes for sale" },
  { icon: Building2, title: "Commercial spaces", text: "Offices, shops, warehouses and restaurants to rent or buy.", link: "/properties?category=office", cta: "Browse commercial" },
  { icon: TreePine, title: "Land & plots", text: "Residential, commercial, agricultural and farmhouse plots.", link: "/properties?category=residential_plot", cta: "Browse plots" },
];

export default function Services() {
  usePageTitle("Services");
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <span className="inline-block bg-gray-100 rounded-full px-4 py-1 text-sm font-medium text-gray-700 mb-3">What we offer</span>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Everything property, in one place</h1>
      <p className="text-lg text-gray-600 max-w-3xl mb-10">
        Whether you&apos;re looking for your next home or want to rent out your own, ProRental keeps it simple and direct.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES.map(({ icon: Icon, title, text, link, cta }) => (
          <div key={title} className="rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Icon /></span>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600 mb-4 flex-1">{text}</p>
            <Link to={link} className="text-blue-600 font-medium hover:underline w-fit">{cta} →</Link>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-blue-600 text-white p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">For owners: list for free</h2>
        <p className="text-blue-100 mb-5">Add photos and details, then get enquiries and visit requests in your dashboard.</p>
        <Link to="/add-property" className="inline-flex px-6 py-3 bg-white text-blue-700 rounded-full font-semibold">List your property</Link>
      </div>
    </div>
  );
}
