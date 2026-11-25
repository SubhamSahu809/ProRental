import { Link } from "react-router-dom";
import { BadgeIndianRupee, MessageCircle, ShieldCheck, Star } from "lucide-react";
import usePageTitle from "../hooks/usePageTitle";

const VALUES = [
  { icon: BadgeIndianRupee, title: "No brokerage", text: "Owners list for free and tenants never pay a middleman's commission." },
  { icon: MessageCircle, title: "Direct conversations", text: "Enquiries go straight to the owner's inbox, along with your visit requests." },
  { icon: Star, title: "Honest reviews", text: "Every review is tied to a real account, and owners can't review their own listings." },
  { icon: ShieldCheck, title: "Your data stays private", text: "We never show your email publicly. Owners only see the details you send them." },
];

export default function About() {
  usePageTitle("About us");
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About ProRental</h1>
      <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mb-10">
        ProRental connects people looking for a home, shop or office directly with the owners. We started it because
        finding a rental shouldn&apos;t mean paying a month&apos;s rent in brokerage or chasing listings that no longer exist.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-gray-100 shadow-sm p-6">
            <Icon className="text-blue-600 mb-3" />
            <h2 className="font-semibold text-lg text-gray-900 mb-1">{title}</h2>
            <p className="text-gray-600">{text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-gray-900 text-white p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Have a property to rent out?</h2>
          <p className="text-gray-300">List it in a few minutes, for free.</p>
        </div>
        <Link to="/add-property" className="px-6 py-3 bg-white text-gray-900 rounded-full font-semibold w-fit">List property</Link>
      </div>
    </div>
  );
}
