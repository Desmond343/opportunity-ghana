import React, { useState } from 'react';
import { User, UserRole } from '../../types/database';
import { DEMO_PROFILES, useAuth } from '../../services/authContext';
import { Users, ShieldCheck, UserCheck } from 'lucide-react';

export const AdminUsers: React.FC<{ onNavigate: (path: string) => void }> = () => {
  const { switchRole, currentUser } = useAuth();
  const [userList, setUserList] = useState<User[]>(Object.values(DEMO_PROFILES));

  const handleRoleChange = (userId: string, newRole: UserRole) => {
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
          Manage roles: user, editor, moderator, organization, admin.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">University / Organization</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Quick Switch</th>
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
                <td className="px-4 py-3 text-slate-600">{u.university || 'Partner Agency'}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    className="font-bold text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="user">User (Seeker)</option>
                    <option value="editor">Editor</option>
                    <option value="moderator">Moderator</option>
                    <option value="organization">Organization</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => switchRole(u.role)}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Simulate Login
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
