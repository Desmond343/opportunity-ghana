import React, { useState } from 'react';
import { Organization } from '../../types/database';
import { AdminService } from '../../services/adminService';
import { Badge } from '../../components/common/Badge';
import { Building, ShieldCheck, Plus, ExternalLink, MapPin } from 'lucide-react';

export const AdminOrganizations: React.FC<{ onNavigate: (path: string) => void }> = () => {
  const [orgs, setOrgs] = useState<Organization[]>(() => AdminService.getOrganizations());
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Accra, Ghana');
  const [type, setType] = useState<Organization['organizationType']>('corporate');
  const [website, setWebsite] = useState('https://');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrg: Organization = {
      id: 'org_' + Math.random().toString(36).substring(2, 9),
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: 'Partner organization verified on Opportunity Ghana.',
      website,
      organizationType: type,
      location,
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    AdminService.saveOrganization(newOrg);
    setOrgs(AdminService.getOrganizations());
    setShowAdd(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-space">
            Registered Organizations & Partners
          </h1>
          <p className="text-xs text-slate-500">
            Universities, government agencies, NGOs, and corporate employers publishing opportunities.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Organization</span>
        </button>
      </div>

      {orgs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <Building className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No registered organizations yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &apos;Add Organization&apos; to register accredited Ghanaian universities, government agencies, and partner employers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((org) => (
            <div key={org.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      <Building className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{org.name}</h3>
                    <span className="text-[10px] text-slate-400 capitalize">{org.organizationType}</span>
                  </div>
                </div>
                {org.verified && (
                  <span title="Verified Partner">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{org.description}</p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {org.location}
                </span>
                {org.website && (
                  <a href={org.website} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline flex items-center gap-1">
                    <span>Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Add Verified Partner Organization</h3>
            <div>
              <label className="block font-bold mb-1">Organization Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="university">University / Higher Education</option>
                <option value="government">Government Ministry / Agency</option>
                <option value="corporate">Corporate / Private Enterprise</option>
                <option value="ngo">NGO / Civil Society</option>
                <option value="startup">Startup Incubator</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl"
              >
                Save Organization
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
