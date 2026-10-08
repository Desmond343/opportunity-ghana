import React, { useState, useMemo } from 'react';
import { Skill, SkillStatus, SkillLevel, SkillDemandLevel } from '../../types/database';
import { SkillsService } from '../../services/skillsService';
import { Badge } from '../../components/common/Badge';
import { SKILL_CATEGORIES } from '../../data/categories';
import {
  Sparkles,
  Plus,
  TrendingUp,
  Briefcase,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Archive,
  Edit2,
  Trash2,
  Eye,
  X,
  ExternalLink,
  ShieldCheck,
  Check,
  Ban
} from 'lucide-react';

export const AdminSkills: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [skills, setSkills] = useState<Skill[]>(() => SkillsService.getAll({ status: 'all' }));
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | SkillStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [viewingSkill, setViewingSkill] = useState<Skill | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Technology & Digital');
  const [formLevel, setFormLevel] = useState<SkillLevel>('Beginner');
  const [formDemand, setFormDemand] = useState<SkillDemandLevel>('High');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDetailedDesc, setFormDetailedDesc] = useState('');
  const [formGhanaMarket, setFormGhanaMarket] = useState('');
  const [formTopCareers, setFormTopCareers] = useState('');
  const [formRelatedSkills, setFormRelatedSkills] = useState('');
  const [formTools, setFormTools] = useState('');
  const [formWhatUsedFor, setFormWhatUsedFor] = useState('');
  const [formCertifications, setFormCertifications] = useState('');
  const [formProjects, setFormProjects] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState<SkillStatus>('published');

  const refreshSkills = () => {
    setSkills(SkillsService.getAll({ status: 'all' }));
  };

  const openAddModal = () => {
    setEditingSkill(null);
    setFormName('');
    setFormCategory('Technology & Digital');
    setFormLevel('Beginner');
    setFormDemand('High');
    setFormShortDesc('');
    setFormDetailedDesc('');
    setFormGhanaMarket('');
    setFormTopCareers('');
    setFormRelatedSkills('Analytical Thinking, Problem Solving');
    setFormTools('');
    setFormWhatUsedFor('');
    setFormCertifications('');
    setFormProjects('');
    setFormSource('');
    setFormSourceUrl('');
    setFormImageUrl('');
    setFormStatus('published');
    setShowFormModal(true);
  };

  const openEditModal = (skill: Skill) => {
    setEditingSkill(skill);
    setFormName(skill.name);
    setFormCategory(skill.category);
    setFormLevel(skill.level || 'Beginner');
    setFormDemand(skill.demandLevel || 'High');
    setFormShortDesc(skill.description);
    setFormDetailedDesc(skill.detailedDescription || '');
    setFormGhanaMarket(skill.whyUsefulInGhana || '');
    setFormTopCareers(skill.topCareers?.join(', ') || '');
    setFormRelatedSkills(skill.relatedSkills.join(', '));
    setFormTools(skill.toolsAndSoftware?.join(', ') || '');
    setFormWhatUsedFor(skill.whatItIsUsedFor?.join('\n') || '');
    setFormCertifications(skill.certifications?.join(', ') || '');
    setFormProjects(skill.practicalProjects?.join('\n') || '');
    setFormSource(skill.source || '');
    setFormSourceUrl(skill.sourceUrl || '');
    setFormImageUrl(skill.imageUrl || '');
    setFormStatus(skill.status || 'published');
    setShowFormModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const parseList = (val: string, sep = ',') =>
      val
        .split(sep)
        .map((s) => s.trim())
        .filter(Boolean);

    const parseLines = (val: string) =>
      val
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

    const skillPayload: Skill = {
      id: editingSkill ? editingSkill.id : `skill-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: formName.trim(),
      slug: formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      category: formCategory,
      level: formLevel,
      demandLevel: formDemand,
      description: formShortDesc.trim() || 'Essential skill area in the Ghanaian job market.',
      detailedDescription: formDetailedDesc.trim() || undefined,
      whyUsefulInGhana: formGhanaMarket.trim() || undefined,
      topCareers: parseList(formTopCareers),
      relatedSkills: parseList(formRelatedSkills),
      toolsAndSoftware: parseList(formTools),
      whatItIsUsedFor: parseLines(formWhatUsedFor),
      certifications: parseList(formCertifications),
      practicalProjects: parseLines(formProjects),
      source: formSource.trim() || undefined,
      sourceUrl: formSourceUrl.trim() || undefined,
      imageUrl: formImageUrl.trim() || undefined,
      status: formStatus,
      createdAt: editingSkill?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    SkillsService.saveSkill(skillPayload);
    refreshSkills();
    setShowFormModal(false);
    setEditingSkill(null);
  };

  const handleUpdateStatus = (skillId: string, newStatus: SkillStatus) => {
    SkillsService.updateSkillStatus(skillId, newStatus);
    refreshSkills();
  };

  const handleDelete = (skillId: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      SkillsService.deleteSkill(skillId);
      refreshSkills();
    }
  };

  // Filter skills by tab, search, category
  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      // Tab filter
      const currentStatus = s.status || 'published';
      if (selectedStatusTab !== 'all' && currentStatus !== selectedStatusTab) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'All' && s.category !== categoryFilter) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesDesc = s.description.toLowerCase().includes(q);
        const matchesCat = s.category.toLowerCase().includes(q);
        const matchesCareers = s.topCareers?.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesCat && !matchesCareers) {
          return false;
        }
      }

      return true;
    });
  }, [skills, selectedStatusTab, categoryFilter, searchQuery]);

  // Counts by status
  const counts = useMemo(() => {
    const total = skills.length;
    const published = skills.filter((s) => (s.status || 'published') === 'published').length;
    const review = skills.filter((s) => s.status === 'review' || s.status === 'pending').length;
    const archived = skills.filter((s) => s.status === 'archived').length;
    return { total, published, review, archived };
  }, [skills]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-space flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            <span>Skills &amp; Career Competencies Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage verified skill taxonomies, market demand ratings, and educational curricula mappings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/skills')}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
          >
            Public Directory
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setSelectedStatusTab('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            selectedStatusTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Skills ({counts.total})
        </button>
        <button
          onClick={() => setSelectedStatusTab('published')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedStatusTab === 'published'
              ? 'bg-emerald-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Published ({counts.published})</span>
        </button>
        <button
          onClick={() => setSelectedStatusTab('review')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedStatusTab === 'review'
              ? 'bg-amber-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Under Review ({counts.review})</span>
        </button>
        <button
          onClick={() => setSelectedStatusTab('archived')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedStatusTab === 'archived'
              ? 'bg-slate-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archived ({counts.archived})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills by name, description, or target careers..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-xs bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
        >
          <option value="All">All Categories</option>
          {SKILL_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Skills Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => {
          const status = skill.status || 'published';
          return (
            <div
              key={skill.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="emerald">{skill.category}</Badge>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : status === 'review' || status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 font-space">{skill.name}</h3>
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                    {skill.demandLevel || 'High'} Demand
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {skill.description}
                </p>

                {/* Top Careers */}
                {skill.topCareers && skill.topCareers.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Careers:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {skill.topCareers.slice(0, 2).map((c, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {c}
                        </span>
                      ))}
                      {skill.topCareers.length > 2 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{skill.topCareers.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewingSkill(skill)}
                    title="View details"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(skill)}
                    title="Edit skill"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id, skill.name)}
                    title="Delete skill"
                    className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Status Toggles */}
                <div className="flex items-center gap-1">
                  {status !== 'published' && (
                    <button
                      onClick={() => handleUpdateStatus(skill.id, 'published')}
                      className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold cursor-pointer"
                    >
                      Publish
                    </button>
                  )}
                  {status === 'published' && (
                    <button
                      onClick={() => handleUpdateStatus(skill.id, 'review')}
                      className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-[11px] font-semibold cursor-pointer"
                    >
                      Review
                    </button>
                  )}
                  {status !== 'archived' && (
                    <button
                      onClick={() => handleUpdateStatus(skill.id, 'archived')}
                      className="px-2 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded text-[11px] font-medium cursor-pointer"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <p className="text-sm font-bold text-slate-700">No skills match your filters.</p>
          <button
            onClick={() => {
              setSelectedStatusTab('all');
              setSearchQuery('');
              setCategoryFilter('All');
            }}
            className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingSkill && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="emerald">{viewingSkill.category}</Badge>
                <h3 className="text-xl font-bold text-slate-900 font-space mt-1">
                  {viewingSkill.name}
                </h3>
              </div>
              <button
                onClick={() => setViewingSkill(null)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Short Description
                </p>
                <p className="text-slate-700 mt-0.5">{viewingSkill.description}</p>
              </div>

              {viewingSkill.detailedDescription && (
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Detailed Competency Breakdown
                  </p>
                  <p className="text-slate-700 mt-0.5 whitespace-pre-line">
                    {viewingSkill.detailedDescription}
                  </p>
                </div>
              )}

              {viewingSkill.whyUsefulInGhana && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80">
                  <p className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">
                    Ghana Market Relevance
                  </p>
                  <p className="text-emerald-800 mt-0.5">{viewingSkill.whyUsefulInGhana}</p>
                </div>
              )}

              {viewingSkill.topCareers && viewingSkill.topCareers.length > 0 && (
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Top Careers
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewingSkill.topCareers.map((c, i) => (
                      <span key={i} className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingSkill.toolsAndSoftware && viewingSkill.toolsAndSoftware.length > 0 && (
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Tools &amp; Software
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewingSkill.toolsAndSoftware.map((t, i) => (
                      <span key={i} className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingSkill.source && (
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Verification Source
                  </p>
                  <p className="text-slate-700 mt-0.5">{viewingSkill.source}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  setViewingSkill(null);
                  openEditModal(viewingSkill);
                }}
                className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Edit Record
              </button>
              <button
                onClick={() => onNavigate(`/skills/${viewingSkill.slug}`)}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
              >
                View Public Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT SKILL FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 font-space">
                {editingSkill ? `Edit Skill: ${editingSkill.name}` : 'Create New Skill Record'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Cloud Security Architecture"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                >
                  {SKILL_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Proficiency Level</label>
                <select
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value as SkillLevel)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Market Demand</label>
                <select
                  value={formDemand}
                  onChange={(e) => setFormDemand(e.target.value as SkillDemandLevel)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="Very High">Very High Demand</option>
                  <option value="High">High Demand</option>
                  <option value="Growing">Growing Demand</option>
                  <option value="Stable">Stable Demand</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">Short Summary Description *</label>
              <textarea
                rows={2}
                required
                value={formShortDesc}
                onChange={(e) => setFormShortDesc(e.target.value)}
                placeholder="Concise overview of what this skill represents."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Detailed Description</label>
              <textarea
                rows={3}
                value={formDetailedDesc}
                onChange={(e) => setFormDetailedDesc(e.target.value)}
                placeholder="Comprehensive technical and practical context."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Why Useful in Ghana (Market Relevance)</label>
              <textarea
                rows={2}
                value={formGhanaMarket}
                onChange={(e) => setFormGhanaMarket(e.target.value)}
                placeholder="Explain realistic demand and opportunities in Ghana's job market."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Top Associated Careers (Comma-separated)</label>
                <input
                  type="text"
                  value={formTopCareers}
                  onChange={(e) => setFormTopCareers(e.target.value)}
                  placeholder="e.g. Cloud Engineer, DevOps Specialist"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Tools &amp; Software (Comma-separated)</label>
                <input
                  type="text"
                  value={formTools}
                  onChange={(e) => setFormTools(e.target.value)}
                  placeholder="e.g. AWS, Docker, Terraform"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">Related Skills (Comma-separated)</label>
              <input
                type="text"
                value={formRelatedSkills}
                onChange={(e) => setFormRelatedSkills(e.target.value)}
                placeholder="e.g. Linux, Networking, Python"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Verification Source Name</label>
                <input
                  type="text"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  placeholder="e.g. Ghana Institution of Engineering (GhIE)"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Source URL</label>
                <input
                  type="url"
                  value={formSourceUrl}
                  onChange={(e) => setFormSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Image URL</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="/images/... or https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Publishing Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as SkillStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="published">Published</option>
                  <option value="review">Under Review / Pending</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 cursor-pointer shadow-xs"
              >
                Save Skill Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
