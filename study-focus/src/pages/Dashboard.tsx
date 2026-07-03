import { Button } from "@/components/ui/button";
import { Loader2, Printer, WifiOff } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useDashboard from "@/hooks/use-dashboard";

const COLORS = [
  "#1b4332",
  "#2d6a4f",
  "#40916c",
  "#52b788",
  "#74c69d",
  "#95d5b2",
];

const BarHoverCursor = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) => {
  const cursorWidth = Math.min(width, 72);

  return (
    <rect
      x={x + (width - cursorWidth) / 2}
      y={y}
      width={cursorWidth}
      height={height}
      fill="#f1f5f9"
      rx={6}
    />
  );
};

const Performance = () => {
  const { data, isLoading, isError, error } = useDashboard();
  const stats = data;

  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       const data = await dashboardApi.getStats();
  //       setStats(data);
  //     } catch (err: any) {
  //       setError(err.message);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchStats();
  // }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-8 text-brand-600 animate-spin" />
        <p className="text-sm text-foreground/60">Carregando painel...</p>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <WifiOff className="size-10 text-destructive/60" />
        <p className="text-foreground/60 text-sm">
          Não foi possível carregar o dashboard.
        </p>
        <p className="text-xs text-foreground/40">{String(error)}</p>
      </div>
    );
  }

  // Prepara dados para os gráficos
  const pieData = Object.entries(stats.sessoes_por_disciplina).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  const barData = Object.entries(stats.cards_por_dificuldade).map(
    ([name, value]) => ({
      name,
      Flashcards: value,
    }),
  );

  const totalMinutes = stats.total_horas_estudo * 60;
  const averageFocus = totalMinutes > 0 ? "25m" : "0m"; //
  const totalStudyTime = `${Math.floor(stats.total_horas_estudo)}h ${Math.round((stats.total_horas_estudo % 1) * 60)}m`;
  const reportDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
  const handlePrint = () => window.print();

  return (
    <div className="performance-report max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="print-only mb-2 text-sm text-foreground/60">
            Relatório gerado em {reportDate}
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-light tracking-tight">
            Painel de Desempenho
          </h1>
        </div>

        <Button
          type="button"
          onClick={handlePrint}
          className="no-print w-full sm:w-auto"
        >
          <Printer />
          Imprimir relatório
        </Button>
      </div>

      {/* Summary cards */}
      <div className="performance-summary-grid grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            label: "Tempo Total de Estudo",
            value: totalStudyTime,
          },
          {
            label: "Flashcards Criados",
            value: String(stats.total_flashcards),
          },
          { label: "Tempo de Foco Padrão", value: averageFocus },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 sm:p-5 bg-card rounded-2xl soft-shadow border border-surface-100 text-center flex flex-col justify-center"
          >
            <div className="text-2xl sm:text-3xl font-heading font-medium text-brand-700">
              {s.value}
            </div>
            <div className="text-xs sm:text-sm text-foreground/50 uppercase tracking-wider mt-2 font-medium">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="print-only">
        <h2 className="mb-3 text-xl font-heading font-medium">
          Resumo do Relatório
        </h2>
        <table className="performance-print-table">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tempo Total de Estudo</td>
              <td>{totalStudyTime}</td>
            </tr>
            <tr>
              <td>Flashcards Criados</td>
              <td>{stats.total_flashcards}</td>
            </tr>
            <tr>
              <td>Tempo de Foco Padrão</td>
              <td>{averageFocus}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="performance-charts-grid grid md:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Horas por Disciplina */}
        <div className="p-4 sm:p-6 bg-card rounded-2xl soft-shadow border border-surface-100 flex flex-col">
          <h3 className="font-body font-medium mb-6 text-lg">
            Distribuição por Disciplina
          </h3>
          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value ?? 0} min`, "Tempo"]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-foreground/40">
                Nenhum dado de estudo registrado
              </div>
            )}
          </div>
          {pieData.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {pieData.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-1.5 text-xs text-foreground/60"
                >
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {entry.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gráfico de Barras - Flashcards por Dificuldade */}
        <div className="p-4 sm:p-6 bg-card rounded-2xl soft-shadow border border-surface-100 flex flex-col">
          <h3 className="font-body font-medium mb-6 text-lg">
            Flashcards por Dificuldade
          </h3>
          <div className="h-64 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <Tooltip
                    cursor={<BarHoverCursor />}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="Flashcards"
                    fill="#1b4332"
                    barSize={48}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-foreground/40">
                Nenhum flashcard registrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
