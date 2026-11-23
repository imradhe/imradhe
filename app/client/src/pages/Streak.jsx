import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useOriginalPage from '../original/useOriginalPage';
import css from '../original/styles/streak.css?raw';
import dailyCss from '../original/styles/streak-daily.css?raw';
const empty = { title: '', days: 0, reward: 0, target: 0, daily: 0, lastClicked: 0 };
function stored() { return { title: localStorage.getItem('title') || '', days: Number(localStorage.getItem('streak')) || 0, reward: Number(localStorage.getItem('reward')) || 0, target: Number(localStorage.getItem('target')) || 0, daily: Number(localStorage.getItem('daily')) || 0, lastClicked: Number(localStorage.getItem('lastClicked')) || 0 }; }
export function practice(streak, dailyMode, now = Date.now()) {
  const time = now instanceof Date ? now.getTime() : now;
  if (dailyMode && time - streak.lastClicked < 24 * 60 * 60 * 1000) return streak;
  const days = streak.days + 1;
  return { ...streak, days, reward: days >= 3 ? days * streak.daily - streak.daily : streak.reward, lastClicked: time };
}
export default function Streak() {
  const dailyMode = useLocation().pathname.endsWith('/new');
  const [streak, setStreak] = useState(stored); const [success, setSuccess] = useState(null);
  useOriginalPage({ css: dailyMode ? dailyCss : css, bodyClass: 'container text-center', title: 'StreakTracker - Streak & Reward' });
  useEffect(() => {
    for (const [key, value] of Object.entries({ title: streak.title, streak: streak.days, reward: streak.reward, target: streak.target, daily: streak.daily, lastClicked: streak.lastClicked })) localStorage.setItem(key, String(value));
  }, [streak]);
  const active = streak.days !== 0 && streak.target !== 0;
  function start(event) { event.preventDefault(); const form = Object.fromEntries(new FormData(event.currentTarget)); setStreak({ title: form.title, target: Number(form.target), daily: Number(form.daily), days: 1, reward: 0, lastClicked: dailyMode ? Date.now() : 0 }); }
  function checkIn() {
    const next = practice(streak, dailyMode);
    if (next === streak) { window.alert('Wait till next day!'); return; }
    if (next.reward >= next.target) { setSuccess(next); setStreak({ ...empty, title: next.title }); } else setStreak(next);
  }
  const title = <><h1 className="fw-bold">StreakTracker</h1><h3 className="text-nowrap">Streak & Reward</h3></>;
  return <>{dailyMode && <div className="mt-5 pt-5 mb-3">{title}</div>}<div className="container"><div className="row"><div className="col-md-6 offset-md-3"><div className="card p-5">{!dailyMode && title}<div id="app" className="card-body" style={{ display: active && !success ? 'block' : 'none' }}><h2 className="card-title fw-bolder text-danger" id="streakTitle">{streak.title}</h2><h3 className="card-title fw-bolder text-danger"><i className="bi bi-fire h1"/> <span id="streak">{streak.days}</span></h3><h5 className="card-title">Reward: <span id="reward">₹{streak.reward}</span></h5><p className="card-text">Keep track of your daily streaks!</p><button id="practice" className="btn btn-primary rounded-pill my-2" onClick={checkIn}>Practice for the day</button>{' '}<button id="reset" className="btn btn-secondary rounded-pill my-2" onClick={() => { setStreak(empty); setSuccess(null); }}>Reset Reward</button></div><form id="settings" className="card-body" style={{ display: !active && !success ? 'block' : 'none' }} onSubmit={start}><input type="text" id="title" name="title" className="rounded-pill form-control" placeholder="Enter your streak title"/><div className="row gy-2 my-3"><div className="col-md-6"><input type="number" id="target" name="target" className="rounded-pill form-control" placeholder="Enter target reward in ₹"/></div><div className="col-md-6"><input type="number" id="daily" name="daily" className="rounded-pill form-control" placeholder="Enter daily reward in ₹"/></div></div><div className="d-grid gap-2"><button id="start" className="btn btn-primary rounded-pill">Start Streak</button></div></form><div id="targetReached" className="card-body" style={{ display: success ? 'block' : 'none' }}><h2 className="card-title fw-bolder text-danger" id="successStreakTitle">{success?.title}</h2><h3 className="card-title fw-bolder text-danger"><i className="bi bi-fire h1"/> <span id="successStreak">{success?.days ?? 1}</span></h3><h5 className="card-title">Reward: <span id="successReward">{success ? `₹${success.reward}` : ''}</span></h5><h2 className="card-title fw-bolder text-success">Congrats! You reached your target</h2><button className="btn btn-primary rounded-pill" onClick={() => setSuccess(null)}>New Streak</button></div></div></div></div></div><h4 className="footer mt-5">Developed By{' '}<a rel="noopener" href="https://imradhe.com" style={{ textDecoration: 'none' }}>Radhe Shyam Salopanthula</a></h4></>;
}
