import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrainingOverlay({ status }) {
  const isLoading = status.status === 'pending' || status.status === 'training';

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(4, 4, 16, 0.92)', backdropFilter: 'blur(12px)' }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
            className="text-center max-w-sm mx-auto px-8"
          >
            {/* Animated rings */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2"
                  style={{
                    borderColor: i === 0 ? 'rgba(99,102,241,0.8)' : i === 1 ? 'rgba(168,85,247,0.5)' : 'rgba(236,72,153,0.3)',
                    scale: 1 + i * 0.3,
                  }}
                  animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                  transition={{ duration: 3 - i * 0.5, repeat: Infinity, ease: 'linear' }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
              </div>
            </div>

            <motion.h2
              className="text-2xl font-display font-bold text-white mb-3"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Training Models
            </motion.h2>

            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Our AI engine is training <span className="text-indigo-400 font-semibold">10+ ML models</span> on your housing dataset, running cross-validation, and selecting the best performer automatically.
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2">
              {['Linear', 'Trees', 'Boosting', 'Neural', 'Ensemble'].map((label, i) => (
                <motion.div
                  key={label}
                  className="flex flex-col items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.3 }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#6366f1' }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  />
                  <span className="text-xs text-slate-600">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
