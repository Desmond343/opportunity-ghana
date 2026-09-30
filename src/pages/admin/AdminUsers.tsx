import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types/database';
import { useAuth } from '../../services/authContext';
import { AdminService } from '../../services/adminService';
import { Users, ShieldCheck, UserCheck, Shield } from 'lucide-react';

export const AdminUsers: React.FC<{ onNavigate: (path: string) => void }> = () => {
  const { currentUser } = useAuth();
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        let users = await AdminService.loadUsersFromFirestore();
        if (currentUser && !users.some(u => u.id === currentUser.id)) {
          users = [currentUser, ...users];
        }
        setUserList(users);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [currentUser]);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    AdminService.updateUserRole(userId, newRole);
    setUserList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-space">
          User Role & Access Governance (RBAC)
        </h1>
        <p className="text-xs text-slate-500">
          Manage roles: user, editor, moderator, organization, admin. Privileges are strictly enforced via backend Firestore rules.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading registered users...
          </div>
        ) : userList.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No registered users found</h3>
            <p className="text-xs text-slate-500">
              When students, job seekers, and partners register, their profiles will appear here for role assignment.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">University / Organization</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.location || 'Ghana'}</td>
                  <td className="px-4 py-3 text-slate-600">{u.university || 'General Member'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="font-bold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="user">User (Seeker)</option>
                      <option value="editor">Editor</option>
                      <option value="moderator">Moderator</option>
                      <option value="organization">Organization</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
