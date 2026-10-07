import React, { useState, useEffect } from 'react';
import { SuccessStory, SuccessStoryStatus, SuccessStoryMetrics } from '../../types/database';
import { SuccessStoriesService } from '../../services/successStoriesService';
import { useAuth } from '../../services/authContext';
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Archive,
  ArrowRight,
  Sparkles,
  Upload,
  Globe,
  Quote,
  GraduationCap,
  Briefcase,
  X,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface AdminSuccessStoriesProps {
  onNavigate: (path: string) => void;
}

export const AdminSuccessStories: React.FC<AdminSuccessStoriesProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [metrics, setMetrics] = useState<SuccessStoryMetrics>({
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
    rejected: 0,
    archived: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | SuccessStoryStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotification, setActionNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);

  // Preview modal state
  const [previewStory, setPreviewStory] = useState<SuccessStory | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    storytellerName: string;
    storytellerRole: string;
    storytellerAvatar: string;
    benefitedOpportunityTitle: string;
    benefitedOpportunityId: string;
    institutionOrCareer: string;
    quote: string;
    content: string;
    keyTakeawaysText: string;
    status: SuccessStoryStatus;
  }>({
    title: '',
    storytellerName: '',
    storytellerRole: '',
    storytellerAvatar: '',
    benefitedOpportunityTitle: '',
    benefitedOpportunityId: '',
    institutionOrCareer: '',
    quote: '',
    content: '',
    keyTakeawaysText: '',
    status: 'draft'
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await SuccessStoriesService.getAdminStories();
      setStories(res.stories);
      setMetrics(res.metrics);
    } catch (err) {
      console.error('Failed to load success stories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('success-stories-changed', handleUpdate);
    return () => window.removeEventListener('success-stories-changed', handleUpdate);
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setActionNotification({ message, type });
    setTimeout(() => setActionNotification(null), 5000);
  };

  const openCreateForm = () => {
    setEditingStory(null);
    setFormData({
      title: '',
      storytellerName: '',
      storytellerRole: '',
      storytellerAvatar: '',
      benefitedOpportunityTitle: '',
      benefitedOpportunityId: '',
      institutionOrCareer: '',
      quote: '',
      content: '',
      keyTakeawaysText: '',
      status: 'draft'
    });
    setIsFormOpen(true);
  };

  const openEditForm = (story: SuccessStory) => {
    setEditingStory(story);
    setFormData({
      title: story.title || '',
      storytellerName: story.storytellerName || '',
      storytellerRole: story.storytellerRole || '',
      storytellerAvatar: story.storytellerAvatar || '',
      benefitedOpportunityTitle: story.benefitedOpportunityTitle || '',
      benefitedOpportunityId: story.benefitedOpportunityId || '',
      institutionOrCareer: story.institutionOrCareer || '',
      quote: story.quote || '',
      content: story.content || '',
      keyTakeawaysText: Array.isArray(story.keyTakeaways) ? story.keyTakeaways.join('\n') : '',
      status: story.status || 'draft'
    });
    setIsFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('file', file);
      data.append('entityType', 'public');
      data.append('entityId', `story_${Date.now()}`);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      });

      if (res.ok) {
        const json = await res.json();
        if (json.imageUrl) {
          setFormData(prev => ({ ...prev, storytellerAvatar: json.imageUrl }));
          showNotification('Photo uploaded successfully!');
        }
      } else {
        showNotification('Failed to upload photo. Please check image format.', 'error');
      }
    } catch {
      showNotification('Network error while uploading photo.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveForm = async (targetStatus?: SuccessStoryStatus) => {
    if (!formData.title.trim()) {
      showNotification('Title is required.', 'error');
      return;
    }
    if (!formData.storytellerName.trim()) {
      showNotification("Person's name is required.", 'error');
      return;
    }
    if (!formData.benefitedOpportunityTitle.trim()) {
      showNotification('Opportunity benefited from is required.', 'error');
      return;
    }
    if (!formData.content.trim()) {
      showNotification('Story narrative content is required.', 'error');
      return;
    }

    const effectiveStatus = targetStatus || formData.status;
    const takeaways = formData.keyTakeawaysText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload: Partial<SuccessStory> = {
      title: formData.title.trim(),
      storytellerName: formData.storytellerName.trim(),
      storytellerRole: formData.storytellerRole.trim(),
      storytellerAvatar: formData.storytellerAvatar.trim(),
      benefitedOpportunityTitle: formData.benefitedOpportunityTitle.trim(),
      benefitedOpportunityId: formData.benefitedOpportunityId.trim(),
      institutionOrCareer: formData.institutionOrCareer.trim(),
      quote: formData.quote.trim(),
      content: formData.content.trim(),
      keyTakeaways: takeaways,
      status: effectiveStatus
    };

    try {
      if (editingStory) {
        await SuccessStoriesService.updateStory(editingStory.id, payload);
        showNotification(
          effectiveStatus === 'published'
            ? 'Success Story published and live on public site!'
            : 'Success Story updated successfully!'
        );
      } else {
        await SuccessStoriesService.createStory(payload);
        showNotification(
          effectiveStatus === 'published'
            ? 'Success Story created and published immediately!'
            : 'Success Story saved successfully!'
        );
      }
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Error saving story.', 'error');
    }
  };

  const handlePublish = async (story: SuccessStory) => {
    try {
      await SuccessStoriesService.publishStory(story.id);
      showNotification(`"${story.title}" published! It is now live on the public website.`);
      loadData();
    } catch {
      showNotification('Failed to publish story.', 'error');
    }
  };

  const handleUnpublish = async (story: SuccessStory) => {
    try {
      await SuccessStoriesService.unpublishStory(story.id);
      showNotification(`"${story.title}" unpublished. Reverted to Draft status.`);
      loadData();
    } catch {
      showNotification('Failed to unpublish story.', 'error');
    }
  };

  const handleArchive = async (story: SuccessStory) => {
    try {
      await SuccessStoriesService.archiveStory(story.id);
      showNotification(`"${story.title}" archived.`);
      loadData();
    } catch {
      showNotification('Failed to archive story.', 'error');
    }
  };

  const handleReject = async (story: SuccessStory) => {
    const reason = window.prompt('Enter reason for rejecting this story (optional):', '');
    if (reason === null) return;
    try {
      await SuccessStoriesService.rejectStory(story.id, reason);
      showNotification(`"${story.title}" marked as rejected.`);
      loadData();
    } catch {
      showNotification('Failed to reject story.', 'error');
    }
  };

  const handleDelete = async (story: SuccessStory) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${story.title}"?`)) {
      return;
    }
    try {
      await SuccessStoriesService.deleteStory(story.id);
      showNotification(`"${story.title}" deleted.`);
      loadData();
    } catch {
      showNotification('Failed to delete story.', 'error');
    }
  };

  // Filtered stories for list
  const filteredStories = stories.filter(story => {
    const matchesStatus = statusFilter === 'all' || story.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.storytellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.benefitedOpportunityTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: SuccessStoryStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Published (Live)
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3 h-3 text-slate-500" />
            Draft
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
            <X className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Rejected
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
            <Archive className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Header & Public State Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-space">
              Success Stories CMS Manager
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Admin CMS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Administer authenticated beneficiary journeys. Public visibility is automatically controlled by whether at least one story is published.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => loadData()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141B29] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh Stories"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {metrics.published > 0 ? (
            <button
              onClick={() => onNavigate('/success-stories')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[#006B3F] dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public Section: Active ({metrics.published})</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Public Section: Hidden (0 Published)</span>
            </div>
          )}

          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Success Story
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {actionNotification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold ${
            actionNotification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionNotification.message}</span>
          </div>
          <button
            onClick={() => setActionNotification(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-[#006B3F] dark:border-emerald-500'
              : 'bg-white dark:bg-[#141B29] border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Stories
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-space">
            {metrics.total}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('published')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'published'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500'
              : 'bg-white dark:bg-[#141B29] border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Published (Live)
            </p>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-space">
            {metrics.published}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('draft')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'draft'
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-400'
              : 'bg-white dark:bg-[#141B29] border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Drafts (Private)
          </p>
          <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1 font-space">
            {metrics.draft}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500'
              : 'bg-white dark:bg-[#141B29] border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Pending Review
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-space">
            {metrics.pending}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500'
              : 'bg-white dark:bg-[#141B29] border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Rejected
          </p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-space">
            {metrics.rejected}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('archived')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'archived'
              ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500'
              : 'bg-white dark:bg-[#141B29] border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
            Archived
          </p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 font-space">
            {metrics.archived}
          </p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(['all', 'published', 'draft', 'pending', 'rejected', 'archived'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Stories Listing */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-3">Loading success stories...</p>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-space">
              No Success Stories found in this view
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {metrics.total === 0
                ? 'No success stories have been created yet. Click below to add the first story.'
                : `No stories matching the "${statusFilter}" status filter or search criteria.`}
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006B3F] text-white text-xs font-bold hover:bg-[#005530] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Success Story
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B0F17] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Storyteller & Title</th>
                  <th className="px-4 py-3 font-semibold">Benefited Opportunity</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Published Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStories.map(story => (
                  <tr
                    key={story.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Storyteller & Title */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {story.storytellerAvatar ? (
                            <img
                              src={story.storytellerAvatar}
                              alt={story.storytellerName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            story.storytellerName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                            {story.title}
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                            {story.storytellerName}
                            {story.storytellerRole ? ` • ${story.storytellerRole}` : ''}
                          </p>
                          {story.institutionOrCareer && (
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate">
                              {story.institutionOrCareer}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Benefited Opportunity */}
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-300 max-w-xs">
                      <p className="font-semibold truncate">{story.benefitedOpportunityTitle}</p>
                      {story.quote && (
                        <p className="text-[11px] text-slate-400 italic truncate mt-0.5">
                          "{story.quote}"
                        </p>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(story.status)}
                    </td>

                    {/* Published Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                      {story.publishedAt
                        ? new Date(story.publishedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview */}
                        <button
                          onClick={() => setPreviewStory(story)}
                          title="Preview story"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditForm(story)}
                          title="Edit story"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Publish / Unpublish */}
                        {story.status === 'published' ? (
                          <button
                            onClick={() => handleUnpublish(story)}
                            title="Unpublish (Revert to Draft)"
                            className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[11px] hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(story)}
                            title="Publish story (Go Live)"
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            Publish
                          </button>
                        )}

                        {/* Reject (if pending) */}
                        {story.status === 'pending' && (
                          <button
                            onClick={() => handleReject(story)}
                            title="Reject story"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Archive */}
                        {story.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(story)}
                            title="Archive story"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(story)}
                          title="Delete story"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Story Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-space">
                  {editingStory ? 'Edit Success Story' : 'Create New Success Story'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fill in beneficiary details and story narrative.
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Story Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. From Ashesi to Oxford: How the Mastercard Foundation Scholarship Changed My Path"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Storyteller Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Beneficiary / Person's Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kwesi Mensah"
                    value={formData.storytellerName}
                    onChange={e => setFormData({ ...formData, storytellerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer, Oxford Scholar"
                    value={formData.storytellerRole}
                    onChange={e => setFormData({ ...formData, storytellerRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Institution / Career Info */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Institution / Career Background
                </label>
                <input
                  type="text"
                  placeholder="e.g. KNUST Computer Science Alumnus / Google Africa Fellow"
                  value={formData.institutionOrCareer}
                  onChange={e => setFormData({ ...formData, institutionOrCareer: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Opportunity Benefited From */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Benefited Opportunity Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mastercard Foundation Scholars Program"
                    value={formData.benefitedOpportunityTitle}
                    onChange={e =>
                      setFormData({ ...formData, benefitedOpportunityTitle: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Opportunity ID Reference (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. opp_mastercard_scholars"
                    value={formData.benefitedOpportunityId}
                    onChange={e =>
                      setFormData({ ...formData, benefitedOpportunityId: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Photo / Avatar */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Beneficiary Photo / Avatar URL
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="https://... or upload a photo"
                    value={formData.storytellerAvatar}
                    onChange={e => setFormData({ ...formData, storytellerAvatar: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              {/* Quote / Highlight Excerpt */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Highlight Quote / Punchline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opportunity Ghana showed me the deadline 2 weeks before closing. It completely altered my life trajectory."
                  value={formData.quote}
                  onChange={e => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Story Narrative Content */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Story Journey Narrative *
                </label>
                <textarea
                  rows={6}
                  placeholder="Tell the complete authentic story: the applicant's origin, the discovery, the application process, obstacles overcome, and where they are today..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed font-sans"
                />
              </div>

              {/* Key Takeaways */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Key Takeaways For Applicants (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Start preparing transcripts at least 2 months ahead&#10;Write essays with authentic personal voice&#10;Seek recommendations from professors who know your work intimately"
                  value={formData.keyTakeawaysText}
                  onChange={e => setFormData({ ...formData, keyTakeawaysText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed font-sans"
                />
              </div>

              {/* Status Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Story Status
                </label>
                <select
                  value={formData.status}
                  onChange={e =>
                    setFormData({ ...formData, status: e.target.value as SuccessStoryStatus })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="draft">Draft (Private, not visible on public site)</option>
                  <option value="pending">Pending Review</option>
                  <option value="published">Published (Live immediately on website)</option>
                  <option value="archived">Archived</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveForm('draft')}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSaveForm('published')}
                  className="px-5 py-2 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Publish & Make Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewStory && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  Story Live Preview
                </span>
                {getStatusBadge(previewStory.status)}
              </div>
              <button
                onClick={() => setPreviewStory(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Story Card Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 shadow-sm">
                  {previewStory.storytellerAvatar ? (
                    <img
                      src={previewStory.storytellerAvatar}
                      alt={previewStory.storytellerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    previewStory.storytellerName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white font-space">
                    {previewStory.storytellerName}
                  </h2>
                  {previewStory.storytellerRole && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {previewStory.storytellerRole}
                    </p>
                  )}
                  {previewStory.institutionOrCareer && (
                    <p className="text-xs text-[#006B3F] dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {previewStory.institutionOrCareer}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#006B3F] dark:text-emerald-400">
                  Benefited From
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {previewStory.benefitedOpportunityTitle}
                </p>
              </div>

              {previewStory.quote && (
                <div className="bg-slate-50 dark:bg-[#0B0F17] rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 italic font-space">
                    "{previewStory.quote}"
                  </p>
                </div>
              )}

              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-space">
                  {previewStory.title}
                </h3>
                <p>{previewStory.content}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setPreviewStory(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 text-xs font-semibold"
              >
                Close Preview
              </button>

              {previewStory.status !== 'published' && (
                <button
                  onClick={async () => {
                    await handlePublish(previewStory);
                    setPreviewStory(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Publish Live Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
