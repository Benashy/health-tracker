# Health Dashboard Specification

## Purpose

Create a long-term preventative health dashboard focused on trend analysis rather than isolated results. The objective is early identification of meaningful changes in cardiovascular, metabolic, hormonal, fitness, and general health.

## Primary Goals

- Detect inherited or developing cardiovascular risk.
- Monitor overall health and fitness longitudinally.
- Investigate persistent fatigue or reduced libido only when supported by objective evidence.
- Compare annual results against previous years rather than reference ranges alone.

## Added Scope

The existing blood and urine tracking remains in place. The following have been added on top:

- Two person profiles: Ben and Angelika.
- Baseline profile details: name, date of birth, calculated age, sex, and height.
- Repeat body metrics: weight and waist circumference.
- Vitals and fitness: systolic blood pressure, diastolic blood pressure, resting heart rate, VO2 Max.
- Cardiovascular markers: ApoB and Lipoprotein(a), in addition to existing lipid metrics.
- Hormone panel: total testosterone and SHBG.
- Conditional hormone escalation metrics: LH, FSH, prolactin, oestradiol.
- One-off or infrequent investigations: ECG and coronary artery calcium score.
- Per-user notes, personal targets, health events, GP/clinician notes, and uploaded report references are planned future scope.

Each person must have a completely independent profile, history, trends, targets, notes, and reference ranges. No measurement, target, note, uploaded report, or trend calculation should ever be shared or mixed between users.

## Priority Notes

Highest priority:

- Blood pressure
- Weight
- Waist circumference
- Resting heart rate
- VO2 Max
- ApoB
- Lipoprotein(a)
- Total testosterone
- SHBG

Medium priority:

- Routine blood panel
- Lipid profile
- HbA1c
- Vitamin D
- Thyroid function

Lower priority:

- BMI is intentionally not tracked for now, following the current product preference. If reintroduced later, it should be calculated only and never treated as a primary target.
- ECG history
- Other investigations only if clinically indicated

## Design Philosophy

- Trends are more important than isolated values.
- Avoid unnecessary testing.
- Escalate investigations only when first-line markers are abnormal.
- Focus on prevention rather than diagnosis.
- Present data in a clean dashboard with clear visual trends over multiple years.

## Scheduling And Colour

- Weight and waist circumference: every 14 days.
- Blood pressure and resting heart rate: monthly.
- VO2 Max: roughly quarterly.
- Lipids, glucose, and HbA1c: every 6 months.
- Most other routine blood and urine markers: every 12 months.
- ApoB: annual if clinically indicated.
- Lipoprotein(a): one-time lifetime measurement.
- ECG: roughly every 5 years or as clinically indicated.
- Coronary artery calcium score: around age 45 if useful, then infrequent.

Range colours:

- Green: in range.
- Amber: still in range but within 10% of a relevant limit.
- Red: outside the reference boundary.

Due colours:

- Amber: due soon.
- Red: due or overdue.

## Measurement Instructions

Add a measurement instructions section so repeat readings are more consistent.

Waist circumference:

- Measure first thing in the morning if possible.
- Measure after using the bathroom and before eating or drinking.
- Measure at the level of the navel.
- Stand relaxed and measure at the end of a normal exhale.
- Record in centimetres.

Weight:

- Measure first thing in the morning.
- Measure after using the bathroom and before food or drink.
- Use the same scales where practical.

Blood pressure:

- Sit quietly for 5 minutes.
- Keep feet flat on the floor and arm supported.
- Take 2-3 readings.
- Store the average.
- Record time of day where useful.

Blood tests:

- Store date, sample time, fasting status, lab name, units, reference range, and source report where available.

## Dates And Reference Ranges

- Result date is the date the result/report is available.
- Sample or measurement date is when the sample or home measurement was actually taken.
- For home measurements, these dates will usually be the same.
- Reference ranges are stored per person and metric after first entry.
- Saved reference ranges should be locked during ordinary entry and changed only through an explicit edit action.

## Source Confidence

Every metric, timeline event, document-linked entry, and health note should include source confidence metadata so lower-confidence entries are not over-interpreted.

For each applicable entry store:

- Source type.
- Source confidence.
- Source notes.
- Linked source document if available.

Source types:

- Lab Report / PDF: high confidence. Examples include ApoB, Lipoprotein(a), HbA1c, testosterone, vitamin D, kidney function, and liver function.
- Clinician Report: high confidence. Examples include ECG result, colonoscopy result, imaging report, GP summary, and specialist letter.
- Manual Measurement: medium to high confidence. Examples include weight, waist circumference, and home blood pressure. Confidence depends on consistent technique, timing, and device.
- Wearable Estimate: medium confidence. Examples include Apple Watch VO2 Max, wearable resting heart rate, and sleep data. Useful for trends but not equivalent to formal clinical testing.
- Calculated Value: inherits confidence from source data. Examples include percentage change, trend direction, average blood pressure, and BMI if ever reintroduced as calculated-only.
- User Note: subjective confidence. Examples include symptoms, lifestyle notes, tiredness, libido changes, and training notes.

Display source confidence subtly:

- Small labels such as Lab-confirmed, Manual entry, Wearable estimate, Clinician report, Calculated, or User note.
- Tooltips explaining reliability where useful.
- Avoid cluttering the main dashboard or making lower-confidence data feel alarming.

Use source confidence to avoid over-interpreting weaker data. For example:

- Apple Watch VO2 Max is useful for long-term trends but should not be treated as equivalent to a formal cardiopulmonary exercise test.
- ApoB from a lab PDF is high-confidence and suitable for year-on-year comparison.
- Waist circumference is useful, but small changes should be interpreted cautiously unless the measurement method is consistent.

The dashboard should preserve the original report or document wherever possible so entered values can be verified later.

## Trends

Each metric should have a trend view showing:

- Latest value.
- Change since previous measurement.
- Percentage change where appropriate.
- Highest recorded value.
- Lowest recorded value.
- Recent history over time.
- Lightweight line chart for numeric trends with reference range context where available.

## Import Review

ChatGPT import should not save directly. The app should first show:

- Number of measurements ready.
- Number of reference ranges ready.
- Skipped items.
- A table of the first extracted measurements.
- Explicit confirmation before saving.

## Export

The dashboard should support:

- CSV export for structured data handling.
- ChatGPT-friendly Markdown export that explains the dashboard purpose, selected scope, people, range warnings, due/overdue items, latest values, and all measurements.
- ChatGPT import via strict JSON so a lab report can be interpreted outside the app, then loaded back into the dashboard.
- Review pack export for GP/clinician/ChatGPT focusing only on warnings, due items, and meaningful changes.

## Future Dashboard Features

The longer-term dashboard should support:

- Current Health Snapshot as the first page each user sees.
- Overall health summary with a non-diagnostic status such as Excellent, Good, or Needs Review.
- Current priorities such as target weight, waist reduction, blood pressure maintenance, annual bloods, LDL/ApoB monitoring, or GP follow-up.
- Known long-term risk factors such as elevated Lipoprotein(a), family history, or known diagnoses.
- Recent reassuring results such as normal blood pressure, HbA1c, ECG, testosterone, kidney function, or liver function.
- Next scheduled review such as home measurements, annual bloods, GP review, ECG, or CAC consideration.
- Latest key metric cards for weight, waist, blood pressure, resting heart rate, VO2 Max, LDL, ApoB, HbA1c, vitamin D, and testosterone if tracked.
- Historical trend charts.
- Year-on-year comparisons.
- Automatic highlighting of significant changes.
- Document upload and storage when Supabase Storage is added.
- Manual measurement entry.
- Timeline of health events.
- GP or clinician notes.
- Personal targets such as target weight, target waist circumference, or fitness goals.
- Optional reminders and follow-ups.

These features should stay in service of prevention and longitudinal comparison. The app should avoid nudging users toward unnecessary tests, and optional investigations should remain conditional or infrequent unless clinically indicated.

## Health Timeline

Add a dedicated Health Timeline page per user. It should create a chronological record of significant health events that complement the numeric dashboard.

Timeline categories should include:

- Investigations: blood tests, ECG, echocardiogram, MRI, CT scan, CAC scan, colonoscopy, endoscopy, ultrasound, and X-ray.
- Health findings: elevated Lipoprotein(a), high cholesterol, normal ECG, normal colonoscopy, vitamin D deficiency, iron deficiency, thyroid abnormality, testosterone abnormality, hypertension, diabetes, and prediabetes.
- Medical procedures: colonoscopy, surgery, biopsy, hospital admission, and specialist consultation.
- Vaccinations: COVID, influenza, tetanus, and travel vaccinations.
- Lifestyle milestones: target weight achieved, started regular exercise, significant weight loss, stopped smoking, reduced alcohol, and fitness milestone achieved.
- Medication and supplement changes: started, stopped, changed dose, started supplementation, or discontinued supplementation.
- Aviation medical: Class 1 medical renewal, ECG, exercise ECG, restrictions added or removed, and medical follow-up completed.

For each event store:

- Date.
- User.
- Category.
- Title.
- Short summary.
- Detailed notes.
- Related documents.
- Related blood results or metrics.
- Doctor, hospital, or clinic if relevant.
- Follow-up required: yes/no.
- Follow-up due date.
- Status: Open, Closed, or Monitoring.

Display the timeline vertically with date, category icon, title, brief summary, expandable details, attached files, and related metrics.

## Documents

Allow upload and storage of original source documents so numerical entries can be checked later.

Document types should include:

- Blood test PDFs.
- ECG reports.
- Imaging reports.
- Colonoscopy reports.
- GP letters.
- Specialist letters.
- Insurance or aviation medical documents.

Each document should be attachable to:

- A timeline event.
- A blood test entry.
- A specific metric.
- A user profile.

## Reminders And Follow-Ups

Optional reminders should include:

- Annual bloods due.
- Home measurements due.
- GP review due.
- Repeat colonoscopy due.
- ECG due.
- CAC scan consideration.
- Weight or waist recheck.
- Follow-up after abnormal result.

Each reminder should store:

- User.
- Due date.
- Reason.
- Related timeline event.
- Status: pending, complete, or dismissed.

## Escalation Language

The dashboard must not diagnose. It should use calm, practical language:

- Green: continue routine tracking.
- Amber: monitor trend, consider repeat test, or consider routine GP discussion.
- Red: recommend GP or clinician review.

Trend interpretation should consider the metric direction and target context:

- Lower LDL is usually better.
- Higher vitamin D is only better up to a sensible range.
- Lower blood pressure is not always better if too low.
- Weight should be interpreted against target, not automatically treated as lower-is-better.

## Future Hosted Architecture

- GitHub should store the app code.
- Supabase should store live data.
- The first hosted version should use one private JSONB dashboard row per signed-in user.
- Authentication should use email/password first, with magic links as an optional secondary route.
- Ben and Angelika should each have their own login.
- Access should be restricted to Ben and Angelika only.
- First cloud accounts should start fresh with no local browser data migration.
- Supabase row-level security should ensure each user sees only their own metrics by default.
- Reference ranges remain unique per user and metric.
- Account, sync, refresh, version, and sign-out controls should live in a low-distraction footer.
- The hosted app should support manual cloud refresh, visible sync status, stale-write conflict protection, and offline read-only viewing.
- The save flow should use Supabase `updated_at` as a conflict token and block saving if another device has changed the cloud copy.
- The hosted version should be PWA-ready if practical, while keeping offline mode read-only.
- Every release should show a visible version number and use script/style cache-busting query strings.
- A backup function is essential and must export Supabase data independently of GitHub.
