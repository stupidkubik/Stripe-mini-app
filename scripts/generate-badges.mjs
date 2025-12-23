import fs from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (flag, fallback) => {
  const index = args.indexOf(flag);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
};

const unitStatus = getArg("--unit-status", "success");
const e2eStatus = getArg("--e2e-status", "success");
const coverageFile = getArg(
  "--coverage-file",
  path.resolve("coverage", "coverage-summary.json"),
);
const outputDir = getArg("--out-dir", path.resolve("badges"));
const hasE2eFlag = args.includes("--e2e-status");

const escapeHtml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const textWidth = (text) => Math.max(30, text.length * 6 + 10);

const makeBadge = ({ label, message, color }) => {
  const safeLabel = escapeHtml(label);
  const safeMessage = escapeHtml(message);
  const labelWidth = textWidth(safeLabel);
  const messageWidth = textWidth(safeMessage);
  const totalWidth = labelWidth + messageWidth;

  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${safeLabel}: ${safeMessage}">\n  <linearGradient id="s" x2="0" y2="100%">\n    <stop offset="0" stop-color="#fff" stop-opacity=".7"/>\n    <stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>\n    <stop offset=".9" stop-color="#000" stop-opacity=".3"/>\n    <stop offset="1" stop-color="#000" stop-opacity=".5"/>\n  </linearGradient>\n  <mask id="m">\n    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>\n  </mask>\n  <g mask="url(#m)">\n    <rect width="${labelWidth}" height="20" fill="#555"/>\n    <rect x="${labelWidth}" width="${messageWidth}" height="20" fill="#${color}"/>\n    <rect width="${totalWidth}" height="20" fill="url(#s)"/>\n  </g>\n  <g fill="#fff" text-anchor="middle" font-family="Verdana,DejaVu Sans,sans-serif" font-size="11">\n    <text x="${labelWidth / 2}" y="14">${safeLabel}</text>\n    <text x="${labelWidth + messageWidth / 2}" y="14">${safeMessage}</text>\n  </g>\n</svg>\n`;
};

const statusBadge = (label, statusValue) => {
  const status = statusValue.toLowerCase();
  if (status === "success") {
    return { label, message: "passing", color: "22c55e" };
  }
  if (status === "failure") {
    return { label, message: "failing", color: "ef4444" };
  }
  if (status === "cancelled") {
    return { label, message: "cancelled", color: "9ca3af" };
  }
  return { label, message: "unknown", color: "9ca3af" };
};

const unitBadge = statusBadge("unit tests", unitStatus);
const e2eBadge = statusBadge("e2e tests", e2eStatus);

const coverageBadge = async () => {
  try {
    const raw = await fs.readFile(coverageFile, "utf8");
    const summary = JSON.parse(raw);
    const pct = summary?.total?.lines?.pct;
    if (typeof pct === "number") {
      const rounded = Math.round(pct * 100) / 100;
      const message = `${rounded.toFixed(2)}%`;
      const color =
        rounded >= 90
          ? "22c55e"
          : rounded >= 80
            ? "84cc16"
            : rounded >= 70
              ? "f59e0b"
              : rounded >= 60
                ? "f97316"
                : "ef4444";
      return { label: "coverage", message, color };
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.warn("Failed to read coverage summary:", error);
    }
  }
  return { label: "coverage", message: "n/a", color: "9ca3af" };
};

await fs.mkdir(outputDir, { recursive: true });

if (!hasE2eFlag) {
  const unitPath = path.join(outputDir, "unit-tests.svg");
  const coveragePath = path.join(outputDir, "coverage.svg");

  await fs.writeFile(unitPath, makeBadge(unitBadge));
  await fs.writeFile(coveragePath, makeBadge(await coverageBadge()));
}

if (hasE2eFlag) {
  const e2ePath = path.join(outputDir, "e2e-tests.svg");
  await fs.writeFile(e2ePath, makeBadge(e2eBadge));
}

console.log(`Badges written to ${outputDir}`);
