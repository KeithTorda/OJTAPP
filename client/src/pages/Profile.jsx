import React, { useContext } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);

  const registrationDate = new Date().toLocaleDateString('en-US', {
     year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="relative min-h-screen pb-32 selection:bg-primary selection:text-black">
      <div className="fixed inset-0 z-0 bg-circuit-pattern pointer-events-none opacity-40"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background-dark via-transparent to-background-dark pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="sticky top-0 z-50">
          <Header
            title="TRAINEE IDENTITY"
            subtitle={`PROFILE // ${user?.username?.toUpperCase()}`}
            actions={
              <button
                onClick={logout}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 transition-colors hover:bg-red-500/10"
              >
                <span className="material-symbols-outlined text-sm">power_settings_new</span>
              </button>
            }
          />
        </div>
        
        <main className="flex-1 flex flex-col gap-6 px-4 py-8 max-w-2xl mx-auto w-full">
          
          <div className="glass-panel p-1 rounded-2xl relative overflow-hidden backdrop-blur-md shadow-[0_0_50px_rgba(0,242,255,0.1)] border border-primary/40">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            
            <div className="bg-background-dark/90 m-1 rounded-xl p-8 relative z-10 flex flex-col items-center">
              
              {/* ID Header Pattern */}
              <div className="w-full absolute top-0 left-0 h-2 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-80"></div>
              
              <div className="w-32 h-32 rounded-lg border-2 border-primary/50 flex items-center justify-center bg-primary/5 shadow-[inset_0_0_20px_rgba(0,242,255,0.1)] mb-6 relative overflow-hidden">
                <span className="material-symbols-outlined text-7xl text-primary/50">badge</span>
                {/* Cyberpunk scanning line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 animate-[scan_3s_ease-in-out_infinite]"></div>
              </div>

              <h2 className="text-3xl font-display font-bold text-white tracking-[0.2em] uppercase mb-1">{user?.username}</h2>
              <span className="px-3 py-1 bg-matrix-green/10 text-matrix-green text-xs font-mono tracking-widest border border-matrix-green/30 rounded mb-8">
                AUTHORIZED PERSONNEL
              </span>

              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="bg-surface-dark/50 p-4 border border-primary/20 rounded">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-primary/60 block mb-1">Assigned ID Node</span>
                  <span className="text-lg font-mono text-white">#{user?.id?.toString().padStart(6, '0')}</span>
                </div>
                
                <div className="bg-surface-dark/50 p-4 border border-primary/20 rounded">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-primary/60 block mb-1">Clearance Level</span>
                  <span className="text-lg font-mono text-white">Tier 2 (Trainee)</span>
                </div>

                <div className="bg-surface-dark/50 p-4 border border-primary/20 rounded">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-primary/60 block mb-1">Activation Date</span>
                  <span className="text-sm font-mono text-white">{registrationDate}</span>
                </div>
                
                <div className="bg-surface-dark/50 p-4 border border-primary/20 rounded">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-primary/60 block mb-1">Department</span>
                  <span className="text-sm font-mono text-white">Information Technology</span>
                </div>
              </div>

              {/* Barcode / Cyber decorative element */}
              <div className="w-full mt-10 pt-6 border-t border-primary/20 flex flex-col items-center">
                <div className="flex gap-1 h-8 opacity-70">
                   {[...Array(30)].map((_, i) => (
                      <div key={i} className={`bg-primary w-${Math.floor(Math.random() * 3) + 1} h-full`}></div>
                   ))}
                </div>
                <span className="text-[8px] font-mono text-primary/50 mt-2 tracking-[0.3em]">SECURE_HOLOGRAPHIC_IDENTIFICATION</span>
              </div>
            </div>
          </div>
          
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
