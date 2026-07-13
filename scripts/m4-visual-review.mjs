// VERZUS M4 VISUAL REVIEW DASHBOARD

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const host = process.env.M4_REVIEW_HOST ?? "127.0.0.1";
const port = Number(process.env.M4_REVIEW_PORT ?? "3104");
const baseUrl = `http://${host}:${port}`;
const reportDir = path.join(root, "reports", "m4-visual-review");
const reportFile = path.join(reportDir, "index.html");
const manifestFile = path.join(reportDir, "manifest.json");

const screens = [
  {
    group: "Authentication",
    name: "Login",
    route: "/login",
    file: "src/app/login/page.tsx",
    required: true,
  },
  {
    group: "Authentication",
    name: "Register",
    route: "/register",
    file: "src/app/register/page.tsx",
    required: true,
  },
  {
    group: "Authentication",
    name: "Email verification",
    route: "/verify-email",
    file: "src/app/verify-email/page.tsx",
    required: true,
  },
  {
    group: "Authentication",
    name: "Forgot password",
    route: "/forgot-password",
    file: "src/app/forgot-password/page.tsx",
    required: true,
  },
  {
    group: "Authentication",
    name: "Reset password",
    route: "/reset-password",
    file: "src/app/reset-password/page.tsx",
    required: true,
  },
  {
    group: "Authentication",
    name: "Session expired",
    route: "/session-expired",
    file: "src/app/session-expired/page.tsx",
    required: true,
  },
  {
    group: "Account restrictions",
    name: "Suspended account",
    route: "/account/suspended",
    file: "src/app/account/suspended/page.tsx",
    required: true,
  },
  {
    group: "Account restrictions",
    name: "Banned account",
    route: "/account/banned",
    file: "src/app/account/banned/page.tsx",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Onboarding welcome",
    route: "/onboarding",
    file: "src/app/onboarding/page.tsx",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Choose games",
    route: "/onboarding/games",
    file: "src/app/onboarding/games/page.tsx",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Select location",
    route: "/onboarding/location",
    file: "src/app/onboarding/location/page.tsx",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Create player identity",
    route: "/onboarding/identity",
    file: "src/app/onboarding/identity/page.tsx",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Set availability",
    route: "/onboarding/availability",
    file: "src/app/onboarding/availability/page.tsx",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Join or skip Crew",
    route: "/onboarding/crew",
    file: "src/app/onboarding/crew/page.tsx",
    required: true,
  },
  {
    group: "Onboarding",
    name: "Onboarding complete",
    route: "/onboarding/complete",
    file: "src/app/onboarding/complete/page.tsx",
    required: true,
  },
  {
    group: "Flow destination",
    name: "Play",
    route: "/play",
    file: "src/app/play/page.tsx",
    required: false,
  },
];

function routeFileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function requestStatus(url) {
  return new Promise((resolve) => {
    const request = http.get(
      url,
      {
        headers: {
          "user-agent": "VERZUS-M4-Visual-Review/1.0",
        },
      },
      (response) => {
        response.resume();

        resolve({
          status: response.statusCode ?? null,
          location: response.headers.location ?? null,
        });
      },
    );

    request.on("error", () => {
      resolve({
        status: null,
        location: null,
      });
    });

    request.setTimeout(3000, () => {
      request.destroy();

      resolve({
        status: null,
        location: null,
      });
    });
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const result = await requestStatus(baseUrl);

    if (result.status !== null) {
      return true;
    }

    await sleep(1000);
  }

  return false;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openReport(filePath) {
  const fileUrl = pathToFileURL(filePath).href;

  if (process.platform === "win32") {
    spawnSync("cmd.exe", ["/c", "start", "", fileUrl], {
      stdio: "ignore",
      windowsHide: true,
    });
    return;
  }

  if (process.platform === "darwin") {
    spawnSync("open", [fileUrl], {
      stdio: "ignore",
    });
    return;
  }

  spawnSync("xdg-open", [fileUrl], {
    stdio: "ignore",
  });
}

function statusLabel(item) {
  if (!item.exists) {
    return {
      tone: "missing",
      text: "Route file missing",
    };
  }

  if (item.httpStatus === null) {
    return {
      tone: "warning",
      text: "Server response unavailable",
    };
  }

  if (item.httpStatus >= 300 && item.httpStatus < 400) {
    return {
      tone: "redirect",
      text: item.location ? `Redirects to ${item.location}` : `Redirect ${item.httpStatus}`,
    };
  }

  if (item.httpStatus === 404) {
    return {
      tone: "missing",
      text: "404 Not Found",
    };
  }

  if (item.httpStatus >= 200 && item.httpStatus < 300) {
    return {
      tone: "ready",
      text: `Available (${item.httpStatus})`,
    };
  }

  return {
    tone: "warning",
    text: `HTTP ${item.httpStatus}`,
  };
}

function createHtml(items) {
  const groups = [...new Set(items.map((item) => item.group))];

  const totalRequired = items.filter((item) => item.required).length;
  const existingRequired = items.filter((item) => item.required && item.exists).length;
  const missingRequired = totalRequired - existingRequired;

  const groupMarkup = groups
    .map((group) => {
      const cards = items
        .filter((item) => item.group === group)
        .map((item, index) => {
          const status = statusLabel(item);
          const safeName = escapeHtml(item.name);
          const safeRoute = escapeHtml(item.route);
          const safeFile = escapeHtml(item.file);
          const frameId = `frame-${group.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-${index}`;

          const preview = item.exists
            ? `
              <div class="preview-shell" data-width="390">
                <div class="preview-stage">
                  <iframe
                    id="${frameId}"
                    title="${safeName}"
                    src="${escapeHtml(`${baseUrl}${item.route}`)}"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                  ></iframe>
                </div>
              </div>
            `
            : `
              <div class="missing-panel">
                <strong>Not built yet</strong>
                <span>${safeFile}</span>
              </div>
            `;

          return `
            <article class="screen-card">
              <header class="screen-header">
                <div>
                  <span class="eyebrow">${escapeHtml(group)}</span>
                  <h3>${safeName}</h3>
                  <code>${safeRoute}</code>
                </div>
                <span class="status ${status.tone}">
                  ${escapeHtml(status.text)}
                </span>
              </header>

              <div class="toolbar">
                <button
                  type="button"
                  data-target="${frameId}"
                  data-width="360"
                  ${item.exists ? "" : "disabled"}
                >
                  360
                </button>
                <button
                  type="button"
                  data-target="${frameId}"
                  data-width="390"
                  ${item.exists ? "" : "disabled"}
                >
                  390
                </button>
                <button
                  type="button"
                  data-target="${frameId}"
                  data-width="430"
                  ${item.exists ? "" : "disabled"}
                >
                  430
                </button>
                <button
                  type="button"
                  data-target="${frameId}"
                  data-width="768"
                  ${item.exists ? "" : "disabled"}
                >
                  768
                </button>
                <button
                  type="button"
                  data-target="${frameId}"
                  data-width="1024"
                  ${item.exists ? "" : "disabled"}
                >
                  1024
                </button>
                <button
                  type="button"
                  data-target="${frameId}"
                  data-width="1440"
                  ${item.exists ? "" : "disabled"}
                >
                  1440
                </button>

                ${
                  item.exists
                    ? `
                      <a
                        href="${escapeHtml(`${baseUrl}${item.route}`)}"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open full screen
                      </a>
                    `
                    : ""
                }
              </div>

              ${preview}

              <footer class="screen-footer">
                <span>Source</span>
                <code>${safeFile}</code>
              </footer>
            </article>
          `;
        })
        .join("\n");

      return `
        <section class="review-group">
          <div class="group-heading">
            <h2>${escapeHtml(group)}</h2>
            <span>${items.filter((item) => item.group === group).length} screens</span>
          </div>
          <div class="screen-grid">${cards}</div>
        </section>
      `;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />
  <title>VERZUS M4 Visual Review</title>
  <style>
    :root {
      color-scheme: dark;
      font-family:
        Inter, ui-sans-serif, system-ui, -apple-system,
        BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #060914;
      color: #f6f7fb;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background:
        radial-gradient(
          circle at top right,
          rgba(0, 245, 212, 0.1),
          transparent 28rem
        ),
        #060914;
    }

    .page {
      width: min(1800px, 100%);
      margin: 0 auto;
      padding: 32px;
    }

    .hero {
      display: grid;
      gap: 20px;
      margin-bottom: 36px;
      padding: 28px;
      border: 1px solid #27304b;
      border-radius: 22px;
      background: rgba(12, 17, 35, 0.94);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.32);
    }

    .hero h1,
    .hero p {
      margin: 0;
    }

    .hero h1 {
      font-size: clamp(30px, 5vw, 58px);
      letter-spacing: -0.045em;
    }

    .hero p {
      max-width: 900px;
      color: #aeb8d2;
      line-height: 1.6;
    }

    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .summary-card {
      min-width: 170px;
      padding: 16px 18px;
      border: 1px solid #27304b;
      border-radius: 14px;
      background: #0a1022;
    }

    .summary-card strong,
    .summary-card span {
      display: block;
    }

    .summary-card strong {
      font-size: 28px;
      color: #00f5d4;
    }

    .summary-card span {
      margin-top: 4px;
      color: #9aa6c3;
      font-size: 13px;
    }

    .notice {
      padding: 14px 16px;
      border-left: 4px solid #f9c74f;
      background: rgba(249, 199, 79, 0.08);
      color: #f5dda0;
      line-height: 1.5;
    }

    .review-group {
      margin-top: 44px;
    }

    .group-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
    }

    .group-heading h2 {
      margin: 0;
      font-size: 24px;
    }

    .group-heading span {
      color: #7f8baa;
    }

    .screen-grid {
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(min(100%, 440px), 1fr));
      gap: 22px;
    }

    .screen-card {
      min-width: 0;
      overflow: hidden;
      border: 1px solid #27304b;
      border-radius: 18px;
      background: #0a1022;
    }

    .screen-header,
    .screen-footer {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 18px;
    }

    .screen-header {
      border-bottom: 1px solid #202943;
    }

    .screen-header h3 {
      margin: 4px 0 6px;
      font-size: 20px;
    }

    code {
      color: #9fb0d3;
      overflow-wrap: anywhere;
    }

    .eyebrow {
      color: #00f5d4;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .status {
      flex: 0 0 auto;
      padding: 7px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
    }

    .status.ready {
      background: rgba(64, 211, 137, 0.13);
      color: #76efad;
    }

    .status.redirect {
      background: rgba(84, 160, 255, 0.14);
      color: #8fc0ff;
    }

    .status.warning {
      background: rgba(249, 199, 79, 0.14);
      color: #f9d97d;
    }

    .status.missing {
      background: rgba(255, 82, 115, 0.14);
      color: #ff8aa3;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 18px;
      border-bottom: 1px solid #202943;
      background: #080d1d;
    }

    .toolbar button,
    .toolbar a {
      min-height: 36px;
      padding: 8px 11px;
      border: 1px solid #33405f;
      border-radius: 9px;
      background: #111a32;
      color: #dbe5ff;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
    }

    .toolbar button:hover,
    .toolbar a:hover {
      border-color: #00f5d4;
    }

    .toolbar button:disabled {
      cursor: not-allowed;
      opacity: 0.38;
    }

    .preview-shell {
      height: 720px;
      overflow: auto;
      padding: 18px;
      background:
        linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.02) 25%,
          transparent 25%,
          transparent 75%,
          rgba(255, 255, 255, 0.02) 75%
        ),
        #050816;
      background-size: 22px 22px;
    }

    .preview-stage {
      display: flex;
      justify-content: center;
      min-width: max-content;
    }

    iframe {
      width: 390px;
      height: 844px;
      border: 1px solid #34405d;
      border-radius: 14px;
      background: white;
      transform-origin: top center;
    }

    .missing-panel {
      display: grid;
      place-items: center;
      gap: 10px;
      min-height: 360px;
      padding: 30px;
      background: #060a16;
      color: #ff8aa3;
      text-align: center;
    }

    .missing-panel span {
      max-width: 360px;
      color: #9aa6c3;
      overflow-wrap: anywhere;
    }

    .screen-footer {
      border-top: 1px solid #202943;
      color: #7f8baa;
      font-size: 12px;
    }

    @media (max-width: 640px) {
      .page {
        padding: 16px;
      }

      .hero {
        padding: 20px;
      }

      .screen-header,
      .screen-footer {
        display: grid;
      }

      .status {
        justify-self: start;
      }

      .preview-shell {
        height: 640px;
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <span class="eyebrow">VERZUS · M4</span>
      <h1>Authentication and onboarding visual review</h1>
      <p>
        This dashboard loads the actual local Next.js routes. It does not
        invent missing screens. Use the viewport controls to inspect 360,
        390, 430, 768, 1024, and 1440 pixel presentations.
      </p>

      <div class="summary">
        <div class="summary-card">
          <strong>${totalRequired}</strong>
          <span>Required M4 screens</span>
        </div>
        <div class="summary-card">
          <strong>${existingRequired}</strong>
          <span>Route files found</span>
        </div>
        <div class="summary-card">
          <strong>${missingRequired}</strong>
          <span>Required route files missing</span>
        </div>
      </div>

      <div class="notice">
        Protected onboarding routes may redirect to Login because the review
        browser has no authenticated mock-session cookie. That redirect is
        security behavior, not proof that the onboarding UI exists.
      </div>
    </section>

    ${groupMarkup}
  </main>

  <script>
    const buttons = document.querySelectorAll(
      "button[data-target][data-width]",
    );

    function applyViewport(frame, requestedWidth) {
      const shell = frame.closest(".preview-shell");
      const stage = frame.closest(".preview-stage");
      const available =
        Math.max(280, shell.clientWidth - 36);
      const scale =
        Math.min(1, available / requestedWidth);

      frame.style.width = requestedWidth + "px";
      frame.style.height =
        (requestedWidth <= 430 ? 844 : 1000) + "px";
      frame.style.transform =
        "scale(" + scale + ")";

      stage.style.height =
        Math.ceil(
          Number.parseInt(frame.style.height, 10) *
            scale,
        ) + "px";

      shell.dataset.width = String(requestedWidth);
    }

    for (const button of buttons) {
      button.addEventListener("click", () => {
        const frame = document.getElementById(
          button.dataset.target,
        );

        if (!frame) {
          return;
        }

        applyViewport(
          frame,
          Number(button.dataset.width),
        );
      });
    }

    for (const frame of document.querySelectorAll(
      "iframe",
    )) {
      applyViewport(frame, 390);
    }

    window.addEventListener("resize", () => {
      for (const shell of document.querySelectorAll(
        ".preview-shell",
      )) {
        const frame = shell.querySelector("iframe");

        if (!frame) {
          continue;
        }

        applyViewport(
          frame,
          Number(shell.dataset.width || "390"),
        );
      }
    });
  </script>
</body>
</html>`;
}

let child = null;
let existingServer = false;

const initialProbe = await requestStatus(baseUrl);

if (initialProbe.status !== null) {
  existingServer = true;
  console.log(`Using existing server at ${baseUrl}.`);
} else {
  console.log(`Starting VERZUS development server at ${baseUrl}...`);

  const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");

  if (!fs.existsSync(nextCli)) {
    throw new Error(`Next.js CLI was not found at ${nextCli}. Run npm install first.`);
  }

  child = spawn(process.execPath, [nextCli, "dev", "--hostname", host, "--port", String(port)], {
    cwd: root,
    stdio: "inherit",
    windowsHide: false,
    env: {
      ...process.env,
      BROWSER: "none",
    },
  });

  const ready = await waitForServer();

  if (!ready) {
    child.kill();
    console.error(`The Next.js server did not become ready at ${baseUrl}.`);
    process.exit(1);
  }
}

const reviewedScreens = [];

for (const screen of screens) {
  const exists = routeFileExists(screen.file);
  const probe = exists
    ? await requestStatus(`${baseUrl}${screen.route}`)
    : {
        status: null,
        location: null,
      };

  reviewedScreens.push({
    ...screen,
    exists,
    httpStatus: probe.status,
    location: probe.location,
  });
}

fs.mkdirSync(reportDir, {
  recursive: true,
});

fs.writeFileSync(
  manifestFile,
  `${JSON.stringify(
    {
      marker: "VERZUS M4 VISUAL REVIEW DASHBOARD",
      generatedAt: new Date().toISOString(),
      baseUrl,
      screens: reviewedScreens,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

fs.writeFileSync(reportFile, createHtml(reviewedScreens), "utf8");

console.log(`\nVisual review: ${reportFile}`);
console.log(`Route manifest: ${manifestFile}`);
console.log("\nOpening the review dashboard in your browser...");

openReport(reportFile);

const missing = reviewedScreens.filter((screen) => screen.required && !screen.exists);

if (missing.length > 0) {
  console.log("\nRequired M4 routes still missing:");

  for (const screen of missing) {
    console.log(`- ${screen.name}: ${screen.file}`);
  }
}

if (existingServer) {
  console.log("\nThe dashboard is using an existing server.");
  process.exit(0);
}

console.log("\nKeep this terminal open while reviewing.");
console.log("Press Ctrl+C when the visual review is finished.");

function stop() {
  if (child && !child.killed) {
    child.kill("SIGTERM");
  }

  process.exit(0);
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

await new Promise((resolve) => {
  child.on("exit", resolve);
});
