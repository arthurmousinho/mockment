const listeners = new Map<string, Set<() => void>>();

export function notifyRunUpdated(runId: string) {
  for (const listener of listeners.get(runId) ?? []) {
    listener();
  }
}

export function subscribeToRun(runId: string, listener: () => void) {
  const subscribers = listeners.get(runId) ?? new Set();
  subscribers.add(listener);
  listeners.set(runId, subscribers);

  return () => {
    subscribers.delete(listener);
    if (subscribers.size === 0) {
      listeners.delete(runId);
    }
  };
}
