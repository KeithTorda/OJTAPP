import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Stats = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState({ total_hours: 0, count: 0, target_hours: 600 });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTarget, setNewTarget] = useState('');
  const [isSavingTarget, setIsSavingTarget] = useState(false);

  // Derived Target
  const TARGET_HOURS = summary.target_hours || 600;

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get(`/read.php?user_id=${user.id}`);
      if (response.data.summary) {
        setSummary({
          total_hours: parseFloat(response.data.summary.total_hours) || 0,
          target_hours: parseInt(response.data.summary.target_hours) || 600,
          count: response.data.records ? response.data.records.length : 0
        });
        setNewTarget(response.data.summary.target_hours || 600);
      }
    } catch (error) {
      console.error("Error fetching stats", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTarget = async () => {
    if (!newTarget || isNaN(newTarget) || parseInt(newTarget) <= 0) return;
    setIsSavingTarget(true);
    try {
      await api.post('/update_target.php', {
        user_id: user.id,
        target_hours: parseInt(newTarget)
      });
      setSummary(prev => ({ ...prev, target_hours: parseInt(newTarget) }));
      setIsEditingTarget(false);
    } catch (error) {
      console.error("Error updating target hours", error);
    } finally {
      setIsSavingTarget(false);
    }
  };

  const completionPercentage = Math.min(100, Math.round((summary.total_hours / TARGET_HOURS) * 100));
  const remainingHours = Math.max(0, TARGET_HOURS - summary.total_hours);
  const averageHoursPerTask = summary.count > 0 ? (summary.total_hours / summary.count).toFixed(1) : 0;

  // Dynamic efficiency rating
  const getEfficiencyRating = () => {
    if (summary.count === 0) return { grade: '—', desc: 'No data logged yet.' };
    const avgH = summary.total_hours / summary.count;
    if (avgH >= 7) return { grade: 'A+', desc: 'Outstanding performance. High-value training hours.' };
    if (avgH >= 5) return { grade: 'A', desc: 'Strong training consistency.' };
    if (avgH >= 3) return { grade: 'B', desc: 'Good progress. Maintain pace.' };
    return { grade: 'C', desc: 'Increase training duration per session.' };
  };
  const effRating = getEfficiencyRating();

  return (
    <div className="relative min-h-screen pb-32 selection:bg-primary selection:text-black">
      <div className="fixed inset-0 z-0 bg-grid-pattern pointer-events-none opacity-50"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background-dark via-transparent to-background-dark pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="sticky top-0 z-50">
          <Header title="PERFORMANCE METRICS" subtitle={`ANALYSIS // ${user?.username?.toUpperCase()}`} />
        </div>
        
        <main className="flex-1 flex flex-col gap-6 px-4 py-8 max-w-3xl mx-auto w-full">
          
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden backdrop-blur-md border border-primary/30 shadow-[0_0_30px_rgba(0,242,255,0.05)]">
            <div className="flex justify-between items-center mb-6 border-b border-primary/20 pb-4">
               <div>
                 <h2 className="text-xl font-display font-bold text-white tracking-wider">OJT PROGRESS</h2>
                 <span className="text-xs font-mono text-primary/70 uppercase tracking-widest">Global Requirement Status</span>
               </div>
               <span className="material-symbols-outlined text-4xl text-primary/30">monitoring</span>
            </div>

            <div className="space-y-6">
               <div>
                  <div className="flex justify-between items-center text-sm font-mono mb-2">
                     <span className="text-slate-400">Total Hours Accumulated</span>
                     
                     <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{summary.total_hours} / </span>
                        {isEditingTarget ? (
                          <div className="flex items-center gap-1">
                            <input 
                               type="number" 
                               value={newTarget} 
                               onChange={(e) => setNewTarget(e.target.value)} 
                               className="w-16 bg-background-dark border border-primary text-white text-center rounded text-sm px-1 outline-none focus:ring-1 focus:ring-primary"
                               autoFocus
                            />
                            <button onClick={handleUpdateTarget} disabled={isSavingTarget} className="text-primary hover:text-white bg-primary/20 p-1 rounded transition-colors disabled:opacity-50">
                               <span className="material-symbols-outlined text-[14px]">
                                 {isSavingTarget ? 'sync' : 'check'}
                               </span>
                            </button>
                            <button onClick={() => {setIsEditingTarget(false); setNewTarget(summary.target_hours);}} className="text-red-400 hover:text-red-300 bg-red-400/20 p-1 rounded transition-colors">
                               <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 group cursor-pointer" onClick={() => setIsEditingTarget(true)}>
                            <span className="text-white font-bold border-b border-dashed border-primary/50 group-hover:border-primary transition-colors">{TARGET_HOURS} <span className="text-primary text-xs ml-1">HRS</span></span>
                            <span className="material-symbols-outlined text-[14px] text-primary/50 group-hover:text-primary transition-colors">edit</span>
                          </div>
                        )}
                     </div>
                  </div>
                  <div className="w-full bg-slate-800/80 h-4 rounded-full overflow-hidden border border-slate-700">
                     <div className="bg-gradient-to-r from-primary/50 to-primary h-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,242,255,0.5)]" style={{ width: `${completionPercentage}%` }}></div>
                  </div>
               </div>

               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  <div className="bg-background-dark/50 p-4 rounded-lg border border-primary/10 flex flex-col items-center justify-center text-center">
                     <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">Completion</span>
                     <span className="text-2xl font-display font-bold text-white">{completionPercentage}<span className="text-primary text-sm">%</span></span>
                  </div>
                  <div className="bg-background-dark/50 p-4 rounded-lg border border-primary/10 flex flex-col items-center justify-center text-center">
                     <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">Remaining</span>
                     <span className="text-2xl font-display font-bold text-white">{remainingHours}<span className="text-primary text-sm">H</span></span>
                  </div>
                  <div className="bg-background-dark/50 p-4 rounded-lg border border-primary/10 flex flex-col items-center justify-center text-center">
                     <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">Total Logs</span>
                     <span className="text-2xl font-display font-bold text-white">{summary.count}</span>
                  </div>
                  <div className="bg-background-dark/50 p-4 rounded-lg border border-primary/10 flex flex-col items-center justify-center text-center">
                     <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">Avg Task Time</span>
                     <span className="text-2xl font-display font-bold text-white">{averageHoursPerTask}<span className="text-primary text-sm">H</span></span>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="glass-panel p-5 rounded-xl border-l-4 border-l-orange-500/50">
               <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm">military_tech</span>
                 Efficiency Rating
               </h3>
               <p className="text-3xl font-display font-bold text-white">{effRating.grade}</p>
               <p className="text-[10px] text-slate-500 mt-2 font-mono">{effRating.desc}</p>
             </div>
             
             <div className="glass-panel p-5 rounded-xl border-l-4 border-l-matrix-green/50">
               <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm">verified_user</span>
                 System Clearance
               </h3>
               <p className="text-3xl font-display font-bold text-white">{completionPercentage >= 75 ? 'LEVEL 3' : completionPercentage >= 25 ? 'LEVEL 2' : 'LEVEL 1'}</p>
               <p className="text-[10px] text-slate-500 mt-2 font-mono">{completionPercentage >= 75 ? 'Advanced clearance.' : completionPercentage >= 25 ? 'Standard access granted.' : 'Awaiting sufficient hours.'}</p>
             </div>
          </div>
          
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default Stats;
