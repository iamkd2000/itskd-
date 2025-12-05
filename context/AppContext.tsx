
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Habit, Task, HabitCategory, TaskPriority, CheckStatus, UserProfile, TaskStatus, DayOfWeek, DiaryEntry, Book, Mood, BookStatus, Quote } from '../types';

interface AppContextType {
  user: UserProfile;
  habits: Habit[];
  tasks: Task[];
  diaryEntries: DiaryEntry[];
  books: Book[];
  
  // Habits & Tasks
  addHabit: (name: string, description: string, category: HabitCategory, frequency: DayOfWeek[]) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  toggleHabitStatus: (habitId: string, date: string, status: CheckStatus) => void;
  deleteHabit: (id: string) => void;
  addTask: (title: string, description: string, priority: TaskPriority, dueDate: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  
  // Journal
  addDiaryEntry: (date: string, content: string, mood: Mood) => void;
  updateDiaryEntry: (id: string, content: string, mood: Mood) => void;
  deleteDiaryEntry: (id: string) => void;
  
  // Library
  addBook: (title: string, author: string, topic: string, totalPages: number, coverColor: string, content?: string) => void;
  updateBookProgress: (id: string, currentPage: number) => void;
  updateBookStatus: (id: string, status: BookStatus) => void;
  addQuoteToBook: (bookId: string, text: string, page?: string) => void;
  deleteQuoteFromBook: (bookId: string, quoteId: string) => void;
  deleteBook: (id: string) => void;

  getTodayStr: () => string;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

// XP Constants
const XP_HABIT_DONE = 15;
const XP_TASK_LOW = 20;
const XP_TASK_MEDIUM = 35;
const XP_TASK_HIGH = 50;
const XP_BOOK_COMPLETED = 100;
const XP_DIARY_ENTRY = 10;

const calculateLevel = (xp: number) => {
  // Simple formula: Level increases every 100 * level XP (approx)
  return Math.floor(Math.sqrt(xp / 50)) + 1;
};

// Helper to calculate streak
const calculateStreak = (logs: { [date: string]: CheckStatus }, todayStr: string): number => {
  let streak = 0;
  let currentCheckDate = new Date(todayStr);
  
  const todayStatus = logs[todayStr];
  if (todayStatus === 'done') {
    streak++;
  }

  currentCheckDate.setDate(currentCheckDate.getDate() - 1);
  
  while (true) {
    const dateStr = currentCheckDate.toISOString().split('T')[0];
    const status = logs[dateStr];

    if (status === 'done') {
      streak++;
    } else if (status === 'skipped') {
      // Skip maintains streak
    } else {
      break;
    }
    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
  }
  return streak;
};

export const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  // Lazy init user to grab theme immediately
  const [user, setUser] = useState<UserProfile>(() => {
    const stored = localStorage.getItem('sm_user');
    return stored ? JSON.parse(stored) : {
      name: 'Achiever',
      xp: 150, // Dummy Start XP
      level: 2, // Dummy Start Level
      theme: 'dark' // Default to dark
    };
  });

  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

  // Generate Dummy Data Helper
  const generateDummyData = () => {
    const today = new Date();
    const getDate = (offset: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() - offset);
        return d.toISOString().split('T')[0];
    };

    const dummyHabits: Habit[] = [
        {
            id: 'h1',
            name: 'Read Bhagavad Gita',
            description: 'Read one chapter daily for spiritual wisdom.',
            category: 'Study',
            startDate: getDate(30),
            active: true,
            frequency: [0, 1, 2, 3, 4, 5, 6],
            currentStreak: 4,
            longestStreak: 12,
            logs: {
                [getDate(1)]: 'done',
                [getDate(2)]: 'done',
                [getDate(3)]: 'done',
                [getDate(4)]: 'done',
                [getDate(5)]: 'skipped',
                [getDate(6)]: 'done',
                [getDate(7)]: 'done',
                [getDate(8)]: 'missed',
                [getDate(9)]: 'done',
                [getDate(10)]: 'done'
            }
        },
        {
            id: 'h2',
            name: 'Morning Jog (5km)',
            description: 'Run in the park to stay fit.',
            category: 'Health',
            startDate: getDate(15),
            active: true,
            frequency: [1, 3, 5], // Mon, Wed, Fri
            currentStreak: 2,
            longestStreak: 5,
            logs: {
                [getDate(0)]: 'done',
                [getDate(1)]: 'done',
                [getDate(3)]: 'done',
                [getDate(5)]: 'done',
            }
        },
        {
            id: 'h3',
            name: 'Deep Work (2 Hours)',
            description: 'Focus block for coding.',
            category: 'Work',
            startDate: getDate(10),
            active: true,
            frequency: [1, 2, 3, 4, 5],
            currentStreak: 8,
            longestStreak: 8,
            logs: {
                [getDate(0)]: 'done',
                [getDate(1)]: 'done',
                [getDate(2)]: 'done',
                [getDate(3)]: 'done',
                [getDate(4)]: 'done',
                [getDate(5)]: 'done',
                [getDate(6)]: 'done',
                [getDate(7)]: 'done',
            }
        },
         {
            id: 'h4',
            name: 'Drink 3L Water',
            description: 'Hydration is key.',
            category: 'Health',
            startDate: getDate(5),
            active: true,
            frequency: [0, 1, 2, 3, 4, 5, 6],
            currentStreak: 1,
            longestStreak: 3,
            logs: {
                [getDate(0)]: 'done',
                [getDate(2)]: 'missed',
                [getDate(3)]: 'done',
            }
        }
    ];

    const dummyTasks: Task[] = [
        {
            id: 't1',
            title: 'Complete Project Documentation',
            description: 'Finish the README and API docs for StreakMate.',
            priority: 'High',
            status: 'in-progress',
            dueDate: getDate(-2), // Due in 2 days
            createdAt: getDate(2)
        },
        {
            id: 't2',
            title: 'Grocery Shopping',
            description: 'Buy fruits, milk, and eggs.',
            priority: 'Medium',
            status: 'pending',
            dueDate: getDate(-1),
            createdAt: getDate(1)
        },
        {
            id: 't3',
            title: 'Review PRs',
            priority: 'High',
            status: 'completed',
            createdAt: getDate(3)
        },
        {
            id: 't4',
            title: 'Call Parents',
            priority: 'Low',
            status: 'pending',
            dueDate: getDate(0),
            createdAt: getDate(5)
        }
    ];

    const dummyDiary: DiaryEntry[] = [
        {
            id: 'd1',
            date: getDate(0),
            mood: 'Grateful',
            content: "Today was a productive day. I managed to finish the core features of the app and also had a great run in the morning. Feeling thankful for the energy.",
            createdAt: new Date().toISOString()
        },
        {
            id: 'd2',
            date: getDate(1),
            mood: 'Stressed',
            content: "Had a bit of a rough start with some bugs in the code, but eventually figured it out. Need to sleep earlier tonight.",
            createdAt: new Date().toISOString()
        }
    ];

    const dummyText = `Chapter 1: The Fundamentals

Success is the product of daily habits—not once-in-a-lifetime transformations. That said, it doesn’t matter how successful or unsuccessful you are right now. What matters is whether your habits are putting you on the path toward success. You should be far more concerned with your current trajectory than with your current results.

Your outcomes are a lagging measure of your habits. Your net worth is a lagging measure of your financial habits. Your weight is a lagging measure of your eating habits. Your knowledge is a lagging measure of your learning habits. Your clutter is a lagging measure of your cleaning habits. You get what you repeat.

If you want to predict where you’ll end up in life, all you have to do is follow the curve of tiny gains or tiny losses, and see how your daily choices will compound ten or twenty years down the line. Are you spending less than you earn each month? Are you going into the gym each week? Are you reading books and learning something new each day? Tiny battles like these are the ones that will define your future self.

Time magnifies the margin between success and failure. It will multiply whatever you feed it. Good habits make time your ally. Bad habits make time your enemy.

Habits are a double-edged sword. Bad habits can cut you down just as easily as good habits can build you up. That is why understanding the details is crucial. You need to know how habits work and how to design them to your liking, so you can avoid the dangerous half of the blade.

(This is dummy text content to demonstrate the Reader feature. You can upload your own .txt files.)
`;

    const dummyBooks: Book[] = [
        {
            id: 'b1',
            title: 'Atomic Habits',
            author: 'James Clear',
            topic: 'Self-Improvement',
            totalPages: 320,
            currentPage: 150,
            status: 'Reading',
            coverColor: 'bg-orange-500',
            quotes: [
                { id: 'q1', text: "You do not rise to the level of your goals. You fall to the level of your systems.", page: '27', createdAt: getDate(5) }
            ],
            startDate: getDate(10),
            content: dummyText
        },
        {
            id: 'b2',
            title: 'Deep Work',
            author: 'Cal Newport',
            topic: 'Productivity',
            totalPages: 296,
            currentPage: 296,
            status: 'Completed',
            coverColor: 'bg-yellow-500',
            quotes: [
                { id: 'q2', text: "Clarity about what matters provides clarity about what does not.", page: '102', createdAt: getDate(20) }
            ],
            startDate: getDate(30),
            completedDate: getDate(2),
            content: dummyText
        }
    ];

    return { dummyHabits, dummyTasks, dummyDiary, dummyBooks };
  };

  // Load Data
  useEffect(() => {
    const storedHabits = localStorage.getItem('sm_habits');
    const storedTasks = localStorage.getItem('sm_tasks');
    const storedDiary = localStorage.getItem('sm_diary');
    const storedBooks = localStorage.getItem('sm_books');

    const { dummyHabits, dummyTasks, dummyDiary, dummyBooks } = generateDummyData();

    if (storedHabits) {
      const parsed = JSON.parse(storedHabits);
      if (parsed.length === 0) setHabits(dummyHabits);
      else setHabits(parsed.map((h: any) => ({ ...h, frequency: h.frequency || [0,1,2,3,4,5,6] })));
    } else {
      setHabits(dummyHabits);
    }

    if (storedTasks) {
      const parsed = JSON.parse(storedTasks);
      if (parsed.length === 0) setTasks(dummyTasks);
      else {
        const migrated = parsed.map((t: any) => ({
            ...t,
            status: t.status || (t.completed ? 'completed' : 'pending')
        }));
        setTasks(migrated);
      }
    } else {
       setTasks(dummyTasks);
    }

    if (storedDiary) {
        setDiaryEntries(JSON.parse(storedDiary));
    } else {
        setDiaryEntries(dummyDiary);
    }

    if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
    } else {
        setBooks(dummyBooks);
    }
  }, []);

  // Save Data
  useEffect(() => localStorage.setItem('sm_habits', JSON.stringify(habits)), [habits]);
  useEffect(() => localStorage.setItem('sm_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('sm_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('sm_diary', JSON.stringify(diaryEntries)), [diaryEntries]);
  useEffect(() => localStorage.setItem('sm_books', JSON.stringify(books)), [books]);

  // Theme Effect
  useEffect(() => {
    if (user.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.theme]);

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const addXP = (amount: number) => {
    setUser(prev => {
      const newXP = Math.max(0, prev.xp + amount);
      const newLevel = calculateLevel(newXP);
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const toggleTheme = () => {
    setUser(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  // --- Habit Logic ---
  const addHabit = (name: string, description: string, category: HabitCategory, frequency: DayOfWeek[]) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      description,
      category,
      startDate: getTodayStr(),
      logs: {},
      active: true,
      currentStreak: 0,
      longestStreak: 0,
      frequency
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const toggleHabitStatus = (habitId: string, date: string, status: CheckStatus) => {
    let xpChange = 0;
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const previousStatus = h.logs[date];
      const newLogs = { ...h.logs, [date]: status };
      if (status === 'done' && previousStatus !== 'done') xpChange = XP_HABIT_DONE;
      else if (status !== 'done' && previousStatus === 'done') xpChange = -XP_HABIT_DONE;
      const streak = calculateStreak(newLogs, getTodayStr());
      return { ...h, logs: newLogs, currentStreak: streak, longestStreak: Math.max(h.longestStreak, streak) };
    }));
    if (xpChange !== 0) addXP(xpChange);
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // --- Task Logic ---
  const addTask = (title: string, description: string, priority: TaskPriority, dueDate: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      dueDate,
      status: 'pending',
      createdAt: getTodayStr(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    let xpChange = 0;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        if (status === 'completed' && task.status !== 'completed') {
            if (task.priority === 'High') xpChange = XP_TASK_HIGH;
            else if (task.priority === 'Medium') xpChange = XP_TASK_MEDIUM;
            else xpChange = XP_TASK_LOW;
        } else if (status !== 'completed' && task.status === 'completed') {
            if (task.priority === 'High') xpChange = -XP_TASK_HIGH;
            else if (task.priority === 'Medium') xpChange = -XP_TASK_MEDIUM;
            else xpChange = -XP_TASK_LOW;
        }
    }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    if (xpChange !== 0) addXP(xpChange);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // --- Journal Logic ---
  const addDiaryEntry = (date: string, content: string, mood: Mood) => {
      const existing = diaryEntries.find(d => d.date === date);
      if (existing) {
          updateDiaryEntry(existing.id, content, mood);
          return;
      }

      const newEntry: DiaryEntry = {
          id: crypto.randomUUID(),
          date,
          content,
          mood,
          createdAt: new Date().toISOString()
      };
      setDiaryEntries(prev => [newEntry, ...prev].sort((a,b) => b.date.localeCompare(a.date)));
      addXP(XP_DIARY_ENTRY);
  };

  const updateDiaryEntry = (id: string, content: string, mood: Mood) => {
      setDiaryEntries(prev => prev.map(e => e.id === id ? { ...e, content, mood } : e));
  };

  const deleteDiaryEntry = (id: string) => {
      setDiaryEntries(prev => prev.filter(e => e.id !== id));
  };

  // --- Library Logic ---
  const addBook = (title: string, author: string, topic: string, totalPages: number, coverColor: string, content?: string) => {
      const newBook: Book = {
          id: crypto.randomUUID(),
          title,
          author,
          topic,
          totalPages,
          currentPage: 0,
          status: 'To Read',
          coverColor,
          quotes: [],
          startDate: getTodayStr(),
          content
      };
      setBooks(prev => [newBook, ...prev]);
  };

  const updateBookProgress = (id: string, currentPage: number) => {
      setBooks(prev => prev.map(b => {
          if (b.id !== id) return b;
          const isComplete = currentPage >= b.totalPages;
          if (isComplete && b.status !== 'Completed') {
              addXP(XP_BOOK_COMPLETED);
          }
          return {
              ...b,
              currentPage: Math.min(currentPage, b.totalPages),
              status: isComplete ? 'Completed' : b.currentPage === 0 && currentPage > 0 ? 'Reading' : b.status,
              completedDate: isComplete ? getTodayStr() : undefined
          };
      }));
  };

  const updateBookStatus = (id: string, status: BookStatus) => {
      setBooks(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const addQuoteToBook = (bookId: string, text: string, page?: string) => {
      setBooks(prev => prev.map(b => {
          if (b.id !== bookId) return b;
          const newQuote: Quote = {
              id: crypto.randomUUID(),
              text,
              page,
              createdAt: getTodayStr()
          };
          return { ...b, quotes: [...b.quotes, newQuote] };
      }));
  };

  const deleteQuoteFromBook = (bookId: string, quoteId: string) => {
      setBooks(prev => prev.map(b => {
          if (b.id !== bookId) return b;
          return { ...b, quotes: b.quotes.filter(q => q.id !== quoteId) };
      }));
  };

  const deleteBook = (id: string) => {
      setBooks(prev => prev.filter(b => b.id !== id));
  };

  const value = {
      user, habits, tasks, diaryEntries, books,
      addHabit, updateHabit, toggleHabitStatus, deleteHabit,
      addTask, updateTaskStatus, deleteTask,
      addDiaryEntry, updateDiaryEntry, deleteDiaryEntry,
      addBook, updateBookProgress, updateBookStatus, addQuoteToBook, deleteQuoteFromBook, deleteBook,
      getTodayStr, toggleTheme
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
