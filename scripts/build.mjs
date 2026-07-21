import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const isProductionDeployment =
  process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";
const catalogueSource =
  (process.argv.includes("--stripe") ? "stripe" : undefined) ??
  process.env.CATALOGUE_SOURCE ??
  (isProductionDeployment ? "stripe" : "fixture");

const nextBin = new URL("../node_modules/next/dist/bin/next", import.meta.url);
const child = spawn(
  process.execPath,
  [fileURLToPath(nextBin), "build", "--turbopack"],
  {
    stdio: "inherit",
    env: { ...process.env, CATALOGUE_SOURCE: catalogueSource },
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});
