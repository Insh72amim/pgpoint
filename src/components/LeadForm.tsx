'use client';

import { useState } from 'react';
import { submitLead } from '@/actions/lead';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeadFormProps {
  pgId: string;
}

export default function LeadForm({ pgId }: LeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitLead(formData, pgId);

    if (result.success) {
      setSuccess(true);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800">Request Sent! ✅</h3>
        <p className="text-green-600 mt-2">The owner will contact you shortly.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 sticky top-24">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Interested?</h3>
      <p className="text-gray-500 mb-6 text-sm">Send your details to request a callback or schedule a visit.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            required
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            placeholder="+91 98765 43210"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Sending...' : 'Request Callback'}
        </button>
      </form>
            
      <p className="text-xs text-gray-400 mt-4 text-center">
        Your details are shared directly with the owner.
      </p>
    </div>
  );
}
