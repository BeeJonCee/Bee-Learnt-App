import { get, set } from "idb-keyval";

export type OfflineAction = {
  id: string;
  url: string;
  method: string;
  body: string;
};

const QUEUE_KEY = "beelearn-offline-queue";

export async function enqueueOfflineAction(action: OfflineAction) {
  const queue = (await get<OfflineAction[]>(QUEUE_KEY)) ?? [];
  queue.push(action);
  await set(QUEUE_KEY, queue);
}

export async function flushOfflineQueue() {
  const queue = (await get<OfflineAction[]>(QUEUE_KEY)) ?? [];
  if (queue.length === 0) return;

  const remaining: OfflineAction[] = [];

  for (const action of queue) {
    try {
      const response = await fetch(action.url, {
        method: action.method,
        headers: { "Content-Type": "application/json" },
        body: action.body,
      });

      if (!response.ok) {
        remaining.push(action);
      }
    } catch {
      remaining.push(action);
    }
  }

  await set(QUEUE_KEY, remaining);
}
