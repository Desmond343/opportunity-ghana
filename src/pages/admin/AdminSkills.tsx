import React, { useState } from 'react';
import { Skill } from '../../types/database';
import { AdminService } from '../../services/adminService';
import { Badge } from '../../components/common/Badge';
import { Sparkles, Plus, TrendingUp, Briefcase } from 'lucide-react';

export const AdminSkills: React.FC<{ onNavigate: (path: string) => void }> = () => {
  const [skills, setSkills] = useState<Skill[]>(() => AdminService.getSkills());
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Technology');
  const [desc, setDesc] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newSkill: Skill = {
      id: 'skill_' + Math.random().toString(36).substring(2, 9),
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      description: desc || 'Essential skill area in Ghana market.',
      relatedSkills: ['Analytical Thinking', 'Problem Solving'],
      demandLevel: 'High',
      topCareers: ['Specialist'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    AdminService.saveSkill(newSkill);
    setSkills(AdminService.getSkills());
    setShowAdd(false);
    setName('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-space">
            Skills & Career Competencies Registry
          </h1>
          <p className="text-xs text-slate-500">
            Define relational mappings between skills, opportunity postings, and course curricula.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="emerald">{skill.category}</Badge>
              <span className="text-[10px] font-bold text-slate-500">{skill.demandLevel} Demand</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">{skill.name}</h3>
            <p className="text-xs text-slate-600 line-clamp-2">{skill.description}</p>
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
              {skill.relatedSkills.map((r, i) => (
                <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  {r}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Define New Skill Record</h3>
            <div>
              <label className="block font-bold mb-1">Skill Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cloud Security Architecture"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Description</label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
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
                Save Skill
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
