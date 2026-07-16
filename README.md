# Micronativa ? site institucional

Site institucional em Next.js App Router, TypeScript e Tailwind CSS para energia solar, CFTV, automa??o de port?es e controle de acesso.

## Executar localmente

1. Instale Node.js 20 ou superior.
2. Execute `npm install`.
3. Inicie com `npm run dev`.
4. Acesse `http://localhost:3000`.

Valida??o de tipos: `npm run typecheck`  
Build de produ??o: `npm run build`  
Servidor do build: `npm start`

## Conte?do edit?vel

- Empresa, telefone, WhatsApp, e-mail, endere?o, ?rea atendida e redes: `src/config/company.ts`
- Servi?os e conte?do das p?ginas: `src/data/services.ts`
- Projetos e estudos de caso: `src/data/projects.ts`
- Imagens do portf?lio: `public/projects/`
- Op??es e limites do or?amento: `src/features/quote-request/data/quoteOptions.ts`

Todos os contatos, n?meros, depoimentos, estat?sticas, certifica??es e casos atuais s?o placeholders claramente identificados. Substitua-os por dados reais e autorizados antes da divulga??o.

## Formul?rios e backend

A primeira fase usa um adaptador demonstrativo em `src/services/quoteRequestService.ts`. Ele n?o armazena dados. Para produ??o, substitua-o por uma API REST ou Server Action e implemente:

- valida??o equivalente no servidor;
- banco de dados e/ou envio transacional de e-mail;
- integra??o com CRM, se desejada;
- rate limiting, antispam e sanitiza??o;
- armazenamento privado de anexos;
- logs sem dados pessoais sens?veis.

O formul?rio de contato tamb?m est? explicitamente marcado como demonstrativo.

## WhatsApp e analytics

Mensagens contextuais e URLs ficam em `src/lib/whatsapp.ts`. O n?mero vem do arquivo central da empresa. Eventos an?nimos passam por `src/lib/analytics.ts`, pronto para GA, GTM, Meta Pixel ou outro provedor. N?o envie dados pessoais nesses eventos.

## SEO e privacidade

Metadados ficam nas pr?prias rotas e no utilit?rio `src/lib/metadata.ts`. Atualize `NEXT_PUBLIC_SITE_URL` e revise o schema LocalBusiness. A pol?tica de privacidade ? um modelo inicial e precisa de revis?o jur?dica.

## Deploy na Vercel

1. Envie o reposit?rio a um provedor Git.
2. Importe o projeto na Vercel.
3. Configure `NEXT_PUBLIC_SITE_URL` com o dom?nio final.
4. Use `npm run build` como comando de build.
5. Revise os placeholders antes de publicar.

## Extens?es futuras

A arquitetura separa conte?do, configura??o, analytics, WhatsApp e submiss?o. Assim, pode receber futuramente CMS, CRM, banco de dados, arquivos em nuvem, agendamento, simulador solar, portal do cliente, PWA e chamados de manuten??o sem reescrever a interface atual. Nenhum desses recursos futuros aparece como bot?o inacabado.
