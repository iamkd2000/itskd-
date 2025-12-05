import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Flame, MoreVertical, Check, X, Minus, MessageCircleQuestion, Edit2, Calendar, AlertCircle, HelpCircle } from 'lucide-react';
import { HabitCategory, DayOfWeek, Habit, CheckStatus } from '../types';
import { getHabitAdvice } from '../services/geminiService';

// -- Habit Card Component (Extracted for cleaner logic & animations) --
const HabitCard: React.FC<{
    habit: Habit;
    today: string;
    dayOfWeek: DayOfWeek;
    advice: {id: string, text: string} | null;
    loadingAdvice: boolean;
    onToggleStatus: (id: string, date: string, status: CheckStatus) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onGetAdvice: (id: string, name: string) => void;
    onCloseAdvice: () => void;
}> = ({ habit, today, dayOfWeek, advice, loadingAdvice, onToggleStatus, onEdit, onDelete, onGetAdvice, onCloseAdvice }) => {
    
    const statusToday = habit.logs[today];
    const isAdviceVisible = advice?.id === habit.id;
    const isScheduledToday = habit.frequency?.includes(dayOfWeek);
    const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Confirmation States
    const [confirmAction, setConfirmAction] = useState<'missed' | 'skipped' | null>(null);

    const handleNegativeAction = (action: 'missed' | 'skipped') => {
        // If already set to this status, just unset it (no confirm needed to unset)
        if (statusToday === action) {
            onToggleStatus(habit.id, today, null);
            setConfirmAction(null);
            return;
        }

        // If confirmation is active for this action, execute it
        if (confirmAction === action) {
            onToggleStatus(habit.id, today, action);
            setConfirmAction(null);
        } else {
            // Otherwise, set confirmation state
            setConfirmAction(action);
            // Auto-reset confirmation after 3 seconds
            setTimeout(() => setConfirmAction(null), 3000);
        }
    };

    return (
        <div className={`glass-panel rounded-xl p-4 md:p-6 shadow-sm transition-all hover:shadow-md relative group ${
            isScheduledToday 
            ? 'border-gray-100 dark:border-slate-700/50' 
            : 'bg-gray-50/50 dark:bg-slate-800/30 opacity-75'
        }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Habit Info */}
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full 
                    ${habit.category === 'Health' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 
                    habit.category === 'Study' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 
                    habit.category === 'Work' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' : 
                    habit.category === 'Finance' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'}`}
                >
                    {habit.category}
                </span>
                <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400 font-bold text-sm">
                    <Flame size={16} fill="currentColor" />
                    <span>{habit.currentStreak} Day Streak</span>
                </div>
                {!isScheduledToday && (
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/> Rest Day</span>
                )}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{habit.name}</h3>
                {habit.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{habit.description}</p>}
                
                {/* Frequency Indicators */}
                <div className="flex gap-1 mt-3">
                {DAYS.map((d, i) => (
                    <span key={i} className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full ${
                        habit.frequency?.includes(i as DayOfWeek) 
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-violet-500/30 dark:text-violet-200 font-bold' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`}>
                        {d}
                    </span>
                ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Interactive Buttons Group */}
                <div className={`flex items-center bg-gray-50 dark:bg-slate-700/40 rounded-lg p-1.5 border border-gray-200 dark:border-slate-600/50 ${!isScheduledToday ? 'opacity-50 pointer-events-none' : ''}`}>
                    
                    {/* DONE Button */}
                    <button 
                        onClick={() => onToggleStatus(habit.id, today, statusToday === 'done' ? null : 'done')}
                        className={`p-2 rounded-md transition-all relative overflow-hidden ${
                            statusToday === 'done' 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-pop' 
                            : 'text-gray-400 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-emerald-500'
                        }`}
                        title="Mark as Done"
                    >
                        <Check size={20} strokeWidth={3} />
                    </button>

                    {/* Divider */}
                    <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                    {/* MISSED Button (With Confirmation) */}
                    <button 
                        onClick={() => handleNegativeAction('missed')}
                        className={`p-2 rounded-md transition-all flex items-center gap-1 overflow-hidden ${
                            statusToday === 'missed'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                            : confirmAction === 'missed'
                                ? 'bg-red-100 text-red-600 w-auto px-3 animate-shake dark:bg-red-900/40 dark:text-red-400' 
                                : 'text-gray-400 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-red-500'
                        }`}
                        title="Mark as Missed"
                    >
                        {confirmAction === 'missed' ? (
                            <>
                                <span className="text-xs font-bold whitespace-nowrap">Confirm?</span>
                            </>
                        ) : (
                            <X size={20} strokeWidth={2.5} />
                        )}
                    </button>

                    {/* SKIPPED Button (With Confirmation) */}
                    <button 
                        onClick={() => handleNegativeAction('skipped')}
                        className={`p-2 rounded-md transition-all flex items-center gap-1 ${
                            statusToday === 'skipped' 
                            ? 'bg-gray-500 text-white' 
                            : confirmAction === 'skipped'
                                ? 'bg-gray-200 text-gray-600 w-auto px-3 animate-shake dark:bg-gray-700 dark:text-gray-300'
                                : 'text-gray-400 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-600'
                        }`}
                        title="Skip for today"
                    >
                         {confirmAction === 'skipped' ? (
                            <span className="text-xs font-bold whitespace-nowrap">Confirm?</span>
                        ) : (
                            <Minus size={20} strokeWidth={2.5} />
                        )}
                    </button>
                </div>
                
                {/* Edit/Advice Actions */}
                <div className="flex gap-1 pl-2 border-l border-transparent sm:border-gray-200 dark:sm:border-slate-700/50">
                    <button 
                            onClick={() => onGetAdvice(habit.id, habit.name)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-violet-400 dark:hover:bg-violet-500/20 rounded-lg transition-colors"
                            title="Get AI Advice"
                    >
                        <MessageCircleQuestion size={18} />
                    </button>
                    <button 
                            onClick={() => onEdit(habit.id)}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                            title="Edit"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button 
                        onClick={() => onDelete(habit.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>
            </div>
            
            {/* AI Advice Section */}
            {isAdviceVisible && (
            <div className="mt-4 p-4 bg-indigo-50 dark:bg-violet-900/20 rounded-lg text-sm text-indigo-900 dark:text-violet-200 border border-indigo-100 dark:border-violet-900/30 animate-in fade-in slide-in-from-top-2">
                <div className="font-semibold mb-2 flex items-center gap-2">
                    🤖 StreakMate Coach Says:
                </div>
                <div className="markdown prose-sm dark:prose-invert">
                    {loadingAdvice ? "Thinking..." : advice.text}
                </div>
                <button onClick={onCloseAdvice} className="text-xs text-indigo-500 dark:text-violet-400 mt-2 underline">Close</button>
            </div>
            )}
        </div>
    );
};

// -- Main Habits Page Component --

export const HabitsPage: React.FC = () => {
  const { habits, addHabit, updateHabit, toggleHabitStatus, deleteHabit, getTodayStr } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [advice, setAdvice] = useState<{id: string, text: string} | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<HabitCategory>('Personal');
  const [freq, setFreq] = useState<DayOfWeek[]>([0,1,2,3,4,5,6]);

  const today = getTodayStr();
  const dayOfWeek = new Date(today).getDay() as DayOfWeek;

  const openModal = (habitId?: string) => {
      if (habitId) {
          const h = habits.find(h => h.id === habitId);
          if (h) {
              setEditId(h.id);
              setName(h.name);
              setDesc(h.description);
              setCat(h.category);
              setFreq(h.frequency || [0,1,2,3,4,5,6]);
          }
      } else {
          setEditId(null);
          setName('');
          setDesc('');
          setCat('Personal');
          setFreq([0,1,2,3,4,5,6]);
      }
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      if (editId) {
          updateHabit(editId, { name, description: desc, category: cat, frequency: freq });
      } else {
          addHabit(name, desc, cat, freq);
      }
      setIsModalOpen(false);
    }
  };

  const toggleDay = (day: DayOfWeek) => {
      setFreq(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleGetAdvice = async (habitId: string, habitName: string) => {
    setLoadingAdvice(true);
    setAdvice({ id: habitId, text: "Asking StreakMate Coach..." });
    const text = await getHabitAdvice(habitName);
    setAdvice({ id: habitId, text });
    setLoadingAdvice(false);
  };

  const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Habits</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Build consistency, one day at a time.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-violet-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-violet-500/20 flex items-center gap-2 transition-transform active:scale-95"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">New Habit</span>
        </button>
      </div>

      <div className="grid gap-4">
        {habits.length === 0 && (
            <div className="text-center py-12 glass-panel rounded-2xl border-dashed border-gray-300 dark:border-slate-700">
                <div className="bg-gray-100 dark:bg-slate-700/50 p-3 rounded-full w-fit mx-auto mb-4">
                    <Flame className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No habits yet</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2">Start your journey by adding your first habit. Small steps lead to big changes.</p>
            </div>
        )}

        {habits.map((habit) => (
            <HabitCard 
                key={habit.id}
                habit={habit}
                today={today}
                dayOfWeek={dayOfWeek}
                advice={advice}
                loadingAdvice={loadingAdvice}
                onToggleStatus={toggleHabitStatus}
                onEdit={openModal}
                onDelete={deleteHabit}
                onGetAdvice={handleGetAdvice}
                onCloseAdvice={() => setAdvice(null)}
            />
        ))}
      </div>

      {/* Add/Edit Modal - Glassmorphism */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{editId ? 'Edit Habit' : 'New Habit'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Habit Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g., Read 10 pages"
                    className="w-full bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select 
                            className="w-full bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white"
                            value={cat}
                            onChange={(e) => setCat(e.target.value as HabitCategory)}
                        >
                            <option value="Health">Health</option>
                            <option value="Study">Study</option>
                            <option value="Work">Work</option>
                            <option value="Personal">Personal</option>
                            <option value="Mindfulness">Mindfulness</option>
                            <option value="Finance">Finance</option>
                            <option value="Creative">Creative</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                    <div className="flex justify-between gap-1">
                        {DAYS.map((day, i) => {
                            const isSelected = freq.includes(i as DayOfWeek);
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => toggleDay(i as DayOfWeek)}
                                    className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                                        isSelected 
                                        ? 'bg-primary text-white shadow-lg shadow-violet-500/30' 
                                        : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 text-right">
                        {freq.length === 7 ? 'Every day' : freq.length === 0 ? 'Select days' : `${freq.length} days/week`}
                    </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                  <textarea 
                    placeholder="Why do you want to build this?"
                    className="w-full bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none h-20 resize-none text-gray-900 dark:text-white placeholder-gray-400"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-violet-700 shadow-lg shadow-violet-500/20"
                >
                  {editId ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};