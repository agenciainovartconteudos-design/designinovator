import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  CheckCircle2,
  Layers,
  ShieldCheck,
} from "lucide-react";
import type { TemplateConfig } from "../types";
import { Brand, Button, Photo, useToast } from "./ui";
import { supabase } from "@/integrations/supabase/client";

export function AuthPanel({
  config,
  onEnter,
  imageSrc,
}: {
  config: TemplateConfig;
  onEnter: () => void;
  imageSrc?: string;
}) {
  const [mode, setMode] = useState("login"),
    [show, setShow] = useState(false),
    [success, setSuccess] = useState(false),
    [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) {
          toast(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
          return;
        }
        toast("Login realizado com sucesso.");
        onEnter();
      } else if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { nome: data.name },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        if (error) {
          toast(error.message);
          return;
        }
        setSuccess(true);
        e.currentTarget.reset();
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) {
          toast(error.message);
          return;
        }
        setSuccess(true);
        e.currentTarget.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main" className="auth-layout">
      <section className="auth-visual">
        <Photo
          name={imageSrc || config.content.heroImage}
          alt={config.content.heroAlt || `Imagem de ${config.branding.name}`}
          loading="eager"
        />
        <div className="auth-visual-top">
          <Brand config={config} />
          <span>{config.branding.tagline}</span>
        </div>
        <div className="auth-visual-copy">
          <span className="auth-pill">
            <Layers size={14} />
            {config.content.visualBadge || config.branding.tagline}
          </span>
          <h1>{config.content.headline}</h1>
          <p>{config.content.visualDescription || config.content.description}</p>
          <div className="auth-visual-bottom">
            <span>{config.content.visualFooter || config.branding.tagline}</span>
          </div>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-mobile-brand">
          <Brand config={config} />
        </div>
        <div className="auth-box">
          {success ? (
            <div className="success-card">
              <CheckCircle2 size={48} />
              <h2>{mode === "recover" ? "Verifique seu e-mail" : "Conta criada"}</h2>
              <p>
                {mode === "recover"
                  ? "Se o e-mail informado existir, você receberá um link para redefinir sua senha."
                  : "Enviamos um link de confirmação para o seu e-mail. Confirme para poder entrar."}
              </p>
              <Button
                onClick={() => {
                  setMode("login");
                  setSuccess(false);
                }}
              >
                Voltar para entrar
              </Button>
            </div>
          ) : (
            <>
              <div className="auth-icon">
                <LockKeyhole size={24} />
              </div>
              <span className="eyebrow">{config.content.eyebrow}</span>
              <h2>
                {mode === "login"
                  ? config.content.loginTitle || "Acesse sua conta"
                  : mode === "register"
                    ? config.content.registerTitle || "Crie sua conta"
                    : config.content.recoverTitle || "Recupere sua senha"}
              </h2>
              <p>
                {mode === "login"
                  ? config.content.description
                  : mode === "register"
                    ? config.content.registerDescription || config.content.description
                    : config.content.recoverDescription || "Informe seu e-mail para recuperar o acesso."}
              </p>
              {mode !== "recover" && (
                <div className="auth-tabs">
                  <button
                    className={mode === "login" ? "active" : ""}
                    onClick={() => setMode("login")}
                  >
                    Entrar
                  </button>
                  <button
                    className={mode === "register" ? "active" : ""}
                    onClick={() => setMode("register")}
                  >
                    Criar conta
                  </button>
                </div>
              )}
              <form className="form-stack" onSubmit={handleSubmit}>
                {mode === "register" && (
                  <label className="field">
                    <span>Nome completo</span>
                    <input
                      name="name"
                      autoComplete="name"
                      placeholder="Como podemos chamar você?"
                      required
                    />
                  </label>
                )}
                <label className="field">
                  <span>Seu e-mail</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    required
                  />
                </label>
                {mode !== "recover" && (
                  <label className="field">
                    <span>Senha</span>
                    <div className="password-wrap">
                      <input
                        name="password"
                        type={show ? "text" : "password"}
                        aria-label="Senha"
                        aria-describedby="auth-password-hint"
                        autoComplete={
                          mode === "login" ? "current-password" : "new-password"
                        }
                        placeholder="Sua senha"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                        onClick={() => setShow(!show)}
                      >
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <small id="auth-password-hint" className="field-hint">
                      Mínimo de 6 caracteres.
                    </small>
                  </label>
                )}
                {mode === "login" && (
                  <div className="between auth-options">
                    <span>Acesso da equipe</span>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setMode("recover")}
                    >
                      Esqueci a senha
                    </button>
                  </div>
                )}
                {mode === "register" && (
                  <label className="auth-consent">
                    <input type="checkbox" required />
                    Concordo em receber comunicações da equipe sobre meu acesso.
                  </label>
                )}
                <Button type="submit" className="full" disabled={loading}>
                  {loading
                    ? "Enviando…"
                    : mode === "login"
                      ? "Entrar"
                      : mode === "register"
                        ? "Criar conta"
                        : "Enviar link de recuperação"}
                </Button>
                {mode === "recover" && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setMode("login")}
                  >
                    Voltar para entrar
                  </Button>
                )}
              </form>
              <div className="auth-demo">
                <ShieldCheck size={17} />
                <p>
                  Seus dados de acesso são protegidos e autenticados de verdade pela equipe.
                </p>
              </div>
            </>
          )}
        </div>
        <div className="auth-bottom">
          <span>© {config.branding.name}</span>
          <span>{config.branding.tagline}</span>
        </div>
      </section>
    </main>
  );
}
