import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const vinextEntry = "dist/server/index.js";
if (!existsSync(vinextEntry)) {
  throw new Error("Vinext nao gerou dist/server/index.js");
}

const moduleUrl = pathToFileURL(vinextEntry).href + `?build=${Date.now()}`;
const runtimeModule = await import(moduleUrl);
const runtime = runtimeModule.default;
const fetchHandler = runtime.fetch?.bind(runtime) ?? runtime;

const pageRoutes = [
  "/",
  "/solucoes",
  "/energia-solar",
  "/cftv-seguranca",
  "/automacao-portoes",
  "/controle-acesso",
  "/projetos",
  "/projetos/sistema-fotovoltaico-residencial",
  "/projetos/cftv-estabelecimento-comercial",
  "/projetos/automacao-portao-residencial",
  "/projetos/controle-acesso-condominio",
  "/projetos/projeto-integrado-empresa",
  "/sobre",
  "/contato",
  "/politica-de-privacidade",
  "/orcamento",
];

const navigationGuard = String.raw`<script>document.addEventListener("click",function(event){var anchor=event.target.closest&&event.target.closest("a[href]");if(!anchor||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||anchor.target==="_blank"||anchor.hasAttribute("download"))return;var href=anchor.getAttribute("href");if(!href||href.charAt(0)==="#")return;var target=new URL(anchor.href,location.href);if(target.origin!==location.origin)return;if(target.pathname===location.pathname&&target.search===location.search&&target.hash)return;event.preventDefault();event.stopImmediatePropagation();location.assign(target.href)},true)</script>`;

const responses = {};
for (const route of pageRoutes) {
  const response = await fetchHandler(new Request(`http://localhost${route}`));
  if (response.status !== 200) throw new Error(`Falha ao pre-renderizar ${route}: ${response.status}`);
  let body = await response.text();
  body = body.replace("</body>", `${navigationGuard}</body>`);
  responses[route] = { body, contentType: "text/html; charset=utf-8", status: 200 };
}

for (const route of ["/robots.txt", "/sitemap.xml"]) {
  const response = await fetchHandler(new Request(`http://localhost${route}`));
  responses[route] = {
    body: await response.text(),
    contentType: response.headers.get("content-type") ?? "text/plain; charset=utf-8",
    status: response.status,
  };
}

const notFoundResponse = await fetchHandler(new Request("http://localhost/pagina-nao-encontrada"));
let notFoundBody = await notFoundResponse.text();
notFoundBody = notFoundBody.replace("</body>", `${navigationGuard}</body>`);

const workerSource = `import runtime from "./server/index.js";\nconst responses=${JSON.stringify(responses)};\nconst fallback=${JSON.stringify({
  body: notFoundBody,
  contentType: "text/html; charset=utf-8",
  status: 404,
})};\nconst dynamicFetch=runtime.fetch?.bind(runtime)??runtime;\nexport default {async fetch(request,env,ctx){const url=new URL(request.url);const path=url.pathname!=="/"?url.pathname.replace(/\\/$/,""):"/";const item=responses[path];if((request.method==="GET"||request.method==="HEAD")&&item){const headers=new Headers({"content-type":item.contentType,"x-content-type-options":"nosniff","cache-control":"public, max-age=60"});return request.method==="HEAD"?new Response(null,{status:item.status,headers}):new Response(item.body,{status:item.status,headers})}return dynamicFetch(request,env,ctx)}};\n`;

writeFileSync("dist/index.js", workerSource, "utf8");
mkdirSync("dist/.openai", { recursive: true });
cpSync(".openai/hosting.json", "dist/.openai/hosting.json");
