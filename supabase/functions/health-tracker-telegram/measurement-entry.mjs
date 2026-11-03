import {
  ENTRY_PREFIX, ENTRY_TTL_MS, SAVE_LEASE_MS, EntryValidationError,
  availableChoices, entryChoice, entryEnabled, entryToday, parseEntryDate,
  parseEntryValue, entryContext, formatEntryDate, entryReadingText,
  applyEntryToDashboard, dashboardMeasurements, latestSavedReading, measurementIds,
} from "./measurement-model.mjs";

function privateActor(chat, sender) {
  return chat?.type === "private" && !sender?.is_bot && /^[1-9]\d*$/.test(String(chat.id)) && String(sender?.id) === String(chat.id);
}

function sameAccount(account, session) {
  return account && account.userId === session.user_id && account.profileId === session.profile_id
    && account.chatId === session.chat_id && account.chatId === session.telegram_user_id
    && account.linkedAt === session.link_version && entryEnabled(account.data);
}

export function createMeasurementEntryHandler(deps) {
  const now = deps.now ?? (() => new Date());
  const randomId = deps.randomId ?? (() => crypto.randomUUID());

  async function send(chatId, text, options = {}) {
    const response = await deps.telegram("sendMessage", {
      chat_id: chatId, text, disable_web_page_preview: true, protect_content: true, ...options,
    });
    if (!response.ok || !response.result?.message_id) throw new Error("Telegram entry message could not be delivered.");
    return response.result.message_id;
  }

  async function acknowledge(callback, text, alert = false) {
    if (!callback.id) return;
    // An expired Telegram toast must not prevent a durable reply or a valid save.
    await deps.telegram("answerCallbackQuery", { callback_query_id: callback.id, text, show_alert: alert }).catch(() => {});
  }

  async function persist(session, changes) {
    const next = { ...session, ...changes, revision: session.revision + 1, updated_at: now().toISOString() };
    if (!await deps.saveSession(next, session)) throw new EntryValidationError("This entry changed. Use its latest buttons, or start again with /record.");
    return next;
  }

  async function prompt(account, session, date = false, errorText = "") {
    const text = date ? "Enter the measurement date as DD/MM/YYYY, for example 02/11/2026." : entryChoice(session.entry_key).prompt;
    const latest = !date && sameAccount(account, session) ? latestSavedReading(account, session.entry_key, now()) : null;
    const message = [
      errorText, text,
      latest ? `Last saved: ${latest.value} ${latest.unit} on ${formatEntryDate(latest.date)}.` : "",
      "Send /cancel to cancel.",
    ].filter(Boolean).join("\n\n");
    const messageId = await send(session.chat_id, message, {
      reply_markup: { force_reply: true, input_field_placeholder: date ? "DD/MM/YYYY" : session.entry_key === "bp" ? "120/80" : session.entry_key === "weight" ? "82.5" : "92" },
    });
    return persist(session, { prompt_message_id: messageId });
  }

  async function confirmation(session, heading = "Check your reading") {
    const revision = session.revision + 1;
    const action = (name) => `${ENTRY_PREFIX}:${name}:${session.session_id}:${revision}`;
    const messageId = await send(session.chat_id, [
      heading, "", entryReadingText(session.entry_key, session.values),
      `Date: ${formatEntryDate(session.measurement_date)} (Lisbon)`,
      session.duplicate ? "A reading already exists for this date. Save another reading?" : "",
    ].filter(Boolean).join("\n"), {
      reply_markup: { inline_keyboard: [
        [{ text: session.duplicate ? "Save another reading" : "Save reading", callback_data: action("save") }],
        [{ text: "Change value", callback_data: action("value") }, { text: "Change date", callback_data: action("date") }],
        [{ text: "Cancel", callback_data: action("cancel") }],
      ] },
    });
    return persist(session, { prompt_message_id: messageId });
  }

  async function menu(account) {
    const choices = availableChoices(account.data, account.profileId);
    if (!choices.length) return send(account.chatId, "These metrics are not tracked. Enable one in the dashboard first.");
    return send(account.chatId, "What would you like to record?", {
      reply_markup: { inline_keyboard: choices.map((choice) => [{ text: choice.label, callback_data: `${ENTRY_PREFIX}:start:${choice.key}` }]) },
    });
  }

  async function start(account, key, eventId) {
    entryContext(account, key, entryToday(now()));
    const previous = await deps.loadSession(account.userId);
    if (previous?.stage === "saving" && Date.parse(previous.save_started_at) + SAVE_LEASE_MS > now().getTime()) {
      return send(account.chatId, "Your last reading is being saved. Please wait a moment before starting another.");
    }
    if (previous?.last_event_id === eventId && sameAccount(account, previous)) {
      if (previous.stage === "awaiting_value" && !previous.prompt_message_id) return prompt(account, previous);
      return;
    }
    const session = {
      user_id: account.userId, chat_id: account.chatId, telegram_user_id: account.chatId,
      profile_id: account.profileId, link_version: account.linkedAt,
      session_id: randomId(), entry_key: key, stage: "awaiting_value",
      revision: (previous?.revision ?? -1) + 1, measurement_date: entryToday(now()), values: [],
      context_signature: "", duplicate: false, prompt_message_id: null, last_event_id: eventId,
      expires_at: new Date(now().getTime() + ENTRY_TTL_MS).toISOString(), updated_at: now().toISOString(), save_started_at: null,
    };
    if (!await deps.saveSession(session, previous)) throw new EntryValidationError("Another entry started. Send /record to choose again.");
    return prompt(account, session);
  }

  async function cancel(account, session) {
    if (!session || !sameAccount(account, session)) return send(account.chatId, "No active entry. Send /record to start.");
    if (session.stage === "saved") return send(account.chatId, "That reading was already saved. Manage saved readings in the dashboard.");
    if (session.stage === "saving") return send(account.chatId, "The save is already in progress. Tap Save again to check its result.");
    await persist(session, { stage: "cancelled", values: [], context_signature: "", prompt_message_id: null });
    return send(account.chatId, "Entry cancelled. Nothing was recorded.");
  }

  async function finishSaved(account, session, alreadySaved = false) {
    const finished = { ...session, stage: "saved", values: [], context_signature: "", revision: session.revision + 1, updated_at: now().toISOString() };
    // The dashboard write is authoritative if session bookkeeping has a transient failure.
    await deps.saveSession(finished, session).catch(() => false);
    const receipt = await send(account.chatId, alreadySaved ? "This entry was already recorded. No duplicate was added." : `Saved to your dashboard.\n${entryReadingText(session.entry_key, session.values)}\n${formatEntryDate(session.measurement_date)}`, {
      reply_markup: { inline_keyboard: [[{ text: "Record another", callback_data: `${ENTRY_PREFIX}:menu` }]] },
    });
    if (session.prompt_message_id) await deps.telegram("editMessageReplyMarkup", { chat_id: account.chatId, message_id: session.prompt_message_id }).catch(() => {});
    return receipt;
  }

  async function save(account, session) {
    if (session.stage === "saved") return send(account.chatId, "This entry was already recorded. No duplicate was added.");
    const ids = measurementIds(session);
    if (dashboardMeasurements(account.data).some((row) => ids.includes(row.id))) return finishSaved(account, session, true);
    if (session.stage === "saving" && Date.parse(session.save_started_at) + SAVE_LEASE_MS > now().getTime()) {
      return send(account.chatId, "This entry is being saved. Please wait a moment, then tap Save again.");
    }
    let claimed = await persist(session, { stage: "saving", save_started_at: now().toISOString() });
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const latest = await deps.loadAccount(account.chatId);
      if (!sameAccount(latest, claimed)) {
        await persist(claimed, { stage: "cancelled", values: [], context_signature: "" });
        return send(account.chatId, "The Telegram connection or entry setting changed. Nothing new was recorded.");
      }
      const result = applyEntryToDashboard(latest, claimed, now());
      if (result.needsReview) {
        claimed = await persist(claimed, { stage: "confirming", context_signature: result.context.signature, duplicate: result.context.duplicate, save_started_at: null });
        return confirmation(claimed, "Your readings or reference settings changed. Check again before saving.");
      }
      if (result.alreadySaved) return finishSaved(latest, claimed, true);
      if (await deps.saveDashboard(latest, result.data)) return finishSaved(latest, claimed);
    }
    claimed = await persist(claimed, { stage: "confirming", save_started_at: null });
    return confirmation(claimed, "The dashboard changed while saving. Please check and confirm again.");
  }

  async function handleMessage(message) {
    if (!privateActor(message.chat, message.from) || message.forward_origin || message.forward_date || message.is_automatic_forward) return false;
    const text = String(message.text ?? "").trim();
    const command = /^\/(record|start|weight|waist|bp|cancel)(?:@HealthTrackerReminderBot)?$/i.exec(text)?.[1]?.toLowerCase();
    if (!command && !message.reply_to_message?.message_id) return false;
    const account = await deps.loadAccount(String(message.chat.id));
    if (!account) return false;
    if (!entryEnabled(account.data)) {
      if (command) await send(account.chatId, "Enable Enter readings in Telegram in your dashboard's Telegram settings first.");
      return true;
    }
    try {
      if (command === "record" || command === "start") { await menu(account); return true; }
      if (["weight", "waist", "bp"].includes(command)) { await start(account, command, `message:${message.message_id}`); return true; }
      let session = await deps.loadSession(account.userId);
      if (command === "cancel") { await cancel(account, session); return true; }
      if (!session || !sameAccount(account, session)) return false;
      if (session.last_event_id === `message:${message.message_id}`) {
        if (session.stage === "confirming" && !session.prompt_message_id) await confirmation(session);
        else if (["awaiting_value", "awaiting_date"].includes(session.stage) && !session.prompt_message_id) await prompt(account, session, session.stage === "awaiting_date");
        return true;
      }
      if (!Number.isFinite(Date.parse(session.expires_at)) || Date.parse(session.expires_at) <= now().getTime()) {
        await send(account.chatId, "That entry expired. Send /record to start again."); return true;
      }
      if (!["awaiting_value", "awaiting_date"].includes(session.stage)) return false;
      if (Number(message.reply_to_message.message_id) !== session.prompt_message_id) {
        await send(account.chatId, "Reply to the latest entry prompt, or send /record to start again."); return true;
      }
      const values = session.stage === "awaiting_date" ? session.values : parseEntryValue(session.entry_key, text);
      const date = session.stage === "awaiting_date" ? parseEntryDate(text, now()) : session.measurement_date;
      const context = entryContext(account, session.entry_key, date);
      session = await persist(session, { stage: "confirming", values, measurement_date: date, context_signature: context.signature, duplicate: context.duplicate, prompt_message_id: null, last_event_id: `message:${message.message_id}` });
      await confirmation(session);
    } catch (error) {
      if (!(error instanceof EntryValidationError)) throw error;
      const active = await deps.loadSession(account.userId);
      if (active && sameAccount(account, active) && ["awaiting_value", "awaiting_date"].includes(active.stage)
        && active.prompt_message_id === Number(message.reply_to_message?.message_id)) {
        const retry = await persist(active, { prompt_message_id: null, last_event_id: `message:${message.message_id}` });
        await prompt(account, retry, active.stage === "awaiting_date", error.message);
      } else await send(account.chatId, error.message);
    }
    return true;
  }

  async function handleCallback(callback) {
    const raw = String(callback.data ?? "");
    if (!raw.startsWith(`${ENTRY_PREFIX}:`)) return false;
    if (!privateActor(callback.message?.chat, callback.from)) { await acknowledge(callback, "Use your linked private Telegram chat.", true); return true; }
    const account = await deps.loadAccount(String(callback.message.chat.id));
    if (!account) { await acknowledge(callback, "This private chat is not linked to an approved account.", true); return true; }
    if (!entryEnabled(account.data)) { await acknowledge(callback, "Enable Telegram entry in the dashboard first.", true); return true; }
    await acknowledge(callback, raw.startsWith(`${ENTRY_PREFIX}:save:`) ? "Checking your save..." : "Opening entry...");
    try {
      const parts = raw.split(":");
      if (raw === `${ENTRY_PREFIX}:menu`) { await menu(account); return true; }
      if (parts.length === 3 && parts[1] === "start" && entryChoice(parts[2])) { await start(account, parts[2], `callback:${callback.id}`); return true; }
      const [, action, sessionId, rawRevision] = parts;
      if (parts.length !== 4 || !["save", "value", "date", "cancel"].includes(action) || !/^[0-9a-f-]{36}$/i.test(sessionId) || !/^\d+$/.test(rawRevision)) throw new EntryValidationError("That entry button is no longer available. Send /record to start again.");
      let session = await deps.loadSession(account.userId);
      if (!session || session.session_id !== sessionId || !sameAccount(account, session)) throw new EntryValidationError("That entry has been replaced. Use the latest buttons or send /record.");
      if (session.stage === "saved") { await save(account, session); return true; }
      if (!Number.isFinite(Date.parse(session.expires_at)) || Date.parse(session.expires_at) <= now().getTime()) throw new EntryValidationError("That entry expired. Send /record to start again.");
      if (Number(callback.message.message_id) !== session.prompt_message_id) throw new EntryValidationError("Use the buttons on the latest confirmation message.");
      if (session.stage === "saving") {
        if (action === "save") await save(account, session);
        else await send(account.chatId, "The save is already in progress. Tap Save again to check its result.");
        return true;
      }
      if (session.stage !== "confirming" || session.revision !== Number(rawRevision)) throw new EntryValidationError("Use the latest entry buttons, or send /record to start again.");
      if (action === "save") await save(account, session);
      else if (action === "cancel") await cancel(account, session);
      else {
        session = await persist(session, { stage: action === "date" ? "awaiting_date" : "awaiting_value", prompt_message_id: null, ...(action === "value" ? { values: [], context_signature: "" } : {}) });
        await prompt(account, session, action === "date");
      }
    } catch (error) {
      if (!(error instanceof EntryValidationError)) {
        const saved = await deps.loadSession(account.userId).catch(() => null);
        await send(account.chatId, raw.startsWith(`${ENTRY_PREFIX}:save:`) && saved?.stage === "saved" && saved.session_id === raw.split(":")[2]
          ? "Your reading is saved in the dashboard. No duplicate was added."
          : raw.startsWith(`${ENTRY_PREFIX}:save:`)
            ? "Could not confirm the save. Wait 30 seconds, then tap Save again to check, or open the dashboard."
            : "Could not finish opening the entry. Send /record to try again.");
        return true;
      }
      await send(account.chatId, error.message);
    }
    return true;
  }

  return { handleMessage, handleCallback };
}
