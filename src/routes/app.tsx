import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "@/atlas/shared/styles.css";
import Generator from "@/atlas/templates/generator";
import rawConfig from "@/atlas/configs/app.json";
import { TemplateRoot } from "@/atlas/shared/ui";
import type { TemplateConfig } from "@/atlas/types";
import { supabase } from "@/integrations/supabase/client";

const config = rawConfig as unknown as TemplateConfig;

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: `Gerador de conteúdo — ${config.branding.name}` },
      { name: "description", content: config.content.description },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "allowed">("checking");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        navigate({ to: "/auth" });
        return;
      }
      setStatus("allowed");
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  if (status === "checking") {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p>Verificando acesso…</p>
      </main>
    );
  }

  return (
    <TemplateRoot config={config}>
      <Generator config={config} />
    </TemplateRoot>
  );
}
