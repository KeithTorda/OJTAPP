import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ChatWidget from '../components/ChatWidget';
import Header from '../components/Header';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ total_hours: 0, target_hours: 600 });
  const [isLoading, setIsLoading] = useState(true);
  const [liveTime, setLiveTime] = useState(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    try {
      const response = await api.get(`/read.php?user_id=${user.id}`);
      if (response.data.records) {
        setLogs(response.data.records);
        setSummary({
          total_hours: parseFloat(response.data.summary.total_hours) || 0,
          target_hours: parseInt(response.data.summary.target_hours) || 600,
        });
      } else {
        setLogs([]);
        setSummary({ total_hours: 0, target_hours: 600 });
      }
    } catch (error) {
      console.error('Error fetching logs', error);
    } finally {
      setIsLoading(false);
    }
  };

  const targetHours = summary.target_hours || 600;
  const completionPercentage = Math.min(100, Math.round((summary.total_hours / targetHours) * 100));
  const remainingHours = Math.max(0, targetHours - summary.total_hours);

  const formatLogDate = (value) => {
    if (!value) return 'No date';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background-dark pb-32 text-slate-100 selection:bg-primary selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-pattern opacity-30"></div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(0,242,255,0.12),transparent_38%),linear-gradient(180deg,rgba(5,10,18,0.96),rgba(5,10,18,1))]"></div>

      <div className="relative z-10">
        <div className="sticky top-0 z-40">
          <Header
            title="OJT Dashboard"
            subtitle={`Trainee / ${user?.username?.toUpperCase() || 'User'}`}
            actions={
              <button
                onClick={logout}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 transition-colors hover:bg-red-500/10"
                aria-label="Log out"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            }
          />
        </div>

        <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5">
          <section className="glass-panel rounded-[28px] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary/65">Progress Summary</p>
                <h2 className="mt-2 text-2xl font-display font-bold text-white">{completionPercentage}% complete</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  You have logged <span className="font-semibold text-white">{summary.total_hours} hours</span> out of {targetHours} required hours.
                </p>
              </div>
              <div className="rounded-2xl border border-primary/15 bg-primary/8 px-3 py-2 text-right">
                <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-primary/60">Updated</p>
                <p className="mt-1 text-sm font-medium text-white">{liveTime}</p>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-primary transition-all duration-700"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-400">Logged</p>
                <p className="mt-2 text-xl font-display font-bold text-white">{summary.total_hours}h</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-400">Remaining</p>
                <p className="mt-2 text-xl font-display font-bold text-white">{remainingHours}h</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-400">Target</p>
                <p className="mt-2 text-xl font-display font-bold text-white">{targetHours}h</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/add')}
                className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
              >
                Add new log
              </button>
              <button
                onClick={() => navigate('/logs')}
                className="flex min-h-[52px] items-center justify-center rounded-2xl border border-primary/20 bg-transparent px-4 text-sm font-medium text-white transition-colors hover:bg-primary/10"
              >
                View all logs
              </button>
            </div>
          </section>

          <section className="glass-panel rounded-[28px] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent logs</h3>
                <p className="text-xs text-slate-400">Latest training entries and submitted work.</p>
              </div>
              <button
                onClick={() => navigate('/logs')}
                className="text-xs font-medium text-primary transition-colors hover:text-white"
              >
                See all
              </button>
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-primary/10 bg-slate-950/30 px-4 py-8 text-center text-sm text-primary/60">
                Loading logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="rounded-2xl border border-primary/10 bg-slate-950/30 px-4 py-8 text-center text-sm text-slate-400">
                No logs yet. Add your first entry to start tracking progress.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {logs.slice(0, 5).map((log) => (
                  <button
                    key={log.id}
                    onClick={() => navigate(`/log/${log.id}`)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-primary/10 bg-slate-950/35 p-3 text-left transition-colors hover:bg-primary/8"
                  >
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-primary/15 bg-primary/8">
                      <span className="text-[9px] font-mono uppercase tracking-wide text-primary/60">Day</span>
                      <span className="text-base font-display font-bold text-white">{log.day_number || '-'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{log.task_desc}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>{formatLogDate(log.log_date)}</span>
                        <span>{log.hours} hrs</span>
                        {log.photos && log.photos.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-primary/70">
                            <span className="material-symbols-outlined text-[14px]">attach_file</span>
                            {log.photos.length}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <span className="material-symbols-outlined mt-1 shrink-0 text-slate-500">chevron_right</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <ChatWidget />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
