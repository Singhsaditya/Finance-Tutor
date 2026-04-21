import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, DashboardStats, ActivityItem, AuthUser } from '@/types';

interface AppStore {
  theme: Theme;
  toggleTheme: () => void;

  stats: DashboardStats;
  incrementStat: (key: keyof DashboardStats, amount?: number) => void;
  updateAvgScore: (score: number, maxScore: number) => void;
  setDashboardData: (stats: DashboardStats, activities: ActivityItem[]) => void;

  recentActivity: ActivityItem[];
  addActivity: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;

  sessionId: string;
  generateNewSession: () => void;

  user: AuthUser | null;
  authToken: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

const generateId = () => Math.random().toString(36).slice(2, 11);

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        }),

      stats: {
        questionsAsked: 0,
        quizAttempts: 0,
        avgScore: 0,
        topicsLearned: 0,
      },
      incrementStat: (key, amount = 1) =>
        set((s) => ({
          stats: { ...s.stats, [key]: s.stats[key] + amount },
        })),

      updateAvgScore: (score, maxScore) =>
        set((s) => {
          const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
          const attempts = s.stats.quizAttempts || 1;
          const currentAvg = s.stats.avgScore;
          const newAvg = Math.round((currentAvg * (attempts - 1) + pct) / attempts);
          return { stats: { ...s.stats, avgScore: newAvg } };
        }),

      setDashboardData: (stats, activities) => set({ stats, recentActivity: activities }),

      recentActivity: [],
      addActivity: (item) =>
        set((s) => ({
          recentActivity: [
            {
              ...item,
              id: generateId(),
              timestamp: new Date(),
            },
            ...s.recentActivity.slice(0, 49),
          ],
        })),

      sessionId: generateId(),
      generateNewSession: () => set({ sessionId: generateId() }),

      user: null,
      authToken: null,
      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, authToken: token });
      },
      clearAuth: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, authToken: null });
      },
    }),
    {
      name: 'ai-tutor-bot-store',
      partialize: (s) => ({
        theme: s.theme,
        stats: s.stats,
        recentActivity: s.recentActivity,
        sessionId: s.sessionId,
        user: s.user,
        authToken: s.authToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.classList.toggle('dark', state.theme === 'dark');
        }
        if (state?.authToken) {
          localStorage.setItem('auth_token', state.authToken);
        }
      },
    }
  )
);
