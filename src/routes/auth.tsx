import { createFileRoute } from "@tanstack/react-router";
import "@/atlas/shared/styles.css";
import Auth from "@/atlas/templates/auth";
import rawConfig from "@/atlas/configs/auth.json";
import { TemplateRoot } from "@/atlas/shared/ui";
import type { TemplateConfig } from "@/atlas/types";

const config = rawConfig as unknown as TemplateConfig;

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: `Entrar — ${config.branding.name}` },
      { name: "description", content: config.content.description },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <TemplateRoot config={config}>
      <Auth config={config} />
    </TemplateRoot>
  );
}
