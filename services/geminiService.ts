import { Habit, Task } from "../types";

// Static quotes collection (Bhagavad Gita focus)
const GITA_QUOTES = [
  "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.",
  "Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure.",
  "On this path effort never goes to waste, and there is no failure.",
  "The mind is restless and difficult to restrain, but it is subdued by practice.",
  "A person is said to be established in self-realization and is called a yogi when he is fully satisfied by virtue of acquired knowledge and realization.",
  "There is nothing lost or wasted in this life.",
  "Set thy heart upon thy work, but never on its reward.",
  "One who sees inaction in action, and action in inaction, is intelligent among men.",
  "Yoga is the journey of the self, through the self, to the self.",
  "Change is the law of the universe. You can be a millionaire, or a pauper in an instant.",
  "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place.",
  "He who has no attachment can really love others, for his love is pure and divine."
];

export const getMotivationalMessage = async (habits: Habit[], tasks: Task[], username: string): Promise<string> => {
  // Simulate network delay for effect
  await new Promise(resolve => setTimeout(resolve, 800));
  const randomIndex = Math.floor(Math.random() * GITA_QUOTES.length);
  return GITA_QUOTES[randomIndex];
};

export const getHabitAdvice = async (habitName: string): Promise<string> => {
   // Simulate network delay for effect
   await new Promise(resolve => setTimeout(resolve, 1000));
   
   // Generic helpful advice generator
   const tips = [
     `Consistency is key. Focus on showing up for "${habitName}" every single day, even if it's just for 5 minutes.`,
     `Try "habit stacking": perform "${habitName}" immediately after a habit you already do automatically.`,
     `Don't break the chain! Track your progress visually to keep your streak alive.`,
     `If you miss a day of "${habitName}", be compassionate with yourself but get back on track immediately. Never miss twice.`,
     `Remember your "why". Visualize the person you become by maintaining the habit of "${habitName}".`
   ];
   
   return tips[Math.floor(Math.random() * tips.length)];
};