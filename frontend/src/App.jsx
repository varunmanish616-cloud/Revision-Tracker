import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Calendar as CalendarIcon, ListTodo, GraduationCap, Clock, Award, Sparkles, Database, WifiOff } from 'lucide-react';
import { 
  API_fetchTopics, 
  API_createTopic, 
  API_updateTopic, 
  API_deleteTopic, 
  saveTopicsLocal, 
  getTodayDateStr 
} from './utils/revision';
import Calendar from './components/Calendar';
import TodayAgenda from './components/TodayAgenda';
import TopicModal from './components/TopicModal';
import TopicList from './components/TopicList';

export default function App() {
  const [topics, setTopics] = useState([]);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Initialize topics from backend API
  useEffect(() => {
    async function loadData() {
      const response = await API_fetchTopics();
      setTopics(response.data);
      setIsOffline(response.isOffline);
    }
    loadData();
  }, []);

  // Save changes locally and to backend
  const handleSaveTopic = async (newOrUpdatedTopic) => {
    const exists = topics.some(t => t.id === newOrUpdatedTopic.id);
    if (exists) {
      const response = await API_updateTopic(newOrUpdatedTopic);
      setIsOffline(response.isOffline);
      
      const updated = topics.map(t => t.id === newOrUpdatedTopic.id ? response.data : t);
      setTopics(updated);
      if (response.isOffline) {
        saveTopicsLocal(updated);
      }
    } else {
      const response = await API_createTopic(newOrUpdatedTopic);
      setIsOffline(response.isOffline);
      
      const updated = [...topics, response.data];
      setTopics(updated);
      if (response.isOffline) {
        saveTopicsLocal(updated);
      }
    }
  };

  // Delete topic
  const handleDeleteTopic = async (topicId) => {
    const response = await API_deleteTopic(topicId);
    setIsOffline(response.isOffline);
    
    const updated = topics.filter(t => t.id !== topicId);
    setTopics(updated);
    if (response.isOffline) {
      saveTopicsLocal(updated);
    }
  };

  // Toggle completion of a specific revision checkpoint
  const handleToggleRevision = async (topicId, stage) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    const updatedRevisions = topic.revisions.map(rev => {
      if (rev.stage === stage) {
        return { ...rev, completed: !rev.completed };
      }
      return rev;
    });

    const updatedTopic = { ...topic, revisions: updatedRevisions };
    const response = await API_updateTopic(updatedTopic);
    setIsOffline(response.isOffline);

    const updated = topics.map(t => t.id === topicId ? response.data : t);
    setTopics(updated);
    if (response.isOffline) {
      saveTopicsLocal(updated);
    }
  };

  // Trigger editing a topic (opens modal)
  const handleEditClick = (topic) => {
    setTopicToEdit(topic);
    setIsModalOpen(true);
  };

  // Add dummy/mock data
  const handleAddMockData = async () => {
    const getRelativeDateStr = (daysOffset) => {
      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).slice(2);

    // Note: We adjust initial study dates so relative cumulative revisions [+3, +10, +25, +55] trigger due alerts
    const mockTopics = [
      {
        id: generateId(),
        title: 'React Server Components & SSR',
        category: 'Coding',
        notes: 'Read official React docs and watch Vercel keynotes.\nFocus on difference between Client vs Server components.',
        initialDate: getRelativeDateStr(-3), // Started 3 days ago. Rev 1 (+3d) is TODAY!
        revisions: [
          { stage: 1, date: getRelativeDateStr(0), completed: false }, // Due Today
          { stage: 2, date: getRelativeDateStr(7), completed: false }, // 10d from study (7d from Rev 1)
          { stage: 3, date: getRelativeDateStr(22), completed: false }, // 25d from study (15d from Rev 2)
          { stage: 4, date: getRelativeDateStr(52), completed: false }, // 55d from study (30d from Rev 3)
        ]
      },
      {
        id: generateId(),
        title: 'Verbes Irréguliers (French Conjugation)',
        category: 'Languages',
        notes: 'Focus on Subjonctif and Conditionnel present tenses.\nPractice verbs: avoir, être, aller, faire, vouloir.',
        initialDate: getRelativeDateStr(-10), // Started 10 days ago. Rev 2 (+10d) is TODAY!
        revisions: [
          { stage: 1, date: getRelativeDateStr(-7), completed: true },  // Completed 7 days ago (+3d offset)
          { stage: 2, date: getRelativeDateStr(0), completed: false },  // Due Today (+10d offset)
          { stage: 3, date: getRelativeDateStr(15), completed: false }, // +25d offset
          { stage: 4, date: getRelativeDateStr(45), completed: false }, // +55d offset
        ]
      },
      {
        id: generateId(),
        title: 'Linear Regression & Cost Functions',
        category: 'Mathematics',
        notes: 'Study gradient descent convergence steps.\nMinimize Mean Squared Error (MSE).',
        initialDate: getRelativeDateStr(-5), // Started 5 days ago. Rev 1 (+3d) was due 2 days ago (OVERDUE)!
        revisions: [
          { stage: 1, date: getRelativeDateStr(-2), completed: false }, // Overdue!
          { stage: 2, date: getRelativeDateStr(5), completed: false },  // +10d offset
          { stage: 3, date: getRelativeDateStr(20), completed: false }, // +25d offset
          { stage: 4, date: getRelativeDateStr(50), completed: false }, // +55d offset
        ]
      }
    ];

    const updatedList = [...topics];
    for (const mock of mockTopics) {
      const response = await API_createTopic(mock);
      updatedList.push(response.data);
      if (response.isOffline) {
        setIsOffline(true);
      }
    }
    setTopics(updatedList);
    if (isOffline) {
      saveTopicsLocal(updatedList);
    }
  };

  // Compile general planner statistics
  const totalTopics = topics.length;
  let totalRevisions = 0;
  let completedRevisions = 0;
  let pendingRevisionsToday = 0;
  const todayStr = getTodayDateStr();

  topics.forEach(topic => {
    if (topic && topic.revisions) {
      topic.revisions.forEach(rev => {
        totalRevisions++;
        if (rev.completed) {
          completedRevisions++;
        } else if (rev.date <= todayStr) {
          pendingRevisionsToday++;
        }
      });
    }
  });

  const completionPercentage = totalRevisions > 0 
    ? Math.round((completedRevisions / totalRevisions) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 bg-slate-900 border-b md:border-r border-slate-800 flex flex-col flex-shrink-0">
        
        {/* Header / Branding */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/10">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-100 text-lg tracking-tight select-none">RecallGrid</h1>
              <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Spaced Planner</p>
            </div>
          </div>

          {/* Database Connection Status Icon */}
          <div className="ml-auto" title={isOffline ? 'Disconnected - Offline Fallback' : 'Synced with MongoDB database'}>
            {isOffline ? (
              <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/25 animate-pulse">
                <WifiOff className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/25">
                <Database className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Global Action Add Button */}
        <div className="px-6 py-5 border-b border-slate-800 flex flex-col gap-2.5">
          <button
            onClick={() => {
              setTopicToEdit(null);
              setIsModalOpen(true);
            }}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/25 active:transform active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add New Topic
          </button>

          {totalTopics === 0 && (
            <button
              onClick={handleAddMockData}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-indigo-200 border border-slate-700/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Study Plan
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="p-4 space-y-1.5 border-b border-slate-800">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-all ${
              currentTab === 'dashboard'
                ? 'bg-slate-800 text-white border-l-4 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
            }`}
          >
            <span className="flex items-center gap-3">
              <CalendarIcon className="w-4 h-4" />
              Calendar Dashboard
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('manage')}
            className={`w-full px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-all ${
              currentTab === 'manage'
                ? 'bg-slate-800 text-white border-l-4 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
            }`}
          >
            <span className="flex items-center gap-3">
              <ListTodo className="w-4 h-4" />
              Manage Topics Board
            </span>
            <span className="bg-slate-950 text-slate-400 text-xs px-2 py-0.5 rounded-md border border-slate-800 min-w-5 text-center font-bold">
              {totalTopics}
            </span>
          </button>
        </nav>

        {/* Sidebar Widget: Today's Agenda list */}
        <div className="flex-1 min-h-[300px] p-4 bg-slate-900">
          <TodayAgenda topics={topics} onToggleRevision={handleToggleRevision} />
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        
        {/* Connection Offline Indicator Strip */}
        {isOffline && (
          <div className="bg-amber-600/90 text-slate-100 px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-inner border-b border-amber-700 select-none animate-pulse">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <span>Connection to local MongoDB backend lost. System is running in LocalStorage fallback mode. All updates are temporarily stored in this browser.</span>
          </div>
        )}

        {/* Header Stats bar */}
        <header className="p-6 md:p-8 border-b border-slate-900 bg-slate-900/20 backdrop-blur-md sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-1">
              {currentTab === 'dashboard' ? 'Calendar Tracker' : 'Revision Registry'}
            </h2>
            <p className="text-xs text-slate-400">
              {currentTab === 'dashboard' 
                ? 'Visualize baseline study dates and cumulative revision cycles (+3, +10, +25, +55 days).'
                : 'Edit details, delete plans, or directly mark individual revision stages.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:w-auto">
            {/* Metric 1 */}
            <div className="bg-slate-900 border border-slate-850/80 p-3 rounded-xl min-w-[90px] sm:min-w-[110px] flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Topics</span>
              </div>
              <span className="text-lg font-extrabold text-slate-100 leading-none">{totalTopics}</span>
            </div>

            {/* Metric 2 */}
            <div className="bg-slate-900 border border-slate-850/80 p-3 rounded-xl min-w-[90px] sm:min-w-[110px] flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
              </div>
              <span className="text-lg font-extrabold text-slate-100 leading-none">{pendingRevisionsToday}</span>
            </div>

            {/* Metric 3 */}
            <div className="bg-slate-900 border border-slate-850/80 p-3 rounded-xl min-w-[90px] sm:min-w-[110px] flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Done</span>
              </div>
              <span className="text-lg font-extrabold text-slate-100 leading-none">{completionPercentage}%</span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <section className="p-6 md:p-8 flex-1">
          {currentTab === 'dashboard' ? (
            <Calendar 
              topics={topics} 
              onToggleRevision={handleToggleRevision} 
              onEditTopic={handleEditClick}
              onDeleteTopic={handleDeleteTopic}
            />
          ) : (
            <TopicList 
              topics={topics} 
              onToggleRevision={handleToggleRevision} 
              onEditTopic={handleEditClick}
              onDeleteTopic={handleDeleteTopic}
            />
          )}
        </section>
      </main>

      {/* Adding/Editing Topic Modal Form */}
      <TopicModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setTopicToEdit(null);
        }}
        onSave={handleSaveTopic}
        topicToEdit={topicToEdit}
      />
    </div>
  );
}
