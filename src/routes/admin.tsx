import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import "@/atlas/shared/styles.css";
import Admin from "@/atlas/templates/admin";
import rawConfig from "@/atlas/configs/admin.json";
import { TemplateRoot } from "@/atlas/shared/ui";
import type { TemplateConfig } from "@/atlas/types";

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

  useEffect(() => {
    if (typeof window !== "undefined" && !window.localStorage.getItem("atlas_session")) {
      navigate({ to: "/auth" });
    }
  }, [navigate]);

  return (
    <TemplateRoot config={config}>
      <Admin config={config} />
    </TemplateRoot>
  );
}
