import React, { useState, useEffect, useMemo } from 'react';
import { SkillsService } from '../services/skillsService';
import { Skill } from '../types/database';
import { SKILL_CATEGORIES } from '../data/categories';
import { SkillCard } from '../components/cards/SkillCard';
import {
  TrendingUp,
  Search,
  Filter,
  Sparkles,
  Briefcase,
  X,
  Layers,
  Compass
} from 'lucide-react';

export const CareersPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [skills, setSkills] = useState<Skill[]>(() => SkillsService.getAll());
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedDemand, setSelectedDemand] = useState<string>('All');

  // Read initial query params from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      const search = params.get('search');
      if (cat) setSelectedCategory(cat);
      if (search) setSearchQuery(search);
    }
  }, []);

  useEffect(() => {
    setSkills(
      SkillsService.getAll({
        category: selectedCategory,
        search: searchQuery,
        level: selectedLevel,
        demandLevel: selectedDemand,
        status: 'published'
      })
    );
  }, [selectedCategory, searchQuery, selectedLevel, selectedDemand]);

  const clearAllFilters = () => {
    setSelectedCategory('All Categories');
    setSearchQuery('');
    setSelectedLevel('All');
    setSelectedDemand('All');
  };

  const hasActiveFilters =
    selectedCategory !== 'All Categories' ||
    searchQuery.trim() !== '' ||
    selectedLevel !== 'All' ||
    selectedDemand !== 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Workforce Intelligence &amp; Competencies
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-space">
          Ghana Skills &amp; Career Competencies Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Explore high-demand tech, business, vocational, creative, and professional skills in Ghana. Discover verified curriculum paths, project portfolios, and direct career tracks.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        {/* Search input + Dropdown filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills by name, tools (Python, Figma, AutoCAD), or career roles..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006B3F] text-slate-900 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Level filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006B3F]"
            >
              <option value="All">All Skill Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {/* Demand filter */}
            <select
              value={selectedDemand}
              onChange={(e) => setSelectedDemand(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006B3F]"
            >
              <option value="All">All Demand Levels</option>
              <option value="Very High">Very High Demand</option>
              <option value="High">High Demand</option>
              <option value="Growing">Growing Demand</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {SKILL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#006B3F] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Clear Filter */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing <strong>{skills.length}</strong> verified skills &amp; career competencies
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Grid of Skill Cards */}
      {skills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <Compass className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-space">
            No matching skills found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or clearing category filters to explore the full library of verified Ghanaian skills.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-[#006B3F] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
