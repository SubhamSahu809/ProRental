import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-3 text-white">
            <span className="w-8 h-8 rounded-lg bg-white text-neutral-900 flex items-center justify-center">
              <Home size={18} />
            </span>
            <span className="font-bold text-xl">ProRental</span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed">
            Find rental homes, flats and commercial spaces directly from owners. No middlemen, no hidden fees.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/properties?type=rent" className="hover:text-white">Properties for rent</Link></li>
            <li><Link to="/properties?type=buy" className="hover:text-white">Properties for sale</Link></li>
            <li><Link to="/add-property" className="hover:text-white">List your property</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white">About us</Link></li>
            <li><Link to="/services" className="hover:text-white">Services</Link></li>
            <li><Link to="/#contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-800">
        <p className="max-w-7xl mx-auto px-4 py-4 text-xs text-neutral-500">&copy; {year} ProRental. All rights reserved.</p>
      </div>
    </footer>
  );
}
