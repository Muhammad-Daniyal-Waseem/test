import { useState } from 'react';
import { X, CheckCircle, Send, Loader } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface LeadMagnetFormProps {
  onClose: () => void;
}

export default function LeadMagnetForm({ onClose }: LeadMagnetFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    challenge_description: '',
    arr_range: '',
    acv: '',
    sales_cycle_days: '',
    additional_context: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!formData.challenge_description.trim()) {
        newErrors.challenge_description = 'Please describe your revenue challenge';
      } else if (formData.challenge_description.trim().length < 20) {
        newErrors.challenge_description = 'Please provide more detail (at least 20 characters)';
      }
    }

    if (currentStep === 2) {
      if (!formData.arr_range) {
        newErrors.arr_range = 'Please select your ARR range';
      }
    }

    if (currentStep === 3) {
      if (!formData.contact_name.trim()) {
        newErrors.contact_name = 'Name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.company_name.trim()) {
        newErrors.company_name = 'Company name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setError('');

    try {
      const submissionData = {
        company_name: formData.company_name,
        contact_name: formData.contact_name,
        email: formData.email,
        phone: formData.phone || null,
        challenge_description: formData.challenge_description,
        arr_range: formData.arr_range || null,
        acv: formData.acv || null,
        sales_cycle_days: formData.sales_cycle_days ? parseInt(formData.sales_cycle_days) : null,
        additional_context: formData.additional_context || null,
        status: 'new',
      };

      const { error: insertError } = await supabase
        .from('lead_magnet_submissions')
        .insert([submissionData]);

      if (insertError) throw insertError;

      const notificationData = {
        type: 'lead_magnet',
        data: submissionData,
      };

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-lead-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(notificationData),
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit. Please try emailing mdaudi@contechgtm.com directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Request Received!</h3>
            <p className="text-neutral-600 mb-6">
              Thank you for submitting your challenge. I'll review it and deliver your board-grade CRO Command Brief™ within 72 hours.
            </p>
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border-2 border-blue-600/20">
              <p className="text-sm text-neutral-700 mb-2">
                <span className="font-semibold text-neutral-900">Next Steps:</span>
              </p>
              <ul className="text-sm text-neutral-600 space-y-1 text-left ml-4">
                <li>• Check your inbox for a confirmation email</li>
                <li>• I'll reach out within 24 hours to schedule a brief discovery</li>
                <li>• You'll receive your custom memo within 72 hours</li>
              </ul>
            </div>
            <p className="text-sm text-neutral-500 mb-6">
              Want to discuss immediately?
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="#contact"
                onClick={onClose}
                className="w-full bg-contech-blue text-white py-3 rounded-lg font-semibold hover:bg-contech-blue/90 transition-all"
              >
                Book a Call Now
              </a>
              <button
                onClick={onClose}
                className="text-neutral-600 hover:text-neutral-900 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 relative shadow-2xl">
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-neutral-200 p-6 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-neutral-900">Apply for CRO Command Brief™</h2>
            <div className="text-sm font-semibold text-neutral-500">Step {step} of 3</div>
          </div>
          <div className="flex gap-2">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-contech-orange' : 'bg-neutral-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-contech-orange' : 'bg-neutral-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-contech-orange' : 'bg-neutral-200'}`}></div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  What's your #1 revenue challenge right now? *
                </label>
                <p className="text-sm text-neutral-600 mb-3">
                  Be specific. Examples: "Late-stage deals stalling at procurement", "MQLs not converting to SQLs", "NRR declining despite CS effort"
                </p>
                <textarea
                  value={formData.challenge_description}
                  onChange={(e) => setFormData({ ...formData, challenge_description: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors resize-none ${
                    errors.challenge_description ? 'border-red-500' : 'border-neutral-300 focus:border-contech-orange'
                  }`}
                  rows={6}
                  placeholder="Describe your challenge in 2-3 sentences..."
                />
                {errors.challenge_description && (
                  <p className="text-red-600 text-sm mt-1">{errors.challenge_description}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Annual Recurring Revenue (ARR) Range *
                </label>
                <select
                  value={formData.arr_range}
                  onChange={(e) => setFormData({ ...formData, arr_range: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                    errors.arr_range ? 'border-red-500' : 'border-neutral-300 focus:border-contech-orange'
                  }`}
                >
                  <option value="">Select ARR range...</option>
                  <option value="Pre-revenue">Pre-revenue</option>
                  <option value="$0-$500K">$0-$500K</option>
                  <option value="$500K-$2M">$500K-$2M</option>
                  <option value="$2M-$5M">$2M-$5M</option>
                  <option value="$5M-$10M">$5M-$10M</option>
                  <option value="$10M-$25M">$10M-$25M</option>
                  <option value="$25M+">$25M+</option>
                </select>
                {errors.arr_range && <p className="text-red-600 text-sm mt-1">{errors.arr_range}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Average Contract Value (ACV)
                </label>
                <input
                  type="text"
                  value={formData.acv}
                  onChange={(e) => setFormData({ ...formData, acv: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-contech-orange focus:outline-none transition-colors"
                  placeholder="e.g., $50K"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Sales Cycle Length (days)
                </label>
                <input
                  type="number"
                  value={formData.sales_cycle_days}
                  onChange={(e) => setFormData({ ...formData, sales_cycle_days: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-contech-orange focus:outline-none transition-colors"
                  placeholder="e.g., 90"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Additional Context (optional)
                </label>
                <textarea
                  value={formData.additional_context}
                  onChange={(e) => setFormData({ ...formData, additional_context: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-contech-orange focus:outline-none transition-colors resize-none"
                  rows={3}
                  placeholder="Any other context that would help (team size, recent changes, etc.)"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                    errors.contact_name ? 'border-red-500' : 'border-neutral-300 focus:border-contech-orange'
                  }`}
                  placeholder="John Smith"
                />
                {errors.contact_name && <p className="text-red-600 text-sm mt-1">{errors.contact_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                    errors.company_name ? 'border-red-500' : 'border-neutral-300 focus:border-contech-orange'
                  }`}
                  placeholder="Acme ConTech Inc."
                />
                {errors.company_name && <p className="text-red-600 text-sm mt-1">{errors.company_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                    errors.email ? 'border-red-500' : 'border-neutral-300 focus:border-contech-orange'
                  }`}
                  placeholder="john@acmecontech.com"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-contech-orange focus:outline-none transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="bg-neutral-50 rounded-lg p-4 border-2 border-neutral-200 mt-6">
                <p className="text-xs text-neutral-600">
                  By submitting, you agree to receive a confidential 1-page CRO Command Brief™ within 72 hours. No pitch. No obligation. NDA available upon request.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-neutral-50 rounded-b-2xl border-t border-neutral-200 p-6 flex justify-between items-center">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <a
              href="mailto:mdaudi@contechgtm.com?subject=CRO Command Brief Request"
              className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:border-neutral-400 transition-all"
            >
              Email Instead
            </a>
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-contech-orange text-white font-semibold rounded-lg hover:bg-contech-orange/90 transition-all shadow-md hover:shadow-lg"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-contech-orange text-white font-semibold rounded-lg hover:bg-contech-orange/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Request
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
