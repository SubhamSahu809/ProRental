import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none";

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

/** "Contact owner" / "Request a visit" form on the property page. */
export default function EnquiryForm({ listing }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
    email: user?.email || "",
    phone: user?.phone || "",
    message: `Hi, I'm interested in "${listing.title}". Is it still available?`,
    visitDate: "",
  });
  const [wantsVisit, setWantsVisit] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const body = { ...form, visitDate: wantsVisit && form.visitDate ? form.visitDate : "" };
      await api(`/api/listings/${listing._id}/enquiries`, { method: "POST", body });
      setStatus("sent");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="mx-auto text-green-600 mb-3" size={40} />
        <p className="font-semibold text-gray-900">Message sent!</p>
        <p className="text-sm text-gray-600 mt-1">The owner will contact you at {form.email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left">
      {error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      <div>
        <label htmlFor="enq-name" className="block text-xs font-medium text-gray-700 mb-1">Name</label>
        <input id="enq-name" name="name" value={form.name} onChange={handleChange} required className={inputClass} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="enq-email" className="block text-xs font-medium text-gray-700 mb-1">Email</label>
        <input id="enq-email" type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} autoComplete="email" />
      </div>
      <div>
        <label htmlFor="enq-phone" className="block text-xs font-medium text-gray-700 mb-1">Phone (optional)</label>
        <input id="enq-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} className={inputClass} autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="enq-message" className="block text-xs font-medium text-gray-700 mb-1">Message</label>
        <textarea id="enq-message" name="message" value={form.message} onChange={handleChange} required minLength={5} rows={3} className={`${inputClass} resize-none`} />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={wantsVisit} onChange={(e) => setWantsVisit(e.target.checked)} className="rounded border-gray-300" />
        I&apos;d like to schedule a visit
      </label>
      {wantsVisit && (
        <div>
          <label htmlFor="enq-date" className="block text-xs font-medium text-gray-700 mb-1">Preferred date</label>
          <input id="enq-date" type="date" name="visitDate" min={tomorrow()} value={form.visitDate} onChange={handleChange} required className={inputClass} />
        </div>
      )}
      <button type="submit" disabled={status === "sending"} className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60">
        {status === "sending" ? "Sending..." : wantsVisit ? "Request visit" : "Contact owner"}
      </button>
    </form>
  );
}
