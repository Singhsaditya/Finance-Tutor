import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageCircle,
  ClipboardList,
  CheckCircle,
  BookOpen,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: MessageCircle, label: 'Ask Tutor', href: '/ask' },
  { icon: ClipboardList, label: 'Quiz', href: '/quiz' },
  { icon: CheckCircle, label: 'Evaluate', href: '/evaluate' },
  { icon: BookOpen, label: 'Learn', href: '/teach' },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col',
        'border-r border-[var(--border)] bg-[var(--surface-1)] transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo area */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-[var(--border)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-[var(--text-primary)]">
            AI Tutor <span className="gradient-text">Bot</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} to={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'sidebar-link',
                  isActive && 'active',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                  </>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-[var(--border)]">
          <div className="glass-card rounded-xl p-3">
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">
              🎓 Pro Tip
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Start with a topic question, then generate a quiz to test yourself!
            </p>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
