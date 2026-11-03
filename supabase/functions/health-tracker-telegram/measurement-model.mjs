export const ENTRY_PREFIX = "htm";
export const ENTRY_TTL_MS = 15 * 60 * 1000;
export const SAVE_LEASE_MS = 30 * 1000;
export const ENTRY_TIME_ZONE = "Europe/Lisbon";

const METRICS = {
  Weight: { unit: "kg", group: "Core body metrics", days: 14, goal: "context", change: 0.5, high: null, target: true },
  "Waist circumference": { unit: "cm", group: "Core body metrics", days: 14, goal: "lower", change: 1, high: null, target: true },
  "Blood pressure systolic": { unit: "mmHg", group: "Vitals and fitness", days: 30, goal: "lower", change: 5, high: 120 },
  "Blood pressure diastolic": { unit: "mmHg", group: "Vitals and fitness", days: 30, goal: "lower", change: 5, high: 80 },
};

export const ENTRY_CHOICES = [
  { key: "weight", label: "Weight", metrics: ["Weight"], prompt: "Enter your weight in kg, for example 82.5." },
  { key: "waist", label: "Waist circumference", metrics: ["Waist circumference"], prompt: "Enter your waist circumference in cm, for example 92." },
  { key: "bp", label: "Blood pressure", metrics: ["Blood pressure systolic", "Blood pressure diastolic"], prompt: "Enter systolic/diastolic in mmHg, for example 120/80." },
];

export class EntryValidationError extends Error {}

export function entryEnabled(data) {
  return data?.settings?.telegram?.measurement_entry_enabled === true;
}

export function entryChoice(key) {
  return ENTRY_CHOICES.find((choice) => choice.key === key);
}

export function availableChoices(data, profileId) {
  const tracking = data?.settings?.metric_tracking_by_profile ?? data?.settings?.metricTrackingByProfile ?? {};
  return ENTRY_CHOICES.filter((choice) => choice.metrics.every((name) => tracking[profileId]?.[name] !== "not_tracked"));
}

export function reminderEntryRows(data, dueItems) {
  if (!entryEnabled(data) || !Array.isArray(data.profiles) || data.profiles.length !== 1) return [];
  const names = new Set(dueItems.map((item) => item.metric.name));
  return availableChoices(data, data.profiles[0].id)
    .filter((choice) => choice.metrics.some((name) => names.has(name)))
    .map((choice) => [{ text: `Enter ${choice.label.toLowerCase()}`, callback_data: `${ENTRY_PREFIX}:start:${choice.key}` }]);
}

export function entryToday(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: ENTRY_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function parseEntryDate(text, now = new Date()) {
  const raw = String(text ?? "").trim();
  const british = /^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/.exec(raw);
  const value = british ? `${british[3]}-${british[2].padStart(2, "0")}-${british[1].padStart(2, "0")}` : raw;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new EntryValidationError("Use DD/MM/YYYY, for example 02/11/2026.");
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value || value < "1900-01-01" || value > entryToday(now)) {
    throw new EntryValidationError("Enter a real date on or before today.");
  }
  return value;
}

export function formatEntryDate(value) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" })
    .format(new Date(`${value}T00:00:00Z`));
}

export function validateEntryValues(key, values) {
  const limits = key === "weight" ? [[10, 400]] : key === "waist" ? [[20, 300]] : key === "bp" ? [[40, 300], [20, 200]] : [];
  if (!limits.length || !Array.isArray(values) || values.length !== limits.length || values.some((value, index) => (
    typeof value !== "number" || !Number.isFinite(value) || value < limits[index][0] || value > limits[index][1]
  ))) throw new EntryValidationError("Check the reading and units, then try again.");
  if (key === "bp" && (values.some((value) => !Number.isInteger(value)) || values[0] <= values[1])) {
    throw new EntryValidationError("Enter the higher systolic number first, for example 120/80.");
  }
  return values;
}

export function parseEntryValue(key, text) {
  const raw = String(text ?? "").trim();
  if (raw.length > 80) throw new EntryValidationError("Send only the reading, for example 82.5 or 120/80.");
  if (key === "bp") {
    const match = /^(\d{2,3})\s*\/\s*(\d{2,3})(?:\s*mmhg)?$/i.exec(raw);
    if (!match) throw new EntryValidationError("Enter systolic/diastolic, for example 120/80.");
    return validateEntryValues(key, [Number(match[1]), Number(match[2])]);
  }
  const match = /^(\d+(?:[.,]\d{1,2})?)(?:\s*(kg|cm))?$/i.exec(raw);
  const unit = key === "weight" ? "kg" : "cm";
  if (!match || (match[2] && match[2].toLowerCase() !== unit)) {
    throw new EntryValidationError(`Enter one reading in ${unit}, for example ${key === "weight" ? "82.5" : "92"}.`);
  }
  return validateEntryValues(key, [Number(match[1].replace(",", "."))]);
}

export function measurementIds(session) {
  return entryChoice(session.entry_key)?.metrics.map((name, index) => `telegram-${session.session_id}-${index}`) ?? [];
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

function referenceFields(raw, meta, values) {
  return {
    lower: Boolean(raw?.lower ?? raw?.low ?? (values.low !== null)),
    target: Boolean(raw?.target ?? (values.target !== null || meta.target)),
    upper: Boolean(raw?.upper ?? raw?.high ?? (values.high !== null || (!meta.target && meta.high !== null))),
  };
}

function savedReference(data, profileId, name) {
  const meta = METRICS[name];
  const saved = (data.reference_ranges ?? data.metricRanges ?? {})[`${profileId}:${name}`];
  if (!saved) return { low: null, target: null, high: meta.high, fields: { lower: false, target: Boolean(meta.target), upper: meta.high !== null } };
  const legacyTarget = meta.target && saved.target === undefined && saved.target_value === undefined;
  const values = {
    low: numberOrNull(saved.low ?? saved.reference_lower_limit),
    target: numberOrNull(saved.target ?? saved.target_value ?? (legacyTarget ? saved.high ?? saved.reference_upper_limit : null)),
    high: numberOrNull(legacyTarget ? null : saved.high ?? saved.reference_upper_limit),
  };
  const fields = referenceFields(saved.fields ?? saved.reference_fields, meta, values);
  if (values.low !== null && values.high !== null && values.low > values.high) throw new EntryValidationError("Check this metric's reference settings in the dashboard first.");
  return { low: fields.lower ? values.low : null, target: fields.target ? values.target : null, high: fields.upper ? values.high : null, fields };
}

export function dashboardMeasurements(data) {
  const rows = data.measurements ?? data.results ?? [];
  if (!Array.isArray(rows)) throw new EntryValidationError("Open the dashboard to check your data before recording here.");
  return rows;
}

function rowDate(row) { return row.sample_date || row.test_date || ""; }

export function entryContext(account, key, date) {
  const choice = availableChoices(account.data, account.profileId).find((item) => item.key === key);
  if (!choice) throw new EntryValidationError("This metric is not tracked. Enable it in the dashboard first.");
  const version = Number(account.data.data_version ?? 1);
  if (!Number.isInteger(version) || version < 1 || version > 2) throw new EntryValidationError("Use the dashboard until Telegram entry supports this data version.");
  const rows = dashboardMeasurements(account.data);
  const references = choice.metrics.map((name) => ({ name, ...savedReference(account.data, account.profileId, name) }));
  const relevant = rows.filter((row) => row.profile_id === account.profileId && choice.metrics.includes(row.metric));
  if (relevant.some((row) => row.unit && row.unit !== METRICS[row.metric].unit)) {
    throw new EntryValidationError("The stored units differ. Use the dashboard to review this metric before entering it in Telegram.");
  }
  const sameDay = relevant.filter((row) => rowDate(row) === date).map((row) => [row.id, row.metric, row.result_value]);
  const previous = choice.metrics.map((name) => relevant.filter((row) => row.metric === name && rowDate(row) < date)
    .sort((a, b) => rowDate(b).localeCompare(rowDate(a)) || String(b.test_date ?? "").localeCompare(String(a.test_date ?? "")))[0] ?? null);
  return {
    references,
    duplicate: sameDay.length > 0,
    signature: JSON.stringify({ profile: account.profileId, references, sameDay, previous }),
  };
}

function normaliseNumericRow(row) {
  const meta = METRICS[row.metric];
  const migrated = meta.target && row.target_value === undefined;
  const values = {
    low: numberOrNull(row.reference_lower_limit),
    target: numberOrNull(row.target_value ?? (migrated ? row.reference_upper_limit : null)),
    high: numberOrNull(migrated ? null : row.reference_upper_limit),
  };
  const fields = referenceFields(row.reference_fields, meta, values);
  return { ...row, reference_fields: fields, reference_lower_limit: fields.lower ? values.low : null, target_value: fields.target ? values.target : null, reference_upper_limit: fields.upper ? values.high : null };
}

export function numericEntryStatus(row) {
  const value = Number(row.result_value);
  const low = numberOrNull(row.reference_lower_limit);
  const high = numberOrNull(row.reference_upper_limit);
  const target = numberOrNull(row.target_value ?? (METRICS[row.metric].target ? row.reference_upper_limit : null));
  const near = [low, high].some((limit) => limit !== null && Math.abs(limit) > 0 && Math.abs(value - limit) <= Math.abs(limit) * 0.02 + Number.EPSILON);
  if ((low !== null && value < low) || (high !== null && value > high)) return near ? "Near limit" : "Outside range";
  if (near) return "Near limit";
  if (target !== null) {
    if (METRICS[row.metric].target) return value > target ? "Above target" : value >= target - 1 ? "On target" : "Below target";
    return (row.trend_goal ?? METRICS[row.metric].goal) === "higher"
      ? value >= target ? "On target" : "Below target"
      : value <= target ? "On target" : "Above target";
  }
  return low !== null || high !== null ? "In range" : "Recorded";
}

// These four numeric rules are checked against app.js in the integration suite.
function deriveNumericRow(row, rows) {
  const current = normaliseNumericRow(row);
  const previous = rows.filter((item) => item.id !== row.id && item.profile_id === row.profile_id && item.metric === row.metric)
    .filter((item) => rowDate(item) < rowDate(row) || (rowDate(item) === rowDate(row) && String(item.test_date ?? "") < String(row.test_date ?? "")))
    .sort((a, b) => rowDate(b).localeCompare(rowDate(a)) || String(b.test_date ?? "").localeCompare(String(a.test_date ?? "")))[0];
  const status = numericEntryStatus(current);
  const derived = { previous_result: null, absolute_change_since_previous_test: null, percentage_change_since_previous_test: null, trend_direction: "first" };
  if (previous) {
    const before = normaliseNumericRow(previous);
    const delta = Number(current.result_value) - Number(before.result_value);
    derived.previous_result = before.result_value;
    derived.absolute_change_since_previous_test = Number(delta.toFixed(2));
    derived.percentage_change_since_previous_test = Number(before.result_value) === 0 ? null : Number((delta / Number(before.result_value) * 100).toFixed(2));
    const stable = !delta || Math.abs(delta) < METRICS[row.metric].change || (row.metric.startsWith("Blood pressure") && status === "In range" && numericEntryStatus(before) === "In range");
    const goal = row.trend_goal ?? METRICS[row.metric].goal;
    derived.trend_direction = stable ? "Stable" : goal === "lower" ? delta < 0 ? "Improved" : "Worse" : goal === "higher" ? delta > 0 ? "Improved" : "Worse" : goal === "range" ? rangeTrend(current, before) : delta > 0 ? "Up" : "Down";
  }
  return { ...current, status_vs_range: status, ...derived };
}

function rangeTrend(current, previous) {
  const low = numberOrNull(current.reference_lower_limit);
  const high = numberOrNull(current.reference_upper_limit);
  if (low === null && high === null) return "Changed";
  if (low !== null && high !== null) {
    const midpoint = (low + high) / 2;
    const difference = Math.abs(Number(current.result_value) - midpoint) - Math.abs(Number(previous.result_value) - midpoint);
    return difference < 0 ? "Improved" : difference > 0 ? "Worse" : "Stable";
  }
  return high !== null ? Number(current.result_value) < Number(previous.result_value) ? "Improved" : "Worse" : Number(current.result_value) > Number(previous.result_value) ? "Improved" : "Worse";
}

export function applyEntryToDashboard(account, session, now = new Date()) {
  validateEntryValues(session.entry_key, session.values);
  parseEntryDate(session.measurement_date, now);
  const context = entryContext(account, session.entry_key, session.measurement_date);
  const ids = measurementIds(session);
  const oldRows = dashboardMeasurements(account.data);
  const existing = oldRows.filter((row) => ids.includes(row.id));
  if (existing.length) return { data: account.data, alreadySaved: true, measurements: existing };
  if (context.signature !== session.context_signature) return { needsReview: true, context };
  const next = structuredClone(account.data);
  const additions = context.references.map((reference, index) => {
    const meta = METRICS[reference.name];
    return {
      id: ids[index], profile_id: account.profileId, person_name: account.profile.name,
      test_date: session.measurement_date, sample_date: session.measurement_date,
      metric: reference.name, group: meta.group, metric_type: "numeric", result_value: session.values[index], unit: meta.unit,
      reference_lower_limit: reference.low, target_value: reference.target, reference_upper_limit: reference.high,
      reference_fields: reference.fields, priority: "highest", cadence: `${meta.days} days`, interval_days: meta.days, trend_goal: meta.goal,
      notes: "", source_type: "Manual Measurement", source_confidence: "Medium to High", source_notes: "Entered via Telegram", linked_source_document: "",
      recorded_at: now.toISOString(), telegram_entry_id: session.session_id,
    };
  });
  const allRows = [...oldRows, ...additions];
  const names = new Set(additions.map((row) => row.metric));
  next.measurements = allRows.map((row) => row.profile_id === account.profileId && names.has(row.metric) ? deriveNumericRow(row, allRows) : row);
  const schedule = next.schedule_state ?? next.scheduleState ?? {};
  next.schedule_state = { ...schedule, snoozes: { ...schedule.snoozes } };
  for (const row of additions) delete next.schedule_state.snoozes[`${account.profileId}:${row.metric}`];
  return { data: next, alreadySaved: false, measurements: next.measurements.filter((row) => ids.includes(row.id)) };
}

export function entryReadingText(key, values) {
  if (key === "bp") return `Blood pressure: ${values[0]}/${values[1]} mmHg`;
  return `${entryChoice(key).label}: ${values[0]} ${key === "weight" ? "kg" : "cm"}`;
}
