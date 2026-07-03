import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import {
  agendaApi,
  Disciplina,
  AgendaEvent,
  CreateAgendaPayload,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useDisciplinas } from "@/hooks/use-disciplinas";
import { removeCompletedSessionIds } from "@/lib/session-status";

interface StudyContextValue {
  subjects: Disciplina[];
  sessions: AgendaEvent[];
  activeSessionId: string | null;
  isLoading: boolean;
  addSession: (s: CreateAgendaPayload) => Promise<void>;
  deleteSession: (id: number) => Promise<void>;
  setActiveSession: (id: string | null) => void;
  refreshData: () => Promise<void>;
}

const StudyContext = createContext<StudyContextValue | null>(null);

export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { data: subjects = [], isLoading: isSubjectsLoading } =
    useDisciplinas();

  const [sessions, setSessions] = useState<AgendaEvent[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);

  const refreshData = async () => {
    try {
      queryClient.invalidateQueries({ queryKey: ["disciplinas"] });
      const agendaData = await agendaApi.list();
      setSessions(agendaData || []);
    } catch (error) {
      console.error("falha ao buscar os dados:", error);
    } finally {
      setIsSessionsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Atualizando dados");
    refreshData();
  }, []);

  const validAssuntoIds = useMemo(() => {
    if (isSubjectsLoading) return null;

    return new Set(
      subjects.flatMap((subject) =>
        (subject.assuntos ?? [])
          .map((assunto) => Number(assunto.ID))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );
  }, [isSubjectsLoading, subjects]);

  const visibleSessions = useMemo(() => {
    if (!validAssuntoIds) return sessions;

    return sessions.filter((session) => validAssuntoIds.has(session.assunto_id));
  }, [sessions, validAssuntoIds]);

  const removedSessionIds = useMemo(() => {
    if (!validAssuntoIds) return [];

    return sessions
      .filter((session) => !validAssuntoIds.has(session.assunto_id))
      .map((session) => session.ID);
  }, [sessions, validAssuntoIds]);

  useEffect(() => {
    removeCompletedSessionIds(removedSessionIds);
  }, [removedSessionIds]);

  const isLoading = isSubjectsLoading || isSessionsLoading;
  const visibleActiveSessionId =
    activeSessionId &&
    visibleSessions.some((session) => String(session.ID) === activeSessionId)
      ? activeSessionId
      : null;

  const addSession = async (payload: CreateAgendaPayload) => {
    try {
      const newSession = await agendaApi.create(payload);
      setSessions((prev) => [...prev, newSession]);
    } catch (error) {
      console.error("Failed to add session:", error);
      throw error;
    }
  };

  const deleteSession = async (id: number) => {
    try {
      await agendaApi.delete(id); // Chamar API primeiro
      setSessions((prev) => prev.filter((s) => s.ID !== id));
      removeCompletedSessionIds([id]);
      if (activeSessionId === String(id)) setActiveSessionId(null);
    } catch (error) {
      console.error("Failed to delete session:", error);
      throw error; // Propagar erro para o componente
    }
  };

  return (
    <StudyContext.Provider
      value={{
        subjects,
        sessions: visibleSessions,
        activeSessionId: visibleActiveSessionId,
        isLoading,
        addSession,
        deleteSession,
        setActiveSession: setActiveSessionId,
        refreshData,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
};
