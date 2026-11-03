import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import {
  EntryValidationError, entryEnabled, parseEntryValue, parseEntryDate, entryToday,
  entryContext, applyEntryToDashboard, latestSavedReading, reminderEntryRows,
} from "../supabase/functions/health-tracker-telegram/measurement-model.mjs";
import { createMeasurementEntryHandler } from "../supabase/functions/health-tracker-telegram/measurement-entry.mjs";

const NOW = "2026-11-02T10:00:00.000Z";
const clone = (value) => structuredClone(value);

function account(profileId = "ben", chatId = "10001") {
  const profile = { id: profileId, name: `Demo ${profileId}`, date_of_birth: "1980-01-01", height_cm: 175 };
  return {
    userId: profileId === "ben" ? "11111111-1111-4111-8111-111111111111" : "22222222-2222-4222-8222-222222222222",
    chatId, profileId, profile, linkedAt: "2026-10-01T09:00:00.000Z", updatedAt: "2026-11-01T12:00:00.000Z",
    data: {
      data_version: 2, profiles: [profile], measurements: [],
      reference_ranges: { [`${profileId}:Weight`]: { low: null, target: 75, high: null, fields: { lower: false, target: true, upper: false } } },
      schedule_state: { snoozes: { [`${profileId}:Weight`]: { due_date: "2026-11-10" }, [`${profileId}:LDL`]: { due_date: "2027-01-01" } } },
      settings: { active_profile_id: profileId, telegram: { chat_id: chatId, linked_at: "2026-10-01T09:00:00.000Z", enabled: true, measurement_entry_enabled: true } },
    },
  };
}

function harness() {
  const accounts = new Map([["10001", account()], ["10002", account("angelika", "10002")]]);
  const sessions = new Map();
  const sent = [];
  let tick = Date.parse(NOW);
  let messageId = 200;
  let sessionId = 0;
  const state = {
    accounts, sessions, sent, writes: 0, lookups: 0, beforeWrite: null, failAfterCommit: false, failMessage: false,
    now: () => new Date(tick), advance: (ms) => { tick += ms; },
  };
  state.telegram = async (method, payload) => {
    if (method === "sendMessage" && state.failMessage) { state.failMessage = false; throw new Error("Synthetic Telegram outage"); }
    sent.push({ method, payload: clone(payload) });
    return { ok: true, result: { message_id: ++messageId } };
  };
  state.loadAccount = async (chatId) => { state.lookups++; return clone(accounts.get(chatId) ?? null); };
  state.saveDashboard = async (loaded, data) => {
    if (state.beforeWrite) await state.beforeWrite(loaded, data);
    const current = accounts.get(loaded.chatId);
    if (current.updatedAt !== loaded.updatedAt) return false;
    current.data = clone(data);
    current.updatedAt = new Date(Date.parse(current.updatedAt) + 1).toISOString();
    state.writes++;
    if (state.failAfterCommit) { state.failAfterCommit = false; throw new Error("Synthetic response lost after commit"); }
    return true;
  };
  state.handler = createMeasurementEntryHandler({
    now: state.now,
    randomId: () => `00000000-0000-4000-8000-${String(++sessionId).padStart(12, "0")}`,
    telegram: state.telegram, loadAccount: state.loadAccount, saveDashboard: state.saveDashboard,
    loadSession: async (userId) => clone(sessions.get(userId) ?? null),
    saveSession: async (next, previous) => {
      const current = sessions.get(next.user_id);
      if (previous ? !current || current.session_id !== previous.session_id || current.revision !== previous.revision : current) return false;
      sessions.set(next.user_id, clone(next));
      return true;
    },
  });
  state.session = (chatId = "10001") => sessions.get(accounts.get(chatId).userId);
  state.callback = (data, chatId = "10001", override = {}) => ({
    id: `callback-${++messageId}`, data, from: { id: Number(chatId), is_bot: false },
    message: { message_id: state.session(chatId)?.prompt_message_id ?? 99, chat: { id: Number(chatId), type: "private" } }, ...override,
  });
  state.message = (text, chatId = "10001", override = {}) => ({
    message_id: ++messageId, text, from: { id: Number(chatId), is_bot: false },
    chat: { id: Number(chatId), type: "private" },
    reply_to_message: { message_id: state.session(chatId)?.prompt_message_id }, ...override,
  });
  state.button = (action, chatId = "10001") => {
    const session = state.session(chatId);
    return state.callback(`htm:${action}:${session.session_id}:${session.revision}`, chatId);
  };
  state.start = async (key = "weight", chatId = "10001") => state.handler.handleCallback(state.callback(`htm:start:${key}`, chatId));
  state.prepare = async (key = "weight", value = "82.5", chatId = "10001") => {
    await state.start(key, chatId);
    await state.handler.handleMessage(state.message(value, chatId));
  };
  return state;
}

test("decimal readings accept explicit correct units and decimal commas", () => {
  assert.deepEqual(parseEntryValue("weight", "82,50 kg"), [82.5]);
  assert.deepEqual(parseEntryValue("waist", "92.1cm"), [92.1]);
  assert.deepEqual(parseEntryValue("bp", "120 / 80 mmHg"), [120, 80]);
});

test("wrong units, malformed numbers and invalid pressure pairs are rejected", () => {
  for (const [key, value] of [["weight", "180 lb"], ["weight", "82 kg 9"], ["weight", "1e2"], ["weight", "NaN"], ["weight", "-2"], ["weight", "401"], ["waist", "92kg"], ["bp", "80/120"], ["bp", "120/120"], ["bp", "120.5/80"], ["bp", "120/0"], ["bp", "120/80 extra"]]) {
    assert.throws(() => parseEntryValue(key, value), EntryValidationError, `${key}: ${value}`);
  }
});

test("dates follow Lisbon, validate the calendar and reject future readings", () => {
  assert.equal(entryToday(new Date("2026-07-15T23:30:00Z")), "2026-07-16");
  assert.equal(entryToday(new Date("2026-11-02T23:30:00Z")), "2026-11-02");
  assert.equal(parseEntryDate("29/02/2024", new Date(NOW)), "2024-02-29");
  assert.equal(parseEntryDate("1.11.2026", new Date(NOW)), "2026-11-01");
  for (const value of ["29/02/2025", "31/11/2026", "2026-02-30", "2026-11-03", "02/11/26"]) assert.throws(() => parseEntryDate(value, new Date(NOW)), EntryValidationError);
});

test("entry is opt-in, including for existing linked users and restored string values", () => {
  assert.equal(entryEnabled({ settings: { telegram: { chat_id: "10001" } } }), false);
  assert.equal(entryEnabled({ settings: { telegram: { measurement_entry_enabled: "true" } } }), false);
  assert.equal(entryEnabled(account().data), true);
});

test("reminders offer entry only for due and tracked weight and waist", () => {
  const user = account();
  const due = ["Weight", "Waist circumference", "Blood pressure systolic", "Blood pressure diastolic", "VO2 max"].map((name) => ({ metric: { name } }));
  const weight = [{ text: "Enter weight", callback_data: "htm:start:weight" }];
  const waist = [{ text: "Enter waist circumference", callback_data: "htm:start:waist" }];
  assert.deepEqual(reminderEntryRows(user.data, due), [weight, waist]);
  assert.deepEqual(reminderEntryRows(user.data, due.slice(1)), [waist]);
  assert.deepEqual(reminderEntryRows(user.data, due.slice(2)), []);
  user.data.settings.metric_tracking_by_profile = { ben: { "Waist circumference": "not_tracked" } };
  assert.deepEqual(reminderEntryRows(user.data, due), [weight]);
  user.data.settings.telegram.measurement_entry_enabled = false;
  assert.deepEqual(reminderEntryRows(user.data, due), []);
});

test("the latest saved reading matches the profile, metric, unit and measurement date", () => {
  const user = account();
  const weight = { profile_id: "ben", metric: "Weight", unit: "kg" };
  user.data.measurements = [
    { ...weight, result_value: 82, sample_date: "2026-11-01" },
    { ...weight, result_value: 81, sample_date: "2026-10-01" },
    { ...weight, result_value: "82.4", test_date: "2026-11-01" },
    { ...weight, result_value: 200, unit: "lb", sample_date: "2026-11-02" },
    { ...weight, result_value: 70, profile_id: "angelika", sample_date: "2026-11-02" },
    { ...weight, result_value: 85, sample_date: "2026-11-03" },
    { ...weight, result_value: 84, sample_date: "2026-02-30" },
    { ...weight, result_value: "invalid", sample_date: "2026-11-02" },
    { ...weight, result_value: null, sample_date: "2026-11-02" },
  ];
  assert.deepEqual(latestSavedReading(user, "weight", new Date(NOW)), { value: 82.4, unit: "kg", date: "2026-11-01" });
  assert.equal(latestSavedReading(user, "waist", new Date(NOW)), null);
  assert.equal(latestSavedReading(user, "bp", new Date(NOW)), null);
});

test("private value prompts show the account's last saved reading without writing a measurement", async () => {
  const h = harness();
  h.accounts.get("10001").data.measurements = [
    { profile_id: "ben", metric: "Weight", result_value: 82.4, unit: "kg", sample_date: "2026-11-01" },
    { profile_id: "ben", metric: "Waist circumference", result_value: 91.2, unit: "cm", sample_date: "2026-11-01" },
  ];
  h.accounts.get("10002").data.measurements = [
    { profile_id: "angelika", metric: "Waist circumference", result_value: 79.4, unit: "cm", sample_date: "2026-10-31" },
  ];
  await h.start("weight");
  let prompt = h.sent.at(-1).payload;
  assert.match(prompt.text, /Last saved: 82\.4 kg on 1 Nov 2026\./);
  assert.doesNotMatch(prompt.text, /91\.2|79\.4/);
  assert.equal(prompt.chat_id, "10001");
  assert.equal(prompt.protect_content, true);
  assert.equal(prompt.reply_markup.force_reply, true);

  await h.start("waist", "10002");
  prompt = h.sent.at(-1).payload;
  assert.match(prompt.text, /Last saved: 79\.4 cm on 31 Oct 2026\./);
  assert.doesNotMatch(prompt.text, /82\.4|91\.2/);
  assert.equal(prompt.chat_id, "10002");
  assert.equal(prompt.protect_content, true);

  await h.handler.handleMessage(h.message("not a number"));
  assert.match(h.sent.at(-1).payload.text, /Last saved: 82\.4 kg on 1 Nov 2026\./);
  await h.handler.handleMessage(h.message("83"));
  await h.handler.handleCallback(h.button("date"));
  assert.doesNotMatch(h.sent.at(-1).payload.text, /Last saved:/);
  assert.equal(h.writes, 0);
});

test("weight is a draft until confirmed and produces an honest saved receipt", async () => {
  const h = harness();
  await h.prepare();
  assert.equal(h.writes, 0);
  assert.equal(h.session().stage, "confirming");
  await h.handler.handleCallback(h.button("save"));
  assert.equal(h.writes, 1);
  const row = h.accounts.get("10001").data.measurements[0];
  assert.equal(row.metric, "Weight");
  assert.equal(row.result_value, 82.5);
  assert.equal(row.target_value, 75);
  assert.equal(row.status_vs_range, "Above target");
  assert.equal(row.sample_date, "2026-11-02");
  assert.equal(row.source_type, "Manual Measurement");
  assert.equal(h.session().stage, "saved");
  assert.deepEqual(h.session().values, []);
  assert(h.sent.some((item) => item.payload.text?.startsWith("Saved to your dashboard.")));
  assert.equal(h.accounts.get("10001").data.schedule_state.snoozes["ben:Weight"], undefined);
  assert(h.accounts.get("10001").data.schedule_state.snoozes["ben:LDL"]);
});

test("blood pressure saves two records in one dashboard write", async () => {
  const h = harness();
  await h.prepare("bp", "118/76");
  await h.handler.handleCallback(h.button("save"));
  assert.equal(h.writes, 1);
  const rows = h.accounts.get("10001").data.measurements;
  assert.equal(rows.length, 2);
  assert.equal(rows[0].metric, "Blood pressure systolic");
  assert.equal(rows[1].metric, "Blood pressure diastolic");
  assert.deepEqual(rows.map((row) => row.result_value), [118, 76]);
  assert(rows.every((row) => row.sample_date === "2026-11-02" && row.unit === "mmHg"));
});

test("a repeated Save or simultaneous taps cannot insert a duplicate", async () => {
  const h = harness();
  await h.prepare();
  const button = h.button("save");
  await Promise.all([h.handler.handleCallback(button), h.handler.handleCallback({ ...button, id: "second-tap" })]);
  await h.handler.handleCallback(button);
  assert.equal(h.writes, 1);
  assert.equal(h.accounts.get("10001").data.measurements.length, 1);
});

test("a lost write response can be recovered without inserting the reading again", async () => {
  const h = harness();
  await h.prepare();
  const button = h.button("save");
  h.failAfterCommit = true;
  await h.handler.handleCallback(button);
  assert.equal(h.writes, 1);
  assert(!h.sent.some((item) => item.payload.text?.startsWith("Saved to your dashboard.")));
  h.advance(31000);
  await h.handler.handleCallback(button);
  assert.equal(h.writes, 1);
  assert.equal(h.session().stage, "saved");
  assert(h.sent.some((item) => item.payload.text?.includes("No duplicate was added")));
});

test("a lost Telegram receipt does not hide the successful dashboard write", async () => {
  const h = harness();
  await h.prepare();
  const button = h.button("save");
  h.failMessage = true;
  await h.handler.handleCallback(button);
  assert.equal(h.writes, 1);
  assert.equal(h.session().stage, "saved");
  assert(h.sent.some((item) => item.payload.text?.startsWith("Your reading is saved in the dashboard.")));
  await h.handler.handleCallback(button);
  assert.equal(h.writes, 1);
});

test("persistent concurrent edits require another confirmation instead of claiming a save", async () => {
  const h = harness();
  await h.prepare();
  const oldButton = h.button("save");
  h.beforeWrite = async () => {
    const current = h.accounts.get("10001");
    current.updatedAt = new Date(Date.parse(current.updatedAt) + 1).toISOString();
  };
  await h.handler.handleCallback(oldButton);
  assert.equal(h.writes, 0);
  assert.equal(h.session().stage, "confirming");
  assert(h.sent.some((item) => item.payload.text?.startsWith("The dashboard changed while saving.")));
  await h.handler.handleCallback(oldButton);
  assert.equal(h.writes, 0);
  h.beforeWrite = null;
  await h.handler.handleCallback(h.button("save"));
  assert.equal(h.writes, 1);
});

test("an unrelated concurrent app edit is merged rather than overwritten", async () => {
  const h = harness();
  await h.prepare();
  h.beforeWrite = async () => {
    h.beforeWrite = null;
    const current = h.accounts.get("10001");
    current.data.settings.unrelated_preference = "keep this";
    current.updatedAt = "2026-11-02T09:00:00.000Z";
  };
  await h.handler.handleCallback(h.button("save"));
  assert.equal(h.writes, 1);
  assert.equal(h.accounts.get("10001").data.settings.unrelated_preference, "keep this");
});

test("a target edit between preview and Save requires a fresh confirmation", async () => {
  const h = harness();
  await h.prepare();
  const oldButton = h.button("save");
  h.accounts.get("10001").data.reference_ranges["ben:Weight"].target = 78;
  await h.handler.handleCallback(oldButton);
  assert.equal(h.writes, 0);
  assert.equal(h.session().stage, "confirming");
  await h.handler.handleCallback(oldButton);
  assert.equal(h.writes, 0);
  await h.handler.handleCallback(h.button("save"));
  assert.equal(h.accounts.get("10001").data.measurements[0].target_value, 78);
});

test("same-day readings are flagged before explicitly saving another", async () => {
  const h = harness();
  h.accounts.get("10001").data.measurements.push({ id: "existing", profile_id: "ben", metric: "Weight", unit: "kg", result_value: 81, sample_date: "2026-11-02", test_date: "2026-11-02", target_value: 75 });
  await h.prepare();
  assert.equal(h.session().duplicate, true);
  assert(h.sent.some((item) => item.payload.text?.includes("already exists for this date")));
  await h.handler.handleCallback(h.button("save"));
  assert.equal(h.accounts.get("10001").data.measurements.length, 2);
});

test("a reading arriving from the app after preview triggers duplicate review", async () => {
  const h = harness();
  await h.prepare();
  h.accounts.get("10001").data.measurements.push({ id: "app-reading", profile_id: "ben", metric: "Weight", unit: "kg", result_value: 81, sample_date: "2026-11-02", test_date: "2026-11-02" });
  await h.handler.handleCallback(h.button("save"));
  assert.equal(h.writes, 0);
  assert.equal(h.session().duplicate, true);
});

test("value and date can be corrected before saving", async () => {
  const h = harness();
  await h.prepare();
  await h.handler.handleCallback(h.button("value"));
  await h.handler.handleMessage(h.message("80.5"));
  await h.handler.handleCallback(h.button("date"));
  await h.handler.handleMessage(h.message("01/11/2026"));
  await h.handler.handleCallback(h.button("save"));
  const row = h.accounts.get("10001").data.measurements[0];
  assert.equal(row.result_value, 80.5);
  assert.equal(row.sample_date, "2026-11-01");
});

test("an invalid reply opens a fresh reply prompt and can be corrected immediately", async () => {
  const h = harness();
  await h.start();
  const firstPrompt = h.session().prompt_message_id;
  await h.handler.handleMessage(h.message("180 lb"));
  assert.notEqual(h.session().prompt_message_id, firstPrompt);
  assert.equal(h.sent.at(-1).payload.reply_markup.force_reply, true);
  assert.equal(h.sent.at(-1).payload.reply_markup.selective, undefined);
  await h.handler.handleMessage(h.message("82.5"));
  await h.handler.handleCallback(h.button("save"));
  assert.equal(h.writes, 1);
});

test("Telegram retries restore a confirmation lost before delivery", async () => {
  const h = harness();
  await h.start();
  const reply = h.message("82.5");
  h.failMessage = true;
  await assert.rejects(h.handler.handleMessage(reply));
  assert.equal(h.session().stage, "confirming");
  assert.equal(h.session().prompt_message_id, null);
  await h.handler.handleMessage(reply);
  assert(h.session().prompt_message_id);
  await h.handler.handleCallback(h.button("save"));
  assert.equal(h.writes, 1);
});

test("cancelled and expired drafts never write dashboard measurements", async () => {
  const h = harness();
  await h.prepare();
  const button = h.button("save");
  await h.handler.handleCallback(h.button("cancel"));
  await h.handler.handleCallback(button);
  assert.equal(h.writes, 0);
  assert.deepEqual(h.session().values, []);
  await h.prepare();
  const expiredButton = h.button("save");
  h.advance(16 * 60 * 1000);
  await h.handler.handleCallback(expiredButton);
  assert.equal(h.writes, 0);
});

test("old prompts, repeated replies and stale confirmation buttons do not save", async () => {
  const h = harness();
  await h.start();
  const reply = h.message("82.5");
  await h.start("waist");
  await h.handler.handleMessage(reply);
  assert.equal(h.session().stage, "awaiting_value");
  const valid = h.message("92");
  await h.handler.handleMessage(valid);
  const count = h.sent.length;
  await h.handler.handleMessage(valid);
  assert.equal(h.sent.length, count);
  assert.equal(h.writes, 0);
});

test("unknown chats, groups, mismatched senders and forwarded input are refused", async () => {
  const h = harness();
  await h.handler.handleCallback(h.callback("htm:start:weight", "10001", { from: { id: 10002 } }));
  await h.handler.handleCallback(h.callback("htm:start:weight", "10001", { message: { chat: { id: 10001, type: "group" } } }));
  await h.handler.handleMessage(h.message("/weight", "10001", { forward_origin: { type: "user" } }));
  assert.equal(h.lookups, 0);
  const unknown = { ...h.message("/weight"), chat: { id: 90000, type: "private" }, from: { id: 90000 } };
  assert.equal(await h.handler.handleMessage(unknown), false);
  assert.equal(h.writes, 0);
});

test("each linked private chat can record only its own profile", async () => {
  const h = harness();
  await h.prepare("weight", "62.3", "10002");
  const otherButton = h.button("save", "10002");
  const stolen = { ...otherButton, from: { id: 10001 }, message: { ...otherButton.message, chat: { id: 10001, type: "private" } } };
  await h.handler.handleCallback(stolen);
  assert.equal(h.writes, 0);
  await h.handler.handleCallback(otherButton);
  assert.equal(h.accounts.get("10001").data.measurements.length, 0);
  assert.equal(h.accounts.get("10002").data.measurements[0].profile_id, "angelika");
});

test("unlinking, disabling entry or stopping tracking blocks an outstanding Save", async () => {
  for (const change of [
    (user) => { user.data.settings.telegram.measurement_entry_enabled = false; },
    (user) => { user.linkedAt = "2026-11-02T10:00:01.000Z"; },
    (user) => { user.data.settings.metric_tracking_by_profile = { ben: { Weight: "not_tracked" } }; },
  ]) {
    const h = harness(); await h.prepare(); const button = h.button("save");
    change(h.accounts.get("10001"));
    await h.handler.handleCallback(button);
    assert.equal(h.writes, 0);
  }
});

test("unsupported data versions and different stored units require dashboard review", () => {
  const user = account();
  user.data.data_version = 99;
  assert.throws(() => entryContext(user, "weight", "2026-11-02"), EntryValidationError);
  user.data.data_version = 2;
  user.data.measurements.push({ id: "old", profile_id: "ben", metric: "Weight", result_value: 180, unit: "lb", sample_date: "2026-10-01" });
  assert.throws(() => entryContext(user, "weight", "2026-11-02"), EntryValidationError);
});

test("backdated readings update derived changes without changing historical targets", () => {
  const user = account();
  user.data.measurements = [
    { id: "older", profile_id: "ben", metric: "Weight", unit: "kg", result_value: 85, sample_date: "2026-10-01", test_date: "2026-10-01", target_value: 84 },
    { id: "newer", profile_id: "ben", metric: "Weight", unit: "kg", result_value: 80, sample_date: "2026-10-31", test_date: "2026-10-31", target_value: 79 },
  ];
  const context = entryContext(user, "weight", "2026-10-15");
  const result = applyEntryToDashboard(user, { session_id: "example-session", entry_key: "weight", values: [82], measurement_date: "2026-10-15", context_signature: context.signature }, new Date(NOW));
  assert.equal(result.data.measurements.find((row) => row.id === "newer").previous_result, 82);
  assert.equal(result.data.measurements.find((row) => row.id === "newer").target_value, 79);
  assert.equal(result.data.measurements.find((row) => row.id === "older").target_value, 84);
  assert.equal(user.data.measurements.length, 2);
});

test("numeric statuses and trends match the existing dashboard calculations", () => {
  const filename = path.resolve("work/function-test.js");
  const legacy = new Module(filename);
  legacy.filename = filename;
  legacy.paths = Module._nodeModulePaths(path.dirname(filename));
  legacy._compile(fs.readFileSync(filename, "utf8") + "\nmodule.exports = { context };", filename);
  const frontend = legacy.exports.context;
  const fields = ["previous_result", "absolute_change_since_previous_test", "percentage_change_since_previous_test", "trend_direction", "status_vs_range", "reference_lower_limit", "target_value", "reference_upper_limit", "reference_fields"];
  const rangeVariants = [
    null,
    { low: null, target: null, high: null, fields: { lower: false, target: false, upper: false } },
    { low: 70, target: null, high: 85, fields: { lower: true, target: false, upper: true } },
    { low: null, target: 80, high: null, fields: { lower: false, target: true, upper: false } },
    { low: 70, target: 80, high: 85, fields: { lower: true, target: true, upper: true } },
  ];
  for (const reference of rangeVariants) for (const [key, previousValues, values] of [["weight", [83], [82.8]], ["weight", [83], [74.2]], ["waist", [95], [93]], ["bp", [112, 74], [115, 76]], ["bp", [110, 70], [145, 92]]]) {
    const user = account();
    const names = key === "weight" ? ["Weight"] : key === "waist" ? ["Waist circumference"] : ["Blood pressure systolic", "Blood pressure diastolic"];
    if (reference) for (const name of names) user.data.reference_ranges[`ben:${name}`] = reference;
    user.data.measurements = names.map((metric, index) => ({ id: `previous-${index}`, profile_id: "ben", metric, result_value: previousValues[index], unit: key === "weight" ? "kg" : key === "waist" ? "cm" : "mmHg", sample_date: "2026-10-01", test_date: "2026-10-01", metric_type: "numeric", reference_lower_limit: null, target_value: key === "weight" ? 75 : null, reference_upper_limit: key === "bp" ? index === 0 ? 120 : 80 : null }));
    const context = entryContext(user, key, "2026-11-02");
    const result = applyEntryToDashboard(user, { session_id: "parity-session", entry_key: key, values, measurement_date: "2026-11-02", context_signature: context.signature }, new Date(NOW));
    const fromApp = frontend.recalculateDerivedFields(result.data.measurements, user.data.profiles);
    for (const row of result.data.measurements) {
      const expected = fromApp.find((item) => item.id === row.id);
      for (const field of fields) assert.deepEqual(JSON.parse(JSON.stringify(row[field])), JSON.parse(JSON.stringify(expected[field])), `${key}: ${field}`);
    }
  }
});

let edgeImport = 0;
async function edgeHarness(run) {
  const h = harness();
  const rawSessions = new Map();
  const requests = [];
  const originalFetch = globalThis.fetch;
  const originalDeno = globalThis.Deno;
  let handler;
  let outgoingId = 600;
  h.adminRejected = false;
  h.request = async (body, secret = "webhook-test", headers = {}) => handler(new Request("https://entry-function.invalid", {
    method: "POST", headers: { "Content-Type": "application/json", "x-telegram-bot-api-secret-token": secret, ...headers }, body: JSON.stringify(body),
  }));
  const json = (body, status = 200) => Response.json(body, { status });
  globalThis.Deno = {
    env: { get: (key) => ({ SUPABASE_URL: "https://entry-database.invalid", SUPABASE_SERVICE_ROLE_KEY: "TEST_ONLY_NON_SECRET", HEALTH_TRACKER_TELEGRAM_BOT_TOKEN: "TEST_ONLY_BOT" })[key] },
    serve: (callback) => { handler = callback; },
  };
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(input);
    const method = init.method ?? "GET";
    const body = init.body ? JSON.parse(init.body) : null;
    requests.push({ host: url.host, path: url.pathname, method });
    if (url.host === "api.telegram.org") {
      const apiMethod = url.pathname.split("/").at(-1);
      h.sent.push({ method: apiMethod, payload: clone(body) });
      return json({ ok: true, result: { message_id: ++outgoingId } });
    }
    assert.equal(url.host, "entry-database.invalid", "Tests must never reach a real service");
    assert.equal(init.headers.apikey, "TEST_ONLY_NON_SECRET");
    if (url.pathname.endsWith("/rpc/health_tracker_telegram_webhook_secret_matches")) return json(body.provided_secret === "webhook-test");
    if (url.pathname.endsWith("/rpc/health_tracker_cron_secret_matches")) return json(body.provided_secret === "cron-test");
    if (url.pathname.startsWith("/auth/v1/admin/users/")) {
      const user = [...h.accounts.values()].find((item) => item.userId === url.pathname.split("/").at(-1));
      if (!user || h.adminRejected) return json({ error: "Not found" }, 404);
      return json({ id: user.userId, email: user.profileId === "ben" ? "ben_ashurst@me.com" : "angelika_kleczka@hotmail.com", email_confirmed_at: "2026-01-01T00:00:00Z" });
    }
    if (url.pathname === "/rest/v1/health_dashboard_data") {
      if (method === "GET") {
        const chatId = url.searchParams.get("data->settings->telegram->>chat_id")?.slice(3);
        const rows = [...h.accounts.values()].filter((user) => !chatId || user.data.settings.telegram.chat_id === chatId);
        return json(rows.map((user) => ({ user_id: user.userId, data: clone(user.data), updated_at: user.updatedAt })));
      }
      assert.equal(method, "PATCH");
      const user = [...h.accounts.values()].find((item) => `eq.${item.userId}` === url.searchParams.get("user_id"));
      if (!user || `eq.${user.updatedAt}` !== url.searchParams.get("updated_at")) return json([]);
      user.data = clone(body.data); user.updatedAt = body.updated_at; h.writes++;
      return json([{ updated_at: user.updatedAt }]);
    }
    if (url.pathname === "/rest/v1/health_dashboard_telegram_reminder_state") {
      if (method === "GET") return json([]);
      assert.equal(method, "POST");
      return new Response(null, { status: 204 });
    }
    if (url.pathname === "/rest/v1/health_dashboard_telegram_entry_sessions") {
      if (method === "GET") return json([...rawSessions.values()].filter((row) => `eq.${row.user_id}` === url.searchParams.get("user_id")));
      if (method === "POST") {
        if (rawSessions.has(body.user_id)) return json({}, 409);
        rawSessions.set(body.user_id, clone(body)); return json([clone(body)]);
      }
      assert.equal(method, "PATCH");
      const current = rawSessions.get(body.user_id);
      if (!current || `eq.${current.user_id}` !== url.searchParams.get("user_id") || `eq.${current.session_id}` !== url.searchParams.get("session_id") || `eq.${current.revision}` !== url.searchParams.get("revision")) return json([]);
      rawSessions.set(body.user_id, clone(body)); return json([clone(body)]);
    }
    throw new Error(`Unexpected mocked request: ${method} ${url.pathname}`);
  };
  h.lastButton = (text = "Save reading") => {
    const item = [...h.sent].reverse().find((message) => message.payload.reply_markup?.inline_keyboard?.flat().some((button) => button.text === text));
    assert(item, `Missing ${text} button`);
    const row = rawSessions.get(h.accounts.get("10001").userId);
    return {
      id: `edge-${outgoingId}`, data: item.payload.reply_markup.inline_keyboard.flat().find((button) => button.text === text).callback_data,
      from: { id: 10001 }, message: { message_id: row.state.prompt_message_id, chat: { id: 10001, type: "private" } },
    };
  };
  h.reply = (text) => ({ message_id: ++outgoingId, text, from: { id: 10001 }, chat: { id: 10001, type: "private" }, reply_to_message: { message_id: rawSessions.get(h.accounts.get("10001").userId).state.prompt_message_id } });
  try {
    await import(new URL(`../supabase/functions/health-tracker-telegram/index.ts?entry-test=${++edgeImport}`, import.meta.url));
    await run(h, requests, rawSessions);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalDeno === undefined) delete globalThis.Deno;
    else globalThis.Deno = originalDeno;
  }
}

test("scheduled reminders keep Snooze and only offer weight and waist entry", async () => edgeHarness(async (h) => {
  h.accounts.get("10001").data.schedule_state.snoozes = {};
  h.accounts.get("10001").data.measurements = [
    { profile_id: "ben", metric: "Weight", result_value: 82.37, unit: "kg", sample_date: "2020-01-01" },
    { profile_id: "ben", metric: "Waist circumference", result_value: 91.64, unit: "cm", sample_date: "2020-01-01" },
  ];
  h.accounts.get("10002").data.settings.telegram.enabled = false;
  const response = await h.request({ action: "send_scheduled_reminders", force: true }, "webhook-test", { "x-health-tracker-cron-secret": "cron-test" });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).sent, 1);
  assert.equal(h.sent.length, 1);
  const { payload } = h.sent[0];
  assert.match(payload.text, /Blood pressure systolic/);
  assert.match(payload.text, /VO2 max/i);
  assert.doesNotMatch(payload.text, /Last saved:|82\.37|91\.64/);
  const labels = payload.reply_markup.inline_keyboard.flat().map((button) => button.text);
  assert.deepEqual(labels.filter((label) => label.startsWith("Enter ")), ["Enter weight", "Enter waist circumference"]);
  assert.deepEqual(labels.filter((label) => label.startsWith("Snooze all ")), ["Snooze all 1d", "Snooze all 3d", "Snooze all 7d"]);
  assert.equal(h.writes, 0);
}));

test("the real Edge Function wires webhook, session storage and atomic dashboard recording", async () => edgeHarness(async (h) => {
  const start = { id: "start-edge", data: "htm:start:bp", from: { id: 10001 }, message: { message_id: 20, chat: { id: 10001, type: "private" } } };
  assert.equal((await h.request({ update_id: 1, callback_query: start })).status, 200);
  assert.equal((await h.request({ update_id: 2, message: h.reply("120/80") })).status, 200);
  const button = h.lastButton();
  assert(Buffer.byteLength(button.data) <= 64);
  assert.equal((await h.request({ update_id: 3, callback_query: button })).status, 200);
  assert.equal(h.writes, 1);
  assert.equal(h.accounts.get("10001").data.measurements.length, 2);
  assert.equal(h.accounts.get("10002").data.measurements.length, 0);
  await h.request({ update_id: 4, callback_query: { ...button, id: "repeat-save" } });
  assert.equal(h.writes, 1);
}));

test("the Edge Function rejects invalid webhooks and deleted or unapproved linked accounts", async () => edgeHarness(async (h, requests) => {
  const message = { message_id: 1, text: "/record", from: { id: 10001 }, chat: { id: 10001, type: "private" } };
  assert.equal((await h.request({ update_id: 1, message }, "wrong-secret")).status, 403);
  assert(!requests.some((request) => request.path === "/rest/v1/health_dashboard_data"));
  h.adminRejected = true;
  assert.equal((await h.request({ update_id: 2, message })).status, 200);
  assert.equal(h.sent.length, 0);
  assert.equal(h.writes, 0);
}));

test("ambiguous links to two accounts refuse entry instead of choosing a person", async () => edgeHarness(async (h, requests) => {
  h.accounts.get("10002").data.settings.telegram.chat_id = "10001";
  const message = { message_id: 1, text: "/record", from: { id: 10001 }, chat: { id: 10001, type: "private" } };
  await h.request({ update_id: 1, message });
  assert.equal(h.sent.length, 0);
  assert.equal(h.writes, 0);
  assert(!requests.some((request) => request.path.startsWith("/auth/v1/admin/users/")));
}));
