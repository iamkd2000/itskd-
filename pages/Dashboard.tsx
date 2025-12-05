import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getMotivationalMessage } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame, CheckCircle, ListChecks, Sparkles, Trophy, Activity } from 'lucide-react';
import { CheckStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { habits, tasks, user, getTodayStr } = useApp();
  const [motivation, setMotivation] = useState<string>("");
  const [loadingMot, setLoadingMot] = useState(false);
  
  const today = getTodayStr();

  // Calculated Stats
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.logs[today] === 'done').length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  const fetchMotivation = async () => {
    setLoadingMot(true);
    const msg = await getMotivationalMessage(habits, tasks, user.name);
    setMotivation(msg);
    setLoadingMot(false);
  };

  useEffect(() => {
    fetchMotivation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits.length, tasks.length]); 

  // Chart Data: Last 7 Days
  const chartData = useMemo(() => {
    const data = [];
    const date = new Date();
    date.setDate(date.getDate() - 6);

    for (let i = 0; i < 7; i++) {
      const str = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      let count = 0;
      habits.forEach(h => {
        if (h.logs[str] === 'done') count++;
      });

      data.push({ name: dayName, completed: count, fullDate: str });
      date.setDate(date.getDate() + 1);
    }
    return data;
  }, [habits]);

  // Heatmap Data
  const heatmapData = useMemo(() => {
    const days = [];
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29); 

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const str = d.toISOString().split('T')[0];
        let score = 0;
        habits.forEach(h => {
            if (h.logs[str] === 'done') score++;
        });
        days.push({ date: str, score });
    }
    return days;
  }, [habits]);

  const getHeatmapColor = (score: number) => {
      if (score === 0) return 'bg-gray-100 dark:bg-white/5';
      if (score <= 1) return 'bg-indigo-200 dark:bg-violet-500/30';
      if (score <= 3) return 'bg-indigo-400 dark:bg-violet-500/60';
      return 'bg-indigo-600 dark:bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]';
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hello, {user.name} 👋</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Here is your daily overview.</p>
        </div>
        <div className="hidden md:block text-right">
             <div className="text-sm text-gray-500 dark:text-gray-400">Total XP Earned</div>
             <div className="text-2xl font-bold text-primary dark:text-violet-400 flex items-center gap-1 justify-end drop-shadow-sm">
                <Trophy size={20} /> {user.xp}
             </div>
        </div>
      </header>

      {/* AI Motivation Banner - Enhanced Glow */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/30 mb-8 border border-white/10">
        <div className="relative z-10">
           <div className="flex items-center gap-2 mb-2 opacity-90">
             <Sparkles size={18} className="text-yellow-300" />
             <span className="text-sm font-medium uppercase tracking-wider">Daily Wisdom</span>
           </div>
           <p className="text-lg md:text-xl font-medium leading-relaxed max-w-2xl italic">
             "{loadingMot ? "Seeking wisdom from the Gita..." : motivation}"
           </p>
           <button 
             onClick={fetchMotivation}
             className="mt-4 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors backdrop-blur-md"
           >
             New Quote
           </button>
        </div>
        <div className="absolute -right-8 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-8 -bottom-12 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Habits Today" 
          value={`${completedToday}/${totalHabits}`} 
          subtitle={`${completionRate}% Completed`}
          icon={CheckCircle}
          color="text-emerald-500 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <StatCard 
          title="Current Streak" 
          value={habits.reduce((acc, h) => Math.max(acc, h.currentStreak), 0).toString()} 
          subtitle="Longest Active Streak"
          icon={Flame}
          color="text-orange-500 dark:text-orange-400"
          bg="bg-orange-50 dark:bg-orange-500/10"
        />
        <StatCard 
          title="Pending Tasks" 
          value={pendingTasks.toString()} 
          subtitle={`${completedTasks} Done`}
          icon={ListChecks}
          color="text-blue-500 dark:text-blue-400"
          bg="bg-blue-50 dark:bg-blue-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart & Heatmap Container */}
        <div className="space-y-8">
             {/* Weekly Chart - Glass Panel */}
            <div className="glass-panel p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Weekly Consistency</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                    />
                    <Bar dataKey="completed" radius={[4, 4, 4, 4]} barSize={32}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fullDate === today ? '#8b5cf6' : '#475569'} />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>

            {/* Monthly Heatmap - Glass Panel */}
            <div className="glass-panel p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">30 Day Activity</h3>
                    <Activity size={16} className="text-gray-400" />
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                    {heatmapData.map((day, i) => (
                        <div 
                            key={i} 
                            title={`${day.date}: ${day.score} habits`}
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm transition-all ${getHeatmapColor(day.score)}`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>

        {/* Today's Focus - Glass Panel */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Priority Tasks</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[500px] custom-scrollbar">
             {tasks.filter(t => t.status !== 'completed' && t.priority === 'High').length === 0 ? (
                 <div className="p-4 text-center border border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                     <p className="text-gray-400 text-sm">No high priority tasks. Great job!</p>
                 </div>
             ) : (
                 tasks.filter(t => t.status !== 'completed' && t.priority === 'High').map(task => (
                     <div key={task.id} className="flex items-start gap-3 p-4 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30 backdrop-blur-sm">
                         <div className="mt-1.5 min-w-[8px] h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                         <div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{task.title}</p>
                            <span className="text-xs text-red-500 dark:text-red-400 font-bold uppercase tracking-wide">High Priority</span>
                         </div>
                     </div>
                 ))
             )}
             
             {/* Medium Tasks */}
             {tasks.filter(t => t.status !== 'completed' && t.priority === 'Medium').slice(0, 3).map(task => (
                 <div key={task.id} className="flex items-start gap-3 p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/30 backdrop-blur-sm">
                    <div className="mt-1.5 min-w-[8px] h-2 rounded-full bg-orange-400" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{task.title}</p>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color, bg }: any) => (
  <div className="glass-panel p-6 rounded-2xl shadow-sm flex items-start justify-between transition-transform hover:-translate-y-1">
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{value}</h2>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      <Icon size={24} />
    </div>
  </div>
);