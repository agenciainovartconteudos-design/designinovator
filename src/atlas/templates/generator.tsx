import { useEffect, useState } from "react";
import {
  Sparkles,
  Clock,
  Settings,
  Copy,
  Activity,
  AlertCircle,
  Zap,
  Instagram,
  Mail,
  Video,
  Megaphone,
} from "lucide-react";
import type { TemplateProps } from "../types";
import {
  AppFrame,
  PageHead,
  Button,
  Panel,
  Empty,
Badge,
  IconButton,
  useToast,
} from "../shared/ui";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type GenerationRow = Database["public"]["Tables"]["content_generations"]["Row"];

const TYPES = [
  { id: "instagram", label: "Legenda para Instagram", icon: Instagram },
  { id: "video", label: "Roteiro de vídeo", icon: Video },
  { id: "email", label: "E-mail marketing", icon: Mail },
  { id: "ad", label: "Anúncio", icon: Megaphone },
];

const TONES = ["Profissional", "Descontraído", "Persuasivo", "Divertido"];

const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function buildPlaceholder(type: string, tone: string, prompt: string) {
  const typeLabel = TYPES.find((t) => t.id === type)?.label || "Conteúdo";
  return `[${typeLabel} · tom ${tone.toLowerCase()}]\n\n${prompt}\n\n— Gerado automaticamente. Em breve, este texto virá de uma IA real conectada ao seu provedor.`;
}

export default function Generator({ config }: TemplateProps) {
  const [view, setView] = useState("overview");
  const [type, setType] = useState("instagram");
  const [tone, setTone] = useState("Profissional");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");

  const [history, setHistory] = useState<GenerationRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  const toast = useToast();

  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setHistoryLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("content_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      setHistoryError(error.message);
      setHistoryLoading(false);
      return;
    }
    setHistory(data || []);
    setHistoryLoading(false);
  };

  const loadCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("credits").eq("id", user.id).single();
    setCredits(data?.credits ?? 0);
  };

  useEffect(() => {
    loadHistory();
    loadCredits();
  }, []);

  const generate = async () => {
    if (!prompt.trim()) {
      toast("Descreva o que você precisa gerar.");
      return;
    }
    if (credits !== null && credits <= 0) {
      toast("Seus créditos acabaram. Fale com o administrador para liberar mais.");
      return;
    }
    setGenerating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setGenerating(false);
      return;
    }
    await new Promise((r) => setTimeout(r, 900));
    const text = buildPlaceholder(type, tone, prompt);
    setResult(text);
    const { error: insertError } = await supabase.from("content_generations").insert({
      user_id: user.id,
      type,
      tone,
      prompt,
      result: text,
      credits_used: 1,
    });
    if (insertError) {
      toast(insertError.message);
      setGenerating(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .update({ credits: Math.max(0, (credits ?? 1) - 1) })
      .eq("id", user.id)
      .select("credits")
      .single();
    setCredits(profile?.credits ?? Math.max(0, (credits ?? 1) - 1));
    setGenerating(false);
    loadHistory();
    toast("Conteúdo gerado com sucesso.");
  };

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Conteúdo copiado.");
  };

  const nav = [
    { id: "overview", label: "Gerador", icon: <Sparkles size={18} /> },
    { id: "history", label: "Histórico", icon: <Clock size={18} />, count: history.length },
    { id: "settings", label: "Configurações", icon: <Settings size={18} /> },
  ];

  return (
    <AppFrame config={config} nav={nav} active={view} onNav={setView}>
      <PageHead
        eyebrow="WORKSPACE / PRODUTO"
        title={view === "overview" ? "Gerador de conteúdo com IA" : view === "history" ? "Seu histórico de gerações" : "Preferências"}
        description={
          view === "overview"
            ? "Descreva o que você precisa e gere legendas, roteiros, e-mails e anúncios em segundos."
            : view === "history"
              ? "Tudo o que você já gerou, sempre à mão."
              : config.content.description
        }
      >
        {view === "overview" && credits !== null && (
          <Badge tone={credits > 0 ? "accent" : "danger"}>
            <Zap size={13} />
            {credits} crédito{credits === 1 ? "" : "s"} disponíve{credits === 1 ? "l" : "is"}
          </Badge>
        )}
      </PageHead>
      {view === "settings" ? (
        <Panel title="Preferências do workspace" subtitle="Ajustes da sua conta de geração.">
          <div className="panel-body">
            <p className="muted" style={{ fontSize: 14 }}>
              Seus créditos são renovados pelo administrador da conta. Fale com o time caso precise de mais.
            </p>
          </div>
        </Panel>
      ) : view === "history" ? (
        <Panel title="Gerações anteriores" subtitle="Resultados salvos automaticamente">
          {historyLoading ? (
            <div className="empty panel-body">
              <Activity size={28} />
              <p className="muted">Carregando histórico…</p>
            </div>
          ) : historyError ? (
            <div className="empty panel-body">
              <AlertCircle size={28} />
              <h3>Não foi possível carregar o histórico</h3>
              <p className="muted">{historyError}</p>
              <Button onClick={loadHistory}>Tentar novamente</Button>
            </div>
          ) : history.length ? (
            <div className="row-list">
              {history.map((h) => (
                <div className="list-row" key={h.id}>
                  <div>
                    <h3>{TYPES.find((t) => t.id === h.type)?.label || h.type}</h3>
                    <p>{h.prompt}</p>
                  </div>
                  <div className="row-right">
                    <small className="muted">{dateLabel(h.created_at)}</small>
                    <div style={{ marginTop: 8 }}>
                      <IconButton label="Copiar resultado" onClick={() => copyResult(h.result)}>
                        <Copy size={15} />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Nenhuma geração ainda" text="Use o gerador para criar seu primeiro conteúdo.">
              <Button onClick={() => setView("overview")}>
                <Sparkles size={17} />
                Ir para o gerador
              </Button>
            </Empty>
          )}
        </Panel>
      ) : (
        <div className="grid-2">
          <Panel title="Novo conteúdo" subtitle="Escolha o tipo, o tom e descreva o que você precisa">
            <div className="panel-body">
              <div className="chip-row" style={{ marginBottom: 20 }}>
                {TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`chip ${type === t.id ? "active" : ""}`}
                      onClick={() => setType(t.id)}
                    >
                      <Icon size={14} style={{ marginRight: 6 }} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <label className="field" style={{ marginBottom: 18 }}>
                <span>Tom de voz</span>
                <select className="select full" value={tone} onChange={(e) => setTone(e.target.value)}>
                  {TONES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="field" style={{ marginBottom: 20 }}>
                <span>O que você precisa criar?</span>
                <textarea
                  rows={5}
                  placeholder="Ex: legenda para post sobre lançamento de coleção de verão, destacando frete grátis."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </label>
              <Button className="full" onClick={generate} disabled={generating}>
                <Sparkles size={17} />
                {generating ? "Gerando…" : "Gerar conteúdo"}
              </Button>
              <p className="field-hint">Cada geração consome 1 crédito do seu plano.</p>
            </div>
          </Panel>
          <Panel title="Resultado" subtitle="Prévia do conteúdo gerado">
            <div className="panel-body">
              {generating ? (
                <div className="empty">
                  <Activity size={28} />
                  <p className="muted">Gerando seu conteúdo…</p>
                </div>
              ) : result ? (
                <>
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 14, lineHeight: 1.8 }}>{result}</pre>
                  <Button variant="secondary" className="full" style={{ marginTop: 18 }} onClick={() => copyResult(result)}>
                    <Copy size={15} />
                    Copiar conteúdo
                  </Button>
                </>
              ) : (
                <Empty title="Nada gerado ainda" text="Preencha o formulário ao lado e clique em Gerar conteúdo." />
              )}
            </div>
          </Panel>
        </div>
      )}
    </AppFrame>
  );
}
