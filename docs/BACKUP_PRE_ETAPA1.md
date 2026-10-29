# Backup de segurança — antes da Etapa 1 (Persistência em Nuvem e Autenticação de Equipe)

Este documento registra o procedimento de backup executado antes da criação das tabelas `clients`, `posts`, `approval_batches`, `comments`, `trends`, `profiles` e `user_roles`.

## O que o backup faz

- Cria um schema isolado `backup_pre_etapa1` no banco (Lovable Cloud / Supabase).
- Para cada tabela que **já existir** em `public` com os nomes acima, copia uma cópia fiel (estrutura + dados) para dentro de `backup_pre_etapa1` usando `CREATE TABLE IF NOT EXISTS ... AS TABLE ...`.
- Não apaga, não sobrescreve e não trunca nenhuma tabela existente. É uma operação somente de leitura sobre os dados originais.
- Como neste projeto essas tabelas ainda não existiam (a demonstração usava apenas dados mockados em `src/atlas/configs/admin.json`), o schema de backup ficará vazio na primeira execução — ele serve como rede de segurança para qualquer dado que já esteja em produção no momento da aprovação.

## Como restaurar, se necessário

Para qualquer tabela, dentro do SQL editor do Supabase:

```sql
-- Exemplo: restaurar a tabela clients a partir do backup
create table public.clients_restaurado as table backup_pre_etapa1.clients;
-- confira os dados e, só então, substitua manualmente a tabela public.clients se precisar.
```

## Quando foi solicitado

Solicitado pelo usuário imediatamente antes da aplicação do SQL da Etapa 1 (tabelas de clientes, posts, lotes de aprovação, comentários, tendências, perfis e papéis da equipe).
