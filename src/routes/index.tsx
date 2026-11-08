import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import authConfig from "@/atlas/configs/auth.json";
import { supabase } from "@/integrations/supabase/client";

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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(Boolean(data.session));
      if (data.session) {
        supabase
          .rpc("has_role", { _user_id: data.session.user.id, _role: "admin" })
          .then(({ data: admin }) => setIsAdmin(Boolean(admin)));
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(Boolean(newSession));
      if (newSession) {
        supabase
          .rpc("has_role", { _user_id: newSession.user.id, _role: "admin" })
          .then(({ data: admin }) => setIsAdmin(Boolean(admin)));
      } else {
        setIsAdmin(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(false);
    setIsAdmin(false);
    navigate({ to: "/" });
  };

  return (
    <main className="atlas-landing">
      <h1>{authConfig.branding.name}</h1>
      <p>{authConfig.branding.tagline}</p>
      <nav className="atlas-landing-nav">
        {session ? (
          <>
            <Link to="/app">Gerador de conteúdo</Link>
            {isAdmin && <Link to="/admin">Painel</Link>}
            <button type="button" className="text-button" onClick={logout}>
              Sair
            </button>
          </>
        ) : (
          <Link to="/auth">Entrar</Link>
        )}
      </nav>
    </main>
  );
}
