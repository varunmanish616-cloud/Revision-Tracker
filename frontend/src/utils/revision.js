const STORAGE_KEY = 'spaced_repetition_planner_topics';

const BASE_URL = 
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 
  (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) || 
  'http://localhost:3001';
const API_URL = `${BASE_URL}/api/topics`;

export function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getTodayDateStr() {
  return formatDate(new Date());
}

// Absolute cumulative offsets from initial study date: D+3, D+10 (3+7), D+25 (10+15), D+55 (25+30)
export function calculateRevisions(initialDateStr) {
  const parts = initialDateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const intervals = [3, 10, 25, 55];
  
  return intervals.map((daysToAdd, index) => {
    const revisionDate = new Date(year, month, day + daysToAdd);
    return {
      stage: index + 1,
      date: formatDate(revisionDate),
      completed: false
    };
  });
}

// LocalStorage Fallback Helpers
export function loadTopicsLocal() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error loading fallback topics:', err);
    return [];
  }
// }

export function saveTopicsLocal(topics) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  } catch (err) {
    console.error('Error saving fallback topics:', err);
  }
}

// API Connection Helpers with LocalStorage fallbacks
export async function API_fetchTopics() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('API server returned error status');
    const data = await res.json();
    return { data, isOffline: false };
  } catch (err) {
    console.warn('API fetch failed, falling back to LocalStorage:', err.message);
    const data = loadTopicsLocal();
    return { data, isOffline: true };
  }
}

export async function API_createTopic(topic) {
  const topicWithId = {
    ...topic,
    id: topic.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).slice(2))
  };
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topicWithId)
    });
    if (!res.ok) throw new Error('API create failed');
    const data = await res.json();
    return { data, isOffline: false };
  } catch (err) {
    console.warn('API create failed, saving locally:', err.message);
    return { data: topicWithId, isOffline: true };
  }
}

export async function API_updateTopic(topic) {
  try {
    const res = await fetch(`${API_URL}/${topic.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic)
    });
    if (!res.ok) throw new Error('API update failed');
    const data = await res.json();
    return { data, isOffline: false };
  } catch (err) {
    console.warn('API update failed, updating locally:', err.message);
    return { data: topic, isOffline: true };
  }
}

export async function API_deleteTopic(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('API delete failed');
    return { id, isOffline: false };
  } catch (err) {
    console.warn('API delete failed, deleting locally:', err.message);
    return { id, isOffline: true };
  }
}

export function getFormattedDateLabel(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dateObj = new Date(year, month, day);
  return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
