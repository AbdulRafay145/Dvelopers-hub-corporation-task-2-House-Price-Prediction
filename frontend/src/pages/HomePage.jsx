import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export default function HomePage({ trainingStatus }) {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (trainingStatus.status === 'complete') {
      fetch('http://localhost:5000/metrics')
        .then(r => r.json())
        .then(setMetrics)
        .catch(() => {});
    }
  }, [trainingStatus.status]);

  const isReady = trainingStatus.status === 'complete';
  const m = metrics?.metrics || {};

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen px-8 py-12"
    >
      {/* Hero */}
      <motion.div variants={itemVariants} className="max-w-4xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-mono"
          style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#818cf8'
          }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {isReady ? `Best Model: ${trainingStatus.best_model}` : 'Initializing AI Engine...'}
        </div>

        <h1 className="text-6xl font-display font-black mb-6 leading-tight">
          <span className="text-white">Predict House</span>
          <br />
          <span className="gradient-text">Prices with AI</span>
        </h1>

        <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
          Our multi-model ML engine trains on real housing data, compares algorithms,
          and selects the best performer — giving you accurate price predictions instantly.
        </p>

        <div className="flex items-center gap-4">
          <Link to="/predict">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary px-8 py-4 rounded-2xl font-semibold text-white text-lg"
              disabled={!isReady}
            >
              {isReady ? '⚡ Predict Now' : '⏳ Training...'}
            </motion.button>
          </Link>
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl font-semibold text-slate-300 text-lg glass border border-white/10 hover:border-indigo-500/40 transition-all"
            >
              📊 View Analytics
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Metrics Row */}
      {isReady && metrics && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          <MetricCard label="R² Score" value={m.r2 ?? '—'} icon="📈" color="#6366f1" delay={0} />
          <MetricCard label="Adj. R²" value={m.adj_r2 ?? '—'} icon="📐" color="#8b5cf6" delay={0.05} />
          <MetricCard label="MAE" value={m.mae ? `${(m.mae/1e6).toFixed(2)}M` : '—'} icon="📉" color="#a855f7" delay={0.1} />
          <MetricCard label="RMSE" value={m.rmse ? `${(m.rmse/1e6).toFixed(2)}M` : '—'} icon="〰" color="#ec4899" delay={0.15} />
          <MetricCard label="MAPE" value={m.mape ? `${m.mape.toFixed(1)}%` : '—'} icon="🎯" color="#f59e0b" delay={0.2} />
          <MetricCard label="CV R²" value={m.cv_r2_mean ?? '—'} icon="🔁" color="#10b981" delay={0.25} subtitle={`±${m.cv_r2_std ?? '?'}`} />
        </motion.div>
      )}

      {/* Feature highlights */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          {
            icon: '🤖',
            title: '10+ ML Models',
            desc: 'Linear, Ridge, Lasso, Random Forest, Extra Trees, Gradient Boosting, AdaBoost, XGBoost, LightGBM, CatBoost & MLP Neural Network.',
            color: '#6366f1',
          },
          {
            icon: '🔬',
            title: 'Auto Best Selection',
            desc: '5-fold cross validation + hyperparameter tuning. Ensemble of top 3 models tried automatically.',
            color: '#a855f7',
          },
          {
            icon: '⚡',
            title: 'Instant Predictions',
            desc: 'Feature engineering + outlier treatment + log transform. Predictions served in milliseconds.',
            color: '#f59e0b',
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            whileHover={{ y: -6, scale: 1.01 }}
            className="glass rounded-2xl p-6 relative overflow-hidden cursor-default"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-10"
              style={{ background: card.color }} />
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Dataset info */}
      <motion.div variants={itemVariants}
        className="glass rounded-2xl p-6 flex flex-wrap gap-8 items-center"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Dataset</p>
          <p className="text-white font-semibold">house_data.csv</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Records</p>
          <p className="text-white font-semibold">546 Houses</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Features</p>
          <p className="text-white font-semibold">13 + 5 Engineered</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Target</p>
          <p className="text-white font-semibold">House Price (₨)</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Split</p>
          <p className="text-white font-semibold">80% Train / 20% Test</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Validation</p>
          <p className="text-white font-semibold">5-Fold Cross Validation</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
