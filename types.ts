
export type HabitCategory = 'Health' | 'Study' | 'Work' | 'Personal' | 'Mindfulness' | 'Finance' | 'Creative';

export type CheckStatus = 'done' | 'missed' | 'skipped' | null;

export interface HabitLog {
  [dateString: string]: CheckStatus; // Format: YYYY-MM-DD
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  startDate: string;
  logs: HabitLog;
  active: boolean;
  currentStreak: number;
  longestStreak: number;
  frequency: DayOfWeek[]; // Days of week this habit should be performed
}

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  xp: number;
  level: number;
  theme: 'light' | 'dark';
}

// -- Journal Types --
export type Mood = 'Happy' | 'Neutral' | 'Sad' | 'Excited' | 'Stressed' | 'Grateful' | 'Tired';

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood: Mood;
  createdAt: string;
}

// -- Library Types --
export type BookStatus = 'Reading' | 'Completed' | 'To Read';

export interface Quote {
  id: string;
  text: string;
  page?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  topic?: string; // "sometopic of the book"
  totalPages: number;
  currentPage: number;
  status: BookStatus;
  coverColor: string; // CSS color class or hex
  quotes: Quote[];
  startDate?: string;
  completedDate?: string;
  content?: string; // The full text of the book for reading
}
