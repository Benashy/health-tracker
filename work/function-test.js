const fs = require("fs");
const vm = require("vm");

class ClassList {
  constructor() {
    this.items = new Set();
  }

  toggle(name, force) {
    if (force === undefined ? !this.items.has(name) : force) this.items.add(name);
    else this.items.delete(name);
  }

  add(name) {
    this.items.add(name);
  }

  remove(name) {
    this.items.delete(name);
  }

  contains(name) {
    return this.items.has(name);
  }
}

class Element {
  constructor(id = "") {
    this.id = id;
    this.value = "";
    this.textContent = "";
    this.innerHTML = "";
    this.disabled = false;
    this.files = [];
    this.dataset = {};
    this.listeners = {};
    this.classList = new ClassList();
  }

  addEventListener(name, handler) {
    this.listeners[name] = handler;
  }

  click() {
    this.clicked = true;
  }

  focus() {
    this.focused = true;
  }

  scrollIntoView() {
    this.scrolledIntoView = true;
  }

  reset() {
    this.resetCalled = true;
  }

  closest() {
    return null;
  }
}

function createDocument() {
  const ids = [
    "profileForm",
    "authPanel",
    "authForm",
    "authStatus",
    "authEmail",
    "authPassword",
    "magicLinkButton",
    "onboardingPanel",
    "onboardingTitle",
    "onboardingText",
    "focusEntryButton",
    "focusImportButton",
    "profileCards",
    "personField",
    "benName",
    "benDob",
    "benHeight",
    "angelikaName",
    "angelikaDob",
    "angelikaHeight",
    "personInput",
    "resultForm",
    "markerInput",
    "metricSearchInput",
    "quickMetricPanel",
    "entryAssist",
    "trendMetricInput",
    "trendPanel",
    "unitInput",
    "lowField",
    "highField",
    "lowLabel",
    "highLabel",
    "lowInput",
    "highInput",
    "rangeEditButton",
    "rangeHint",
    "dateInput",
    "sampleDateInput",
    "valueInput",
    "notesInput",
    "sourceTypeInput",
    "sourceConfidenceInput",
    "sourceNotesInput",
    "sourceDocumentInput",
    "resultsBody",
    "emptyState",
    "totalResults",
    "flaggedResults",
    "dueSoonResults",
    "nextDueCard",
    "nextDueDate",
    "snapshotSection",
    "snapshotUpdated",
    "snapshotEditButton",
    "snapshotEditor",
    "snapshotCancelButton",
    "snapshotMetric1",
    "snapshotMetric2",
    "snapshotMetric3",
    "snapshotMetric4",
    "snapshotGrid",
    "snapshotList",
    "markerSummary",
    "schedulePanel",
    "exportCsvButton",
    "exportChatGptButton",
    "exportReviewPackButton",
    "importChatGptButton",
    "importChatGptInput",
    "importReviewModal",
    "importReviewContent",
    "cancelImportButton",
    "discardImportButton",
    "confirmImportButton",
    "metricContextModal",
    "metricContextTitle",
    "metricContextSubtitle",
    "metricContextContent",
    "closeContextButton",
    "syncStatus",
    "manualRefreshButton",
    "appVersion",
    "signOutButton",
    "resetButton",
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, new Element(id)]));
  const classes = {
    ".results-table-wrap": new Element("results-table-wrap"),
    ".filters": new Element("filters"),
    ".status-strip": new Element("status-strip"),
  };
  const filterButtons = ["all", "flagged", "due", "latest"].map((filter) => {
    const button = new Element(`filter-${filter}`);
    button.dataset.filter = filter;
    button.classList.add("filter-button");
    return button;
  });

  return {
    elements,
    createElement() {
      return new Element();
    },
    querySelector(selector) {
      if (selector.startsWith("#")) return elements[selector.slice(1)];
      return classes[selector] ?? null;
    },
    querySelectorAll(selector) {
      if (selector === ".filter-button") return filterButtons;
      return [];
    },
  };
}

function createContext() {
  const document = createDocument();
  const store = {};
  const context = {
    console,
    document,
    localStorage: {
      getItem: (key) => store[key] ?? null,
      setItem: (key, value) => {
        store[key] = String(value);
      },
      removeItem: (key) => {
        delete store[key];
      },
    },
    window: {
      crypto: { randomUUID: () => `id-${Math.random().toString(16).slice(2)}` },
      alert: (message) => {
        context.lastAlert = message;
      },
      confirm: () => true,
      addEventListener: () => {},
      location: { href: "file:///test/index.html", protocol: "file:", reload: () => { context.reloaded = true; } },
    },
    navigator: { onLine: true },
    Blob: class Blob {
      constructor(parts, options) {
        context.lastBlob = { parts, options };
      }
    },
    URL: {
      createObjectURL: () => "blob:test",
      revokeObjectURL: () => {},
    },
    FileReader: class FileReader {},
    Intl,
    Date,
    Math,
    JSON,
    String,
    Number,
    Array,
    Set,
    Map,
  };
  context.window.localStorage = context.localStorage;
  context.window.URL = context.URL;
  context.window.Blob = context.Blob;
  context.window.navigator = context.navigator;
  return { context, document, store };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const { context, document, store } = createContext();
vm.createContext(context);
vm.runInContext(fs.readFileSync("app.js", "utf8"), context);

assert(context.importChatGptPayload, "import function should be exposed");
assert(!fs.readFileSync("app.js", "utf8").includes('name: "BMI"'), "BMI metric should not exist");
assert(fs.readFileSync("index.html", "utf8").includes("Import from ChatGPT"), "import button should exist");
const indexHtml = fs.readFileSync("index.html", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8"));
const serviceWorker = fs.readFileSync("service-worker.js", "utf8");
const supabaseSql = fs.readFileSync("supabase/health_dashboard_data.sql", "utf8");
assert(indexHtml.includes("app.js?v=0.36"), "script should use cache-busting version");
assert(indexHtml.includes("supabase-config.js?v=0.36"), "Supabase config should be loaded before the app");
assert(fs.readFileSync("supabase-config.js", "utf8").includes("HEALTH_TRACKER_SUPABASE"), "Supabase config placeholder should exist");
assert(indexHtml.includes('rel="manifest"'), "PWA manifest should be linked");
assert(indexHtml.includes("authPanel"), "cloud auth panel should exist");
assert(indexHtml.includes("data-private"), "private dashboard sections should be hidden before sign-in");
assert(indexHtml.includes("Prepare AI Review"), "AI review action should be clearly named");
assert(indexHtml.includes("Current snapshot"), "current health snapshot section should exist");
assert(indexHtml.includes("snapshotEditor"), "snapshot editor should exist");
assert(indexHtml.includes("entryAssist"), "entry assist area should exist");
assert(indexHtml.includes("metricContextModal"), "metric context modal should exist");
assert(indexHtml.indexOf("authPanel") < indexHtml.indexOf("profile-section"), "account should appear before profile details");
assert(indexHtml.indexOf("profile-section") < indexHtml.indexOf("snapshotSection"), "profile details should appear before current snapshot");
assert(indexHtml.indexOf("snapshotSection") < indexHtml.indexOf("status-strip"), "current snapshot should appear before overview tiles");
assert(indexHtml.indexOf("status-strip") < indexHtml.indexOf("schedule-section"), "overview tiles should appear before due soon");
assert(indexHtml.includes("privacy-guard.js?v=0.36"), "privacy guard should be cache-busted");
assert(serviceWorker.includes("privacy-guard.js?v=0.36"), "privacy guard should be cached with the app shell");
assert(/<label>\s*Date\s*<input id="dateInput"/.test(indexHtml), "measurement form should show one date field");
assert(!indexHtml.includes(">Sample date"), "measurement form should not show a separate sample date field");
assert(indexHtml.includes('<label class="hidden" id="lowField">'), "default weight form should hide lower limit before JavaScript runs");
assert(indexHtml.includes("<span id=\"highLabel\">Target</span>"), "default weight form should label the high field as target");
assert(!indexHtml.includes("Find metric"), "metric search box should not be visible");
assert(!indexHtml.includes("Saved in your private account"), "entry panel should avoid redundant private account copy");
assert(!indexHtml.includes("Source note"), "source note field should not be visible");
assert(!indexHtml.includes("Source document"), "source document field should not be visible");
assert(!indexHtml.includes("Designed for long-term prevention"), "bottom explanatory note should be removed");
assert(!indexHtml.includes("Clear data"), "clear data should not be a visible top-level action");
assert(indexHtml.includes("Range / target"), "results table should label ranges and targets");
assert(indexHtml.includes("Current</button>"), "results should default to a current-results view");
assert(indexHtml.includes("Archive</button>"), "results should keep a separate archive view");
assert(indexHtml.includes("next due"), "summary strip should show next due instead of latest measurement");
assert(!indexHtml.includes("latest measurement"), "summary strip should not show redundant latest measurement tile");
assert(indexHtml.includes("nextDueCard"), "next due tile should have a dedicated status card");
assert(indexHtml.includes("apple-mobile-web-app-capable"), "iOS PWA metadata should exist");
assert(manifest.display === "standalone", "manifest should enable standalone display");
assert(manifest.icons.some((icon) => icon.src.includes("app-icon-192.png")), "manifest should include 192px PNG icon");
assert(manifest.icons.some((icon) => icon.src.includes("app-icon-512.png")), "manifest should include 512px PNG icon");
assert(indexHtml.includes("app-icon-180.png?v=0.36"), "iOS touch icon should use PNG");
assert(serviceWorker.includes("health-dashboard-v0.36"), "service worker cache should match app version");
assert(serviceWorker.includes("app.js?v=0.36"), "service worker should cache current app bundle");
assert(serviceWorker.includes("supabase-config.js?v=0.36"), "service worker should cache Supabase config placeholder");
assert(serviceWorker.includes("app-icon-512.png?v=0.36"), "service worker should cache PNG app icons");
assert(supabaseSql.includes("revoke all privileges on table public.health_dashboard_data from anon"), "Supabase SQL should revoke anon table access");
assert(supabaseSql.includes("Approved users can read their own health dashboard data"), "Supabase SQL should use approved-user RLS policies");
assert(supabaseSql.includes("angelika_kleczka@hotmail.com"), "Supabase SQL should restrict to Angelika's approved email");
assert(document.elements.appVersion.textContent === "v0.36", "footer should show app version");
assert(document.elements.nextDueDate.textContent, "next due summary should render a value");
assert(
  document.elements.nextDueCard.classList.contains("due-now") ||
    document.elements.nextDueCard.classList.contains("overdue") ||
    document.elements.nextDueDate.textContent !== "Now",
  "next due card should be colour-coded when due now or overdue",
);
assert(document.elements.syncStatus.textContent.includes("Local"), "footer should show local sync status");
assert(document.elements.authPanel.classList.contains("hidden"), "auth panel should hide until Supabase is configured");
assert(context.getWarningDays(14) === 2, "14-day checks should only warn close to due date");
assert(context.getWarningDays(30) === 3, "30-day checks should warn within three days");
assert(context.getWarningDays(90) === 7, "quarterly checks should warn within seven days");
assert(context.getWarningDays(180) === 14, "six-month checks should warn within fourteen days");
assert(context.getWarningDays(365) === 30, "annual checks should warn within thirty days");
assert(context.getWarningDays(1825) === 90, "multi-year checks should warn within ninety days");
assert(context.getStatusClass("Recorded") === "recorded", "recorded status should use informational styling");
assert(context.getDisplayGroupForMetric("LDL") === "Cardiovascular", "LDL should be grouped with cardiovascular metrics");

document.elements.personInput.value = "ben";
document.elements.markerInput.value = "LDL";
context.syncMetricDefaults();
assert(document.elements.highLabel.textContent === "Reference upper limit", "LDL should use reference range labels");
assert(!document.elements.lowField.classList.contains("hidden"), "LDL should show lower limit field");
assert(document.elements.lowInput.value === "", "LDL lower limit should be blank/null");
assert(String(document.elements.highInput.value) === "115", "LDL upper default should load");
assert(document.elements.highInput.disabled === false, "first range entry should be editable");
assert(document.elements.sourceTypeInput.value === "Lab Report / PDF", "LDL should default to lab source");
assert(document.elements.sourceConfidenceInput.value === "High", "lab source should be high confidence");
assert(document.elements.entryAssist.innerHTML.includes("Cardiovascular"), "entry assist should show the selected metric group");
assert(document.elements.entryAssist.innerHTML.includes("Range set on first entry"), "entry assist should explain first range entry");

context.populateMetrics();
assert(document.elements.markerInput.innerHTML.includes("Glucose"), "metric dropdown should retain all metrics");
context.selectMetric("Weight");
assert(document.elements.sourceTypeInput.value === "Manual Measurement", "weight should default to manual source");
assert(document.elements.highLabel.textContent === "Target", "weight should use target label");
assert(document.elements.lowField.classList.contains("hidden"), "weight should hide lower limit field");
assert(document.elements.lowInput.disabled === true, "weight lower limit should be disabled");
context.selectMetric("LDL");

document.elements.dateInput.value = "2026-01-15";
document.elements.valueInput.value = "130";
document.elements.highInput.value = "115";
document.elements.sourceNotesInput.value = "Imported lab PDF";
document.elements.sourceDocumentInput.value = "Rel21832308_06_06_2026.pdf";
context.addResult({ preventDefault() {} });
let results = JSON.parse(store["blood-results-tracker:v3"]);
assert(results.length === 1, "one result should be saved");
assert(results[0].test_date === "2026-01-15" && results[0].sample_date === "2026-01-15", "single date should populate both stored dates");
assert(results[0].status_vs_range === "Outside range", "LDL 130 over 115 should be outside range");
assert(results[0].source_type === "Lab Report / PDF", "source type should save");
assert(results[0].source_confidence === "High", "source confidence should save");
assert(results[0].linked_source_document === "Rel21832308_06_06_2026.pdf", "linked source document should save");
assert(JSON.parse(store["health-dashboard-reference-ranges:v1"])["ben:LDL"].high === 115, "range should be saved per person and metric");

document.elements.personInput.value = "ben";
document.elements.markerInput.value = "LDL";
context.syncMetricDefaults();
assert(document.elements.highInput.disabled === true, "saved range should lock on repeat entry");
context.toggleRangeEditing();
assert(document.elements.highInput.disabled === false, "edit range should unlock limits");

document.elements.dateInput.value = "2026-06-15";
document.elements.valueInput.value = "100";
document.elements.highInput.value = "115";
context.addResult({ preventDefault() {} });
results = JSON.parse(store["blood-results-tracker:v3"]);
const latestLdl = results.find((result) => result.sample_date === "2026-06-15" && result.metric === "LDL");
assert(latestLdl.previous_result === 130, "previous LDL should be captured");
assert(latestLdl.trend_direction === "Improved", "lower LDL should be improved");
assert(document.elements.quickMetricPanel.innerHTML.includes("Waist circumference"), "quick metrics should include the fixed frequent body metric");
assert(document.elements.quickMetricPanel.innerHTML.includes("Resting heart rate"), "quick metrics should include the fixed frequent vital metric");
assert(!document.elements.quickMetricPanel.innerHTML.includes("LDL"), "quick metrics should leave blood tests in the dropdown");
context.focusMetricEntry("ben", "Blood pressure systolic");
assert(document.elements.markerInput.value === "Blood pressure systolic", "due item click should select the requested metric");
assert(document.elements.quickMetricPanel.innerHTML.includes('quick-metric-button active" data-metric-name="Blood pressure systolic"'), "due item click should highlight matching quick metric");
context.focusMetricEntry("ben", "LDL");
assert(document.elements.markerInput.value === "LDL", "due item click should select non-quick metrics too");
assert(!document.elements.quickMetricPanel.innerHTML.includes("quick-metric-button active"), "non-quick due metric should clear quick metric highlight");
document.elements.markerInput.value = "Blood pressure diastolic";
document.elements.markerInput.listeners.change();
assert(document.elements.quickMetricPanel.innerHTML.includes('quick-metric-button active" data-metric-name="Blood pressure diastolic"'), "dropdown changes should refresh quick metric highlight");
assert(!document.elements.entryAssist.innerHTML.includes("Next:"), "entry assist should not show follow-on metric prompts");
vm.runInContext('state.activeProfileId = null;', context);
assert(context.getStatus({
  metric: "Blood pressure systolic",
  metric_type: "numeric",
  result_value: "112",
  reference_lower_limit: null,
  reference_upper_limit: 120,
}) === "In range", "normal systolic blood pressure should not be near limit");
assert(context.getStatus({
  metric: "Blood pressure diastolic",
  metric_type: "numeric",
  result_value: "75",
  reference_lower_limit: null,
  reference_upper_limit: 80,
}) === "In range", "normal diastolic blood pressure should not be near limit");
assert(context.getStatus({
  metric: "Urine specific gravity",
  metric_type: "numeric",
  result_value: "1.01",
  reference_lower_limit: 1.01,
  reference_upper_limit: 1.02,
}) === "In range", "urine specific gravity should not be amber because of a tiny range");
assert(context.isActionableWarning({
  metric: "Lipoprotein(a)",
  status_vs_range: "Outside range",
}) === false, "Lp(a) should be risk context rather than an actionable warning");
assert(context.isActionableWarning({
  metric: "LDL",
  status_vs_range: "Outside range",
}) === true, "LDL outside range should remain actionable");
assert(context.getTrendDirection(3, {
  metric: "Blood pressure systolic",
  metric_type: "numeric",
  result_value: 115,
  reference_lower_limit: null,
  reference_upper_limit: 120,
  trend_goal: "lower",
}, {
  metric: "Blood pressure systolic",
  metric_type: "numeric",
  result_value: 112,
  reference_lower_limit: null,
  reference_upper_limit: 120,
}) === "Stable", "small in-range systolic changes should not be labelled worse");
assert(context.getTrendDirection(4, {
  metric: "LDL",
  metric_type: "numeric",
  result_value: 104,
  reference_lower_limit: null,
  reference_upper_limit: 115,
  trend_goal: "lower",
}, {
  metric: "LDL",
  metric_type: "numeric",
  result_value: 100,
  reference_lower_limit: null,
  reference_upper_limit: 115,
}) === "Stable", "small LDL changes should be treated as stable");
assert(context.getTrendDirection(10, {
  metric: "LDL",
  metric_type: "numeric",
  result_value: 110,
  reference_lower_limit: null,
  reference_upper_limit: 115,
  trend_goal: "lower",
}, {
  metric: "LDL",
  metric_type: "numeric",
  result_value: 100,
  reference_lower_limit: null,
  reference_upper_limit: 115,
}) === "Worse", "meaningful LDL increases should still be labelled worse");
assert(context.getMaterialChanges([
  {
    id: "bp-old",
    profile_id: "ben",
    metric: "Blood pressure systolic",
    metric_type: "numeric",
    result_value: 100,
    reference_lower_limit: null,
    reference_upper_limit: 120,
    status_vs_range: "In range",
    sample_date: "2026-01-01",
    test_date: "2026-01-01",
  },
  {
    id: "bp-new",
    profile_id: "ben",
    metric: "Blood pressure systolic",
    metric_type: "numeric",
    result_value: 115,
    reference_lower_limit: null,
    reference_upper_limit: 120,
    status_vs_range: "In range",
    previous_result: 100,
    absolute_change_since_previous_test: 15,
    percentage_change_since_previous_test: 15,
    trend_direction: "Stable",
    sample_date: "2026-02-01",
    test_date: "2026-02-01",
  },
]).length === 0, "in-range blood pressure movements should not become material changes just because of percentage");

context.selectMetric("Waist circumference");
document.elements.dateInput.value = "2026-07-01";
document.elements.valueInput.value = "92";
document.elements.highInput.value = "85";
context.addResult({ preventDefault() {} });
results = JSON.parse(store["blood-results-tracker:v3"]);
const waist = results.find((result) => result.metric === "Waist circumference");
assert(waist.reference_lower_limit === null && waist.reference_upper_limit === 85, "target metrics should save target as upper limit");
assert(waist.status_vs_range === "Above target", "waist above target should use target status, not clinical range status");
assert(waist.status_vs_range !== "Outside range", "waist target should not be shown as outside a lab range");
assert(document.elements.resultsBody.innerHTML.includes("85 cm"), "target should render cleanly in results");
assert(!document.elements.resultsBody.innerHTML.includes("Core body metrics"), "results metric cell should show only the metric name");

context.selectMetric("Weight");
document.elements.dateInput.value = "2026-07-02";
document.elements.valueInput.value = "83.5";
document.elements.highInput.value = "84";
context.addResult({ preventDefault() {} });
results = JSON.parse(store["blood-results-tracker:v3"]);
const firstWeight = results.find((result) => result.metric === "Weight" && result.sample_date === "2026-07-02");
assert(firstWeight.status_vs_range === "On target", "weight within one unit below target should be on target");
assert(context.getStatus({
  metric: "Weight",
  metric_type: "numeric",
  result_value: "77.8",
  reference_lower_limit: null,
  reference_upper_limit: 79,
}) === "Below target", "weight more than one unit below target should be below target");
context.selectMetric("Weight");
assert(document.elements.highInput.disabled === true, "saved target should lock on repeat entry");
context.toggleRangeEditing();
assert(document.elements.highInput.disabled === false, "edit target should unlock target input");
document.elements.highInput.value = "79";
context.toggleRangeEditing();
assert(document.elements.highInput.disabled === true, "lock target should relock target input");
assert(JSON.parse(store["health-dashboard-reference-ranges:v1"])["ben:Weight"].high === 79, "locking target should save the new target");
document.elements.dateInput.value = "2026-07-16";
document.elements.valueInput.value = "82";
context.addResult({ preventDefault() {} });
results = JSON.parse(store["blood-results-tracker:v3"]);
const weightRows = results.filter((result) => result.metric === "Weight").sort((a, b) => a.sample_date.localeCompare(b.sample_date));
assert(weightRows[0].reference_upper_limit === 84, "historical weight should keep old target");
assert(weightRows[1].reference_upper_limit === 79, "new weight should use updated target");
assert(weightRows[1].status_vs_range === "Above target", "weight above updated target should not be outside range");
assert(document.elements.resultsBody.innerHTML.includes("Delete"), "results should expose a delete action");
assert(document.elements.resultsBody.innerHTML.includes("result-group-row"), "results should include grouped section rows");
assert(document.elements.resultsBody.innerHTML.includes("data-context-metric"), "result rows should expose metric context buttons");

const imported = context.importChatGptPayload({
  import_type: "health_dashboard_measurements",
  version: 1,
  measurements: [
    {
      profile_id: "angelika",
      date: "2026-06-19",
      metric: "HDL",
      result_value: 60,
      unit: "mg/dL",
      reference_lower_limit: 35,
      reference_upper_limit: 55,
      source_type: "Lab Report / PDF",
      source_confidence: "High",
      source_notes: "Lab portal",
      linked_source_document: "angelika-lipids.pdf",
    },
  ],
});
assert(imported.measurementCount === 1, "ChatGPT import should accept a valid measurement");
const reviewOnly = context.prepareChatGptImport({
  import_type: "health_dashboard_measurements",
  version: 1,
  measurements: [
    {
      profile_id: "ben",
      date: "2026-07-19",
      metric: "LDL",
      result_value: 140,
      unit: "mg/dL",
      reference_lower_limit: null,
      reference_upper_limit: 115,
    },
  ],
});
context.renderImportReview(reviewOnly);
assert(!document.elements.importReviewModal.classList.contains("hidden"), "import review modal should open");
assert(document.elements.importReviewContent.innerHTML.includes("measurements ready"), "import review should show summary");
context.closeImportReview();
assert(document.elements.importReviewModal.classList.contains("hidden"), "import review modal should close");
context.renderImportReview({ measurements: [], ranges: [], skipped: [{ reason: "Unknown profile or metric", item: { metric: "Made up", profile_id: "ben" } }] });
assert(document.elements.confirmImportButton.disabled === true, "empty import review should disable confirmation");
assert(document.elements.importReviewContent.innerHTML.includes("Unknown profile or metric"), "import review should show skipped reasons");
context.closeImportReview();
const duplicate = context.importChatGptPayload({
  import_type: "health_dashboard_measurements",
  version: 1,
  measurements: [
    {
      profile_id: "angelika",
      date: "2026-06-19",
      metric: "HDL",
      result_value: 60,
      unit: "mg/dL",
      reference_lower_limit: 35,
      reference_upper_limit: 55,
    },
  ],
});
assert(duplicate.measurementCount === 0, "duplicate imports should be skipped");
results = JSON.parse(store["blood-results-tracker:v3"]);
assert(results.some((result) => result.profile_id === "angelika" && result.metric === "HDL"), "imported Angelika HDL should save");
assert(results.some((result) => result.linked_source_document === "angelika-lipids.pdf"), "imported source document should save");

context.exportForChatGpt();
const exportText = context.lastBlob.parts.join("");
assert(exportText.includes("ChatGPT Import JSON Schema"), "ChatGPT export should include import schema");
assert(exportText.includes("Scope: all available data for Ben and Angelika"), "ChatGPT export should include the active profile names");
assert(exportText.includes("Use the profile_id values already present"), "ChatGPT import guidance should avoid assuming shared profiles");
assert(exportText.includes("source_confidence"), "ChatGPT export schema should include source confidence");
assert(exportText.includes("source Lab Report / PDF"), "ChatGPT export should include source context");
assert(context.getExportFilename("", "md", new Date("2026-07-09T12:00:00Z")) === "health dashboard All 09-07-2026.md", "multi-profile export filename should use DD-MM-YYYY");
vm.runInContext('cloudState.profileId = "ben";', context);
assert(context.getExportFilename("", "md", new Date("2026-07-09T12:00:00Z")) === "health dashboard Ben 09-07-2026.md", "Ben export filename should use canonical user name");
assert(context.getExportFilename("AI review", "md", new Date("2026-07-09T12:00:00Z")) === "health dashboard Ben AI review 09-07-2026.md", "AI review export filename should include label");
vm.runInContext('cloudState.profileId = null;', context);
context.exportReviewPack();
const reviewPack = context.lastBlob.parts.join("");
assert(reviewPack.includes("Prepare AI Review"), "AI review should export focused markdown");
assert(reviewPack.includes("Scope: focused AI review brief for Ben and Angelika"), "AI review should include the active profile names");
assert(reviewPack.includes("Do not suggest excessive testing"), "AI review should include prevention-first guardrails");

document.elements.trendMetricInput.value = "LDL";
vm.runInContext('state.activeTrendKey = "LDL"; renderTrends();', context);
assert(document.elements.trendPanel.innerHTML.includes("sparkline"), "numeric trend should render chart");
assert(document.elements.trendPanel.innerHTML.includes("range-band") || document.elements.trendPanel.innerHTML.includes("range-limit"), "chart should show range context");
assert(document.elements.trendPanel.innerHTML.includes("2 years"), "trend controls should include a two-year range");
assert(document.elements.trendPanel.innerHTML.includes("Year-on-year"), "trend panel should include year-on-year comparison");
assert(document.elements.trendPanel.innerHTML.match(/<li>/g).length <= 4, "recent history should be capped at four entries");
vm.runInContext('cloudState.user = { email: "ben_ashurst@me.com" }; render();', context);
const snapshotHtml = document.elements.snapshotGrid.innerHTML;
assert(snapshotHtml.includes("Weight"), "snapshot should focus on weight");
assert(snapshotHtml.includes("Waist circumference"), "snapshot should focus on waist circumference");
assert(snapshotHtml.includes("LDL"), "snapshot should focus on LDL");
assert(snapshotHtml.includes("Total cholesterol"), "snapshot should focus on total cholesterol");
assert(
  snapshotHtml.indexOf("<span>Weight</span>") <
    snapshotHtml.indexOf("<span>Waist circumference</span>") &&
    snapshotHtml.indexOf("<span>Waist circumference</span>") <
      snapshotHtml.indexOf("<span>LDL</span>") &&
    snapshotHtml.indexOf("<span>LDL</span>") <
      snapshotHtml.indexOf("<span>Total cholesterol</span>"),
  "snapshot should default to weight, waist, LDL, then total cholesterol",
);
assert(!document.elements.snapshotGrid.innerHTML.includes("Warnings"), "snapshot should not render a generic warning summary card");
vm.runInContext('state.editingSnapshot = true; render();', context);
assert(!document.elements.snapshotEditor.classList.contains("hidden"), "snapshot editor should open");
document.elements.snapshotMetric1.value = "Resting heart rate";
document.elements.snapshotMetric2.value = "VO2 Max";
document.elements.snapshotMetric3.value = "HDL";
document.elements.snapshotMetric4.value = "ApoB";
context.saveSnapshotMetrics({ preventDefault() {} });
const savedSettings = JSON.parse(store["health-dashboard-settings:v1"]);
assert(savedSettings.snapshot_metrics_by_profile.ben[0] === "Resting heart rate", "snapshot choices should save per profile");
assert(document.elements.snapshotEditor.classList.contains("hidden"), "snapshot editor should close after save");
assert(document.elements.snapshotGrid.innerHTML.includes("Resting heart rate"), "custom snapshot should render saved first metric");
assert(document.elements.snapshotGrid.innerHTML.includes("ApoB"), "custom snapshot should render saved fourth metric");

const eosinophilNote = context.getMetricMedicalNote("Eosinophils");
assert(eosinophilNote.includes("hay fever"), "eosinophil context should mention common allergic context");
const monocyteNote = context.getMetricMedicalNote("Monocytes");
assert(monocyteNote.includes("recent infection"), "monocyte context should mention common mild causes");
const ldlNote = context.getMetricMedicalNote("LDL");
assert(ldlNote.includes("atherogenic"), "LDL context should use the full metric context library");
context.showMetricContext("LDL");
assert(!document.elements.metricContextModal.classList.contains("hidden"), "metric context modal should open");
assert(document.elements.metricContextContent.innerHTML.includes("atherogenic"), "metric context modal should show medical context");
context.closeMetricContext();
assert(document.elements.metricContextModal.classList.contains("hidden"), "metric context modal should close");

console.log("function test passed");
