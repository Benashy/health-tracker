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
    "latestDate",
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
assert(indexHtml.includes("app.js?v=0.21"), "script should use cache-busting version");
assert(indexHtml.includes("supabase-config.js?v=0.21"), "Supabase config should be loaded before the app");
assert(fs.readFileSync("supabase-config.js", "utf8").includes("HEALTH_TRACKER_SUPABASE"), "Supabase config placeholder should exist");
assert(indexHtml.includes('rel="manifest"'), "PWA manifest should be linked");
assert(indexHtml.includes("authPanel"), "cloud auth panel should exist");
assert(indexHtml.includes("data-private"), "private dashboard sections should be hidden before sign-in");
assert(indexHtml.includes("privacy-guard.js?v=0.21"), "privacy guard should be cache-busted");
assert(serviceWorker.includes("privacy-guard.js?v=0.21"), "privacy guard should be cached with the app shell");
assert(/<label>\s*Date\s*<input id="dateInput"/.test(indexHtml), "measurement form should show one date field");
assert(!indexHtml.includes(">Sample date"), "measurement form should not show a separate sample date field");
assert(!indexHtml.includes("Find metric"), "metric search box should not be visible");
assert(!indexHtml.includes("Saved in your private account"), "entry panel should avoid redundant private account copy");
assert(!indexHtml.includes("Source note"), "source note field should not be visible");
assert(!indexHtml.includes("Source document"), "source document field should not be visible");
assert(!indexHtml.includes("Designed for long-term prevention"), "bottom explanatory note should be removed");
assert(!indexHtml.includes("Clear data"), "clear data should not be a visible top-level action");
assert(indexHtml.includes("Range / target"), "results table should label ranges and targets");
assert(indexHtml.includes("apple-mobile-web-app-capable"), "iOS PWA metadata should exist");
assert(manifest.display === "standalone", "manifest should enable standalone display");
assert(manifest.icons.some((icon) => icon.src.includes("app-icon-192.png")), "manifest should include 192px PNG icon");
assert(manifest.icons.some((icon) => icon.src.includes("app-icon-512.png")), "manifest should include 512px PNG icon");
assert(indexHtml.includes("app-icon-180.png?v=0.21"), "iOS touch icon should use PNG");
assert(serviceWorker.includes("health-dashboard-v0.21"), "service worker cache should match app version");
assert(serviceWorker.includes("app.js?v=0.21"), "service worker should cache current app bundle");
assert(serviceWorker.includes("supabase-config.js?v=0.21"), "service worker should cache Supabase config placeholder");
assert(serviceWorker.includes("app-icon-512.png?v=0.21"), "service worker should cache PNG app icons");
assert(document.elements.appVersion.textContent === "v0.21", "footer should show app version");
assert(document.elements.syncStatus.textContent.includes("Local"), "footer should show local sync status");
assert(document.elements.authPanel.classList.contains("hidden"), "auth panel should hide until Supabase is configured");

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

context.populateMetrics();
assert(document.elements.markerInput.innerHTML.includes("Glucose"), "metric dropdown should retain all metrics");
context.selectMetric("Weight");
assert(document.elements.sourceTypeInput.value === "Manual Measurement", "weight should default to manual source");
assert(document.elements.highLabel.textContent === "Target", "weight should use target label");
assert(document.elements.lowField.classList.contains("hidden"), "weight should hide lower limit field");
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
assert(document.elements.quickMetricPanel.innerHTML.includes("LDL"), "quick metrics should include frequently entered metrics");

context.selectMetric("Waist circumference");
document.elements.dateInput.value = "2026-07-01";
document.elements.valueInput.value = "92";
document.elements.highInput.value = "85";
context.addResult({ preventDefault() {} });
results = JSON.parse(store["blood-results-tracker:v3"]);
const waist = results.find((result) => result.metric === "Waist circumference");
assert(waist.reference_lower_limit === null && waist.reference_upper_limit === 85, "target metrics should save target as upper limit");
assert(document.elements.resultsBody.innerHTML.includes("85 cm"), "target should render cleanly in results");

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
context.exportReviewPack();
const reviewPack = context.lastBlob.parts.join("");
assert(reviewPack.includes("Preventative Health Review Pack"), "review pack should export focused markdown");
assert(reviewPack.includes("Scope: focused review pack for Ben and Angelika"), "review pack should include the active profile names");

document.elements.trendMetricInput.value = "LDL";
vm.runInContext('state.activeTrendKey = "LDL"; renderTrends();', context);
assert(document.elements.trendPanel.innerHTML.includes("sparkline"), "numeric trend should render chart");
assert(document.elements.trendPanel.innerHTML.includes("range-band") || document.elements.trendPanel.innerHTML.includes("range-limit"), "chart should show range context");

console.log("function test passed");
