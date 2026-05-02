import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Home', icon: '⌂' },
  { path: '/predict', label: 'Predict', icon: '◎' },
  { path: '/dashboard', label: 'Dashboard', icon: '▦' },
  { path: '/about', label: 'About', icon: '◈' },
];

export default function Sidebar({ open, setOpen, darkMode, setDarkMode, trainingStatus }) {
  const location = useLocation();

  const statusColor = trainingStatus.status === 'complete' ? '#4ade80'
    : trainingStatus.status === 'error' ? '#f87171'
    : '#fbbf24';

  const statusLabel = trainingStatus.status === 'complete' ? 'Model Ready'
    : trainingStatus.status === 'training' ? 'Training...'
    : trainingStatus.status === 'error' ? 'Error'
    : 'Initializing';

  return (
    <motion.aside
      animate={{ width: open ? 256 : 64 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-50 flex flex-col"
      style={{
        background: 'rgba(8, 8, 24, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
          <span className="text-white font-bold text-sm">HP</span>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="font-display font-bold text-white text-sm leading-tight">HousePrice</p>
              <p className="text-xs text-indigo-400 font-mono">AI Engine</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setOpen(!open)}
          className="ml-auto text-slate-400 hover:text-white transition-colors text-lg flex-shrink-0"
        >
          {open ? '‹' : '›'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-2 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative ${
                  active
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                style={active ? {
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.1))',
                  border: '1px solid rgba(99,102,241,0.3)',
                } : {}}
              >
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #6366f1, #a855f7)' }}
                  />
                )}
                <span className="text-lg flex-shrink-0 w-6 text-center">{item.icon}</span>
                <AnimatePresence>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Status & Controls */}
      <div className="border-t border-white/5 px-3 py-4 space-y-3">
        {/* Model Status */}
        <div className={`flex items-center gap-3 px-2 py-2 rounded-lg ${open ? '' : 'justify-center'}`}>
          <div className="relative flex-shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
            {trainingStatus.status === 'training' && (
              <div className="absolute inset-0 rounded-full animate-ping"
                style={{ background: statusColor, opacity: 0.4 }} />
            )}
          </div>
          <AnimatePresence>
            {open && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-xs font-medium" style={{ color: statusColor }}>{statusLabel}</p>
                {trainingStatus.best_model && (
                  <p className="text-xs text-slate-500 truncate max-w-[150px]">{trainingStatus.best_model}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-3 w-full px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all ${!open ? 'justify-center' : ''}`}
        >
          <span className="text-lg flex-shrink-0">{darkMode ? '☀' : '☾'}</span>
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-sm"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
