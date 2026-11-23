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
const base = process.env.WORKSHOP_TEST_URL || "http://127.0.0.1:18770";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1080 },
  reducedMotion: "reduce",
  acceptDownloads: true,
});
const page = await context.newPage();
const checks = [],
  scans = [],
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
function check(id, ok, detail = "") {
  checks.push({ id, status: ok ? "PASS" : "FAIL", detail });
  if (!ok) throw Error(id + " " + detail);
}
const state = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("stationf-20261124-v1")));
const phase = async (n) => {
  await page.locator(`[data-step="${n}"]`).click();
};
async function scan(label) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  scans.push({
    label,
    violations: result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
}
async function switchTo(name) {
  await page.locator("#open-participant").click();
  const options = await page
    .locator("#participant-select option")
    .evaluateAll((els) =>
      els.map((el) => ({ name: el.textContent, value: el.value })),
    );
  const option = options.find((o) => o.name === name);
  if (!option) throw Error("Missing profile " + name);
  await page.locator("#participant-select").selectOption(option.value);
  await page.keyboard.press("Escape");
}
try {
  await page.goto(base);
  await page.waitForSelector("#thread-resume");
  check(
    "personal-thread-visible",
    await page.locator("#participant-thread").isVisible(),
  );
  check(
    "six-status-milestones",
    (await page.locator("#steps [data-step]").count()) === 6,
  );
  check(
    "initial-progress-is-zero",
    (await page.locator("#progress-percent").innerText()) === "0 %",
  );
  await phase(5);
  check(
    "visiting-final-step-does-not-complete",
    !(await page.locator("#participant-thread").innerText()).includes(
      "Parcours renseigné",
    ) && (await page.locator("#progress-percent").innerText()) === "0 %",
  );
  await phase(0);
  await page.locator("#complete-checkpoint").click();
  check(
    "completion-requires-deliverable",
    (await page.locator("#checkpoint-feedback").innerText()).includes(
      "Notre question métier",
    ) &&
      (await page
        .locator('[data-note="question"]')
        .evaluate((e) => e === document.activeElement)),
  );
  await page.locator("#open-participant").click();
  await page.locator("#participant-edit-name").fill("Camille");
  await page.locator("#participant-role").selectOption("business");
  await scan("participant-profile");
  await page.locator("#save-participant").click();
  check(
    "named-personal-thread",
    (await page.locator("#participant-thread").innerText()).includes(
      "CAMILLE",
    ) &&
      (await page.locator("#participant-thread").innerText()).includes(
        "Métier",
      ),
  );
  await page
    .locator('[data-note="question"]')
    .fill("Quels canaux examiner avant de réallouer le budget ?");
  await page.locator("#complete-checkpoint").click();
  check(
    "explicit-completion-advances",
    (await page.locator('[data-step="1"]').getAttribute("aria-current")) ===
      "step" &&
      (await page.locator("#progress-label").innerText()).includes("1/6"),
  );
  await page.locator("#phase-status").selectOption("blocked");
  await page
    .locator("#phase-blocker")
    .fill("Je ne retrouve pas le lien de mon Genie Agent.");
  check(
    "blocker-keeps-guiding-action",
    (await page.locator(".thread-next").innerText()).includes(
      "Je ne retrouve pas",
    ) &&
      (await page.locator(".thread-heading-actions").innerText()).includes(
        "Besoin d’aide",
      ),
  );
  check(
    "help-is-explicitly-local",
    (await page.locator("#blocker-area").innerText()).includes(
      "facilitateur",
    ) &&
      (await page.locator(".thread-footnote").innerText()).includes(
        "notification automatique",
      ),
  );
  await scan("blocked-guiding-thread");
  await page
    .locator("#participant-thread")
    .screenshot({
      path: path.join(root, ".validation/participant-thread-blocked.png"),
    });
  await page.locator("#open-participant").click();
  await page
    .locator("#new-participant-name")
    .evaluate((e) => (e.closest("details").open = true));
  await page.locator("#new-participant-name").fill("Alex");
  await page.locator("#create-participant").click();
  check(
    "second-profile-starts-clean",
    (await page.locator("#participant-thread").innerText()).includes("ALEX") &&
      (await page.locator('[data-note="question"]').inputValue()) === "" &&
      (await page.locator("#progress-percent").innerText()) === "0 %",
  );
  await page
    .locator('[data-note="question"]')
    .fill("Quels comptes revoir en priorité ?");
  await page.locator("#complete-checkpoint").click();
  const alex = (await state()).activeParticipant;
  await switchTo("Camille");
  check(
    "participant-statuses-and-notes-isolated",
    (await page.locator("#phase-status").inputValue()) === "blocked" &&
      (await page.locator("#phase-blocker").inputValue()) ===
        "Je ne retrouve pas le lien de mon Genie Agent.",
  );
  await page.reload();
  check(
    "reload-resumes-person-and-blocker",
    (await page.locator("#participant-name").innerText()) === "Camille" &&
      (await page.locator("#phase-status").inputValue()) === "blocked",
  );
  await phase(0);
  await page.locator('[data-note="question"]').fill("");
  check(
    "removing-evidence-reopens-checkpoint",
    (await page.locator("#phase-status").inputValue()) === "in_progress" &&
      (await page.locator("#progress-percent").innerText()) === "0 %",
  );
  await page
    .locator('[data-note="question"]')
    .fill("Quels canaux examiner avant de réallouer le budget ?");
  await page.locator("#complete-checkpoint").click();
  await phase(3);
  await page.locator("#builder-unavailable").click();
  check(
    "builder-unavailable-is-separate-status",
    (await page.locator('[data-step="3"]').innerText()).includes(
      "Indisponible",
    ) && (await page.locator("#progress-label").innerText()).includes("1/5"),
  );
  await page
    .locator('[data-note="verification"]')
    .fill(
      "Référence M1 comparée. Périmètre et attribution à confirmer avant toute réallocation.",
    );
  await page.locator("#complete-checkpoint").click();
  await page
    .locator('[data-note="decision"]')
    .fill(
      "Examiner Partner et Retargeting, puis expérimenter avant de réallouer.",
    );
  await page
    .locator('[data-note="owner"]')
    .fill("Camille · revue le 1 décembre");
  await page.locator("#complete-checkpoint").click();
  check(
    "earlier-blocker-prevents-global-completion",
    (await page.locator(".thread-heading-actions").innerText()).includes(
      "Besoin d’aide",
    ) &&
      !(await page.locator(".thread-heading-actions").innerText()).includes(
        "Parcours renseigné",
      ),
  );
  await page.locator("#thread-resume").click();
  check(
    "next-action-targets-unresolved-stage",
    (await page.locator('[data-step="1"]').getAttribute("aria-current")) ===
      "step",
  );
  await page
    .locator('[data-note="conversation"]')
    .fill("Conversation et SQL conservés dans le notebook.");
  await page
    .locator('[data-note="findings"]')
    .fill("Attribution non causale. Semaines complètes uniquement.");
  await page.locator("#complete-checkpoint").click();
  await page.locator("#complete-checkpoint").click();
  check(
    "completed-journey-requires-all-applicable-stages",
    (await page.locator(".thread-heading-actions").innerText()).includes(
      "Parcours renseigné",
    ) && (await page.locator("#progress-label").innerText()).includes("5/5"),
  );
  await page.locator("#thread-resume").click();
  check(
    "finished-thread-opens-real-presentation",
    (await page.locator("#presentation-dialog").isVisible()) &&
      (
        await page.locator("#presentation-dialog blockquote").innerText()
      ).includes("Examiner Partner"),
  );
  await page.keyboard.press("Escape");
  await scan("completed-personal-thread");
  const pending = page.waitForEvent("download");
  await page.locator("#export-json").click();
  const exported = await pending;
  const file = path.join(root, ".validation/participant-workbook-v2.json");
  await exported.saveAs(file);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  check(
    "json-includes-personal-statuses",
    data.version === 2 &&
      Object.keys(data.participants).length === 2 &&
      Object.values(data.journeys).some(
        (j) => j.steps[3].status === "unavailable",
      ),
  );
  const md = page.waitForEvent("download");
  await page.locator("#export-md").click();
  const markdown = await md;
  const mdFile = path.join(root, ".validation/participant-workbook.md");
  await markdown.saveAs(mdFile);
  check(
    "markdown-includes-guiding-thread",
    fs.readFileSync(mdFile, "utf8").includes("Mon fil rouge personnel") &&
      fs.readFileSync(mdFile, "utf8").includes("Indisponible"),
  );
  const fresh = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
    reducedMotion: "reduce",
  });
  const other = await fresh.newPage();
  await other.goto(base);
  await other.locator('[data-step="5"]').click();
  await other.locator("#import-file").setInputFiles(file);
  await other.waitForFunction(
    () =>
      Object.keys(
        JSON.parse(localStorage.getItem("stationf-20261124-v1")).participants,
      ).length === 3,
  );
  check(
    "import-adds-profiles-without-overwriting-current",
    (await other.locator("#participant-name").innerText()) === "Mon parcours",
  );
  await other.locator("#open-participant").click();
  await other
    .locator("#participant-select")
    .selectOption(data.activeParticipant);
  await other.keyboard.press("Escape");
  check(
    "cross-browser-import-restores-progress",
    (await other.locator("#participant-name").innerText()) === "Camille" &&
      (await other.locator("#progress-label").innerText()).includes("5/5"),
  );
  await other.locator("#open-participant").click();
  await other.locator("#participant-select").selectOption(alex);
  await other.keyboard.press("Escape");
  await other.locator('[data-step="0"]').click();
  check(
    "cross-browser-import-preserves-profile-isolation",
    (await other.locator('[data-note="question"]').inputValue()) ===
      "Quels comptes revoir en priorité ?" &&
      (await other.locator("#progress-label").innerText()).includes("1/6"),
  );
  await other.locator('[data-step="5"]').click();
  const invalid = structuredClone(data);
  Object.values(invalid.journeys)[0].steps[0].status = "PASSED_AUTOMATICALLY";
  const invalidFile = path.join(
    root,
    ".validation/invalid-participant-progress.json",
  );
  fs.writeFileSync(invalidFile, JSON.stringify(invalid));
  const before = await other.evaluate(() =>
    localStorage.getItem("stationf-20261124-v1"),
  );
  await other.locator("#import-file").setInputFiles(invalidFile);
  await other.waitForFunction(() =>
    document.querySelector("#status").textContent.includes("Import refusé"),
  );
  check(
    "invalid-progress-import-is-transactional",
    before ===
      (await other.evaluate(() =>
        localStorage.getItem("stationf-20261124-v1"),
      )),
  );
  await fresh.close();
  const legacy = await browser.newContext({ reducedMotion: "reduce" });
  await legacy.addInitScript(() => {
    if (!localStorage.getItem("stationf-20261124-v1"))
      localStorage.setItem(
        "stationf-20261124-v1",
        JSON.stringify({
          version: 1,
          bindings: { workspace_url: "", catalog: "", schema: "" },
          notes: {
            "offline|||stationf-synthetic-v1|marketing": {
              question: "Brouillon v1 existant",
            },
          },
          track: "marketing",
          step: 0,
        }),
      );
  });
  const old = await legacy.newPage();
  await old.goto(base);
  check(
    "legacy-local-draft-migrates-without-false-completion",
    (await old.locator('[data-note="question"]').inputValue()) ===
      "Brouillon v1 existant" &&
      (await old.locator("#progress-percent").innerText()) === "0 %",
  );
  const legacyFile=path.join(root,".validation/legacy-workbook-v1.json");
  fs.writeFileSync(legacyFile,JSON.stringify({version:1,notes:{"offline|||stationf-synthetic-v1|marketing":{question:"Question restaurée depuis un export v1"}}}));
  await old.locator('[data-step="5"]').click();await old.locator("#import-file").setInputFiles(legacyFile);await old.waitForFunction(()=>document.querySelector("#status").textContent.includes("Ancien cahier restauré"));await old.locator('[data-step="0"]').click();
  check("legacy-json-export-remains-readable",await old.locator('[data-note="question"]').inputValue()==="Question restaurée depuis un export v1"&&(await old.locator("#progress-percent").innerText())==="0 %");
  await legacy.close();
  await phase(4);
  await page.locator(".checkpoint-panel").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    document.body.classList.contains("show-thread-dock"),
  );
  check(
    "guiding-thread-remains-available-while-working",
    (await page.locator("#participant-dock").isVisible()) &&
      (await page.locator("#participant-dock").innerText()).includes("Camille"),
  );
  await scan("persistent-progress-dock");
  await page.locator("#dock-resume").click();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await phase(1);
    check(
      "personal-thread-no-overflow-" + width,
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#phase-status").selectOption("blocked");
  await scan("mobile-blocker-status");
  await page
    .locator("#participant-thread")
    .screenshot({
      path: path.join(root, ".validation/participant-thread-mobile.png"),
    });
  check("no-javascript-errors", errors.length === 0, errors.join("; "));
  check(
    "personal-status-accessibility",
    scans.every((s) => s.violations.length === 0),
    JSON.stringify(scans.filter((s) => s.violations.length)),
  );
} finally {
  fs.writeFileSync(
    path.join(root, ".validation/participant-checks.json"),
    JSON.stringify(
      { at: new Date().toISOString(), base, checks, scans, errors },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        checks: checks.length,
        failed: checks.filter((c) => c.status === "FAIL"),
        scans,
        errors,
      },
      null,
      2,
    ),
  );
  await browser.close();
}
