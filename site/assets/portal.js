"use strict";
const W = JSON.parse(document.getElementById("workshop-data").textContent);
const storageKey = "stationf-20261124-v1";
const $ = (selector) => document.querySelector(selector);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const iconPaths = {
  arrow: "M4 12h15m-6-6 6 6-6 6",
  back: "M20 12H5m6-6-6 6 6 6",
  external:
    "M14 4h6v6m0-6L10 14M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
  chart: "M4 4v16h16M8 15v-4m5 4V7m5 8V9",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m7-7.87a4 4 0 0 1 0 7.75",
  shield: "M12 3 4 6v6c0 4 8 9 8 9s8-5 8-9V6l-8-3Zm-4 9 3 3 5-6",
  grid: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
  clock: "M12 8v5l3 2m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  pin: "M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  notebook: "M5 3h14v18H5V3ZM3 7h4M3 12h4M3 17h4m7-10h3m-3 5h3",
  book: "M12 5v16M3 3l9 2 9-2v16l-9 2-9-2V3Z",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  launch:
    "M14 4c2-1 4-1 6-1 0 2 0 4-1 6l-7 7-5-5 7-7Zm-7 7H4l-2 5 5-1m5 1v4l5-2v-3M6 18l-3 3m13-13h.01",
  settings: "M4 7h9m4 0h3M4 17h3m4 0h9M13 4v6M7 14v6",
  help: "M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3h.01m9-5a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  copy: "M9 9h12v12H9V9ZM5 15H3V3h12v2",
  check: "m5 12 4 4L19 6",
  message: "M21 3H3v14h5l4 4 4-4h5V3ZM7 8h10M7 12h6",
  arrowup: "M5 17 19 3M5 3h14v14",
  "arrow-up": "M6 17 18 5M6 5h12v12",
  target: "M21 12a9 9 0 1 1-9-9m5 9a5 5 0 1 1-5-5m0 5 9-9m-4 0h4v4",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  file: "M14 2H5v20h14V7l-5-5Zm0 0v5h5M8 12h8m-8 4h8",
  present: "M3 3h18v12H3V3Zm9 12v6m-4 0 4-3 4 3",
  info: "M12 11v6m0-10h.01m9 5a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
};
function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${iconPaths[name] || iconPaths.spark}"/></svg>`;
}
function hydrateIcons(root = document) {
  root
    .querySelectorAll("[data-icon]")
    .forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
}
const UI = {
  marketing: {
    icon: "chart",
    color: "#b66e3e",
    tint: "#faf0e3",
    tag: "MARKETING",
    short: "Acquisition",
    title: "Où investir le prochain euro ?",
    description: "Distinguez le volume de leads de la vraie performance.",
    facts: ["6 canaux", "8 semaines", "Attribution à examiner"],
    outcome: "Deux canaux à examiner. Une recommandation argumentée.",
    concepts: [
      [
        "Votre unité",
        "Une campagne, une semaine",
        "Comparez les mêmes semaines.",
      ],
      [
        "Votre indicateur",
        "ROAS attribué",
        "Somme des revenus ÷ somme des dépenses.",
      ],
      [
        "Le point d’attention",
        "Attribution incomplète",
        "Gardez les semaines et dépenses exclues visibles.",
      ],
      [
        "La limite",
        "Attribuer ≠ prouver",
        "Une corrélation ne démontre pas un effet causal.",
      ],
    ],
  },
  activation: {
    icon: "users",
    color: "#628459",
    tint: "#eff4e8",
    tag: "ACTIVATION",
    short: "Activation",
    title: "À qui donner la priorité ?",
    description: "Repérez les comptes qui méritent une revue commerciale.",
    facts: ["240 comptes", "4 groupes", "Opt-in à vérifier"],
    outcome: "Des segments explicites. Une priorité de revue commerciale.",
    concepts: [
      ["Votre unité", "Un compte", "Snapshot au 17 novembre 2026."],
      [
        "Votre indicateur",
        "Évolution de l’usage",
        "Comparez deux fenêtres de 28 jours.",
      ],
      [
        "Vos seuils",
        "1,05 et 0,60",
        "Engagé, Stable ou À revoir selon le ratio.",
      ],
      [
        "Le point d’attention",
        "Preuve insuffisante",
        "Télémétrie incomplète ou base nulle : ne concluez pas.",
      ],
    ],
  },
  retention: {
    icon: "shield",
    color: "#687eaa",
    tint: "#edf0f9",
    tag: "RÉTENTION",
    short: "Rétention",
    title: "Quels clients revoir d’abord ?",
    description: "Croisez renouvellements proches et baisse d’usage.",
    facts: ["240 comptes", "30 jours de renouvellements", "Baisse > 40 %"],
    outcome: "Une liste de comptes à examiner. Aucun churn inventé.",
    concepts: [
      [
        "Votre unité",
        "Un compte à renouveler",
        "Du 17 novembre au 17 décembre inclus.",
      ],
      [
        "Votre seuil",
        "Baisse strictement > 40 %",
        "À 40 % exactement, le compte est exclu.",
      ],
      [
        "Vos données",
        "Une base comparable",
        "Télémétrie complète et base précédente positive.",
      ],
      [
        "La limite",
        "MRR à examiner",
        "Ce montant ne représente pas un revenu perdu.",
      ],
    ],
  },
  sales: {
    icon: "target",
    color: "#9874a7",
    tint: "#f5eef7",
    tag: "PIPELINE · BONUS",
    short: "Pipeline",
    title: "Que vaut vraiment le pipeline ?",
    description: "Séparez montants ouverts, pondérés et inactifs.",
    facts: ["360 opportunités", "Décembre 2026", "Montants vérifiés"],
    outcome: "Une revue du pipeline. Des pondérations expliquées.",
    concepts: [
      [
        "Votre unité",
        "Une opportunité",
        "Ouverte et attendue en décembre 2026.",
      ],
      [
        "Vos montants",
        "Brut et pondéré",
        "Les pondérations sont pédagogiques, non calibrées.",
      ],
      [
        "Vos exclusions",
        "Won, Lost, non vérifié",
        "Les montants non vérifiés ne contribuent pas au KPI.",
      ],
      [
        "Le point d’attention",
        "30 jours sans activité",
        "À examiner, sans conclure automatiquement Lost.",
      ],
    ],
  },
};
const STEP_LABELS = [
  "Démarrer",
  "Explorer",
  "Poser les règles",
  "Construire",
  "Vérifier",
  "Décider",
];
const STEP_TIMES = ["10 min", "25 min", "10 min", "30 min", "25 min", "15 min"];
const FIELD_HINTS = {
  team: [
    "Ex. Camille · métier / Alex · technique",
    "Qui porte la décision ? Qui vérifie les données ?",
  ],
  question: [
    "Quelle décision votre équipe doit-elle prendre ?",
    "Formulez une question à laquelle une réponse peut changer votre action.",
  ],
  conversation: [
    "Collez le lien de la conversation et la requête retenue.",
    "Gardez une trace pour pouvoir expliquer et rejouer votre analyse.",
  ],
  findings: [
    "Qu’avez-vous observé ? Quelles définitions avez-vous retenues ?",
    "Précisez le périmètre et les unités. Signalez ce qui reste incertain.",
  ],
  observations: [
    "Ex. Les semaines incomplètes ne sont pas visibles dans le tableau.",
    "Décrivez un écart réel avant de demander une amélioration.",
  ],
  app: [
    "Lien de l’app · version · aperçu ou application publiée",
    "Si Builder est indisponible, indiquez BLOCKED et le prérequis manquant.",
  ],
  verification: [
    "Attendu → observé · statut · identité · date · lien de preuve",
    "Votre note conserve une observation ; elle ne lance aucun test.",
  ],
  decision: [
    "Nous proposons de… parce que… Notre principale limite est…",
    "Écrivez une recommandation que vous pourriez présenter à votre équipe.",
  ],
  owner: [
    "Prochaine action · responsable · date",
    "Une bonne décision se termine par une prochaine étape.",
  ],
};
let memory = {
  version: 1,
  bindings: { ...W.bindings },
  notes: {},
  track: W.tracks[0].id,
  step: 0,
};
let storageOK = true;
try {
  const old = JSON.parse(localStorage.getItem(storageKey) || "null");
  if (old && old.version === 1 && old.notes && old.bindings)
    memory = { ...memory, ...old };
} catch {
  storageOK = false;
}
let trackId = W.tracks.some((t) => t.id === memory.track)
  ? memory.track
  : W.tracks[0].id;
let step =
  Number.isInteger(memory.step) && memory.step >= 0 && memory.step < 6
    ? memory.step
    : 0;
let chartMetric = "primary";
let statusTimer;
const track = () => W.tracks.find((t) => t.id === trackId);
const scope = () =>
  [
    memory.bindings.workspace_url || "offline",
    memory.bindings.catalog || "",
    memory.bindings.schema || "",
    W.dataset,
    trackId,
  ].join("|");
const notes = () => memory.notes[scope()] || (memory.notes[scope()] = {});
const countNotes = () =>
  W.workbook_fields.filter(([id]) => notes()[id]?.trim()).length;
function status(message, bad = false) {
  const el = $("#status");
  clearTimeout(statusTimer);
  el.textContent = message;
  el.classList.toggle("bad", bad);
  el.classList.add("visible");
  if (!bad)
    statusTimer = setTimeout(() => el.classList.remove("visible"), 5500);
}
function persist() {
  memory.track = trackId;
  memory.step = step;
  try {
    localStorage.setItem(storageKey, JSON.stringify(memory));
    storageOK = true;
  } catch {
    storageOK = false;
  }
  $("#save-indicator").textContent = storageOK
    ? "Brouillon enregistré ici"
    : "Stockage indisponible";
  if (!storageOK)
    status(
      "Stockage navigateur indisponible : exportez votre cahier JSON avant de fermer.",
      true,
    );
  updateNotebook();
}
function saveFields() {
  document
    .querySelectorAll("[data-note]")
    .forEach((el) => (notes()[el.dataset.note] = el.value));
  persist();
}
function field(id, compact = false) {
  const title = W.workbook_fields.find((f) => f[0] === id)?.[1] || id;
  const hint = FIELD_HINTS[id] || ["", ""];
  return `<label class="field${compact ? " compact" : ""}"><span>${esc(title)}</span><textarea data-note="${esc(id)}" placeholder="${esc(hint[0])}" rows="${compact ? 3 : 4}">${esc(notes()[id] || "")}</textarea><span class="field-hint">${esc(hint[1])}</span></label>`;
}
function bound() {
  return (
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(memory.bindings.catalog) &&
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(memory.bindings.schema)
  );
}
function safeLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
function prompt(raw) {
  return raw
    .replaceAll(
      "{{catalog}}",
      memory.bindings.catalog || "CATALOGUE_A_CONFIRMER",
    )
    .replaceAll("{{schema}}", memory.bindings.schema || "SCHEMA_A_CONFIRMER");
}
function codeBlock(id, label, value, needsBinding = false) {
  return `<div class="code-panel"><div class="promptbar"><b>${esc(label)}</b><button class="small" data-copy="${esc(id)}" ${needsBinding ? 'data-binding="true"' : ""}>${icon("copy")} Copier</button></div><details><summary>Lire ${id === "refsql" ? "le SQL de référence" : "le prompt complet"}</summary><pre id="${esc(id)}">${esc(value)}</pre></details></div>`;
}
function resourceLinks() {
  const desired =
    step === 3
      ? [
          ["app_space_url", "Ouvrir App Builder"],
          ["genie_url", "Ouvrir Genie"],
        ]
      : [
          ["genie_url", "Ouvrir Genie"],
          ["workspace_url", "Mon workspace"],
        ];
  const links = desired.filter(([key]) => safeLink(memory.bindings[key]));
  return `<div class="links">${links.map(([key, label], i) => `<a class="button${i === 0 ? " primary" : ""}" href="${esc(memory.bindings[key])}" target="_blank" rel="noopener noreferrer">${icon(key === "genie_url" ? "spark" : "external")}${label}${icon("external")}</a>`).join("")}${!links.length ? `<button data-configure class="small">${icon("settings")} ${step === 3 ? "Configurer mes liens" : "Configurer mon lien Genie"}</button>` : ""}</div>`;
}
function checksTable(t) {
  return `<div class="tablewrap"><table class="checks-table"><thead><tr><th>À vérifier</th><th>Ce que vous devez retrouver</th></tr></thead><tbody>${t.checks.map((c, i) => `<tr><td><span class="check-case">${icon(["check", "eye", "help", "file", "shield"][i] || "check")}${esc(c[0])}</span></td><td>${esc(c[1])}</td></tr>`).join("")}</tbody></table></div>`;
}
function renderMissions() {
  $("#mission-cards").innerHTML = W.tracks
    .map((t, i) => {
      const u = UI[t.id];
      const selected = t.id === trackId;
      return `<button class="mission-card" data-mission="${t.id}" aria-pressed="${selected}" style="--mission-color:${u.color};--mission-tint:${u.tint}"><span class="mission-card-top"><span class="mission-icon">${icon(u.icon)}</span><span class="mission-card-code">${i === 3 ? "BONUS" : "MISSION 0" + (i + 1)}</span></span><span class="mission-tag">${u.tag}</span><strong>${u.title}</strong><span class="mission-card-description">${u.description}</span><span class="mission-card-bottom"><span>${selected ? "Votre mission sélectionnée" : "Choisir cette mission"}</span>${icon(selected ? "check" : "arrow")}</span></button>`;
    })
    .join("");
  $("#mission-cards")
    .querySelectorAll("[data-mission]")
    .forEach(
      (el) => (el.onclick = () => selectTrack(el.dataset.mission, true)),
    );
}
function renderCompanion() {
  const t = track(),
    u = UI[trackId];
  const items = [
    ["question", "Une question métier", "Le point de départ", "message"],
    ["conversation", "Une analyse traçable", "Conversation et SQL", "chart"],
    [
      "decision",
      "Une décision argumentée",
      "Preuve, limite et prochaine action",
      "target",
    ],
  ];
  $("#companion").innerHTML =
    `<p class="eyebrow">VOTRE CAP</p><h3>${u.outcome}</h3><p>À la fin, repartez avec trois éléments que vous pouvez partager.</p>${items.map(([id, label, detail, name]) => `<div class="deliverable ${notes()[id]?.trim() ? "done" : ""}">${icon(notes()[id]?.trim() ? "check" : name)}<div><strong>${label}</strong><span>${notes()[id]?.trim() ? "Note rédigée" : detail}</span></div></div>`).join("")}<div class="companion-note">${icon("users")}<p>Le métier porte la question.<br>La technique challenge la preuve.<br><strong>La décision vous appartient.</strong></p></div><div class="mini-source"><strong>VOTRE ENTREPRISE D’ESSAI</strong>NovaFlow · SaaS B2B fictif<br>Données synthétiques au 17/11/2026<br><br><strong>VOS SOURCES</strong>${t.tables.map((n) => `<code>${esc(n)}</code>`).join("<br>")}</div>`;
}
function updateNotebook() {
  const count = countNotes();
  $("#start-mission").innerHTML =
    (count || step ? "Reprendre ma mission" : "Choisir ma mission") +
    " " +
    icon("arrow");
  $("#header-note-count").textContent = count;
  $("#header-note-count").setAttribute(
    "aria-label",
    `${count} notes rédigées sur 9`,
  );
  if ($("#workbook-summary"))
    $("#workbook-summary").textContent =
      `Mon cahier · ${count} notes rédigées sur 9`;
  if ($("#companion")) renderCompanion();
}
function openSettings() {
  const el = $("#settings");
  el.open = true;
  $("#session-toggle").setAttribute("aria-expanded", "true");
  el.scrollIntoView({
    behavior: reducedMotion() ? "auto" : "smooth",
    block: "start",
  });
  $("#session-receipt").focus({ preventScroll: true });
}
function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function moveToStudio() {
  const el = $("#studio");
  el.scrollIntoView({
    behavior: reducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}
function selectTrack(id, fromCard = false) {
  saveFields();
  trackId = id;
  if (fromCard) step = 0;
  chartMetric = "primary";
  render();
  persist();
  if (fromCard) {
    moveToStudio();
    $("#main").focus({ preventScroll: true });
  }
}
function render() {
  const t = track(),
    u = UI[trackId];
  $("#track").value = trackId;
  renderMissions();
  $("#steps").innerHTML = STEP_LABELS.map(
    (name, i) =>
      `<button class="step" data-step="${i}" ${i === step ? 'aria-current="step"' : ""}><span class="n">${String(i + 1).padStart(2, "0")}</span><span>${esc(name)}<span class="step-time">${STEP_TIMES[i]}${i === 3 ? " · selon disponibilité" : ""}</span></span></button>`,
  ).join("");
  $("#progress-label").textContent = `Étape ${step + 1} sur 6`;
  $("#progress-percent").textContent =
    Math.round(((step + 1) / 6) * 100) + " %";
  $("#progress-fill").style.width = ((step + 1) / 6) * 100 + "%";
  let html = `<p class="eyebrow">${icon(u.icon)} ${esc(u.tag)} <span>/</span> ÉTAPE 0${step + 1}</p>`;
  if (step === 0)
    html += `<h2>Une bonne décision commence<br>par une bonne question.</h2><p class="step-intro">Bienvenue chez NovaFlow, une entreprise SaaS fictive. Aujourd’hui, vous prenez les commandes de sa ${trackId === "marketing" ? "stratégie d’acquisition" : trackId === "activation" ? "revue commerciale" : trackId === "retention" ? "revue des renouvellements" : "revue du pipeline"}.</p><div class="mission-brief"><span class="brief-label">${icon("target")} Votre mission</span><p>${esc(t.decision)}</p><div class="brief-facts">${u.facts.map((f) => `<span>${esc(f)}</span>`).join("")}</div></div><div class="role-grid"><div class="role-card">${icon("message")}<strong>Vous portez la décision</strong><p>Formulez la question. Interprétez les résultats. Choisissez la prochaine action.</p><span>${esc(t.owner)}</span></div><div class="role-card">${icon("eye")}<strong>Votre binôme challenge la preuve</strong><p>Vérifiez les sources, le périmètre et les calculs. Signalez les limites.</p><span>Partenaire technique</span></div></div><div class="field-grid">${field("team", true)}${field("question", true)}</div><details><summary>Avant de commencer · votre checklist</summary><ol class="checklist"><li>Ouvrez le Genie Agent créé par votre notebook avec votre propre compte.</li><li>Demandez la liste des sources et vérifiez le catalogue et le schéma de votre reçu.</li><li>Reportez vos liens dans « Mes liens Databricks » pour ouvrir Genie en un clic.</li><li>Confirmez la disponibilité de Builder avec le facilitateur.</li></ol>${resourceLinks()}</details><details><summary>Le programme de vos deux heures</summary><table><tbody>${W.agenda.map((a) => `<tr><td>${a[0]}</td><td>${a[1]}</td><td>${a[2]}</td></tr>`).join("")}</tbody></table></details><p class="soft-note">${icon("info")}Ce studio vous guide et conserve vos notes. Les questions et les calculs s’exécutent dans votre Databricks, avec les données synthétiques du kit.</p>`;
  if (step === 1)
    html += `<h2>Posez une question.<br>Ouvrez de nouvelles pistes.</h2><p class="step-intro">Copiez une question, collez-la dans Genie, puis prenez le temps de comprendre sa réponse. Votre curiosité est le meilleur point de départ.</p>${resourceLinks()}${t.questions.map((q, i) => `<article class="question"><div class="question-head"><span><b>0${i + 1}</b>${["Comprendre", "Challenger", "Prendre du recul"][i] || "Approfondir"}</span><span>${i === 0 ? "VOTRE POINT DE DÉPART" : "ALLEZ PLUS LOIN"}</span></div><p id="q${i}">${esc(q)}</p><div class="question-actions"><button class="small" data-copy="q${i}">${icon("copy")} Copier la question ${i + 1}</button><span class="question-purpose">À poser dans votre Genie Agent</span></div></article>`).join("")}<details><summary>Comment reconnaître une réponse solide ?</summary><ol class="checklist"><li>Ouvrez le SQL généré : ses sources, dates et filtres sont-ils les bons ?</li><li>Vérifiez les lignes derrière le résumé. Une réponse plausible ne suffit pas.</li><li>Demandez ce qui manque pour conclure : qualité des données, définition, période ?</li></ol><p>Votre Genie Agent est préparé sur les sources de l’atelier. Si vous utilisez Genie One général, citez ces sources. Genie Code n’est pas requis pour cette enquête métier.</p></details>${field("conversation")}${field("findings")}`;
  if (step === 2)
    html += `<h2>Mettez-vous d’accord<br>sur ce que disent les chiffres.</h2><p class="step-intro">Avant de construire, définissez la même chose avec les mêmes mots. Ce contrat commun évite les bonnes réponses à la mauvaise question.</p><div class="concept-grid">${u.concepts.map(([label, title, description]) => `<div class="concept"><span>${label}</span><strong>${title}</strong><p>${description}</p></div>`).join("")}</div><details><summary>Le contrat métier complet · ${esc(t.query_id)}</summary><p>${esc(t.contract)}</p></details><h3>Votre passage de relais</h3><ol class="checklist"><li>Conservez la conversation, la requête et son résultat.</li><li>Fixez ensemble source, période, unités et exclusions.</li><li>Identifiez les actions qui doivent rester humaines.</li><li>Notez une incertitude et comment la lever.</li></ol>${codeBlock("refsql", t.query_id + " · SQL de référence", W.sql[t.query])}<p class="muted">Pour exécuter ce SQL, choisissez le catalogue et le schéma de votre reçu dans l’éditeur SQL. Fichier : <a href="sql/${t.query}.sql">sql/${t.query}.sql</a>.</p>${field("findings")}`;
  if (step === 3)
    html += `<h2>Donnez une interface<br>à votre idée.</h2><p class="step-intro">Transformez votre analyse en application avec Genie App Builder. Une première version pour apprendre, une amélioration pour la rendre utile.</p>${resourceLinks()}<details class="fallback-panel"><summary>Builder n’est pas disponible dans mon Trial</summary><p>App Builder est en Beta et dépend de la région, des previews et de votre App Space. S’il est indisponible, notez <strong>BLOCKED</strong> et continuez : ${esc(t.fallback)}</p><a href="docs/APP_BUILDER.md">Vérifier les prérequis Builder →</a></details><div class="build-phase"><span class="phase-number">01</span><div><h3>Créez votre première version</h3><p>Dans Apps → Build, sélectionnez l’App Space préparé. Copiez le prompt et observez l’aperçu obtenu.</p></div></div>${codeBlock("build1", "Votre brief, prêt pour App Builder", prompt(t.builder_initial), true)}<div class="build-phase"><span class="phase-number">02</span><div><h3>Améliorez une chose qui compte</h3><p>Ouvrez l’aperçu, vérifiez les résultats et notez un écart réel. Votre observation personnalise le second prompt.</p></div></div>${field("observations")}${codeBlock("build2", "Votre demande d’amélioration", t.builder_iteration)}${field("app")}<p class="soft-note">${icon("info")}Un aperçu et une application publiée se vérifient séparément. L’application attendue lit les données ; elle n’envoie pas de campagne et ne modifie pas de CRM.</p>`;
  if (step === 4)
    html += `<h2>Une belle réponse.<br>Et les preuves qui vont avec.</h2><p class="step-intro">Mettez votre résultat à l’épreuve. Comparez les mêmes données, les mêmes filtres et la même période, puis expliquez les écarts.</p><div id="reference-visual">${referenceVisual()}</div><h3>Vos cinq angles de vérification</h3>${checksTable(t)}${field("verification")}${field("observations")}<details><summary>Sources, accès et limites des références</summary><p>Ces chiffres sont les résultats attendus du jeu synthétique, calculés localement et répétés sur FEVM. Ils ne prouvent pas l’exécution dans votre propre Trial. Conservez votre conversation, le SQL, l’identité, la date et le résultat réellement observé.</p><p>Le propriétaire du Trial peut écrire dans ses tables. Un test de refus exige une seconde identité limitée préparée ; sinon, notez NOT RUN. Ne retirez pas les droits d’un participant pour fabriquer ce test.</p><p>Statuts : PASS, FAIL, BLOCKED, NOT RUN, NOT APPLICABLE avec motif. Une case du cahier ne lance aucun test.</p><p><a href="reference-results.json">Toutes les références</a> · <a href="sql/quality.sql">Qualité des données</a> · <a href="sql/empty.sql">Cas vide</a> · <a href="docs/VALIDATION.md">Périmètre des vérifications</a></p></details>`;
  if (step === 5)
    html += `<h2>La prochaine action<br>vous appartient.</h2><p class="step-intro">Vous avez exploré, challengé et vérifié. Transformez maintenant votre travail en une recommandation que l’équipe peut comprendre en trois minutes.</p><div class="pitch-timing"><div><strong>30 s</strong><span>Le problème</span></div><div><strong>60 s</strong><span>Votre exploration</span></div><div><strong>60 s</strong><span>Preuve et limite</span></div><div><strong>30 s</strong><span>La suite</span></div></div>${field("decision")}${field("owner")}<div id="decision-preview">${decisionPreview()}</div><details class="export-panel" open><summary id="workbook-summary">Mon cahier · ${countNotes()} notes rédigées sur 9</summary><div class="actions"><button id="export-json" class="primary">${icon("download")} Sauvegarder JSON</button><button id="export-md">${icon("file")} Partager Markdown</button><button id="print-notes">${icon("book")} Imprimer</button><button id="import-button">${icon("notebook")} Restaurer JSON</button><input class="hidden" type="file" id="import-file" accept="application/json"></div><p class="muted">JSON conserve vos notes de tous les parcours et environnements. Markdown et impression partagent le parcours actif. Choisissez où partager vos liens et notes ; aucun envoi automatique.</p><details><summary>Relire toutes mes notes</summary>${W.workbook_fields
      .filter(([id]) => !["decision", "owner"].includes(id))
      .map(([id]) => field(id))
      .join("")}</details></details>`;
  html += `<div class="next"><button data-next="-1" ${step === 0 ? "disabled" : ""}>${icon("back")} Précédent</button>${step < 5 ? `<span class="next-hint">PROCHAINE ÉTAPE · ${STEP_LABELS[step + 1].toUpperCase()}</span><button class="primary" data-next="1">${step === 0 ? "Commencer l’exploration" : step === 4 ? "Préparer ma décision" : "Continuer"} ${icon("arrow")}</button>` : `<button class="primary" id="present-bottom">${icon("present")} Présenter ma décision</button>`}</div>`;
  $("#main").innerHTML = html;
  $("#main")
    .querySelectorAll("[data-note]")
    .forEach((el) =>
      el.addEventListener("input", () => {
        notes()[el.dataset.note] = el.value;
        persist();
        if (
          ["decision", "owner"].includes(el.dataset.note) &&
          $("#decision-preview")
        )
          $("#decision-preview").innerHTML = decisionPreview();
      }),
    );
  $("#main")
    .querySelectorAll("[data-copy]")
    .forEach((el) => (el.onclick = () => copyText(el)));
  document
    .querySelectorAll("[data-next]")
    .forEach((el) => (el.onclick = () => go(step + Number(el.dataset.next))));
  document
    .querySelectorAll("[data-step]")
    .forEach((el) => (el.onclick = () => go(Number(el.dataset.step))));
  document
    .querySelectorAll("[data-configure]")
    .forEach((el) => (el.onclick = openSettings));
  bindChart();
  updateNotebook();
  if (step === 5) {
    $("#export-json").onclick = () => exportJSON();
    $("#export-md").onclick = () => {
      saveFields();
      download(`cahier-${trackId}.md`, markdown(), "text/markdown");
      status("Votre cahier Markdown est prêt à partager.");
    };
    $("#print-notes").onclick = printNotes;
    $("#import-button").onclick = () => $("#import-file").click();
    $("#import-file").onchange = restore;
    $("#present-bottom").onclick = present;
  }
}
function go(n) {
  saveFields();
  step = Math.max(0, Math.min(5, n));
  render();
  persist();
  $("#main").focus({ preventScroll: true });
  $("#studio").scrollIntoView({
    behavior: reducedMotion() ? "auto" : "smooth",
    block: "start",
  });
  if (window.innerWidth < 620)
    $("#steps [aria-current]").scrollIntoView({
      block: "nearest",
      inline: "center",
    });
}
async function copyText(el) {
  saveFields();
  if (el.dataset.binding && !bound()) {
    status(
      "Renseignez le catalogue et le schéma confirmés dans « Mes liens Databricks » avant de copier ce prompt.",
      true,
    );
    openSettings();
    return;
  }
  let value = document.getElementById(el.dataset.copy).textContent;
  if (el.dataset.copy === "build2") {
    if (!notes().observations?.trim()) {
      status(
        "Consignez d’abord un écart ou une amélioration réellement observé.",
        true,
      );
      const input = $('[data-note="observations"]');
      input.focus();
      return;
    }
    value += "\n\nObservations de notre binôme :\n" + notes().observations;
  }
  let ok = false;
  try {
    await navigator.clipboard.writeText(value);
    ok = true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "-9999px";
    document.body.append(ta);
    ta.select();
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    el.focus();
  }
  if (ok) {
    const original = el.innerHTML;
    el.innerHTML = icon("check") + " Copié !";
    el.closest(".question")?.classList.add("copied");
    setTimeout(() => {
      if (el.isConnected) {
        el.innerHTML = original;
        el.closest(".question")?.classList.remove("copied");
      }
    }, 2300);
    status(
      el.dataset.copy.startsWith("q")
        ? "Question copiée. Ouvrez Genie et collez-la dans la conversation."
        : "Copié. Collez ce contenu dans votre espace Databricks.",
    );
  } else
    status(
      "Copie indisponible : ouvrez le bloc et sélectionnez son texte.",
      true,
    );
}
function decisionPreview() {
  return `<div class="decision-preview"><p class="eyebrow">VOTRE DÉCISION PREND FORME</p><p class="pitch-quote ${notes().decision?.trim() ? "" : "pitch-placeholder"}">${esc(notes().decision?.trim() || "Votre recommandation apparaîtra ici, avec vos propres mots.")}</p><p class="pitch-action">${esc(notes().owner?.trim() || "Ajoutez une prochaine action, un responsable et une date.")}</p><button data-present>${icon("present")} Passer en mode présentation</button></div>`;
}
function present() {
  saveFields();
  if (!notes().decision?.trim()) {
    status("Rédigez votre décision avant de la présenter.", true);
    $('[data-note="decision"]').focus();
    return;
  }
  $("#presentation-content").innerHTML =
    `<p class="eyebrow">AWS × DATABRICKS / STATION F / 24 NOVEMBRE 2026</p><h2>${esc(UI[trackId].title)}</h2><blockquote>${esc(notes().decision)}</blockquote><div class="presentation-columns"><div><strong>Notre preuve et nos limites</strong><p>${esc(notes().verification?.trim() || notes().findings?.trim() || "Preuves et limites à compléter dans le cahier.")}</p></div><div><strong>Notre prochaine action</strong><p>${esc(notes().owner?.trim() || "Responsable et échéance à préciser.")}</p></div></div><div class="presentation-footer"><span>${esc(notes().team?.trim() || "Votre équipe")}</span><span>NovaFlow · Données synthétiques au 17/11/2026</span></div>`;
  $("#presentation-dialog").showModal();
}
// The preview is replaced while typing; delegation keeps its presentation button active.
$("#main").addEventListener("click", (event) => {
  if (event.target.closest("[data-present]")) present();
});
function markdown() {
  return (
    `# Cahier STATION F — ${track().title}\n\nDataset : ${W.dataset}\nEnvironnement : ${memory.bindings.workspace_url || "local / non configuré"}\n\n` +
    W.workbook_fields
      .map(
        ([id, label]) => `## ${label}\n\n${notes()[id] || "Non renseigné"}\n`,
      )
      .join("\n")
  );
}
function download(name, value, type) {
  const blob = new Blob([value], { type: type + ";charset=utf-8" });
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportJSON() {
  saveFields();
  download(
    "cahier-stationf.json",
    JSON.stringify(memory, null, 2),
    "application/json",
  );
  status(
    "Votre sauvegarde JSON contient toutes vos notes. Conservez-la pour les retrouver ailleurs.",
  );
}
function printNotes() {
  saveFields();
  const pop = window.open("", "_blank");
  if (!pop) {
    status("Autorisez la fenêtre d’impression ou exportez en Markdown.", true);
    return;
  }
  pop.document.write(
    '<!doctype html><html lang="fr"><meta charset="utf-8"><title>Cahier de décision</title><body><pre style="white-space:pre-wrap;font:14px/1.7 sans-serif">' +
      esc(markdown()) +
      "</pre></body></html>",
  );
  pop.document.close();
  pop.print();
}
async function restore(event) {
  const f = event.target.files[0];
  if (!f) return;
  try {
    if (f.size > 2e6) throw Error("Fichier trop volumineux");
    const data = JSON.parse(await f.text());
    if (
      data.version !== 1 ||
      !data.notes ||
      typeof data.notes !== "object" ||
      Array.isArray(data.notes)
    )
      throw Error("Format de cahier inconnu");
    const clean = {};
    for (const [key, value] of Object.entries(data.notes)) {
      if (
        ["__proto__", "constructor", "prototype"].includes(key) ||
        typeof value !== "object" ||
        !value ||
        Array.isArray(value)
      )
        throw Error("Notes invalides");
      clean[key] = {};
      for (const [id] of W.workbook_fields) {
        if (value[id] !== undefined && typeof value[id] !== "string")
          throw Error("Note invalide");
        if (value[id] !== undefined) clean[key][id] = value[id];
      }
    }
    for (const [key, value] of Object.entries(clean))
      memory.notes[key] = { ...(memory.notes[key] || {}), ...value };
    persist();
    render();
    status(
      "Cahier restauré. Vos liens actuels sont conservés ; chaque note reste associée à son environnement.",
    );
  } catch (error) {
    status("Import refusé : " + error.message, true);
  }
}
const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
function referenceVisual() {
  const data = W.reference?.[track().query];
  if (!data)
    return '<p class="notice">Références visuelles indisponibles. Consultez reference-results.json dans le kit.</p>';
  let rows, title, unit, caption, controls, columns;
  if (trackId === "marketing") {
    const cost = chartMetric === "secondary";
    title = cost
      ? "Coût d’acquisition par nouveau client"
      : "ROAS attribué par canal";
    unit = cost ? "EUR / client" : "ratio";
    rows = data.map((r) => ({
      label: r.channel,
      value: cost ? r.acquisition_cost_eur : r.attributed_roas,
    }));
    caption =
      "Semaines complètes du 21/09 au 09/11/2026. Paid Social : 6 sur 8 ; 8 000 EUR de dépenses exclues. Coût d’acquisition non calculable si aucun nouveau client. Attribution non causale.";
    controls = [
      ["primary", "ROAS attribué"],
      ["secondary", "Coût d’acquisition"],
    ];
    columns = [
      ["channel", "Canal"],
      ["weeks_complete", "Semaines complètes"],
      ["spend_excluded_eur", "Dépenses exclues EUR"],
      ["attributed_roas", "ROAS"],
      ["acquisition_cost_eur", "Coût EUR/client"],
    ];
  }
  if (trackId === "activation") {
    const mrr = chartMetric === "secondary";
    title = mrr ? "MRR mensuel par groupe" : "Comptes par groupe d’engagement";
    unit = mrr ? "EUR / mois" : "comptes";
    rows = data.map((r) => ({
      label: r.engagement_tier,
      value: mrr ? r.mrr_eur : r.accounts,
    }));
    caption =
      "240 comptes au 17/11/2026. Groupes exclusifs selon A1. Le groupe Preuve insuffisante ne permet pas de conclure sur l’engagement. Le MRR est un montant mensuel observé.";
    controls = [
      ["primary", "Nombre de comptes"],
      ["secondary", "MRR mensuel"],
    ];
    columns = [
      ["engagement_tier", "Groupe"],
      ["accounts", "Comptes"],
      ["mrr_eur", "MRR EUR/mois"],
      ["eligible_for_review", "Éligibles à une revue"],
    ];
  }
  if (trackId === "retention") {
    title = "MRR des comptes à examiner";
    unit = "EUR / mois";
    rows = data.map((r) => ({ label: r.account_id, value: r.mrr_eur }));
    caption =
      "Renouvellements du 17/11 au 17/12/2026 inclus. Baisse d’usage strictement > 40 %, base positive et télémétrie complète. Ce MRR ne représente pas un revenu perdu.";
    controls = [];
    columns = [
      ["account_id", "Compte"],
      ["company", "Entreprise fictive"],
      ["mrr_eur", "MRR EUR/mois"],
      ["renewal_date", "Renouvellement"],
      ["activity_drop_pct", "Baisse %"],
    ];
  }
  if (trackId === "sales") {
    const weighted = chartMetric === "secondary";
    title = weighted
      ? "Pipeline pondéré pédagogique"
      : "Pipeline ouvert vérifié";
    unit = "EUR";
    rows = data.map((r) => ({
      label: { FR: "France", DE: "Allemagne", GB: "Royaume-Uni" }[r.country],
      value: weighted ? r.weighted_pipeline_eur : r.open_pipeline_eur,
    }));
    caption =
      "Décembre 2026, données au 17/11/2026. Étapes Discovery, Evaluation, Negotiation ; montants vérifiés uniquement. La pondération pédagogique n’est pas une prévision ML.";
    controls = [
      ["primary", "Montant brut"],
      ["secondary", "Pondéré pédagogique"],
    ];
    columns = [
      ["country", "Pays"],
      ["opportunities", "Opportunités"],
      ["open_pipeline_eur", "Brut EUR"],
      ["weighted_pipeline_eur", "Pondéré EUR"],
      ["stale_pipeline_eur", "Inactif EUR"],
    ];
  }
  const max = Math.max(...rows.map((r) => r.value ?? 0), 1);
  const digits =
    trackId === "marketing" ? (chartMetric === "secondary" ? 2 : 4) : 0;
  return `<section class="reference-panel" aria-label="Référence locale du jeu synthétique"><div class="reference-header"><div><strong>${title}</strong><span>Jeu d’essai NovaFlow · référence ${track().query_id}</span></div><span class="reference-badge">RÉSULTAT ATTENDU · HORS LIGNE</span></div>${controls.length ? `<div class="chart-controls" role="group" aria-label="Indicateur de référence">${controls.map(([key, label]) => `<button data-chart="${key}" aria-pressed="${chartMetric === key}">${label}</button>`).join("")}</div>` : ""}<div class="reference-chart" role="img" aria-label="${esc(title)} en ${unit}, échelle de zéro à ${formatNumber(max, digits)}. ${rows.map((r) => r.label + " : " + (r.value === null ? "non calculable" : formatNumber(r.value, digits))).join(" ; ")}">${rows.map((r) => `<div class="bar-row"><span class="bar-label">${esc(r.label)}</span><div class="bar-track"><div class="bar-fill" style="width:${r.value === null ? 0 : (r.value / max) * 100}%"></div></div><span class="bar-value ${r.value === null ? "null" : ""}">${r.value === null ? "Non calculable" : formatNumber(r.value, digits)}</span></div>`).join("")}<div class="chart-axis"><span>0</span><span>${formatNumber(max, digits)} ${unit}</span></div></div><p class="reference-caption">${caption} Source : <a href="reference-results.json">reference-results.json</a> · dataset ${W.dataset}.</p><details><summary>Lire les valeurs et les unités dans un tableau</summary><div class="tablewrap"><table><thead><tr>${columns.map(([, name]) => `<th>${esc(name)}</th>`).join("")}</tr></thead><tbody>${data.map((row) => `<tr>${columns.map(([key]) => `<td>${row[key] === null ? "Non calculable" : typeof row[key] === "number" ? formatNumber(row[key], key.includes("roas") ? 4 : Number.isInteger(row[key]) ? 0 : 2) : esc(row[key])}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details></section>`;
}
function bindChart() {
  document.querySelectorAll("[data-chart]").forEach(
    (button) =>
      (button.onclick = () => {
        chartMetric = button.dataset.chart;
        $("#reference-visual").innerHTML = referenceVisual();
        bindChart();
        $(`[data-chart="${chartMetric}"]`).focus();
      }),
  );
}
function initBindings() {
  const labels = {
    workspace_url: [
      "URL du workspace (HTTPS)",
      "https://votre-workspace.cloud.databricks.com",
    ],
    catalog: ["Catalogue confirmé", "Copiez le catalogue du reçu"],
    schema: ["Schéma confirmé", "stationf_20261124_votre_equipe"],
    warehouse_id: ["Warehouse ID", "16 caractères depuis le reçu"],
    genie_url: ["URL du Genie Agent", "Le lien Genie affiché par le notebook"],
    app_space_url: ["URL App Space / Builder", "Si Builder a été préparé"],
  };
  $("#binding-fields").innerHTML = Object.entries(labels)
    .map(
      ([id, [label, hint]]) =>
        `<label class="field"><span>${label}</span><input id="binding-${id}" value="${esc(memory.bindings[id] || "")}" placeholder="${esc(hint)}" autocomplete="off"></label>`,
    )
    .join("");
  $("#binding-status").textContent = bound()
    ? "Sources renseignées. Vérifiez leur disponibilité et vos droits dans Databricks."
    : "Retrouvez ces informations dans « Mon reçu et mes liens » du notebook.";
  $("#session-label").textContent = bound()
    ? "Mes liens sont renseignés"
    : "Mes liens Databricks";
  $("#session-dot").classList.toggle("configured", bound());
}
$("#save-bindings").onclick = () => {
  saveFields();
  const b = { ...memory.bindings };
  for (const key of [
    "workspace_url",
    "catalog",
    "schema",
    "warehouse_id",
    "genie_url",
    "app_space_url",
  ]) {
    b[key] = $("#binding-" + key).value.trim();
    if (key.endsWith("_url") && b[key] && !safeLink(b[key])) {
      $("#binding-status").textContent =
        "Les liens doivent être des URL HTTPS sans identifiants.";
      $("#manual-settings").open = true;
      $("#binding-" + key).focus();
      return;
    }
  }
  for (const key of ["catalog", "schema"])
    if (b[key] && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(b[key])) {
      $("#binding-status").textContent =
        "Utilisez le nom exact du reçu : ce kit accepte lettres, chiffres et underscore. Le facilitateur peut vous aider.";
      $("#manual-settings").open = true;
      $("#binding-" + key).focus();
      return;
    }
  memory.bindings = b;
  persist();
  initBindings();
  render();
  $("#settings").open = false;
  $("#session-toggle").setAttribute("aria-expanded", "false");
  $("#session-toggle").focus();
  status(
    "Vos liens sont enregistrés ici. Les notes de votre ancien environnement sont conservées séparément.",
  );
};
$("#use-receipt").onclick = () => {
  try {
    const raw = $("#session-receipt").value.trim();
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw Error("Collez le bloc JSON complet du reçu.");
    const keys = [
      "workspace_url",
      "catalog",
      "schema",
      "warehouse_id",
      "genie_url",
      "app_space_url",
    ];
    for (const key of ["workspace_url", "catalog", "schema"])
      if (typeof data[key] !== "string" || !data[key].trim())
        throw Error("Le reçu doit contenir workspace_url, catalog et schema.");
    const next = { ...memory.bindings };
    let found = 0;
    for (const key of keys) {
      if (data[key] === undefined || data[key] === "") continue;
      if (typeof data[key] !== "string")
        throw Error("Valeur invalide pour " + key + ".");
      const value = data[key].trim();
      if (key.endsWith("_url") && !safeLink(value))
        throw Error("Le reçu doit contenir des liens HTTPS sans identifiants.");
      if (
        ["catalog", "schema"].includes(key) &&
        !/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)
      )
        throw Error(
          "Le catalogue ou schéma du reçu est incompatible avec ce kit.",
        );
      if (key === "warehouse_id" && !/^[a-fA-F0-9]{16}$/.test(value))
        throw Error(
          "Le warehouse ID du reçu doit contenir 16 caractères hexadécimaux.",
        );
      next[key] = value;
      found++;
    }
    if (!found)
      throw Error(
        "Aucun lien d’atelier trouvé. Copiez le bloc « Bindings à reporter dans le portail ».",
      );
    if (
      ["workspace_url", "catalog", "schema"].some(
        (key) => next[key] !== memory.bindings[key],
      )
    ) {
      for (const key of keys)
        if (data[key] === undefined || data[key] === "") next[key] = "";
    }
    saveFields();
    memory.bindings = next;
    $("#session-receipt").value = "";
    $("#receipt-status").textContent = "";
    persist();
    initBindings();
    render();
    $("#settings").open = false;
    $("#session-toggle").setAttribute("aria-expanded", "false");
    $("#session-toggle").focus();
    status(
      "Liens du reçu importés. Votre identité et les autres champs du reçu ne sont pas conservés.",
    );
  } catch (error) {
    $("#receipt-status").textContent =
      error instanceof SyntaxError
        ? "JSON invalide. Copiez uniquement le bloc entre les accolades { et }."
        : error.message;
    $("#receipt-status").classList.add("bad");
  }
};
$("#track").innerHTML = W.tracks
  .map(
    (t) =>
      `<option value="${t.id}">${UI[t.id].short} · ${UI[t.id].title}</option>`,
  )
  .join("");
$("#track").onchange = (event) => selectTrack(event.target.value);
$("#start-mission").onclick = () => {
  if (countNotes() || step) {
    moveToStudio();
    $("#main").focus({ preventScroll: true });
    return;
  }
  $("#missions").scrollIntoView({
    behavior: reducedMotion() ? "auto" : "smooth",
    block: "start",
  });
  $("#mission-cards [aria-pressed=true]").focus({ preventScroll: true });
};
$("#open-workbook").onclick = () => go(5);
$("#session-toggle").onclick = () => {
  if ($("#settings").open) {
    $("#settings").open = false;
    $("#session-toggle").setAttribute("aria-expanded", "false");
  } else openSettings();
};
$("#open-help").onclick = () => $("#help-dialog").showModal();
$("#help-session").onclick = () => {
  $("#help-dialog").close();
  openSettings();
};
document
  .querySelectorAll("[data-close-dialog]")
  .forEach(
    (button) => (button.onclick = () => button.closest("dialog").close()),
  );
document.querySelectorAll("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  }),
);
$("#settings").addEventListener("toggle", () =>
  $("#session-toggle").setAttribute(
    "aria-expanded",
    String($("#settings").open),
  ),
);
hydrateIcons();
initBindings();
render();
if (!storageOK) status("Stockage indisponible : utilisez l’export JSON.", true);
