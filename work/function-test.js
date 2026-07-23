const fs = require("fs");
const vm = require("vm");
const NativeURL = URL;

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
    this.checked = false;
    this.files = [];
    this.dataset = {};
    this.listeners = {};
    this.classList = new ClassList();
  }

  set className(value) {
    this.classList.items = new Set(String(value).split(/\s+/).filter(Boolean));
  }

  get className() {
    return [...this.classList.items].join(" ");
  }

  addEventListener(name, handler) {
    this.listeners[name] = handler;
  }

  setAttribute(name, value) {
    this[name] = String(value);
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
    "contentGrid",
    "resultForm",
    "markerInput",
    "metricSearchInput",
    "quickMetricPanel",
    "entryAssist",
    "trendMetricInput",
    "trendViewPanel",
    "trendPanel",
    "dateLabelText",
    "valueFields",
    "completionPanel",
    "completionInput",
    "nextDueField",
    "nextDueLabel",
    "nextDueInput",
    "completionHint",
    "unitInput",
    "lowField",
    "targetField",
    "highField",
    "lowLabel",
    "targetLabel",
    "highLabel",
    "lowInput",
    "targetInput",
    "highInput",
    "referencePanel",
    "referenceOptions",
    "referenceLowerEnabled",
    "targetEnabled",
    "referenceUpperEnabled",
    "rangeEditButton",
    "rangeHint",
    "saveFeedback",
    "entrySubmitButton",
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
    "resultsViewPanel",
    "mobileMenuPanel",
    "mobileActionBar",
    "totalResults",
    "flaggedResults",
    "dueSoonResults",
    "nextDueCard",
    "nextDueDate",
    "nextDueRelative",
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
    "telegramModal",
    "telegramPanel",
    "telegramStatus",
    "telegramConnectionTitle",
    "telegramConnectionText",
    "telegramPairingCode",
    "telegramOpenButton",
    "telegramCloseButton",
    "telegramPairButton",
    "telegramCheckButton",
    "telegramTestButton",
    "telegramDueTestButton",
    "telegramPauseButton",
    "telegramDisconnectButton",
    "telegramReminderGroups",
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
  [
    "authPanel",
    "contentGrid",
    "mobileMenuPanel",
    "mobileActionBar",
    "importReviewModal",
    "metricContextModal",
    "telegramModal",
  ].forEach((id) => elements[id].classList.add("hidden"));
  ["importReviewModal", "metricContextModal", "telegramModal"].forEach((id) => elements[id].classList.add("modal"));
  const classes = {
    ".results-table-wrap": new Element("results-table-wrap"),
    ".results-panel": new Element("results-panel"),
    ".entry-panel": new Element("entry-panel"),
    ".profile-section": new Element("profile-section"),
    ".schedule-section": new Element("schedule-section"),
    ".account-sync-footer": new Element("account-sync-footer"),
    ".filters": new Element("filters"),
    ".status-strip": new Element("status-strip"),
  };
  classes[".topbar-actions"] = new Element("topbar-actions");
  classes[".entry-submit-button"] = elements.entrySubmitButton;
  const privateElements = [
    classes[".topbar-actions"],
    elements.contentGrid,
    elements.mobileMenuPanel,
    elements.mobileActionBar,
    elements.importReviewModal,
    elements.metricContextModal,
    elements.telegramModal,
  ];
  const filterButtons = ["all", "flagged", "due", "latest"].map((filter) => {
    const button = new Element(`filter-${filter}`);
    button.dataset.filter = filter;
    button.classList.add("filter-button");
    return button;
  });

  return {
    body: new Element("body"),
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
      if (selector === "[data-private]") return privateElements;
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
      crypto: {
        randomUUID: () => `id-${Math.random().toString(16).slice(2)}`,
        getRandomValues: (values) => {
          values.forEach((_, index) => {
            values[index] = index + 1;
          });
          return values;
        },
      },
      alert: (message) => {
        context.lastAlert = message;
      },
      confirm: () => true,
      addEventListener: () => {},
      matchMedia: () => ({
        matches: Boolean(context.isMobile),
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
      location: {
        href: "file:///test/index.html",
        origin: "file://",
        hostname: "",
        pathname: "/test/index.html",
        protocol: "file:",
        search: "",
        hash: "",
        reload: () => {
          context.reloaded = true;
        },
      },
    },
    navigator: { onLine: true },
    Blob: class Blob {
      constructor(parts, options) {
        context.lastBlob = { parts, options };
      }
    },
    URL: class TestURL extends NativeURL {
      static createObjectURL() {
        return "blob:test";
      }

      static revokeObjectURL() {}
    },
    URLSearchParams,
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
const appSource = fs.readFileSync("app.js", "utf8");
vm.runInContext(appSource, context);

assert(context.importChatGptPayload, "import function should be exposed");
assert(!appSource.includes('name: "BMI"'), "BMI metric should not exist");
assert(fs.readFileSync("index.html", "utf8").includes("Import from ChatGPT"), "import button should exist");
const indexHtml = fs.readFileSync("index.html", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8"));
const serviceWorker = fs.readFileSync("service-worker.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const supabaseSql = fs.readFileSync("supabase/health_dashboard_data.sql", "utf8");
const telegramScheduleSql = fs.readFileSync("supabase/telegram_reminder_schedule.sql", "utf8");
const telegramFunction = fs.readFileSync("supabase/functions/health-tracker-telegram/index.ts", "utf8");
const appIconSvg = fs.readFileSync("app-icon.svg", "utf8");
const faviconIco = fs.readFileSync("favicon.ico");
assert(indexHtml.includes("app.js?v=0.64"), "script should use cache-busting version");
assert(indexHtml.includes("supabase-config.js?v=0.64"), "Supabase config should be loaded before the app");
assert(fs.readFileSync("supabase-config.js", "utf8").includes("HEALTH_TRACKER_SUPABASE"), "Supabase config placeholder should exist");
assert(indexHtml.includes('rel="manifest"'), "PWA manifest should be linked");
assert(indexHtml.includes("authPanel"), "cloud auth panel should exist");
assert(indexHtml.includes("data-private"), "private dashboard sections should be hidden before sign-in");
assert(indexHtml.includes('<body class="app-booting">'), "app should start in a locked boot state before auth is resolved");
assert(indexHtml.includes("Prepare AI Review"), "AI review action should be clearly named");
assert(!indexHtml.includes("Export for ChatGPT"), "older GPT export action should not be visible in the app menu");
assert(!indexHtml.includes('data-menu-action="export-gpt"'), "mobile menu should not expose the older GPT export action");
assert(indexHtml.includes("Export results"), "CSV export action should be labelled as results export");
assert(indexHtml.includes("Current snapshot"), "current health snapshot section should exist");
assert(indexHtml.includes("snapshotEditor"), "snapshot editor should exist");
assert(indexHtml.includes("entryAssist"), "entry assist area should exist");
assert(indexHtml.includes("nextDueRelative"), "next due tile should include relative timing text");
assert(indexHtml.includes("telegramPanel"), "Telegram reminder setup panel should exist");
assert(indexHtml.includes("telegramOpenButton"), "Telegram should have a private top-level management action");
assert(indexHtml.includes('data-menu-action="telegram"'), "mobile menu should include Telegram settings");
assert(indexHtml.includes("telegramDueTestButton"), "Telegram due reminder test button should exist");
assert(indexHtml.includes("telegramPauseButton"), "Telegram reminders should have a pause control");
assert(indexHtml.includes("telegramDisconnectButton"), "Telegram reminders should have a disconnect control");
assert(indexHtml.includes("telegramReminderGroups"), "Telegram reminder groups should show cycle labels");
assert(indexHtml.includes("v0.64"), "app shell should expose the new version");
assert(styles.includes("--info: #2f6fae"), "interactive hover colour should use the recorded blue");
assert(styles.includes(".status-strip article.active"), "summary cards should have a visible selected state");
assert(styles.includes("border-color: var(--info)"), "summary and snapshot hover states should use blue, not green");
assert(styles.includes(".metric-meta"), "next due relative timing should use a subdued secondary style");
assert(telegramFunction.includes("HEALTH_TRACKER_TELEGRAM_BOT_TOKEN"), "Telegram token should be read from Supabase secrets");
assert(telegramFunction.includes("requireApprovedUser"), "Telegram function should require an approved signed-in user");
assert(telegramFunction.includes("requireCronRequest"), "scheduled Telegram reminders should require a private scheduler credential");
assert(telegramFunction.includes("send_scheduled_reminders"), "Telegram function should include the scheduled reminder action");
assert(telegramFunction.includes("dry_run"), "scheduled reminders should support a no-send dry run");
assert(telegramFunction.includes("send_due_summary"), "Telegram function should include a due-summary action");
assert(telegramFunction.includes("setWebhook"), "Telegram function should be able to configure webhook callbacks");
assert(telegramFunction.includes("answerCallbackQuery"), "Telegram snooze buttons should answer callback queries");
assert(telegramFunction.includes("editMessageReplyMarkup"), "Telegram snooze buttons should remove used keyboards");
assert(telegramFunction.includes("Snooze all 3d"), "Telegram reminders should include a 3-day snooze button");
assert(telegramFunction.includes("Snooze all 7d"), "Telegram reminders should include a 7-day snooze button");
assert(telegramFunction.includes("callback_data"), "Telegram reminders should include inline button callback data");
assert(telegramFunction.includes('"Pilot medical"'), "Telegram reminders should include Ben's pilot medical");
assert(telegramFunction.includes('"Eye test"'), "Telegram reminders should include the shared eye test");
assert(telegramFunction.includes('"Dermatology checkup"'), "Telegram reminders should include the shared dermatology check");
assert(telegramFunction.includes('"Pap smear"'), "Telegram reminders should include Angelika's Pap smear");
assert(telegramFunction.includes('"Breast screening"'), "Telegram reminders should include Angelika's breast screening");
assert(telegramFunction.includes('"Colonoscopy"'), "Telegram reminders should include the shared colonoscopy check");
assert(telegramFunction.includes('profileIds: ["angelika"]'), "Angelika-only reminders should stay profile-scoped");
assert(telegramFunction.includes("telegramReminderDays: [42, 30, 14, 7, 1]"), "pilot medical should use the requested reminder milestones");
assert(telegramFunction.includes("REMINDER_MILESTONES_SIX_MONTHLY = [30, 14, 7, 0]"), "six-month checks should have booking-friendly Telegram milestones");
assert(telegramFunction.includes("REMINDER_MILESTONES_SCREENING = [90, 60, 30, 14, 7, 0]"), "screening checks should have long-lead Telegram milestones");
assert(telegramFunction.includes("REMINDER_MILESTONES_COLONOSCOPY = [120, 90, 60, 30, 14, 7, 0]"), "colonoscopy should have an extra long-lead Telegram milestone");
assert(telegramFunction.includes("getScheduledReminderDays"), "scheduled Telegram reminders should use metric-cycle milestone windows");
assert(telegramFunction.includes("manualNextDueDate: true"), "pilot medical reminders should use the manually entered expiry date");
assert(telegramFunction.includes("scheduledOnly"), "scheduled Telegram reminders should support milestone-only filtering");
assert(telegramFunction.includes("health_dashboard_telegram_pairing_codes"), "Telegram pairing should use webhook-captured pairing codes");
assert(!telegramFunction.includes("getUpdates"), "Telegram pairing should not use polling once webhook callbacks are enabled");
assert(!telegramFunction.includes("No health values are included"), "Telegram reminders should not include the redundant no-values line");
assert(!telegramFunction.includes("This test did not include"), "Telegram test messages should use short wording");
assert(telegramFunction.includes('selectedMetric.name === "VO2 Max"'), "Telegram due grouping should keep VO2 max on its own fitness cycle");
assert(telegramFunction.includes("14-day cycle"), "Telegram due summaries should show cycle length");
assert(appSource.includes('section.classList.contains("modal")'), "private modals should not auto-open after sign-in render");
assert(appSource.includes("telegramPanelOpen"), "Telegram modal should use explicit open state");
assert(appSource.includes("async function confirmReviewedImport"), "import confirmation should wait for cloud save");
assert(appSource.includes("flushCloudSaveNow"), "large imports should force an immediate cloud save");
assert(appSource.includes("Saved to cloud."), "import confirmation should report cloud save success");
assert(indexHtml.includes("metricContextModal"), "metric context modal should exist");
assert(indexHtml.includes("mobileActionBar"), "mobile bottom action bar should exist");
assert(indexHtml.includes("mobileMenuPanel"), "mobile menu panel should exist for secondary actions");
assert(indexHtml.includes("trendViewPanel"), "trends should have a dedicated mobile view wrapper");
assert(indexHtml.includes("resultsViewPanel"), "results should have a dedicated mobile view wrapper");
assert(indexHtml.includes("entry-submit-button"), "mobile entry submit affordance should exist");
assert(indexHtml.includes("referenceOptions"), "reference field selectors should exist");
assert(indexHtml.includes("targetInput"), "target should have a dedicated input");
assert(indexHtml.includes("completionPanel"), "completion-only health checks should have a dedicated panel");
assert(indexHtml.includes("nextDueInput"), "pilot medical should support a manually entered next due or expiry date");
assert(indexHtml.includes("saveFeedback"), "entry form should show save confirmation feedback");
assert(indexHtml.includes("entrySubmitButton"), "entry submit button should be controllable during save feedback");
assert(indexHtml.indexOf("authPanel") < indexHtml.indexOf("profile-section"), "account should appear before profile details");
assert(indexHtml.indexOf("profile-section") < indexHtml.indexOf("snapshotSection"), "profile details should appear before current snapshot");
assert(indexHtml.indexOf("snapshotSection") < indexHtml.indexOf("status-strip"), "current snapshot should appear before overview tiles");
assert(indexHtml.indexOf("status-strip") < indexHtml.indexOf("schedule-section"), "overview tiles should appear before due soon");
assert(indexHtml.includes("privacy-guard.js?v=0.64"), "privacy guard should be cache-busted");
assert(serviceWorker.includes("privacy-guard.js?v=0.64"), "privacy guard should be cached with the app shell");
assert(fs.readFileSync("app.js", "utf8").includes("APPROVED_EMAILS"), "main app should enforce approved sign-in emails");
assert(fs.readFileSync("app.js", "utf8").includes("hasPrivateCloudConfig ? [] : loadResults"), "live cloud app should not hydrate private local results before auth");
assert(fs.readFileSync("privacy-guard.js", "utf8").includes("angelika_kleczka@hotmail.com"), "privacy guard should use the approved email list");
assert(fs.readFileSync("privacy-guard.js", "utf8").includes("hidePrivateDashboard"), "privacy guard should be hide-only");
assert(fs.readFileSync("privacy-guard.js", "utf8").includes("if (isApproved) return"), "privacy guard should not reveal approved sessions before the app loads cloud data");
assert(indexHtml.includes('<span id="dateLabelText">Date</span>'), "measurement form should show one date field with a dynamic label");
assert(!indexHtml.includes(">Sample date"), "measurement form should not show a separate sample date field");
assert(/<label class="hidden reference-field" id="lowField">/.test(indexHtml), "default weight form should hide lower limit before JavaScript runs");
assert(indexHtml.includes("<span id=\"targetLabel\">Target</span>"), "target should use its own label");
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
assert(manifest.start_url.includes("v=0.64"), "manifest start URL should be cache-busted");
assert(manifest.icons.some((icon) => icon.src.includes("app-icon-192.png")), "manifest should include 192px PNG icon");
assert(manifest.icons.some((icon) => icon.src.includes("app-icon-512.png")), "manifest should include 512px PNG icon");
assert(manifest.icons.every((icon) => icon.src.includes("v=0.64")), "manifest icons should be cache-busted");
assert(indexHtml.includes("app-icon-180.png?v=0.64"), "iOS touch icon should use PNG");
assert(indexHtml.includes("health-dashboard-favicon.ico?v=0.64"), "browser favicon should use a unique Health Dashboard ICO filename");
assert(indexHtml.includes("health-dashboard-favicon-32.png?v=0.64"), "browser favicon should use a unique 32px PNG filename");
assert(indexHtml.includes("health-dashboard-favicon-16.png?v=0.64"), "browser favicon should use a unique 16px PNG filename");
assert(faviconIco.length > 100, "favicon ICO should be generated");
assert(appIconSvg.includes("#236f62"), "health app icon should use the dashboard green");
assert(appIconSvg.includes("fill=\"#ffffff\""), "health app icon should include a white cross");
assert(!appIconSvg.includes("stroke-width"), "health app icon should not use the old line-chart mark");
assert(serviceWorker.includes("health-dashboard-v0.64"), "service worker cache should match app version");
assert(serviceWorker.includes("app.js?v=0.64"), "service worker should cache current app bundle");
assert(serviceWorker.includes("supabase-config.js?v=0.64"), "service worker should cache Supabase config placeholder");
assert(serviceWorker.includes("health-dashboard-favicon.ico?v=0.64"), "service worker should cache the unique ICO favicon");
assert(serviceWorker.includes("health-dashboard-favicon-32.png?v=0.64"), "service worker should cache the unique PNG favicon");
assert(serviceWorker.includes("app-icon-512.png?v=0.64"), "service worker should cache PNG app icons");
assert(styles.includes("@media (max-width: 700px)"), "styles should include an iPhone optimisation breakpoint");
assert(styles.includes('content: attr(data-label)'), "mobile result cards should use data labels");
assert(styles.includes(".results-table tr:not(.result-group-row)"), "mobile results should render as cards");
assert(styles.includes("@media (max-width: 340px)"), "very small screens should keep a tighter fallback breakpoint");
assert(styles.includes(".mobile-action-bar"), "styles should include a mobile bottom action bar");
assert(styles.includes(".mobile-view-hidden"), "mobile screens should use mobile-only section hiding");
assert(styles.includes(".mobile-menu-panel"), "styles should include a mobile menu screen");
assert(styles.includes(".telegram-reminder-groups"), "styles should include Telegram reminder group cards");
assert(styles.includes(".topbar-actions .ghost-button"), "desktop top menu buttons should have compact row styling");
assert(styles.includes("grid-template-columns: repeat(5, minmax(0, 1fr))"), "tablet top menu should keep the five actions on one row");
assert(styles.includes("body:not(.signed-in) [data-private]"), "signed-out CSS should force private sections hidden");
assert(styles.includes(".mobile-menu-panel.hidden"), "mobile menu should not override the hidden class");
assert(styles.includes("env(safe-area-inset-bottom)"), "iPhone safe-area spacing should be handled");
assert(styles.includes(".entry-submit-button"), "mobile entry submit should be sticky");
assert(styles.includes(".empty-actions"), "empty states should include compact action buttons");
assert(styles.includes("86dvh"), "mobile modals should use a bottom-sheet-friendly height");
assert(styles.includes("body:not(.signed-in) .workspace"), "signed-out shell should be simplified");
assert(styles.includes("body.app-booting .app-shell"), "booting shell should stay hidden until auth is resolved");
assert(styles.includes("body.app-booting [data-private]"), "booting shell should force private sections hidden before auth resolution");
assert(styles.includes("body.app-booting .account-sync-footer"), "booting shell should hide the footer until auth is resolved");
assert(!styles.includes("body.app-booting .workspace"), "booting shell should keep the normal dashboard width to prevent refresh layout jump");
assert(!styles.includes("body.app-booting h1"), "booting shell should keep the normal dashboard title size");
assert(styles.includes(".reference-panel"), "reference fields should have secondary styling");
assert(styles.includes(".value-fields input"), "primary value fields should be visually prominent");
assert(styles.includes(".save-feedback"), "measurement saves should have visible confirmation styling");
assert(supabaseSql.includes("revoke all privileges on table public.health_dashboard_data from anon"), "Supabase SQL should revoke anon table access");
assert(supabaseSql.includes("Approved users can read their own health dashboard data"), "Supabase SQL should use approved-user RLS policies");
assert(supabaseSql.includes("angelika_kleczka@hotmail.com"), "Supabase SQL should restrict to Angelika's approved email");
assert(telegramScheduleSql.includes("health_dashboard_telegram_reminder_state"), "Telegram scheduled reminders should use a separate reminder-state table");
assert(telegramScheduleSql.includes("health_tracker_telegram_cron_secret"), "Telegram scheduled reminders should store the Cron secret in Vault");
assert(telegramScheduleSql.includes("health_dashboard_telegram_pairing_codes"), "Telegram webhook pairing should use a private pairing-code table");
assert(telegramScheduleSql.includes("health_tracker_telegram_webhook_secret"), "Telegram webhook should use a Vault-backed secret");
assert(telegramScheduleSql.includes("health_tracker_telegram_webhook_secret_matches"), "Telegram webhook secret matcher should exist");
assert(telegramScheduleSql.includes("'0 8,9 * * *'"), "Telegram scheduled reminders should run around 09:00 Europe/Lisbon across DST");
assert(document.elements.appVersion.textContent === "v0.64", "footer should show app version");
assert(document.elements.nextDueDate.textContent, "next due summary should render a value");
assert(document.elements.nextDueRelative.textContent, "next due summary should render relative timing");
document.body.classList.add("app-booting");
document.elements.contentGrid.classList.remove("hidden");
document.elements.telegramModal.classList.remove("hidden");
context.setPrivateVisibility(false);
assert(!document.body.classList.contains("app-booting"), "main app privacy decision should end the boot state");
assert(!document.body.classList.contains("signed-in"), "signed-out privacy decision should not mark the shell as signed in");
assert(document.elements.contentGrid.classList.contains("hidden"), "signed-out privacy decision should hide dashboard content");
assert(document.elements.telegramModal.classList.contains("hidden"), "signed-out privacy decision should close Telegram settings");
document.elements.contentGrid.classList.add("hidden");
document.elements.telegramModal.classList.add("hidden");
context.setPrivateVisibility(true);
assert(document.body.classList.contains("signed-in"), "signed-in privacy decision should mark the shell as signed in");
assert(!document.elements.contentGrid.classList.contains("hidden"), "signed-in privacy decision should reveal normal private sections");
assert(document.elements.telegramModal.classList.contains("hidden"), "signed-in privacy decision should keep private modals closed");
context.setPrivateVisibility(false);
assert(
  document.elements.nextDueCard.classList.contains("due-now") ||
    document.elements.nextDueCard.classList.contains("overdue") ||
    document.elements.nextDueDate.textContent !== "Now",
  "next due card should be colour-coded when due now or overdue",
);
assert(document.elements.syncStatus.classList.contains("hidden"), "signed-out footer should hide sync status");
assert(document.elements.manualRefreshButton.classList.contains("hidden"), "signed-out footer should hide refresh");
assert(!document.elements.authPanel.classList.contains("hidden"), "signed-out shell should show the account panel");
assert(document.elements.authForm.classList.contains("hidden"), "local unconfigured copies should hide unusable sign-in controls");
assert(!fs.readFileSync("app.js", "utf8").includes("Local draft only"), "signed-out UI should not expose local draft language");
assert(!fs.readFileSync("app.js", "utf8").includes("Sign in to sync"), "signed-out UI should not expose sync prompts in the footer");
context.window.location.href = "https://benashy.github.io/health-tracker/index.html?v=0.64";
assert(context.getAuthRedirectUrl() === "https://benashy.github.io/health-tracker/", "magic links should redirect to the canonical live dashboard URL");
context.window.location.href = "http://localhost:3000/";
assert(context.getAuthRedirectUrl() === "https://benashy.github.io/health-tracker/", "magic links should not redirect to localhost");
context.window.location.hash = "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired";
assert(context.getAuthRedirectMessage().includes("expired"), "expired magic links should show a helpful message");
context.window.location.hash = "";
assert(document.elements.mobileActionBar.innerHTML === "", "signed-out mobile action bar should not expose private actions");
assert(context.getMetric("Pilot medical", "ben"), "Ben should have the pilot medical check");
assert(context.getMetric("Pilot medical", "angelika") === null, "Angelika should not have Ben's pilot medical check");
assert(context.getMetric("Pap smear", "angelika"), "Angelika should have the Pap smear check");
assert(context.getMetric("Pap smear", "ben") === null, "Ben should not have Angelika's Pap smear check");
assert(context.getMetric("Breast screening", "angelika"), "Angelika should have the breast screening check");
assert(context.getMetric("Breast screening", "ben") === null, "Ben should not have Angelika's breast screening check");
assert(context.getMetric("Eye test", "angelika"), "Angelika should have the shared eye test");
assert(context.getMetric("Dermatology checkup", "ben"), "Ben should have the shared dermatology check");
assert(context.getMetric("Colonoscopy", "ben"), "Ben should have the shared colonoscopy check");
assert(context.getMetric("Colonoscopy", "angelika"), "Angelika should have the shared colonoscopy check");
assert(context.isCompletionMetric(context.getMetric("Pilot medical", "ben")), "pilot medical should use completion entry mode");
assert(context.isCompletionMetric(context.getMetric("Pap smear", "angelika")), "Pap smear should use completion entry mode");
assert(context.isCompletionMetric(context.getMetric("Breast screening", "angelika")), "breast screening should use completion entry mode");
assert(context.isCompletionMetric(context.getMetric("Colonoscopy", "angelika")), "colonoscopy should use completion entry mode");
assert(context.getMetric("Pilot medical", "ben").manualNextDueDate === true, "pilot medical should require a manually entered expiry date");
assert(context.getWarningDays(context.getMetric("Pilot medical", "ben")) === 42, "pilot medical should warn six weeks before expiry");
assert(context.getAutoCompletionNextDueDate(context.getMetric("Eye test", "ben"), "2027-06-10") === "2029-06-10", "two-year eye test should run from completion date");
assert(context.getAutoCompletionNextDueDate(context.getMetric("Dermatology checkup", "ben"), "2027-07-20") === "2028-07-20", "annual dermatology should run from completion date");
assert(context.getAutoCompletionNextDueDate(context.getMetric("Pap smear", "angelika"), "2027-08-15") === "2030-08-15", "Pap smear should default next due to three years after completion");
assert(context.getAutoCompletionNextDueDate(context.getMetric("Breast screening", "angelika"), "2027-09-01") === "2029-09-01", "breast screening should default next due to two years after completion");
assert(context.getAutoCompletionNextDueDate(context.getMetric("Colonoscopy", "angelika"), "2028-02-20") === "2033-02-20", "colonoscopy should default next due to five years after completion");
document.elements.personInput.value = "ben";
document.elements.dateInput.value = "2026-07-14";
document.elements.markerInput.value = "Pilot medical";
context.syncMetricDefaults();
assert(document.elements.valueFields.classList.contains("hidden"), "pilot medical should hide numeric value fields");
assert(document.elements.referencePanel.classList.contains("hidden"), "pilot medical should hide reference setup");
assert(!document.elements.nextDueField.classList.contains("hidden"), "pilot medical should show the expiry date field");
assert(document.elements.nextDueInput.disabled === false, "pilot medical expiry date should be editable");
assert(document.elements.nextDueInput.value === "2027-07-14", "pilot medical should default expiry to one year after completion");
document.elements.markerInput.value = "Eye test";
document.elements.dateInput.value = "2027-06-10";
context.syncMetricDefaults();
assert(!document.elements.nextDueField.classList.contains("hidden"), "eye test should show editable next due date");
assert(document.elements.nextDueInput.disabled === false, "eye test next due date should be editable");
assert(document.elements.nextDueInput.value === "2029-06-10", "eye test should default next due to two years after completion");
document.elements.nextDueInput.value = "2029-07-01";
document.elements.nextDueInput.listeners.input();
document.elements.dateInput.value = "2027-06-11";
context.syncCompletionDueFields();
assert(document.elements.nextDueInput.value === "2029-07-01", "manually edited eye test next due date should not be overwritten");
document.elements.markerInput.value = "Dermatology checkup";
document.elements.dateInput.value = "2027-07-20";
context.syncMetricDefaults();
assert(!document.elements.nextDueField.classList.contains("hidden"), "dermatology should show editable next due date");
assert(document.elements.nextDueInput.disabled === false, "dermatology next due date should be editable");
assert(document.elements.nextDueInput.value === "2028-07-20", "dermatology should default next due to one year after completion");
document.elements.personInput.value = "angelika";
document.elements.markerInput.value = "Pap smear";
document.elements.dateInput.value = "2027-08-15";
context.syncMetricDefaults();
assert(!document.elements.nextDueField.classList.contains("hidden"), "Pap smear should show editable next due date");
assert(document.elements.nextDueInput.disabled === false, "Pap smear next due date should be editable");
assert(document.elements.nextDueInput.value === "2030-08-15", "Pap smear should default next due to three years after completion");
document.elements.markerInput.value = "Breast screening";
document.elements.dateInput.value = "2027-09-01";
context.syncMetricDefaults();
assert(!document.elements.nextDueField.classList.contains("hidden"), "breast screening should show editable next due date");
assert(document.elements.nextDueInput.disabled === false, "breast screening next due date should be editable");
assert(document.elements.nextDueInput.value === "2029-09-01", "breast screening should default next due to two years after completion");
document.elements.markerInput.value = "Colonoscopy";
document.elements.dateInput.value = "2028-02-20";
context.syncMetricDefaults();
assert(document.elements.valueFields.classList.contains("hidden"), "colonoscopy should hide numeric value fields");
assert(document.elements.referencePanel.classList.contains("hidden"), "colonoscopy should hide reference setup");
assert(!document.elements.nextDueField.classList.contains("hidden"), "colonoscopy should show editable next due date");
assert(document.elements.nextDueInput.disabled === false, "colonoscopy next due date should be editable");
assert(document.elements.nextDueInput.value === "2033-02-20", "colonoscopy should default next due to five years after completion");
context.handleActionShortcut("menu");
assert(vm.runInContext('state.mobileView', context) === "home", "signed-out shortcut guard should not switch mobile views");
document.elements.markerInput.value = "Weight";
context.syncMetricDefaults();
vm.runInContext('cloudState.user = { email: "ben_ashurst@me.com" }; cloudState.profileId = null; render();', context);
assert(document.elements.telegramModal.classList.contains("hidden"), "signed-in render should keep Telegram settings closed");
assert(document.elements.mobileActionBar.innerHTML.includes('data-mobile-action="home"'), "mobile action bar should render a Home action");
assert(document.elements.mobileActionBar.innerHTML.includes('data-mobile-action="add"'), "mobile action bar should render an Add action");
assert(document.elements.mobileActionBar.innerHTML.includes('data-mobile-action="trends"'), "mobile action bar should render a Trends action");
assert(document.elements.mobileActionBar.innerHTML.includes('data-mobile-action="results"'), "mobile action bar should render a Results action");
assert(document.elements.mobileActionBar.innerHTML.includes('data-mobile-action="menu"'), "mobile action bar should render a Menu action");
assert(
  document.elements.mobileActionBar.innerHTML.indexOf('data-mobile-action="menu"') <
    document.elements.mobileActionBar.innerHTML.indexOf('data-mobile-action="add"'),
  "mobile Menu action should sit before Add",
);
assert(!document.elements.mobileActionBar.innerHTML.includes('data-mobile-action="review"'), "AI review should live in the mobile menu");
assert(document.elements.emptyState.innerHTML.includes("empty-actions"), "empty state should offer mobile-friendly next actions");
context.handleActionShortcut("add");
assert(document.elements.resultForm.scrolledIntoView && document.elements.valueInput.focused, "Add shortcut should jump to measurement entry");
context.handleActionShortcut("due");
assert(document.elements.schedulePanel.scrolledIntoView, "Due shortcut should jump to due list");
context.handleActionShortcut("review");
assert(document.elements.exportReviewPackButton.clicked, "Review shortcut should prepare the AI review pack");
context.setFilter("latest");
context.isMobile = true;
vm.runInContext('cloudState.user = { email: "ben_ashurst@me.com" }; state.mobileView = "home"; renderMobileLayout();', context);
assert(!document.elements.snapshotSection.classList.contains("mobile-view-hidden"), "mobile home should show the current snapshot");
assert(document.elements.contentGrid.classList.contains("mobile-view-hidden"), "mobile home should hide the add/results grid");
context.handleActionShortcut("trends");
assert(!document.elements.trendViewPanel.classList.contains("mobile-view-hidden"), "mobile Trends tab should show trend content");
assert(document.elements.resultsViewPanel.classList.contains("mobile-view-hidden"), "mobile Trends tab should hide result rows");
context.handleActionShortcut("results");
assert(!document.elements.resultsViewPanel.classList.contains("mobile-view-hidden"), "mobile Results tab should show result rows");
assert(document.elements.trendViewPanel.classList.contains("mobile-view-hidden"), "mobile Results tab should hide trend content");
context.handleActionShortcut("menu");
assert(!document.elements.mobileMenuPanel.classList.contains("mobile-view-hidden"), "mobile Menu tab should show export and import actions");
document.elements.telegramModal.classList.add("hidden");
context.handleMenuAction("telegram");
assert(!document.elements.telegramModal.classList.contains("hidden"), "mobile Telegram menu action should open Telegram settings");
context.closeTelegramPanel();
assert(document.elements.telegramModal.classList.contains("hidden"), "Telegram settings should close");
context.isMobile = false;
assert(context.getWarningDays(14) === 1, "14-day checks should only warn one day before");
assert(context.getWarningDays(30) === 3, "30-day checks should warn within three days");
assert(context.getWarningDays(90) === 7, "quarterly checks should warn within seven days");
assert(context.getWarningDays(180) === 30, "six-month checks should warn within thirty days");
assert(context.getWarningDays(365) === 30, "annual checks should warn within thirty days");
assert(context.getWarningDays(1825) === 90, "multi-year checks should warn within ninety days by default");
assert(context.getWarningDays(context.getMetric("Colonoscopy", "angelika")) === 120, "colonoscopy should warn within one hundred and twenty days");
assert(context.getStatusClass("Recorded") === "recorded", "recorded status should use informational styling");
assert(context.getDisplayGroupForMetric("LDL") === "Cardiovascular", "LDL should be grouped with cardiovascular metrics");

document.elements.personInput.value = "ben";
document.elements.markerInput.value = "LDL";
context.syncMetricDefaults();
assert(document.elements.highLabel.textContent === "Reference upper limit", "LDL should use reference range labels");
assert(document.elements.lowField.classList.contains("hidden"), "LDL should hide unused lower limit field by default");
assert(document.elements.targetField.classList.contains("hidden"), "LDL should hide target field by default");
assert(!document.elements.highField.classList.contains("hidden"), "LDL should show upper limit field by default");
assert(document.elements.lowInput.value === "", "LDL lower limit should be blank/null");
assert(String(document.elements.highInput.value) === "115", "LDL upper default should load");
assert(document.elements.highInput.disabled === false, "first range entry should be editable");
assert(document.elements.referenceUpperEnabled.checked === true, "LDL should select upper reference by default");
assert(document.elements.referenceLowerEnabled.checked === false, "LDL lower reference should be optional");
assert(document.elements.sourceTypeInput.value === "Lab Report / PDF", "LDL should default to lab source");
assert(document.elements.sourceConfidenceInput.value === "High", "lab source should be high confidence");
assert(document.elements.entryAssist.innerHTML.includes("Cardiovascular"), "entry assist should show the selected metric group");
assert(document.elements.entryAssist.innerHTML.includes("Range set on first entry"), "entry assist should explain first range entry");

context.populateMetrics();
assert(document.elements.markerInput.innerHTML.includes("Glucose"), "metric dropdown should retain all metrics");
const metricDropdownHtml = document.elements.markerInput.innerHTML;
assert(
  metricDropdownHtml.indexOf('label="Health checks"') > metricDropdownHtml.indexOf('label="Vitals and fitness"'),
  "health checks should appear after vitals in the metric dropdown",
);
assert(
  metricDropdownHtml.indexOf('label="Health checks"') < metricDropdownHtml.indexOf('label="Full blood count"'),
  "health checks should appear before full blood count in the metric dropdown",
);
context.selectMetric("Weight");
assert(document.elements.sourceTypeInput.value === "Manual Measurement", "weight should default to manual source");
assert(document.elements.targetLabel.textContent === "Target", "weight should use target label");
assert(document.elements.lowField.classList.contains("hidden"), "weight should hide lower limit field");
assert(!document.elements.targetField.classList.contains("hidden"), "weight should show only target field by default");
assert(document.elements.highField.classList.contains("hidden"), "weight should hide upper reference field by default");
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
assert(document.elements.saveFeedback.textContent === "LDL added to tracker.", "saving should show clear measurement feedback");
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
assert(!document.elements.referenceOptions.classList.contains("hidden"), "new blood pressure setup should allow reference field selection");
assert(document.elements.referenceUpperEnabled.checked === true, "blood pressure should default to upper reference");
document.elements.referenceLowerEnabled.checked = true;
document.elements.targetEnabled.checked = true;
document.elements.referenceUpperEnabled.checked = true;
document.elements.referenceLowerEnabled.listeners.change();
assert(!document.elements.lowField.classList.contains("hidden"), "selected lower reference should appear");
assert(!document.elements.targetField.classList.contains("hidden"), "selected target should appear");
assert(!document.elements.highField.classList.contains("hidden"), "selected upper reference should appear");
document.elements.dateInput.value = "2026-06-20";
document.elements.valueInput.value = "118";
document.elements.lowInput.value = "90";
document.elements.targetInput.value = "115";
document.elements.highInput.value = "130";
context.addResult({ preventDefault() {} });
let savedRanges = JSON.parse(store["health-dashboard-reference-ranges:v1"]);
assert(savedRanges["ben:Blood pressure systolic"].low === 90, "blood pressure lower reference should save when selected");
assert(savedRanges["ben:Blood pressure systolic"].target === 115, "blood pressure target should save when selected");
assert(savedRanges["ben:Blood pressure systolic"].high === 130, "blood pressure upper reference should save when selected");
assert(savedRanges["ben:Blood pressure systolic"].fields.lower === true, "blood pressure lower field choice should save");
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
assert(context.getStatus({
  metric: "MCH",
  metric_type: "numeric",
  result_value: "32.2",
  reference_lower_limit: 27,
  reference_upper_limit: 32,
}) === "Near limit", "MCH just outside the upper limit should be near limit rather than outside range");
assert(context.getStatus({
  metric: "MCH",
  metric_type: "numeric",
  result_value: "35",
  reference_lower_limit: 27,
  reference_upper_limit: 32,
}) === "Outside range", "MCH clearly outside the upper limit should remain outside range");
assert(context.getStatus({
  metric: "MCH",
  metric_type: "numeric",
  result_value: "31.5",
  reference_lower_limit: 27,
  reference_upper_limit: 32,
}) === "Near limit", "MCH just inside the upper limit should be near limit");
assert(context.getStatus({
  metric: "MCH",
  metric_type: "numeric",
  result_value: "29",
  reference_lower_limit: 27,
  reference_upper_limit: 32,
}) === "In range", "MCH comfortably inside range should remain in range");
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
document.elements.targetInput.value = "85";
context.addResult({ preventDefault() {} });
results = JSON.parse(store["blood-results-tracker:v3"]);
const waist = results.find((result) => result.metric === "Waist circumference");
assert(waist.reference_lower_limit === null && waist.target_value === 85 && waist.reference_upper_limit === null, "target metrics should save target separately");
assert(waist.reference_fields.target === true && waist.reference_fields.upper === false, "target metrics should store selected reference fields");
assert(waist.status_vs_range === "Above target", "waist above target should use target status, not clinical range status");
assert(waist.status_vs_range !== "Outside range", "waist target should not be shown as outside a lab range");
assert(document.elements.resultsBody.innerHTML.includes("85 cm"), "target should render cleanly in results");
assert(!document.elements.resultsBody.innerHTML.includes("Core body metrics"), "results metric cell should show only the metric name");

context.selectMetric("Weight");
document.elements.dateInput.value = "2026-07-02";
document.elements.valueInput.value = "83.5";
document.elements.targetInput.value = "84";
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
assert(document.elements.targetInput.disabled === true, "saved target should lock on repeat entry");
context.toggleRangeEditing();
assert(document.elements.targetInput.disabled === false, "edit target should unlock target input");
assert(!document.elements.referenceOptions.classList.contains("hidden"), "editing target should reveal selectable reference fields");
document.elements.targetInput.value = "79";
context.toggleRangeEditing();
assert(document.elements.targetInput.disabled === true, "lock target should relock target input");
assert(JSON.parse(store["health-dashboard-reference-ranges:v1"])["ben:Weight"].target === 79, "locking target should save the new target");
document.elements.dateInput.value = "2026-07-16";
document.elements.valueInput.value = "82";
context.addResult({ preventDefault() {} });
results = JSON.parse(store["blood-results-tracker:v3"]);
const weightRows = results.filter((result) => result.metric === "Weight").sort((a, b) => a.sample_date.localeCompare(b.sample_date));
assert(weightRows[0].target_value === 84, "historical weight should keep old target");
assert(weightRows[1].target_value === 79, "new weight should use updated target");
assert(weightRows[1].reference_upper_limit === null, "new weight should not store target as upper reference");
assert(weightRows[1].status_vs_range === "Above target", "weight above updated target should not be outside range");
assert(document.elements.resultsBody.innerHTML.includes("Delete"), "results should expose a delete action");
assert(document.elements.resultsBody.innerHTML.includes("result-group-row"), "results should include grouped section rows");
assert(document.elements.resultsBody.innerHTML.includes("data-context-metric"), "result rows should expose metric context buttons");
assert(document.elements.resultsBody.innerHTML.includes('data-label="Metric"'), "result rows should include mobile card labels");
assert(document.elements.resultsBody.innerHTML.includes('data-label="Range / target"'), "range cells should include mobile card labels");
assert(document.elements.resultsBody.innerHTML.includes('data-label="Action"'), "action cells should include mobile card labels");

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
assert(!document.elements.importReviewContent.innerHTML.includes("Showing first 12 measurements only"), "import review should not hide the rest of a large batch");
context.closeImportReview();
assert(document.elements.importReviewModal.classList.contains("hidden"), "import review modal should close");
const pagedReview = context.prepareChatGptImport({
  import_type: "health_dashboard_measurements",
  version: 1,
  measurements: Array.from({ length: 23 }, (_, index) => ({
    profile_id: "ben",
    date: `2028-01-${String(index + 1).padStart(2, "0")}`,
    metric: "LDL",
    result_value: 100 + index,
    unit: "mg/dL",
    reference_upper_limit: 115,
  })),
});
context.renderImportReview(pagedReview);
assert(document.elements.importReviewContent.innerHTML.includes("Showing 1-10 of 23"), "large import review should show the first page range");
assert(document.elements.importReviewContent.innerHTML.includes("Page 1 of 3"), "large import review should show the first page count");
context.setImportReviewPage(2);
assert(document.elements.importReviewContent.innerHTML.includes("Showing 11-20 of 23"), "large import review should show the second page range");
assert(document.elements.importReviewContent.innerHTML.includes(context.formatDate("2028-01-20")), "second import review page should include the twentieth measurement");
context.setImportReviewPage(3);
assert(document.elements.importReviewContent.innerHTML.includes("Showing 21-23 of 23"), "large import review should show the final page range");
assert(document.elements.importReviewContent.innerHTML.includes("Page 3 of 3"), "large import review should show the final page count");
context.closeImportReview();
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

vm.runInContext('state.settings.telegram = normaliseTelegramSettings({ chat_id: "12345", chat_label: "Ben phone", enabled: true, test_sent_at: "2026-07-22T09:00:00.000Z" }); renderTelegramPanel();', context);
assert(document.elements.telegramStatus.textContent === "Connected", "connected Telegram setup should show connected status");
assert(document.elements.telegramConnectionText.innerHTML.includes("Reminders are ready"), "connected Telegram copy should be concise");
assert(!document.elements.telegramConnectionText.innerHTML.includes("health values"), "Telegram panel should not repeat the no-values reassurance line");
assert(!document.elements.telegramPauseButton.classList.contains("hidden"), "connected Telegram setup should show pause control");
assert(!document.elements.telegramDisconnectButton.classList.contains("hidden"), "connected Telegram setup should show disconnect control");
assert(document.elements.telegramReminderGroups.innerHTML.includes("Snooze until next cycle (14 days)"), "Telegram group labels should show the body cycle length");
assert(document.elements.telegramReminderGroups.innerHTML.includes("Snooze until next cycle (6 months)"), "Telegram group labels should show the six-month cycle length");
context.toggleTelegramReminders();
let telegramSettings = JSON.parse(store["health-dashboard-settings:v1"]).telegram;
assert(telegramSettings.enabled === false && telegramSettings.paused_at, "pause should save disabled reminder state");
context.toggleTelegramReminders();
telegramSettings = JSON.parse(store["health-dashboard-settings:v1"]).telegram;
assert(telegramSettings.enabled === true && telegramSettings.paused_at === "", "resume should save enabled reminder state");
context.disconnectTelegramReminders();
telegramSettings = JSON.parse(store["health-dashboard-settings:v1"]).telegram;
assert(telegramSettings.chat_id === "" && telegramSettings.enabled === false, "disconnect should clear Telegram chat and disable reminders");

console.log("function test passed");
