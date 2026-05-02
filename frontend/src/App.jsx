import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import TrainingOverlay from './components/TrainingOverlay';
import './index.css';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [trainingStatus, setTrainingStatus] = useState({ status: 'pending' });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const pollTraining = async () => {
      try {
        const res = await fetch('http://localhost:5000/training-status');
        const data = await res.json();
        setTrainingStatus(data);
        if (data.status !== 'complete' && data.status !== 'error') {
          setTimeout(pollTraining, 2000);
        }
      } catch {
        setTrainingStatus({ status: 'error', message: 'Cannot connect to backend' });
      }
    };
    pollTraining();
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  return (
    <Router>
      <div className={`app-root ${darkMode ? 'dark' : ''}`}>
        <div className="flex h-screen bg-[#0a0a1a] text-white overflow-hidden relative">
          {/* Ambient background */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
          </div>

          <Sidebar
            open={sidebarOpen}
            setOpen={setSidebarOpen}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            trainingStatus={trainingStatus}
          />

          <main className={`flex-1 overflow-y-auto relative z-10 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomePage trainingStatus={trainingStatus} />} />
                <Route path="/predict" element={<PredictPage trainingStatus={trainingStatus} />} />
                <Route path="/dashboard" element={<DashboardPage trainingStatus={trainingStatus} />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>

        <TrainingOverlay status={trainingStatus} />
      </div>
    </Router>
  );
}
