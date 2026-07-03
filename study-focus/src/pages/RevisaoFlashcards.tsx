import { useState } from "react";
import { useFlashcardsToReview, useSubmitReview } from "@/hooks/use-flashcards";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const RevisaoFlashcards = () => {
  const navigate = useNavigate();
  const {
    data: flashcards,
    isLoading,
    isError,
    refetch,
  } = useFlashcardsToReview();
  const { mutate: submitReview, isPending } = useSubmitReview();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-10 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container max-w-4xl py-20 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-20 w-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <Activity className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Ocorreu um erro</h2>
        <p className="text-muted-foreground max-w-md">
          Não foi possível carregar os flashcards para revisão no momento.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    );
  }

  const isFinished = !flashcards || currentIndex >= flashcards.length;

  if (isFinished) {
    return (
      <div className="container max-w-4xl py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="h-24 w-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-emerald-700 bg-clip-text text-transparent">
            Você concluiu tudo por hoje!
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Sua fila de revisão está vazia. Volte amanhã para continuar
            aprendendo.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate("/disciplinas")}
          className="rounded-full shadow-md mt-4"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Voltar para Disciplinas
        </Button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = (currentIndex / flashcards.length) * 100;

  const handleReview = (desempenho: string) => {
    submitReview(
      { id: currentCard.ID, desempenho },
      {
        onSuccess: () => {
          toast.success(`Marcado como ${desempenho}`);
          setShowAnswer(false);
          setCurrentIndex((prev) => prev + 1);
        },
        onError: () => {
          toast.error("Erro ao salvar revisão. Tente novamente.");
        },
      },
    );
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Modo Revisão
          </h1>
          <p className="text-muted-foreground">
            Revise seus flashcards usando repetição espaçada.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {flashcards.length - currentIndex}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Restantes
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>Progresso</span>
          <span>
            {currentIndex} de {flashcards.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="relative group perspective-1000 mt-8">
        <Card
          className={`w-full min-h-[400px] flex flex-col justify-center items-center p-8 text-center border border-border/50 bg-card/40 backdrop-blur-sm shadow-xl transition-all duration-500 ease-out transform-gpu ${showAnswer ? "rotate-y-0 bg-primary/5 border-primary/20" : "hover:shadow-2xl hover:border-primary/30"} rounded-2xl`}
        >
          <div className="absolute top-6 left-6">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              Card #{currentCard.ID}
            </span>
          </div>

          <div className="space-y-6 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium leading-relaxed">
              {currentCard.pergunta}
            </h2>

            {showAnswer && (
              <div className="pt-8 border-t border-border/50 animate-in fade-in slide-in-from-top-4 duration-500">
                <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
                  {currentCard.resposta}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="pt-6 flex flex-col items-center gap-4">
        {!showAnswer ? (
          <Button
            size="lg"
            className="w-full max-w-sm rounded-full shadow-lg shadow-primary/20 h-14 text-lg font-medium transition-transform hover:scale-105 active:scale-95"
            onClick={() => setShowAnswer(true)}
          >
            Ver Resposta <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button
              size="lg"
              variant="outline"
              className="h-16 text-lg rounded-2xl border-2 border-green-500/20 hover:border-green-500 hover:bg-green-500/10 text-green-600 dark:text-green-400 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
              onClick={() => handleReview("Facil")}
              disabled={isPending}
            >
              <span className="flex flex-col items-center">
                <span className="font-bold">Fácil</span>
                <span className="text-xs font-normal opacity-70">
                  Revisar em 5 dias
                </span>
              </span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-16 text-lg rounded-2xl border-2 border-yellow-500/20 hover:border-yellow-500 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
              onClick={() => handleReview("Medio")}
              disabled={isPending}
            >
              <span className="flex flex-col items-center">
                <span className="font-bold">Médio</span>
                <span className="text-xs font-normal opacity-70">
                  Revisar em 2 dias
                </span>
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 text-lg rounded-2xl border-2 border-red-500/20 hover:border-red-500 hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
              onClick={() => handleReview("Dificil")}
              disabled={isPending}
            >
              <span className="flex flex-col items-center">
                <span className="font-bold">Difícil</span>
                <span className="text-xs font-normal opacity-70">
                  Revisar em 1 dia
                </span>
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisaoFlashcards;
