import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dna, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, Database, FileText } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('elena.rostova@bioweave.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-700/40">
        
        {/* Left Side: BioWeave Biotech Branding Banner */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle molecular background glow */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/50">
                <Dna className="w-6 h-6 text-emerald-950" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-none">BioWeave</h1>
                <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase">AI Research Platform</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              Accelerating Biotech Synthesis & Knowledge
            </h2>
            <p className="text-sm text-emerald-100/80 mt-3 leading-relaxed">
              Connect literature, experimental protocols, genomic data, and lab notebook insights into one unified AI knowledge graph.
            </p>
          </div>

          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/40 border border-emerald-800/40 backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-200">Semantic AI Research Assistant</p>
                <p className="text-emerald-300/70 mt-0.5">Synthesize papers and verify experimental protocols with full source attribution.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/40 border border-emerald-800/40 backdrop-blur-xs">
              <Database className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-200">Vector-Indexed Document Library</p>
                <p className="text-emerald-300/70 mt-0.5">Instant retrieval across thousands of PDFs, FASTA, PDBs, and internal lab notes.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-800/50 flex items-center justify-between text-[11px] text-emerald-400/80">
            <span>BioWeave v2.4 Enterprise</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SOC2 Compliant
            </span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your credentials to access your biotech workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email Address"
              id="email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dr.scientist@bioweave.ai"
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
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                />
                <span>Remember this device</span>
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-emerald-800 hover:text-emerald-950 font-medium">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={ArrowRight}
            >
              Sign In to BioWeave
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            Don't have a BioWeave account?{' '}
            <Link to="/register" className="text-emerald-800 hover:text-emerald-950 font-semibold underline">
              Create an Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
