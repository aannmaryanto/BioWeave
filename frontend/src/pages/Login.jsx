import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dna, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, Database, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('researcher@example.com');
  const [password, setPassword] = useState('password123');
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(email, password);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (error) {
      setIsLoading(false);
      const apiMessage =
        error?.response?.data?.message ||
        'Failed to sign in. Please check your credentials or server connection.';
      setErrorMessage(apiMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-slate-200/80">
        
        {/* Left Side: BioWeave Biotech Branding Banner (40-45% width on desktop) */}
        <div className="md:col-span-5 lg:col-span-5 bg-gradient-to-br from-[#022C22] via-[#064E3B] to-[#042F2E] p-8 sm:p-10 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle Decorative Background Elements */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-[#042F2E]/50 rounded-full blur-2xl pointer-events-none" />

          {/* Molecular Lattice SVG Background Overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="bio-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="16" cy="16" r="1.5" fill="#DCFCE7" />
                <path d="M 0 16 L 32 16 M 16 0 L 16 32" stroke="#DCFCE7" strokeWidth="0.5" strokeDasharray="2 4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bio-grid)" />
          </svg>

          <div className="relative z-10">
            {/* Header Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#022C22]/60">
                <Dna className="w-6 h-6 text-[#DCFCE7] stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white leading-none">BioWeave</h1>
                <p className="text-xs text-[#DCFCE7] font-semibold tracking-wider uppercase mt-1">
                  Weaving Scientific Knowledge Together
                </p>
              </div>
            </div>

            {/* Tagline & Supporting Copy */}
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              AI-Powered Biotech Knowledge Platform
            </h2>
            <p className="text-xs sm:text-sm text-[#DCFCE7]/90 mt-3 leading-relaxed">
              An AI-powered research platform for connecting scientific literature, experimental protocols, and lab knowledge.
            </p>
          </div>

          {/* Feature Highlight Badges */}
          <div className="space-y-3 pt-6 relative z-10">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#064E3B]/40 border border-[#10B981]/20 backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-[#DCFCE7]">Semantic Vector Search & RAG</p>
                <p className="text-[#DCFCE7]/75 mt-0.5">Synthesize literature and verify experimental protocols with full source citations.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#064E3B]/40 border border-[#10B981]/20 backdrop-blur-xs">
              <Database className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-[#DCFCE7]">Vector-Indexed Library</p>
                <p className="text-[#DCFCE7]/75 mt-0.5">Instant search across PDFs, protocols, and lab notes.</p>
              </div>
            </div>
          </div>

          {/* Compliance & Security Footer */}
          <div className="pt-6 border-t border-[#10B981]/20 flex items-center justify-between text-[11px] text-[#DCFCE7]/80 relative z-10">
            <span>BioWeave Enterprise</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> SOC2 & Data Security Compliant
            </span>
          </div>
        </div>

        {/* Right Side: Login Form (55-60% width on desktop) */}
        <div className="md:col-span-7 lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#022C22] tracking-tight">Sign In</h2>
            <p className="text-xs text-[#64748B] mt-1">Enter your credentials to access your biotech workspace</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email Address"
              id="email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@example.com"
              required
            />

            <Input
              label="Password"
              id="password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#64748B] select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#10B981] focus:ring-[#10B981] cursor-pointer"
                />
                <span>Remember this device</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => e.preventDefault()}
                className="text-[#059669] hover:text-[#10B981] font-semibold transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 rounded-xl shadow-md shadow-[#10B981]/20 transition-all duration-150 flex items-center justify-center gap-2"
              isLoading={isLoading}
              rightIcon={ArrowRight}
            >
              Sign In to BioWeave
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-[#64748B]">
            Don't have a BioWeave account?{' '}
            <Link to="/register" className="text-[#059669] hover:text-[#10B981] font-semibold underline transition-colors">
              Create an Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
