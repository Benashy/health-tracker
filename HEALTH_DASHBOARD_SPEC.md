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
- Baseline profile details: name, date of birth, calculated age, and height.
- Repeat body metrics: weight and waist circumference.
- Vitals and fitness: systolic blood pressure, diastolic blood pressure, resting heart rate, VO2 Max.
- Cardiovascular markers: ApoB and Lipoprotein(a), in addition to existing lipid metrics.
- Hormone panel: total testosterone and SHBG.
- Conditional hormone escalation metrics: LH, FSH, prolactin, oestradiol.
- One-off or infrequent investigations: ECG and coronary artery calcium score.

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

- BMI is intentionally not tracked
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

## Dates And Reference Ranges

- Result date is the date the result/report is available.
- Sample or measurement date is when the sample or home measurement was actually taken.
- For home measurements, these dates will usually be the same.
- Reference ranges are stored per person and metric after first entry.
- Saved reference ranges should be locked during ordinary entry and changed only through an explicit edit action.

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
