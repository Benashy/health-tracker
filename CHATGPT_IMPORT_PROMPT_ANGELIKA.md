# ChatGPT Prompt For Angelika Health Dashboard Import

Paste this into Angelika's ChatGPT chat before asking it to extract her historic health data, blood results, urine results, body measurements, wearable readings, health checks, notes, or PDFs.

---

I am preparing data for **Angelika's Preventative Health Dashboard**.

Please review the information already contained in this ChatGPT conversation and any uploaded files I provide, then extract only data that can be imported into Angelika's private Health Dashboard.

The dashboard is for long-term preventative health trend tracking. It is not a diagnostic system. Your task is structured data extraction only.

## Person

Extract data only for Angelika.

Use:

- `profile_id`: `angelika`
- Person name: `Angelika`

If the source says `Angelica`, treat that as Angelika, but the JSON must still use `profile_id: "angelika"`.

Do not include Ben's data or any data for another person.

## What To Extract

Extract dated measurements only where the source provides enough information.

For each result, capture:

- `profile_id`
- `date`
- `metric`
- `result_value`
- `unit`
- `reference_lower_limit`, if present
- `target_value`, if present
- `reference_upper_limit`, if present
- `reference_fields`
- `source_type`
- `source_confidence`
- `source_notes`
- `linked_source_document`, if known
- `notes`, if useful

The dashboard calculates previous result, absolute change, percentage change, range status, due status, and trend direction itself. Do not try to calculate those.

## Date Rules

Use one `date` field in `YYYY-MM-DD` format.

If multiple dates exist, use the sample, collection, or measurement date if available.

If only the report/result date is available, use that.

If the date cannot be determined, skip the measurement and include it in `unsupported_items`.

## Numeric, Qualitative, And Completion Values

Use numbers for numeric results.

Examples:

- Good: `"result_value": 5.4`
- Good: `"result_value": 82`
- Avoid: `"result_value": "5.4"`

Use text for qualitative urine results and completion-style checks.

Examples:

- `"Negative"`
- `"Trace"`
- `"Rare"`
- `"Positive"`
- `"Normal"`
- `"Abnormal"`
- `"Completed"`

For `Eye test` and `Dermatology checkup`, use:

- `result_value`: `"Completed"`
- `unit`: `""`
- no reference limits
- no target
- `reference_fields`: `{ "lower": false, "target": false, "upper": false }`

If a next due date is known for a completion-style check, include `next_due_date`.

If no next due date is known:

- Eye test defaults to two years after the completed date.
- Dermatology checkup defaults to one year after the completed date.

## Reference And Target Rules

For each measurement, set the reference/target fields carefully.

Use:

```json
"reference_fields": {
  "lower": false,
  "target": false,
  "upper": true
}
```

Rules:

- If a test has only an upper limit, set `reference_lower_limit` to `null`, `reference_upper_limit` to the upper limit, and `reference_fields.upper` to `true`.
- If a test has only a lower limit, set `reference_lower_limit` to the lower limit, `reference_upper_limit` to `null`, and `reference_fields.lower` to `true`.
- If a test has both a lower and upper limit, set both values and set `reference_fields.lower` and `reference_fields.upper` to `true`.
- If a measurement has a personal target, use `target_value` and set `reference_fields.target` to `true`.
- If no reference range or target is known, set all reference/target values to `null` and all `reference_fields` values to `false`.

For weight and waist circumference, prefer a personal target if one is explicitly known. Do not invent a target.

Example for weight with a target only:

```json
{
  "profile_id": "angelika",
  "date": "2026-07-09",
  "metric": "Weight",
  "result_value": 68.4,
  "unit": "kg",
  "reference_lower_limit": null,
  "target_value": 65,
  "reference_upper_limit": null,
  "reference_fields": {
    "lower": false,
    "target": true,
    "upper": false
  },
  "source_type": "Manual Measurement",
  "source_confidence": "Medium to High",
  "source_notes": "Historical ChatGPT record",
  "linked_source_document": "Historical ChatGPT notes",
  "notes": ""
}
```

Example for LDL with an upper reference limit:

```json
{
  "profile_id": "angelika",
  "date": "2026-07-09",
  "metric": "LDL",
  "result_value": 106,
  "unit": "mg/dL",
  "reference_lower_limit": null,
  "target_value": null,
  "reference_upper_limit": 115,
  "reference_fields": {
    "lower": false,
    "target": false,
    "upper": true
  },
  "source_type": "Lab Report / PDF",
  "source_confidence": "High",
  "source_notes": "Extracted from lab report",
  "linked_source_document": "Optional report filename",
  "notes": ""
}
```

## Source Fields

Use these defaults unless the source clearly indicates otherwise:

- Lab blood or urine report: `source_type` = `Lab Report / PDF`, `source_confidence` = `High`
- Clinician-interpreted report such as ECG, imaging, GP letter: `source_type` = `Clinician Report`, `source_confidence` = `High`
- Home measurement such as weight, waist, or blood pressure: `source_type` = `Manual Measurement`, `source_confidence` = `Medium to High`
- Wearable estimate such as Apple Watch VO2 Max or resting heart rate: `source_type` = `Wearable Estimate`, `source_confidence` = `Medium`
- User note or symptom note: do not include as a measurement unless it maps to an allowed metric; otherwise add it to `unsupported_items`.

Use `source_notes` for brief context, for example:

- `Historical ChatGPT record`
- `Extracted from PDF`
- `Manual home measurement`
- `Apple Watch estimate`
- `Clinician report`

Use `linked_source_document` for the filename or source name if known.

## Scope Rules

Include only data relevant to the allowed Health Dashboard metrics below.

Exclude:

- STI tests
- Immunoserology tests
- Infectious disease screening unless explicitly relevant to the allowed dashboard metrics
- Vaccination or immunity status
- Pregnancy tests unless the dashboard later adds a specific field
- Anything that does not fit the allowed metrics
- Data for anyone other than Angelika
- Any values, dates, units, ranges, or targets that are not explicitly present

Do not invent values, dates, units, reference ranges, or targets.

If something is useful health context but is not importable as a measurement, put it in `unsupported_items`.

Examples of unsupported items for now:

- Colonoscopy or bowel screening history
- Medication changes
- Symptoms
- GP notes
- Specialist letters without an allowed metric
- Diagnoses
- Family history
- Lifestyle notes

## Allowed Import JSON

Return only valid JSON using this structure:

```json
{
  "import_type": "health_dashboard_measurements",
  "version": 1,
  "notes": "Angelika historical health dashboard import. STI and immunoserology tests excluded. Unsupported health timeline items listed separately for Codex review.",
  "measurements": [
    {
      "profile_id": "angelika",
      "date": "YYYY-MM-DD",
      "metric": "LDL",
      "result_value": 106,
      "unit": "mg/dL",
      "reference_lower_limit": null,
      "target_value": null,
      "reference_upper_limit": 115,
      "reference_fields": {
        "lower": false,
        "target": false,
        "upper": true
      },
      "source_type": "Lab Report / PDF",
      "source_confidence": "High",
      "source_notes": "Extracted from lab report",
      "linked_source_document": "Optional report filename or source name",
      "notes": ""
    }
  ],
  "reference_ranges": [
    {
      "profile_id": "angelika",
      "metric": "LDL",
      "reference_lower_limit": null,
      "target_value": null,
      "reference_upper_limit": 115,
      "reference_fields": {
        "lower": false,
        "target": false,
        "upper": true
      }
    }
  ],
  "unsupported_items": [
    {
      "date": "YYYY-MM-DD or null",
      "type": "Timeline note / Unsupported metric / Document note",
      "title": "Short title",
      "summary": "Brief factual summary of the item",
      "source_notes": "Where this came from"
    }
  ]
}
```

The `reference_ranges` array is optional but useful when a source clearly gives a range for a metric. Include one range per metric if the range is known. Reference ranges are per person, so always use `profile_id: "angelika"`.

The `unsupported_items` array is optional. It will not be imported directly by the dashboard at the moment, but it helps Codex review anything that may become a future timeline or notes entry.

## Allowed Metric Names

Use these metric names exactly. If the source uses a synonym, map it to the closest exact metric below. If there is no suitable metric, do not place it in `measurements`.

- Weight
- Waist circumference
- Blood pressure systolic
- Blood pressure diastolic
- Resting heart rate
- VO2 Max
- Haemoglobin
- Erythrocytes
- Haematocrit
- MCV
- MCH
- MCHC
- RDW
- Leukocytes
- Neutrophils
- Eosinophils
- Basophils
- Lymphocytes
- Monocytes
- Platelets
- B12
- Folate
- Ferritin
- Vitamin D
- Glucose
- Fasting glucose
- HbA1c NGSP
- HbA1c IFCC
- Total cholesterol
- LDL
- HDL
- Triglycerides
- ApoB
- Lipoprotein(a)
- Albumin
- CRP
- Uric acid
- Urea
- Creatinine
- eGFR
- LDH
- AST
- ALT
- GGT
- Bilirubin total
- Bilirubin direct
- Bilirubin indirect
- Sodium
- Potassium
- Chloride
- Homocysteine
- TSH
- FT4
- Cortisol
- Total testosterone
- SHBG
- LH
- FSH
- Prolactin
- Oestradiol
- Urine pH
- Urine specific gravity
- Urine nitrites
- Urine protein
- Urine glucose
- Urine ketones
- Urine urobilinogen
- Urine bilirubin
- Urine haemoglobin
- Urine leukocytes
- Urine epithelial cells
- Urinary leukocytes
- ECG
- Coronary artery calcium score
- Eye test
- Dermatology checkup

Do not include `Pilot medical` for Angelika. That is Ben-only in the dashboard.

## Mapping Guidance

Use these common mappings:

- `Hb`, `HGB` -> `Haemoglobin`
- `RBC`, `Red blood cells` -> `Erythrocytes`
- `HCT` -> `Haematocrit`
- `WBC`, `White blood cells` -> `Leukocytes`
- `BASO` -> `Basophils`
- `EOS` -> `Eosinophils`
- `LYMPH` -> `Lymphocytes`
- `MONO` -> `Monocytes`
- `PLT` -> `Platelets`
- `Vitamin B12` -> `B12`
- `25-OH Vitamin D`, `25 hydroxy vitamin D` -> `Vitamin D`
- `HbA1c %` -> `HbA1c NGSP`
- `HbA1c mmol/mol` -> `HbA1c IFCC`
- `Cholesterol` -> `Total cholesterol`
- `LDL-C` -> `LDL`
- `HDL-C` -> `HDL`
- `TG` -> `Triglycerides`
- `Lp(a)` -> `Lipoprotein(a)`
- `Total bilirubin` -> `Bilirubin total`
- `Direct bilirubin` -> `Bilirubin direct`
- `Indirect bilirubin` -> `Bilirubin indirect`
- `Free T4`, `Free thyroxine` -> `FT4`
- `Testosterone` where clearly total testosterone -> `Total testosterone`
- `Specific gravity` in urine -> `Urine specific gravity`
- `Nitrite` in urine -> `Urine nitrites`
- `Protein` in urine -> `Urine protein`
- `Glucose` in urine -> `Urine glucose`
- `Ketones` in urine -> `Urine ketones`
- `Urobilinogen` in urine -> `Urine urobilinogen`
- `Bilirubin` in urine -> `Urine bilirubin`
- `Blood`, `Hb`, or `Haemoglobin` in urine -> `Urine haemoglobin`
- `Leukocyte esterase` in urine -> `Urine leukocytes`
- `Epithelial cells` in urine -> `Urine epithelial cells`
- `Apple Watch cardio fitness` -> `VO2 Max`
- `RHR` -> `Resting heart rate`
- `BP`, `blood pressure`, or `blood pressure 120/80` -> split into `Blood pressure systolic` and `Blood pressure diastolic`

## Units

Keep units exactly as shown in the source where possible.

If the source clearly provides a unit, include it.

If the source does not provide a unit but the metric has an obvious dashboard unit, use the dashboard default only if it is clearly appropriate:

- Weight: `kg`
- Waist circumference: `cm`
- Blood pressure: `mmHg`
- Resting heart rate: `bpm`
- VO2 Max: `mL/kg/min`
- Coronary artery calcium score: `Agatston`

Do not convert units unless the source clearly requires it and the conversion is unambiguous.

## Output Rules

Return only the JSON object.

Do not wrap it in Markdown.

Do not include explanatory text before or after the JSON.

Do not include comments in the JSON.

Use `null` rather than empty strings for missing numeric reference limits or target values.

Use exact metric names from the allowed list.

If multiple results for the same metric exist on different dates, include each as a separate measurement.

If there are duplicate entries for the same metric on the same date with the same value, include only one.

Before returning the JSON, internally check:

- Is every measurement `profile_id` exactly `angelika`?
- Is every date in `YYYY-MM-DD` format?
- Is every metric name on the allowed list?
- Are STI and immunoserology tests excluded?
- Are numeric values numbers rather than strings?
- Are missing limits represented as `null`?
- Are reference fields consistent with the lower, target, and upper values?
- Are Ben-only items such as `Pilot medical` excluded?
- Are unsupported but useful items listed in `unsupported_items` rather than forced into measurements?
