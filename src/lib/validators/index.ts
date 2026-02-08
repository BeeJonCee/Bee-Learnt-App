import { z } from "zod";

export const moduleCreateSchema = z.object({
  subjectId: z.number().int().positive(),
  title: z.string().min(3),
  description: z.string().optional(),
  grade: z.number().int().min(9).max(12),
  order: z.number().int().min(1),
  capsTags: z.array(z.string()).default([]),
});

export const moduleUpdateSchema = moduleCreateSchema.partial();

export const subjectCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  minGrade: z.number().int().min(9).max(12),
  maxGrade: z.number().int().min(9).max(12),
});

export const lessonCreateSchema = z.object({
  moduleId: z.number().int().positive(),
  title: z.string().min(3),
  content: z.string().optional(),
  type: z.enum(["text", "video", "diagram", "pdf"]),
  videoUrl: z.string().url().optional().nullable(),
  diagramUrl: z.string().url().optional().nullable(),
  pdfUrl: z.string().url().optional().nullable(),
  order: z.number().int().min(1),
});

export const lessonUpdateSchema = lessonCreateSchema.partial();

export const resourceCreateSchema = z.object({
  lessonId: z.number().int().positive(),
  title: z.string().min(3),
  type: z.enum(["pdf", "link", "video", "diagram"]),
  url: z.string().url(),
  tags: z.array(z.string()).default([]),
});

export const assignmentCreateSchema = z.object({
  moduleId: z.number().int().positive(),
  lessonId: z.number().int().positive().optional(),
  title: z.string().min(3),
  description: z.string().optional(),
  dueDate: z.string().datetime(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z
    .enum(["todo", "in_progress", "submitted", "graded"])
    .default("todo"),
  grade: z.number().int().min(9).max(12),
});

export const assignmentUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["todo", "in_progress", "submitted", "graded"]).optional(),
  grade: z.number().int().min(9).max(12).optional(),
});

export const quizGenerateSchema = z.object({
  subjectId: z.number().int().positive(),
  moduleId: z.number().int().positive(),
  topic: z.string().min(3),
  grade: z.number().int().min(9).max(12),
  capsTags: z.array(z.string()).default([]),
  difficulty: z.enum(["easy", "medium", "hard", "adaptive"]).default("medium"),
  performance: z
    .object({
      averageScore: z.number().min(0).max(100).optional(),
      recentMistakes: z.array(z.string()).optional(),
    })
    .optional(),
});

export const quizSubmitSchema = z.object({
  quizId: z.number().int().positive(),
  answers: z.array(
    z.object({
      questionId: z.number().int().positive(),
      answer: z.string().min(1),
    }),
  ),
});

export const quizCheckSchema = z.object({
  questionId: z.number().int().positive(),
  answer: z.string().min(1),
});

export const studySessionCreateSchema = z.object({
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(1),
});

export const progressUpdateSchema = z.object({
  lessonId: z.number().int().positive().optional(),
  moduleId: z.number().int().positive().optional(),
  completed: z.boolean().optional(),
  timeSpentMinutes: z.number().int().min(0).optional(),
});

export const progressQuerySchema = z.object({
  lessonId: z.number().int().positive().optional(),
  moduleId: z.number().int().positive().optional(),
});

export const checklistProgressSchema = z.object({
  itemId: z.number().int().positive(),
  completed: z.boolean(),
});

export const moduleQuerySchema = z.object({
  subjectId: z.number().int().positive().optional(),
  grade: z.number().int().min(9).max(12).optional(),
});

export const assignmentQuerySchema = z.object({
  moduleId: z.number().int().positive().optional(),
  grade: z.number().int().min(9).max(12).optional(),
});

export const lessonQuerySchema = z.object({
  moduleId: z.number().int().positive().optional(),
});

export const resourceQuerySchema = z.object({
  lessonId: z.number().int().positive().optional(),
});

export const quizQuerySchema = z.object({
  moduleId: z.number().int().positive().optional(),
});

export const learningPathRefreshSchema = z.object({
  goal: z.string().min(2).optional(),
  focusTags: z.array(z.string()).optional(),
});

export const onboardingSelectSchema = z.object({
  moduleId: z.number().int().positive(),
  code: z.string().min(3),
});

export const lessonNoteCreateSchema = z.object({
  lessonId: z.number().int().positive(),
  content: z.string().min(3).max(2000),
});

export const lessonNoteQuerySchema = z.object({
  lessonId: z.number().int().positive(),
});

export const accessibilityUpdateSchema = z.object({
  textScale: z.number().int().min(80).max(150).optional(),
  enableNarration: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  language: z.string().min(2).max(12).optional(),
  translationEnabled: z.boolean().optional(),
});

export const aiTutorSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    }),
  ),
});

export const searchQuerySchema = z.object({
  query: z.string().min(2),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "PARENT"]).default("STUDENT"),
});
