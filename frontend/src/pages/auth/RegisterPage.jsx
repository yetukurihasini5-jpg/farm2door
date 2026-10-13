import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout, User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'ROLE_FARMER' ? 'ROLE_FARMER' : 'ROLE_CONSUMER';

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Farmer specific fields
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmSizeAcres, setFarmSizeAcres] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
      };

      if (role === 'ROLE_FARMER') {
        if (!farmName.trim() || !farmLocation.trim()) {
          error('Please provide your Farm Name and Farm Location');
          setLoading(false);
          return;
        }
        payload.farmName = farmName.trim();
        payload.farmLocation = farmLocation.trim();
        if (farmSizeAcres) payload.farmSizeAcres = parseFloat(farmSizeAcres);
        if (experienceYears) payload.experienceYears = parseInt(experienceYears, 10);
        if (bio) payload.bio = bio.trim();
      }

      const user = await register(payload);
      success(`Welcome to Farm2Door, ${user.fullName}!`);

      if (user.role === 'ROLE_FARMER') {
        navigate('/farmer/dashboard', { replace: true });
      } else {
        navigate('/consumer/dashboard', { replace: true });
      }
    } catch (err) {
      error(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
              <Sprout className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Join the direct agricultural network as a household consumer or local farmer
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-200/70 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('ROLE_CONSUMER')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'ROLE_CONSUMER'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <User className="w-4 h-4 text-brand-600" />
            I'm a Consumer / Buyer
          </button>
          <button
            type="button"
            onClick={() => setRole('ROLE_FARMER')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'ROLE_FARMER'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sprout className="w-4 h-4 text-brand-600" />
            I'm a Farmer / Producer
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xl shadow-stone-900/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Raju Patel"
                  className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Farmer Specific Fields */}
            {role === 'ROLE_FARMER' && (
              <div className="pt-4 border-t border-stone-100 space-y-4 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md inline-block">
                  Farmstead Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Farm / Nursery Name
                    </label>
                    <input
                      type="text"
                      required
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="e.g. Green Valley Farm"
                      className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Farm Location / Village / State
                    </label>
                    <input
                      type="text"
                      required
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      placeholder="e.g. Nashik, Maharashtra"
                      className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Farm Size (in Acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={farmSizeAcres}
                      onChange={(e) => setFarmSizeAcres(e.target.value)}
                      placeholder="e.g. 12.5"
                      className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Years of Farming Experience
                    </label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Bio / Farming Practices
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your organic cultivation methods, traditional crops, etc."
                    className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-4"
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
