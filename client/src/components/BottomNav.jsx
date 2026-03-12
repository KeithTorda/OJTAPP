import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', icon: 'dashboard', label: 'Home', end: true },
  { to: '/logs', icon: 'list_alt', label: 'Logs' },
  { to: '/stats', icon: 'analytics', label: 'Stats' },
  { to: '/profile', icon: 'person', label: 'Profile' },
];

const navItemClass = ({ isActive }) =>
  `flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] transition-colors ${
    isActive ? 'bg-primary/12 text-primary' : 'text-slate-400 hover:text-white'
  }`;

const BottomNav = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-primary/15 bg-background-dark/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-2 rounded-[1.75rem] border border-primary/10 bg-surface-dark/70 px-2 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.35)]">
        {NAV_ITEMS.slice(0, 2).map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={navItemClass}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span className="font-mono tracking-wide">{label}</span>
          </NavLink>
        ))}

        <NavLink
          to="/add"
          className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl bg-primary px-1 text-[11px] text-slate-950 shadow-[0_8px_24px_rgba(0,242,255,0.28)] transition-transform hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-[24px]">add</span>
          <span className="font-mono font-semibold tracking-wide">New Log</span>
        </NavLink>

        {NAV_ITEMS.slice(2).map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={navItemClass}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span className="font-mono tracking-wide">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
