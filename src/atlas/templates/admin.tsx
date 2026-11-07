import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Pencil,
  Activity,
  UserCheck,
  UserPlus,
  Download,
  Palette,
  Link2,
  AlertCircle,
  Plus,
} from "lucide-react";
import type { TemplateProps } from "../types";
import {
  AppFrame,
  PageHead,
  Button,
  Stat,
  Panel,
  Avatar,
  Status,
  Search,
  Tabs,
  FormModal,
  SettingPanel,
  LineChart,
  IconButton,
  Empty,
  exportCSV,
  useToast,
} from "../shared/ui";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Database } from "@/integrations/supabase/types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type UserRow = {
  id: string;
  nome: string;
  email: string;
  role: AppRole;
  status: string;
  created_at: string;
};

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  editor: "Editor",
  member: "Membro",
};
const ROLE_FROM_LABEL: Record<string, AppRole> = {
  Administrador: "admin",
  Editor: "editor",
  Membro: "member",
};
const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export default function Admin({ config }: TemplateProps) {
  const [view, setView] = useState("overview");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [edit, setEdit] = useState<UserRow | null>(null);

  const [arts, setArts] = useState<PostRow[]>([]);
  const [artsLoading, setArtsLoading] = useState(true);
  const [artsError, setArtsError] = useState<string | null>(null);
  const [artQuery, setArtQuery] = useState("");
  const [artFilter, setArtFilter] = useState("Todos");
  const [artEdit, setArtEdit] = useState<PostRow | null>(null);
  const [artCreate, setArtCreate] = useState(false);

  const toast = useToast();

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    const [{ data: profilesData, error: profilesError }, { data: rolesData, error: rolesError }] =
      await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);
    if (profilesError || rolesError) {
      setUsersError(profilesError?.message || rolesError?.message || "Erro ao carregar usuários.");
      setUsersLoading(false);
      return;
    }
    const roleMap = new Map((rolesData || []).map((r) => [r.user_id, r.role as AppRole]));
    setUsers(
      (profilesData || []).map((p) => ({
        id: p.id,
        nome: p.nome || p.email || "Sem nome",
        email: p.email || "",
        status: p.status || "Ativo",
        created_at: p.created_at,
        role: roleMap.get(p.id) || "member",
      })),
    );
    setUsersLoading(false);
  };

  const loadArts = async () => {
    setArtsLoading(true);
    setArtsError(null);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setArtsError(error.message);
      setArtsLoading(false);
      return;
    }
    setArts(data || []);
    setArtsLoading(false);
  };

  useEffect(() => {
    loadUsers();
    loadArts();
  }, []);

  const filtered = users.filter(
    (x) =>
      (filter === "Todos" || x.status === filter) &&
      `${x.nome} ${x.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredArts = arts.filter(
    (x) =>
      (artFilter === "Todos" || x.status === artFilter) &&
      `${x.title} ${x.client_name}`.toLowerCase().includes(artQuery.toLowerCase()),
  );

  const nav = [
    { id: "overview", label: "Visão geral", icon: <LayoutDashboard size={18} /> },
    { id: "users", label: "Usuários", icon: <Users size={18} />, count: users.length },
    { id: "artes", label: "Criação de Artes", icon: <Palette size={18} />, count: arts.length },
    { id: "roles", label: "Papéis & acesso", icon: <Shield size={18} /> },
    { id: "settings", label: "Configurações", icon: <Settings size={18} /> },
  ];

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/auth`);
    toast("Link de acesso copiado. Peça para a pessoa criar a conta e depois defina o papel dela aqui.");
  };

  const copyApprovalLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/aprovacao/${token}`);
    toast("Link de aprovação copiado.");
  };

  return (
    <AppFrame config={config} nav={nav} active={view} onNav={setView}>
      <PageHead
        eyebrow="WORKSPACE / OPERAÇÃO"
        title={
          view === "overview"
            ? config.content.headline
            : view === "users"
              ? "Pessoas que fazem acontecer"
              : view === "roles"
                ? "Cada pessoa, o acesso certo"
                : view === "artes"
                  ? "Criação de artes"
                  : "Do seu jeito"
        }
        description={
          view === "artes"
            ? "Organize, acompanhe e aprove cada arte em produção para os clientes."
            : config.content.description
        }
      >
        {view === "users" && (
          <Button onClick={copyInvite}>
            <UserPlus size={17} />
            Convidar pessoa
          </Button>
        )}
        {view === "artes" && (
          <Button onClick={() => setArtCreate(true)}>
            <Plus size={17} />
            Nova arte
          </Button>
        )}
      </PageHead>
      {view === "settings" ? (
        <SettingPanel />
      ) : view === "roles" ? (
        <div className="three-grid">
          {(["admin", "editor", "member"] as AppRole[]).map((role, i) => (
            <Panel
              key={role}
              title={ROLE_LABELS[role]}
              subtitle={`${users.filter((x) => x.role === role).length} usuários nesta função`}
            >
              <div className="panel-body">
                <Shield size={30} color="var(--accent)" />
                <p className="muted" style={{ fontSize: 14, margin: "20px 0" }}>
                  {
                    [
                      "Visão completa da operação e configurações.",
                      "Gestão dos conteúdos e atividades da equipe.",
                      "Acesso ao próprio espaço e aos projetos compartilhados.",
                    ][i]
                  }
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setView("users");
                    setQuery("");
                  }}
                >
                  Gerenciar pessoas
                </Button>
                <p className="field-hint">
                  Papéis reais validados no servidor (RLS) via função has_role.
                </p>
              </div>
            </Panel>
          ))}
        </div>
      ) : view === "artes" ? (
        <>
          <div className="stat-grid">
            <Stat
              label="Artes em produção"
              value={arts.filter((x) => x.status === "Em produção").length}
              change="Aguardando finalização"
              icon={<Palette size={18} />}
            />
            <Stat
              label="Em aprovação"
              value={arts.filter((x) => x.status === "Em aprovação").length}
              change="Com o cliente"
              icon={<Activity size={18} />}
            />
            <Stat
              label="Aprovadas"
              value={arts.filter((x) => x.status === "Aprovado").length}
              change="Prontas para publicar"
              icon={<UserCheck size={18} />}
            />
            <Stat
              label="Total de artes"
              value={arts.length}
              change="No workspace"
              icon={<Download size={18} />}
            />
          </div>
          <Panel
            title="Fila de criação"
            subtitle="Acompanhe cada peça do briefing à aprovação"
            action={
              <IconButton
                label="Exportar artes"
                onClick={() =>
                  exportCSV(
                    "artes.csv",
                    ["Título", "Cliente", "Status", "Criado em"],
                    filteredArts.map((x) => [x.title, x.client_name || "", x.status, dateLabel(x.created_at)]),
                  )
                }
              >
                <Download size={17} />
              </IconButton>
            }
          >
            <div className="toolbar panel-body" style={{ paddingBottom: 0 }}>
              <Tabs
                items={["Todos", "Em produção", "Em aprovação", "Aprovado", "Ajustes"]}
                value={artFilter}
                onChange={setArtFilter}
              />
              <Search value={artQuery} onChange={setArtQuery} placeholder="Buscar artes…" />
            </div>
            {artsLoading ? (
              <div className="empty panel-body">
                <Activity size={28} />
                <p className="muted">Carregando artes…</p>
              </div>
            ) : artsError ? (
              <div className="empty panel-body">
                <AlertCircle size={28} />
                <h3>Não foi possível carregar as artes</h3>
                <p className="muted">{artsError}</p>
                <Button onClick={loadArts}>Tentar novamente</Button>
              </div>
            ) : filteredArts.length ? (
              <div className="three-grid panel-body">
                {filteredArts.map((a) => (
                  <div className="feature-card" key={a.id}>
                    <div className="between">
                      <Palette size={22} />
                      <Status value={a.status} />
                    </div>
                    <h3>{a.title}</h3>
                    <p>{a.client_name}</p>
                    <p className="field-hint">{a.description}</p>
                    <div className="between" style={{ marginTop: 18 }}>
                      <small className="muted">{dateLabel(a.created_at)}</small>
                      <div className="inline">
                        <IconButton label="Copiar link de aprovação" onClick={() => copyApprovalLink(a.approval_token)}>
                          <Link2 size={15} />
                        </IconButton>
                        <IconButton label={`Editar ${a.title}`} onClick={() => setArtEdit(a)}>
                          <Pencil size={15} />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty title="Nenhuma arte encontrada" text="Crie a primeira arte para este cliente.">
                <Button onClick={() => setArtCreate(true)}>
                  <Plus size={17} />
                  Nova arte
                </Button>
              </Empty>
            )}
          </Panel>
        </>
      ) : (
        <>
          {view === "overview" && (
            <>
              <div className="stat-grid">
                <Stat
                  label="Usuários no workspace"
                  value={users.length}
                  change="Pessoas cadastradas"
                  icon={<Users size={18} />}
                />
                <Stat
                  label="Ativos agora"
                  value={users.filter((x) => x.status === "Ativo").length}
                  change="Status do cadastro"
                  icon={<UserCheck size={18} />}
                />
                <Stat
                  label="Artes em aprovação"
                  value={arts.filter((x) => x.status === "Em aprovação").length}
                  change="Aguardando o cliente"
                  icon={<UserPlus size={18} />}
                />
                <Stat
                  label="Papéis disponíveis"
                  value="3"
                  change="Organização por responsabilidade"
                  icon={<Shield size={18} />}
                />
              </div>
              <div className="grid-2" style={{ marginBottom: 25 }}>
                <Panel
                  title="Atividade do workspace"
                  subtitle="Artes criadas · últimos 7 dias"
                  action={<span className="badge success">Visão semanal</span>}
                >
                  <LineChart
                    values={[18, 25, 20, 38, 31, 49, 42]}
                    labels={["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]}
                  />
                </Panel>
                <Panel title="Tudo em movimento" subtitle="Resumo dos cadastros">
                  {usersLoading ? (
                    <p className="muted panel-body">Carregando…</p>
                  ) : (
                    <div className="row-list">
                      {users.slice(0, 3).map((u) => (
                        <div className="list-row" key={u.id}>
                          <Avatar name={u.nome} />
                          <div>
                            <h3>{u.nome}</h3>
                            <p>{ROLE_LABELS[u.role]}</p>
                          </div>
                          <Status value={u.status} />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="panel-body">
                    <Button variant="ghost" className="full" onClick={() => setView("users")}>
                      Ver todos os usuários
                    </Button>
                  </div>
                </Panel>
              </div>
            </>
          )}
          <Panel
            title={view === "overview" ? "Usuários recentes" : "Gerenciar usuários"}
            subtitle="Organize a equipe e os acessos"
            action={
              <IconButton
                label="Exportar usuários"
                onClick={() =>
                  exportCSV(
                    "usuarios.csv",
                    ["Nome", "E-mail", "Papel", "Status"],
                    filtered.map((x) => [x.nome, x.email, ROLE_LABELS[x.role], x.status]),
                  )
                }
              >
                <Download size={17} />
              </IconButton>
            }
          >
            <div className="toolbar panel-body" style={{ paddingBottom: 0 }}>
              <Tabs items={["Todos", "Ativo", "Convidado", "Suspenso"]} value={filter} onChange={setFilter} />
              <Search value={query} onChange={setQuery} placeholder="Buscar pessoas…" />
            </div>
            {usersLoading ? (
              <div className="empty panel-body">
                <Activity size={28} />
                <p className="muted">Carregando usuários…</p>
              </div>
            ) : usersError ? (
              <div className="empty panel-body">
                <AlertCircle size={28} />
                <h3>Não foi possível carregar os usuários</h3>
                <p className="muted">{usersError}</p>
                <Button onClick={loadUsers}>Tentar novamente</Button>
              </div>
            ) : filtered.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Papel</th>
                      <th>Status</th>
                      <th>Criado em</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="inline">
                            <Avatar name={u.nome} />
                            <div>
                              <strong>{u.nome}</strong>
                              <span className="secondary">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{ROLE_LABELS[u.role]}</td>
                        <td>
                          <Status value={u.status} />
                        </td>
                        <td>{dateLabel(u.created_at)}</td>
                        <td>
                          <IconButton label={`Editar ${u.nome}`} onClick={() => setEdit(u)}>
                            <Pencil size={15} />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty title="Nenhum usuário encontrado" text="Convide pessoas para a equipe usando o botão acima." />
            )}
            <div className="table-footer">
              {filtered.length} de {users.length} pessoas
              <span>Dados reais · Supabase</span>
            </div>
          </Panel>
        </>
      )}
      <FormModal
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Editar usuário"
        description="Alterações são salvas de verdade para toda a equipe."
        fields={[
          { name: "nome", label: "Nome completo", value: edit?.nome },
          {
            name: "role",
            label: "Papel",
            type: "select",
            options: ["Administrador", "Editor", "Membro"],
            value: edit ? ROLE_LABELS[edit.role] : "Membro",
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["Ativo", "Convidado", "Suspenso"],
            value: edit?.status || "Convidado",
          },
        ]}
        onSubmit={async (d) => {
          if (!edit) return false;
          const newRole = ROLE_FROM_LABEL[d.role] || "member";
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ nome: d.nome, status: d.status })
            .eq("id", edit.id);
          const { error: roleError } = await supabase
            .from("user_roles")
            .upsert({ user_id: edit.id, role: newRole }, { onConflict: "user_id" });
          if (profileError || roleError) {
            toast(profileError?.message || roleError?.message || "Erro ao salvar usuário.");
            return false;
          }
          toast("Usuário atualizado.");
          loadUsers();
        }}
      />
      <FormModal
        open={artCreate || !!artEdit}
        onClose={() => {
          setArtCreate(false);
          setArtEdit(null);
        }}
        title={artEdit ? "Editar arte" : "Nova arte"}
        description="Preencha o briefing da arte para a equipe de criação."
        fields={[
          { name: "title", label: "Título da arte", value: artEdit?.title },
          { name: "client_name", label: "Cliente", value: artEdit?.client_name },
          {
            name: "description",
            label: "Briefing / descrição",
            type: "textarea",
            value: artEdit?.description || undefined,
            required: false,
          },
          {
            name: "image_url",
            label: "URL da referência de imagem",
            value: artEdit?.image_url || undefined,
            required: false,
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["Em produção", "Em aprovação", "Aprovado", "Ajustes"],
            value: artEdit?.status || "Em produção",
          },
        ]}
        onSubmit={async (d) => {
          if (artEdit) {
            const { error } = await supabase
              .from("posts")
              .update({
                title: d.title,
                client_name: d.client_name,
                description: d.description,
                image_url: d.image_url,
                status: d.status,
              })
              .eq("id", artEdit.id);
            if (error) {
              toast(error.message);
              return false;
            }
            toast("Arte atualizada.");
          } else {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            const { error } = await supabase.from("posts").insert({
              title: d.title,
              client_name: d.client_name,
              description: d.description,
              image_url: d.image_url,
              status: d.status,
              created_by: user?.id,
            });
            if (error) {
              toast(error.message);
              return false;
            }
            toast("Arte adicionada à fila de criação.");
          }
          loadArts();
        }}
      />
    </AppFrame>
  );
}
