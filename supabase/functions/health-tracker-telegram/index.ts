const TELEGRAM_BOT_TOKEN = Deno.env.get("HEALTH_TRACKER_TELEGRAM_BOT_TOKEN") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
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

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) || origin.startsWith("http://localhost:")
    ? origin
    : "https://benashy.github.io";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

async function requireApprovedUser(req: Request) {
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

  return { id: String(user.id ?? ""), email };
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
    text: "Health Tracker reminders are connected.\n\nThis test did not include any health values.",
    disable_web_page_preview: true,
  });
  if (!result.ok) return jsonResponse(req, { ok: false, error: result.description ?? "Telegram test message failed." }, 502);

  return jsonResponse(req, { ok: true, sent: true });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return jsonResponse(req, { ok: false, error: "POST required." }, 405);

  try {
    await requireApprovedUser(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "probe");

    if (action === "probe") return await handleProbe(req);
    if (action === "resolve_chat") return await handleResolveChat(req, body);
    if (action === "send_test") return await handleSendTest(req, body);

    return jsonResponse(req, { ok: false, error: "Unknown Telegram action." }, 400);
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Telegram setup failed.";
    return jsonResponse(req, { ok: false, error: message }, 500);
  }
});
