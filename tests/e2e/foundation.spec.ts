import { expect, test } from "@playwright/test";

test("foundation page and health endpoint are available", async ({ page, request }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "VERZUS foundation" })).toBeVisible();
  await expect(page.getByText("Milestone M1")).toBeVisible();

  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({
    status: "ok",
    service: "verzus-platform",
  });
});
