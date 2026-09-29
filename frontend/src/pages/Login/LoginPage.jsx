import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans">
      {/* LEFT HALF */}
      <div className="w-1/2 bg-slate-900 text-white flex flex-col justify-between p-12 lg:p-16 relative overflow-hidden">
        {/* Background glow effects could go here */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-green-400 via-slate-900 to-slate-900 z-0"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-24">
            <div className="w-8 h-8 bg-green-500 flex items-center justify-center font-bold text-white text-xl">G</div>
            <div>
              <h1 className="font-bold text-white tracking-tight text-xl leading-none">GreenGrid</h1>
              <p className="text-xs text-slate-400 mt-0.5">Smart Energy System</p>
            </div>
          </div>

          <div className="max-w-xl">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
              Enterprise Energy Intelligence & <span className="text-green-400">Metrology</span>
            </h2>
            <p className="text-slate-300 text-lg mb-12 leading-relaxed">
              Monitor, analyze, predict, and optimize multi-facility power infrastructure in real-time with sub-second distributed telemetry.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 backdrop-blur-sm max-w-sm">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-sm font-medium text-slate-200">COMPLIANCE: ISO 50001 Enc Monitoring</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 backdrop-blur-sm max-w-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-sm font-medium text-slate-200">TELEMETRY: 5000+ Nodes</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 backdrop-blur-sm max-w-sm">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span className="text-sm font-medium text-slate-200">GRID AUDIT: Automated Export</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-6 opacity-40 grayscale">
          {/* Company logo placeholders */}
          <div className="h-8 w-24 bg-white/20 rounded"></div>
          <div className="h-8 w-24 bg-white/20 rounded"></div>
          <div className="h-8 w-24 bg-white/20 rounded"></div>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="w-1/2 bg-white flex flex-col items-center justify-center relative">
        <div className="w-full max-w-md px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-medium text-slate-500 mb-1">Sign In to</p>
            <h3 className="text-2xl font-bold text-slate-900">GreenGrid Command</h3>
            <p className="text-sm text-slate-500 mt-2">Authorized personnel only. Enter your credentials to access the enterprise dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="admin@greengrid.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
                <a href="#" className="text-xs font-medium text-green-600 hover:text-green-500">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors pr-10"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <div className="absolute bottom-8 text-center w-full">
          <p className="text-xs text-slate-400">Powered by GreenGrid v2.4.1 | Enterprise Edition</p>
        </div>
      </div>
    </div>
  );
}
