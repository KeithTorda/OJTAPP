import React from 'react';

const Header = ({ title, subtitle, actions }) => {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-primary/10 bg-background-dark/88 px-4 py-3 backdrop-blur-xl">
      <div className="min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-primary/60">
          {subtitle}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">terminal</span>
          <h1 className="truncate font-display text-base font-bold uppercase tracking-[0.16em] text-white">
            {title}
          </h1>
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
};

export default Header;
