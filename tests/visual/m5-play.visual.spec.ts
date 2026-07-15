// VERZUS M5 VISUAL STABILITY REPAIR

import { expect, test, type Page } from "@playwright/test";

const scenarios = [
  "normal",
  "check_in_open",
  "checked_in",
  "match_starting_soon",
  "no_match_scheduled",
  "crew_activity_present",
  "no_crew",
  "opportunities_available",
  "partial_api_failure",
  "offline",
] as const;

type PlayScenario = (typeof scenarios)[number];

test.setTimeout(60_000);

async function authenticate(page: Page): Promise<void> {
  await page.context().addCookies([
    {
      name: "verzus_mock_session",
      value: "mock-authenticated",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

async function installVisualStabilityCss(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      nextjs-portal {
        display: none !important;
      }

      *,
      *::before,
      *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        scroll-behavior: auto !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }

      html {
        scroll-behavior: auto !important;
      }
    `,
  });
}

async function waitForStableDocumentHeight(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const stateKey = "__verzusM5VisualHeightState";
      const browserWindow = window as typeof window & {
        [stateKey]?: {
          height: number;
          stableSamples: number;
        };
      };

      const height = Math.max(
        document.documentElement.scrollHeight,
        document.body?.scrollHeight ?? 0,
      );

      const previous = browserWindow[stateKey];

      if (!previous || previous.height !== height) {
        browserWindow[stateKey] = {
          height,
          stableSamples: 0,
        };
        return false;
      }

      previous.stableSamples += 1;
      return previous.stableSamples >= 4;
    },
    undefined,
    {
      polling: 250,
      timeout: 15_000,
    },
  );
}

async function waitForPlayToSettle(page: Page, scenario: PlayScenario): Promise<void> {
  const root = page.locator('[data-play-command-center="true"]');

  await expect(root).toBeVisible({
    timeout: 30_000,
  });

  await expect(root).toHaveAttribute("data-play-ready", "true", {
    timeout: 30_000,
  });

  await expect(root).toHaveAttribute("data-play-variant", scenario, {
    timeout: 30_000,
  });

  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  await waitForStableDocumentHeight(page);
  await page.waitForTimeout(300);
}

test.beforeEach(async ({ page }) => {
  await authenticate(page);
  await page.emulateMedia({
    reducedMotion: "reduce",
  });
});

for (const scenario of scenarios) {
  test(`Play ${scenario}`, async ({ page }, testInfo) => {
    await page.goto(`/play?scenario=${scenario}`, {
      waitUntil: "domcontentloaded",
    });

    await installVisualStabilityCss(page);
    await waitForPlayToSettle(page, scenario);

    await expect(page).toHaveScreenshot(`m5-play-${scenario}-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      timeout: 30_000,
    });
  });
}
