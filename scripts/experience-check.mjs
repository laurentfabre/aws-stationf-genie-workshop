// Browser checks for the participant decision studio. No Databricks access.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "../node_modules/playwright/index.mjs"
);
const { default: AxeBuilder } = await import(
  process.env.AXE_MODULE ||
    "../node_modules/@axe-core/playwright/dist/index.mjs"
);
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
  headless: true,
});
const checks = [],
  errors = [],
  accessibility = [];
const base = process.env.WORKSHOP_TEST_URL || "http://127.0.0.1:18770";
const refs = JSON.parse(
  fs.readFileSync(path.join(root, "data/reference-results.json"), "utf8"),
).results;
const context = await browser.newContext({
  viewport: { width: 1440, height: 1080 },
  reducedMotion: "reduce",
  permissions: ["clipboard-read", "clipboard-write"],
  acceptDownloads: true,
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
function check(id, ok, detail = "") {
  checks.push({ id, status: ok ? "PASS" : "FAIL", detail });
  if (!ok) throw Error(id + " " + detail);
}
async function axe(label) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  accessibility.push({
    label,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
}
async function step(n) {
  await page.locator(`[data-step="${n}"]`).click();
}
async function openSession() {
  if (!(await page.locator("#settings").evaluate((e) => e.open)))
    await page.locator("#session-toggle").click();
}
async function receipt(data) {
  await openSession();
  await page.locator("#session-receipt").fill(JSON.stringify(data));
  await page.locator("#use-receipt").click();
}
const binding = {
  workspace_url: "https://example.cloud.databricks.com",
  catalog: "workshop",
  schema: "stationf_20261124_team",
  warehouse_id: "1234567890abcdef",
  genie_url: "https://example.cloud.databricks.com/genie/EXAMPLE",
  app_space_url: "https://example.cloud.databricks.com/apps",
};
try {
  await page.goto(base);
  await page.waitForSelector(".mission-card");
  check(
    "four-business-missions",
    (await page.locator(".mission-card").count()) === 4,
  );
  check(
    "single-active-mission",
    (await page.locator(".mission-card[aria-pressed=true]").count()) === 1,
  );
  await axe("landing-and-start");
  await page.locator('[data-mission="retention"]').focus();
  await page.keyboard.press("Enter");
  check(
    "keyboard-mission-selection",
    (await page.locator("#track").inputValue()) === "retention" &&
      (await page
        .locator(".mission-card[aria-pressed=true]")
        .getAttribute("data-mission")) === "retention",
  );
  await page.locator('[data-note="team"]').fill("Équipe Horizon");
  await openSession();
  await page.locator("#manual-settings").evaluate((e) => (e.open = true));
  await axe("session-settings");
  await page.locator("#session-receipt").fill("pas du JSON");
  await page.locator("#use-receipt").click();
  check(
    "malformed-receipt-explained",
    (await page.locator("#receipt-status").innerText()).includes(
      "JSON invalide",
    ),
  );
  await receipt({ ...binding, workspace_url: "http://example.com" });
  check(
    "receipt-requires-https",
    (await page.locator("#receipt-status").innerText()).includes("HTTPS"),
  );
  await receipt({
    ...binding,
    identity: "DO_NOT_STORE_IDENTITY",
    timestamp_utc: "DO_NOT_STORE_TIMESTAMP",
  });
  check(
    "receipt-closes-settings",
    !(await page.locator("#settings").evaluate((e) => e.open)),
  );
  const stored = await page.evaluate(() =>
    localStorage.getItem("stationf-20261124-v1"),
  );
  check(
    "receipt-only-saves-known-bindings",
    !stored.includes("DO_NOT_STORE") &&
      JSON.parse(stored).bindings.genie_url === binding.genie_url,
  );
  check(
    "environment-change-keeps-offline-notes",
    Object.values(JSON.parse(stored).notes).some(
      (n) => n.team === "Équipe Horizon",
    ) && (await page.locator('[data-note="team"]').inputValue()) === "",
  );
  await page.locator('[data-note="team"]').fill("Équipe Trial");
  await receipt({
    ...binding,
    schema: "stationf_20261124_other",
    genie_url: undefined,
    app_space_url: undefined,
  });
  check(
    "new-schema-clears-stale-agent-links",
    await page.evaluate(() => {
      const b = JSON.parse(
        localStorage.getItem("stationf-20261124-v1"),
      ).bindings;
      return b.genie_url === "" && b.app_space_url === "";
    }),
  );
  await receipt(binding);
  check(
    "return-to-environment-restores-notes",
    (await page.locator('[data-note="team"]').inputValue()) === "Équipe Trial",
  );
  await step(1);
  await page.locator('[data-copy="q0"]').click();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-copy="q0"]').textContent.includes("Copié"),
    {},
    { timeout: 2000 },
  );
  check(
    "copy-has-immediate-feedback",
    (await page.locator('[data-copy="q0"]').innerText()).includes("Copié"),
  );
  check(
    "genie-link-uses-receipt",
    (await page
      .locator('#main a[href="' + binding.genie_url + '"]')
      .count()) === 1,
  );
  await axe("questions");
  await step(2);
  check(
    "sql-progressively-disclosed",
    !(await page.locator("#refsql").isVisible()),
  );
  await page.locator(".code-panel summary").click();
  check(
    "full-sql-remains-available",
    (await page.locator("#refsql").innerText()).includes("account_snapshot"),
  );
  await step(3);
  await page.locator('[data-copy="build1"]').click();
  check(
    "builder-prompt-bound-to-receipt",
    (await page.evaluate(() => navigator.clipboard.readText())).includes(
      "workshop.stationf_20261124_team.account_snapshot",
    ),
  );
  await axe("builder");
  for (const id of ["marketing", "activation", "retention", "sales"]) {
    await page.locator("#track").selectOption(id);
    await step(4);
    check(
      `reference-${id}-row-count`,
      (await page.locator(".bar-row").count()) === refs[id].length,
    );
    check(
      `reference-${id}-provenance`,
      (await page.locator(".reference-panel").innerText()).includes(
        "RÉSULTAT ATTENDU · HORS LIGNE",
      ) &&
        (await page.locator(".reference-caption").innerText()).includes(
          "stationf-synthetic-v1",
        ) &&
        (await page.locator(".reference-caption a").getAttribute("href")) ===
          "reference-results.json",
    );
    const format = (v, d = 0) =>
      new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: d,
        minimumFractionDigits: d,
      }).format(v);
    const primaryKey = {
      marketing: "attributed_roas",
      activation: "accounts",
      retention: "mrr_eur",
      sales: "open_pipeline_eur",
    }[id];
    check(
      `reference-${id}-canonical-values`,
      JSON.stringify(await page.locator(".bar-value").allTextContents()) ===
        JSON.stringify(
          refs[id].map((r) =>
            format(r[primaryKey], id === "marketing" ? 4 : 0),
          ),
        ),
    );
    check(
      `reference-${id}-zero-baseline`,
      (await page.locator(".chart-axis span").first().innerText()) === "0",
    );
    if (id !== "retention") {
      await page.locator('[data-chart="secondary"]').click();
      check(
        `reference-${id}-metric-switch`,
        (await page
          .locator('[data-chart="secondary"]')
          .getAttribute("aria-pressed")) === "true",
      );
      const key = {
        marketing: "acquisition_cost_eur",
        activation: "mrr_eur",
        sales: "weighted_pipeline_eur",
      }[id];
      check(
        `reference-${id}-secondary-values`,
        JSON.stringify(await page.locator(".bar-value").allTextContents()) ===
          JSON.stringify(
            refs[id].map((r) =>
              r[key] === null
                ? "Non calculable"
                : format(r[key], id === "marketing" ? 2 : 0),
            ),
          ),
      );
      if (id === "marketing")
        check(
          "null-is-not-zero",
          (await page.locator(".bar-value.null").innerText()) ===
            "Non calculable",
        );
    }
    await axe(`reference-${id}`);
  }
  await page.locator("#track").selectOption("marketing");
  await step(5);
  await page.locator("#present-bottom").click();
  check(
    "empty-presentation-has-next-action",
    (await page.locator("#status").innerText()).includes(
      "Rédigez votre décision",
    ),
  );
  await page
    .locator('[data-note="decision"]')
    .fill(
      "Examiner deux canaux, puis tester avant de réallouer. Attribution non causale.",
    );
  await page
    .locator('[data-note="owner"]')
    .fill("Camille · Revue le 1 décembre 2026");
  await page.locator("[data-present]").click();
  check(
    "presentation-uses-real-notes",
    (
      await page.locator("#presentation-dialog blockquote").innerText()
    ).includes("Attribution non causale") &&
      (await page.locator(".presentation-columns").innerText()).includes(
        "Camille",
      ),
  );
  check(
    "presentation-is-modal",
    await page
      .locator("#presentation-dialog")
      .evaluate((e) => e.matches(":modal")),
  );
  await page.screenshot({
    path: path.join(root, ".validation/experience-presentation.png"),
  });
  await axe("presentation");
  await page.keyboard.press("Escape");
  check(
    "escape-restores-presentation-focus",
    !(await page.locator("#presentation-dialog").isVisible()) &&
      (await page
        .locator("[data-present]")
        .evaluate((e) => e === document.activeElement)),
  );
  const dl = page.waitForEvent("download");
  await page.locator("#export-json").click();
  const download = await dl;
  await download.saveAs(
    path.join(root, ".validation/experience-workbook.json"),
  );
  const exported = JSON.parse(
    fs.readFileSync(
      path.join(root, ".validation/experience-workbook.json"),
      "utf8",
    ),
  );
  check(
    "export-preserves-old-and-new-scopes",
    Object.values(exported.notes).some((n) => n.team === "Équipe Horizon") &&
      Object.values(exported.notes).some((n) => n.team === "Équipe Trial"),
  );
  await page.locator("#open-help").click();
  check("help-dialog-opens", await page.locator("#help-dialog").isVisible());
  await axe("help");
  await page.keyboard.press("Escape");
  await page.screenshot({
    path: path.join(root, ".validation/experience-decision.png"),
    fullPage: true,
  });
  await page.locator("#track").selectOption("marketing");
  await step(0);
  await page.screenshot({
    path: path.join(root, ".validation/experience-studio-desktop.png"),
  });
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const n of [0, 1, 2, 3, 4, 5]) {
      await step(n);
      const size = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        width: innerWidth,
      }));
      check(
        `layout-${width}-step-${n + 1}`,
        size.scroll <= size.width,
        JSON.stringify(size),
      );
    }
    if (width === 390) {
      await axe("mobile-decision");
      await step(4);
      await axe("mobile-reference");
      await page.screenshot({
        path: path.join(root, ".validation/experience-reference-mobile.png"),
      });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto(base + "/trial.html");
  await axe("trial-setup");
  await page.screenshot({
    path: path.join(root, ".validation/experience-trial-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  check(
    "trial-mobile-no-overflow",
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await axe("trial-mobile");
  await page.screenshot({
    path: path.join(root, ".validation/experience-trial-mobile.png"),
    fullPage: true,
  });
  const offline = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await offline.goto("file://" + path.join(root, "site/index.html"));
  await offline.waitForSelector(".mission-card");
  check(
    "offline-missions-render",
    (await offline.locator(".mission-card").count()) === 4,
  );
  await offline.locator('[data-step="4"]').click();
  check(
    "offline-charts-work",
    (await offline.locator(".bar-row").count()) === 6,
  );
  check(
    "reduced-motion-respected",
    (await offline
      .locator(".art-bars i")
      .first()
      .evaluate((e) => getComputedStyle(e).animationName)) === "none",
  );
  check("no-js-errors", errors.length === 0, errors.join("; "));
  const violations = accessibility.flatMap((a) =>
    a.violations.map((v) => ({ label: a.label, ...v })),
  );
  fs.writeFileSync(
    path.join(root, ".validation/accessibility.json"),
    JSON.stringify(accessibility, null, 2),
  );
  check(
    "wcag-aa-scans",
    violations.length === 0,
    JSON.stringify(
      violations.map((v) => ({
        label: v.label,
        id: v.id,
        nodes: v.nodes.length,
      })),
    ),
  );
} finally {
  fs.writeFileSync(
    path.join(root, ".validation/experience-checks.json"),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        environment: "Local Chrome; no Databricks login",
        checks,
        errors,
        accessibility,
      },
      null,
      2,
    ),
  );
  await browser.close();
  console.log(
    JSON.stringify(
      {
        checks: checks.length,
        failed: checks.filter((c) => c.status === "FAIL"),
        errors,
        accessibility: accessibility.map((a) => ({
          label: a.label,
          violations: a.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.length,
          })),
        })),
      },
      null,
      2,
    ),
  );
}
