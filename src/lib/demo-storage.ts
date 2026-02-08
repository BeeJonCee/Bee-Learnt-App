export type LessonProgress = {
  lessonId: number;
  completed: boolean;
  lastAccessed: string;
};

export type QuizResult = {
  quizId: number;
  score: number;
  totalQuestions: number;
  feedback: string;
  completedAt: string;
};

type ProgressStore = Record<string, Record<number, LessonProgress>>;
type QuizStore = Record<string, Record<number, QuizResult>>;
export type AssignmentProgress = {
  assignmentId: number;
  completed: boolean;
  completedAt?: string | null;
};
type AssignmentStore = Record<string, Record<number, AssignmentProgress>>;

const PROGRESS_KEY = "beelearn-progress";
const QUIZ_KEY = "beelearn-quiz-results";
const ASSIGNMENT_KEY = "beelearn-assignments";

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getLessonProgress(
  userId: string,
): Record<number, LessonProgress> {
  const store = readStore<ProgressStore>(PROGRESS_KEY, {});
  return store[userId] ?? {};
}

export function upsertLessonProgress(
  userId: string,
  lessonId: number,
  updates: Partial<LessonProgress>,
): LessonProgress {
  const store = readStore<ProgressStore>(PROGRESS_KEY, {});
  const current = store[userId] ?? {};
  const existing = current[lessonId] ?? {
    lessonId,
    completed: false,
    lastAccessed: new Date().toISOString(),
  };
  const next = {
    ...existing,
    ...updates,
    lessonId,
  };
  const nextStore: ProgressStore = {
    ...store,
    [userId]: {
      ...current,
      [lessonId]: next,
    },
  };
  writeStore(PROGRESS_KEY, nextStore);
  return next;
}

export function getQuizResults(userId: string): Record<number, QuizResult> {
  const store = readStore<QuizStore>(QUIZ_KEY, {});
  return store[userId] ?? {};
}

export function saveQuizResult(userId: string, result: QuizResult) {
  const store = readStore<QuizStore>(QUIZ_KEY, {});
  const current = store[userId] ?? {};
  const nextStore: QuizStore = {
    ...store,
    [userId]: {
      ...current,
      [result.quizId]: result,
    },
  };
  writeStore(QUIZ_KEY, nextStore);
}

export function getAssignmentProgress(
  userId: string,
): Record<number, AssignmentProgress> {
  const store = readStore<AssignmentStore>(ASSIGNMENT_KEY, {});
  return store[userId] ?? {};
}

export function upsertAssignmentProgress(
  userId: string,
  assignmentId: number,
  updates: Partial<AssignmentProgress>,
): AssignmentProgress {
  const store = readStore<AssignmentStore>(ASSIGNMENT_KEY, {});
  const current = store[userId] ?? {};
  const existing = current[assignmentId] ?? {
    assignmentId,
    completed: false,
    completedAt: null,
  };
  const next = {
    ...existing,
    ...updates,
    assignmentId,
  };
  const nextStore: AssignmentStore = {
    ...store,
    [userId]: {
      ...current,
      [assignmentId]: next,
    },
  };
  writeStore(ASSIGNMENT_KEY, nextStore);
  return next;
}
