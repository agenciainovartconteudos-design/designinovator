import { useNavigate } from "@tanstack/react-router";
import type { TemplateProps } from "../types";
import { AuthPanel } from "../shared/auth-panel";

export default function Auth({ config, imageSrc }: TemplateProps & { imageSrc?: string }) {
  const navigate = useNavigate();
  return (
    <AuthPanel
      config={config}
      imageSrc={imageSrc}
      onEnter={() => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("atlas_session", "1");
        }
        navigate({ to: "/admin" });
      }}
    />
  );
}
