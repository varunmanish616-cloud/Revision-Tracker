import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, FileText } from 'lucide-react';
import { getTodayDateStr, calculateRevisions } from '../utils/revision';

const PRESETS = ['Coding', 'Languages', 'Mathematics', 'Science', 'History', 'Other'];

export default function TopicModal({ isOpen, onClose, onSave, topicToEdit }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Coding');
  const [customCategory, setCustomCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [initialDate, setInitialDate] = useState(getTodayDateStr());

  useEffect(() => {
    if (isOpen) {
      if (topicToEdit) {
        setTitle(topicToEdit.title || '');
        const isPreset = PRESETS.includes(topicToEdit.category);
        if (isPreset) {
          setCategory(topicToEdit.category);
          setCustomCategory('');
        } else {
          setCategory('Other');
          setCustomCategory(topicToEdit.category || '');
        }
        setNotes(topicToEdit.notes || '');
        setInitialDate(topicToEdit.initialDate || getTodayDateStr());
      } else {
        setTitle('');
        setCategory('Coding');
        setCustomCategory('');
        setNotes('');
        setInitialDate(getTodayDateStr());
      }
    }
  }, [isOpen, topicToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = category === 'Other' ? (customCategory.trim() || 'Other') : category;

    if (topicToEdit) {
      // If updating, check if initialDate changed
      const dateChanged = topicToEdit.initialDate !== initialDate;
      const updatedRevisions = dateChanged
        ? calculateRevisions(initialDate) // Recalculate
        : topicToEdit.revisions;         // Keep completion status

      onSave({
        ...topicToEdit,
        title: title.trim(),
        category: finalCategory,
        notes: notes.trim(),
        initialDate,
        revisions: updatedRevisions,
      });
    } else {
      // New topic
      onSave({
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        title: title.trim(),
        category: finalCategory,
        notes: notes.trim(),
        initialDate,
        revisions: calculateRevisions(initialDate)
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden border border-slate-800 bg-slate-900 rounded-2xl shadow-2xl transition-all duration-300">
        
        {/* Decorative Top Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            {topicToEdit ? 'Edit Study Topic' : 'Add New Study Topic'}
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Topic Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Topic Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              placeholder="e.g. Redux Toolkit Middleware, French Conjunctions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Category / Subject
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {PRESETS.map((preset) => (
                  <option key={preset} value={preset} className="bg-slate-900">
                    {preset}
                  </option>
                ))}
              </select>
            </div>

            {category === 'Other' && (
              <div className="animate-slide-up">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Custom Category <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required={category === 'Other'}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="Enter subject name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Initial Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Initial Study Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
              value={initialDate}
              onChange={(e) => setInitialDate(e.target.value)}
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              The revision schedule (3 days, 7 days, 15 days, 30 days) starts from this date.
            </p>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Notes / Resource Links (Optional)
            </label>
            <textarea
              rows="3"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
              placeholder="Key concepts, page numbers, links, questions to focus on..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-900/30"
            >
              {topicToEdit ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
