import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRegister } from "@/hooks/use-auth";

const CadastroUsuario = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { mutate: register, isPending } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem");
      return;
    }

    register(
      { nome: name, email, senha: password },
      {
        onSuccess: () => {
          toast.success("Conta criada com sucesso!");
          navigate("/login");
        },
        onError: (error) => {
          toast.error(error.message || "Erro ao criar conta.");
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="size-10 bg-brand-600 rounded-full flex items-center justify-center">
              <div className="size-3.5 border-2 border-primary-foreground rounded-full" />
            </div>
            <span className="font-body font-medium tracking-tight text-xl">
              Study Focus
            </span>
          </div>
          <h1 className="text-4xl font-heading font-light tracking-tight mb-2">
            Comece agora
          </h1>
          <p className="text-foreground/60 font-body">
            Crie sua conta gratuita
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-3xl soft-shadow border border-surface-100 p-8 space-y-5"
        >
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-foreground/60">
              Nome
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full pl-11 pr-4 py-3 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-foreground/60">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-11 pr-4 py-3 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-foreground/60">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full pl-11 pr-4 py-3 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-foreground/60">
              Confirmar senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repita a senha"
                className="w-full pl-11 pr-4 py-3 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-brand-600 text-primary-foreground rounded-full text-sm font-medium soft-shadow hover:bg-brand-600/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? "Criando conta..." : "Criar conta"}
            {!isPending && <ArrowRight className="size-4" />}
          </button>

          <p className="text-center text-sm text-foreground/60 pt-2">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="text-brand-600 font-medium hover:underline"
            >
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CadastroUsuario;
