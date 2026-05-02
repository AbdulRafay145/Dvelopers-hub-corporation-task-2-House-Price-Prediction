import React from 'react';
import { motion } from 'framer-motion';

export default function MetricCard({ label, value, unit = '', color = '#6366f1', icon, delay = 0, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="metric-card glass rounded-2xl p-5 relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20"
        style={{ background: color }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          {subtitle && (
            <span className="text-xs text-slate-500 font-mono">{subtitle}</span>
          )}
        </div>

        <div className="flex items-baseline gap-1 mb-1">
          <span
            className="text-2xl font-bold font-mono"
            style={{ color }}
          >
            {value}
          </span>
          {unit && <span className="text-sm text-slate-400">{unit}</span>}
        </div>

        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
      </div>
    </motion.div>
  );
}
