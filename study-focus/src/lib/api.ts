import axios, { AxiosError } from "axios";
import { getToken, TOKEN_KEY } from "./auth";

const API_BASE_URL = "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Antes de qualquer requisição sair, anexa o JWT se ele existir
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor de Resposta: Se o Back retornar 401 (Token expirou), desloga o estudante
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login"; // Redireciona para o login
    }
    return Promise.reject(error);
  },
);

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
}

function isApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  return (
    typeof payload === "object" && payload !== null && "success" in payload
  );
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const method = options?.method?.toUpperCase() || "GET";
    const data = options?.body ? JSON.parse(options.body as string) : undefined;

    const response = await api.request<ApiResponse<T>>({
      url: path,
      method,
      data,
    });

    if (isApiResponse<T>(response.data)) {
      return response.data.data as T;
    }

    return response.data as T;
  } catch (error) {
    if (error instanceof AxiosError) {
      const serverMessage = error.response?.data?.message;
      throw new Error(
        serverMessage ?? `HTTP ${error.response?.status}: ${error.message}`,
      );
    }
    throw error;
  }
}

export interface User {
  id: number;
  nome: string;
  email: string;
}

export interface ConfigTempos {
  tempo_foco: number;
  tempo_pausa_curta: number;
  tempo_pausa_longa: number;
}

export interface ReqUser {
  nome?: string;
  email: string;
  senha: string;
}

export const userAuthApi = {
  create: (payload: ReqUser) =>
    apiFetch<User>("/usuarios", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: ReqUser) =>
    apiFetch<{ message: string; token?: string }>("/usuarios/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const userTempos = {
  getTempos: () => apiFetch<ConfigTempos>("/usuarios/me/tempos"),
  updateTempos: (payload: ConfigTempos) =>
    apiFetch<ConfigTempos>("/usuarios/me/tempos", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

// --- API de Assuntos ---

export interface Assunto {
  ID?: string;
  nome: string;
  descricao?: string;
  dificuldade?: string;
}

export interface Disciplina {
  id: string;
  name: string;
  description: string;
  color: string;
  cardCount: number;
  assuntos?: Assunto[];
}

export interface CreateDisciplinaPayload {
  name: string;
  description: string;
  color: string;
  assuntos?: {
    id?: string;
    nome: string;
  }[];
}

export type UpdateDisciplinaPayload = Partial<CreateDisciplinaPayload>;

export const disciplinasApi = {
  list: () => apiFetch<Disciplina[]>("/usuarios/me/disciplinas"),

  create: (payload: CreateDisciplinaPayload) =>
    apiFetch<Disciplina>("/usuarios/me/disciplinas", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateDisciplinaPayload) =>
    apiFetch<Disciplina>(`/usuarios/me/disciplinas/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/usuarios/me/disciplinas/${id}`, { method: "DELETE" }),
};

// 1. AI Assistant
export interface AIHistoryPayload {
  disciplinaID?: number;
  pergunta: string;
}

export interface AIHistoryResponse {
  pergunta: string;
  resposta: string;
}

export interface AIHistoryItem {
  ID: number;
  CreatedAt: string;
  pergunta: string;
  resposta: string;
  disciplina_id?: number | null;
  assunto_id?: number | null;
  usuario_id: number;
}

export interface FlashcardPayload {
  pergunta: string;
  resposta: string;
  nivel_dificuldade?: string;
}

export interface AIDisciplinaPayload {
  disciplina_id: number;
  assunto_id: number;
  pergunta: string;
}

export interface AIFlashcardSuggestion {
  question: string;
  answer: string;
}

export interface AIDisciplinaResponse {
  resposta: string;
  flashcards: AIFlashcardSuggestion[];
}

interface LegacyAIDisciplinaResponse {
  resposta:
    | string
    | {
        resposta?: string;
      };
  flashcards?: AIFlashcardSuggestion[] | null;
}

function normalizeAIDisciplinaResponse(
  response: LegacyAIDisciplinaResponse,
): AIDisciplinaResponse {
  if (typeof response.resposta === "string") {
    return {
      resposta: response.resposta,
      flashcards: response.flashcards ?? [],
    };
  }

  if (typeof response.resposta.resposta === "string") {
    return {
      resposta: response.resposta.resposta,
      flashcards: response.flashcards ?? [],
    };
  }

  throw new Error("Resposta inválida do Assistente IA");
}

export const aiApi = {
  ask: (payload: AIHistoryPayload) =>
    apiFetch<AIHistoryResponse>("/usuarios/me/historico_ia", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  askDisciplina: async (payload: AIDisciplinaPayload) => {
    const response = await apiFetch<LegacyAIDisciplinaResponse>(
      "/usuarios/me/ia/disciplina",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return normalizeAIDisciplinaResponse(response);
  },

  createFlashcard: (disciplinaId: string, payload: FlashcardPayload) =>
    apiFetch<void>(`/usuarios/me/disciplinas/${disciplinaId}/flashcards`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listHistory: () => apiFetch<AIHistoryItem[]>("/usuarios/me/historico_ia"),
};

// 2. Dashboard
export interface DashboardStats {
  total_horas_estudo: number;
  total_flashcards: number;
  sessoes_por_disciplina: Record<string, number>;
  cards_por_dificuldade: Record<string, number>;
}

export const dashboardApi = {
  getStats: () => apiFetch<DashboardStats>("/usuarios/me/dashboard"),
};

// 3. Agenda
export interface AgendaEvent {
  ID: number;
  titulo: string;
  descricao: string;
  data: string;
  prioridade: string;
  assunto_id: number;
}

export interface CreateAgendaPayload {
  titulo: string;
  descricao: string;
  data: string;
  prioridade: string;
  assunto_id: number;
}

export const agendaApi = {
  list: () => apiFetch<AgendaEvent[]>("/usuarios/me/sessao"),

  validate: (payload: CreateAgendaPayload) =>
    apiFetch<{ message: string }>("/usuarios/me/sessao/validar", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  create: (payload: CreateAgendaPayload) =>
    apiFetch<AgendaEvent>("/usuarios/me/sessao", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  delete: (id: number) =>
    apiFetch<void>(`/usuarios/me/sessao/${id}`, { method: "DELETE" }),
};

// 4. Configurações de Chave (Settings)
export interface ApiKeyPayload {
  provedor: string;
  chave_api: string;
}

export interface ApiKeyConfig {
  id: number;
  provedor: string;
  usuario_id: number;
  chave_mascarada: string;
  created_at: string;
  updated_at: string;
}

export const settingsApi = {
  listApiKeys: () => apiFetch<ApiKeyConfig[]>("/usuarios/me/chave-api"),

  saveApiKey: (payload: ApiKeyPayload) =>
    apiFetch<ApiKeyConfig>("/usuarios/me/chave-api", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateApiKey: (payload: ApiKeyPayload) =>
    apiFetch<ApiKeyConfig>("/usuarios/me/chave-api", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

// FlashCards
export interface Flashcard {
  ID: string;
  pergunta: string;
  resposta: string;
  assunto_id: string;
  nivel_dificuldade?: string;
}

export interface ReviewHistoryItem {
  id: number;
  data_revisao: string;
  desempenho: string;
  flashcard_id: number;
  pergunta: string;
  resposta: string;
  data_proxima_revisao: string;
  nivel_dificuldade: number;
  assunto_id: number;
  assunto_nome: string;
  disciplina_id: number;
  disciplina_nome: string;
}

export interface FlashCardPayload {
  pergunta: string;
  resposta: string;
  assuntoId?: string;
  nivel?: number;
}

export interface UpdateFlashcardPayload extends FlashCardPayload {
  assuntoId: string;
}

export interface FlashcardBatchPayload {
  flashcards: FlashCardPayload[];
}

export const flashcardApi = {
  listFlashcards: (disciplinaId: string) =>
    apiFetch<Flashcard[]>(
      `/usuarios/me/disciplinas/${disciplinaId}/flashcards`,
    ),

  create: (subjectId: string, payload: FlashCardPayload) =>
    apiFetch<Flashcard>(`/usuarios/me/disciplinas/${subjectId}/flashcards`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createBatch: (payload: FlashcardBatchPayload) =>
    apiFetch<{ message: string; count: number }>(
      "/usuarios/me/flashcards/lote",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  update: (id: string, payload: UpdateFlashcardPayload) =>
    apiFetch<Flashcard>(`/usuarios/me/flashcards/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  listToReview: () => apiFetch<Flashcard[]>("/usuarios/me/flashcards/revisar"),

  listReviewHistory: () =>
    apiFetch<ReviewHistoryItem[]>("/usuarios/me/historico_revisoes"),

  submitReview: (id: string, desempenho: string) =>
    apiFetch<{ proxima_revisao: string }>(
      `/usuarios/me/flashcards/${id}/revisar`,
      {
        method: "PATCH",
        body: JSON.stringify({ desempenho }),
      },
    ),

  delete: (id: string) =>
    apiFetch<void>(`/usuarios/me/flashcards/${id}`, {
      method: "DELETE",
    }),
};

// 5. Pomodoro
export interface PomodoroPayload {
  sessao_estudo_id: number;
  duracao_minutos: number;
  fase?: "foco" | "pausa_curta" | "pausa_longa";
  ciclos?: number;
}

interface CiclosPomodoroResponse {
  ciclos_concluidos: number;
}

export const pomodoroApi = {
  create: (payload: PomodoroPayload) =>
    apiFetch<void>("/usuarios/me/pomodoro", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getCiclosConcluidos: (sessaoEstudoId: number) =>
    apiFetch<CiclosPomodoroResponse>(
      `/usuarios/me/pomodoro/sessoes/${sessaoEstudoId}/ciclos`,
    ),
};
