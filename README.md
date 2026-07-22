# Micronativa — site institucional e atendimento

Aplicação institucional da Micronativa em Next.js/Vinext, React, TypeScript e Tailwind CSS. O projeto preserva o site público existente e acrescenta solicitações de orçamento persistidas no Supabase, protocolos gerados pelo PostgreSQL, anexos privados, consulta pública protegida e área administrativa.

## Requisitos

- Node.js 20 ou superior
- pnpm 10
- Supabase CLI para aplicar migrations
- Um projeto Supabase existente (não é necessário criar outro)

Instalação e execução local:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Verificações:

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e configure:

```env
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com.br
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY=
```

Projetos Supabase que ainda utilizam as chaves legadas também são aceitos por meio de `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`. Prefira as chaves publishable e secret atuais.

Somente as variáveis iniciadas por `NEXT_PUBLIC_` podem chegar ao navegador. `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` são exclusivamente de servidor e nunca devem ser commitidas. `.env.local` já está ignorado pelo Git.

## Banco de dados e migrations

Todas as alterações do banco estão versionadas em `supabase/migrations`. Para aplicar no projeto já existente:

```bash
pnpm dlx supabase login
pnpm dlx supabase link --project-ref SEU_PROJECT_REF
pnpm dlx supabase db push
```

As migrations criam:

- `quote_requests`: solicitações, dados normalizados, idempotência e protocolo;
- `quote_request_status_history`: histórico público seguro de mudanças de status;
- `quote_request_notes`: notas internas dos administradores;
- `quote_request_attachments`: metadados dos anexos privados;
- `admin_users`: autorização administrativa vinculada ao Supabase Auth;
- bucket privado `quote-attachments` no Supabase Storage.

O protocolo é criado atomicamente no PostgreSQL no formato `MN-AAAA-000001`. A parte numérica usa uma identidade monotônica, portanto não depende de contagem de linhas e não é reutilizada após exclusão. O protocolo definitivo só é devolvido ao navegador depois que a solicitação e seus anexos são confirmados.

## Segurança, RLS e Storage

Todas as tabelas do schema `public` têm Row Level Security habilitado. Usuários anônimos não recebem permissão para listar solicitações, históricos, notas, anexos ou administradores. A submissão pública e a consulta de protocolo passam por Route Handlers validados no servidor.

Administradores precisam de uma sessão válida do Supabase Auth e de um registro ativo em `admin_users`. Os anexos ficam em bucket privado; somente a área administrativa pode solicitar URLs assinadas de curta duração. A consulta pública nunca retorna dados pessoais completos, notas internas, IDs ou URLs de anexos.

O limitador incluído é uma proteção local por instância e oferece um ponto de integração. Em produção distribuída, configure um armazenamento compartilhado de rate limit, como Redis ou serviço equivalente; não trate memória local como limitação global.

Após aplicar migrations, execute os Security e Performance Advisors no painel Supabase. Avisos relevantes de segurança devem ser resolvidos antes de cada publicação.

## Criar o primeiro administrador com segurança

Não existe senha padrão no repositório.

1. No painel Supabase, abra **Authentication → Users** e crie o usuário com e-mail e uma senha forte.
2. Copie o UUID desse usuário.
3. No SQL Editor, execute, substituindo o UUID:

```sql
insert into public.admin_users (user_id, role, active)
values ('UUID_DO_USUARIO', 'administrador', true);
```

4. Acesse `/admin/login` e autentique-se.

Papéis disponíveis: `administrador`, `comercial` e `tecnico`. Somente `administrador` pode arquivar uma solicitação. A autorização usa a tabela controlada pelo servidor, não `user_metadata` editável pelo cliente.

## Solicitações e protocolos

O formulário público envia dados e arquivos para `/api/quote-requests`, onde eles são novamente validados e normalizados. Há consentimento LGPD obrigatório, honeypot, token de idempotência e prevenção de duplo envio. São aceitos até seis arquivos JPG, JPEG, PNG, WEBP ou PDF, com até 8 MB cada.

Depois da confirmação no banco, a tela de sucesso exibe o protocolo real, data, serviço e atalhos para acompanhamento e WhatsApp.

Em `/consultar-protocolo`, o cliente informa protocolo e e-mail. A comparação ocorre no servidor com valores normalizados e resposta genérica em caso de erro. A resposta contém apenas serviço, datas, status público e mensagens públicas do histórico.

## Área administrativa

As rotas `/admin`, `/admin/solicitacoes` e `/admin/solicitacoes/[id]` são protegidas no servidor e não aparecem na navegação pública. A área oferece dashboard, filtros e paginação no servidor, visualização responsiva, mudança validada de status, histórico, notas internas e downloads por URL assinada.

Status disponíveis: Recebido, Em análise, Contato realizado, Aguardando cliente, Visita agendada, Proposta enviada, Em execução, Concluído e Cancelado.

Cada alteração cria uma linha de histórico com o administrador responsável. Mensagens públicas e notas internas são armazenadas separadamente.

## Google Maps

Sem `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`, a página de contato mostra um cartão de localização completo com links seguros para o Google Maps, sem iframe quebrado.

Para habilitar o mapa interativo:

1. Ative a **Maps Embed API** no Google Cloud.
2. Crie uma chave de API.
3. Restrinja a chave por **HTTP referrer** aos domínios de produção e desenvolvimento necessários.
4. Restrinja a chave à **Maps Embed API**.
5. Configure `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` no ambiente de deploy.

Não coloque a chave diretamente no código.

## Deploy

O build mantém a compatibilidade com Vinext/Sites: páginas públicas estáticas são servidas rapidamente e rotas dinâmicas de API/admin são encaminhadas ao runtime do servidor.

### Preview na Vercel

O repositório também está preparado para um deploy nativo do Next.js na Vercel. O arquivo `vercel.json` seleciona o framework Next.js e executa `pnpm run build:vercel`, sem alterar o comando `pnpm build` usado pelo empacotamento Vinext/Sites.

1. Importe o repositório `yanbrandao6/micronativa-site` no painel da Vercel.
2. Mantenha o diretório raiz como `.` e o preset de framework como **Next.js**.
3. Em **Environment Variables**, cadastre todas as variáveis de `.env.example` nos ambientes **Production** e **Preview**.
4. Nunca copie o arquivo `.env.local` para o GitHub. Cadastre `SUPABASE_SECRET_KEY` somente no painel da Vercel.
5. Faça o primeiro deploy e copie a URL `https://...vercel.app` gerada.
6. Atualize `NEXT_PUBLIC_SITE_URL` com essa URL e solicite um novo deploy para corrigir metadados, sitemap e links absolutos.

O mapa funciona com o cartão de fallback quando `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` não estiver configurada. Para habilitar o iframe, cadastre a chave na Vercel e restrinja-a também ao domínio `*.vercel.app` usado na demonstração.

Antes do deploy:

1. Aplique todas as migrations no projeto Supabase correto.
2. Configure todas as variáveis de ambiente no provedor, incluindo a chave secreta somente no servidor.
3. Crie ao menos um administrador.
4. Execute `pnpm typecheck`, `pnpm test` e `pnpm build`.
5. Valide uma submissão, consulta, mudança de status, nota e anexo em ambiente de homologação.

Em hospedagens Node.js convencionais, use o comando de build do provedor e disponibilize as variáveis no processo do servidor. Hospedagem puramente estática não suporta as Route Handlers e a área administrativa desta aplicação.

## Estrutura principal

- `src/config/company.ts`: dados centralizados da empresa;
- `src/config/quoteStatuses.ts`: status, rótulos, cores e transições;
- `src/lib/supabase/`: clientes de navegador, servidor e servidor privilegiado;
- `src/lib/validation/`: validação tipada de dados e anexos;
- `src/app/api/`: submissão, consulta e ações administrativas;
- `src/app/admin/`: login, dashboard, listagem e detalhes;
- `src/app/consultar-protocolo/`: acompanhamento público;
- `supabase/migrations/`: schema, RLS, funções e Storage versionados;
- `src/types/database.ts`: tipos gerados do banco Supabase.

## Privacidade

Não envie dados pessoais para analytics ou logs de cliente. Revise a política de privacidade e os processos internos de retenção antes da operação definitiva. Alterações no tratamento de dados, contatos ou área atendida devem ser centralizadas nas configurações e documentadas.
