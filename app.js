const APP_VERSION = "v0.25";
const STORAGE_KEY = "blood-results-tracker:v3";
const LEGACY_STORAGE_KEYS = ["blood-results-tracker:v1", "blood-results-tracker:v2"];
const PROFILE_STORAGE_KEY = "health-dashboard-profiles:v1";
const RANGE_STORAGE_KEY = "health-dashboard-reference-ranges:v1";
const LAST_LOCAL_UPDATE_KEY = "health-dashboard-last-local-update:v1";
const CLOUD_CACHE_KEY = "health-dashboard-cloud-cache:v1";
const CLOUD_TABLE = "health_dashboard_data";
const DATA_VERSION = 1;

const defaultProfiles = [
  { id: "ben", name: "Ben", date_of_birth: "", height_cm: "" },
  { id: "angelika", name: "Angelika", date_of_birth: "", height_cm: "" },
];

const sourceConfidenceByType = {
  "Lab Report / PDF": "High",
  "Clinician Report": "High",
  "Manual Measurement": "Medium to High",
  "Wearable Estimate": "Medium",
  "Calculated Value": "Medium",
  "User Note": "Subjective",
};

const manualSourceMetrics = new Set([
  "Weight",
  "Waist circumference",
  "Blood pressure systolic",
  "Blood pressure diastolic",
]);

const wearableSourceMetrics = new Set(["Resting heart rate", "VO2 Max"]);
const clinicianSourceMetrics = new Set(["ECG", "Coronary artery calcium score"]);
const starterMetricNames = [
  "Weight",
  "Waist circumference",
  "Blood pressure systolic",
  "Blood pressure diastolic",
  "LDL",
  "HDL",
  "Triglycerides",
  "HbA1c IFCC",
  "Vitamin D",
  "Ferritin",
];
const quickMetricLimit = 8;
const targetMetricNames = new Set(["Weight", "Waist circumference"]);

const metrics = [
  metric("Weight", "Core body metrics", "kg", null, null, "numeric", "highest", 14, "context"),
  metric("Waist circumference", "Core body metrics", "cm", null, null, "numeric", "highest", 14, "lower"),
  metric("Blood pressure systolic", "Vitals and fitness", "mmHg", null, 120, "numeric", "highest", 30, "lower"),
  metric("Blood pressure diastolic", "Vitals and fitness", "mmHg", null, 80, "numeric", "highest", 30, "lower"),
  metric("Resting heart rate", "Vitals and fitness", "bpm", null, null, "numeric", "highest", 30, "lower"),
  metric("VO2 Max", "Vitals and fitness", "mL/kg/min", null, null, "numeric", "highest", 90, "higher"),
  metric("Haemoglobin", "Full blood count", "g/dL", 13, 17, "numeric", "medium", 365, "range"),
  metric("Erythrocytes", "Full blood count", "x10^6/uL", 4.5, 5.5, "numeric", "medium", 365, "range"),
  metric("Haematocrit", "Full blood count", "%", 40, 50, "numeric", "medium", 365, "range"),
  metric("MCV", "Full blood count", "fL", 80, 97, "numeric", "medium", 365, "range"),
  metric("MCH", "Full blood count", "pg", 27, 32, "numeric", "medium", 365, "range"),
  metric("MCHC", "Full blood count", "g/dL", 32, 36, "numeric", "medium", 365, "range"),
  metric("RDW", "Full blood count", "%", 11.6, 14, "numeric", "medium", 365, "range"),
  metric("Leukocytes", "Full blood count", "x10^3/uL", 4, 10, "numeric", "medium", 365, "range"),
  metric("Neutrophils", "Full blood count", "%", 40, 80, "numeric", "medium", 365, "range"),
  metric("Eosinophils", "Full blood count", "%", 1, 6, "numeric", "medium", 365, "range"),
  metric("Basophils", "Full blood count", "%", 0, 2, "numeric", "medium", 365, "range"),
  metric("Lymphocytes", "Full blood count", "%", 20, 40, "numeric", "medium", 365, "range"),
  metric("Monocytes", "Full blood count", "%", 2, 10, "numeric", "medium", 365, "range"),
  metric("Platelets", "Full blood count", "x10^3/uL", 150, 400, "numeric", "medium", 365, "range"),
  metric("B12", "Vitamins and iron", "pg/mL", 211, 911, "numeric", "medium", 365, "range"),
  metric("Folate", "Vitamins and iron", "ng/mL", 5.4, null, "numeric", "medium", 365, "higher"),
  metric("Ferritin", "Vitamins and iron", "ng/mL", 30, 340, "numeric", "medium", 365, "range"),
  metric("Vitamin D", "Vitamins and iron", "ng/mL", 30, 100, "numeric", "medium", 365, "range"),
  metric("Glucose", "Metabolic", "mg/dL", 70, 110, "numeric", "medium", 180, "range"),
  metric("Fasting glucose", "Metabolic", "mg/dL", 70, 110, "numeric", "medium", 180, "range"),
  metric("HbA1c NGSP", "Metabolic", "%", 4.3, 6.1, "numeric", "medium", 180, "range"),
  metric("HbA1c IFCC", "Metabolic", "mmol/mol", null, 42, "numeric", "medium", 180, "lower"),
  metric("Total cholesterol", "Lipids", "mg/dL", null, 190, "numeric", "medium", 180, "lower"),
  metric("LDL", "Lipids", "mg/dL", null, 115, "numeric", "medium", 180, "lower"),
  metric("HDL", "Lipids", "mg/dL", 35, 55, "numeric", "medium", 180, "higher"),
  metric("Triglycerides", "Lipids", "mg/dL", null, 150, "numeric", "medium", 180, "lower"),
  metric("ApoB", "Cardiovascular markers", "mg/dL", null, null, "numeric", "highest", 365, "lower", "Annual if clinically indicated"),
  metric("Lipoprotein(a)", "Cardiovascular markers", "mg/dL", null, null, "numeric", "highest", null, "lower", "One-time lifetime measurement"),
  metric("Albumin", "Proteins", "g/dL", 3.4, 5, "numeric", "lower", 365, "range"),
  metric("CRP", "Inflammation", "mg/dL", 0.05, 1, "numeric", "medium", 365, "lower"),
  metric("Uric acid", "Renal and purines", "mg/dL", 3.7, 9.2, "numeric", "lower", 365, "range"),
  metric("Urea", "Renal and purines", "mg/dL", null, 50, "numeric", "lower", 365, "lower"),
  metric("Creatinine", "Renal and purines", "mg/dL", 0.7, 1.3, "numeric", "medium", 365, "range"),
  metric("eGFR", "Renal and purines", "mL/min/1.73m2", 60, null, "numeric", "medium", 365, "higher"),
  metric("LDH", "Liver and enzymes", "U/L", 120, 246, "numeric", "lower", 365, "range"),
  metric("AST", "Liver and enzymes", "U/L", null, 34, "numeric", "medium", 365, "lower"),
  metric("ALT", "Liver and enzymes", "U/L", 10, 49, "numeric", "medium", 365, "range"),
  metric("GGT", "Liver and enzymes", "U/L", null, 73, "numeric", "medium", 365, "lower"),
  metric("Bilirubin total", "Liver and enzymes", "mg/dL", 0.3, 1.2, "numeric", "lower", 365, "range"),
  metric("Bilirubin direct", "Liver and enzymes", "mg/dL", null, 0.3, "numeric", "lower", 365, "lower"),
  metric("Bilirubin indirect", "Liver and enzymes", "mg/dL", 0.2, 0.8, "numeric", "lower", 365, "range"),
  metric("Sodium", "Electrolytes", "mmol/L", 132, 146, "numeric", "lower", 365, "range"),
  metric("Potassium", "Electrolytes", "mmol/L", 3.5, 5.5, "numeric", "lower", 365, "range"),
  metric("Chloride", "Electrolytes", "mmol/L", 99, 109, "numeric", "lower", 365, "range"),
  metric("Homocysteine", "Amino acids", "umol/L", 3.7, 13.9, "numeric", "lower", 365, "lower"),
  metric("TSH", "Endocrine", "mIU/L", 0.35, 5.5, "numeric", "medium", 365, "range"),
  metric("FT4", "Endocrine", "ng/dL", 0.8, 1.76, "numeric", "medium", 365, "range"),
  metric("Cortisol", "Endocrine", "ug/dL", 5.27, 22.45, "numeric", "lower", 365, "range"),
  metric("Total testosterone", "Hormone panel", "ng/dL", null, null, "numeric", "highest", 365, "range", "If symptoms or clinically indicated"),
  metric("SHBG", "Hormone panel", "nmol/L", null, null, "numeric", "highest", 365, "range", "If symptoms or clinically indicated"),
  metric("LH", "Hormone panel - escalation", "IU/L", null, null, "numeric", "conditional", null, "range", "Only if total testosterone is abnormal"),
  metric("FSH", "Hormone panel - escalation", "IU/L", null, null, "numeric", "conditional", null, "range", "Only if total testosterone is abnormal"),
  metric("Prolactin", "Hormone panel - escalation", "ng/mL", null, null, "numeric", "conditional", null, "range", "Only if total testosterone is abnormal"),
  metric("Oestradiol", "Hormone panel - escalation", "pg/mL", null, null, "numeric", "conditional", null, "range", "Only if total testosterone is abnormal"),
  metric("Urine pH", "Urinalysis", "", null, null, "numeric", "lower", 365, "context"),
  metric("Urine specific gravity", "Urinalysis", "", 1.01, 1.025, "numeric", "lower", 365, "range"),
  metric("Urine nitrites", "Urinalysis", "", null, null, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine protein", "Urinalysis", "", null, 20, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine glucose", "Urinalysis", "", null, null, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine ketones", "Urinalysis", "", null, null, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine urobilinogen", "Urinalysis", "mg/dL", null, null, "numeric", "lower", 365, "context"),
  metric("Urine bilirubin", "Urinalysis", "", null, null, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine haemoglobin", "Urinalysis", "", null, null, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine leukocytes", "Urinalysis", "", null, null, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine epithelial cells", "Urinalysis", "/uL", null, 5, "qualitative", "lower", 365, "context", "Annual urine screen", "Rare"),
  metric("Urinary leukocytes", "Urinalysis", "/uL", null, 10, "qualitative", "lower", 365, "context", "Annual urine screen", "Rare"),
  metric("ECG", "One-off and infrequent", "", null, null, "qualitative", "lower", 1825, "context", "Every 5 years or as clinically indicated"),
  metric("Coronary artery calcium score", "One-off and infrequent", "Agatston", null, null, "numeric", "lower", 3650, "lower", "Around age 45, then infrequent if useful"),
];

const initialProfiles = loadProfiles();

const state = {
  profiles: initialProfiles,
  results: loadResults(initialProfiles),
  metricRanges: loadMetricRanges(),
  filter: "all",
  activeProfileId: null,
  editingProfiles: !profilesAreComplete(initialProfiles),
  editingRangeKey: null,
  activeTrendKey: "",
  pendingImport: null,
};

const cloudState = {
  enabled: false,
  client: null,
  session: null,
  user: null,
  profileId: null,
  cloudUpdatedAt: null,
  loadedAt: null,
  saveTimer: null,
  saving: false,
  applyingCloudData: false,
  conflict: false,
  lastError: "",
};

const authPanel = document.querySelector("#authPanel");
const authForm = document.querySelector("#authForm");
const authStatus = document.querySelector("#authStatus");
const authEmail = document.querySelector("#authEmail");
const authPassword = document.querySelector("#authPassword");
const magicLinkButton = document.querySelector("#magicLinkButton");
const onboardingPanel = document.querySelector("#onboardingPanel");
const onboardingTitle = document.querySelector("#onboardingTitle");
const onboardingText = document.querySelector("#onboardingText");
const focusEntryButton = document.querySelector("#focusEntryButton");
const focusImportButton = document.querySelector("#focusImportButton");
const profileForm = document.querySelector("#profileForm");
const profileCards = document.querySelector("#profileCards");
const personField = document.querySelector("#personField");
const personInput = document.querySelector("#personInput");
const form = document.querySelector("#resultForm");
const metricInput = document.querySelector("#markerInput");
const metricSearchInput = document.querySelector("#metricSearchInput");
const quickMetricPanel = document.querySelector("#quickMetricPanel");
const trendMetricInput = document.querySelector("#trendMetricInput");
const trendPanel = document.querySelector("#trendPanel");
const unitInput = document.querySelector("#unitInput");
const lowField = document.querySelector("#lowField");
const lowLabel = document.querySelector("#lowLabel");
const highLabel = document.querySelector("#highLabel");
const lowInput = document.querySelector("#lowInput");
const highInput = document.querySelector("#highInput");
const rangeEditButton = document.querySelector("#rangeEditButton");
const rangeHint = document.querySelector("#rangeHint");
const testDateInput = document.querySelector("#dateInput");
const sampleDateInput = document.querySelector("#sampleDateInput");
const valueInput = document.querySelector("#valueInput");
const notesInput = document.querySelector("#notesInput");
const sourceTypeInput = document.querySelector("#sourceTypeInput");
const sourceConfidenceInput = document.querySelector("#sourceConfidenceInput");
const sourceNotesInput = document.querySelector("#sourceNotesInput");
const sourceDocumentInput = document.querySelector("#sourceDocumentInput");
const resultsBody = document.querySelector("#resultsBody");
const emptyState = document.querySelector("#emptyState");
const tableWrap = document.querySelector(".results-table-wrap");
const totalResults = document.querySelector("#totalResults");
const flaggedResults = document.querySelector("#flaggedResults");
const dueSoonResults = document.querySelector("#dueSoonResults");
const latestDate = document.querySelector("#latestDate");
const markerSummary = document.querySelector("#markerSummary");
const schedulePanel = document.querySelector("#schedulePanel");
const exportCsvButton = document.querySelector("#exportCsvButton");
const exportChatGptButton = document.querySelector("#exportChatGptButton");
const exportReviewPackButton = document.querySelector("#exportReviewPackButton");
const importChatGptButton = document.querySelector("#importChatGptButton");
const importChatGptInput = document.querySelector("#importChatGptInput");
const importReviewModal = document.querySelector("#importReviewModal");
const importReviewContent = document.querySelector("#importReviewContent");
const cancelImportButton = document.querySelector("#cancelImportButton");
const discardImportButton = document.querySelector("#discardImportButton");
const confirmImportButton = document.querySelector("#confirmImportButton");
const syncStatus = document.querySelector("#syncStatus");
const manualRefreshButton = document.querySelector("#manualRefreshButton");
const appVersion = document.querySelector("#appVersion");
const signOutButton = document.querySelector("#signOutButton");
const resetButton = document.querySelector("#resetButton");

function metric(name, group, unit, low, high, type, priority, intervalDays, goal, cadence, normal) {
  return {
    name,
    group,
    unit,
    low,
    high,
    type,
    priority,
    intervalDays,
    goal,
    cadence: cadence ?? formatInterval(intervalDays),
    normal,
  };
}

function formatInterval(intervalDays) {
  if (intervalDays === null) return "Clinically indicated or one-off";
  if (intervalDays <= 31) return `${intervalDays} days`;
  if (intervalDays === 90) return "Every 3 months";
  if (intervalDays === 180) return "Every 6 months";
  if (intervalDays === 365) return "Every 12 months";
  if (intervalDays === 1825) return "Every 5 years";
  if (intervalDays === 3650) return "Every 10 years";
  return `Every ${intervalDays} days`;
}

function loadProfiles() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) return normaliseProfiles(saved);
  } catch {
    return defaultProfiles;
  }
  return defaultProfiles;
}

function normaliseProfiles(profiles, includeAllDefaults = true, profileFilter = null) {
  const defaults = includeAllDefaults
    ? defaultProfiles
    : defaultProfiles.filter((profile) => !profileFilter || profile.id === profileFilter);
  const merged = defaults.map((defaultProfile) => {
    const saved =
      profiles.find((profile) => profile.id === defaultProfile.id) ??
      profiles.find((profile) => profile.id === "angelica" && defaultProfile.id === "angelika");
    return saved
      ? {
          ...defaultProfile,
          ...saved,
          id: defaultProfile.id,
          name:
            defaultProfile.id === "angelika" && (!saved.name || saved.name === "Angelica")
              ? "Angelika"
              : saved.name,
        }
      : defaultProfile;
  });
  return merged;
}

function profilesAreComplete(profiles) {
  return profiles.every((profile) => profile.name && profile.date_of_birth && profile.height_cm);
}

function saveProfiles() {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.profiles));
  markLocalUpdated();
}

function loadMetricRanges() {
  try {
    return JSON.parse(localStorage.getItem(RANGE_STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveMetricRanges() {
  localStorage.setItem(RANGE_STORAGE_KEY, JSON.stringify(state.metricRanges));
  markLocalUpdated();
}

function loadResults(profiles = state.profiles) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    return recalculateDerivedFields(stored.map((result) => normaliseResult(result, profiles)), profiles);
  } catch {
    return [];
  }
}

function saveResults() {
  state.results = recalculateDerivedFields(state.results.map((result) => normaliseResult(result)));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.results));
  markLocalUpdated();
}

function markLocalUpdated() {
  localStorage.setItem(LAST_LOCAL_UPDATE_KEY, new Date().toISOString());
  scheduleCloudSave();
  renderSyncFooter();
}

function getSupabaseConfig() {
  const config = window.HEALTH_TRACKER_SUPABASE ?? {};
  const url = String(config.url ?? "").trim();
  const anonKey = String(config.anonKey ?? "").trim();
  if (!url || !anonKey || url.includes("YOUR-PROJECT") || anonKey.includes("YOUR_PUBLIC")) return null;
  return { url, anonKey };
}

function initSupabase() {
  const config = getSupabaseConfig();
  if (!config || !window.supabase?.createClient) {
    renderAuthPanel();
    renderSyncFooter();
    return;
  }

  cloudState.enabled = true;
  cloudState.client = window.supabase.createClient(config.url, config.anonKey);
  renderAuthPanel();
  renderSyncFooter();

  cloudState.client.auth.onAuthStateChange((_event, session) => {
    handleSession(session);
  });

  cloudState.client.auth.getSession().then(({ data, error }) => {
    if (error) throw error;
    return handleSession(data.session);
  }).catch((error) => {
    cloudState.lastError = error.message;
    renderAuthPanel();
    renderSyncFooter();
  });
}

async function handleSession(session) {
  cloudState.session = session;
  cloudState.user = session?.user ?? null;
  cloudState.profileId = cloudState.user ? getProfileIdForUser(cloudState.user) : null;
  cloudState.conflict = false;
  cloudState.lastError = "";

  if (!cloudState.user) {
    cloudState.cloudUpdatedAt = null;
    cloudState.loadedAt = null;
    renderAuthPanel();
    renderSyncFooter();
    setEditingAvailability();
    return;
  }

  authEmail.value = cloudState.user.email ?? "";
  await loadCloudData();
}

function getProfileIdForUser(user) {
  const email = String(user.email ?? "").toLowerCase();
  if (email.includes("angelika") || email.includes("kleczka")) return "angelika";
  return "ben";
}

function getDefaultProfile(profileId) {
  return defaultProfiles.find((profile) => profile.id === profileId) ?? defaultProfiles[0];
}

function createFreshCloudData(profileId = cloudState.profileId ?? "ben") {
  return {
    data_version: DATA_VERSION,
    app_version: APP_VERSION,
    profiles: [getDefaultProfile(profileId)],
    measurements: [],
    reference_ranges: {},
    imports: [],
    settings: {},
    exported_at: new Date().toISOString(),
  };
}

function serializeDashboardData() {
  return {
    data_version: DATA_VERSION,
    app_version: APP_VERSION,
    profiles: state.profiles,
    measurements: recalculateDerivedFields(state.results),
    reference_ranges: state.metricRanges,
    imports: [],
    settings: {
      active_profile_id: state.activeProfileId,
    },
    exported_at: new Date().toISOString(),
  };
}

function applyDashboardData(data) {
  const profileId = cloudState.profileId ?? "ben";
  const fallback = [getDefaultProfile(profileId)];
  const profiles = Array.isArray(data?.profiles) && data.profiles.length ? data.profiles : fallback;
  state.profiles = normaliseProfiles(profiles, false, profileId);
  state.results = recalculateDerivedFields((data?.measurements ?? data?.results ?? []).map((result) => normaliseResult(result, state.profiles)), state.profiles);
  state.metricRanges = data?.reference_ranges ?? data?.metricRanges ?? {};
  state.activeProfileId = profileId;
  state.editingProfiles = !profilesAreComplete(state.profiles);
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.profiles));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.results));
  localStorage.setItem(RANGE_STORAGE_KEY, JSON.stringify(state.metricRanges));
  localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(data ?? createFreshCloudData(profileId)));
}

async function loadCloudData() {
  if (!cloudState.client || !cloudState.user) return;
  if (!navigator.onLine) {
    loadCachedCloudData();
    renderAuthPanel();
    renderSyncFooter();
    setEditingAvailability();
    return;
  }

  cloudState.applyingCloudData = true;
  try {
    const { data, error } = await cloudState.client
      .from(CLOUD_TABLE)
      .select("data, updated_at")
      .eq("user_id", cloudState.user.id)
      .maybeSingle();
    if (error) throw error;

    let row = data;
    if (!row) row = await createCloudRow();

    cloudState.cloudUpdatedAt = row.updated_at;
    cloudState.loadedAt = new Date().toISOString();
    cloudState.conflict = false;
    applyDashboardData(row.data);
    hydrateProfileForm();
    populatePeople();
    populateMetrics();
    populateTrendMetrics();
    render();
  } catch (error) {
    cloudState.lastError = error.message;
    loadCachedCloudData();
  } finally {
    cloudState.applyingCloudData = false;
    renderAuthPanel();
    renderSyncFooter();
    setEditingAvailability();
  }
}

async function createCloudRow() {
  const nextUpdatedAt = new Date().toISOString();
  const initialData = createFreshCloudData();
  const { data, error } = await cloudState.client
    .from(CLOUD_TABLE)
    .insert({ user_id: cloudState.user.id, data: initialData, updated_at: nextUpdatedAt })
    .select("data, updated_at")
    .single();
  if (error) throw error;
  return data;
}

function loadCachedCloudData() {
  try {
    const cached = JSON.parse(localStorage.getItem(CLOUD_CACHE_KEY));
    if (cached) applyDashboardData(cached);
  } catch {
    return;
  }
}

function scheduleCloudSave() {
  if (!cloudState.enabled || !cloudState.user || cloudState.applyingCloudData) return;
  if (isReadOnlyMode()) return;
  if (typeof clearTimeout === "function") clearTimeout(cloudState.saveTimer);
  if (typeof setTimeout === "function") {
    cloudState.saveTimer = setTimeout(() => saveCloudData(), 450);
  }
}

async function saveCloudData() {
  if (!cloudState.client || !cloudState.user || cloudState.saving || isReadOnlyMode()) return;
  cloudState.saving = true;
  cloudState.lastError = "";
  renderSyncFooter();

  try {
    const nextUpdatedAt = new Date().toISOString();
    const nextDashboardData = serializeDashboardData();
    const { data, error } = await cloudState.client
      .from(CLOUD_TABLE)
      .update({ data: nextDashboardData, updated_at: nextUpdatedAt })
      .eq("user_id", cloudState.user.id)
      .eq("updated_at", cloudState.cloudUpdatedAt)
      .select("updated_at")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      cloudState.conflict = true;
      cloudState.lastError = "Cloud changed on another device. Tap Refresh before saving again.";
      setEditingAvailability();
      window.alert(cloudState.lastError);
      return;
    }

    cloudState.cloudUpdatedAt = data.updated_at;
    cloudState.loadedAt = new Date().toISOString();
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(nextDashboardData));
  } catch (error) {
    cloudState.lastError = error.message;
  } finally {
    cloudState.saving = false;
    renderSyncFooter();
  }
}

function isReadOnlyMode() {
  return cloudState.enabled && cloudState.user && (!navigator.onLine || cloudState.conflict);
}

function assertCanEdit() {
  if (!isReadOnlyMode()) return true;
  const message = cloudState.conflict
    ? "Cloud changed on another device. Tap Refresh before saving again."
    : "Offline: viewing saved data. Editing requires internet.";
  window.alert(message);
  return false;
}

function setEditingAvailability() {
  const disabled = isReadOnlyMode();
  [
    profileForm,
    form,
    importChatGptButton,
    exportCsvButton,
    exportChatGptButton,
    exportReviewPackButton,
    resetButton,
  ].forEach((element) => {
    if (element) element.classList.toggle("read-only", disabled);
  });
  document.querySelectorAll("#profileForm input, #profileForm button, #resultForm input, #resultForm select, #resultForm textarea, #resultForm button").forEach((element) => {
    element.disabled = disabled;
  });
  importChatGptButton.disabled = disabled;
  if (resetButton) resetButton.disabled = disabled;
  if (!disabled && metricInput.value) {
    syncRangeDefaults();
    syncSourceDefaults();
  }
}

function renderAuthPanel() {
  authPanel.classList.toggle("hidden", !cloudState.enabled);
  if (!cloudState.enabled) return;

  const signedIn = Boolean(cloudState.user);
  authForm.classList.toggle("hidden", signedIn);
  authStatus.textContent = signedIn
    ? `Signed in as ${cloudState.user.email}. Private cloud sync is active.`
    : "Sign in to use private cloud sync.";
}

function renderProfileScope() {
  const profileId = cloudState.user ? cloudState.profileId : null;
  document.querySelectorAll("[data-profile-fieldset]").forEach((fieldset) => {
    fieldset.classList.toggle("hidden", Boolean(profileId) && fieldset.dataset.profileFieldset !== profileId);
  });
}

function renderSyncFooter() {
  appVersion.textContent = APP_VERSION;
  if (cloudState.enabled && cloudState.user) {
    const label = cloudState.saving
      ? "Saving..."
      : cloudState.lastError
        ? cloudState.lastError
        : cloudState.loadedAt
          ? `Updated ${formatRelativeTime(cloudState.loadedAt)}`
          : "Cloud connected";
    const modeText = navigator.onLine ? "Cloud sync" : "Offline: viewing saved data";
    syncStatus.textContent = `${label} · ${modeText}`;
    syncStatus.className = `sync-status ${cloudState.lastError || cloudState.conflict ? "error" : navigator.onLine ? "ok" : "warn"}`;
    signOutButton.classList.remove("hidden");
    signOutButton.disabled = false;
    signOutButton.title = "Sign out of this private account.";
    return;
  }

  const lastUpdate = localStorage.getItem(LAST_LOCAL_UPDATE_KEY);
  const updateText = lastUpdate ? `Local draft updated ${formatRelativeTime(lastUpdate)}` : "Local draft only";
  const modeText = cloudState.enabled
    ? "Sign in to sync"
    : navigator.onLine
      ? "Cloud sync not connected"
      : "Offline local view";
  syncStatus.textContent = `${updateText} · ${modeText}`;
  syncStatus.className = `sync-status ${navigator.onLine ? "neutral" : "warn"}`;
  signOutButton.classList.add("hidden");
  signOutButton.disabled = true;
  signOutButton.title = cloudState.enabled ? "Sign in before signing out." : "Sign out will be enabled after Supabase login is configured.";
}

function formatRelativeTime(isoDate) {
  const elapsedMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(0, Math.floor(elapsedMs / 60000));
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function normaliseResult(result, profiles = state.profiles) {
  const profileId = result.profile_id === "angelica" ? "angelika" : result.profile_id;
  const profile = profiles.find((item) => item.id === profileId) ?? profiles[0];
  const metricMeta = getMetricMeta(result.metric);
  const sourceType = result.source_type ?? getDefaultSourceType(result.metric);
  return {
    ...result,
    profile_id: profile.id,
    person_name: profile.name,
    priority: result.priority ?? metricMeta.priority,
    cadence: result.cadence ?? metricMeta.cadence,
    interval_days: result.interval_days ?? metricMeta.intervalDays,
    trend_goal: result.trend_goal ?? metricMeta.goal,
    source_type: sourceType,
    source_confidence: result.source_confidence ?? getSourceConfidence(sourceType),
    source_notes: result.source_notes ?? "",
    linked_source_document: result.linked_source_document ?? "",
  };
}

function populatePeople() {
  personInput.innerHTML = state.profiles
    .map((profile) => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.name)}</option>`)
    .join("");
  personField.classList.toggle("single-profile", state.profiles.length === 1);
  if (state.activeProfileId && getProfile(state.activeProfileId)) {
    personInput.value = state.activeProfileId;
  } else if (state.profiles.length === 1) {
    personInput.value = state.profiles[0].id;
  }
}

function populateTrendMetrics() {
  trendMetricInput.innerHTML = metrics
    .map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`)
    .join("");
  if (!state.activeTrendKey) state.activeTrendKey = metrics[0].name;
  trendMetricInput.value = state.activeTrendKey;
}

function hydrateProfileForm() {
  state.profiles.forEach((profile) => {
    document.querySelector(`#${profile.id}Name`).value = profile.name;
    document.querySelector(`#${profile.id}Dob`).value = profile.date_of_birth;
    document.querySelector(`#${profile.id}Height`).value = profile.height_cm;
  });
}

function renderProfiles() {
  profileForm.classList.toggle("hidden", !state.editingProfiles && profilesAreComplete(state.profiles));
  renderProfileScope();
  const allPeopleCard = cloudState.user
    ? ""
    : `
    <article class="profile-card ${state.activeProfileId === null ? "active" : ""}" data-profile-id="">
      <strong>All people</strong>
      <span>Show Ben and Angelika together</span>
      <span>${state.results.length} measurements</span>
    </article>
  `;
  profileCards.innerHTML = `
    ${allPeopleCard}
    ${state.profiles
      .map((profile) => {
        const count = state.results.filter((result) => result.profile_id === profile.id).length;
        return `
          <article class="profile-card ${state.activeProfileId === profile.id ? "active" : ""}" data-profile-id="${escapeHtml(profile.id)}">
            <div class="profile-card-top">
              <strong>${escapeHtml(profile.name)}</strong>
              <button class="mini-button" type="button" data-edit-profile="${escapeHtml(profile.id)}">Edit</button>
            </div>
            <span>Date of birth: ${profile.date_of_birth ? formatDate(profile.date_of_birth) : "not set"}</span>
            <span>Age: ${profile.date_of_birth ? calculateAge(profile.date_of_birth) : "-"}</span>
            <span>Height: ${profile.height_cm ? `${escapeHtml(profile.height_cm)} cm` : "not set"}</span>
            <span>${count} measurements</span>
          </article>
        `;
      })
      .join("")}
  `;
}

function populateMetrics() {
  const selectedValue = metricInput.value;
  const filteredGroups = groupBy(metrics, "group");
  metricInput.innerHTML = Object.entries(filteredGroups)
    .map(([group, groupMetrics]) => {
      const options = groupMetrics
        .map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`)
        .join("");
      return `<optgroup label="${escapeHtml(group)}">${options}</optgroup>`;
    })
    .join("");
  if (metrics.some((item) => item.name === selectedValue)) metricInput.value = selectedValue;
  syncMetricDefaults();
  renderQuickMetrics();
}

function renderQuickMetrics() {
  quickMetricPanel.innerHTML = getQuickMetricNames()
    .map((name) => `
      <button class="quick-metric-button ${metricInput.value === name ? "active" : ""}" data-metric-name="${escapeHtml(name)}" type="button">
        ${escapeHtml(name)}
      </button>
    `)
    .join("");
}

function getQuickMetricNames() {
  const stats = new Map();
  visibleResults().forEach((result) => {
    const existing = stats.get(result.metric) ?? { count: 0, latest: "" };
    existing.count += 1;
    if (result.sample_date > existing.latest) existing.latest = result.sample_date;
    stats.set(result.metric, existing);
  });
  const frequent = [...stats.entries()]
    .filter(([name]) => getMetric(name))
    .sort((a, b) => b[1].count - a[1].count || b[1].latest.localeCompare(a[1].latest) || a[0].localeCompare(b[0]))
    .map(([name]) => name);
  const combined = [...frequent, ...starterMetricNames.filter((name) => getMetric(name))];
  return [...new Set(combined)].slice(0, quickMetricLimit);
}

function selectMetric(name) {
  if (!getMetric(name)) return;
  metricSearchInput.value = "";
  populateMetrics();
  metricInput.value = name;
  syncMetricDefaults();
  renderQuickMetrics();
}

function syncMetricDefaults() {
  const selectedMetric = getMetric(metricInput.value);
  if (!selectedMetric) return;
  unitInput.value = selectedMetric.unit;
  valueInput.type = selectedMetric.type === "numeric" ? "number" : "text";
  valueInput.step = selectedMetric.type === "numeric" ? "0.01" : "";
  valueInput.inputMode = selectedMetric.type === "numeric" ? "decimal" : "text";
  valueInput.placeholder =
    selectedMetric.type === "numeric" ? "Result value" : `e.g. ${selectedMetric.normal ?? "Normal"}`;
  syncRangeDefaults();
  syncSourceDefaults();
}

function getDefaultSourceType(metricName) {
  if (manualSourceMetrics.has(metricName)) return "Manual Measurement";
  if (wearableSourceMetrics.has(metricName)) return "Wearable Estimate";
  if (clinicianSourceMetrics.has(metricName)) return "Clinician Report";
  return "Lab Report / PDF";
}

function getSourceConfidence(sourceType) {
  return sourceConfidenceByType[sourceType] ?? "Medium";
}

function syncSourceDefaults() {
  const selectedMetric = getMetric(metricInput.value);
  if (!selectedMetric) return;
  sourceTypeInput.value = getDefaultSourceType(selectedMetric.name);
  syncSourceConfidence();
}

function syncSourceConfidence() {
  sourceConfidenceInput.value = getSourceConfidence(sourceTypeInput.value);
}

function getMetric(name) {
  return metrics.find((item) => item.name === name);
}

function getProfile(id) {
  return state.profiles.find((profile) => profile.id === id);
}

function getSelectedProfile() {
  return getProfile(personInput.value) ?? state.profiles[0];
}

function getRangeKey(profileId, metricName) {
  return `${profileId}:${metricName}`;
}

function getSavedRange(profileId, metricName) {
  return state.metricRanges[getRangeKey(profileId, metricName)];
}

function syncRangeDefaults() {
  const selectedMetric = getMetric(metricInput.value);
  const profile = getSelectedProfile();
  if (!selectedMetric || !profile) return;

  const key = getRangeKey(profile.id, selectedMetric.name);
  const savedRange = getSavedRange(profile.id, selectedMetric.name);
  const isEditing = state.editingRangeKey === key;
  const targetMetric = isTargetMetric(selectedMetric.name);
  const defaultLow = selectedMetric.low ?? "";
  const defaultHigh = selectedMetric.high ?? "";

  lowInput.value = targetMetric ? "" : savedRange ? savedRange.low ?? "" : defaultLow;
  highInput.value = savedRange ? savedRange.high ?? "" : defaultHigh;
  lowField.classList.toggle("hidden", targetMetric);
  lowLabel.textContent = "Reference lower limit";
  highLabel.textContent = targetMetric ? "Target" : "Reference upper limit";
  lowInput.disabled = targetMetric || (Boolean(savedRange) && !isEditing);
  highInput.disabled = Boolean(savedRange) && !isEditing;
  rangeEditButton.classList.toggle("hidden", !savedRange);
  rangeEditButton.textContent = isEditing
    ? targetMetric
      ? "Lock target"
      : "Lock range"
    : targetMetric
      ? "Edit target"
      : "Edit range";
  rangeHint.textContent = "";
  rangeHint.classList.add("hidden");
}

function isTargetMetric(metricName) {
  return targetMetricNames.has(metricName);
}

function visibleResults(results = state.results) {
  if (!state.activeProfileId) return results;
  return results.filter((result) => result.profile_id === state.activeProfileId);
}

function getMetricMeta(name) {
  const selectedMetric = getMetric(name) ?? {};
  return {
    priority: selectedMetric.priority ?? "medium",
    cadence: selectedMetric.cadence ?? "Every 12 months",
    intervalDays: selectedMetric.intervalDays ?? 365,
    goal: selectedMetric.goal ?? "context",
  };
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    groups[item[key]] ??= [];
    groups[item[key]].push(item);
    return groups;
  }, {});
}

function parseLimit(value) {
  if (value === null || value === undefined) return null;
  if (String(value).trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseResultValue(value, type) {
  const trimmed = String(value).trim();
  if (type === "qualitative") return trimmed;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function normaliseQualitative(value) {
  return String(value).trim().toLowerCase().replace(/\s*\([^)]*\)\s*/g, "").replace(/s$/, "");
}

function getStatus(result) {
  if (result.metric_type === "qualitative") {
    const selectedMetric = getMetric(result.metric);
    if (!selectedMetric?.normal) return "Recorded";
    return normaliseQualitative(result.result_value) === normaliseQualitative(selectedMetric.normal)
      ? "In range"
      : "Outside range";
  }

  const value = Number(result.result_value);
  const low = result.reference_lower_limit;
  const high = result.reference_upper_limit;
  if (isTargetMetric(result.metric)) {
    if (high === null) return "Recorded";
    return value <= high ? "On target" : "Above target";
  }
  if (low !== null && value < low) return "Outside range";
  if (high !== null && value > high) return "Outside range";
  if (isNearLimit(value, low, high)) return "Near limit";
  return low === null && high === null ? "Recorded" : "In range";
}

function isNearLimit(value, low, high) {
  if (low === null && high === null) return false;
  if (low !== null && high !== null) {
    const range = high - low;
    if (range <= 0) return false;
    return value <= low + range * 0.1 || value >= high - range * 0.1;
  }
  if (high !== null) return value >= high * 0.9;
  if (low !== null) return value <= low * 1.1;
  return false;
}

function getPreviousResult(result, allResults) {
  return allResults
    .filter((item) => item.id !== result.id && item.profile_id === result.profile_id && item.metric === result.metric)
    .filter((item) => {
      if (item.sample_date !== result.sample_date) return item.sample_date < result.sample_date;
      return item.test_date < result.test_date;
    })
    .sort((a, b) => {
      const sampleSort = b.sample_date.localeCompare(a.sample_date);
      return sampleSort || b.test_date.localeCompare(a.test_date);
    })[0];
}

function deriveChange(result, previous) {
  if (!previous) {
    return {
      previous_result: null,
      absolute_change_since_previous_test: null,
      percentage_change_since_previous_test: null,
      trend_direction: "first",
    };
  }

  if (result.metric_type === "qualitative") {
    const changed =
      normaliseQualitative(result.result_value) === normaliseQualitative(previous.result_value)
        ? "unchanged"
        : "changed";
    return {
      previous_result: previous.result_value,
      absolute_change_since_previous_test: changed,
      percentage_change_since_previous_test: changed,
      trend_direction: changed,
    };
  }

  const currentValue = Number(result.result_value);
  const previousValue = Number(previous.result_value);
  const absoluteChange = currentValue - previousValue;
  const percentageChange = previousValue === 0 ? null : (absoluteChange / previousValue) * 100;

  return {
    previous_result: previous.result_value,
    absolute_change_since_previous_test: roundChange(absoluteChange),
    percentage_change_since_previous_test: percentageChange === null ? null : roundChange(percentageChange),
    trend_direction: getTrendDirection(absoluteChange, result, previous),
  };
}

function getTrendDirection(change, result, previous) {
  if (change === 0) return "Stable";
  const goal = result.trend_goal ?? getMetricMeta(result.metric).goal;
  if (goal === "lower") return change < 0 ? "Improved" : "Worse";
  if (goal === "higher") return change > 0 ? "Improved" : "Worse";
  if (goal === "range") return getRangeTrend(result, previous);
  return change > 0 ? "Up" : "Down";
}

function getRangeTrend(result, previous) {
  const lower = result.reference_lower_limit;
  const upper = result.reference_upper_limit;
  if (lower === null && upper === null) return "Changed";
  if (lower !== null && upper !== null) {
    const midpoint = (lower + upper) / 2;
    const currentDistance = Math.abs(Number(result.result_value) - midpoint);
    const previousDistance = Math.abs(Number(previous.result_value) - midpoint);
    if (currentDistance < previousDistance) return "Improved";
    if (currentDistance > previousDistance) return "Worse";
    return "Stable";
  }
  if (upper !== null) return Number(result.result_value) < Number(previous.result_value) ? "Improved" : "Worse";
  return Number(result.result_value) > Number(previous.result_value) ? "Improved" : "Worse";
}

function recalculateDerivedFields(results, profiles = state.profiles) {
  const sorted = [...results].sort((a, b) => {
    const personSort = String(a.profile_id).localeCompare(String(b.profile_id));
    const metricSort = a.metric.localeCompare(b.metric);
    const sampleSort = a.sample_date.localeCompare(b.sample_date);
    return personSort || metricSort || sampleSort || a.test_date.localeCompare(b.test_date);
  });

  return sorted.map((result) => {
    const normalised = normaliseResult(result, profiles);
    const previous = getPreviousResult(normalised, sorted);
    const derived = deriveChange(normalised, previous);
    return {
      ...normalised,
      status_vs_range: getStatus(normalised),
      ...derived,
    };
  });
}

function roundChange(value) {
  return Number(value.toFixed(2));
}

function formatValue(value, unit = "") {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}${unit ? ` ${unit}` : ""}`;
}

function formatChange(value, result) {
  if (value === null || value === undefined) return "-";
  if (result.metric_type === "qualitative") return value;
  return `${value > 0 ? "+" : ""}${value}`;
}

function formatPercent(value, result) {
  if (value === null || value === undefined) return "-";
  if (result.metric_type === "qualitative") return value;
  return `${value > 0 ? "+" : ""}${value}%`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function calculateAge(dateOfBirth) {
  const today = new Date();
  const dob = new Date(`${dateOfBirth}T00:00:00`);
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthday =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthday) age -= 1;
  return age;
}

function getDueStatus(profile, selectedMetric) {
  const latest = getLatestResult(profile.id, selectedMetric.name);
  if (!selectedMetric.intervalDays) {
    return latest
      ? { state: "complete", label: "Recorded", latest, nextDate: null }
      : { state: "due", label: selectedMetric.cadence, latest: null, nextDate: null };
  }

  if (!latest) return { state: "due", label: "No result yet", latest: null, nextDate: null };

  const nextDate = addDays(latest.sample_date, selectedMetric.intervalDays);
  const daysRemaining = daysBetween(new Date(), nextDate);
  const warningDays = getWarningDays(selectedMetric.intervalDays);
  if (daysRemaining < 0) return { state: "overdue", label: `Overdue by ${Math.abs(daysRemaining)} days`, latest, nextDate };
  if (daysRemaining <= warningDays) return { state: "soon", label: `Due in ${daysRemaining} days`, latest, nextDate };
  return { state: "ok", label: `Due ${formatDate(toDateString(nextDate))}`, latest, nextDate };
}

function getWarningDays(intervalDays) {
  if (intervalDays <= 31) return 14;
  if (intervalDays <= 210) return 30;
  if (intervalDays <= 400) return 45;
  return 90;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date;
}

function daysBetween(start, end) {
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.ceil((endDate - startDate) / 86400000);
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function getLatestResult(profileId, metricName) {
  return [...state.results]
    .filter((result) => result.profile_id === profileId && result.metric === metricName)
    .sort((a, b) => {
      const sampleSort = b.sample_date.localeCompare(a.sample_date);
      return sampleSort || b.test_date.localeCompare(a.test_date);
    })[0];
}

function getScheduleItems(profileFilter = state.activeProfileId) {
  return state.profiles
    .filter((profile) => !profileFilter || profile.id === profileFilter)
    .flatMap((profile) =>
    metrics
      .filter((item) => ["highest", "medium"].includes(item.priority))
      .map((item) => ({ profile, metric: item, due: getDueStatus(profile, item) })),
  );
}

function filteredResults() {
  const sorted = [...visibleResults()].sort((a, b) => {
    const sampleSort = b.sample_date.localeCompare(a.sample_date);
    return sampleSort || b.test_date.localeCompare(a.test_date) || a.metric.localeCompare(b.metric);
  });

  if (state.filter === "flagged") {
    return sorted.filter((result) => ["Outside range", "Near limit"].includes(result.status_vs_range));
  }

  if (state.filter === "due") {
    const dueMetricNames = new Set(
      getScheduleItems()
        .filter((item) => ["due", "soon", "overdue"].includes(item.due.state))
        .map((item) => `${item.profile.id}:${item.metric.name}`),
    );
    return sorted.filter((result) => dueMetricNames.has(`${result.profile_id}:${result.metric}`));
  }

  if (state.filter === "latest") {
    const latestByMetric = new Map();
    sorted.forEach((result) => {
      const key = `${result.profile_id}:${result.metric}`;
      if (!latestByMetric.has(key)) latestByMetric.set(key, result);
    });
    return [...latestByMetric.values()];
  }

  return sorted;
}

function render() {
  state.results = recalculateDerivedFields(state.results);
  const results = filteredResults();
  const scopedResults = visibleResults();
  const flaggedCount = scopedResults.filter((result) =>
    ["Outside range", "Near limit"].includes(result.status_vs_range),
  ).length;
  const latest = [...scopedResults].sort((a, b) => b.sample_date.localeCompare(a.sample_date))[0];
  const dueCount = getScheduleItems().filter((item) => ["due", "soon", "overdue"].includes(item.due.state)).length;

  totalResults.textContent = scopedResults.length;
  flaggedResults.textContent = flaggedCount;
  dueSoonResults.textContent = dueCount;
  latestDate.textContent = latest ? formatDate(latest.sample_date) : "-";

  renderQuickMetrics();
  renderOnboarding(scopedResults, flaggedCount, dueCount);
  renderProfiles();
  renderSchedule();
  renderSummary();
  renderTrends();

  emptyState.classList.toggle("hidden", results.length > 0);
  tableWrap.classList.toggle("hidden", results.length === 0);

  resultsBody.innerHTML = results
    .map((result) => {
      const statusClass = getStatusClass(result.status_vs_range);
      const due = getDueStatus(getProfile(result.profile_id), getMetric(result.metric));
      const range = formatRangeOrTarget(result);

      return `
        <tr>
          <td>${escapeHtml(result.person_name)}</td>
          <td>${formatDate(result.sample_date)}</td>
          <td><strong>${escapeHtml(result.metric)}</strong></td>
          <td class="value-cell"><strong>${escapeHtml(result.result_value)}</strong><span>${escapeHtml(result.unit)}</span></td>
          <td>${range}</td>
          <td><span class="status-pill ${statusClass}">${escapeHtml(result.status_vs_range)}</span></td>
          <td><span class="due-pill ${due.state}">${escapeHtml(due.label)}</span></td>
          <td>${formatValue(result.previous_result, result.unit)}</td>
          <td>${formatChange(result.absolute_change_since_previous_test, result)}</td>
          <td>${formatPercent(result.percentage_change_since_previous_test, result)}</td>
          <td>${escapeHtml(result.trend_direction)}</td>
          <td><button class="delete-button" type="button" data-id="${result.id}" aria-label="Delete result">Delete</button></td>
        </tr>
      `;
    })
    .join("");
}

function renderOnboarding(scopedResults, flaggedCount, dueCount) {
  if (!cloudState.user) return;
  const profileName = state.profiles[0]?.name ?? "Your profile";
  const hasProfile = profilesAreComplete(state.profiles);
  onboardingPanel.classList.toggle("hidden", scopedResults.length > 0 && hasProfile);
  if (!hasProfile) {
    onboardingTitle.textContent = `${profileName}: profile details`;
    onboardingText.textContent = "Complete date of birth and height before adding measurements.";
    return;
  }
  if (!scopedResults.length) {
    onboardingTitle.textContent = `${profileName}: ready for first measurement`;
    onboardingText.textContent = "Add a result manually or import a reviewed ChatGPT JSON file.";
    return;
  }
  onboardingTitle.textContent = `${profileName}: ${scopedResults.length} measurements`;
  onboardingText.textContent = `${flaggedCount} warnings · ${dueCount} due or overdue`;
}

function formatRangeOrTarget(result) {
  const low = result.reference_lower_limit;
  const high = result.reference_upper_limit;
  const unit = result.unit ? ` ${result.unit}` : "";
  if (isTargetMetric(result.metric)) return high === null ? "-" : `${formatAxisValue(high)}${unit}`;
  if (low === null && high === null) return "-";
  if (low === null) return `<= ${formatAxisValue(high)}${unit}`;
  if (high === null) return `>= ${formatAxisValue(low)}${unit}`;
  return `${formatAxisValue(low)} - ${formatAxisValue(high)}${unit}`;
}

function saveRangeForResult(result) {
  const key = getRangeKey(result.profile_id, result.metric);
  state.metricRanges[key] = {
    low: result.reference_lower_limit,
    high: result.reference_upper_limit,
    updated_at: new Date().toISOString(),
  };
  saveMetricRanges();
  state.editingRangeKey = null;
}

function toggleRangeEditing() {
  const selectedMetric = getMetric(metricInput.value);
  const profile = getSelectedProfile();
  if (!selectedMetric || !profile) return;

  const key = getRangeKey(profile.id, selectedMetric.name);
  if (state.editingRangeKey === key) {
    state.metricRanges[key] = {
      low: isTargetMetric(selectedMetric.name) ? null : parseLimit(lowInput.value),
      high: parseLimit(highInput.value),
      updated_at: new Date().toISOString(),
    };
    state.editingRangeKey = null;
    saveMetricRanges();
  } else {
    state.editingRangeKey = key;
  }
  syncRangeDefaults();
  renderTrends();
}

function renderTrends() {
  const selectedMetricName = state.activeTrendKey || trendMetricInput.value;
  const scopedResults = visibleResults()
    .filter((result) => result.metric === selectedMetricName)
    .sort((a, b) => a.sample_date.localeCompare(b.sample_date));

  if (!scopedResults.length) {
    trendPanel.innerHTML = `
      <article class="trend-card">
        <strong>No trend data yet</strong>
        <span>Add ${escapeHtml(selectedMetricName)} measurements to see history, high, low, latest, and change.</span>
      </article>
    `;
    return;
  }

  const numericResults = scopedResults.filter((result) => result.metric_type === "numeric");
  const latest = scopedResults[scopedResults.length - 1];
  const previous = scopedResults[scopedResults.length - 2];
  const high = numericResults.length ? maxBy(numericResults, (result) => Number(result.result_value)) : null;
  const low = numericResults.length ? minBy(numericResults, (result) => Number(result.result_value)) : null;
  const changeClass = getTrendClass(latest.trend_direction);
  const chart = numericResults.length >= 2 ? createSparkline(numericResults, latest) : "";
  const rangeText = formatRangeOrTarget(latest);
  const rangeLabel = isTargetMetric(latest.metric) ? "Target" : "Reference";
  const timeline = scopedResults
    .slice(-8)
    .map((result) => `
      <li>
        <span>${formatDate(result.sample_date)}</span>
        <strong>${escapeHtml(result.person_name)} · ${escapeHtml(formatValue(result.result_value, result.unit))}</strong>
        <em>${escapeHtml(result.status_vs_range)} · ${escapeHtml(result.trend_direction)}</em>
      </li>
    `)
    .join("");

  trendPanel.innerHTML = `
    <article class="trend-card">
      <strong>Latest</strong>
      <span>${escapeHtml(latest.person_name)} · ${escapeHtml(formatValue(latest.result_value, latest.unit))}</span>
      <em>${formatDate(latest.sample_date)} · ${escapeHtml(latest.status_vs_range)}</em>
    </article>
    <article class="trend-card">
      <strong>Change</strong>
      <span class="${changeClass}">${previous ? `${formatChange(latest.absolute_change_since_previous_test, latest)} (${formatPercent(latest.percentage_change_since_previous_test, latest)})` : "-"}</span>
      <em>${previous ? `Since ${formatDate(previous.sample_date)}` : "First result"}</em>
    </article>
    <article class="trend-card">
      <strong>${rangeLabel}</strong>
      <span>${escapeHtml(rangeText)}</span>
      <em>${escapeHtml(latest.cadence)}</em>
    </article>
    <article class="trend-card">
      <strong>Lowest</strong>
      <span>${low ? escapeHtml(formatValue(low.result_value, low.unit)) : "-"}</span>
      <em>${low ? `${escapeHtml(low.person_name)} · ${formatDate(low.sample_date)}` : "Not numeric"}</em>
    </article>
    <article class="trend-card">
      <strong>Highest</strong>
      <span>${high ? escapeHtml(formatValue(high.result_value, high.unit)) : "-"}</span>
      <em>${high ? `${escapeHtml(high.person_name)} · ${formatDate(high.sample_date)}` : "Not numeric"}</em>
    </article>
    <article class="trend-card trend-chart">
      <strong>Chart</strong>
      ${chart || "<span>-</span><em>Add at least two numeric results.</em>"}
    </article>
    <article class="trend-card trend-history">
      <strong>Recent history</strong>
      <ul>${timeline}</ul>
    </article>
  `;
}

function createSparkline(results, latest) {
  const width = 720;
  const height = 220;
  const padding = { top: 24, right: 28, bottom: 42, left: 62 };
  const values = results.map((result) => Number(result.result_value));
  const rangeValues = [latest.reference_lower_limit, latest.reference_upper_limit].filter((value) => value !== null);
  const min = Math.min(...values, ...rangeValues);
  const max = Math.max(...values, ...rangeValues);
  const spread = max - min || 1;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const xForIndex = (index) => padding.left + (index / Math.max(results.length - 1, 1)) * chartWidth;
  const yForValue = (value) => padding.top + chartHeight - ((Number(value) - min) / spread) * chartHeight;
  const points = results.map((result, index) => `${roundChange(xForIndex(index))},${roundChange(yForValue(result.result_value))}`).join(" ");
  const rangeBand = createRangeBand(latest, padding, width, chartWidth, yForValue);
  const circles = results
    .map((result, index) => {
      const [x, y] = points.split(" ")[index].split(",");
      const isLatest = index === results.length - 1;
      return `<circle class="${isLatest ? "latest-point" : ""}" cx="${x}" cy="${y}" r="${isLatest ? 6 : 4}"><title>${escapeHtml(result.person_name)} ${formatDate(result.sample_date)}: ${escapeHtml(formatValue(result.result_value, result.unit))}</title></circle>`;
    })
    .join("");
  const first = results[0];
  const last = results[results.length - 1];

  return `
    <svg class="sparkline" viewBox="0 0 ${width} ${height}" role="img" aria-label="Trend chart">
      ${rangeBand}
      <line class="axis" x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}"></line>
      <line class="axis" x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}"></line>
      <text x="${padding.left - 8}" y="${roundChange(yForValue(max) + 4)}" text-anchor="end">${escapeHtml(formatAxisValue(max))}</text>
      <text x="${padding.left - 8}" y="${roundChange(yForValue(min) + 4)}" text-anchor="end">${escapeHtml(formatAxisValue(min))}</text>
      <text x="${padding.left}" y="${height - 12}" text-anchor="start">${formatDate(first.sample_date)}</text>
      <text x="${width - padding.right}" y="${height - 12}" text-anchor="end">${formatDate(last.sample_date)}</text>
      <polyline points="${points}"></polyline>
      ${circles}
    </svg>
    <em>${formatValue(min, results[0].unit)} to ${formatValue(max, results[0].unit)} across ${results.length} results</em>
  `;
}

function createRangeBand(latest, padding, width, chartWidth, yForValue) {
  const low = latest.reference_lower_limit;
  const high = latest.reference_upper_limit;
  if (low === null && high === null) return "";

  if (low !== null && high !== null) {
    const yTop = yForValue(high);
    const yBottom = yForValue(low);
    return `<rect class="range-band" x="${padding.left}" y="${roundChange(yTop)}" width="${chartWidth}" height="${roundChange(yBottom - yTop)}"></rect>`;
  }

  const y = yForValue(low ?? high);
  return `<line class="range-limit" x1="${padding.left}" y1="${roundChange(y)}" x2="${width - padding.right}" y2="${roundChange(y)}"></line>`;
}

function formatAxisValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function getTrendClass(trend) {
  if (trend === "Improved") return "trend-good";
  if (trend === "Worse") return "trend-bad";
  if (trend === "Stable" || trend === "unchanged") return "trend-neutral";
  return "";
}

function maxBy(items, getter) {
  return items.reduce((best, item) => (getter(item) > getter(best) ? item : best), items[0]);
}

function minBy(items, getter) {
  return items.reduce((best, item) => (getter(item) < getter(best) ? item : best), items[0]);
}

function renderSchedule() {
  const priorityOrder = { overdue: 0, due: 1, soon: 2, ok: 3, complete: 4 };
  const items = getScheduleItems()
    .filter((item) => ["overdue", "due", "soon"].includes(item.due.state))
    .sort((a, b) => priorityOrder[a.due.state] - priorityOrder[b.due.state])
    .slice(0, 8);

  schedulePanel.innerHTML = items.length
    ? items
        .map((item) => `
          <article class="schedule-card ${item.due.state}">
            <strong>${escapeHtml(item.metric.name)}</strong>
            <span>${escapeHtml(item.profile.name)} · ${escapeHtml(item.metric.cadence)}</span>
            <em>${escapeHtml(item.due.label)}</em>
          </article>
        `)
        .join("")
    : `<article class="schedule-card ok"><strong>Nothing due</strong><span>Priority metrics are up to date.</span><em>Nice and calm.</em></article>`;
}

function renderSummary() {
  const latestByMetric = new Map();
  [...visibleResults()]
    .sort((a, b) => b.sample_date.localeCompare(a.sample_date))
    .forEach((result) => {
      const key = `${result.profile_id}:${result.metric}`;
      if (!latestByMetric.has(key)) latestByMetric.set(key, result);
    });

  markerSummary.innerHTML = [...latestByMetric.values()]
    .slice(0, 4)
    .map((result) => `
      <article class="summary-card">
        <strong>${escapeHtml(result.person_name)} · ${escapeHtml(result.metric)}</strong>
        <span>${escapeHtml(formatValue(result.result_value, result.unit))} · ${escapeHtml(result.status_vs_range)}</span>
      </article>
    `)
    .join("");
}

function getStatusClass(status) {
  if (status === "Outside range") return "bad";
  if (status === "Near limit" || status === "Above target" || status === "Below target") return "near";
  if (status === "In range" || status === "On target") return "ok";
  return "neutral";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addResult(event) {
  event.preventDefault();
  if (!assertCanEdit()) return;

  const selectedMetric = getMetric(metricInput.value);
  const profile = getProfile(personInput.value);
  if (!selectedMetric || !profile) return;

  const resultValue = parseResultValue(valueInput.value, selectedMetric.type);
  if (resultValue === null || resultValue === "") return;

  const measurementDate = testDateInput.value;
  const result = {
    id: getId(),
    profile_id: profile.id,
    person_name: profile.name,
    test_date: measurementDate,
    sample_date: measurementDate,
    metric: selectedMetric.name,
    group: selectedMetric.group,
    metric_type: selectedMetric.type,
    result_value: resultValue,
    unit: unitInput.value.trim(),
    reference_lower_limit: parseLimit(lowInput.value),
    reference_upper_limit: parseLimit(highInput.value),
    priority: selectedMetric.priority,
    cadence: selectedMetric.cadence,
    interval_days: selectedMetric.intervalDays,
    trend_goal: selectedMetric.goal,
    status_vs_range: null,
    previous_result: null,
    absolute_change_since_previous_test: null,
    percentage_change_since_previous_test: null,
    trend_direction: "first",
    notes: notesInput.value.trim(),
    source_type: sourceTypeInput.value,
    source_confidence: sourceConfidenceInput.value,
    source_notes: sourceNotesInput.value.trim(),
    linked_source_document: sourceDocumentInput.value.trim(),
  };

  state.results.push(result);
  saveRangeForResult(result);
  saveResults();
  form.reset();
  setTodayDefaults();
  populatePeople();
  syncMetricDefaults();
  syncSourceDefaults();
  render();
}

function saveProfile(event) {
  event.preventDefault();
  if (!assertCanEdit()) return;

  state.profiles = state.profiles.map((profile) => {
    const prefix = profile.id;
    const name = document.querySelector(`#${prefix}Name`).value.trim() || profile.name;
    const dateOfBirth = document.querySelector(`#${prefix}Dob`).value;
    const height = document.querySelector(`#${prefix}Height`).value;
    return {
      ...profile,
      name,
      date_of_birth: dateOfBirth,
      height_cm: height,
    };
  });

  state.results = state.results.map((result) => {
    const profile = getProfile(result.profile_id);
    return profile ? { ...result, person_name: profile.name } : result;
  });
  saveProfiles();
  saveResults();
  state.editingProfiles = false;
  populatePeople();
  render();
}

function deleteResult(id) {
  if (!assertCanEdit()) return;
  state.results = state.results.filter((result) => result.id !== id);
  saveResults();
  render();
}

function getId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function exportCsv() {
  const header = [
    "profile_id",
    "person_name",
    "test_date",
    "sample_date",
    "metric",
    "result_value",
    "unit",
    "reference_lower_limit",
    "reference_upper_limit",
    "priority",
    "cadence",
    "interval_days",
    "trend_goal",
    "status_vs_range",
    "previous_result",
    "absolute_change_since_previous_test",
    "percentage_change_since_previous_test",
    "trend_direction",
    "notes",
    "source_type",
    "source_confidence",
    "source_notes",
    "linked_source_document",
  ];
  const rows = state.results
    .sort((a, b) => a.sample_date.localeCompare(b.sample_date) || a.metric.localeCompare(b.metric))
    .map((result) => header.map((key) => result[key] ?? ""));

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `health-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportForChatGpt() {
  const now = new Date().toISOString();
  const scopedResults = state.results;
  const warnings = scopedResults.filter((result) => ["Outside range", "Near limit"].includes(result.status_vs_range));
  const dueItems = getScheduleItems(null).filter((item) => ["due", "soon", "overdue"].includes(item.due.state));
  const latestResults = getLatestResultsForExport(scopedResults);
  const importSchema = getChatGptImportInstructions();
  const exportScope = getExportScopeLabel();

  const lines = [
    "# Preventative Health Dashboard Export",
    "",
    `Exported: ${now}`,
    `Scope: all available data for ${exportScope}`,
    "",
    "## Purpose",
    "",
    "This dashboard is for long-term preventative health trend analysis. It focuses on cardiovascular, metabolic, hormonal, fitness, blood and urine trends. It is not intended to diagnose disease. STI and immunoserology tests are intentionally excluded.",
    "",
    "## How To Use This Export",
    "",
    "Please review longitudinal trends, range warnings, near-limit values, due or overdue monitoring, and meaningful changes since previous measurements. Prioritise prevention and trend context over single isolated values.",
    "",
    "If I upload a lab report or health data file after this export, extract only relevant prevention-dashboard data and return a single JSON file using the schema below. Do not include STI or immunoserology tests. Do not invent values that are not present in the source file.",
    "",
    "## ChatGPT Import JSON Schema",
    "",
    "Return only valid JSON. The prevention log can import this structure directly:",
    "",
    "```json",
    importSchema,
    "```",
    "",
    "Allowed metric names:",
    "",
    metrics.map((item) => `- ${item.name}`).join("\n"),
    "",
    "## People",
    "",
    ...state.profiles.map(
      (profile) =>
        `- ${profile.name}: date of birth ${profile.date_of_birth || "not set"}, age ${
          profile.date_of_birth ? calculateAge(profile.date_of_birth) : "-"
        }, height ${profile.height_cm ? `${profile.height_cm} cm` : "not set"}`,
    ),
    "",
    "## Current Warnings",
    "",
    ...(warnings.length
      ? warnings.map(formatResultForExport)
      : ["- No range warnings in the selected data."]),
    "",
    "## Due Or Overdue",
    "",
    ...(dueItems.length
      ? dueItems.map(
          (item) =>
            `- ${item.profile.name}: ${item.metric.name} (${item.metric.cadence}) - ${item.due.label}`,
        )
      : ["- No priority metrics are currently due or overdue."]),
    "",
    "## Latest Measurement Per Metric",
    "",
    ...(latestResults.length ? latestResults.map(formatResultForExport) : ["- No measurements recorded."]),
    "",
    "## All Measurements",
    "",
    ...(scopedResults.length ? scopedResults.map(formatResultForExport) : ["- No measurements recorded."]),
    "",
  ];

  downloadText(
    `health-dashboard-chatgpt-${new Date().toISOString().slice(0, 10)}.md`,
    lines.join("\n"),
    "text/markdown",
  );
}

function exportReviewPack() {
  const now = new Date().toISOString();
  const warnings = state.results.filter((result) => ["Outside range", "Near limit"].includes(result.status_vs_range));
  const dueItems = getScheduleItems(null).filter((item) => ["due", "soon", "overdue"].includes(item.due.state));
  const materialChanges = getMaterialChanges(state.results);
  const exportScope = getExportScopeLabel();

  const lines = [
    "# Preventative Health Review Pack",
    "",
    `Exported: ${now}`,
    `Scope: focused review pack for ${exportScope}`,
    "",
    "## Purpose",
    "",
    "This review pack highlights items most worth attention: outside-range values, near-limit values, due or overdue monitoring, and materially changed results. It is a triage summary, not a diagnosis.",
    "",
    "## Range Warnings",
    "",
    ...(warnings.length ? warnings.map(formatResultForExport) : ["- No current range warnings."]),
    "",
    "## Due Or Overdue Monitoring",
    "",
    ...(dueItems.length
      ? dueItems.map(
          (item) =>
            `- ${item.profile.name}: ${item.metric.name} (${item.metric.cadence}) - ${item.due.label}`,
        )
      : ["- No priority metrics are due or overdue."]),
    "",
    "## Material Changes",
    "",
    ...(materialChanges.length ? materialChanges.map(formatResultForExport) : ["- No material changes detected using the current threshold."]),
    "",
    "## Threshold Used",
    "",
    "- Numeric results: included when percentage change is at least 10%, trend is Worse, or status is near/outside range.",
    "- Qualitative results: included when changed.",
    "",
  ];

  downloadText(
    `health-dashboard-review-pack-${new Date().toISOString().slice(0, 10)}.md`,
    lines.join("\n"),
    "text/markdown",
  );
}

function getExportScopeLabel() {
  const names = state.profiles.map((profile) => profile.name).filter(Boolean);
  if (names.length === 0) return "this private account";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function getMaterialChanges(results) {
  return results
    .filter((result) => result.previous_result !== null && result.previous_result !== undefined)
    .filter((result) => {
      if (result.metric_type === "qualitative") return result.trend_direction === "changed";
      const percent = Math.abs(Number(result.percentage_change_since_previous_test));
      return (
        result.trend_direction === "Worse" ||
        ["Outside range", "Near limit"].includes(result.status_vs_range) ||
        (Number.isFinite(percent) && percent >= 10)
      );
    })
    .sort((a, b) => b.sample_date.localeCompare(a.sample_date));
}

function getChatGptImportInstructions() {
  return JSON.stringify(
    {
      import_type: "health_dashboard_measurements",
      version: 1,
      notes: "Use the profile_id values already present in the export. Prefer date for the measurement date. result_date and sample_date are also accepted for compatibility. Use null for missing lower or upper reference limits. Include source_type, source_confidence, source_notes, and linked_source_document where available. Keep qualitative urine values as text such as Negative or Rare. Exclude STI and immunoserology tests.",
      measurements: [
        {
          profile_id: "ben",
          date: "YYYY-MM-DD",
          metric: "LDL",
          result_value: 123,
          unit: "mg/dL",
          reference_lower_limit: null,
          reference_upper_limit: 115,
          source_type: "Lab Report / PDF",
          source_confidence: "High",
          source_notes: "Optional source/context note",
          linked_source_document: "Optional report filename or link",
          notes: "Optional source/context note",
        },
      ],
      reference_ranges: [
        {
          profile_id: "ben",
          metric: "LDL",
          reference_lower_limit: null,
          reference_upper_limit: 115,
        },
      ],
    },
    null,
    2,
  );
}

function importFromChatGptFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const review = prepareChatGptImport(parsed);
      renderImportReview(review);
    } catch (error) {
      window.alert(`Import failed: ${error.message}`);
    } finally {
      importChatGptInput.value = "";
    }
  });
  reader.readAsText(file);
}

function prepareChatGptImport(payload) {
  if (!payload || payload.import_type !== "health_dashboard_measurements") {
    throw new Error("This does not look like a health dashboard import file.");
  }

  const incomingMeasurements = Array.isArray(payload.measurements) ? payload.measurements : [];
  const incomingRanges = Array.isArray(payload.reference_ranges) ? payload.reference_ranges : [];
  const prepared = {
    measurements: [],
    ranges: [],
    skipped: [],
  };
  const seenMeasurementKeys = new Set();

  incomingRanges.forEach((range) => {
    const profile = resolveImportProfile(range);
    const selectedMetric = getMetric(range.metric);
    if (!profile || !selectedMetric) {
      prepared.skipped.push({ reason: "Unknown profile or metric", item: range });
      return;
    }
    prepared.ranges.push({
      profile_id: profile.id,
      person_name: profile.name,
      metric: selectedMetric.name,
      low: parseLimit(range.reference_lower_limit),
      high: parseLimit(range.reference_upper_limit),
    });
  });

  incomingMeasurements.forEach((item) => {
    const profile = resolveImportProfile(item);
    const selectedMetric = getMetric(item.metric);
    if (!profile || !selectedMetric) {
      prepared.skipped.push({ reason: "Unknown profile or metric", item });
      return;
    }

    const resultValue = parseResultValue(item.result_value, selectedMetric.type);
    if (resultValue === null || resultValue === "") {
      prepared.skipped.push({ reason: "Missing or invalid result value", item });
      return;
    }
    const sourceType = item.source_type || getDefaultSourceType(selectedMetric.name);

    const result = {
      id: getId(),
      profile_id: profile.id,
      person_name: profile.name,
      test_date: item.date || item.result_date || item.test_date || item.sample_date,
      sample_date: item.date || item.sample_date || item.result_date || item.test_date,
      metric: selectedMetric.name,
      group: selectedMetric.group,
      metric_type: selectedMetric.type,
      result_value: resultValue,
      unit: item.unit ?? selectedMetric.unit,
      reference_lower_limit: parseLimit(item.reference_lower_limit),
      reference_upper_limit: parseLimit(item.reference_upper_limit),
      priority: selectedMetric.priority,
      cadence: selectedMetric.cadence,
      interval_days: selectedMetric.intervalDays,
      trend_goal: selectedMetric.goal,
      status_vs_range: null,
      previous_result: null,
      absolute_change_since_previous_test: null,
      percentage_change_since_previous_test: null,
      trend_direction: "first",
      notes: item.notes ?? "Imported from ChatGPT extraction.",
      source_type: sourceType,
      source_confidence: item.source_confidence || getSourceConfidence(sourceType),
      source_notes: item.source_notes ?? "",
      linked_source_document: item.linked_source_document ?? item.source_document ?? "",
    };

    if (!result.test_date || !result.sample_date) {
      prepared.skipped.push({ reason: "Missing date", item });
      return;
    }
    const duplicateKey = getMeasurementKey(result);
    if (isDuplicateMeasurement(result) || seenMeasurementKeys.has(duplicateKey)) {
      prepared.skipped.push({ reason: "Duplicate measurement already exists", item });
      return;
    }
    seenMeasurementKeys.add(duplicateKey);
    prepared.measurements.push(result);
  });

  return prepared;
}

function importChatGptPayload(payload) {
  return commitPreparedImport(prepareChatGptImport(payload));
}

function commitPreparedImport(prepared) {
  prepared.ranges.forEach((range) => {
    state.metricRanges[getRangeKey(range.profile_id, range.metric)] = {
      low: range.low,
      high: range.high,
      updated_at: new Date().toISOString(),
    };
  });

  prepared.measurements.forEach((result) => {
    state.results.push(result);
    saveRangeForResult(result);
  });

  saveMetricRanges();
  saveResults();
  syncRangeDefaults();
  render();

  return {
    measurementCount: prepared.measurements.length,
    rangeCount: prepared.ranges.length,
    skippedCount: prepared.skipped.length,
  };
}

function renderImportReview(review) {
  if (!assertCanEdit()) return;
  state.pendingImport = review;
  const measurementRows = review.measurements
    .slice(0, 12)
    .map(
      (result) => `
        <tr>
          <td>${escapeHtml(result.person_name)}</td>
          <td>${escapeHtml(result.metric)}</td>
          <td>${escapeHtml(formatValue(result.result_value, result.unit))}</td>
          <td>${formatDate(result.sample_date)}</td>
          <td>${escapeHtml(formatRangeOrTarget(result))}</td>
          <td>${escapeHtml(result.source_confidence)} · ${escapeHtml(result.source_type)}</td>
        </tr>
      `,
    )
    .join("");
  const skippedRows = review.skipped
    .slice(0, 6)
    .map((item) => `<li>${escapeHtml(item.reason)}</li>`)
    .join("");

  importReviewContent.innerHTML = `
    <div class="import-summary">
      <article><strong>${review.measurements.length}</strong><span>measurements ready</span></article>
      <article><strong>${review.ranges.length}</strong><span>ranges ready</span></article>
      <article><strong>${review.skipped.length}</strong><span>skipped</span></article>
    </div>
    ${
      review.measurements.length
        ? `<div class="import-table-wrap"><table class="import-table"><thead><tr><th>Person</th><th>Metric</th><th>Value</th><th>Date</th><th>Range</th><th>Source</th></tr></thead><tbody>${measurementRows}</tbody></table></div>`
        : `<p>No measurements are ready to import.</p>`
    }
    ${review.measurements.length > 12 ? `<p class="privacy-note">Showing first 12 measurements only.</p>` : ""}
    ${review.skipped.length ? `<div class="import-skipped"><strong>Skipped items</strong><ul>${skippedRows}</ul></div>` : ""}
  `;
  importReviewModal.classList.remove("hidden");
}

function closeImportReview() {
  state.pendingImport = null;
  importReviewContent.innerHTML = "";
  importReviewModal.classList.add("hidden");
}

function confirmReviewedImport() {
  if (!assertCanEdit()) return;
  if (!state.pendingImport) return;
  const imported = commitPreparedImport(state.pendingImport);
  closeImportReview();
  window.alert(
    `Imported ${imported.measurementCount} measurements and ${imported.rangeCount} reference ranges. Skipped ${imported.skippedCount}.`,
  );
}

function isDuplicateMeasurement(candidate) {
  return state.results.some(
    (result) => getMeasurementKey(result) === getMeasurementKey(candidate),
  );
}

function getMeasurementKey(result) {
  return `${result.profile_id}:${result.metric}:${result.sample_date}:${String(result.result_value)}`;
}

function resolveImportProfile(item) {
  const raw = String(item.profile_id || item.person_name || item.person || "").trim().toLowerCase();
  if (raw.includes("angelica") || raw.includes("angelika")) return getProfile("angelika");
  if (raw.includes("ben") || raw.includes("benjamin")) return getProfile("ben");
  return state.activeProfileId ? getProfile(state.activeProfileId) : null;
}

function getLatestResultsForExport(results) {
  const latestByMetric = new Map();
  [...results]
    .sort((a, b) => {
      const sampleSort = b.sample_date.localeCompare(a.sample_date);
      return sampleSort || b.test_date.localeCompare(a.test_date);
    })
    .forEach((result) => {
      const key = `${result.profile_id}:${result.metric}`;
      if (!latestByMetric.has(key)) latestByMetric.set(key, result);
    });
  return [...latestByMetric.values()];
}

function formatResultForExport(result) {
  return `- ${result.person_name}: ${result.metric} = ${formatValue(result.result_value, result.unit)} on ${result.sample_date}; status ${result.status_vs_range}; previous ${formatValue(result.previous_result, result.unit)}; change ${formatChange(result.absolute_change_since_previous_test, result)} (${formatPercent(result.percentage_change_since_previous_test, result)}); trend ${result.trend_direction}; cadence ${result.cadence}; source ${result.source_type ?? "not set"} (${result.source_confidence ?? "not set"})${result.linked_source_document ? `; document: ${result.linked_source_document}` : ""}${result.source_notes ? `; source notes: ${result.source_notes}` : ""}${result.notes ? `; notes: ${result.notes}` : ""}`;
}

function downloadText(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function setTodayDefaults() {
  const today = new Date().toISOString().slice(0, 10);
  testDateInput.value = today;
  sampleDateInput.value = today;
}

function clearLegacyData() {
  LEGACY_STORAGE_KEYS.forEach((key) => {
    if (localStorage.getItem(key) && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.removeItem(key);
    }
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol === "file:") return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js?v=0.25").catch(() => {});
  });
}

async function signInWithPassword(event) {
  event.preventDefault();
  if (!cloudState.client) return;
  const email = authEmail.value.trim();
  const password = authPassword.value;
  if (!email || !password) {
    window.alert("Enter email and password to sign in.");
    return;
  }

  authStatus.textContent = "Signing in...";
  const { error } = await cloudState.client.auth.signInWithPassword({ email, password });
  if (error) {
    authStatus.textContent = error.message;
    return;
  }
  authPassword.value = "";
}

async function sendMagicLink() {
  if (!cloudState.client) return;
  const email = authEmail.value.trim();
  if (!email) {
    window.alert("Enter your email address first.");
    return;
  }

  authStatus.textContent = "Sending magic link...";
  const { error } = await cloudState.client.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: window.location.href.split("#")[0],
    },
  });
  authStatus.textContent = error
    ? error.message
    : "Magic link sent. If links are rate-limited, wait before requesting another.";
}

async function signOut() {
  if (!cloudState.client || !cloudState.user) return;
  await cloudState.client.auth.signOut();
  window.location.reload();
}

profileForm.addEventListener("submit", saveProfile);
authForm.addEventListener("submit", signInWithPassword);
magicLinkButton.addEventListener("click", sendMagicLink);
personInput.addEventListener("change", syncRangeDefaults);
metricInput.addEventListener("change", syncMetricDefaults);
metricSearchInput.addEventListener("input", populateMetrics);
quickMetricPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-metric-name]");
  if (!button) return;
  selectMetric(button.dataset.metricName);
  valueInput.focus();
});
sourceTypeInput.addEventListener("change", syncSourceConfidence);
focusEntryButton.addEventListener("click", () => {
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  valueInput.focus();
});
focusImportButton.addEventListener("click", () => importChatGptInput.click());
trendMetricInput.addEventListener("change", () => {
  state.activeTrendKey = trendMetricInput.value;
  renderTrends();
});
rangeEditButton.addEventListener("click", toggleRangeEditing);
form.addEventListener("submit", addResult);
exportCsvButton.addEventListener("click", exportCsv);
exportChatGptButton.addEventListener("click", exportForChatGpt);
exportReviewPackButton.addEventListener("click", exportReviewPack);
importChatGptButton.addEventListener("click", () => importChatGptInput.click());
importChatGptInput.addEventListener("change", () => importFromChatGptFile(importChatGptInput.files[0]));
cancelImportButton.addEventListener("click", closeImportReview);
discardImportButton.addEventListener("click", closeImportReview);
confirmImportButton.addEventListener("click", confirmReviewedImport);
manualRefreshButton.addEventListener("click", () => {
  if (cloudState.enabled && cloudState.user) loadCloudData();
  else window.location.reload();
});
signOutButton.addEventListener("click", signOut);
window.addEventListener("online", () => {
  renderSyncFooter();
  setEditingAvailability();
  if (cloudState.enabled && cloudState.user) loadCloudData();
});
window.addEventListener("offline", () => {
  renderSyncFooter();
  setEditingAvailability();
});
importReviewModal.addEventListener("click", (event) => {
  if (event.target === importReviewModal) closeImportReview();
});
if (resetButton) {
  resetButton.addEventListener("click", () => {
    if (!assertCanEdit()) return;
    if (!state.results.length) return;
    if (!window.confirm("Clear all saved health measurements from this browser?")) return;
    state.results = [];
    saveResults();
    render();
  });
}

profileCards.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-profile]");
  if (editButton) {
    state.editingProfiles = true;
    hydrateProfileForm();
    render();
    return;
  }

  const card = event.target.closest("[data-profile-id]");
  if (!card) return;
  state.activeProfileId = card.dataset.profileId || null;
  populatePeople();
  render();
});

document.querySelector(".filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  state.filter = button.dataset.filter;
  document.querySelectorAll(".filter-button").forEach((item) => {
    item.classList.toggle("active", item === button);
  });
  render();
});

resultsBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-id]");
  if (!button) return;
  if (button.dataset.confirming !== "true") {
    resultsBody.querySelectorAll(".delete-button").forEach((item) => {
      item.dataset.confirming = "false";
      item.textContent = "Delete";
      item.classList.remove("confirming");
    });
    button.dataset.confirming = "true";
    button.textContent = "Confirm";
    button.classList.add("confirming");
    return;
  }
  deleteResult(button.dataset.id);
});

clearLegacyData();
hydrateProfileForm();
populatePeople();
populateMetrics();
populateTrendMetrics();
setTodayDefaults();
syncSourceDefaults();
renderSyncFooter();
render();
registerServiceWorker();
initSupabase();
