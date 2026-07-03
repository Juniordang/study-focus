import { useState, useEffect } from "react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Timer,
  Bot,
  CalendarDays,
  BarChart3,
  BookOpen,
  LogOut,
  Menu,
  X,
  Settings as SettingsIcon,
  Brain,
  History,
} from "lucide-react";
import { handleLogout } from "@/pages/Login";
import {
  POMODORO_PHASE_LABELS,
  usePomodoroTimer,
} from "@/context/PomodoroContext";

const navItems = [
  { title: "Visão Geral", url: "/", icon: LayoutDashboard },
  { title: "Disciplinas", url: "/disciplinas", icon: BookOpen },
  { title: "Sessões", url: "/sessoes", icon: CalendarDays },
  { title: "Pomodoro", url: "/pomodoro", icon: Timer },
  { title: "Revisão", url: "/revisao", icon: Brain },
  { title: "Assistente IA", url: "/assistente", icon: Bot },
  { title: "Histórico", url: "/historico", icon: History },
  { title: "Desempenho", url: "/desempenho", icon: BarChart3 },
  { title: "Chaves de API", url: "/configuracoes", icon: SettingsIcon },
];

export function AppSidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { phase, timeLeft, isRunning } = usePomodoroTimer();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const showPomodoroMiniTimer = isRunning && location.pathname !== "/pomodoro";

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-brand-600 rounded-full flex items-center justify-center">
            <div className="size-3 border-2 border-primary-foreground rounded-full" />
          </div>
          <span className="font-body font-medium tracking-tight text-lg">
            StudyFocus
          </span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-100 text-foreground/60"
          aria-label="Fechar menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                !isActive ? "text-foreground/60 hover:text-foreground" : ""
              }`}
              activeClassName="bg-card soft-shadow text-brand-600 font-medium"
            >
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </div>

      {showPomodoroMiniTimer && (
        <NavLink
          to="/pomodoro"
          className="rounded-xl border border-brand-200 bg-brand-50/80 px-3 py-3 text-brand-700 shadow-sm transition-colors hover:bg-brand-100"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-brand-600 text-primary-foreground flex items-center justify-center">
              <Timer className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-brand-600">
                {POMODORO_PHASE_LABELS[phase]}
              </p>
              <p className="font-heading text-xl tabular-nums leading-tight">
                {mins}:{secs}
              </p>
            </div>
          </div>
        </NavLink>
      )}

      <div className="space-y-3">
        <div className="p-4 bg-brand-100 rounded-2xl hidden sm:block">
          <p className="text-xs font-medium text-brand-600 mb-2 uppercase tracking-wider">
            Dica da Semana
          </p>
          <p className="text-sm leading-relaxed text-foreground/80 italic">
            "Clareza vem do foco disciplinado."
          </p>
        </div>
        <NavLink
          to="/login"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          <LogOut className="size-4" />
          <span>Sair</span>
        </NavLink>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-background/95 backdrop-blur border-b border-surface-200">
        <div className="flex items-center gap-2.5">
          <div className="size-7 bg-brand-600 rounded-full flex items-center justify-center">
            <div className="size-2.5 border-2 border-primary-foreground rounded-full" />
          </div>
          <span className="font-body font-medium tracking-tight">
            StudyFocus
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-surface-100 text-foreground/70"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
      <nav
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] flex flex-col p-6 gap-6 bg-background border-r border-surface-200 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden lg:flex w-64 border-r border-surface-200 flex-col p-8 gap-8 bg-background/50 shrink-0">
        {sidebarContent}
      </nav>
    </>
  );
}
