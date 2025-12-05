
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, PenLine, Save, Smile, Meh, Frown, Zap, Coffee, Heart, Moon } from 'lucide-react';
import { Mood } from '../types';

export const JournalPage: React.FC = () => {
    const { diaryEntries, addDiaryEntry, getTodayStr } = useApp();
    const todayStr = getTodayStr();
    
    // Editor State
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<Mood>('Neutral');
    const [isSaved, setIsSaved] = useState(false);

    // Load entry if exists for selected date
    useEffect(() => {
        const entry = diaryEntries.find(d => d.date === selectedDate);
        if (entry) {
            setContent(entry.content);
            setMood(entry.mood);
        } else {
            setContent('');
            setMood('Neutral');
        }
        setIsSaved(true); // Assume synced when loaded
    }, [selectedDate, diaryEntries]);

    const handleSave = () => {
        if (!content.trim()) return;
        addDiaryEntry(selectedDate, content, mood);
        setIsSaved(true);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        setIsSaved(false);
    };

    const moodOptions: { type: Mood, icon: any, color: string }[] = [
        { type: 'Happy', icon: Smile, color: 'text-green-500' },
        { type: 'Excited', icon: Zap, color: 'text-yellow-500' },
        { type: 'Grateful', icon: Heart, color: 'text-pink-500' },
        { type: 'Neutral', icon: Meh, color: 'text-blue-400' },
        { type: 'Tired', icon: Coffee, color: 'text-amber-700' },
        { type: 'Sad', icon: Frown, color: 'text-indigo-400' },
        { type: 'Stressed', icon: Moon, color: 'text-purple-400' },
    ];

    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto h-[calc(100vh-80px)]">
            <div className="flex flex-col md:flex-row h-full gap-6">
                
                {/* Left Sidebar: Calendar/History */}
                <div className="w-full md:w-1/3 glass-panel rounded-2xl p-4 flex flex-col h-full overflow-hidden">
                    <div className="mb-4">
                         <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                             <Calendar className="text-primary" /> History
                         </h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {/* Always show today at top */}
                        <button
                            onClick={() => setSelectedDate(todayStr)}
                            className={`w-full p-3 rounded-xl text-left transition-all ${
                                selectedDate === todayStr
                                ? 'bg-primary text-white shadow-lg shadow-violet-500/30'
                                : 'bg-white/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Today</span>
                                <span className="text-xs opacity-80">{todayStr}</span>
                            </div>
                            <p className="text-xs mt-1 truncate opacity-70">
                                {diaryEntries.find(d => d.date === todayStr)?.content || "No entry yet..."}
                            </p>
                        </button>

                        {diaryEntries.filter(d => d.date !== todayStr).map(entry => (
                             <button
                                key={entry.id}
                                onClick={() => setSelectedDate(entry.date)}
                                className={`w-full p-3 rounded-xl text-left transition-all ${
                                    selectedDate === entry.date
                                    ? 'bg-primary text-white shadow-lg shadow-violet-500/30'
                                    : 'bg-white/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{entry.mood}</span>
                                    <span className="text-xs opacity-80">{entry.date}</span>
                                </div>
                                <p className="text-xs mt-1 truncate opacity-70">
                                    {entry.content}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Area: Editor */}
                <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col h-full relative">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {selectedDate === todayStr ? "Today's Journal" : `Entry for ${selectedDate}`}
                             </h1>
                             <p className="text-sm text-gray-500 dark:text-gray-400">Reflect on your day, express gratitude.</p>
                        </div>
                        <button 
                            onClick={handleSave}
                            disabled={isSaved}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                isSaved 
                                ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                : 'bg-primary hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20'
                            }`}
                        >
                            <Save size={18} /> {isSaved ? 'Saved' : 'Save Entry'}
                        </button>
                    </div>

                    {/* Mood Selector */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                        {moodOptions.map((opt) => (
                            <button
                                key={opt.type}
                                onClick={() => { setMood(opt.type); setIsSaved(false); }}
                                className={`flex flex-col items-center gap-1 p-3 rounded-xl min-w-[70px] transition-all border ${
                                    mood === opt.type 
                                    ? 'bg-white dark:bg-slate-700 border-primary dark:border-primary shadow-md transform scale-105' 
                                    : 'bg-gray-50 dark:bg-slate-900/40 border-transparent opacity-60 hover:opacity-100'
                                }`}
                            >
                                <opt.icon className={`${opt.color}`} size={24} />
                                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{opt.type}</span>
                            </button>
                        ))}
                    </div>

                    {/* Editor */}
                    <div className="flex-1 relative">
                        <textarea 
                            className="w-full h-full bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200 text-lg leading-relaxed placeholder-gray-400 dark:placeholder-gray-600"
                            placeholder="Write your thoughts here..."
                            value={content}
                            onChange={handleContentChange}
                        ></textarea>
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
                            {content.length} chars
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
