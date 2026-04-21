import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl">
                AI Tutor <span className="gradient-text">Bot</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs leading-relaxed">
              AI-powered learning platform that helps you master any concept through
              intelligent tutoring, quizzes, and personalized lessons.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              {['Dashboard', 'Ask Tutor', 'Quiz Mode', 'Learn', 'Evaluate'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-[var(--text-primary)] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              {['About', 'Blog', 'Careers', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-[var(--text-primary)] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-tertiary)]">
            © 2024 AI Tutor Bot. Built with ♥ for learners worldwide.
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Powered by advanced AI • v1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
}
