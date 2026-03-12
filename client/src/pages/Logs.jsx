import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Logs = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState(null);

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
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching logs", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen pb-32 selection:bg-primary selection:text-black">
      <div className="fixed inset-0 z-0 bg-circuit-pattern pointer-events-none"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background-dark via-transparent to-background-dark pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="sticky top-0 z-50">
          <Header title="TRAINING LOGS" subtitle={`HISTORY // ${user?.username?.toUpperCase()}`} />
        </div>
        
        <main className="flex-1 flex flex-col gap-4 px-4 py-8 max-w-3xl mx-auto w-full">
          <div className="flex items-center mb-4 pl-2 pr-1">
            <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Complete Log History</h3>
          </div>
          
          {isLoading ? (
            <div className="text-center py-10 text-primary/50 text-sm font-mono flex flex-col items-center gap-4">
               <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
               RETRIEVING RECORDS...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-primary/50 text-sm font-mono bg-[#1c2a2b]/30 rounded-xl border border-primary/20">NO LOGS FOUND IN DATABASE</div>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map((log) => (
                <div key={log.id} onClick={() => navigate(`/log/${log.id}`)} className="glass-panel rounded-xl overflow-hidden group hover:bg-primary/5 transition-colors border-l-2 border-l-primary/30 hover:border-l-primary cursor-pointer">
                  <div className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Day Number Badge */}
                      <div className="w-14 h-14 rounded-lg bg-[#1c2a2b] border border-primary/20 flex flex-col items-center justify-center text-primary group-hover:text-white group-hover:bg-primary/20 transition-colors shrink-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                        <span className="text-[9px] font-mono text-primary/50 uppercase leading-none">Day</span>
                        <span className="text-xl font-display font-bold leading-none mt-0.5">{log.day_number || '—'}</span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-base font-display font-bold text-white truncate block group-hover:text-primary transition-colors">{log.task_desc}</span>
                        <div className="flex gap-4 mt-1">
                          <span className="text-xs font-mono text-slate-400 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_month</span> {log.log_date}</span>
                          <span className="text-xs font-mono text-slate-400 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {log.hours} HRS</span>
                          {log.photos && log.photos.length > 0 && (
                            <span className="text-xs font-mono text-slate-400 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">attach_file</span> {log.photos.length}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                       <span className="text-xs font-mono text-matrix-green bg-matrix-green/10 px-2 py-1 rounded">VERIFIED</span>
                       <span className="text-[10px] font-mono text-slate-500">ID: {log.id.toString().padStart(4, '0')}</span>
                    </div>
                  </div>
                  
                  {/* Photo Thumbnails */}
                  {log.photos && log.photos.length > 0 && (
                    <div className="mx-4 mb-4 flex gap-2 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      {log.photos.slice(0, 3).map((p, i) => (
                        <div
                          key={p.id}
                          className="relative rounded-lg overflow-hidden border border-primary/10 cursor-pointer group/photo flex-1 h-28"
                          onClick={() => setLightboxUrl(p.url)}
                        >
                          <img src={p.url} alt={`Photo ${i+1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-105" loading="lazy" />
                          {i === 2 && log.photos.length > 3 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-mono text-sm">+{log.photos.length - 3}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {/* Close button */}
            <button 
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-12 right-0 flex items-center gap-1 text-primary/80 hover:text-primary text-xs font-mono transition-colors z-10"
            >
              <span className="material-symbols-outlined text-lg">close</span>
              CLOSE [ESC]
            </button>
            {/* Corner decorations */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-primary z-10"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-primary z-10"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-primary z-10"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-primary z-10"></div>
            
            <img 
              src={lightboxUrl} 
              alt="Full size documentation"
              className="w-full h-full object-contain rounded-lg border border-primary/20 shadow-neon"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Logs;
