import type { AgendaEvent } from "@/lib/api";

export type SessionVisualStatus = "pending" | "late" | "completed";

const COMPLETED_SESSION_IDS_KEY = "completedStudySessionIds";

interface SessionStatusView {
  label: string;
  className: string;
}

const getCompletedSessionIds = () => {
  if (typeof window === "undefined") return new Set<number>();

  try {
    const saved = window.localStorage.getItem(COMPLETED_SESSION_IDS_KEY);
    if (!saved) return new Set<number>();

    const ids = JSON.parse(saved);
    if (!Array.isArray(ids)) return new Set<number>();

    return new Set(
      ids
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    );
  } catch {
    return new Set<number>();
  }
};

export const markSessionAsCompleted = (sessionId: number) => {
  if (typeof window === "undefined" || !Number.isInteger(sessionId)) return;

  const completedSessionIds = getCompletedSessionIds();
  completedSessionIds.add(sessionId);

  window.localStorage.setItem(
    COMPLETED_SESSION_IDS_KEY,
    JSON.stringify([...completedSessionIds]),
  );
};

export const removeCompletedSessionIds = (sessionIds: number[]) => {
  if (typeof window === "undefined" || sessionIds.length === 0) return;

  const idsToRemove = new Set(sessionIds);
  const completedSessionIds = getCompletedSessionIds();
  idsToRemove.forEach((id) => completedSessionIds.delete(id));

  window.localStorage.setItem(
    COMPLETED_SESSION_IDS_KEY,
    JSON.stringify([...completedSessionIds]),
  );
};

export const isSessionCompleted = (sessionId: number) => {
  return getCompletedSessionIds().has(sessionId);
};

export const getSessionVisualStatus = (
  session: AgendaEvent,
  now: Date = new Date(),
): SessionVisualStatus => {
  if (isSessionCompleted(session.ID)) return "completed";

  return new Date(session.data).getTime() < now.getTime() ? "late" : "pending";
};

export const getSessionStatusView = (
  session: AgendaEvent,
  now?: Date,
): SessionStatusView => {
  const status = getSessionVisualStatus(session, now);

  if (status === "completed") {
    return {
      label: "Concluída",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  if (status === "late") {
    return {
      label: "Atrasada",
      className: "bg-destructive/10 text-destructive",
    };
  }

  return {
    label: "Agendada",
    className: "bg-ochre-100 text-ochre-600",
  };
};
