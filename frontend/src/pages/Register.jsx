import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dna, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, Database, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validations
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await register(fullName, email, password);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (error) {
      setIsLoading(false);
      const apiMessage = error?.response?.data?.message || 'Registration failed. Please try again with a different email.';
      setErrorMessage(apiMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-700/40">
        
        {/* Left Side: BioWeave Biotech Banner */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/50">
                <Dna className="w-6 h-6 text-emerald-950 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-none">BioWeave</h1>
                <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase">AI Research Platform</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              Join the Future of Biotech Discovery
            </h2>
            <p className="text-sm text-emerald-100/80 mt-3 leading-relaxed">
              Create your researcher profile to unlock vector search, protocol extraction, and multi-document AI synthesis.
            </p>
          </div>

          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-900/40 border border-emerald-800/40">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-200">Instant AI synthesis of uploaded PDF & FASTA research documents.</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-900/40 border border-emerald-800/40">
              <Database className="w-5 h-5 text-teal-400 shrink-0" />
              <p className="text-xs text-emerald-200">Organize protocols, lab notes, and clinical trial datasets securely.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-800/50 flex items-center justify-between text-[11px] text-emerald-400/80">
            <span>BioWeave Academic & Enterprise</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> HIPAA / GDPR Compliant
            </span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-xs text-slate-500 mt-1">Register for a new researcher account</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="Full Name"
              id="fullName"
              icon={User}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Elena Rostova"
              required
            />

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
              placeholder="Minimum 6 characters"
              required
            />

            <Input
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
            />

            <div className="flex items-center gap-2 pt-1 text-xs">
              <input
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                required
              />
              <label htmlFor="terms" className="text-slate-600 select-none">
                I agree to the <a href="#terms" onClick={(e) => e.preventDefault()} className="text-emerald-800 font-medium underline">Terms of Service</a> & Privacy Policy
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={ArrowRight}
            >
              Register Researcher Account
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-800 hover:text-emerald-950 font-semibold underline">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
