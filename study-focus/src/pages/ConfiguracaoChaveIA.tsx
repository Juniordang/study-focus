import { useEffect, useState } from "react";
import {
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";
import { settingsApi } from "@/lib/api";
import { toast } from "sonner";

const keyGuides = {
  gemini: {
    url: "https://aistudio.google.com/app/apikey",
    steps: [
      "Acesse o Google AI Studio e entre com sua conta Google.",
      "Abra a área de API keys e clique em Create API key.",
      "Copie a chave gerada e cole no campo abaixo.",
    ],
  },
  groq: {
    url: "https://console.groq.com/keys",
    steps: [
      "Acesse o Groq Console e entre na sua conta.",
      "Abra API Keys e clique em Create API Key.",
      "Copie a chave que começa com gsk_ e cole no campo abaixo.",
    ],
  },
};

type KeyGuideProps = {
  guide: (typeof keyGuides)[keyof typeof keyGuides];
  providerName: string;
};

const KeyGuide = ({ guide, providerName }: KeyGuideProps) => (
  <div className="rounded-xl border border-surface-100 bg-surface-50 p-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h4 className="text-sm font-medium text-foreground/90">
          Como conseguir a chave
        </h4>
        <ol className="mt-3 space-y-2">
          {guide.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-foreground/70">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-card text-xs font-medium text-foreground/70">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <a
        href={guide.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface-100"
      >
        Abrir {providerName}
        <ExternalLink className="size-4" />
      </a>
    </div>

    <div className="mt-4 flex gap-2 border-t border-surface-100 pt-3 text-xs text-foreground/60">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />
      <p>
        Guarde essa chave com cuidado e evite compartilhar em mensagens, prints
        ou repositórios públicos.
      </p>
    </div>
  </div>
);

const Settings = () => {
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [geminiMaskedKey, setGeminiMaskedKey] = useState("");
  const [groqMaskedKey, setGroqMaskedKey] = useState("");
  const [existingProviders, setExistingProviders] = useState<Set<string>>(
    new Set(),
  );
  const [showGemini, setShowGemini] = useState(false);
  const [showGroq, setShowGroq] = useState(false);

  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [isSavingGemini, setIsSavingGemini] = useState(false);
  const [isSavingGroq, setIsSavingGroq] = useState(false);

  useEffect(() => {
    const loadKeys = async () => {
      setIsLoadingKeys(true);

      try {
        const keys = await settingsApi.listApiKeys();
        const providers = new Set<string>();

        keys.forEach((config) => {
          if (providers.has(config.provedor)) {
            return;
          }

          providers.add(config.provedor);

          if (config.provedor === "gemini") {
            setGeminiMaskedKey(config.chave_mascarada);
          }

          if (config.provedor === "groq") {
            setGroqMaskedKey(config.chave_mascarada);
          }
        });

        setExistingProviders(providers);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Erro desconhecido";
        toast.error(`Erro ao carregar chaves: ${message}`);
      } finally {
        setIsLoadingKeys(false);
      }
    };

    loadKeys();
  }, []);

  const saveKey = async (
    provider: string,
    key: string,
    setKey: (key: string) => void,
    setMaskedKey: (key: string) => void,
    setSavingState: (s: boolean) => void,
  ) => {
    if (!key.trim()) return;

    setSavingState(true);
    try {
      const payload = {
        provedor: provider,
        chave_api: key,
      };

      const savedConfig = existingProviders.has(provider)
        ? await settingsApi.updateApiKey(payload)
        : await settingsApi.saveApiKey(payload);

      setKey("");
      setMaskedKey(savedConfig.chave_mascarada);
      setExistingProviders((providers) => new Set(providers).add(provider));
      toast.success(`Chave do ${provider} salva com sucesso!`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro ao salvar chave: ${message}`);
    } finally {
      setSavingState(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-light tracking-tight">
          Configurações
        </h1>
        <p className="text-foreground/60 font-body mt-1 text-sm sm:text-base">
          Gerencie as suas chaves de API e integrações com o Assistente de IA.
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-card rounded-2xl soft-shadow border border-surface-100 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
            <div className="size-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <Key className="size-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-heading font-medium text-lg">
                Google Gemini
              </h3>
              <p className="text-xs text-foreground/60">
                Integração com a inteligência artificial do Google.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-sm font-medium text-foreground/80 mb-2 block">
              Chave de API (Gemini)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type={showGemini ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder={
                    isLoadingKeys
                      ? "Carregando chave..."
                      : "Coloque sua AI_STUDIO_KEY aqui"
                  }
                  disabled={isLoadingKeys}
                  className="w-full pl-4 pr-10 py-3 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 transition-colors"
                >
                  {showGemini ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <button
                onClick={() =>
                  saveKey(
                    "gemini",
                    geminiKey,
                    setGeminiKey,
                    setGeminiMaskedKey,
                    setIsSavingGemini,
                  )
                }
                disabled={isLoadingKeys || isSavingGemini || !geminiKey.trim()}
                className="px-6 py-3 bg-brand-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-brand-600/90 transition-colors flex items-center justify-center gap-2"
              >
                {isSavingGemini ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Salvar
              </button>
            </div>
            {geminiMaskedKey && (
              <p className="mt-2 text-xs text-foreground/60">
                Chave cadastrada: {geminiMaskedKey}
              </p>
            )}
          </div>

          <KeyGuide guide={keyGuides.gemini} providerName="Google AI Studio" />
        </div>

        <div className="p-6 bg-card rounded-2xl soft-shadow border border-surface-100 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
            <div className="size-10 rounded-xl bg-surface-200 flex items-center justify-center">
              <Key className="size-5 text-foreground/70" />
            </div>
            <div>
              <h3 className="font-heading font-medium text-lg">Groq API</h3>
              <p className="text-xs text-foreground/60">
                Integração com LLaMA ou outras LLMs ultra-rápidas.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-sm font-medium text-foreground/80 mb-2 block">
              Chave de API (Groq)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type={showGroq ? "text" : "password"}
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder={
                    isLoadingKeys ? "Carregando chave..." : "gsk_..."
                  }
                  disabled={isLoadingKeys}
                  className="w-full pl-4 pr-10 py-3 bg-surface-50 rounded-xl border border-surface-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                />
                <button
                  type="button"
                  onClick={() => setShowGroq(!showGroq)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 transition-colors"
                >
                  {showGroq ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <button
                onClick={() =>
                  saveKey(
                    "groq",
                    groqKey,
                    setGroqKey,
                    setGroqMaskedKey,
                    setIsSavingGroq,
                  )
                }
                disabled={isLoadingKeys || isSavingGroq || !groqKey.trim()}
                className="px-6 py-3 bg-brand-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-brand-600/90 transition-colors flex items-center justify-center gap-2"
              >
                {isSavingGroq ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Salvar
              </button>
            </div>
            {groqMaskedKey && (
              <p className="mt-2 text-xs text-foreground/60">
                Chave cadastrada: {groqMaskedKey}
              </p>
            )}
          </div>

          <KeyGuide guide={keyGuides.groq} providerName="Groq Console" />
        </div>
      </div>
    </div>
  );
};

export default Settings;
