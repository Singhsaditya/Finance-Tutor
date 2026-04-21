import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  MessageCircle,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const container = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';

const features = [
  {
    icon: MessageCircle,
    title: 'AI Tutor Bot',
    description:
      'Ask any question and get detailed, source-backed answers from your intelligent tutor. Real-time reasoning with knowledge retrieval.',
    href: '/ask',
    iconTone: 'text-brand-500 bg-brand-500/10 border-brand-500/20',
  },
  {
    icon: ClipboardList,
    title: 'Smart Quiz Engine',
    description:
      'Generate custom quizzes on any topic with adjustable difficulty. Track progress and reinforce learning through spaced repetition.',
    href: '/quiz',
    iconTone: 'text-accent-500 bg-accent-500/10 border-accent-500/20',
  },
  {
    icon: CheckCircle,
    title: 'Answer Evaluation',
    description:
      'Submit your answers and receive detailed rubric-based feedback with scoring breakdowns and improvement suggestions.',
    href: '/evaluate',
    iconTone: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: BookOpen,
    title: 'Concept Teaching',
    description:
      'Get structured, step-by-step lessons tailored to your level. Examples, resources, and practice questions included.',
    href: '/teach',
    iconTone: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
] as const;

const stats = [
  { value: '50K+', label: 'Questions Answered', icon: MessageCircle },
  { value: '98%', label: 'Accuracy Rate', icon: Target },
  { value: '12K+', label: 'Active Learners', icon: TrendingUp },
  { value: '4.9?', label: 'Average Rating', icon: Star },
] as const;

const steps = [
  {
    step: '01',
    title: 'Ask or choose a topic',
    desc: 'Type any question or select from our topic library. The AI instantly retrieves relevant knowledge.',
  },
  {
    step: '02',
    title: 'Get personalized content',
    desc: 'Receive detailed answers with citations, generate a quiz, or request a full structured lesson.',
  },
  {
    step: '03',
    title: 'Test and track progress',
    desc: 'Submit quiz answers for AI evaluation, track your score history, and see what to study next.',
  },
] as const;

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-1)] relative overflow-x-hidden">
      <Navbar />

      <section className="relative min-h-screen flex items-center justify-center pt-32 sm:pt-36 pb-20 hero-bg">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 -left-32 w-[540px] h-[540px] rounded-full bg-brand-500/10 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.04, 1, 1.04], rotate: [0, -5, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute -bottom-40 -right-40 w-[680px] h-[680px] rounded-full bg-accent-500/10 blur-3xl"
          />
        </div>

        <div className={`${container} relative z-10 text-center`}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex mb-6">
            <Badge variant="brand" className="px-4 py-1.5 text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered Learning Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-[var(--text-primary)] leading-[1.05] mb-6"
          >
            Learn Anything.
            <br />
            <span className="gradient-text">Master Everything.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Your AI tutor that answers questions with source citations, generates adaptive quizzes,
            evaluates your knowledge, and delivers personalized lessons all in one powerful platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start Learning Free
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto" variant="secondary" size="lg" leftIcon={<MessageCircle className="w-5 h-5" />}>
                Login
              </Button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-8">
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-1.5 text-[var(--text-tertiary)]"
            >
              <span className="text-xs">Scroll to explore</span>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 border-y border-[var(--border)] bg-[var(--surface-2)]">
        <div className={container}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-display font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className={container}>
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Everything you need
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-[var(--text-primary)] mb-4">Four modes of learning</h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              AI Tutor Bot adapts to how you learn best whether you prefer asking questions,
              taking quizzes, or following structured lessons.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="card p-8 border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-2)]"
                >
                  <div className="flex items-start gap-5">
                    <div className={`p-3 rounded-xl border ${feature.iconTone}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{feature.description}</p>
                      <Link to={feature.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:gap-2 transition-all">
                        Try it now <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[var(--surface-2)]">
        <div className={container}>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-[var(--text-primary)] mb-4">Learning in 3 simple steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="text-5xl font-display font-bold gradient-text mb-3 opacity-40">{item.step}</div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative card p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-accent-500/5 to-emerald-500/10 rounded-[inherit]" />
            <div className="relative z-10">
              <Badge variant="brand" className="mb-6">
                <Sparkles className="w-3 h-3 mr-1" />
                Free to get started
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-[var(--text-primary)] mb-4">Ready to learn smarter?</h2>
              <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
                No signup required. Jump straight in and start asking your tutor anything from basic concepts to advanced research topics.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Create Account
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto" variant="secondary" size="lg">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
