export function logInfo(message: string, meta?: Record<string, unknown>) {
  console.info(`[BeeLearnt] ${message}`, meta ?? "");
}

export function logError(message: string, meta?: Record<string, unknown>) {
  console.error(`[BeeLearnt] ${message}`, meta ?? "");
}
