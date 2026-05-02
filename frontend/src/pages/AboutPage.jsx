import React from 'react';
import { motion } from 'framer-motion';

const stack = [
  { category: 'Frontend', items: ['React 18', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'React Router v6'], color: '#6366f1', icon: '⚛' },
  { category: 'Backend', items: ['Flask 3.0', 'Python 3.10+', 'REST API', 'Threading', 'CORS'], color: '#a855f7', icon: '🐍' },
  { category: 'ML Models', items: ['Linear / Ridge / Lasso', 'Random Forest', 'Extra Trees', 'Gradient Boosting', 'AdaBoost', 'XGBoost', 'LightGBM', 'CatBoost', 'MLP Neural Net', 'Ensemble'], color: '#ec4899', icon: '🤖' },
  { category: 'Data Pipeline', items: ['Null handling', 'Outlier treatment (IQR)', 'Binary encoding', 'Log transform', 'Feature engineering', 'StandardScaler', 'KFold cross-validation'], color: '#f59e0b', icon: '🔬' },
];

const pipeline = [
  { step: '01', title: 'Data Loading', desc: 'CSV loaded from /data/house_data.csv. 546 records, 13 raw features.' },
  { step: '02', title: 'Preprocessing', desc: 'Null handling, duplicate removal, IQR outlier treatment, binary encoding for yes/no columns.' },
  { step: '03', title: 'Feature Engineering', desc: 'Creates 5 new features: area_per_bedroom, bath_bed_ratio, total_rooms, luxury_score, amenity_score.' },
  { step: '04', title: 'Log Transform', desc: 'Price skewness checked. If |skew| > 0.75, log1p transform applied to target variable.' },
  { step: '05', title: 'Model Training', desc: '10+ ML models trained in parallel. 5-fold cross-validation for each.' },
  { step: '06', title: 'Ensemble', desc: 'Top 3 models by R² combined into a VotingRegressor for potential improvement.' },
  { step: '07', title: 'Auto-Selection', desc: 'Model with highest test R² is selected as best. Saved in runtime memory.' },
  { step: '08', title: 'API Ready', desc: 'Flask API ready to serve /predict, /metrics, and /dashboard endpoints.' },
];

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-8 py-12"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            About the <span className="gradient-text">Project</span>
          </h1>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            A production-grade ML pipeline that automatically trains, compares, and deploys
            the best house price prediction model — no manual steps required.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {stack.map((s, i) => (
            <motion.div
              key={s.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 relative overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-15"
                style={{ background: s.color }} />
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{s.icon}</span>
                <h3 className="text-white font-bold">{s.category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {s.items.map(item => (
                  <span key={item} className="text-xs px-2.5 py-1 rounded-full font-mono"
                    style={{
                      background: `${s.color}20`,
                      border: `1px solid ${s.color}40`,
                      color: s.color,
                    }}>
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ML Pipeline */}
        <div className="mb-12">
          <h2 className="text-xl font-display font-bold text-white mb-6">ML Pipeline</h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(180deg, #6366f1, #a855f7, transparent)' }} />
            <div className="space-y-4">
              {pipeline.map((p, i) => (
                <motion.div
                  key={p.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-6 items-start pl-4"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                    <span className="text-xs font-bold text-white">{p.step}</span>
                  </div>
                  <div className="glass rounded-xl p-4 flex-1"
                    style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 className="text-white font-semibold text-sm mb-1">{p.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Dataset info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-lg font-bold text-white mb-4">📂 Dataset Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['File', 'house_data.csv'],
              ['Rows', '546 records'],
              ['Raw Features', '13 columns'],
              ['Engineered', '+5 features'],
              ['Target', 'price (₨)'],
              ['Price Range', '₨1.75M – ₨13.3M'],
              ['Train/Test', '80% / 20%'],
              ['Validation', '5-Fold CV'],
            ].map(([k, v]) => (
              <div key={k} className="glass rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">{k}</p>
                <p className="text-sm text-white font-medium font-mono">{v}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
