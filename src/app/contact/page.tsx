"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Custom Ribbon Flower Request");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        setError(data.error || "Failed to send message. Please reach us on WhatsApp.");
      }
    } catch {
      setError("Network error. Please try messaging our concierge on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1E1E1E]">
      <Navbar />

      <main className="container-main max-w-5xl pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
            ATELIER CONCIERGE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#1E1E1E] font-normal">
            Get in Touch
          </h1>
          <p className="text-xs sm:text-sm font-sans text-[#666] mt-2 max-w-lg mx-auto">
            Need a bespoke ribbon sunflower arrangement, customized anniversary hamper, or corporate gift wrapping? Our Bangalore atelier artisans are ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#EFEAE2] space-y-6">
              <h2 className="font-serif text-xl text-[#1E1E1E] font-medium">
                Atelier Headquarters
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-[#555]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1E1E1E] block font-medium">Atelier Address</strong>
                    <span>Koramangala 4th Block, 100ft Road, Bangalore, Karnataka 560034</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1E1E1E] block font-medium">Direct Telephone</strong>
                    <a href="tel:080045678923" className="hover:text-[#E10600]">
                      0 800 456 789 23
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1E1E1E] block font-medium">Concierge Email</strong>
                    <a href="mailto:concierge@happiwrapz.in" className="hover:text-[#E10600]">
                      concierge@happiwrapz.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1E1E1E] block font-medium">Operating Hours</strong>
                    <span>Monday – Saturday: 9:00 AM – 7:00 PM</span>
                    <span className="block text-[#888] text-[11px]">Sunday: By advance appointment only</span>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Action */}
              <div className="pt-4 border-t border-[#EFEAE2]">
                <a
                  href="https://wa.me/919876543210?text=Hello%20Happiwrapz!%20I%20would%20like%20to%20inquire%20about%20a%20custom%20gift."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Instant Concierge on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Zero Charge Guarantee Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#EFEAE2] flex items-start gap-3 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#E10600] shrink-0 mt-0.5" />
              <div className="text-xs text-[#555] leading-relaxed">
                <strong className="text-[#1E1E1E] block font-medium mb-0.5">
                  Artisan Direct Assurance
                </strong>
                Every inquiry is reviewed directly by our Bangalore floral artist. We guarantee response within 2 business hours.
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EFEAE2] shadow-sm">
              <h2 className="font-serif text-2xl text-[#1E1E1E] font-medium mb-1">
                Send an Atelier Message
              </h2>
              <p className="text-xs text-[#666] mb-6">
                Tell us about your occasion, gift delivery date, or custom floral arrangement specifications.
              </p>

              {success ? (
                <div className="p-8 text-center bg-[#FAF8F5] border border-[#EFEAE2] rounded-2xl space-y-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl text-[#1E1E1E]">Message Received</h3>
                  <p className="text-xs text-[#666] max-w-sm mx-auto">
                    Thank you for reaching out! Our floral concierge has logged your inquiry and will respond to your email and phone shortly.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2.5 rounded-full bg-[#1E1E1E] hover:bg-[#E10600] text-white text-xs font-serif uppercase tracking-wider font-semibold transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-serif font-medium text-[#1E1E1E] mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ananya Rao"
                        className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-medium text-[#1E1E1E] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ananya@example.com"
                        className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-serif font-medium text-[#1E1E1E] mb-1.5">
                        Phone / WhatsApp (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-medium text-[#1E1E1E] mb-1.5">
                        Subject
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white cursor-pointer"
                      >
                        <option value="Custom Ribbon Flower Request">Custom Ribbon Flower Request</option>
                        <option value="Wedding / Celebration Hampers">Wedding / Celebration Hampers</option>
                        <option value="Corporate Keepsake Gifts">Corporate Keepsake Gifts</option>
                        <option value="Delivery Date Inquiry">Delivery Date Inquiry</option>
                        <option value="Other Concierge Question">Other Concierge Question</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-serif font-medium text-[#1E1E1E] mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about the flower colors, recipient preferences, delivery window, or any custom calligraphy notes..."
                      className="w-full px-4 py-3 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#E10600] hover:bg-[#C20500] disabled:opacity-60 text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? "Sending..." : "Send Message to Atelier"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
