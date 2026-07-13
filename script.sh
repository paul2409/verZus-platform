#!/usr/bin/env bash
set -euo pipefail

echo "VERZUS M4 localhost route review installer"
echo "No branch will be created or changed."
echo

TARGET="scripts/m4-visual-review.mjs"
DOC_FILE="docs/milestones/M4/m4-localhost-route-review.md"
PACKAGE_FILE="package.json"

if [[ ! -f "$PACKAGE_FILE" ]] || [[ ! -d "src/app" ]]; then
  echo "Error: run this script from the VERZUS repository root."
  exit 1
fi

if [[ -f "$TARGET" ]] && ! grep -q "VERZUS M4 VISUAL REVIEW DASHBOARD" "$TARGET"; then
  echo "Error: refusing to replace an unrecognized visual-review script: $TARGET"
  exit 1
fi

mkdir -p scripts docs/milestones/M4 reports/m4-visual-review

cat > "$TARGET" <<'EOF'
// VERZUS M4 VISUAL REVIEW DASHBOARD

import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const appDirectory = path.join(root, "src", "app");
const reportDirectory = path.join(
  root,
  "reports",
  "m4-visual-review",
);
const manifestFile = path.join(
  reportDirectory,
  "manifest.json",
);
const scanOnly = process.argv.includes("--scan-only");

const preferredAppPort = Number(
  process.env.M4_APP_PORT ?? "3104",
);
const preferredDashboardPort = Number(
  process.env.M4_DASHBOARD_PORT ?? "3105",
);
const bindHost = "127.0.0.1";

const requiredScreens = [
  {
    group: "Authentication",
    name: "Login",
    route: "/login",
    required: true,
  },
  {
    group: "Authentication",
    name: "Register",
    route: "/register",
    required: true,
  },
  {
    group: "Authentication",
    name: "Email verification",
    route: "/verify-email",
    required: true,
  },
  {
    group: "Authentication",
    name: "Forgot password",
    route: "/forgot-password",
    required: true,
  },
  {
    group: "Authentication",
    name: "Reset password",
    route: "/reset-password",
    required: true,
  },
  {
    group: "Authentication",
    name: "Session expired",
    route: "/session-expired",
    required: true,
  },
  {
    group: "Account restrictions",
    name: "Suspended account",
    route: "/account/suspended",
    required: true,
  },
  {
    group: "Account restrictions",
    name: "Banned account",
    route: "/account/banned",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Onboarding welcome",
    route: "/onboarding",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Choose games",
    route: "/onboarding/games",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Select location",
    route: "/onboarding/location",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Create player identity",
    route: "/onboarding/identity",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Set availability",
    route: "/onboarding/availability",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Join or skip Crew",
    route: "/onboarding/crew",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Onboarding complete",
    route: "/onboarding/complete",
    required: true,
  },
  {
    group: "Flow destination",
    name: "Play",
    route: "/play",
    required: false,
  },
];

const pageFilePattern = /^page\.(?:js|jsx|ts|tsx|mdx)$/;
const routeFilePattern = /^route\.(?:js|jsx|ts|tsx)$/;

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const files = [];

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function isInvisibleRouteSegment(segment) {
  return (
    (segment.startsWith("(") &&
      segment.endsWith(")")) ||
    segment.startsWith("@") ||
    segment.startsWith("_")
  );
}

function appFileToRoute(filePath) {
  const relative = path.relative(appDirectory, filePath);
  const segments = relative.split(path.sep);
  const fileName = segments.pop();

  if (
    !fileName ||
    (!pageFilePattern.test(fileName) &&
      !routeFilePattern.test(fileName))
  ) {
    return null;
  }

  const visibleSegments = segments.filter(
    (segment) => !isInvisibleRouteSegment(segment),
  );

  return visibleSegments.length === 0
    ? "/"
    : `/${visibleSegments.join("/")}`;
}

function discoverRoutes() {
  const pages = new Map();
  const apiRoutes = new Map();
  const duplicatePages = [];

  for (const filePath of walk(appDirectory)) {
    const fileName = path.basename(filePath);
    const route = appFileToRoute(filePath);

    if (!route) {
      continue;
    }

    const relativeFile = normalizePath(
      path.relative(root, filePath),
    );

    if (pageFilePattern.test(fileName)) {
      if (pages.has(route)) {
        duplicatePages.push({
          route,
          files: [pages.get(route), relativeFile],
        });
      } else {
        pages.set(route, relativeFile);
      }
    }

    if (
      routeFilePattern.test(fileName) &&
      route.startsWith("/api/")
    ) {
      const source = fs.readFileSync(filePath, "utf8");
      const methods = new Set();
      const methodPattern =
        /export\s+(?:async\s+)?(?:function|const)\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/g;
      let match;

      while ((match = methodPattern.exec(source))) {
        methods.add(match[1]);
      }

      apiRoutes.set(route, {
        file: relativeFile,
        methods: [...methods].sort(),
      });
    }
  }

  return {
    pages,
    apiRoutes,
    duplicatePages,
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sleep(milliseconds) {
  return new Promise((resolve) =>
    setTimeout(resolve, milliseconds),
  );
}

function requestStatus(url) {
  return new Promise((resolve) => {
    const request = http.get(
      url,
      {
        headers: {
          "user-agent":
            "VERZUS-M4-Localhost-Review/2.0",
        },
      },
      (response) => {
        response.resume();
        resolve({
          status: response.statusCode ?? null,
          location:
            typeof response.headers.location === "string"
              ? response.headers.location
              : null,
        });
      },
    );

    request.on("error", () => {
      resolve({
        status: null,
        location: null,
      });
    });

    request.setTimeout(4000, () => {
      request.destroy();
      resolve({
        status: null,
        location: null,
      });
    });
  });
}

function canBind(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, bindHost);
  });
}

async function findAvailablePort(start, excluded = []) {
  for (let port = start; port < start + 30; port += 1) {
    if (excluded.includes(port)) {
      continue;
    }

    if (await canBind(port)) {
      return port;
    }
  }

  throw new Error(
    `No available localhost port found from ${start}.`,
  );
}

async function isVerzusServer(baseUrl) {
  const login = await requestStatus(`${baseUrl}/login`);
  return (
    login.status !== null &&
    login.status !== 404
  );
}

async function waitForVerzusServer(
  baseUrl,
  childState,
) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (childState.exited) {
      return false;
    }

    if (await isVerzusServer(baseUrl)) {
      return true;
    }

    await sleep(1000);
  }

  return false;
}

function openBrowser(url) {
  try {
    let opener;

    if (process.platform === "win32") {
      opener = spawn(
        process.env.ComSpec ?? "cmd.exe",
        ["/d", "/s", "/c", "start", "", url],
        {
          detached: true,
          stdio: "ignore",
          windowsHide: true,
        },
      );
    } else if (process.platform === "darwin") {
      opener = spawn("open", [url], {
        detached: true,
        stdio: "ignore",
      });
    } else {
      opener = spawn("xdg-open", [url], {
        detached: true,
        stdio: "ignore",
      });
    }

    opener.unref();
  } catch {
    console.log(
      `Open this URL manually: ${url}`,
    );
  }
}

function statusDescriptor(screen) {
  if (!screen.file) {
    return {
      tone: "missing",
      label: "Screen route not built",
    };
  }

  if (screen.status === null) {
    return {
      tone: "warning",
      label: "No server response",
    };
  }

  if (
    screen.status >= 300 &&
    screen.status < 400
  ) {
    return {
      tone: "redirect",
      label: screen.location
        ? `Redirects to ${screen.location}`
        : `Redirect ${screen.status}`,
    };
  }

  if (screen.status === 404) {
    return {
      tone: "missing",
      label: "404 Not Found",
    };
  }

  if (
    screen.status >= 200 &&
    screen.status < 300
  ) {
    return {
      tone: "ready",
      label: `Available (${screen.status})`,
    };
  }

  return {
    tone: "warning",
    label: `HTTP ${screen.status}`,
  };
}

function createDashboardHtml({
  screens,
  apiRoutes,
  appBaseUrl,
  dashboardUrl,
  duplicatePages,
}) {
  const required = screens.filter(
    (screen) => screen.required,
  );
  const found = required.filter(
    (screen) => Boolean(screen.file),
  );
  const missing = required.filter(
    (screen) => !screen.file,
  );
  const groups = [
    ...new Set(screens.map((screen) => screen.group)),
  ];

  const quickLinks = found
    .map(
      (screen) => `
        <a class="quick-link" href="${escapeHtml(
          `${appBaseUrl}${screen.route}`,
        )}" target="_blank" rel="noreferrer">
          <span>${escapeHtml(screen.name)}</span>
          <code>${escapeHtml(screen.route)}</code>
        </a>
      `,
    )
    .join("");

  const groupMarkup = groups
    .map((group) => {
      const cards = screens
        .filter((screen) => screen.group === group)
        .map((screen, index) => {
          const status = statusDescriptor(screen);
          const frameId = `frame-${group
            .toLowerCase()
            .replaceAll(/[^a-z0-9]+/g, "-")}-${index}`;

          const body = screen.file
            ? `
              <div class="preview-shell" data-width="390">
                <div class="preview-stage">
                  <iframe
                    id="${frameId}"
                    title="${escapeHtml(screen.name)}"
                    src="${escapeHtml(
                      `${appBaseUrl}${screen.route}`,
                    )}"
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            `
            : `
              <div class="missing-panel">
                <strong>Not built yet</strong>
                <span>No App Router page currently resolves to ${escapeHtml(
                  screen.route,
                )}.</span>
              </div>
            `;

          return `
            <article class="screen-card">
              <header class="screen-header">
                <div>
                  <span class="eyebrow">${escapeHtml(
                    group,
                  )}</span>
                  <h3>${escapeHtml(screen.name)}</h3>
                  <code>${escapeHtml(screen.route)}</code>
                </div>
                <span class="status ${status.tone}">${escapeHtml(
                  status.label,
                )}</span>
              </header>

              <div class="toolbar">
                ${[360, 390, 430, 768, 1024, 1440]
                  .map(
                    (width) => `
                      <button
                        type="button"
                        data-target="${frameId}"
                        data-width="${width}"
                        ${screen.file ? "" : "disabled"}
                      >
                        ${width}
                      </button>
                    `,
                  )
                  .join("")}
                ${
                  screen.file
                    ? `
                      <a
                        href="${escapeHtml(
                          `${appBaseUrl}${screen.route}`,
                        )}"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open route
                      </a>
                    `
                    : ""
                }
              </div>

              ${body}

              <footer class="screen-footer">
                <span>Source</span>
                <code>${escapeHtml(
                  screen.file ?? "No route file discovered",
                )}</code>
              </footer>
            </article>
          `;
        })
        .join("");

      return `
        <section class="review-group">
          <div class="group-heading">
            <h2>${escapeHtml(group)}</h2>
            <span>${screens.filter((screen) => screen.group === group).length} routes</span>
          </div>
          <div class="screen-grid">${cards}</div>
        </section>
      `;
    })
    .join("");

  const apiMarkup = apiRoutes
    .map(
      (api) => `
        <tr>
          <td><code>${escapeHtml(api.route)}</code></td>
          <td>${escapeHtml(
            api.methods.length > 0
              ? api.methods.join(", ")
              : "Detected route handler",
          )}</td>
          <td><code>${escapeHtml(api.file)}</code></td>
        </tr>
      `,
    )
    .join("");

  const duplicateNotice =
    duplicatePages.length === 0
      ? ""
      : `
        <div class="notice danger">
          Duplicate page routes were detected. Review manifest.json before relying on those entries.
        </div>
      `;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>VERZUS M4 Localhost Route Review</title>
  <style>
    :root {
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #050815;
      color: #f7f8fc;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at top right, rgba(0, 245, 212, 0.10), transparent 32rem),
        #050815;
    }
    a { color: inherit; }
    code { color: #a9bbdf; overflow-wrap: anywhere; }
    .page { width: min(1880px, 100%); margin: 0 auto; padding: 32px; }
    .hero {
      display: grid;
      gap: 20px;
      padding: 28px;
      border: 1px solid #263250;
      border-radius: 22px;
      background: rgba(11, 17, 36, 0.96);
      box-shadow: 0 28px 90px rgba(0, 0, 0, 0.34);
    }
    .eyebrow {
      color: #00f5d4;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.13em;
      text-transform: uppercase;
    }
    h1, h2, h3, p { margin-top: 0; }
    h1 { margin-bottom: 0; font-size: clamp(34px, 5vw, 62px); letter-spacing: -0.05em; }
    .hero p { margin-bottom: 0; max-width: 980px; color: #aab6d1; line-height: 1.65; }
    .urls { display: flex; flex-wrap: wrap; gap: 12px; }
    .url-card, .summary-card {
      padding: 16px 18px;
      border: 1px solid #2a3554;
      border-radius: 14px;
      background: #0a1022;
    }
    .url-card span, .summary-card span { display: block; color: #94a1bf; font-size: 12px; }
    .url-card strong, .summary-card strong { display: block; margin-top: 5px; color: #00f5d4; }
    .summary { display: flex; flex-wrap: wrap; gap: 12px; }
    .summary-card strong { font-size: 28px; }
    .notice {
      padding: 14px 16px;
      border-left: 4px solid #f9c74f;
      background: rgba(249, 199, 79, 0.08);
      color: #f4d98a;
      line-height: 1.55;
    }
    .notice.danger { border-left-color: #ff5d7a; color: #ff9cb0; }
    .quick-section, .api-section, .review-group { margin-top: 42px; }
    .quick-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }
    .quick-link {
      display: grid;
      gap: 5px;
      padding: 15px;
      border: 1px solid #263250;
      border-radius: 13px;
      background: #0a1022;
      text-decoration: none;
    }
    .quick-link:hover { border-color: #00f5d4; }
    .group-heading { display: flex; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: 16px; }
    .group-heading h2 { margin-bottom: 0; }
    .group-heading span { color: #8794b2; }
    .screen-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 470px), 1fr));
      gap: 22px;
    }
    .screen-card { min-width: 0; overflow: hidden; border: 1px solid #263250; border-radius: 18px; background: #0a1022; }
    .screen-header, .screen-footer { display: flex; justify-content: space-between; gap: 16px; padding: 18px; }
    .screen-header { border-bottom: 1px solid #202a45; }
    .screen-header h3 { margin: 4px 0 6px; font-size: 20px; }
    .status { align-self: flex-start; flex: 0 0 auto; padding: 7px 10px; border-radius: 999px; font-size: 11px; font-weight: 900; }
    .status.ready { background: rgba(64, 211, 137, 0.14); color: #78efae; }
    .status.redirect { background: rgba(84, 160, 255, 0.14); color: #98c6ff; }
    .status.warning { background: rgba(249, 199, 79, 0.14); color: #f9dc86; }
    .status.missing { background: rgba(255, 82, 115, 0.15); color: #ff91a8; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 18px; border-bottom: 1px solid #202a45; background: #070c1b; }
    .toolbar button, .toolbar a {
      min-height: 36px;
      padding: 8px 11px;
      border: 1px solid #354365;
      border-radius: 9px;
      background: #111a32;
      color: #dce6ff;
      font: inherit;
      font-size: 12px;
      font-weight: 800;
      text-decoration: none;
      cursor: pointer;
    }
    .toolbar button:hover, .toolbar a:hover { border-color: #00f5d4; }
    .toolbar button:disabled { cursor: not-allowed; opacity: 0.36; }
    .preview-shell {
      height: 720px;
      overflow: auto;
      padding: 18px;
      background: #050816;
    }
    .preview-stage { display: flex; justify-content: center; min-width: max-content; }
    iframe {
      width: 390px;
      height: 844px;
      border: 1px solid #3b496c;
      border-radius: 14px;
      background: white;
      transform-origin: top center;
    }
    .missing-panel { display: grid; place-items: center; gap: 10px; min-height: 360px; padding: 30px; color: #ff91a8; text-align: center; background: #050816; }
    .missing-panel span { max-width: 390px; color: #96a4c2; }
    .screen-footer { border-top: 1px solid #202a45; color: #7f8dab; font-size: 12px; }
    .api-wrap { overflow-x: auto; border: 1px solid #263250; border-radius: 16px; }
    table { width: 100%; border-collapse: collapse; background: #0a1022; }
    th, td { padding: 14px 16px; border-bottom: 1px solid #202a45; text-align: left; vertical-align: top; }
    th { color: #00f5d4; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
    tr:last-child td { border-bottom: 0; }
    @media (max-width: 680px) {
      .page { padding: 16px; }
      .hero { padding: 20px; }
      .screen-header, .screen-footer { display: grid; }
      .preview-shell { height: 640px; padding: 10px; }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <span class="eyebrow">VERZUS M4</span>
      <h1>Localhost route review</h1>
      <p>
        This dashboard scans the real Next.js App Router tree. Route groups such as
        <code>(auth)</code> and <code>(platform)</code> are removed when resolving URLs,
        so existing authentication screens are no longer reported as missing.
      </p>
      <div class="urls">
        <div class="url-card"><span>Review dashboard</span><strong>${escapeHtml(
          dashboardUrl,
        )}</strong></div>
        <div class="url-card"><span>VERZUS application</span><strong>${escapeHtml(
          appBaseUrl,
        )}</strong></div>
      </div>
      <div class="summary">
        <div class="summary-card"><strong>${required.length}</strong><span>Required M4 screens</span></div>
        <div class="summary-card"><strong>${found.length}</strong><span>Route screens found</span></div>
        <div class="summary-card"><strong>${missing.length}</strong><span>Route screens missing</span></div>
      </div>
      <div class="notice">
        Protected routes may redirect because the browser does not have the matching mock-session cookie.
        Use the status label and the discovered source path to distinguish a real route from a missing screen.
      </div>
      ${duplicateNotice}
    </section>

    <section class="quick-section">
      <div class="group-heading"><h2>Built M4 screen routes</h2><span>Open in a full browser tab</span></div>
      <div class="quick-grid">${quickLinks}</div>
    </section>

    ${groupMarkup}

    <section class="api-section">
      <div class="group-heading"><h2>M4 API routes</h2><span>${apiRoutes.length} discovered handlers</span></div>
      <div class="api-wrap">
        <table>
          <thead><tr><th>Route</th><th>Methods</th><th>Source</th></tr></thead>
          <tbody>${apiMarkup}</tbody>
        </table>
      </div>
    </section>
  </main>

  <script>
    function applyViewport(frame, requestedWidth) {
      const shell = frame.closest(".preview-shell");
      const stage = frame.closest(".preview-stage");
      const available = Math.max(280, shell.clientWidth - 36);
      const requestedHeight = requestedWidth <= 430 ? 844 : 1000;
      const scale = Math.min(1, available / requestedWidth);

      frame.style.width = requestedWidth + "px";
      frame.style.height = requestedHeight + "px";
      frame.style.transform = "scale(" + scale + ")";
      stage.style.height = Math.ceil(requestedHeight * scale) + "px";
      shell.dataset.width = String(requestedWidth);
    }

    for (const button of document.querySelectorAll("button[data-target][data-width]")) {
      button.addEventListener("click", () => {
        const frame = document.getElementById(button.dataset.target);
        if (frame) applyViewport(frame, Number(button.dataset.width));
      });
    }

    for (const frame of document.querySelectorAll("iframe")) {
      applyViewport(frame, 390);
    }

    window.addEventListener("resize", () => {
      for (const shell of document.querySelectorAll(".preview-shell")) {
        const frame = shell.querySelector("iframe");
        if (frame) applyViewport(frame, Number(shell.dataset.width || "390"));
      }
    });
  </script>
</body>
</html>`;
}

function isM4ApiRoute(route) {
  return (
    route.startsWith("/api/auth/") ||
    route === "/api/me" ||
    route.startsWith("/api/onboarding/")
  );
}

const discovery = discoverRoutes();
const initialScreens = requiredScreens.map((screen) => ({
  ...screen,
  file: discovery.pages.get(screen.route) ?? null,
}));
const m4ApiRoutes = [...discovery.apiRoutes.entries()]
  .filter(([route]) => isM4ApiRoute(route))
  .map(([route, details]) => ({
    route,
    ...details,
  }))
  .sort((left, right) =>
    left.route.localeCompare(right.route),
  );

if (scanOnly) {
  const found = initialScreens.filter(
    (screen) => screen.required && screen.file,
  );
  const missing = initialScreens.filter(
    (screen) => screen.required && !screen.file,
  );

  console.log("\nM4 screen route discovery");
  console.log("=========================");

  for (const screen of initialScreens) {
    console.log(
      `${screen.file ? "FOUND  " : "MISSING"} ${screen.route} ${screen.file ?? ""}`,
    );
  }

  console.log(
    `\nRequired screens: ${found.length} found, ${missing.length} missing.`,
  );
  console.log(`M4 API handlers: ${m4ApiRoutes.length}.`);

  if (discovery.duplicatePages.length > 0) {
    console.log("\nDuplicate page routes:");
    for (const duplicate of discovery.duplicatePages) {
      console.log(
        `- ${duplicate.route}: ${duplicate.files.join(", ")}`,
      );
    }
  }

  process.exit(0);
}

let appChild = null;
let ownsAppServer = false;
const childState = { exited: false };

let appPort = preferredAppPort;
let appBaseUrl = `http://localhost:${appPort}`;

if (await isVerzusServer(appBaseUrl)) {
  console.log(`Using existing VERZUS server: ${appBaseUrl}`);
} else {
  appPort = await findAvailablePort(preferredAppPort);
  appBaseUrl = `http://localhost:${appPort}`;

  const nextCli = path.join(
    root,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );

  if (!fs.existsSync(nextCli)) {
    throw new Error(
      `Next.js CLI not found at ${nextCli}. Run npm install first.`,
    );
  }

  console.log(`Starting VERZUS application: ${appBaseUrl}`);

  appChild = spawn(
    process.execPath,
    [
      nextCli,
      "dev",
      "--hostname",
      bindHost,
      "--port",
      String(appPort),
    ],
    {
      cwd: root,
      stdio: "inherit",
      windowsHide: false,
      env: {
        ...process.env,
        BROWSER: "none",
      },
    },
  );

  ownsAppServer = true;
  appChild.once("exit", () => {
    childState.exited = true;
  });

  const ready = await waitForVerzusServer(
    appBaseUrl,
    childState,
  );

  if (!ready) {
    throw new Error(
      `VERZUS did not become ready at ${appBaseUrl}.`,
    );
  }
}

const dashboardPort = await findAvailablePort(
  preferredDashboardPort,
  [appPort],
);
const dashboardUrl = `http://localhost:${dashboardPort}`;

const screens = [];
for (const screen of initialScreens) {
  const probe = screen.file
    ? await requestStatus(`${appBaseUrl}${screen.route}`)
    : { status: null, location: null };

  screens.push({
    ...screen,
    status: probe.status,
    location: probe.location,
  });
}

fs.mkdirSync(reportDirectory, {
  recursive: true,
});

const manifest = {
  marker: "VERZUS M4 VISUAL REVIEW DASHBOARD",
  generatedAt: new Date().toISOString(),
  dashboardUrl,
  appBaseUrl,
  screens,
  apiRoutes: m4ApiRoutes,
  duplicatePages: discovery.duplicatePages,
};

fs.writeFileSync(
  manifestFile,
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

const html = createDashboardHtml({
  screens,
  apiRoutes: m4ApiRoutes,
  appBaseUrl,
  dashboardUrl,
  duplicatePages: discovery.duplicatePages,
});

const dashboardServer = http.createServer(
  (request, response) => {
    const requestUrl = new URL(
      request.url ?? "/",
      dashboardUrl,
    );

    if (requestUrl.pathname === "/manifest.json") {
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      response.end(
        `${JSON.stringify(manifest, null, 2)}\n`,
      );
      return;
    }

    if (requestUrl.pathname === "/health") {
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      response.end(
        JSON.stringify({
          ok: true,
          appBaseUrl,
        }),
      );
      return;
    }

    response.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(html);
  },
);

await new Promise((resolve, reject) => {
  dashboardServer.once("error", reject);
  dashboardServer.listen(
    dashboardPort,
    bindHost,
    resolve,
  );
});

const requiredFound = screens.filter(
  (screen) => screen.required && screen.file,
).length;
const requiredMissing = screens.filter(
  (screen) => screen.required && !screen.file,
).length;

console.log("\nM4 localhost review is ready");
console.log("============================");
console.log(`Dashboard: ${dashboardUrl}`);
console.log(`Application: ${appBaseUrl}`);
console.log(
  `Required screens: ${requiredFound} found, ${requiredMissing} missing.`,
);
console.log(`Manifest: ${manifestFile}`);
console.log("\nPress Ctrl+C when review is finished.");

openBrowser(dashboardUrl);

let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;

  dashboardServer.close(() => {
    if (
      ownsAppServer &&
      appChild &&
      !appChild.killed
    ) {
      appChild.kill("SIGTERM");
    }

    process.exit(0);
  });
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

await new Promise(() => {});
EOF

cat > "$DOC_FILE" <<'EOF'
<!-- VERZUS M4 VISUAL REVIEW DASHBOARD -->

# M4 Localhost Route Review

## Commands

Discover the real App Router files without starting a server:

```bash
npm run m4:routes
```

Start the application and browser dashboard:

```bash
npm run m4:visual-review
```

Default URLs:

```text
Dashboard:   http://localhost:3105
Application: http://localhost:3104
```

If either port is occupied, the script automatically selects the next free
localhost port and prints the exact URL.

## Route discovery

The route scanner walks `src/app` and correctly removes route groups such as:

```text
(auth)
(platform)
```

Therefore:

```text
src/app/(auth)/login/page.tsx
```

is correctly resolved as:

```text
/login
```

The dashboard also lists M4 API route handlers under `/api/auth`, `/api/me`,
and `/api/onboarding`.

## Current expected repository status

Built screen routes:

```text
/login
/register
/verify-email
/forgot-password
/reset-password
/session-expired
/account/suspended
/account/banned
```

Missing final onboarding screens remain visibly marked as not built until their
approved references are implemented.
EOF

node <<'NODE'
const fs = require("node:fs");

const file = "package.json";
const pkg = JSON.parse(
  fs.readFileSync(file, "utf8"),
);

pkg.scripts ??= {};
pkg.scripts["m4:routes"] =
  "node scripts/m4-visual-review.mjs --scan-only";
pkg.scripts["m4:visual-review"] =
  "node scripts/m4-visual-review.mjs";

fs.writeFileSync(
  file,
  `${JSON.stringify(pkg, null, 2)}\n`,
  "utf8",
);
NODE

echo
echo "Formatting files..."
npx prettier \
  "$TARGET" \
  "$DOC_FILE" \
  "$PACKAGE_FILE" \
  --write

echo
echo "Checking JavaScript syntax..."
node --check "$TARGET"

echo
echo "Checking discovered M4 routes..."
npm run m4:routes

if [[ -d "node_modules" ]]; then
  echo
  echo "Running TypeScript verification..."
  npm run typecheck
fi

echo
echo "M4 localhost route review installed successfully."
echo
echo "Start it with:"
echo "npm run m4:visual-review"
echo
echo "Default dashboard URL:"
echo "http://localhost:3105"
