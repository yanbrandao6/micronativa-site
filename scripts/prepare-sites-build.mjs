import { cpSync, existsSync, mkdirSync } from "node:fs";
if (!existsSync("dist/server/index.js")) throw new Error("Vinext n?o gerou dist/server/index.js");
mkdirSync("dist/.openai", { recursive: true });
cpSync(".openai/hosting.json", "dist/.openai/hosting.json");
