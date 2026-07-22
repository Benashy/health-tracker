const TELEGRAM_BOT_TOKEN = Deno.env.get("HEALTH_TRACKER_TELEGRAM_BOT_TOKEN") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const REMINDER_TIME_ZONE = "Europe/Lisbon";
const REMINDER_HOUR = 9;
const CRON_SECRET_RPC = "health_tracker_cron_secret_matches";
const WEBHOOK_SECRET_RPC = "health_tracker_telegram_webhook_secret";
const WEBHOOK_SECRET_MATCH_RPC = "health_tracker_telegram_webhook_secret_matches";
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
  message_id?: number;
  date?: number;
  text?: string;
  chat?: TelegramChat;
};

type TelegramCallbackQuery = {
  id?: string;
  message?: TelegramMessage;
  data?: string;
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
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
  firstDueDate?: string;
  intervalMonths?: number;
  profileIds?: string[];
  warningDays?: number;
  telegramReminderDays?: number[];
  telegramOverdueReminderDay?: number;
  entryMode?: string;
  manualNextDueDate?: boolean;
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
  next_due_date?: string;
  nextDueDate?: string;
  expiry_date?: string;
  expiryDate?: string;
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
const TELEGRAM_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/health-tracker-telegram`;
const PAIRING_CODE_TTL_MINUTES = 30;
const SNOOZE_CALLBACK_PREFIX = "hts";
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
  metric("Pilot medical", "Health checks", 365, "highest", "Annual UK CAA pilot medical", {
    firstDueDate: "2027-07-14",
    intervalMonths: 12,
    profileIds: ["ben"],
    warningDays: 42,
    telegramReminderDays: [42, 30, 14, 7, 1],
    telegramOverdueReminderDay: -1,
    entryMode: "completion",
    manualNextDueDate: true,
  }),
  metric("Eye test", "Health checks", 730, "medium", "Every 2 years", {
    firstDueDate: "2027-06-01",
    intervalMonths: 24,
    entryMode: "completion",
  }),
  metric("Dermatology checkup", "Health checks", 365, "medium", "Every 12 months", {
    firstDueDate: "2027-07-01",
    intervalMonths: 12,
    entryMode: "completion",
  }),
  metric("Pap smear", "Health checks", 1095, "medium", "Every 3 years", {
    intervalMonths: 36,
    profileIds: ["angelika"],
    entryMode: "completion",
  }),
  metric("Breast screening", "Health checks", 730, "medium", "Every 2 years", {
    intervalMonths: 24,
    profileIds: ["angelika"],
    entryMode: "completion",
  }),
];

function metric(
  name: string,
  group: string,
  intervalDays: number | null,
  priority: string,
  cadence?: string,
  options: Partial<DashboardMetric> = {},
): DashboardMetric {
  return {
    name,
    group,
    intervalDays,
    priority,
    cadence: cadence ?? formatInterval(intervalDays),
    ...options,
  };
}

function formatInterval(intervalDays: number | null) {
  if (intervalDays === null) return "Clinically indicated or one-off";
  if (intervalDays <= 31) return `${intervalDays} days`;
  if (intervalDays === 90) return "Every 3 months";
  if (intervalDays === 180) return "Every 6 months";
  if (intervalDays === 365) return "Every 12 months";
  if (intervalDays === 730) return "Every 2 years";
  if (intervalDays === 1095) return "Every 3 years";
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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-health-tracker-cron-secret, x-telegram-bot-api-secret-token",
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

async function requireTelegramWebhookRequest(req: Request) {
  const providedSecret = req.headers.get("x-telegram-bot-api-secret-token")?.trim() ?? "";
  if (!providedSecret) {
    throw new Response(JSON.stringify({ ok: false, error: "Missing Telegram webhook credential." }), {
      status: 401,
      headers: corsHeaders(req),
    });
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${WEBHOOK_SECRET_MATCH_RPC}`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({ provided_secret: providedSecret }),
  });
  const isValid = response.ok ? await response.json().catch(() => false) : false;
  if (isValid !== true) {
    throw new Response(JSON.stringify({ ok: false, error: "Invalid Telegram webhook credential." }), {
      status: 403,
      headers: corsHeaders(req),
    });
  }
}

async function getTelegramWebhookSecret() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${WEBHOOK_SECRET_RPC}`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: "{}",
  });
  if (!response.ok) throw new Error("Could not load Telegram webhook secret.");
  const secret = String(await response.json()).trim();
  if (!secret || secret === "null") throw new Error("Telegram webhook secret is not configured.");
  return secret;
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

  const chat = await getStoredPairingChat(code);
  if (!chat) {
    return jsonResponse(req, {
      ok: true,
      status: "waiting",
      message: "No matching Telegram message found yet. Send the code to Health Tracker Bot, then check again.",
    });
  }

  await deletePairingCode(code);
  return jsonResponse(req, {
    ok: true,
    status: "linked",
    chat: {
      id: chat.id,
      label: chat.label,
      username: chat.username,
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

async function updateDashboardData(userId: string, data: Record<string, unknown>, updatedAt: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/health_dashboard_data?user_id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: {
      ...getAdminHeaders(),
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      data,
      updated_at: updatedAt,
    }),
  });
  if (!response.ok) {
    throw new Error("Could not save Telegram snooze state.");
  }
}

async function getDashboardRowForTelegramChat(chatId: string) {
  const rows = await getAllDashboardRows();
  return rows.find((row) => getTelegramSettings(row.data).chatId === chatId) ?? null;
}

function extractPairingCode(text: unknown) {
  const match = normalisePairingCode(text).match(/HT-[A-Z0-9]{6}/);
  return match?.[0] ?? "";
}

async function upsertPairingCode(code: string, chat: TelegramChat) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + PAIRING_CODE_TTL_MINUTES * 60 * 1000).toISOString();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/health_dashboard_telegram_pairing_codes?on_conflict=code`, {
    method: "POST",
    headers: {
      ...getAdminHeaders(),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      code,
      chat_id: String(chat.id),
      chat_label: getChatLabel(chat),
      chat_username: chat.username ? `@${chat.username}` : "",
      received_at: now.toISOString(),
      expires_at: expiresAt,
      updated_at: now.toISOString(),
    }),
  });
  if (!response.ok) {
    throw new Error("Could not save Telegram pairing code.");
  }
}

async function getStoredPairingChat(code: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/health_dashboard_telegram_pairing_codes?select=code,chat_id,chat_label,chat_username,expires_at&code=eq.${encodeURIComponent(code)}&limit=1`, {
    headers: getAdminHeaders(),
  });
  if (!response.ok) return null;
  const rows = await response.json().catch(() => []);
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row || new Date(String(row.expires_at)).getTime() < Date.now()) return null;
  return {
    id: String(row.chat_id ?? ""),
    label: String(row.chat_label ?? "Telegram chat"),
    username: String(row.chat_username ?? ""),
  };
}

async function deletePairingCode(code: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/health_dashboard_telegram_pairing_codes?code=eq.${encodeURIComponent(code)}`, {
    method: "DELETE",
    headers: {
      ...getAdminHeaders(),
      Prefer: "return=minimal",
    },
  });
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
  if (selectedMetric.name === "Pilot medical") return { key: "pilot-medical", label: "Pilot medical", cycleLabel: "annual CAA cycle" };
  if (selectedMetric.name === "Eye test") return { key: "eye-test", label: "Eye test", cycleLabel: "2-year cycle" };
  if (selectedMetric.name === "Dermatology checkup") return { key: "dermatology", label: "Dermatology", cycleLabel: "12-month cycle" };
  if (selectedMetric.name === "Pap smear") return { key: "pap-smear", label: "Pap smear", cycleLabel: "3-year cycle" };
  if (selectedMetric.name === "Breast screening") return { key: "breast-screening", label: "Breast screening", cycleLabel: "2-year cycle" };
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

function getShortCycleLabel(cycleLabel: string) {
  return cycleLabel
    .replace("14-day cycle", "14d")
    .replace("30-day cycle", "30d")
    .replace("3-month cycle", "3m")
    .replace("6-month cycle", "6m")
    .replace("12-month cycle", "12m")
    .replace("2-year cycle", "2y")
    .replace("annual CAA cycle", "12m")
    .replace("5-10 year cycle", "5-10y");
}

function getDueReminderGroups(dueItems: ReturnType<typeof getDueItems>) {
  const groups = new Map<string, { key: string; label: string; cycleLabel: string; names: string[] }>();
  dueItems.forEach((item) => {
    const group = getScheduleGroup(item.metric);
    const existing = groups.get(group.key) ?? { key: group.key, label: group.label, cycleLabel: group.cycleLabel, names: [] };
    existing.names.push(item.metric.name);
    groups.set(group.key, existing);
  });
  return [...groups.values()];
}

function buildSnoozeReplyMarkup(dueItems: ReturnType<typeof getDueItems>) {
  if (!dueItems.length) return undefined;
  const groupRows = getDueReminderGroups(dueItems)
    .filter((group) => dueItems.some((item) => getScheduleGroup(item.metric).key === group.key && Boolean(item.metric.intervalDays)))
    .map((group) => ([
      {
        text: `${group.label}: next ${getShortCycleLabel(group.cycleLabel)}`,
        callback_data: `${SNOOZE_CALLBACK_PREFIX}:g:${group.key}`,
      },
    ]));
  return {
    inline_keyboard: [
      [
        { text: "Snooze all 3d", callback_data: `${SNOOZE_CALLBACK_PREFIX}:all:3` },
        { text: "Snooze all 7d", callback_data: `${SNOOZE_CALLBACK_PREFIX}:all:7` },
      ],
      ...groupRows,
    ],
  };
}

function getSnoozeKey(profileId: string, metricName: string) {
  return `${profileId}:${metricName}`;
}

function isMetricAvailableForProfile(selectedMetric: DashboardMetric, profileId?: string) {
  if (!profileId || !Array.isArray(selectedMetric.profileIds) || !selectedMetric.profileIds.length) return true;
  return selectedMetric.profileIds.includes(profileId);
}

function isCompletionMetric(selectedMetric: DashboardMetric) {
  return selectedMetric.entryMode === "completion";
}

function getStoredNextDueDate(result: DashboardMeasurement | null) {
  return result?.next_due_date ?? result?.nextDueDate ?? result?.expiry_date ?? result?.expiryDate ?? "";
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
    .filter((item) =>
      isMetricAvailableForProfile(item, profileId) &&
      !item.firstDueDate &&
      getScheduleGroup(item).key === group.key &&
      item.intervalDays === selectedMetric.intervalDays
    )
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

function getNextDueDate(profileId: string, selectedMetric: DashboardMetric, measurements: DashboardMeasurement[], latest: DashboardMeasurement | null) {
  if (isCompletionMetric(selectedMetric)) {
    const storedNextDueDate = getStoredNextDueDate(latest);
    if (storedNextDueDate) return parseDateString(storedNextDueDate);
    const latestDate = latest?.sample_date ?? latest?.test_date ?? "";
    if (latestDate && selectedMetric.intervalMonths && !selectedMetric.manualNextDueDate) {
      const parsedLatestDate = parseDateString(latestDate);
      return parsedLatestDate ? addMonths(parsedLatestDate, selectedMetric.intervalMonths) : null;
    }
    if (selectedMetric.firstDueDate) return parseDateString(selectedMetric.firstDueDate);
  }

  if (selectedMetric.firstDueDate) {
    const firstDueDate = parseDateString(selectedMetric.firstDueDate);
    if (!firstDueDate) return null;
    if (selectedMetric.intervalMonths) {
      return getNextFixedDueDate(selectedMetric.firstDueDate, selectedMetric.intervalMonths, latest?.sample_date ?? latest?.test_date ?? null);
    }
    if (!latest) return firstDueDate;
  }

  const anchorDate = getScheduleAnchorDate(profileId, selectedMetric, measurements);
  return anchorDate ? addDays(anchorDate, selectedMetric.intervalDays ?? 0) : null;
}

function getNextFixedDueDate(firstDueDate: string, intervalMonths: number, latestDateString?: string | null) {
  let dueDate = parseDateString(firstDueDate);
  const latestDate = parseDateString(latestDateString ?? "");
  if (!dueDate) return null;
  if (!latestDate) return dueDate;
  while (dueDate <= latestDate) {
    dueDate = addMonths(dueDate, intervalMonths);
  }
  return dueDate;
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

  let nextDate = getNextDueDate(profileId, selectedMetric, measurements, latest);
  if (!latest && !nextDate) return { state: "due", label: "No result yet", nextDate: null };

  const snoozedDate = snoozes[getSnoozeKey(profileId, selectedMetric.name)]?.due_date;
  if (snoozedDate && (!nextDate || new Date(`${snoozedDate}T00:00:00Z`) > nextDate)) {
    nextDate = new Date(`${snoozedDate}T00:00:00Z`);
  }

  if (!nextDate) return { state: "due", label: "No result yet", nextDate: null };

  const daysRemaining = daysBetween(new Date(), nextDate);
  const warningDays = getWarningDays(selectedMetric);
  if (daysRemaining < 0) return { state: "overdue", label: `Overdue by ${Math.abs(daysRemaining)} days`, nextDate };
  if (daysRemaining === 0) return { state: "due", label: "Due today", nextDate };
  if (daysRemaining <= warningDays) return { state: "soon", label: `Due in ${daysRemaining} days`, nextDate };
  return { state: "ok", label: `Due ${formatDate(nextDate)}`, nextDate };
}

function shouldIncludeScheduledReminder(
  item: { metric: DashboardMetric; due: { state: string; nextDate: Date | null } },
  localDate: string,
) {
  if (!item.metric.telegramReminderDays?.length) return true;
  if (!item.due.nextDate) return true;
  const daysRemaining = daysBetween(new Date(`${localDate}T00:00:00Z`), item.due.nextDate);
  if (daysRemaining < 0) return daysRemaining === (item.metric.telegramOverdueReminderDay ?? -1);
  return item.metric.telegramReminderDays.includes(daysRemaining);
}

function getDueItems(data: Record<string, unknown>, options: { scheduledOnly?: boolean; localDate?: string } = {}) {
  const profiles = getDashboardProfiles(data);
  const measurements = getDashboardMeasurements(data);
  const { snoozes } = getScheduleState(data);
  return profiles.flatMap((profile) =>
    REMINDER_METRICS
      .filter((item) => isMetricAvailableForProfile(item, profile.id) && ["highest", "medium"].includes(item.priority))
      .map((selectedMetric) => ({
        profile,
        metric: selectedMetric,
        due: getDueStatus(profile, selectedMetric, measurements, snoozes),
      }))
      .filter((item) => ["overdue", "due", "soon"].includes(item.due.state))
      .filter((item) => !options.scheduledOnly || shouldIncludeScheduledReminder(item, options.localDate ?? getReminderLocalTime().date)),
  );
}

function getWarningDays(metricOrIntervalDays: DashboardMetric | number) {
  if (typeof metricOrIntervalDays === "object" && metricOrIntervalDays.warningDays !== undefined) {
    return metricOrIntervalDays.warningDays;
  }
  const intervalDays = typeof metricOrIntervalDays === "object" ? metricOrIntervalDays.intervalDays ?? 0 : metricOrIntervalDays;
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

function addMonths(date: Date, months: number) {
  const day = date.getUTCDate();
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate();
  next.setUTCDate(Math.min(day, lastDay));
  return next;
}

function parseDateString(dateString: string) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
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

function buildDueMessage(data: Record<string, unknown>, options: { scheduledOnly?: boolean; localDate?: string } = {}) {
  const dueItems = getDueItems(data, options);
  if (!dueItems.length) {
    return {
      dueCount: 0,
      message: [
        "Health Tracker reminder",
        "",
        "No priority checks are due right now.",
      ].join("\n"),
      replyMarkup: undefined,
    };
  }

  const groups = getDueReminderGroups(dueItems);
  const lines = groups.map((group) => `- ${group.label} (${group.cycleLabel}): ${summariseMetricNames(group.names)}`);
  const message = [
    "Health Tracker reminder",
    "",
    getStatusHeadline(dueItems),
    "",
    ...lines,
    "",
    `Open dashboard: ${DASHBOARD_URL}`,
  ].join("\n");
  return { dueCount: dueItems.length, message, replyMarkup: buildSnoozeReplyMarkup(dueItems) };
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

function getDueSignature(data: Record<string, unknown>, options: { scheduledOnly?: boolean; localDate?: string } = {}) {
  return getDueItems(data, options)
    .map((item) => {
      const profileId = item.profile.id ?? "profile";
      const nextDate = item.due.nextDate ? formatDate(item.due.nextDate) : "none";
      return `${profileId}:${item.metric.name}:${item.due.state}:${nextDate}`;
    })
    .sort()
    .join("|");
}

function getDatePlusDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

function parseSnoozeCallbackData(data: string) {
  const parts = data.split(":");
  if (parts[0] !== SNOOZE_CALLBACK_PREFIX) return null;
  if (parts[1] === "all" && ["3", "7"].includes(parts[2])) {
    return { mode: "all", days: Number(parts[2]), groupKey: "" };
  }
  if (parts[1] === "g" && parts[2]) {
    return { mode: "group", days: null, groupKey: parts[2] };
  }
  return null;
}

function getMutableScheduleState(data: Record<string, unknown>) {
  const current = (data.schedule_state ?? data.scheduleState ?? {}) as Record<string, unknown>;
  const currentSnoozes = current.snoozes && typeof current.snoozes === "object"
    ? current.snoozes as Record<string, unknown>
    : {};
  const next = {
    ...current,
    snoozes: { ...currentSnoozes },
  };
  data.schedule_state = next;
  return next as Record<string, unknown> & { snoozes: Record<string, unknown> };
}

function applySnoozeCallback(data: Record<string, unknown>, callbackData: string) {
  const selection = parseSnoozeCallbackData(callbackData);
  if (!selection) return { count: 0, label: "That snooze option is no longer available." };

  const dueItems = getDueItems(data);
  const selectedItems = dueItems.filter((item) => {
    if (selection.mode === "all") return true;
    return getScheduleGroup(item.metric).key === selection.groupKey && Boolean(item.metric.intervalDays);
  });
  if (!selectedItems.length) return { count: 0, label: "Nothing matching that snooze option is due now." };

  const localDate = getReminderLocalTime().date;
  const updatedAt = new Date().toISOString();
  const scheduleState = getMutableScheduleState(data);
  const dueDates = new Set<string>();

  selectedItems.forEach((item) => {
    const profileId = item.profile.id ?? "profile";
    const days = selection.mode === "all" ? Number(selection.days) : Number(item.metric.intervalDays ?? 0);
    if (!days) return;
    const dueDate = getDatePlusDays(localDate, days);
    scheduleState.snoozes[getSnoozeKey(profileId, item.metric.name)] = {
      due_date: dueDate,
      updated_at: updatedAt,
      source: "telegram",
    };
    dueDates.add(dueDate);
  });

  const count = dueDates.size ? selectedItems.length : 0;
  if (!count) return { count: 0, label: "That check cannot be snoozed to a cycle." };
  if (selection.mode === "all") return { count, label: `Snoozed ${count} due check${count === 1 ? "" : "s"} for ${selection.days} days.` };

  const group = getDueReminderGroups(selectedItems)[0];
  return {
    count,
    label: `Snoozed ${group?.label ?? "checks"} to the next cycle (${group?.cycleLabel ?? "cycle"}).`,
  };
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
    ...(summary.replyMarkup ? { reply_markup: summary.replyMarkup } : {}),
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

    const reminderOptions = { scheduledOnly: true, localDate: localTime.date };
    const summary = buildDueMessage(row.data, reminderOptions);
    if (!summary.dueCount) {
      skipped += 1;
      continue;
    }

    const signature = getDueSignature(row.data, reminderOptions);
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
      ...(summary.replyMarkup ? { reply_markup: summary.replyMarkup } : {}),
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

async function handleTelegramMessageWebhook(message: TelegramMessage) {
  const code = extractPairingCode(message.text);
  if (!code || !message.chat || message.chat.type !== "private") return;

  await upsertPairingCode(code, message.chat);
  await telegramApi("sendMessage", {
    chat_id: String(message.chat.id),
    text: "Pairing code received. Return to Health Dashboard and tap Check code.",
    disable_web_page_preview: true,
  });
}

async function handleTelegramCallbackWebhook(callback: TelegramCallbackQuery) {
  const callbackId = String(callback.id ?? "");
  const callbackData = String(callback.data ?? "");
  const chatId = callback.message?.chat?.id === undefined ? "" : String(callback.message.chat.id);
  const messageId = callback.message?.message_id;

  if (!callbackId || !chatId) return;
  const row = await getDashboardRowForTelegramChat(chatId);
  if (!row) {
    await telegramApi("answerCallbackQuery", {
      callback_query_id: callbackId,
      text: "Telegram is not linked to a Health Dashboard account.",
      show_alert: true,
    });
    return;
  }

  const result = applySnoozeCallback(row.data, callbackData);
  if (result.count > 0) {
    await updateDashboardData(row.user_id, row.data, new Date().toISOString());
    if (messageId) {
      await telegramApi("editMessageReplyMarkup", {
        chat_id: chatId,
        message_id: messageId,
      });
    }
  }

  await telegramApi("answerCallbackQuery", {
    callback_query_id: callbackId,
    text: result.label,
    show_alert: false,
  });
}

async function handleTelegramWebhook(req: Request, update: TelegramUpdate) {
  await requireTelegramWebhookRequest(req);
  if (update.message) await handleTelegramMessageWebhook(update.message);
  if (update.callback_query) await handleTelegramCallbackWebhook(update.callback_query);
  return jsonResponse(req, { ok: true });
}

async function handleConfigureWebhook(req: Request) {
  await requireCronRequest(req);
  const secret = await getTelegramWebhookSecret();
  const result = await telegramApi("setWebhook", {
    url: TELEGRAM_FUNCTION_URL,
    secret_token: secret,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: false,
  });
  if (!result.ok) return jsonResponse(req, { ok: false, error: result.description ?? "Could not configure Telegram webhook." }, 502);
  return jsonResponse(req, { ok: true, configured: true, result: result.result ?? true });
}

async function handleWebhookStatus(req: Request) {
  await requireCronRequest(req);
  const result = await telegramApi("getWebhookInfo");
  if (!result.ok) return jsonResponse(req, { ok: false, error: result.description ?? "Could not load Telegram webhook status." }, 502);
  return jsonResponse(req, {
    ok: true,
    url: result.result?.url ?? "",
    pending_update_count: result.result?.pending_update_count ?? 0,
    allowed_updates: result.result?.allowed_updates ?? [],
    last_error_date: result.result?.last_error_date ?? null,
    last_error_message: result.result?.last_error_message ?? "",
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return jsonResponse(req, { ok: false, error: "POST required." }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    if (body?.update_id !== undefined || body?.message || body?.callback_query) {
      return await handleTelegramWebhook(req, body as TelegramUpdate);
    }

    const action = String(body.action ?? "probe");

    if (action === "send_scheduled_reminders") return await handleSendScheduledReminders(req, body);
    if (action === "configure_webhook") return await handleConfigureWebhook(req);
    if (action === "webhook_status") return await handleWebhookStatus(req);

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
