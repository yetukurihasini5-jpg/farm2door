import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Mail,
  Phone,
  Power,
  Award,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner, ConfirmationModal } from '../../components/common/LoadingSpinner';

const ROLE_FILTERS = [
  { label: 'All Users', value: '' },
  { label: 'Consumers', value: 'ROLE_CONSUMER' },
  { label: 'Farmers / Producers', value: 'ROLE_FARMER' },
  { label: 'Admins', value: 'ROLE_ADMIN' },
];

const AdminUsersPage = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Toggle activation confirmation
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(selectedRole || null, page, 15);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      addToast('Failed to load user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, page]);

  const handleToggleActivationConfirm = async () => {
    if (!userToToggle) return;
    try {
      setActionLoading(true);
      const updatedUser = await adminService.toggleUserActivation(userToToggle.id);
      addToast(
        `User ${userToToggle.fullName} is now ${updatedUser.isActive ? 'ACTIVE' : 'DEACTIVATED'}`,
        'success'
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userToToggle.id ? { ...u, isActive: updatedUser.isActive } : u))
      );
      setActivationModalOpen(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating user activation', 'error');
    } finally {
      setActionLoading(false);
      setUserToToggle(null);
    }
  };

  const handleToggleVerification = async (farmerUser) => {
    try {
      // If the backend has profileId, or we pass profileId / userId
      const profileId = farmerUser.farmerProfile?.id || farmerUser.id;
      await adminService.toggleFarmerVerification(profileId);
      addToast(`Toggled verification status for ${farmerUser.fullName}`, 'success');
      fetchUsers();
    } catch (err) {
      addToast('Failed to update farmer verification status', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phoneNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          User & Producer Governance
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage system users, consumer profiles, farmer verifications, and account security states.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by user name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r.value}
              onClick={() => {
                setSelectedRole(r.value);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedRole === r.value
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving registered users..." />
      ) : filteredUsers.length > 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
                <tr>
                  <th className="py-3 px-6">User / Account</th>
                  <th className="py-3 px-6">Contact</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Account Status</th>
                  <th className="py-3 px-6">Producer Verification</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => {
                  const isFarmer = u.role === 'ROLE_FARMER';
                  const isVerified = u.farmerProfile?.isVerified;

                  return (
                    <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{u.fullName}</p>
                          <p className="text-[11px] text-stone-400">
                            Registered{' '}
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="text-stone-700 flex items-center gap-1.5 font-medium">
                            <Mail className="w-3 h-3 text-stone-400" />
                            {u.email}
                          </p>
                          {u.phoneNumber && (
                            <p className="text-stone-500 flex items-center gap-1.5 text-[11px]">
                              <Phone className="w-3 h-3 text-stone-400" />
                              {u.phoneNumber}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider ${
                            u.role === 'ROLE_ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'ROLE_FARMER'
                              ? 'bg-brand-100 text-brand-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {u.role.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {isFarmer ? (
                          <button
                            onClick={() => handleToggleVerification(u)}
                            className="flex items-center gap-1.5 text-xs font-semibold focus:outline-none"
                            title="Click to toggle verification status"
                          >
                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <Award className="w-3 h-3 text-emerald-600" />
                                Verified Farmer
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Pending Verification
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className="text-stone-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {u.role !== 'ROLE_ADMIN' && (
                          <button
                            onClick={() => {
                              setUserToToggle(u);
                              setActivationModalOpen(true);
                            }}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                              u.isActive
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            <Power className="w-3.5 h-3.5" />
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No users found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
            No registered accounts match your current filter or search criteria.
          </p>
        </div>
      )}

      {/* Activation Toggle Confirmation Modal */}
      <ConfirmationModal
        isOpen={activationModalOpen}
        title={userToToggle?.isActive ? 'Deactivate User Account' : 'Reactivate User Account'}
        message={
          userToToggle?.isActive
            ? `Are you sure you want to deactivate ${userToToggle?.fullName}? They will not be able to log in or transact.`
            : `Are you sure you want to reactivate ${userToToggle?.fullName}? Their access will be restored immediately.`
        }
        confirmText={userToToggle?.isActive ? 'Deactivate' : 'Activate'}
        isDanger={userToToggle?.isActive}
        loading={actionLoading}
        onConfirm={handleToggleActivationConfirm}
        onCancel={() => {
          setActivationModalOpen(false);
          setUserToToggle(null);
        }}
      />
    </div>
  );
};

export default AdminUsersPage;
