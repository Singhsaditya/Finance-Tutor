import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { askTutor } from '@/api';
import type { AskResponse, LoadingState } from '@/types';
import { Button } from '@/components/ui/Button';
import { SkeletonAnswer } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/store';
import { cn } from '@/utils';

interface Message {
  id: string;
  query: string;
  response?: AskResponse;
  status: LoadingState;
  timestamp: Date;
}

export function AskTutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { addActivity, incrementStat, sessionId: storeSessionId } = useAppStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [query]);

  const handleSubmit = async () => {
    if (!query.trim()) return;

    const msgId = Date.now().toString();
    const newMessage: Message = {
      id: msgId,
      query: query.trim(),
      status: 'loading',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setQuery('');

    try {
      const response = await askTutor({
        query: newMessage.query,
        top_k: 5,
        session_id: storeSessionId,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, response, status: 'success' } : m
        )
      );

      incrementStat('questionsAsked');
      addActivity({ type: 'ask', title: newMessage.query.slice(0, 80) });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, status: 'error' } : m
        )
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const retryMessage = async (msg: Message) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id ? { ...m, status: 'loading', response: undefined } : m
      )
    );

    try {
      const response = await askTutor({
        query: msg.query,
        top_k: 5,
        session_id: storeSessionId,
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, response, status: 'success' } : m))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: 'error' } : m))
      );
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      <div className="flex-shrink-0 px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
            Ask Tutor
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Ask finance questions and get source-backed explanations
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && (
          <EmptyState
            icon={<MessageCircle className="w-8 h-8" />}
            title="Ask your first finance question"
            description="Type a finance question and the tutor will reply with concise, source-backed answers."
            action={
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'What is dollar-cost averaging?',
                  'How does P/E ratio help stock analysis?',
                  'Explain inflation vs interest rates',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuery(q)}
                    className="text-sm px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-500/50 hover:text-brand-500 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            }
          />
        )}

        {messages.map((msg) => (
          <MessageThread key={msg.id} message={msg} onRetry={() => retryMessage(msg)} />
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 px-6 py-4 border-t border-[var(--border)]">
        <div className="relative card p-1">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about investing, markets, or personal finance..."
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-3 pr-16 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
            style={{ minHeight: '52px', maxHeight: '200px' }}
          />
          <div className="absolute bottom-2 right-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!query.trim()}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </div>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-2 text-center">
          Finance-focused AI tutor with retrieval and cited sources
        </p>
      </div>
    </div>
  );
}

function MessageThread({
  message,
  onRetry,
}: {
  message: Message;
  onRetry: () => void;
}) {
  const [expandedSources, setExpandedSources] = useState(false);
  const [expandedMeta, setExpandedMeta] = useState(false);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[75%] bg-gradient-to-br from-brand-500 to-accent-500 text-white rounded-2xl rounded-tr-sm px-5 py-3.5">
          <p className="text-sm leading-relaxed">{message.query}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 space-y-3">
          {message.status === 'loading' && <SkeletonAnswer />}

          {message.status === 'error' && (
            <ErrorState
              message="Failed to get a response. Please try again."
              onRetry={onRetry}
            />
          )}

          {message.status === 'success' && message.response && (
            <>
              <div className="card p-5">
                <div
                  className="answer-prose text-[var(--text-primary)]"
                  dangerouslySetInnerHTML={{
                    __html: formatAnswer(message.response.answer),
                  }}
                />
              </div>

              {message.response.sources.length > 0 && (
                <div className="card p-4">
                  <button
                    onClick={() => setExpandedSources(!expandedSources)}
                    className="flex items-center justify-between w-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {message.response.sources.length} Source{message.response.sources.length !== 1 ? 's' : ''}
                    </span>
                    {expandedSources ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedSources && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3 space-y-2"
                      >
                        {message.response.sources.map((src) => (
                          <div
                            key={src.chunk_id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-3)]"
                          >
                            <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                                {src.file}
                              </p>
                              <p className="text-xs text-[var(--text-tertiary)]">
                                Lines {src.start} - {src.end} | Chunk {src.chunk_id}
                              </p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {message.response.score_meta && Object.keys(message.response.score_meta).length > 0 && (
                <div className="card p-4">
                  <button
                    onClick={() => setExpandedMeta(!expandedMeta)}
                    className="flex items-center justify-between w-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <span>Confidence Metrics</span>
                    {expandedMeta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <AnimatePresence>
                    {expandedMeta && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(message.response.score_meta).map(([key, value]) =>
                            value !== undefined ? (
                              <div
                                key={key}
                                className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-3)]"
                              >
                                <span className="text-xs text-[var(--text-secondary)] capitalize">
                                  {key.replace(/_/g, ' ')}
                                </span>
                                <ScorePill score={value} />
                              </div>
                            ) : null
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const pct = score <= 1 ? Math.round(score * 100) : Math.round(score);
  const color =
    pct >= 80
      ? 'text-emerald-500 bg-emerald-500/10'
      : pct >= 60
      ? 'text-brand-500 bg-brand-500/10'
      : 'text-amber-500 bg-amber-500/10';

  return (
    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', color)}>
      {pct}%
    </span>
  );
}

function formatAnswer(text: string): string {
  return text
    .split('\n\n')
    .map((para) => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}
