import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const navigate = useNavigate();
  const [session, setSession] = useState(false);

  useEffect(() => {
    setSession(Boolean(window.localStorage.getItem("atlas_session")));
  }, []);

  const logout = () => {
    window.localStorage.removeItem("atlas_session");
    setSession(false);
    navigate({ to: "/" });
  };

  return (
    <main className="atlas-landing">
      <h1>{authConfig.branding.name}</h1>
      <p>{authConfig.branding.tagline}</p>
      <nav className="atlas-landing-nav">
        {session ? (
          <>
            <Link to="/admin">Painel</Link>
            <button type="button" className="text-button" onClick={logout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/auth">Entrar</Link>
            <Link to="/admin">Painel</Link>
          </>
        )}
      </nav>
    </main>
  );
}
