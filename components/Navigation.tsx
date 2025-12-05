
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListChecks, CheckCircle2, Trophy, Moon, Sun, Book, BookOpen, Notebook } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavItemProps {
  to: string;
  icon: React.FC<any>;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex flex-col md:flex-row items-center md:space-x-3 p-2 md:px-4 md:py-3 rounded-lg transition-all ${
      active 
        ? 'text-primary bg-indigo-50/80 dark:bg-violet-500/20 dark:text-violet-200 font-medium shadow-sm backdrop-blur-sm' 
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5'
    }`}
  >
    <Icon size={24} className={active ? 'text-primary dark:text-violet-300' : 'text-gray-400 dark:text-gray-500'} />
    <span className="text-xs md:text-sm mt-1 md:mt-0">{label}</span>
  </Link>
);

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, toggleTheme } = useApp();
  const path = location.pathname;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/habits', label: 'Habits', icon: CheckCircle2 },
    { path: '/tasks', label: 'Tasks', icon: ListChecks },
    { path: '/journal', label: 'Journal', icon: Notebook },
    { path: '/library', label: 'Library', icon: BookOpen },
  ];

  // XP Progress calculation (Level X to X+1)
  const currentLevelBaseXP = Math.pow(user.level - 1, 2) * 50;
  const nextLevelBaseXP = Math.pow(user.level, 2) * 50;
  const levelProgress = Math.min(100, Math.max(0, ((user.xp - currentLevelBaseXP) / (nextLevelBaseXP - currentLevelBaseXP)) * 100));

  return (
    <>
      {/* Desktop Sidebar - Glassmorphism Update */}
      <div className="hidden md:flex flex-col w-64 bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border-r border-gray-200 dark:border-slate-800/50 h-screen fixed left-0 top-0 z-30 transition-colors shadow-2xl shadow-black/5">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800/50">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="bg-gradient-to-br from-primary to-violet-600 text-white p-1.5 rounded-lg shadow-lg shadow-violet-500/30 text-sm">SM</span> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-400">StreakMate</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavItem 
              key={item.path} 
              to={item.path} 
              icon={item.icon} 
              label={item.label} 
              active={path === item.path} 
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800/50 bg-gray-50/50 dark:bg-slate-800/30">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-violet-500/20 p-2 rounded-full text-indigo-600 dark:text-violet-300 ring-1 ring-indigo-500/20">
                    <Trophy size={18} />
                </div>
                <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">Lvl {user.level} {user.level < 5 ? 'Novice' : user.level < 10 ? 'Learner' : 'Master'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.xp} XP</p>
                </div>
             </div>
             <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors rounded-lg hover:bg-white/10">
               {user.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
           </div>
           
           {/* XP Bar */}
           <div className="w-full h-2 bg-gray-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                style={{ width: `${levelProgress}%` }}
              />
           </div>
           <p className="text-[10px] text-right text-gray-400 mt-1">Next Level: {Math.round(nextLevelBaseXP - user.xp)} XP</p>
        </div>
      </div>

      {/* Mobile Bottom Bar - Glassmorphism Update */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-slate-800/50 z-50 pb-safe transition-colors">
        <nav className="flex justify-around items-center p-2">
          {navItems.map((item) => (
            <NavItem 
              key={item.path} 
              to={item.path} 
              icon={item.icon} 
              label={item.label} 
              active={path === item.path} 
            />
          ))}
           <button 
             onClick={toggleTheme}
             className="flex flex-col items-center p-2 text-gray-400 dark:text-gray-500"
           >
             {user.theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
             <span className="text-xs mt-1">Theme</span>
           </button>
        </nav>
      </div>
    </>
  );
};
