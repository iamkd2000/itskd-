import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Calendar, Square, CheckSquare, Clock, ChevronRight, Trophy } from 'lucide-react';
import { TaskPriority, TaskStatus } from '../types';

export const TasksPage: React.FC = () => {
  const { tasks, addTask, updateTaskStatus, deleteTask } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  // Form
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status !== 'completed';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  }).sort((a, b) => {
    const statusOrder = { 'in-progress': 0, 'pending': 1, 'completed': 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    return 0;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addTask(title, '', priority, dueDate);
      setTitle('');
      setDueDate('');
      setPriority('Medium');
    }
  };

  const cycleStatus = (id: string, current: TaskStatus) => {
      if (current === 'pending') updateTaskStatus(id, 'in-progress');
      else if (current === 'in-progress') updateTaskStatus(id, 'completed');
      else updateTaskStatus(id, 'pending');
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-500/20 dark:border-orange-500/30 dark:text-orange-400';
      case 'Low': return 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400';
    }
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto">
       <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">To-Do List</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Organize your day, earn XP.</p>
      </div>

      {/* Add Task Input - Glassmorphism */}
      <div className="glass-panel p-4 rounded-xl shadow-sm mb-8">
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
                <input 
                    type="text" 
                    placeholder="What needs to be done?" 
                    className="w-full bg-transparent outline-none p-2 text-gray-800 dark:text-white placeholder-gray-400"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
            </div>
            <div className="flex gap-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-700 pt-3 md:pt-0 md:pl-3">
                <select 
                    value={priority}
                    onChange={e => setPriority(e.target.value as TaskPriority)}
                    className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                </select>
                <input 
                    type="date" 
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button 
                    type="submit" 
                    className="bg-primary hover:bg-violet-700 text-white p-2 rounded-lg transition-colors shadow-lg shadow-violet-500/20"
                >
                    <Plus size={20} />
                </button>
            </div>
        </form>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
        {['all', 'pending', 'completed'].map((f) => (
            <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                    filter === f 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md' 
                    : 'glass-panel text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
            >
                {f}
            </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-gray-400">
                <p>No tasks found.</p>
            </div>
        )}
        {filteredTasks.map(task => {
            const xpReward = task.priority === 'High' ? 50 : task.priority === 'Medium' ? 35 : 20;
            
            return (
            <div 
                key={task.id} 
                className={`group flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    task.status === 'completed' 
                    ? 'bg-gray-50/50 dark:bg-slate-900/30 border-gray-100 dark:border-slate-800/50 opacity-60' 
                    : 'glass-panel hover:shadow-md hover:translate-x-1'
                }`}
            >
                <button 
                    onClick={() => cycleStatus(task.id, task.status)}
                    className={`flex-shrink-0 transition-colors ${
                        task.status === 'completed' ? 'text-emerald-500' : 
                        task.status === 'in-progress' ? 'text-yellow-500' : 
                        'text-gray-300 dark:text-gray-600 hover:text-primary'
                    }`}
                >
                    {task.status === 'completed' ? <CheckSquare size={24} /> : 
                     task.status === 'in-progress' ? <Clock size={24} /> : 
                     <Square size={24} />}
                </button>

                <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                        {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                         {task.status !== 'completed' && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Trophy size={10} /> +{xpReward} XP
                            </span>
                         )}
                         {task.dueDate && (
                             <div className={`flex items-center gap-1 text-xs ${
                                 task.status !== 'completed' && new Date(task.dueDate) < new Date() && new Date(task.dueDate).toDateString() !== new Date().toDateString()
                                 ? 'text-red-500 font-bold' 
                                 : 'text-gray-400'
                             }`}>
                                <Calendar size={12} />
                                <span>{task.dueDate}</span>
                             </div>
                         )}
                    </div>
                </div>

                {task.status === 'in-progress' && (
                    <span className="text-[10px] bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                        In Progress
                    </span>
                )}

                <span className={`text-[10px] px-2 py-1 rounded-md border font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                </span>

                <button 
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        )})}
      </div>
    </div>
  );
};