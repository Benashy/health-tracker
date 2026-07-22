const TELEGRAM_BOT_TOKEN = Deno.env.get("HEALTH_TRACKER_TELEGRAM_BOT_TOKEN") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const REMINDER_TIME_ZONE = "Europe/Lisbon";
const REMINDER_HOUR = 9;
const CRON_SECRET_RPC = "health_tracker_cron_secret_matches";
const APPROVED_EMAILS = new Set(["ben_ashurst@me.com", "angelika_kleczka@hotmail.com"]);
const ALLOWED_ORIGINS = new Set([
  "https://benashy.github.io",
  "http://localhost:8765",
  "http://127.0.0.1:8765",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

type TelegramChat = {
  id: number | string;
  type?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  title?: string;
};

type TelegramMessage = {
  date?: number;
  text?: string;
  chat?: TelegramChat;
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
};

type DashboardUser = {
  id: string;
  email: string;
  token: string;
  publishableKey: string;
};

type DashboardMetric = {
  name: string;
  group: string;
  intervalDays: number | null;
  priority: string;
  cadence: string;
};

type DashboardProfile = {
  id?: string;
  name?: string;
};

type DashboardMeasurement = {
  profile_id?: string;
  metric?: string;
  sample_date?: string;
  test_date?: string;
};

type DashboardRow = {
  user_id: string;
  data: Record<string, unknown>;
};

type ReminderStateRow = {
  user_id: string;
  last_sent_date?: string | null;
  last_signature?: string | null;
  last_sent_at?: string | null;
};

const DASHBOARD_URL = "https://benashy.github.io/health-tracker/";
const REMINDER_METRICS: DashboardMetric[] = [
  metric("Weight", "Core body metrics", 14, "highest"),
  metric("Waist circumference", "Core body metrics", 14, "highest"),
  metric("Blood pressure systolic", "Vitals and fitness", 30, "highest"),
  metric("Blood pressure diastolic", "Vitals and fitness", 30, "highest"),
  metric("Resting heart rate", "Vitals and fitness", 30, "highest"),
  metric("VO2 Max", "Vitals and fitness", 90, "highest"),
  metric("Haemoglobin", "Full blood count", 365, "medium"),
  metric("Erythrocytes", "Full blood count", 365, "medium"),
  metric("Haematocrit", "Full blood count", 365, "medium"),
  metric("MCV", "Full blood count", 365, "medium"),
  metric("MCH", "Full blood count", 365, "medium"),
  metric("MCHC", "Full blood count", 365, "medium"),
  metric("RDW", "Full blood count", 365, "medium"),
  metric("Leukocytes", "Full blood count", 365, "medium"),
  metric("Neutrophils", "Full blood count", 365, "medium"),
  metric("Eosinophils", "Full blood count", 365, "medium"),
  metric("Basophils", "Full blood count", 365, "medium"),
  metric("Lymphocytes", "Full blood count", 365, "medium"),
  metric("Monocytes", "Full blood count", 365, "medium"),
  metric("Platelets", "Full blood count", 365, "medium"),
  metric("B12", "Vitamins and iron", 365, "medium"),
  metric("Folate", "Vitamins and iron", 365, "medium"),
  metric("Ferritin", "Vitamins and iron", 365, "medium"),
  metric("Vitamin D", "Vitamins and iron", 365, "medium"),
  metric("Glucose", "Metabolic", 180, "medium"),
  metric("Fasting glucose", "Metabolic", 180, "medium"),
  metric("HbA1c NGSP", "Metabolic", 180, "medium"),
  metric("HbA1c IFCC", "Metabolic", 180, "medium"),
  metric("Total cholesterol", "Lipids", 180, "medium"),
  metric("LDL", "Lipids", 180, "medium"),
  metric("HDL", "Lipids", 180, "medium"),
  metric("Triglycerides", "Lipids", 180, "medium"),
  metric("ApoB", "Cardiovascular markers", 365, "highest", "Annual if clinically indicated"),
  metric("Lipoprotein(a)", "Cardiovascular markers", null, "highest", "One-time lifetime measurement"),
  metric("CRP", "Inflammation", 365, "medium"),
  metric("Creatinine", "Renal and purines", 365, "medium"),
  metric("eGFR", "Renal and purines", 365, "medium"),
  metric("AST", "Liver and enzymes", 365, "medium"),
  metric("ALT", "Liver and enzymes", 365, "medium"),
  metric("GGT", "Liver and enzymes", 365, "medium"),
  metric("TSH", "Endocrine", 365, "medium"),
  metric("FT4", "Endocrine", 365, "medium"),
  metric("Total testosterone", "Hormone panel", 365, "highest", "If symptoms or clinically indicated"),
  metric("SHBG", "Hormone panel", 365, "highest", "If symptoms or clinically indicated"),
];

function metric(name: string, group: string, intervalDays: number | null, priority: string, cadence?: string): DashboardMetric {
  return {
    name,
    group,
    intervalDays,
    priority,
    cadence: cadence ?? formatInterval(intervalDays),
  };
}

function formatInterval(intervalDays: number | null) {
  if (intervalDays === null) return "Clinically indicated or one-off";
  if (intervalDays <= 31) return `${intervalDays} days`;
  if (intervalDays === 90) return "Every 3 months";
  if (intervalDays === 180) return "Every 6 months";
  if (intervalDays === 365) return "Every 12 months";
  if (intervalDays === 1825) return "Every 5 years";
  if (intervalDays === 3650) return "Every 10 years";
  return `Every ${intervalDays} days`;
}

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) || origin.startsWith("http://localhost:")
    ? origin
    : "https://benashy.github.io";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-health-tracker-cron-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

function jsonResponse(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(req),
  });
}

function getPublishableKey() {
  const publishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (publishableKeys) {
    try {
      const parsed = JSON.parse(publishableKeys);
      if (typeof parsed.default === "string") return parsed.default;
    } catch {
      // Fall back to the legacy anon key below.
    }
  }
  return Deno.env.get("SUPABASE_ANON_KEY") ?? "";
}

function getSecretKey() {
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys);
      if (typeof parsed.default === "string") return parsed.default;
      const firstKey = Object.values(parsed).find((value) => typeof value === "string");
      if (typeof firstKey === "string") return firstKey;
    } catch {
      // Fall back to the legacy service-role key below.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

function getAdminHeaders() {
  const secretKey = getSecretKey();
  if (!SUPABASE_URL || !secretKey) {
    throw new Error("Supabase server credentials are not configured.");
  }
  const headers: Record<string, string> = {
    apikey: secretKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (secretKey.split(".").length === 3) headers.Authorization = `Bearer ${secretKey}`;
  return headers;
}

async function requireApprovedUser(req: Request): Promise<DashboardUser> {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const publishableKey = getPublishableKey();
  if (!token || !SUPABASE_URL || !publishableKey) {
    throw new Response(JSON.stringify({ ok: false, error: "Missing authenticated session." }), {
      status: 401,
      headers: corsHeaders(req),
    });
  }

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!userResponse.ok) {
    throw new Response(JSON.stringify({ ok: false, error: "Invalid authenticated session." }), {
      status: 401,
      headers: corsHeaders(req),
    });
  }

  const user = await userResponse.json();
  const email = String(user?.email ?? "").toLowerCase();
  if (!APPROVED_EMAILS.has(email)) {
    throw new Response(JSON.stringify({ ok: false, error: "This account is not authorised for Health Tracker reminders." }), {
      status: 403,
      headers: corsHeaders(req),
    });
  }

  return { id: String(user.id ?? ""), email, token, publishableKey };
}

async function requireCronRequest(req: Request) {
  const providedSecret = req.headers.get("x-health-tracker-cron-secret")?.trim() ?? "";
  if (!providedSecret) {
    throw new Response(JSON.stringify({ ok: false, error: "Missing reminder scheduler credential." }), {
      status: 401,
      headers: corsHeaders(req),
    });
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${CRON_SECRET_RPC}`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({ provided_secret: providedSecret }),
  });
  const isValid = response.ok ? await response.json().catch(() => false) : false;
  if (isValid !== true) {
    throw new Response(JSON.stringify({ ok: false, error: "Invalid reminder scheduler credential." }), {
      status: 403,
      headers: corsHeaders(req),
    });
  }
}

async function telegramApi(method: string, payload: Record<string, unknown> = {}) {
  if (!TELEGRAM_BOT_TOKEN) {
    return { ok: false, description: "Telegram token is not configured." };
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({ ok: false, description: "Telegram returned a non-JSON response." }));
  if (!response.ok) {
    return { ok: false, description: data?.description ?? `Telegram request failed with ${response.status}.` };
  }
  return data;
}

function normalisePairingCode(code: unknown) {
  return String(code ?? "").trim().toUpperCase();
}

function isValidPairingCode(code: string) {
  return /^HT-[A-Z0-9]{6}$/.test(code);
}

function getChatLabel(chat: TelegramChat) {
  const name = [chat.first_name, chat.last_name].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (chat.username) return `@${chat.username}`;
  if (chat.title) return chat.title;
  return "Telegram chat";
}

function getMatchingChat(updates: TelegramUpdate[], code: string) {
  const thirtyMinutesAgo = Math.floor(Date.now() / 1000) - 30 * 60;
  return updates
    .map((update) => update.message)
    .filter((message): message is TelegramMessage => Boolean(message?.chat))
    .filter((message) => message.chat?.type === "private")
    .filter((message) => Number(message.date ?? 0) >= thirtyMinutesAgo)
    .filter((message) => normalisePairingCode(message.text).includes(code))
    .sort((a, b) => Number(b.date ?? 0) - Number(a.date ?? 0))[0]?.chat ?? null;
}

async function handleProbe(req: Request) {
  const bot = await telegramApi("getMe");
  if (!bot.ok) return jsonResponse(req, { ok: false, error: bot.description ?? "Telegram bot check failed." }, 502);
  return jsonResponse(req, {
    ok: true,
    bot: {
      username: bot.result?.username ?? "HealthTrackerReminderBot",
      first_name: bot.result?.first_name ?? "Health Tracker Bot",
    },
  });
}

async function handleResolveChat(req: Request, body: Record<string, unknown>) {
  const code = normalisePairingCode(body.code);
  if (!isValidPairingCode(code)) {
    return jsonResponse(req, { ok: false, error: "Use a fresh pairing code from the dashboard." }, 400);
  }

  const updates = await telegramApi("getUpdates", {
    limit: 50,
    allowed_updates: ["message"],
  });
  if (!updates.ok) return jsonResponse(req, { ok: false, error: updates.description ?? "Could not read Telegram updates." }, 502);

  const chat = getMatchingChat(updates.result ?? [], code);
  if (!chat) {
    return jsonResponse(req, {
      ok: true,
      status: "waiting",
      message: "No matching Telegram message found yet. Send the code to Health Tracker Bot, then check again.",
    });
  }

  return jsonResponse(req, {
    ok: true,
    status: "linked",
    chat: {
      id: String(chat.id),
      label: getChatLabel(chat),
      username: chat.username ? `@${chat.username}` : "",
    },
  });
}

async function handleSendTest(req: Request, body: Record<string, unknown>) {
  const chatId = String(body.chat_id ?? "").trim();
  if (!/^-?\d+$/.test(chatId)) {
    return jsonResponse(req, { ok: false, error: "Telegram chat is not linked yet." }, 400);
  }

  const result = await telegramApi("sendMessage", {
    chat_id: chatId,
    text: "Health Tracker reminders are connected.",
    disable_web_page_preview: true,
  });
  if (!result.ok) return jsonResponse(req, { ok: false, error: result.description ?? "Telegram test message failed." }, 502);

  return jsonResponse(req, { ok: true, sent: true });
}

async function getDashboardData(user: DashboardUser) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/health_dashboard_data?select=data&user_id=eq.${encodeURIComponent(user.id)}`, {
    headers: {
      apikey: user.publishableKey,
      Authorization: `Bearer ${user.token}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    return null;
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows[0]?.data ?? null : null;
}

async function getAllDashboardRows() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/health_dashboard_data?select=user_id,data`, {
    headers: getAdminHeaders(),
  });
  if (!response.ok) {
    throw new Error("Could not load dashboard data for scheduled reminders.");
  }
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows as DashboardRow[] : [];
}

async function getReminderStateRows() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/health_dashboard_telegram_reminder_state?select=user_id,last_sent_date,last_signature,last_sent_at`, {
    headers: getAdminHeaders(),
  });
  if (!response.ok) return new Map<string, ReminderStateRow>();
  const rows = await response.json().catch(() => []);
  if (!Array.isArray(rows)) return new Map<string, ReminderStateRow>();
  return new Map(rows.map((row: ReminderStateRow) => [row.user_id, row]));
}

async function upsertReminderState(userId: string, reminderDate: string, signature: string, sentAt: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/health_dashboard_telegram_reminder_state?on_conflict=user_id`, {
    method: "POST",
    headers: {
      ...getAdminHeaders(),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      user_id: userId,
      last_sent_date: reminderDate,
      last_signature: signature,
      last_sent_at: sentAt,
      updated_at: sentAt,
    }),
  });
  if (!response.ok) {
    throw new Error("Could not save scheduled reminder state.");
  }
}

function getTelegramSettings(data: Record<string, unknown>) {
  const settings = data?.settings as Record<string, unknown> | undefined;
  const telegram = settings?.telegram as Record<string, unknown> | undefined;
  return {
    chatId: String(telegram?.chat_id ?? telegram?.chatId ?? "").trim(),
    chatLabel: String(telegram?.chat_label ?? telegram?.chatLabel ?? "").trim(),
    enabled: telegram?.enabled !== false,
    pausedAt: String(telegram?.paused_at ?? telegram?.pausedAt ?? "").trim(),
  };
}

function getDashboardProfiles(data: Record<string, unknown>) {
  const profiles = Array.isArray(data?.profiles) ? data.profiles as DashboardProfile[] : [];
  return profiles.length ? profiles : [{ id: "profile", name: "Health Tracker" }];
}

function getDashboardMeasurements(data: Record<string, unknown>) {
  const measurements = Array.isArray(data?.measurements)
    ? data.measurements as DashboardMeasurement[]
    : Array.isArray(data?.results)
      ? data.results as DashboardMeasurement[]
      : [];
  return measurements.filter((item) => item.metric && (item.sample_date || item.test_date));
}

function getScheduleState(data: Record<string, unknown>) {
  const scheduleState = (data?.schedule_state ?? data?.scheduleState ?? {}) as Record<string, unknown>;
  const snoozes = (scheduleState.snoozes ?? {}) as Record<string, { due_date?: string }>;
  return { snoozes };
}

function getScheduleGroup(selectedMetric: DashboardMetric) {
  if (["Weight", "Waist circumference"].includes(selectedMetric.name)) {
    return { key: "body", label: "Body composition", cycleLabel: "14-day cycle" };
  }
  if (selectedMetric.name === "VO2 Max") return { key: "fitness", label: "Fitness", cycleLabel: "3-month cycle" };
  if (selectedMetric.group === "Vitals and fitness") {
    return { key: "vitals-fitness", label: "Vitals and fitness", cycleLabel: "30-day cycle" };
  }
  if (["Metabolic", "Lipids", "Cardiovascular markers"].includes(selectedMetric.group)) {
    return { key: "six-month-bloods", label: "Six-monthly bloods", cycleLabel: "6-month cycle" };
  }
  if (selectedMetric.group === "One-off and infrequent") {
    return { key: "infrequent", label: "Infrequent checks", cycleLabel: "5-10 year cycle" };
  }
  if ((selectedMetric.intervalDays ?? 0) >= 365) return { key: "annual-bloods", label: "Annual bloods", cycleLabel: "12-month cycle" };
  return {
    key: selectedMetric.group.toLowerCase().replaceAll(" ", "-"),
    label: selectedMetric.group,
    cycleLabel: selectedMetric.cadence,
  };
}

function getSnoozeKey(profileId: string, metricName: string) {
  return `${profileId}:${metricName}`;
}

function getLatestResult(profileId: string, metricName: string, measurements: DashboardMeasurement[]) {
  return [...measurements]
    .filter((result) => result.profile_id === profileId && result.metric === metricName)
    .sort((a, b) => {
      const aDate = a.sample_date ?? a.test_date ?? "";
      const bDate = b.sample_date ?? b.test_date ?? "";
      return bDate.localeCompare(aDate);
    })[0] ?? null;
}

function getScheduleAnchorDate(profileId: string, selectedMetric: DashboardMetric, measurements: DashboardMeasurement[]) {
  const group = getScheduleGroup(selectedMetric);
  const matchingMetrics = REMINDER_METRICS
    .filter((item) => getScheduleGroup(item).key === group.key && item.intervalDays === selectedMetric.intervalDays)
    .map((item) => item.name);
  const matchingResults = measurements
    .filter((result) => result.profile_id === profileId && matchingMetrics.includes(result.metric ?? ""))
    .sort((a, b) => {
      const aDate = a.sample_date ?? a.test_date ?? "";
      const bDate = b.sample_date ?? b.test_date ?? "";
      return bDate.localeCompare(aDate);
    });
  return matchingResults[0]?.sample_date ?? matchingResults[0]?.test_date ?? null;
}

function getDueStatus(
  profile: DashboardProfile,
  selectedMetric: DashboardMetric,
  measurements: DashboardMeasurement[],
  snoozes: Record<string, { due_date?: string }>,
) {
  const profileId = profile.id ?? "profile";
  const latest = getLatestResult(profileId, selectedMetric.name, measurements);
  if (!selectedMetric.intervalDays) {
    return latest
      ? { state: "complete", label: "Recorded", nextDate: null }
      : { state: "due", label: selectedMetric.cadence, nextDate: null };
  }

  const anchorDate = getScheduleAnchorDate(profileId, selectedMetric, measurements);
  let nextDate = anchorDate ? addDays(anchorDate, selectedMetric.intervalDays) : null;
  if (!latest && !nextDate) return { state: "due", label: "No result yet", nextDate: null };

  const snoozedDate = snoozes[getSnoozeKey(profileId, selectedMetric.name)]?.due_date;
  if (snoozedDate && (!nextDate || new Date(`${snoozedDate}T00:00:00Z`) > nextDate)) {
    nextDate = new Date(`${snoozedDate}T00:00:00Z`);
  }

  if (!nextDate) return { state: "due", label: "No result yet", nextDate: null };

  const daysRemaining = daysBetween(new Date(), nextDate);
  const warningDays = getWarningDays(selectedMetric.intervalDays);
  if (daysRemaining < 0) return { state: "overdue", label: `Overdue by ${Math.abs(daysRemaining)} days`, nextDate };
  if (daysRemaining === 0) return { state: "due", label: "Due today", nextDate };
  if (daysRemaining <= warningDays) return { state: "soon", label: `Due in ${daysRemaining} days`, nextDate };
  return { state: "ok", label: `Due ${formatDate(nextDate)}`, nextDate };
}

function getDueItems(data: Record<string, unknown>) {
  const profiles = getDashboardProfiles(data);
  const measurements = getDashboardMeasurements(data);
  const { snoozes } = getScheduleState(data);
  return profiles.flatMap((profile) =>
    REMINDER_METRICS
      .filter((item) => ["highest", "medium"].includes(item.priority))
      .map((selectedMetric) => ({
        profile,
        metric: selectedMetric,
        due: getDueStatus(profile, selectedMetric, measurements, snoozes),
      }))
      .filter((item) => ["overdue", "due", "soon"].includes(item.due.state)),
  );
}

function getWarningDays(intervalDays: number) {
  if (intervalDays <= 14) return 2;
  if (intervalDays <= 31) return 3;
  if (intervalDays <= 90) return 7;
  if (intervalDays <= 210) return 14;
  if (intervalDays <= 400) return 30;
  return 90;
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function daysBetween(start: Date, end: Date) {
  const startDate = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const endDate = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  return Math.ceil((endDate - startDate) / 86400000);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function summariseMetricNames(names: string[]) {
  const uniqueNames = [...new Set(names)];
  if (uniqueNames.length <= 6) return uniqueNames.join(", ");
  return `${uniqueNames.slice(0, 6).join(", ")} and ${uniqueNames.length - 6} more`;
}

function getStatusHeadline(dueItems: ReturnType<typeof getDueItems>) {
  if (dueItems.some((item) => item.due.state === "overdue")) return "Some Health Tracker checks are overdue.";
  if (dueItems.some((item) => item.due.state === "due")) return "Some Health Tracker checks are due today.";
  return "Some Health Tracker checks are due soon.";
}

function buildDueMessage(data: Record<string, unknown>) {
  const dueItems = getDueItems(data);
  if (!dueItems.length) {
    return {
      dueCount: 0,
      message: [
        "Health Tracker reminder",
        "",
        "No priority checks are due right now.",
      ].join("\n"),
    };
  }

  const groups = new Map<string, { label: string; cycleLabel: string; names: string[] }>();
  dueItems.forEach((item) => {
    const group = getScheduleGroup(item.metric);
    const existing = groups.get(group.key) ?? { label: group.label, cycleLabel: group.cycleLabel, names: [] };
    existing.names.push(item.metric.name);
    groups.set(group.key, existing);
  });

  const lines = [...groups.values()].map((group) => `- ${group.label} (${group.cycleLabel}): ${summariseMetricNames(group.names)}`);
  const message = [
    "Health Tracker reminder",
    "",
    getStatusHeadline(dueItems),
    "",
    ...lines,
    "",
    `Open dashboard: ${DASHBOARD_URL}`,
  ].join("\n");
  return { dueCount: dueItems.length, message };
}

function getReminderLocalTime(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: REMINDER_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
    }).formatToParts(now).map((part) => [part.type, part.value]),
  );
  const hour = Number(parts.hour === "24" ? "0" : parts.hour);
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour,
  };
}

function getDueSignature(data: Record<string, unknown>) {
  return getDueItems(data)
    .map((item) => {
      const profileId = item.profile.id ?? "profile";
      const nextDate = item.due.nextDate ? formatDate(item.due.nextDate) : "none";
      return `${profileId}:${item.metric.name}:${item.due.state}:${nextDate}`;
    })
    .sort()
    .join("|");
}

async function handleSendDueSummary(req: Request, user: DashboardUser) {
  const data = await getDashboardData(user);
  if (!data) return jsonResponse(req, { ok: false, error: "Dashboard data was not found." }, 404);

  const telegram = getTelegramSettings(data);
  if (!telegram.chatId) {
    return jsonResponse(req, { ok: false, error: "Telegram is not linked for this account yet." }, 400);
  }

  const summary = buildDueMessage(data as Record<string, unknown>);
  const result = await telegramApi("sendMessage", {
    chat_id: telegram.chatId,
    text: summary.message,
    disable_web_page_preview: true,
  });
  if (!result.ok) return jsonResponse(req, { ok: false, error: result.description ?? "Telegram due reminder failed." }, 502);

  return jsonResponse(req, {
    ok: true,
    sent: true,
    due_count: summary.dueCount,
  });
}

async function handleSendScheduledReminders(req: Request, body: Record<string, unknown>) {
  await requireCronRequest(req);

  const localTime = getReminderLocalTime();
  const force = body.force === true;
  if (!force && localTime.hour !== REMINDER_HOUR) {
    return jsonResponse(req, {
      ok: true,
      skipped: true,
      reason: `Not ${String(REMINDER_HOUR).padStart(2, "0")}:00 in ${REMINDER_TIME_ZONE}.`,
      local_date: localTime.date,
      local_hour: localTime.hour,
    });
  }

  const rows = await getAllDashboardRows();
  const reminderStateRows = await getReminderStateRows();
  const sentAt = new Date().toISOString();
  const dryRun = body.dry_run === true;
  let sent = 0;
  let wouldSend = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const settings = getTelegramSettings(row.data);
    if (!settings.chatId || !settings.enabled || settings.pausedAt) {
      skipped += 1;
      continue;
    }

    const summary = buildDueMessage(row.data);
    if (!summary.dueCount) {
      skipped += 1;
      continue;
    }

    const signature = getDueSignature(row.data);
    const previous = reminderStateRows.get(row.user_id);
    if (previous?.last_sent_date === localTime.date) {
      skipped += 1;
      continue;
    }

    if (dryRun) {
      wouldSend += 1;
      continue;
    }

    const result = await telegramApi("sendMessage", {
      chat_id: settings.chatId,
      text: summary.message,
      disable_web_page_preview: true,
    });

    if (!result.ok) {
      failed += 1;
      continue;
    }

    await upsertReminderState(row.user_id, localTime.date, signature, sentAt);
    sent += 1;
  }

  return jsonResponse(req, {
    ok: failed === 0,
    dry_run: dryRun,
    sent,
    would_send: wouldSend,
    skipped,
    failed,
    local_date: localTime.date,
    local_hour: localTime.hour,
  }, failed ? 502 : 200);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return jsonResponse(req, { ok: false, error: "POST required." }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "probe");

    if (action === "send_scheduled_reminders") return await handleSendScheduledReminders(req, body);

    const user = await requireApprovedUser(req);
    if (action === "probe") return await handleProbe(req);
    if (action === "resolve_chat") return await handleResolveChat(req, body);
    if (action === "send_test") return await handleSendTest(req, body);
    if (action === "send_due_summary") return await handleSendDueSummary(req, user);

    return jsonResponse(req, { ok: false, error: "Unknown Telegram action." }, 400);
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Telegram setup failed.";
    return jsonResponse(req, { ok: false, error: message }, 500);
  }
});
