import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#6366f1','#8b5cf6','#a855f7','#ec4899','#f59e0b','#10b981','#06b6d4','#3b82f6','#84cc16','#f97316','#ef4444'];

const formatPrice = v => `₨${(v/1e6).toFixed(1)}M`;

export default function DashboardPage({ trainingStatus }) {
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trainingStatus.status !== 'complete') return;
    Promise.all([
      fetch('http://localhost:5000/dashboard').then(r => r.json()),
      fetch('http://localhost:5000/metrics').then(r => r.json()),
    ]).then(([d, m]) => {
      setData(d);
      setMetrics(m);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [trainingStatus.status]);

  if (trainingStatus.status !== 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-slate-400">Dashboard available after training completes...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Prepare scatter data (actual vs predicted)
  const scatterData = (data?.actual_vs_predicted?.actual || []).map((a, i) => ({
    actual: a,
    predicted: data.actual_vs_predicted.predicted[i],
    residual: data.residuals?.[i] || 0,
  }));

  // Feature importance bar data
  const fiData = Object.entries(data?.feature_importance || {}).map(([k, v]) => ({
    name: k.replace(/_/g, ' '),
    value: v,
  })).sort((a, b) => b.value - a.value);

  // Model comparison data
  const modelData = Object.entries(metrics?.all_models || {}).map(([name, m], i) => ({
    name: name.replace(' Regressor', '').replace(' (Top 3)', ' ★'),
    r2: m.r2,
    mape: m.mape,
    color: COLORS[i % COLORS.length],
    isBest: name === metrics.best_model,
  })).sort((a, b) => b.r2 - a.r2);

  // Residual data
  const residualData = (data?.residuals || []).map((r, i) => ({ i, r }));

  const CustomTooltipScatter = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="glass-strong rounded-xl p-3 text-xs border border-indigo-500/20">
        <p className="text-slate-400">Actual: <span className="text-white font-mono">{formatPrice(d.actual)}</span></p>
        <p className="text-slate-400">Predicted: <span className="text-indigo-400 font-mono">{formatPrice(d.predicted)}</span></p>
        <p className="text-slate-400">Residual: <span className={d.residual >= 0 ? 'text-green-400' : 'text-red-400'}>{formatPrice(Math.abs(d.residual))}</span></p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-8 py-12"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Analytics <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-slate-400">Model performance, feature analysis, and prediction insights.</p>
        </div>

        {/* Best model highlight */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-8 flex flex-wrap gap-6 items-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))',
              border: '1px solid rgba(99,102,241,0.25)',
            }}
          >
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">🏆 Best Model</p>
              <p className="text-xl font-bold text-white">{metrics.best_model}</p>
            </div>
            {[
              ['R²', metrics.metrics?.r2, '#6366f1'],
              ['Adj. R²', metrics.metrics?.adj_r2, '#8b5cf6'],
              ['MAE', metrics.metrics?.mae ? `₨${(metrics.metrics.mae/1e6).toFixed(2)}M` : '—', '#a855f7'],
              ['RMSE', metrics.metrics?.rmse ? `₨${(metrics.metrics.rmse/1e6).toFixed(2)}M` : '—', '#ec4899'],
              ['MAPE', metrics.metrics?.mape ? `${metrics.metrics.mape.toFixed(2)}%` : '—', '#f59e0b'],
              ['CV R²', `${metrics.metrics?.cv_r2_mean} ±${metrics.metrics?.cv_r2_std}`, '#10b981'],
            ].map(([label, val, color]) => (
              <div key={label} className="text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-lg font-bold font-mono" style={{ color }}>{val}</p>
              </div>
            ))}
          </motion.div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Model Comparison */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">📊 Model R² Comparison</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={modelData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={120} />
                <Tooltip
                  formatter={v => [v.toFixed(4), 'R²']}
                  contentStyle={{ background: '#0f0f23', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="r2" radius={[0, 6, 6, 0]}>
                  {modelData.map((entry, i) => (
                    <Cell key={i} fill={entry.isBest ? '#6366f1' : COLORS[i % COLORS.length]} opacity={entry.isBest ? 1 : 0.65} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Feature Importance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-6"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">🔍 Feature Importance (%)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fiData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={140} />
                <Tooltip
                  formatter={v => [`${v.toFixed(2)}%`, 'Importance']}
                  contentStyle={{ background: '#0f0f23', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {fiData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Actual vs Predicted Scatter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-1">🎯 Actual vs Predicted</h2>
            <p className="text-xs text-slate-500 mb-4">Points close to the diagonal = better predictions</p>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="actual" name="Actual" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${(v/1e6).toFixed(1)}M`} />
                <YAxis dataKey="predicted" name="Predicted" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${(v/1e6).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltipScatter />} />
                <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Residual Plot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-6"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-1">〰 Residual Distribution</h2>
            <p className="text-xs text-slate-500 mb-4">Residuals centered around zero = unbiased model</p>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="i" name="Index" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis dataKey="r" name="Residual" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${(v/1e6).toFixed(1)}M`} />
                <Tooltip
                  formatter={v => [formatPrice(Math.abs(v)), 'Residual']}
                  contentStyle={{ background: '#0f0f23', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 8 }}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
                <Scatter
                  data={residualData}
                  fill="#ec4899"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
