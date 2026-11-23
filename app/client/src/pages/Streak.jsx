import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStoredState } from '../hooks';
import { PageTitle } from '../components/Common';
export const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function practice(streak, dailyMode, now = new Date()) {
  const today = dayKey(now);
  if (dailyMode && streak.lastDate === today) return streak;
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  const days = dailyMode && streak.lastDate && streak.lastDate !== dayKey(yesterday) ? 1 : streak.days + 1;
  return { ...streak, days, reward: streak.reward + streak.daily, lastDate: today };
}
function loadLegacyStreak() {
  try {
    const target = Number(localStorage.getItem('target'));
    if (!target) return null;
    const clicked = Number(localStorage.getItem('lastClicked'));
    return { title: localStorage.getItem('title') || 'My streak', target, daily: Number(localStorage.getItem('daily')) || 0, days: Number(localStorage.getItem('streak')) || 0, reward: Number(localStorage.getItem('reward')) || 0, lastDate: clicked ? dayKey(new Date(clicked)) : '' };
  } catch { return null; }
}
export default function Streak() {
  const dailyMode = useLocation().pathname.endsWith('/new');
  const [streak, setStreak] = useStoredState(dailyMode ? 'imradhe:streak:daily' : 'imradhe:streak', loadLegacyStreak());
  const [notice, setNotice] = useState('');
  function start(event) {
    event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget));
    setStreak({ title: values.title, target: Number(values.target), daily: Number(values.daily), days: 0, reward: 0, lastDate: '' }); setNotice('');
  }
  const completed = streak && streak.reward >= streak.target;
  return <div className="auth card center"><PageTitle title="StreakTracker"/><p className="eyebrow">Streak & Reward</p><h1>StreakTracker</h1><p>{dailyMode ? 'Build a daily habit, one check-in per calendar day.' : 'Track each practice session and earn a reward.'}</p>{!streak ? <form onSubmit={start}><label>Streak title<input name="title" required maxLength={100}/></label><label>Target reward (₹)<input name="target" type="number" min="1" max="10000000" step="1" required/></label><label>Reward per practice (₹)<input name="daily" type="number" min="1" max="10000000" step="1" required/></label><button>Start streak</button></form> : <><h2>{streak.title}</h2><div className="streak-count">{streak.days}</div><p>Reward: ₹{streak.reward} / ₹{streak.target}</p><progress value={streak.reward} max={streak.target}/>{completed ? <h3>Congratulations! You reached your target.</h3> : <button onClick={() => { const updated = practice(streak, dailyMode); if (updated === streak) setNotice('Already practiced today. Come back tomorrow.'); else { setStreak(updated); setNotice('Practice recorded!'); } }}>Practice for the day</button>}<p role="status">{notice}</p><button className="secondary" onClick={() => { setStreak(null); setNotice(''); }}>Reset reward</button></>}</div>;
}
