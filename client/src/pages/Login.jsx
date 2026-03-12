import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
       setSuccess(location.state.message);
       window.history.replaceState({}, document.title); // clear state after showing
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    const result = await login(username, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background-dark bg-grid-pattern selection:bg-primary selection:text-black">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0B0E14] via-transparent to-[#0B0E14] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="flex flex-col items-center mb-8">
          <span className="material-symbols-outlined text-primary text-6xl drop-shadow-[0_0_15px_rgba(0,242,255,0.5)] mb-4">terminal</span>
          <h1 className="font-display font-bold text-3xl tracking-widest text-white leading-none text-center">OJT<br/>PORTAL</h1>
          <p className="text-primary/60 text-xs font-mono tracking-widest uppercase mt-2 animate-pulse">LOGIN_REQUIRED</p>
        </div>

        <div className="glass-panel p-6 rounded-xl relative border border-primary/30 shadow-[0_0_30px_rgba(0,242,255,0.1)]">
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-primary rounded-tl-sm"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-primary rounded-tr-sm"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-primary rounded-bl-sm"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-primary rounded-br-sm"></div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border-l-4 border-red-500 text-red-500 font-mono text-xs flex items-center gap-2 animate-pulse">
              <span className="material-symbols-outlined text-sm">warning</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-3 bg-matrix-green/10 border-l-4 border-matrix-green text-matrix-green font-mono text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {success}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="group">
              <label className="block text-primary/60 text-xs font-mono mb-1 tracking-wider group-focus-within:text-primary transition-colors">
                &gt; USERNAME
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-primary font-mono select-none">&gt;</span>
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background-dark/80 border border-primary/30 rounded-lg py-3 pl-8 pr-10 text-white font-mono placeholder-primary/20 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                  placeholder="admin"
                  required
                />
                <span className="material-symbols-outlined absolute right-3 text-primary/50">person</span>
              </div>
            </div>

            <div className="group">
              <label className="block text-primary/60 text-xs font-mono mb-1 tracking-wider group-focus-within:text-primary transition-colors">
                &gt; PASSWORD
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-primary font-mono select-none">&gt;</span>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background-dark/80 border border-primary/30 rounded-lg py-3 pl-8 pr-10 text-white font-mono placeholder-primary/20 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                  placeholder="••••••••"
                  required
                />
                <span className="material-symbols-outlined absolute right-3 text-primary/50">lock</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full relative overflow-hidden bg-primary/10 border border-primary hover:bg-primary/20 text-primary font-bold font-mono py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] group ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              <div className="absolute inset-0 w-0 bg-primary/20 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
              <span className="relative z-10 flex items-center gap-2 tracking-widest">
                {isLoading ? 'AUTHENTICATING...' : 'LOGIN'}
                <span className="material-symbols-outlined text-sm">login</span>
              </span>
            </button>
          </form>

          <div className="mt-6 text-center border-t border-primary/10 pt-4">
             <Link to="/register" className="text-xs font-mono text-primary/60 hover:text-primary transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">person_add</span>
                INITIATE NEW TRAINEE PROFILE
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
