import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import { getToken } from "@/lib/auth";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import { StudyProvider } from "@/context/StudyContext";
import { PomodoroProvider } from "@/context/PomodoroContext";
import Index from "./pages/Index";
import Pomodoro from "./pages/Pomodoro";
import AIAssistant from "./pages/AssistenteIA";
import StudyPlan from "./pages/Sessao";
import Performance from "./pages/Dashboard";
import Login from "./pages/Login";
import CadastroUsuario from "./pages/CadastroUsuario";
import Subjects from "./pages/Disciplinas";
import SubjectDetail from "./pages/DisciplinaDetail";
import SubjectAI from "./pages/DisciplinaAI";
import NotFound from "./pages/NotFound";
import Settings from "./pages/ConfiguracaoChaveIA";
import CadastroDisciplina from "./pages/CadastroDisciplina";
import RevisaoFlashcards from "./pages/RevisaoFlashcards";
import Historico from "./pages/Historico";

const queryClient = new QueryClient();

const PrivateRoute = () => {
  const token = getToken();
  return token ? (
    <StudyProvider>
      <PomodoroProvider>
        <Outlet />
      </PomodoroProvider>
    </StudyProvider>
  ) : (
    <Navigate to="/login" />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<CadastroUsuario />} />
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/pomodoro" element={<Pomodoro />} />
              <Route path="/disciplinas" element={<Subjects />} />
              <Route path="/disciplinas/:id" element={<SubjectDetail />} />
              <Route path="/disciplinas/:id/ai" element={<SubjectAI />} />
              <Route path="/sessoes" element={<StudyPlan />} />
              <Route path="/assistente" element={<AIAssistant />} />
              <Route path="/desempenho" element={<Performance />} />
              <Route path="/configuracoes" element={<Settings />} />
              <Route
                path="/cadastro-disciplina"
                element={<CadastroDisciplina />}
              />
              <Route path="/revisao" element={<RevisaoFlashcards />} />
              <Route path="/historico" element={<Historico />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
