import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

const ContactPage = () => {
  const { success } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    success('Message sent! Our support team will get in touch with you shortly.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
          Get in Touch
        </span>
        <h1 className="text-4xl font-black text-stone-900 tracking-tight">
          Farmer & Customer Support
        </h1>
        <p className="text-sm text-stone-500">
          Have inquiries regarding bulk farm orders, organic certification, or producer partnerships? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto">
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-900 to-stone-900 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
            <div className="space-y-4 text-xs text-stone-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@farm2door.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>+91 98000 00001 (Mon-Sat, 8 AM - 7 PM)</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Farm2Door Agro Network, Pune & Nashik Agricultural Zone</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-xs leading-relaxed text-stone-300">
            "Direct trade isn't merely an e-commerce platform — it's an economic movement for rural empowerment."
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-brand-600 mx-auto" />
              <h3 className="text-lg font-bold text-stone-900">Message Received</h3>
              <p className="text-xs text-stone-500">Thank you for reaching out. A representative will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Priya Sundaram"
                  className="w-full text-sm rounded-xl border border-stone-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full text-sm rounded-xl border border-stone-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="General Query / Producer Partnership"
                  className="w-full text-sm rounded-xl border border-stone-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we assist you today?"
                  className="w-full text-sm rounded-xl border border-stone-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
