import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultForm = {
  area: 6000,
  bedrooms: 3,
  bathrooms: 2,
  stories: 2,
  mainroad: 'yes',
  guestroom: 'no',
  basement: 'no',
  hotwaterheating: 'no',
  airconditioning: 'no',
  parking: 1,
  prefarea: 'no',
  furnishingstatus: 'semi-furnished',
};

const yesNoField = (label, key, form, setForm, icon) => (
  <div key={key}>
    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">{icon} {label}</label>
    <div className="flex gap-2">
      {['yes', 'no'].map(v => (
        <button
          key={v}
          onClick={() => setForm(f => ({ ...f, [key]: v }))}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            form[key] === v
              ? 'text-white'
              : 'glass text-slate-400 border border-white/10 hover:border-indigo-500/30'
          }`}
          style={form[key] === v ? {
            background: v === 'yes'
              ? 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(168,85,247,0.4))'
              : 'rgba(239,68,68,0.2)',
            border: `1px solid ${v === 'yes' ? 'rgba(99,102,241,0.5)' : 'rgba(239,68,68,0.3)'}`,
          } : {}}
        >
          {v === 'yes' ? '✓ Yes' : '✗ No'}
        </button>
      ))}
    </div>
  </div>
);

export default function PredictPage({ trainingStatus }) {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isReady = trainingStatus.status === 'complete';

  const handlePredict = async () => {
    if (!isReady) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldNum = (label, key, min, max, step, icon) => (
    <div key={key}>
      <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">{icon} {label}</label>
      <div className="relative">
        <input
          type="number"
          value={form[key]}
          min={min} max={max} step={step}
          onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
          className="premium-input w-full px-4 py-3 rounded-xl text-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
          <button
            className="text-slate-500 hover:text-white text-xs leading-none transition-colors"
            onClick={() => setForm(f => ({ ...f, [key]: Math.min(max, Number(f[key]) + step) }))}>▲</button>
          <button
            className="text-slate-500 hover:text-white text-xs leading-none transition-colors"
            onClick={() => setForm(f => ({ ...f, [key]: Math.max(min, Number(f[key]) - step) }))}>▼</button>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-8 py-12"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Price <span className="gradient-text">Prediction</span>
          </h1>
          <p className="text-slate-400">Enter house details below to get an AI-powered price estimate.</p>
        </div>

        {!isReady && (
          <div className="glass rounded-2xl p-6 border border-yellow-500/20 mb-8 text-yellow-400 text-sm">
            ⏳ Models are still training. Please wait...
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Numeric inputs */}
            <div className="glass rounded-2xl p-6" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">📐 Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {fieldNum('Area (sq ft)', 'area', 500, 20000, 100, '📏')}
                {fieldNum('Bedrooms', 'bedrooms', 1, 8, 1, '🛏')}
                {fieldNum('Bathrooms', 'bathrooms', 1, 6, 1, '🚿')}
                {fieldNum('Stories', 'stories', 1, 4, 1, '🏢')}
                {fieldNum('Parking Spaces', 'parking', 0, 5, 1, '🚗')}
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">🛋 Furnishing</label>
                  <select
                    value={form.furnishingstatus}
                    onChange={e => setForm(f => ({ ...f, furnishingstatus: e.target.value }))}
                    className="premium-input w-full px-4 py-3 rounded-xl text-sm"
                  >
                    <option value="furnished">Furnished</option>
                    <option value="semi-furnished">Semi-Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="glass rounded-2xl p-6" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">✨ Amenities & Features</h2>
              <div className="grid grid-cols-2 gap-4">
                {yesNoField('Main Road Access', 'mainroad', form, setForm, '🛣')}
                {yesNoField('Guest Room', 'guestroom', form, setForm, '🛎')}
                {yesNoField('Basement', 'basement', form, setForm, '🏚')}
                {yesNoField('Hot Water Heating', 'hotwaterheating', form, setForm, '🔥')}
                {yesNoField('Air Conditioning', 'airconditioning', form, setForm, '❄')}
                {yesNoField('Preferred Area', 'prefarea', form, setForm, '⭐')}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePredict}
              disabled={!isReady || loading}
              className="w-full btn-primary py-5 rounded-2xl font-bold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Predicting...
                </span>
              ) : '⚡ Predict House Price'}
            </motion.button>
          </div>

          {/* Result panel */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="rounded-2xl p-6 text-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))',
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20"
                    style={{ background: '#6366f1' }} />
                  <div className="relative z-10">
                    <div className="text-5xl mb-4">🏡</div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Predicted Price</p>
                    <motion.p
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="text-3xl font-black font-mono gradient-text mb-1"
                    >
                      {result.price_formatted}
                    </motion.p>
                    <p className="text-xs text-slate-500 mb-4">
                      ≈ ₨ {Number(result.predicted_price).toLocaleString()}
                    </p>
                    <div className="glass rounded-xl px-4 py-2 inline-block">
                      <p className="text-xs text-slate-400">Model used</p>
                      <p className="text-sm text-indigo-400 font-semibold">{result.model_used}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-5 border border-red-500/30 text-red-400 text-sm"
                >
                  ⚠ {error}
                </motion.div>
              )}

              {!result && !error && (
                <motion.div
                  key="placeholder"
                  className="glass rounded-2xl p-8 text-center border border-white/5"
                >
                  <div className="text-6xl mb-4 opacity-30">🏠</div>
                  <p className="text-slate-500 text-sm">Fill in the details and click<br /><strong className="text-slate-400">Predict House Price</strong></p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input summary */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-5"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Input Summary</h3>
                <div className="space-y-2">
                  {[
                    ['Area', `${Number(form.area).toLocaleString()} sq ft`],
                    ['Bedrooms', form.bedrooms],
                    ['Bathrooms', form.bathrooms],
                    ['Stories', form.stories],
                    ['Parking', form.parking],
                    ['AC', form.airconditioning],
                    ['Preferred Area', form.prefarea],
                    ['Furnishing', form.furnishingstatus],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">{k}</span>
                      <span className="text-slate-300 font-medium capitalize">{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
