import { setCached } from "@/lib/offline/cache";
import { apiFetch } from "@/lib/utils/api";

export async function prefetchModuleForOffline(moduleId: number) {
  const lessons = await apiFetch<
    { id: number; title: string; type: string; moduleId: number }[]
  >(`/api/lessons?moduleId=${moduleId}`);
  await setCached(`/api/lessons?moduleId=${moduleId}`, lessons);

  await Promise.all(
    lessons.map(async (lesson) => {
      const lessonDetail = await apiFetch(`/api/lessons/${lesson.id}`);
      await setCached(`/api/lessons/${lesson.id}`, lessonDetail);

      const resources = await apiFetch(`/api/resources?lessonId=${lesson.id}`);
      await setCached(`/api/resources?lessonId=${lesson.id}`, resources);
    }),
  );

  return lessons.length;
}
