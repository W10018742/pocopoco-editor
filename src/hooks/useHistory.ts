import { useCallback, useRef } from "react";

const MAX_HISTORY = 50;

export function useHistory<T>() {
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);

  const pushState = useCallback((state: T) => {
    pastRef.current = [
      ...pastRef.current.slice(-(MAX_HISTORY - 1)),
      structuredClone(state),
    ];
    futureRef.current = [];
  }, []);

  const undo = useCallback((current: T): T | null => {
    if (pastRef.current.length === 0) return null;
    const previous = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [...futureRef.current, structuredClone(current)];
    return previous;
  }, []);

  const redo = useCallback((current: T): T | null => {
    if (futureRef.current.length === 0) return null;
    const next = futureRef.current[futureRef.current.length - 1];
    futureRef.current = futureRef.current.slice(0, -1);
    pastRef.current = [...pastRef.current, structuredClone(current)];
    return next;
  }, []);

  const canUndo = useCallback(() => pastRef.current.length > 0, []);
  const canRedo = useCallback(() => futureRef.current.length > 0, []);

  return { pushState, undo, redo, canUndo, canRedo };
}
