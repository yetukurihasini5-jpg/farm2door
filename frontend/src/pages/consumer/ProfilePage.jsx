import React, { useState } from 'react';
import { User, Lock, Save, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import Button from '../../components/common/Button';

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await authService.updateProfile({ fullName, phone });
      await refreshProfile();
      success('Profile details updated successfully');
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters');
      return;
    }

    try {
      setChangingPass(true);
      await authService.changePassword({ oldPassword, newPassword });
      success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      error(err.message || 'Failed to change password. Verify your current password.');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Account Profile & Security
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage your personal contact details and login credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Profile Details Form */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Personal Information</h3>
              <p className="text-[11px] text-stone-400">Account Role: {user?.role}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-sm rounded-xl border border-stone-200 p-2.5 bg-stone-100 text-stone-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">Email address cannot be modified</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={savingProfile}
              icon={Save}
              className="w-full"
            >
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Change Password</h3>
              <p className="text-[11px] text-stone-400">Keep your account secure with regular updates</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">New Password (min 6 chars)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <Button
              type="submit"
              variant="outline"
              size="md"
              loading={changingPass}
              icon={Lock}
              className="w-full"
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
