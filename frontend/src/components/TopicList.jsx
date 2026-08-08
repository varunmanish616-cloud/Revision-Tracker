import React, { useState } from 'react';
import { Search, Filter, Calendar, Edit2, Trash2, CheckCircle2, Circle, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { getFormattedDateLabel, getTodayDateStr } from '../utils/revision';

export default function TopicList({ topics, onToggleRevision, onEditTopic, onDeleteTopic }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedTopicId, setExpandedTopicId] = useState(null);

  const todayStr = getTodayDateStr();

  // Extract unique categories
  const categories = ['All', ...new Set((topics || []).filter(Boolean).map(t => t.category).filter(Boolean))];

  // Filter topics
  const filteredTopics = (topics || []).filter(topic => {
    if (!topic) return false;
    const matchesSearch = (topic.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (topic.notes && topic.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || topic.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleExpandNotes = (id) => {
    setExpandedTopicId(expandedTopicId === id ? null : id);
  };

  const calculateCompletionPercentage = (revisions) => {
    if (!revisions || revisions.length === 0) return 0;
    const completedCount = revisions.filter(r => r && r.completed).length;
    return Math.round((completedCount / revisions.length) * 100);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* List Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-1">Study Topics Board</h2>
          <p className="text-xs text-slate-400">Search, filter, and monitor all your space-repetition review tracks.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search topic or notes..."
              className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all w-full sm:w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              className="pl-10 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-900">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Topics */}
      {filteredTopics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm">No topics found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTopics.map((topic) => {
            const completion = calculateCompletionPercentage(topic.revisions);
            const isExpanded = expandedTopicId === topic.id;

            return (
              <div 
                key={topic.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-5 hover:bg-slate-950 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between transition-all"
              >
                {/* Left Area: Title, Category, Notes */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-200 truncate">
                      {topic.title}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-900 border border-slate-800 text-indigo-400 rounded-full">
                      {topic.category}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Started: {getFormattedDateLabel(topic.initialDate)}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400 font-medium">
                      Progress: {completion}% Completed
                    </span>
                  </div>

                  {topic.notes && (
                    <div className="text-xs">
                      <button
                        onClick={() => toggleExpandNotes(topic.id)}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {isExpanded ? 'Hide notes' : 'View notes'}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-2 p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                          {topic.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Middle Area: Revision Stages Timeline */}
                <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60 max-w-full overflow-x-auto">
                  {(topic.revisions || []).map((rev) => {
                    const isDue = rev.date <= todayStr && !rev.completed;
                    
                    return (
                      <div 
                        key={rev.stage}
                        className="flex flex-col items-center min-w-[70px] space-y-1 text-center"
                      >
                        <span className="text-[10px] font-semibold text-slate-400">
                          Rev {rev.stage}
                        </span>
                        
                        <button
                          onClick={() => onToggleRevision(topic.id, rev.stage)}
                          className={`p-1 rounded-full transition-all ${
                            rev.completed 
                              ? 'text-emerald-400 hover:text-emerald-300' 
                              : isDue 
                                ? 'text-amber-500 hover:text-indigo-400 animate-pulse' 
                                : 'text-slate-600 hover:text-indigo-400'
                          }`}
                          title={`Scheduled for: ${getFormattedDateLabel(rev.date)}. Click to toggle.`}
                        >
                          {rev.completed ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : isDue ? (
                            <AlertCircle className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <span className={`text-[10px] ${
                          rev.completed 
                            ? 'text-slate-500 font-medium' 
                            : isDue 
                              ? 'text-amber-500 font-semibold' 
                              : 'text-slate-500'
                        }`}>
                          {rev.date.split('-').slice(1).join('/')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Right Area: Delete and Edit actions */}
                <div className="flex items-center gap-2.5 self-stretch justify-end border-t border-slate-900 md:border-none pt-3 md:pt-0">
                  <button
                    onClick={() => onEditTopic(topic)}
                    className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-900 transition-all text-xs"
                    title="Edit Topic"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this topic and all its revision dates? This cannot be undone.')) {
                        onDeleteTopic(topic.id);
                      }
                    }}
                    className="p-2 border border-red-950/45 hover:border-red-900/60 bg-slate-950 text-red-400 hover:text-red-300 rounded-xl hover:bg-red-950/20 transition-all text-xs"
                    title="Delete Topic"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
