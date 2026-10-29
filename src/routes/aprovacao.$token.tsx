import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, MessageSquare, Clock, ThumbsUp } from "lucide-react";
import "@/atlas/shared/styles.css";
import { TemplateRoot, Button, Badge, Status, Empty } from "@/atlas/shared/ui";
import rawConfig from "@/atlas/configs/admin.json";
import type { TemplateConfig, Entity } from "@/atlas/types";
import { list as listCollection } from "@/atlas/types";

const config = rawConfig as unknown as TemplateConfig;

export const Route = createFileRoute("/aprovacao/$token")({
  head: () => ({
    meta: [
      { title: `Aprovação de artes — ${config.branding.name}` },
      {
        name: "description",
        content: "Revise e aprove as artes preparadas para o seu próximo ciclo de publicações.",
      },
    ],
  }),
  component: ApprovalPage,
});

function ApprovalPage() {
  const { token } = Route.useParams();
  const [items, setItems] = useState<Entity[]>(listCollection(config, "artes"));
  const [feedbackFor, setFeedbackFor] = useState<Entity | null>(null);
  const [feedback, setFeedback] = useState("");
  const [sent, setSent] = useState(false);

  const approve = (id: string) => {
    setItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Aprovado" } : a)),
    );
  };

  const requestChange = (item: Entity) => {
    setFeedbackFor(item);
    setFeedback("");
    setSent(false);
  };

  const submitFeedback = () => {
    if (!feedbackFor) return;
    setItems((prev) =>
      prev.map((a) =>
        a.id === feedbackFor.id ? { ...a, status: "Ajustes" } : a,
      ),
    );
    setSent(true);
  };

  return (
    <TemplateRoot config={config}>
      <main id="main" className="app-main" style={{ maxWidth: 980, margin: "0 auto", padding: "48px 20px" }}>
        <div className="page-head">
          <div>
            <span className="eyebrow">LINK DE APROVAÇÃO · {token.slice(0, 8)}</span>
            <h1>Revise as artes do seu ciclo</h1>
            <p>
              Clique em aprovar quando estiver tudo certo ou peça um ajuste diretamente na peça. A equipe é notificada na hora.
            </p>
          </div>
        </div>
        {items.length ? (
          <div className="three-grid">
            {items.map((a) => (
              <div className="feature-card" key={a.id}>
                <div className="between">
                  <Clock size={20} />
                  <Status value={a.status} />
                </div>
                <h3>{a.title}</h3>
                <p>{a.subtitle}</p>
                <p className="field-hint">{a.description}</p>
                <div className="between" style={{ marginTop: 20, gap: 10 }}>
                  <Button
                    variant="primary"
                    disabled={a.status === "Aprovado"}
                    onClick={() => approve(a.id)}
                  >
                    <ThumbsUp size={16} />
                    {a.status === "Aprovado" ? "Aprovado" : "Aprovar"}
                  </Button>
                  <Button variant="secondary" onClick={() => requestChange(a)}>
                    <MessageSquare size={16} />
                    Pedir ajuste
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="Nenhuma arte neste link"
            text="Este link de aprovação ainda não tem peças vinculadas ou expirou."
          />
        )}
        {feedbackFor && (
          <div className="panel" style={{ marginTop: 28, padding: 24 }}>
            {sent ? (
              <div className="success-card">
                <CheckCircle2 size={40} />
                <h2>Apontamento enviado</h2>
                <p>A equipe foi avisada e vai ajustar “{feedbackFor.title}”.</p>
                <Button onClick={() => setFeedbackFor(null)}>Fechar</Button>
              </div>
            ) : (
              <>
                <h2 style={{ marginBottom: 6 }}>Ajuste em “{feedbackFor.title}”</h2>
                <p className="muted" style={{ marginBottom: 16 }}>
                  Descreva o que precisa mudar nesta peça.
                </p>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Ex.: trocar a cor de fundo e aumentar a fonte do título"
                  style={{ width: "100%", marginBottom: 16 }}
                />
                <div className="inline">
                  <Button onClick={submitFeedback} disabled={!feedback.trim()}>
                    Enviar apontamento
                  </Button>
                  <Button variant="ghost" onClick={() => setFeedbackFor(null)}>
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <Badge>Link de aprovação sem necessidade de login</Badge>
        </div>
      </main>
    </TemplateRoot>
  );
}
