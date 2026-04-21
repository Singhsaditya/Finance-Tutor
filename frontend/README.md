# AI Tutor Bot Frontend

A production-ready, fully animated frontend for an AI-powered learning platform. Built with React + Vite + TypeScript + Tailwind CSS + Framer Motion.

---

## 🏗 Project Overview

AI Tutor Bot is a polished ed-tech SaaS interface with four core learning modes:

| Mode | Route | API Endpoint |
|------|-------|-------------|
| Ask Tutor | `/ask` | `POST /api/ask` |
| Quiz Engine | `/quiz` | `POST /api/quiz` |
| Answer Evaluation | `/evaluate` | `POST /api/evaluate` |
| Concept Teaching | `/teach` | `POST /api/teach` |

---

## 📁 Folder Structure

```
src/
├── api/
│   └── index.ts          # Axios API service layer (all 4 endpoints)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx     # Landing page navbar with theme toggle
│   │   ├── Sidebar.tsx    # App sidebar navigation
│   │   ├── AppLayout.tsx  # App shell with sidebar + topbar
│   │   └── Footer.tsx     # Landing page footer
│   ├── ui/
│   │   ├── Button.tsx     # Animated button with variants + loading
│   │   ├── Badge.tsx      # Status/label badges
│   │   ├── Skeleton.tsx   # Shimmer skeleton loaders
│   │   ├── ScoreGauge.tsx # SVG score gauge with animation
│   │   ├── StatCard.tsx   # Dashboard metric cards
│   │   ├── EmptyState.tsx # Empty state illustrations
│   │   └── ErrorState.tsx # Error state with retry
│   └── shared/            # (Extend with shared components)
├── pages/
│   ├── LandingPage.tsx    # Hero, features, testimonials, CTA
│   ├── DashboardPage.tsx  # Stats, charts, activity timeline
│   ├── AskTutorPage.tsx   # Chat-style Q&A with sources
│   ├── QuizPage.tsx       # Quiz setup → questions → results
│   ├── EvaluatePage.tsx   # Answer evaluation + rubric
│   ├── TeachPage.tsx      # Structured lesson with steps
│   └── NotFoundPage.tsx   # 404 page
├── store/
│   └── index.ts           # Zustand global store (theme, stats, activity)
├── types/
│   └── index.ts           # TypeScript types for all API models
├── utils/
│   └── index.ts           # Helpers: cn(), timeAgo(), formatScore()
├── styles/
│   └── globals.css        # CSS variables, glassmorphism, typography
├── App.tsx                # Router + layout composition
└── main.tsx               # Entry point with theme initialization
```

---

## ⚡ Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install dependencies
```bash
cd ai-tutor
npm install
```

### 2. Configure environment
```bash
# .env is pre-configured with:
VITE_API_BASE_URL=http://127.0.0.1:8000

# Change if your backend runs on a different port/host
```

### 3. Run development server
```bash
npm run dev
# Opens at http://localhost:3000
```

### 4. Build for production
```bash
npm run build
npm run preview  # Preview the build
```

---

## 🔌 API Integration

All API calls are centralized in `src/api/index.ts` using a configured Axios instance.

```typescript
// Ask tutor
const response = await askTutor({ query: "What is ML?", top_k: 5 });

// Generate quiz
const quiz = await generateQuiz({ topic: "Neural Networks", count: 10, difficulty: "medium" });

// Evaluate answer
const result = await evaluateAnswer({ question_id: "q1", student_answer: "..." });

// Get lesson
const lesson = await teachConcept({ topic: "React hooks", level: "beginner" });
```

The Axios instance:
- Automatically attaches auth tokens from localStorage
- Has 60s timeout for AI endpoints
- Normalizes error messages from `error.response.data.detail`
- Base URL from `VITE_API_BASE_URL` env variable

---

## 🎨 Design System

### Fonts
- **Display**: Syne (headings, logo, stats)
- **Body**: DM Sans (content, UI)
- **Code**: JetBrains Mono

### Color Palette
- **Brand**: `#0ea5e9` (sky blue) — primary actions
- **Accent**: `#d946ef` (fuchsia) — highlights, gradients
- **Success**: `#10b981` (emerald) — correct answers, scores
- **Warning**: `#f59e0b` (amber) — medium difficulty
- **Error**: `#ef4444` (rose) — wrong answers, danger

### Theme System
- Dark/light via `.dark` class on `<html>` (Tailwind `darkMode: 'class'`)
- CSS variables in `:root` and `.dark` for seamless transitions
- Persisted in Zustand + localStorage

### Glassmorphism
```css
.glass-card {
  background: rgba(30, 37, 53, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

---

## 🎬 Animation Strategy

All animations use Framer Motion:

| Animation | Usage |
|-----------|-------|
| `initial/animate` | Page entry, card reveals |
| `whileHover` | Card lifts, button effects |
| `whileTap` | Button press feedback |
| `AnimatePresence` | Route transitions, conditional renders |
| `useScroll/useTransform` | Hero parallax on landing |
| Stagger children | Feature grid, stat cards |
| SVG path animation | Score gauge fill |

---

## 📊 State Management

**Zustand** with persistence middleware:

```typescript
const { theme, stats, recentActivity } = useAppStore();
```

State shape:
- `theme`: 'dark' | 'light'  
- `stats`: { questionsAsked, quizAttempts, avgScore, topicsLearned }
- `recentActivity`: ActivityItem[] (last 50)
- `sessionId`: string (for Ask Tutor continuity)

All state persisted to localStorage under key `ai-tutor-bot-store`.

---

## 📱 Responsive Design

- **Mobile**: Collapsible navbar, stacked grid layouts
- **Tablet**: 2-column grids
- **Desktop**: Full sidebar + 3-column dashboard

Sidebar collapses to icon-only mode on desktop via toggle button.

---

## 🔒 Form Handling

Forms use uncontrolled React state with validation:
- `disabled` prop on submit when required fields empty
- Loading state prevents double-submit
- Error states shown inline with retry CTA
- Keyboard shortcuts: Enter to submit, Shift+Enter for newlines

---

## 🚀 Production Notes

1. **Environment variables**: Use `VITE_API_BASE_URL` per environment (dev/staging/prod)
2. **Auth**: Tokens stored in localStorage, attached via Axios interceptor — replace with httpOnly cookies for production
3. **Error logging**: Add Sentry in the Axios error interceptor
4. **Analytics**: Add activity tracking in `useAppStore.addActivity()`
5. **Code splitting**: React Router lazy-loads pages automatically with Vite
6. **Bundle size**: ~400KB gzipped (Recharts is largest dependency at ~100KB)
7. **TypeScript**: Strict mode enabled — all API responses are typed
8. **Accessibility**: Focus-visible styles, ARIA labels on interactive elements

---

## 🧩 Extending the App

### Add a new page
1. Create `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add to `navItems` in `src/components/layout/Sidebar.tsx`
4. Add API function in `src/api/index.ts`
5. Add types in `src/types/index.ts`

### Add a new API endpoint
```typescript
// src/api/index.ts
export async function myEndpoint(payload: MyRequest): Promise<MyResponse> {
  const { data } = await api.post<MyResponse>('/api/my-endpoint', payload);
  return data;
}
```

---

## License

MIT

