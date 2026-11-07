import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "@/atlas/shared/styles.css";
import Admin from "@/atlas/templates/admin";
import rawConfig from "@/atlas/configs/admin.json";
import { TemplateRoot } from "@/atlas/shared/ui";
import type { TemplateConfig } from "@/atlas/types";
import { supabase } from "@/integrations/supabase/client";

const config = rawConfig as unknown as TemplateConfig;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Painel — ${config.branding.name}` },
      { name: "description", content: config.content.description },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "denied" | "allowed">("checking");

  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        if (active) navigate({ to: "/auth" });
        return;
      }
      const { data: isAdmin, error } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (!active) return;
      if (error || !isAdmin) {
        setStatus("denied");
        return;
      }
      setStatus("allowed");
    };
    check();
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

  if (status === "denied") {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ marginBottom: 12 }}>Acesso restrito</h1>
          <p>Sua conta não tem permissão de administrador para acessar este painel.</p>
        </div>
      </main>
    );
  }

  return (
    <TemplateRoot config={config}>
      <Admin config={config} />
    </TemplateRoot>
  );
}
