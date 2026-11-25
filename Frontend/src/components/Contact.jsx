import { useState } from "react";
import { api } from "../utils/api";
import { useToast } from "../context/ToastContext";

const EMPTY = { firstName: "", lastName: "", email: "", phone: "", message: "" };
const fieldClass =
  "flex-1 min-w-0 border-b border-gray-200 focus:border-black outline-none py-2 px-2 bg-transparent text-sm";

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState("");
  const toast = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const data = await api("/api/contact", { method: "POST", body: form });
      setForm(EMPTY);
      setStatus("sent");
      toast(data.message);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  return (
    <section id="contact" className="bg-cover bg-center bg-no-repeat scroll-mt-20" style={{ backgroundImage: "url(/images/contact-bg.jpg)" }}>
      <div className="bg-black/40">
        <div className="max-w-xl mx-auto flex flex-col items-center px-4 py-16">
          <span className="mb-6 px-4 py-1 rounded-full bg-white text-gray-700 text-xs font-medium shadow">Get in touch</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 leading-tight">
            LET&apos;S MAKE YOUR PROPERTY JOURNEY <br className="hidden sm:block" /> EFFORTLESS
          </h2>
          <p className="text-white text-center text-sm sm:text-base mb-8 max-w-lg">
            Questions about renting, buying or listing your property? Send us a message and we&apos;ll get back to you.
          </p>

          {status === "sent" ? (
            <div className="w-full bg-white rounded-xl shadow-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Message sent!</h3>
              <p className="text-gray-600 mb-6">Thanks for reaching out. We&apos;ll reply to your email soon.</p>
              <button onClick={() => setStatus("idle")} className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-50 text-sm font-medium">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 flex flex-col gap-4">
              {error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex flex-col sm:flex-row gap-4">
                <input name="firstName" value={form.firstName} onChange={handleChange} aria-label="First name" placeholder="First name *" required className={fieldClass} autoComplete="given-name" />
                <input name="lastName" value={form.lastName} onChange={handleChange} aria-label="Last name" placeholder="Last name" className={fieldClass} autoComplete="family-name" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <input type="email" name="email" value={form.email} onChange={handleChange} aria-label="Email" placeholder="Email *" required className={fieldClass} autoComplete="email" />
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} aria-label="Phone" placeholder="Phone" className={fieldClass} autoComplete="tel" />
              </div>
              <textarea name="message" value={form.message} onChange={handleChange} aria-label="Message" placeholder="How can we help you? *" required minLength={5} rows={3} className={`${fieldClass} resize-none`} />
              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-2 w-full bg-black text-white rounded-full py-3 font-semibold shadow hover:bg-gray-900 transition disabled:opacity-60"
              >
                {status === "sending" ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
