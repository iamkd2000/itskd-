
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { HabitsPage } from './pages/HabitsPage';
import { TasksPage } from './pages/TasksPage';
import { JournalPage } from './pages/JournalPage';
import { LibraryPage } from './pages/LibraryPage';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans flex transition-colors relative overflow-hidden">
      
      {/* Premium Animated Wallpaper Background (Dark Mode Only) */}
      <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block overflow-hidden bg-[#050505]">
        
        {/* 1. Animated Color Blobs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-700 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>
        
        {/* 2. Central Depth Glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-900/20 rounded-full blur-[100px]"></div>

        {/* 3. Texture Overlay for Grain/Noise */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      </div>

      <Navigation />
      <main className="flex-1 md:ml-64 min-h-screen transition-all duration-300 relative z-10">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/library" element={<LibraryPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;
