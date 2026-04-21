import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  MessageCircle,
  ClipboardList,
  Target,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/store';
import { getDashboardData } from '@/api';
import {
  generateActivityChartData,
  generateScoreTrendData,
  timeAgo,
} from '@/utils';

const activityTypeConfig = {
  ask: { label: 'Question', color: 'brand', icon: MessageCircle },
  quiz: { label: 'Quiz', color: 'accent', icon: ClipboardList },
  evaluate: { label: 'Evaluation', color: 'success', icon: Target },
  teach: { label: 'Lesson', color: 'warning', icon: BookOpen },
} as const;

export function DashboardPage() {
  const { stats, recentActivity, setDashboardData, clearAuth } = useAppStore();
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingData(true);
      try {
        const data = await getDashboardData();
        if (!mounted) return;
        setDashboardData(
          data.stats,
          data.recentActivity.map((item) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
        );
      } catch (err) {
        const message = (err as Error).message.toLowerCase();
        if (message.includes('401') || message.includes('token')) {
          clearAuth();
        }
      } finally {
        if (mounted) setLoadingData(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [setDashboardData, clearAuth]);

  const activityData = useMemo(() => generateActivityChartData(), []);
  const scoreTrendData = useMemo(() => generateScoreTrendData(), []);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Track your learning progress and recent activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/ask">
            <Button size="sm" leftIcon={<MessageCircle className="w-4 h-4" />}>
              Ask Tutor
            </Button>
          </Link>
          <Link to="/quiz">
            <Button variant="secondary" size="sm" leftIcon={<ClipboardList className="w-4 h-4" />}>
              New Quiz
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Questions Asked"
          value={stats.questionsAsked}
          icon={<MessageCircle className="w-5 h-5" />}
          color="brand"
          index={0}
          trend={{ value: 12, label: 'vs last week' }}
        />
        <StatCard
          label="Quiz Attempts"
          value={stats.quizAttempts}
          icon={<ClipboardList className="w-5 h-5" />}
          color="accent"
          index={1}
          trend={{ value: 5, label: 'vs last week' }}
        />
        <StatCard
          label="Avg. Score"
          value={`${stats.avgScore}%`}
          icon={<Target className="w-5 h-5" />}
          color="success"
          index={2}
          trend={{ value: stats.avgScore > 70 ? 8 : -3, label: 'vs last week' }}
        />
        <StatCard
          label="Topics Learned"
          value={stats.topicsLearned}
          icon={<BookOpen className="w-5 h-5" />}
          color="warning"
          index={3}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Activity chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-[var(--text-primary)]">
                Weekly Activity
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Questions & quizzes over the past week
              </p>
            </div>
            <Badge variant="brand">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12%
            </Badge>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData} barCategoryGap="30%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
              />
              <Bar dataKey="questions" name="Questions" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="quizzes" name="Quizzes" fill="#d946ef" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Score trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-[var(--text-primary)]">
                Score Trend
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Your quiz performance over time
              </p>
            </div>
            <Badge variant="success">
              Improving
            </Badge>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={scoreTrendData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#scoreGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent activity + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6 lg:col-span-2"
        >
            <h2 className="font-display font-bold text-[var(--text-primary)] mb-5">
              Recent Activity
            </h2>

          {loadingData ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading activity...</p>
          ) : recentActivity.length === 0 ? (
            <EmptyState
              icon={<MessageCircle className="w-6 h-6" />}
              title="No activity yet"
              description="Start asking questions or taking quizzes to see your activity here."
              action={
                <Link to="/ask">
                  <Button size="sm">Ask Your First Question</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 8).map((item, i) => {
                const config = activityTypeConfig[item.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-3)] transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        config.color === 'brand'
                          ? 'bg-brand-500/10 text-brand-500'
                          : config.color === 'accent'
                          ? 'bg-accent-500/10 text-accent-500'
                          : config.color === 'success'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {config.label} • {timeAgo(item.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <h2 className="font-display font-bold text-[var(--text-primary)] mb-5">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Ask a question', desc: 'Get instant AI answers', href: '/ask', icon: MessageCircle, color: 'text-brand-500 bg-brand-500/10' },
              { label: 'Take a quiz', desc: 'Test your knowledge', href: '/quiz', icon: ClipboardList, color: 'text-accent-500 bg-accent-500/10' },
              { label: 'Learn a concept', desc: 'Structured lessons', href: '/teach', icon: BookOpen, color: 'text-amber-500 bg-amber-500/10' },
              { label: 'Evaluate answer', desc: 'Get AI feedback', href: '/evaluate', icon: Target, color: 'text-emerald-500 bg-emerald-500/10' },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} to={action.href}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-3)] transition-all cursor-pointer group"
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {action.label}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors" />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
