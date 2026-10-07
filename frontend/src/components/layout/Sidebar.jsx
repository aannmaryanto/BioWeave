import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Search,
  Bot,
  Dna,
  LogOut,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Document Library', path: '/documents', icon: FileText },
    { name: 'Upload Document', path: '/upload', icon: UploadCloud },
    { name: 'Knowledge Search', path: '/search', icon: Search },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'BW';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-60 bg-[#022c22] text-slate-100 flex flex-col justify-between transition-transform duration-250 ease-in-out lg:translate-x-0 border-r border-emerald-900/50 shadow-lg ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="h-14 px-4 flex items-center justify-between border-b border-emerald-900/40 bg-[#022c22]">
            <div
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Dna className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-tight leading-none block">
                  BioWeave
                </span>
                <span className="text-[9px] font-semibold text-emerald-400 tracking-wider uppercase block mt-0.5">
                  Biotech AI Platform
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1 text-emerald-400 hover:text-white rounded-md lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-1 mt-2">
            <div className="px-2.5 py-1 text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/dashboard' && location.pathname === '/') ||
                (item.path === '/ai-assistant' && location.pathname === '/assistant');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-800/80 text-white font-semibold shadow-xs border border-emerald-700/50'
                      : 'text-emerald-100/70 hover:bg-emerald-900/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-emerald-400/70'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-300 opacity-80" />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile & footer */}
        <div className="p-2.5 border-t border-emerald-900/50 bg-[#01221a]">
          <div className="p-2 rounded-lg bg-emerald-900/30 border border-emerald-800/30 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-emerald-100 flex items-center justify-center font-bold text-[11px] ring-1 ring-emerald-500/40 shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-100 truncate">{user?.name || 'Researcher'}</p>
                <p className="text-[10px] text-emerald-400/90 truncate flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Senior Researcher'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1 text-emerald-400 hover:text-rose-300 hover:bg-emerald-900/60 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
