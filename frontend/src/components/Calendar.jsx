import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, CalendarIcon, Trash2, Edit2 } from 'lucide-react';
import { formatDate } from '../utils/revision';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar({ topics, onToggleRevision, onEditTopic, onDeleteTopic }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  
  // Selected event for modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const d = new Date();
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
  };

  // Generate Calendars Cells
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDayOfWeek = firstDay.getDay(); // 0-6
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const cells = [];

  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
    cells.push({
      isCurrentMonth: false,
      date: d,
      dateStr: formatDate(d),
      dayNum: prevMonthDays - i
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentYear, currentMonth, i);
    cells.push({
      isCurrentMonth: true,
      date: d,
      dateStr: formatDate(d),
      dayNum: i
    });
  }

  // Next month padding to reach 42 grid cells
  const totalCellsNeeded = 42;
  const nextMonthCells = totalCellsNeeded - cells.length;
  for (let i = 1; i <= nextMonthCells; i++) {
    const d = new Date(currentYear, currentMonth + 1, i);
    cells.push({
      isCurrentMonth: false,
      date: d,
      dateStr: formatDate(d),
      dayNum: i
    });
  }

  // Find all events for a given day
  const getEventsForDate = (dateStr) => {
    const events = [];

    (topics || []).forEach(topic => {
      if (!topic) return;

      // 1. Check if it's the Initial Study event
      if (topic.initialDate === dateStr) {
        events.push({
          type: 'initial',
          topic,
          label: 'Initial',
          stage: 0,
          completed: true, // Initial study is reference day
          dateStr
        });
      }

      // 2. Check if it matches any revision dates
      (topic.revisions || []).forEach(rev => {
        if (rev && rev.date === dateStr) {
          events.push({
            type: 'revision',
            topic,
            label: `Rev ${rev.stage}`,
            stage: rev.stage,
            completed: rev.completed,
            dateStr
          });
        }
      });
    });

    return events;
  };

  const handleEventClick = (e, event) => {
    e.stopPropagation();
    setSelectedEvent(event);
  };

  const todayStr = formatDate(today);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold text-slate-100 flex items-baseline gap-2">
            <span>{MONTHS[currentMonth]}</span>
            <span className="text-slate-400 font-semibold text-sm">{currentYear}</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToday}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-200 transition-all hover:text-white"
          >
            Today
          </button>
          
          <div className="flex items-center bg-slate-800 border border-slate-700/60 rounded-xl overflow-hidden">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-700/60" />
            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-xs font-bold uppercase tracking-wider text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[450px]">
        {cells.map((cell, index) => {
          const dayEvents = getEventsForDate(cell.dateStr);
          const isTodayCell = cell.dateStr === todayStr;

          return (
            <div
              key={index}
              className={`min-h-[72px] lg:min-h-[85px] p-2 bg-slate-950/40 border border-slate-850 hover:bg-slate-800/20 rounded-xl flex flex-col transition-all cursor-default ${
                cell.isCurrentMonth ? '' : 'opacity-30'
              } ${isTodayCell ? 'ring-2 ring-indigo-500/50 bg-indigo-950/10' : ''}`}
            >
              {/* Day Number Label */}
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-semibold rounded-md w-5 h-5 flex items-center justify-center ${
                  isTodayCell ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
                }`}>
                  {cell.dayNum}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-1 py-px rounded-md border border-slate-750">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Event Stack */}
              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-none max-h-[60px] lg:max-h-[75px]">
                {dayEvents.map((evt, eIdx) => {
                  const isInitial = evt.type === 'initial';
                  
                  return (
                    <div
                      key={eIdx}
                      onClick={(e) => handleEventClick(e, evt)}
                      className={`text-[9px] px-1.5 py-0.5 rounded border-l-2 truncate cursor-pointer transition-all ${
                        isInitial 
                          ? 'bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 border-l-emerald-500 border-emerald-900/30' 
                          : evt.completed 
                            ? 'bg-slate-800/40 hover:bg-slate-750/50 text-slate-500 border-l-slate-600 border-slate-800 line-through opacity-70' 
                            : 'bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300 border-l-indigo-500 border-indigo-900/30'
                      }`}
                      title={`${evt.topic.title} - ${evt.label}`}
                    >
                      {evt.topic.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl transition-all">
            
            {/* Top color strap */}
            <div className={`h-1.5 w-full ${
              selectedEvent.type === 'initial' 
                ? 'bg-emerald-500' 
                : selectedEvent.completed 
                  ? 'bg-slate-600' 
                  : 'bg-indigo-500'
            }`} />

            {/* Header */}
            <div className="flex justify-between items-start p-5 border-b border-slate-800">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border border-slate-750 mb-2 ${
                  selectedEvent.type === 'initial'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : selectedEvent.completed
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                }`}>
                  {selectedEvent.type === 'initial' ? 'Initial Study Event' : `Revision - Stage ${selectedEvent.stage}`}
                </span>
                <h3 className="text-lg font-bold text-slate-100 leading-snug">
                  {selectedEvent.topic.title}
                </h3>
              </div>
              <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800"
            >
              <ChevronLeft className="w-5 h-5 hidden" />
              <span className="text-sm font-semibold text-slate-400 hover:text-slate-200">Close</span>
            </button>
          </div>

          {/* Details Body */}
          <div className="p-5 space-y-4">
            {/* Category */}
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subject</span>
              <span className="col-span-2 text-sm text-slate-200 font-medium">
                {selectedEvent.topic.category}
              </span>
            </div>

            {/* Revision Target Date */}
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Event Date</span>
              <span className="col-span-2 text-sm text-slate-200 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                {selectedEvent.dateStr}
              </span>
            </div>

            {/* Status */}
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</span>
              <span className="col-span-2 text-sm">
                {selectedEvent.type === 'initial' ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Completed (Baseline)
                  </span>
                ) : selectedEvent.completed ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Revision Completed
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4 animate-pulse" /> Revision Pending
                  </span>
                )}
              </span>
            </div>

            {/* Notes */}
            {selectedEvent.topic.notes && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Study Notes / References
                </span>
                <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {selectedEvent.topic.notes}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 bg-slate-950 flex flex-wrap gap-2.5 justify-between items-center border-t border-slate-800">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onEditTopic(selectedEvent.topic);
                  setSelectedEvent(null);
                }}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Delete this study plan altogether? This wipes out all its revision checkpoints too.')) {
                    onDeleteTopic(selectedEvent.topic.id);
                    setSelectedEvent(null);
                  }
                }}
                className="px-3 py-1.5 bg-red-950/20 border border-red-900/40 hover:border-red-600 text-red-400 hover:text-red-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>

            {selectedEvent.type === 'revision' && (
              <button
                onClick={() => {
                  onToggleRevision(selectedEvent.topic.id, selectedEvent.stage);
                  setSelectedEvent(prev => ({
                    ...prev,
                    completed: !prev.completed
                  }));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedEvent.completed
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow shadow-indigo-900/10'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {selectedEvent.completed ? 'Mark Incomplete' : 'Mark Completed'}
              </button>
            )}

            {/* Close Button */}
            {selectedEvent.type === 'initial' && (
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-medium ml-auto"
              >
                Close
              </button>
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
