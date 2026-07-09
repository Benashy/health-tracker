# ChatGPT Prompt For Ben Health Dashboard Import

Paste this into ChatGPT before giving it Ben's historic health data, blood results, urine results, notes, or PDFs.

---

I am preparing data for Ben's Preventative Health Dashboard.

Please extract only health-dashboard data for **Ben** and return it in a JSON format that can be imported into the app.

The dashboard is for long-term preventative trend tracking. It is not a diagnostic system.

## What To Extract

Extract dated measurements only where the source provides enough information.

For each result, capture:

- Profile ID: always `ben`
- Date of the measurement/result
- Metric/test name
- Result value
- Unit
- Reference lower limit, if present
- Reference upper limit, if present
- Any useful source note
- Linked source document name, if known

If a test has only an upper limit, set `reference_lower_limit` to `null`.

If a test has only a lower limit, set `reference_upper_limit` to `null`.

If no reference range is shown, set both limits to `null`.

Use numeric values for numeric tests. Use text for qualitative urine results such as `Negative`, `Rare`, `Trace`, `Positive`, `Normal`, or `Abnormal`.

Do not invent values, dates, units, or ranges. If something is unclear, either leave the uncertain field as `null` or skip that measurement and explain it briefly outside the JSON only if asked.

## Scope Rules

Include blood, urine, cardiovascular, body, hormone, vitamin, metabolic, kidney, liver, thyroid, inflammatory, fitness, and infrequent investigation data where relevant.

Exclude:

- STI tests
- Immunoserology tests
- Infectious disease screening unless explicitly needed for the dashboard
- Anything that does not fit the allowed metrics
- Data for anyone other than Ben

## Date Rules

Use a single `date` field in `YYYY-MM-DD` format.

If multiple dates exist, use the sample/collection date if available. If only the report/result date is available, use that.

If the date cannot be determined, skip the measurement.

## Source Fields

Use these defaults unless the source clearly indicates otherwise:

- Lab blood or urine report: `source_type` = `Lab Report / PDF`, `source_confidence` = `High`
- Clinician-interpreted report such as ECG, imaging, GP letter: `source_type` = `Clinician Report`, `source_confidence` = `High`
- Home measurement such as weight, waist, blood pressure: `source_type` = `Manual Measurement`, `source_confidence` = `Medium to High`
- Wearable estimate such as Apple Watch VO2 max or resting heart rate: `source_type` = `Wearable Estimate`, `source_confidence` = `Medium`

Use `source_notes` for brief context, for example:

- `Historical ChatGPT record`
- `Extracted from PDF`
- `Manual home measurement`
- `Apple Watch estimate`

Use `linked_source_document` for the filename or document name if known, for example:

- `Rel21832308_06_06_2026.pdf`
- `Historical ChatGPT notes`

## Allowed Import JSON

Return **only valid JSON** using this structure:

```json
{
  "import_type": "health_dashboard_measurements",
  "version": 1,
  "notes": "Ben historical health dashboard import. Blood and urine results only where applicable. STI and immunoserology tests excluded.",
  "measurements": [
    {
      "profile_id": "ben",
      "date": "YYYY-MM-DD",
      "metric": "LDL",
      "result_value": 123,
      "unit": "mg/dL",
      "reference_lower_limit": null,
      "reference_upper_limit": 115,
      "source_type": "Lab Report / PDF",
      "source_confidence": "High",
      "source_notes": "Extracted from PDF",
      "linked_source_document": "Optional report filename or source name",
      "notes": "Optional short note"
    }
  ],
  "reference_ranges": [
    {
      "profile_id": "ben",
      "metric": "LDL",
      "reference_lower_limit": null,
      "reference_upper_limit": 115
    }
  ]
}
```

The `reference_ranges` array is optional but useful when a source clearly gives a range for a metric. Include one range per metric if the range is known. Reference ranges are per person, so always use `profile_id: "ben"`.

## Allowed Metric Names

Use these metric names exactly. If the source uses a synonym, map it to the closest exact metric below. If there is no suitable metric, skip it.

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

## Output Rules

Return only the JSON object.

Do not wrap it in Markdown.

Do not include explanatory text before or after the JSON.

Do not include comments in the JSON.

Use `null` rather than empty strings for missing numeric reference limits.

Use exact metric names from the allowed list.

If multiple results for the same metric exist on different dates, include each as a separate measurement.

If there are duplicate entries for the same metric on the same date with the same value, include only one.

Before returning the JSON, internally check:

- Is every `profile_id` exactly `ben`?
- Is every date in `YYYY-MM-DD` format?
- Is every metric name on the allowed list?
- Are STI and immunoserology tests excluded?
- Are numeric values numbers rather than strings?
- Are missing limits represented as `null`?
