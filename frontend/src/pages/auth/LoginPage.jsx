import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, LogIn, Shield, Users, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

const LoginPage = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      error('Please enter your email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      success(`Welcome back, ${user.fullName}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'ROLE_FARMER') {
        navigate('/farmer/dashboard', { replace: true });
      } else {
        navigate('/consumer/dashboard', { replace: true });
      }
    } catch (err) {
      error(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full space-y-6">
        {/* Card Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
              <Sprout className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">
            Sign In to Farm2Door
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Access your direct farmer or consumer marketplace account
          </p>
        </div>

        {/* Demo Credentials Fast-Fill Toolbar */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-700" /> Quick Demo Accounts (Click to Fill)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@farm2door.com', 'admin123')}
              className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 text-[11px] font-bold rounded-xl border border-stone-200 shadow-sm transition-all text-center"
            >
              Admin Portal
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('raju.farmer@farm2door.com', 'farmer123')}
              className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 text-[11px] font-bold rounded-xl border border-stone-200 shadow-sm transition-all text-center"
            >
              Farmer Raju
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('consumer@farm2door.com', 'consumer123')}
              className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 text-[11px] font-bold rounded-xl border border-stone-200 shadow-sm transition-all text-center"
            >
              Consumer Priya
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xl shadow-stone-900/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@farm2door.com"
                className="w-full text-sm rounded-xl border border-stone-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-stone-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm rounded-xl border border-stone-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-stone-400"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In to Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 underline">
              Create a free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
