import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Compass,
  Award,
  CheckCircle,
  Clock,
  Save,
  AlertCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { farmerService } from '../../services/farmerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const FarmerProfilePage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    farmName: '',
    farmLocation: '',
    farmSizeAcres: '',
    experienceYears: '',
    bio: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await farmerService.getProfile();
      setProfile(data);
      setFormData({
        farmName: data.farmName || '',
        farmLocation: data.farmLocation || '',
        farmSizeAcres: data.farmSizeAcres || '',
        experienceYears: data.experienceYears || '',
        bio: data.bio || '',
      });
    } catch (err) {
      addToast('Failed to load farmer profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.farmName.trim()) {
      addToast('Farm name is required', 'error');
      return;
    }
    if (!formData.farmLocation.trim()) {
      addToast('Farm location is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        farmName: formData.farmName.trim(),
        farmLocation: formData.farmLocation.trim(),
        farmSizeAcres: formData.farmSizeAcres ? Number(formData.farmSizeAcres) : null,
        experienceYears: formData.experienceYears ? Number(formData.experienceYears) : null,
        bio: formData.bio.trim(),
      };
      const updated = await farmerService.updateProfile(payload);
      setProfile(updated);
      addToast('Farm details and bio updated successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving farm profile..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Farm Profile & Producer Story
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Tell consumers about your land, farming methods, and heritage to build trust and authenticity.
        </p>
      </div>

      {/* Verification Status Card */}
      <div
        className={`rounded-3xl p-6 border flex items-center justify-between gap-4 ${
          profile?.isVerified
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
              profile?.isVerified ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
            }`}
          >
            {profile?.isVerified ? <ShieldCheck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-sm font-black">
              {profile?.isVerified ? 'Verified Farm Producer' : 'Verification Status: Under Review'}
            </h3>
            <p className="text-xs opacity-80 mt-0.5 max-w-xl">
              {profile?.isVerified
                ? 'Your farm has been verified by platform administrators. Your produce displays the verified trust badge to consumers.'
                : 'Platform administrators review producer credentials to grant verified seller status on the marketplace.'}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0 ${
            profile?.isVerified
              ? 'bg-emerald-200 text-emerald-800'
              : 'bg-amber-200 text-amber-800'
          }`}
        >
          {profile?.isVerified ? 'Verified' : 'Pending'}
        </span>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Farmer Full Name
              </label>
              <input
                type="text"
                disabled
                value={user?.fullName || profile?.farmerName || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50 text-stone-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Registered user account name</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Account Email
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50 text-stone-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Contact login email address</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Farm or Orchard Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Green Acres Organic Heritage Farm"
                value={formData.farmName}
                onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Farm Location / Village / District *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ratnagiri District, Maharashtra"
                value={formData.farmLocation}
                onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Farm Area (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 12.5"
                value={formData.farmSizeAcres}
                onChange={(e) => setFormData({ ...formData, farmSizeAcres: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Farming Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 15"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Farm Bio & Agricultural Heritage
              </label>
              <textarea
                rows="4"
                placeholder="Describe your family's farming lineage, natural soil fertilization practices, pesticide-free harvest guarantees, or special crops..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-100">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving Changes...' : 'Save Farm Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerProfilePage;
