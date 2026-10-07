import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, UploadCloud, Database, Sparkles } from 'lucide-react';

export default function Navbar({ onMenuToggle, title = "Dashboard" }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-emerald-50/80 border border-emerald-200/60 rounded-full text-[11px] text-emerald-900 font-medium">
          <Database className="w-3 h-3 text-emerald-700" />
          <span>Vector Index: Active</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <button
          onClick={() => navigate('/ai-assistant')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg border border-emerald-200/80 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Ask AI</span>
        </button>

        <button
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
