import React from 'react';
import { CheckCircle2, Circle, AlertCircle, CalendarRange } from 'lucide-react';
import { getTodayDateStr } from '../utils/revision';

export default function TodayAgenda({ topics, onToggleRevision }) {
  const todayStr = getTodayDateStr();

  // Find all revisions due today or overdue (not completed)
  const agendaItems = [];

  (topics || []).forEach((topic) => {
    if (!topic) return;
    (topic.revisions || []).forEach((revision) => {
      if (!revision) return;
      const isDueOrOverdue = revision.date <= todayStr;
      
      if (isDueOrOverdue && !revision.completed) {
        let isToday = revision.date === todayStr;
        
        // Calculate days overdue
        let daysOverdue = 0;
        if (!isToday) {
          const dueTime = new Date(revision.date).getTime();
          const todayTime = new Date(todayStr).getTime();
          const diffTime = todayTime - dueTime;
          daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        agendaItems.push({
          topicId: topic.id,
          topicTitle: topic.title,
          category: topic.category,
          stage: revision.stage,
          dueDate: revision.date,
          isToday,
          daysOverdue,
          revision
        });
      }
    });
  });

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-indigo-400" />
          Today's Agenda
        </h3>
        <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">
          {agendaItems.length} due
        </span>
      </div>

      {/* Agenda Items List */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-800">
        {agendaItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-medium text-slate-300">All caught up!</h4>
            <p className="text-xs text-slate-500 mt-1">
              No revisions due for today. Keep up the great work!
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {agendaItems.map((item) => (
              <div 
                key={`${item.topicId}-r${item.stage}`}
                className="group p-4 bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-xl transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => onToggleRevision(item.topicId, item.stage)}
                    className="mt-0.5 text-slate-500 hover:text-indigo-400 transition-colors flex-shrink-0"
                    title="Mark as completed"
                  >
                    <Circle className="w-5 h-5 transition-transform group-hover:scale-105" />
                  </button>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                      {item.topicTitle}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {/* Topic Category */}
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-400 rounded-md border border-slate-700">
                        {item.category}
                      </span>
                      
                      {/* Revision Stage */}
                      <span className="text-[10px] text-slate-400 font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/15 px-1.5 py-0.5 rounded">
                        Rev {item.stage}
                      </span>

                      {/* Due/Overdue Status Label */}
                      {item.isToday ? (
                        <span className="text-[10px] text-emerald-400 font-medium ml-auto flex items-center gap-1">
                          ● Today
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-semibold ml-auto flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {item.daysOverdue}d overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
