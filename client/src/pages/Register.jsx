import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('PASSWORDS DO NOT MATCH.');
      return;
    }

    if (password.length < 6) {
      setError('PASSWORD MUST BE AT LEAST 6 CHARACTERS.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/endpoints/register.php`, {
        username,
        password
      }, {
        headers: {
            'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 201) {
        // Registration successful
        navigate('/login', { state: { message: 'TRAINEE PROFILE INITIATED. LOGIN REQUIRED.' } });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
         setError(err.response.data.message.toUpperCase());
      } else {
         setError('UPLINK FAILURE. VERIFY CONNECTION.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative selection:bg-primary selection:text-black">
      {/* Dynamic Backgrounds matching the Command Center */}
      <div className="fixed inset-0 z-0 bg-background-dark"></div>
      <div className="fixed inset-0 z-0 bg-grid-pattern opacity-30 pointer-events-none"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-primary/10 via-background-dark to-background-dark pointer-events-none"></div>
      
      {/* Animated Scanline */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="w-full h-1 bg-primary/20 absolute top-0 animate-[scan_8s_linear_infinite]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 shadow-[0_0_30px_rgba(0,242,255,0.2)] mb-6 relative overflow-hidden group">
              <span className="material-symbols-outlined text-4xl text-primary drop-shadow-[0_0_8px_rgba(0,242,255,0.8)] relative z-10">person_add</span>
              <div className="absolute inset-0 bg-primary/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl"></div>
           </div>
           
           <h1 className="text-3xl font-display font-bold text-white tracking-widest uppercase mb-2">NEW UPLINK</h1>
           <div className="flex items-center justify-center gap-2 text-primary/80 font-mono text-sm tracking-widest">
             <span className="w-2 h-2 rounded-full bg-matrix-green shadow-[0_0_10px_#00ff00]"></span>
             <span>TRAINEE REGISTRATION</span>
           </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-primary/30 shadow-[0_0_50px_rgba(0,242,255,0.1)] relative overflow-hidden">
          {/* Cyber accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-sm"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-sm"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-sm"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-sm"></div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border-l-4 border-red-500 text-red-500 font-mono text-xs flex items-center gap-2 animate-pulse">
              <span className="material-symbols-outlined text-sm">warning</span>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-widest text-primary/70 uppercase ml-1">Trainee Node ID (Username)</label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/50 text-xl group-focus-within:text-primary transition-colors">fingerprint</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface-dark/50 border border-primary/20 rounded-lg p-3 pl-10 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-primary/5 transition-all text-sm"
                  placeholder="ENTER NODE ID"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-widest text-primary/70 uppercase ml-1">Access Key (Password)</label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/50 text-xl group-focus-within:text-primary transition-colors">password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-dark/50 border border-primary/20 rounded-lg p-3 pl-10 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-primary/5 transition-all text-sm tracking-widest"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-widest text-primary/70 uppercase ml-1">Confirm Access Key</label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/50 text-xl group-focus-within:text-primary transition-colors">verified</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-dark/50 border border-primary/20 rounded-lg p-3 pl-10 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-primary/5 transition-all text-sm tracking-widest"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden group bg-primary/10 border border-primary text-primary hover:text-background-dark py-3 rounded-lg font-mono tracking-widest text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_15px_rgba(0,242,255,0.2)] hover:shadow-[0_0_25px_rgba(0,242,255,0.5)]"
            >
              <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
              <span className="relative z-10 font-bold flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                    INITIATING...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">add_moderator</span>
                    ESTABLISH LINK
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center border-t border-primary/10 pt-4">
             <Link to="/login" className="text-xs font-mono text-primary/60 hover:text-primary transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                RETURN TO OJT PORTAL (LOGIN)
             </Link>
          </div>
        </div>
        
        {/* Footer decoration */}
        <div className="mt-8 flex justify-center opacity-30">
          <div className="flex gap-1 h-4">
            {[...Array(20)].map((_, i) => (
               <div key={i} className={`bg-primary w-1 h-${Math.floor(Math.random() * 4) + 1} rounded-full`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
