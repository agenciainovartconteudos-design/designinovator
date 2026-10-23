import { createFileRoute, Link } from "@tanstack/react-router";
import authConfig from "@/atlas/configs/auth.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${authConfig.branding.name} — Entre para continuar` },
      { name: "description", content: authConfig.content.description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="atlas-landing">
      <h1>{authConfig.branding.name}</h1>
      <p>{authConfig.branding.tagline}</p>
      <nav className="atlas-landing-nav">
        <Link to="/auth">Entrar</Link>
        <Link to="/admin">Painel</Link>
      </nav>
    </main>
  );
}
