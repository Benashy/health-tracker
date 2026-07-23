const APP_VERSION = "v0.69";
const STORAGE_KEY = "blood-results-tracker:v3";
const LEGACY_STORAGE_KEYS = ["blood-results-tracker:v1", "blood-results-tracker:v2"];
const PROFILE_STORAGE_KEY = "health-dashboard-profiles:v1";
const RANGE_STORAGE_KEY = "health-dashboard-reference-ranges:v1";
const SCHEDULE_STORAGE_KEY = "health-dashboard-schedule-state:v1";
const SETTINGS_STORAGE_KEY = "health-dashboard-settings:v1";
const LAST_LOCAL_UPDATE_KEY = "health-dashboard-last-local-update:v1";
const CLOUD_CACHE_KEY = "health-dashboard-cloud-cache:v1";
const CLOUD_TABLE = "health_dashboard_data";
const DATA_VERSION = 1;
const PRODUCTION_AUTH_REDIRECT_URL = "https://benashy.github.io/health-tracker/";
const TELEGRAM_FUNCTION_NAME = "health-tracker-telegram";
const TELEGRAM_BOT_USERNAME = "HealthTrackerReminderBot";
const TELEGRAM_REMINDER_GROUPS = [
  { key: "body", label: "Body composition", cycleLabel: "14 days" },
  { key: "vitals-fitness", label: "Vitals and fitness", cycleLabel: "30 days" },
  { key: "fitness", label: "Fitness", cycleLabel: "3 months" },
  { key: "six-month-bloods", label: "Six-monthly bloods", cycleLabel: "6 months" },
  { key: "annual-bloods", label: "Annual bloods and urine", cycleLabel: "12 months" },
  { key: "pilot-medical", label: "Pilot medical", cycleLabel: "12 months" },
  { key: "eye-test", label: "Eye test", cycleLabel: "2 years" },
  { key: "dermatology", label: "Dermatology", cycleLabel: "12 months" },
  { key: "pap-smear", label: "Pap smear", cycleLabel: "3 years" },
  { key: "breast-screening", label: "Breast screening", cycleLabel: "2 years" },
  { key: "colonoscopy", label: "Colonoscopy", cycleLabel: "5 years" },
  { key: "infrequent", label: "Infrequent checks", cycleLabel: "5-10 years" },
];
const REMINDER_MILESTONES_FORTNIGHTLY = [1, 0];
const REMINDER_MILESTONES_MONTHLY = [3, 0];
const REMINDER_MILESTONES_QUARTERLY = [7, 0];
const REMINDER_MILESTONES_SIX_MONTHLY = [30, 14, 7, 0];
const REMINDER_MILESTONES_ANNUAL = [30, 14, 7, 0];
const REMINDER_MILESTONES_SCREENING = [90, 60, 30, 14, 7, 0];
const REMINDER_MILESTONES_COLONOSCOPY = [120, 90, 60, 30, 14, 7, 0];
const IMPORT_REVIEW_PAGE_SIZE = 10;
const SCHEDULE_PAGE_SIZE = 8;
const NEAR_LIMIT_RATIO = 0.02;
const TRACKING_ACTIVE = "active";
const TRACKING_NOT_TRACKED = "not_tracked";
const APPROVED_EMAILS = new Set([
  "ben_ashurst@me.com",
  "angelika_kleczka@hotmail.com",
]);
const PRIVATE_STORAGE_KEYS = [
  STORAGE_KEY,
  ...LEGACY_STORAGE_KEYS,
  PROFILE_STORAGE_KEY,
  RANGE_STORAGE_KEY,
  SCHEDULE_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  LAST_LOCAL_UPDATE_KEY,
  CLOUD_CACHE_KEY,
];

const VITAMIN_WEEK_DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];
const VITAMIN_TIMINGS = ["Upon waking", "Breakfast", "After lunch", "After dinner", "Before bed"];
const VITAMIN_ITEMS_BY_PROFILE = {
  ben: [
    vitaminItem("fexofenadine", "Upon waking", "Fexofenadine", "1 tablet", "Daily", "Empty stomach. Take with plain water only. Wait 30-60 minutes before breakfast.", "daily"),
    vitaminItem("lions-mane", "Breakfast", "Lion's Mane", "1 tablet", "Daily", "Taken with breakfast.", "daily"),
    vitaminItem("omega-3-lunch", "After lunch", "Omega-3 Fish Oil", "1 softgel", "Daily", "First of two daily softgels.", "daily"),
    vitaminItem("vitamin-d3-k2", "After lunch", "Vitamin D3 + K2", "1 capsule", "Monday & Friday", "Twice weekly.", "fixed", ["monday", "friday"]),
    vitaminItem("zinc", "After lunch", "Zinc", "1 tablet", "Monday & Friday", "Maximum twice weekly.", "fixed", ["monday", "friday"]),
    vitaminItem("lutein-complex", "After lunch", "Lutein Complex", "1 capsule", "Monday", "Once weekly.", "fixed", ["monday"]),
    vitaminItem("coq10", "After lunch", "CoQ10", "1 capsule", "Post-flying recovery days only", "Temporary. Remove once the current bottle has been finished.", "optional"),
    vitaminItem("omega-3-dinner", "After dinner", "Omega-3 Fish Oil", "1 softgel", "Daily", "Second of two daily softgels.", "daily"),
    vitaminItem("fibre", "After dinner", "Fibre", "2 capsules", "Daily", "Take with a large glass of water.", "daily"),
    vitaminItem("red-yeast-rice", "Before bed", "Red Yeast Rice", "1 capsule", "Tuesday, Thursday & Saturday", "Every-other-day pattern for the weekly organiser.", "every_other_day", ["tuesday", "thursday", "saturday"]),
    vitaminItem("magnesium", "Before bed", "Magnesium", "1 tablet", "Daily", "Normally taken at least two hours after dinner.", "daily"),
  ],
  angelika: [],
};

const defaultProfiles = [
  { id: "ben", name: "Ben", date_of_birth: "", height_cm: "" },
  { id: "angelika", name: "Angelika", date_of_birth: "", height_cm: "" },
];

const sourceConfidenceByType = {
  "Lab Report / PDF": "High",
  "Clinician Report": "High",
  "Manual Measurement": "Medium to High",
  "Wearable Estimate": "Medium",
  "Calculated Value": "Medium",
  "User Note": "Subjective",
};

const manualSourceMetrics = new Set([
  "Weight",
  "Waist circumference",
  "Blood pressure systolic",
  "Blood pressure diastolic",
]);

const wearableSourceMetrics = new Set(["Resting heart rate", "VO2 Max"]);
const clinicianSourceMetrics = new Set([
  "ECG",
  "Coronary artery calcium score",
  "Pilot medical",
  "Eye test",
  "Dermatology checkup",
  "Pap smear",
  "Breast screening",
  "Colonoscopy",
]);
const starterMetricNames = [
  "Weight",
  "Waist circumference",
  "Blood pressure systolic",
  "Blood pressure diastolic",
  "Resting heart rate",
];
const targetMetricNames = new Set(["Weight", "Waist circumference"]);
const completionMetricNames = new Set(["Pilot medical", "Eye test", "Dermatology checkup", "Pap smear", "Breast screening", "Colonoscopy"]);
const relaxedNearLimitMetrics = new Set([
  "Urine specific gravity",
  "Urine pH",
]);
const defaultSnapshotMetricNames = ["Weight", "Waist circumference", "LDL", "Total cholesterol"];
const riskContextMetricNames = new Set(["Lipoprotein(a)"]);
const inRangeStableTrendMetrics = new Set(["Blood pressure systolic", "Blood pressure diastolic"]);
const metricInputGroupOrder = [
  "Core body metrics",
  "Vitals and fitness",
  "Health checks",
  "Full blood count",
  "Vitamins and iron",
  "Metabolic",
  "Lipids",
  "Cardiovascular markers",
  "Amino acids",
  "Proteins",
  "Renal and purines",
  "Liver and enzymes",
  "Electrolytes",
  "Endocrine",
  "Hormone panel",
  "Hormone panel - escalation",
  "Urinalysis",
  "One-off and infrequent",
];
const meaningfulChangeRules = {
  "Weight": { absolute: 0.5 },
  "Waist circumference": { absolute: 1 },
  "Blood pressure systolic": { absolute: 5 },
  "Blood pressure diastolic": { absolute: 5 },
  "Resting heart rate": { absolute: 5 },
  "VO2 Max": { absolute: 2 },
  "LDL": { absolute: 5, percent: 5 },
  "Total cholesterol": { absolute: 5, percent: 5 },
  "Triglycerides": { percent: 10 },
};

const metricContextNotes = {
  "Weight": "Weight is useful for long-term trend tracking, but day-to-day values can shift with hydration, meals, bowel contents, and training. Interpret changes alongside waist circumference, blood pressure, glucose/HbA1c, lipids, and how the measurement was taken.",
  "Waist circumference": "Waist circumference is a practical marker of central body fat and cardiometabolic risk. Small changes can reflect tape position or technique, so measure consistently at the navel and focus on the longer-term direction.",
  "Blood pressure systolic": "Systolic blood pressure is the pressure when the heart contracts. Home readings are most useful as repeated, rested measurements; persistent elevation matters more than a single reading.",
  "Blood pressure diastolic": "Diastolic blood pressure is the pressure between beats. Interpret with systolic pressure, home technique, stress, caffeine, sleep, exercise, and whether readings are repeatedly elevated.",
  "Resting heart rate": "Resting heart rate can reflect fitness, recovery, sleep, stress, illness, medication, caffeine, and hydration. Trends are more useful than isolated wearable or single-day values.",
  "VO2 Max": "VO2 max estimates cardiorespiratory fitness. Wearable estimates are useful for trend tracking, but they are not equivalent to formal cardiopulmonary exercise testing.",
  "Haemoglobin": "Haemoglobin carries oxygen in red blood cells. Low values can fit with anaemia, blood loss, iron/B12/folate issues, or chronic illness; high values can reflect dehydration, smoking, altitude, or less commonly blood disorders.",
  "Erythrocytes": "Erythrocytes are red blood cells. Interpret the count with haemoglobin, haematocrit, MCV, ferritin, B12, folate, hydration status, and recent training or altitude exposure.",
  "Haematocrit": "Haematocrit is the proportion of blood made up by red blood cells. It can rise with dehydration or increased red cell mass and fall with anaemia or overhydration, so context matters.",
  "MCV": "MCV reflects average red-cell size. Low MCV often points toward iron deficiency or thalassaemia trait; high MCV can be seen with B12/folate deficiency, alcohol, liver disease, thyroid issues, or some medicines.",
  "MCH": "MCH estimates the amount of haemoglobin per red blood cell. Low values often travel with iron-deficiency patterns, while interpretation is strongest when paired with MCV, MCHC, RDW, and ferritin.",
  "MCHC": "MCHC reflects haemoglobin concentration inside red blood cells. Borderline changes are often interpreted with the rest of the red-cell indices rather than alone.",
  "RDW": "RDW measures variation in red-cell size. A higher RDW can appear with evolving or mixed deficiencies, recovery after blood loss, or mixed red-cell populations; interpret with MCV, ferritin, B12, and folate.",
  "Leukocytes": "Leukocytes are total white blood cells. High values can occur with infection, inflammation, stress, smoking, or steroid use; low values can occur with viral illness, medicines, autoimmune conditions, or bone marrow issues.",
  "Neutrophils": "Neutrophils are the main rapid-response white cells for bacterial infection and inflammation. They can rise with infection, stress, steroids, or intense exercise, and fall with some viral illnesses or medicines.",
  "Eosinophils": "Eosinophils are involved in allergic and inflammatory responses. Borderline high percentages can fit with common allergic conditions such as hay fever, asthma, or eczema, but should be interpreted with the absolute eosinophil count and whether the pattern persists.",
  "Basophils": "Basophils are a small white-cell subtype involved in allergic and inflammatory signalling. Mild percentage variation is often nonspecific; persistent or marked elevation should be interpreted with the total white cell count and the wider differential.",
  "Lymphocytes": "Lymphocytes are important immune cells, including B cells and T cells. They can rise with some viral infections and immune activation, and fall with stress, steroids, some infections, or immune suppression.",
  "Monocytes": "Monocytes help clear infection and support immune response. A mild isolated rise can be seen after recent infection, inflammation, or stress, but significance depends on the absolute monocyte count, symptoms, and repeat results.",
  "Platelets": "Platelets help blood clot. High values can be reactive after inflammation, infection, bleeding, or iron deficiency; low values can increase bleeding risk and need context from symptoms, repeat testing, and medications.",
  "B12": "Vitamin B12 is important for red blood cells and nerve function. Low or borderline values are best interpreted with symptoms, MCV, homocysteine, folate, diet, absorption risk, and supplementation history.",
  "Folate": "Folate supports DNA production and red blood cell formation. Low values can contribute to macrocytosis and raised homocysteine, but should be interpreted alongside B12 so B12 deficiency is not missed.",
  "Ferritin": "Ferritin reflects iron stores, but it also rises with inflammation, liver disease, infection, and some metabolic conditions. Low ferritin strongly supports iron deficiency; high ferritin is not automatically iron overload.",
  "Vitamin D": "Vitamin D supports bone, muscle, nerve, and immune function. Levels vary with season, sun exposure, supplements, skin coverage, and absorption; routine testing is not needed for everyone but can be useful when tracking deficiency or replacement.",
  "Glucose": "Blood glucose is a snapshot of blood sugar at the time of testing. It is affected by meals, fasting status, stress, illness, sleep, and exercise, so trend it with HbA1c and the test context.",
  "Fasting glucose": "Fasting glucose is more interpretable for metabolic risk than a random glucose value. It should be read with HbA1c, triglycerides, waist circumference, blood pressure, and whether the fast was genuine.",
  "HbA1c NGSP": "HbA1c estimates average blood glucose over roughly the previous two to three months. It can be affected by anaemia, red-cell turnover, haemoglobin variants, kidney disease, and recent blood loss.",
  "HbA1c IFCC": "HbA1c IFCC is the mmol/mol version of HbA1c. It gives the same broad long-term glucose picture as HbA1c NGSP, so the trend matters more than the reporting format.",
  "Total cholesterol": "Total cholesterol is a broad measure combining several cholesterol fractions. It is useful for context but less informative than LDL, HDL, triglycerides, ApoB, Lp(a), blood pressure, glucose, and family history.",
  "LDL": "LDL is a major atherogenic cholesterol fraction and is central to cardiovascular prevention. Lower LDL is generally favourable, especially when ApoB or Lp(a) is high or family risk is present.",
  "HDL": "HDL is often described as protective, but it is best used as a risk marker rather than a treatment target by itself. Interpret HDL with triglycerides, LDL/ApoB, exercise, weight, alcohol, and metabolic health.",
  "Triglycerides": "Triglycerides are circulating fats used for energy. They rise with recent food intake, alcohol, insulin resistance, weight gain, some medicines, and genetic factors; fasting status is important.",
  "ApoB": "ApoB approximates the number of atherogenic particles that can enter artery walls. It can be a clearer marker of particle burden than LDL alone, especially when triglycerides are high or metabolic risk is present.",
  "Lipoprotein(a)": "Lp(a) is mostly genetically determined and usually stable across life. High Lp(a) can increase cardiovascular risk even when LDL looks acceptable, so it mainly informs how aggressively to manage overall risk.",
  "Homocysteine": "Homocysteine is an amino acid influenced by B12, folate, B6, kidney function, genetics, and some medicines. Higher values can be associated with cardiovascular risk, but it should be interpreted as part of a broader risk pattern.",
  "Albumin": "Albumin is a major blood protein made by the liver. Low values can reflect inflammation, kidney or gut protein loss, liver disease, or nutrition issues; interpret with CRP, liver markers, urine protein, and overall health.",
  "CRP": "CRP is a nonspecific inflammation marker. It can rise with infection, injury, inflammatory conditions, recent intense exercise, and some chronic cardiometabolic risk patterns; repeat context is important.",
  "Uric acid": "Uric acid is a breakdown product of purines. Higher values can be associated with gout or kidney stones, but many people with high uric acid do not have gout; interpret with symptoms, kidney function, hydration, alcohol, and diet.",
  "Urea": "Urea reflects protein metabolism and kidney excretion, and is strongly affected by hydration and protein intake. It is most useful alongside creatinine, eGFR, electrolytes, and clinical context.",
  "Creatinine": "Creatinine is a muscle-derived waste product used to estimate kidney function. It varies with muscle mass, hydration, recent intense exercise, supplements such as creatine, and kidney filtration.",
  "eGFR": "eGFR estimates how well the kidneys filter blood, usually using creatinine, age, and sex. Persistent reduction is more meaningful than a single borderline value and should be read with urine protein/blood and blood pressure.",
  "LDH": "LDH is an enzyme found in many tissues, so it is nonspecific. It can rise with sample haemolysis, muscle injury, liver issues, inflammation, or tissue damage; interpret with AST, ALT, bilirubin, blood count, and symptoms.",
  "AST": "AST is found in liver, muscle, heart, and other tissues. A rise can reflect liver irritation but also muscle injury or recent hard exercise, so compare with ALT, GGT, bilirubin, CK if available, and recent training.",
  "ALT": "ALT is more liver-focused than AST and can rise with fatty liver, alcohol, medicines/supplements, viral hepatitis, metabolic risk, or other liver irritation. Trends and the wider liver panel matter.",
  "GGT": "GGT is a liver and bile-duct enzyme. It can rise with alcohol, fatty liver, bile duct irritation, some medicines, and metabolic risk; interpret with ALT, AST, ALP if available, and bilirubin.",
  "Bilirubin total": "Total bilirubin reflects bilirubin from red-cell breakdown and liver/bile handling. Mild isolated elevation can be benign in Gilbert syndrome, but context from direct/indirect bilirubin and liver enzymes matters.",
  "Bilirubin direct": "Direct bilirubin is conjugated bilirubin. Elevation can point more toward liver processing or bile flow issues, especially when paired with abnormal ALT, AST, GGT, ALP, or symptoms such as jaundice.",
  "Bilirubin indirect": "Indirect bilirubin is unconjugated bilirubin. It can rise with Gilbert syndrome, fasting, illness, or increased red-cell breakdown; interpret with haemoglobin, reticulocytes if available, and liver enzymes.",
  "Sodium": "Sodium reflects water and salt balance. Meaningful abnormalities can occur with dehydration, overhydration, kidney/adrenal issues, medicines, vomiting/diarrhoea, or illness; significant changes deserve clinician review.",
  "Potassium": "Potassium is important for heart rhythm, nerves, and muscles. Abnormal results can relate to kidney function, medicines, supplements, sample handling, dehydration, or hormone issues and can be clinically important.",
  "Chloride": "Chloride helps maintain fluid and acid-base balance. It is usually interpreted with sodium, potassium, bicarbonate/CO2 if available, kidney function, hydration, and gastrointestinal losses.",
  "TSH": "TSH is the pituitary signal to the thyroid. High TSH often suggests underactive thyroid tendency; low TSH can suggest overactive thyroid or excess replacement, but FT4 and symptoms are needed.",
  "FT4": "Free T4 is the circulating thyroid hormone available to tissues. Interpret with TSH, symptoms, medication timing, biotin/supplements, and whether the pattern is persistent.",
  "Cortisol": "Cortisol is a stress and adrenal hormone with strong daily rhythm. Time of day, illness, stress, steroid medication, sleep disruption, and testing method are critical for interpretation.",
  "Total testosterone": "Total testosterone should be interpreted with symptoms, morning timing, repeat testing, SHBG, free testosterone estimate, illness, sleep, weight, and medications. Low libido or fatigue alone is not enough without objective pattern.",
  "SHBG": "SHBG binds testosterone and oestradiol and changes how much hormone is available to tissues. It can be influenced by thyroid status, liver function, weight, insulin resistance, age, medications, and sex hormone levels.",
  "LH": "LH is a pituitary signal to the testes/ovaries. In men, high LH with low testosterone can suggest primary testicular failure; low/inappropriately normal LH with low testosterone can suggest pituitary or functional suppression.",
  "FSH": "FSH is a pituitary hormone involved in sperm production and ovarian follicle development. In a male hormone workup it is most useful when testosterone or fertility markers are abnormal.",
  "Prolactin": "Prolactin is a pituitary hormone that can suppress the gonadal axis when elevated. Stress, sleep, exercise, sex, some medicines, pituitary causes, and macroprolactin can affect interpretation.",
  "Oestradiol": "Oestradiol is an estrogen important for bone, libido, body composition, and reproductive health in both sexes. Interpretation depends heavily on sex, age, symptoms, testosterone/SHBG, medication, and assay quality.",
  "Urine pH": "Urine pH reflects urine acidity, not blood pH. Diet, hydration, kidney handling, infection with urease-producing bacteria, and stone risk can influence it.",
  "Urine specific gravity": "Specific gravity estimates urine concentration. It mainly reflects hydration and kidney concentrating ability; small changes near the reference edge are often less meaningful than persistent extremes.",
  "Urine nitrites": "Nitrites can be positive when certain bacteria convert nitrates in urine, supporting a possible UTI. A negative result does not exclude infection, especially with frequent urination or bacteria that do not produce nitrite.",
  "Urine protein": "Urine protein can be transient after exercise, fever, dehydration, or illness, but persistent protein can suggest kidney filtering stress. It is important alongside blood pressure, eGFR, and repeat urine testing.",
  "Urine glucose": "Glucose in urine can occur when blood glucose is high enough to spill into urine, or less commonly with renal tubular handling differences. Interpret with blood glucose and HbA1c.",
  "Urine ketones": "Ketones can appear with fasting, low-carbohydrate diets, prolonged exercise, vomiting, or diabetes-related insulin deficiency. Context and blood glucose are important.",
  "Urine urobilinogen": "Urobilinogen reflects bilirubin metabolism through the gut and liver. Abnormal values are interpreted with bilirubin, liver enzymes, haemolysis markers, and sample handling.",
  "Urine bilirubin": "Bilirubin in urine usually reflects conjugated bilirubin and can suggest liver or bile-flow issues. Interpret with blood bilirubin fractions, ALT/AST/GGT/ALP if available, and symptoms such as jaundice or dark urine.",
  "Urine haemoglobin": "A positive urine blood/haemoglobin result can reflect red cells, haemoglobin, or myoglobin. Causes include UTI, stones, exercise, contamination, kidney/urological issues, or muscle injury; microscopy helps clarify.",
  "Urine leukocytes": "Leukocytes or leukocyte esterase suggest white cells in the urine. This can fit UTI or urinary inflammation, but contamination is common, especially if epithelial cells are also present.",
  "Urine epithelial cells": "Epithelial cells often reflect sample contamination from skin or genital tract, especially when many are present. They are mainly useful for judging urine sample quality.",
  "Urinary leukocytes": "Microscopic urinary leukocytes can support infection or inflammation when elevated. Interpret with symptoms, nitrites, culture if done, epithelial cells, and whether the sample was clean-catch.",
  "ECG": "An ECG is a short snapshot of the heart's electrical activity. It can show rhythm, conduction, and signs of previous or current strain/injury, but a normal ECG does not exclude intermittent rhythm problems or all heart disease.",
  "Coronary artery calcium score": "CAC score measures calcified plaque in the coronary arteries. Higher scores generally mean higher future cardiovascular risk; a score of zero is reassuring but does not exclude non-calcified plaque or future risk.",
  "Pilot medical": "Ben's annual UK CAA pilot medical is a standalone administrative/clinical fitness check. It is tracked mainly for expiry and reminder timing rather than trend interpretation.",
  "Eye test": "A routine eye test is tracked as a recurring preventative check. In this dashboard it is aligned one month before the pilot medical date, so there is time to complete it before the annual medical.",
  "Dermatology checkup": "A dermatology checkup is tracked as a yearly skin review, including moles and general skin condition. The main value is regular review and documentation of changes over time.",
  "Pap smear": "A Pap smear is tracked here as a recurring cervical screening health check for Angelika. The dashboard records completion and the next due date rather than interpreting clinical results.",
  "Breast screening": "Breast screening is tracked here as a recurring preventative health check for Angelika. The dashboard records completion and the next due date rather than interpreting clinical results.",
  "Colonoscopy": "Colonoscopy is tracked here as a recurring preventative bowel health check. The dashboard records completion and the next due date rather than interpreting clinical results.",
};

const metrics = [
  metric("Weight", "Core body metrics", "kg", null, null, "numeric", "highest", 14, "context"),
  metric("Waist circumference", "Core body metrics", "cm", null, null, "numeric", "highest", 14, "lower"),
  metric("Blood pressure systolic", "Vitals and fitness", "mmHg", null, 120, "numeric", "highest", 30, "lower"),
  metric("Blood pressure diastolic", "Vitals and fitness", "mmHg", null, 80, "numeric", "highest", 30, "lower"),
  metric("Resting heart rate", "Vitals and fitness", "bpm", null, null, "numeric", "highest", 30, "lower"),
  metric("VO2 Max", "Vitals and fitness", "mL/kg/min", null, null, "numeric", "highest", 90, "higher"),
  metric("Haemoglobin", "Full blood count", "g/dL", 13, 17, "numeric", "medium", 365, "range"),
  metric("Erythrocytes", "Full blood count", "x10^6/uL", 4.5, 5.5, "numeric", "medium", 365, "range"),
  metric("Haematocrit", "Full blood count", "%", 40, 50, "numeric", "medium", 365, "range"),
  metric("MCV", "Full blood count", "fL", 80, 97, "numeric", "medium", 365, "range"),
  metric("MCH", "Full blood count", "pg", 27, 32, "numeric", "medium", 365, "range"),
  metric("MCHC", "Full blood count", "g/dL", 32, 36, "numeric", "medium", 365, "range"),
  metric("RDW", "Full blood count", "%", 11.6, 14, "numeric", "medium", 365, "range"),
  metric("Leukocytes", "Full blood count", "x10^3/uL", 4, 10, "numeric", "medium", 365, "range"),
  metric("Neutrophils", "Full blood count", "%", 40, 80, "numeric", "medium", 365, "range"),
  metric("Eosinophils", "Full blood count", "%", 1, 6, "numeric", "medium", 365, "range"),
  metric("Basophils", "Full blood count", "%", 0, 2, "numeric", "medium", 365, "range"),
  metric("Lymphocytes", "Full blood count", "%", 20, 40, "numeric", "medium", 365, "range"),
  metric("Monocytes", "Full blood count", "%", 2, 10, "numeric", "medium", 365, "range"),
  metric("Platelets", "Full blood count", "x10^3/uL", 150, 400, "numeric", "medium", 365, "range"),
  metric("B12", "Vitamins and iron", "pg/mL", 211, 911, "numeric", "medium", 365, "range"),
  metric("Folate", "Vitamins and iron", "ng/mL", 5.4, null, "numeric", "medium", 365, "higher"),
  metric("Ferritin", "Vitamins and iron", "ng/mL", 30, 340, "numeric", "medium", 365, "range"),
  metric("Vitamin D", "Vitamins and iron", "ng/mL", 30, 100, "numeric", "medium", 365, "range"),
  metric("Glucose", "Metabolic", "mg/dL", 70, 110, "numeric", "medium", 180, "range"),
  metric("Fasting glucose", "Metabolic", "mg/dL", 70, 110, "numeric", "medium", 180, "range"),
  metric("HbA1c NGSP", "Metabolic", "%", 4.3, 6.1, "numeric", "medium", 180, "range"),
  metric("HbA1c IFCC", "Metabolic", "mmol/mol", null, 42, "numeric", "medium", 180, "lower"),
  metric("Total cholesterol", "Lipids", "mg/dL", null, 190, "numeric", "medium", 180, "lower"),
  metric("LDL", "Lipids", "mg/dL", null, 115, "numeric", "medium", 180, "lower"),
  metric("HDL", "Lipids", "mg/dL", 35, 55, "numeric", "medium", 180, "higher"),
  metric("Triglycerides", "Lipids", "mg/dL", null, 150, "numeric", "medium", 180, "lower"),
  metric("ApoB", "Cardiovascular markers", "mg/dL", null, null, "numeric", "highest", 365, "lower", "Annual if clinically indicated"),
  metric("Lipoprotein(a)", "Cardiovascular markers", "mg/dL", null, null, "numeric", "highest", null, "lower", "One-time lifetime measurement"),
  metric("Albumin", "Proteins", "g/dL", 3.4, 5, "numeric", "lower", 365, "range"),
  metric("CRP", "Inflammation", "mg/dL", 0.05, 1, "numeric", "medium", 365, "lower"),
  metric("Uric acid", "Renal and purines", "mg/dL", 3.7, 9.2, "numeric", "lower", 365, "range"),
  metric("Urea", "Renal and purines", "mg/dL", null, 50, "numeric", "lower", 365, "lower"),
  metric("Creatinine", "Renal and purines", "mg/dL", 0.7, 1.3, "numeric", "medium", 365, "range"),
  metric("eGFR", "Renal and purines", "mL/min/1.73m2", 60, null, "numeric", "medium", 365, "higher"),
  metric("LDH", "Liver and enzymes", "U/L", 120, 246, "numeric", "lower", 365, "range"),
  metric("AST", "Liver and enzymes", "U/L", null, 34, "numeric", "medium", 365, "lower"),
  metric("ALT", "Liver and enzymes", "U/L", 10, 49, "numeric", "medium", 365, "range"),
  metric("GGT", "Liver and enzymes", "U/L", null, 73, "numeric", "medium", 365, "lower"),
  metric("Bilirubin total", "Liver and enzymes", "mg/dL", 0.3, 1.2, "numeric", "lower", 365, "range"),
  metric("Bilirubin direct", "Liver and enzymes", "mg/dL", null, 0.3, "numeric", "lower", 365, "lower"),
  metric("Bilirubin indirect", "Liver and enzymes", "mg/dL", 0.2, 0.8, "numeric", "lower", 365, "range"),
  metric("Sodium", "Electrolytes", "mmol/L", 132, 146, "numeric", "lower", 365, "range"),
  metric("Potassium", "Electrolytes", "mmol/L", 3.5, 5.5, "numeric", "lower", 365, "range"),
  metric("Chloride", "Electrolytes", "mmol/L", 99, 109, "numeric", "lower", 365, "range"),
  metric("Homocysteine", "Amino acids", "umol/L", 3.7, 13.9, "numeric", "lower", 365, "lower"),
  metric("TSH", "Endocrine", "mIU/L", 0.35, 5.5, "numeric", "medium", 365, "range"),
  metric("FT4", "Endocrine", "ng/dL", 0.8, 1.76, "numeric", "medium", 365, "range"),
  metric("Cortisol", "Endocrine", "ug/dL", 5.27, 22.45, "numeric", "lower", 365, "range"),
  metric("Total testosterone", "Hormone panel", "ng/dL", null, null, "numeric", "highest", 365, "range", "If symptoms or clinically indicated"),
  metric("SHBG", "Hormone panel", "nmol/L", null, null, "numeric", "highest", 365, "range", "If symptoms or clinically indicated"),
  metric("LH", "Hormone panel - escalation", "IU/L", null, null, "numeric", "conditional", null, "range", "Only if total testosterone is abnormal"),
  metric("FSH", "Hormone panel - escalation", "IU/L", null, null, "numeric", "conditional", null, "range", "Only if total testosterone is abnormal"),
  metric("Prolactin", "Hormone panel - escalation", "ng/mL", null, null, "numeric", "conditional", null, "range", "Only if total testosterone is abnormal"),
  metric("Oestradiol", "Hormone panel - escalation", "pg/mL", null, null, "numeric", "conditional", null, "range", "Only if total testosterone is abnormal"),
  metric("Urine pH", "Urinalysis", "", null, null, "numeric", "lower", 365, "context"),
  metric("Urine specific gravity", "Urinalysis", "", 1.01, 1.025, "numeric", "lower", 365, "range"),
  metric("Urine nitrites", "Urinalysis", "", null, null, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine protein", "Urinalysis", "", null, 20, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine glucose", "Urinalysis", "", null, null, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine ketones", "Urinalysis", "", null, null, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine urobilinogen", "Urinalysis", "mg/dL", null, null, "numeric", "lower", 365, "context"),
  metric("Urine bilirubin", "Urinalysis", "", null, null, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine haemoglobin", "Urinalysis", "", null, null, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine leukocytes", "Urinalysis", "", null, null, "qualitative", "lower", 365, "context", "Annual urine screen", "Negative"),
  metric("Urine epithelial cells", "Urinalysis", "/uL", null, 5, "qualitative", "lower", 365, "context", "Annual urine screen", "Rare"),
  metric("Urinary leukocytes", "Urinalysis", "/uL", null, 10, "qualitative", "lower", 365, "context", "Annual urine screen", "Rare"),
  metric("Pilot medical", "Health checks", "", null, null, "qualitative", "highest", 365, "context", "Annual UK CAA pilot medical", null, {
    firstDueDate: "2027-07-14",
    intervalMonths: 12,
    profileIds: ["ben"],
    warningDays: 42,
    telegramReminderDays: [42, 30, 14, 7, 1],
    telegramOverdueReminderDay: -1,
    placeholder: "Completed",
    entryMode: "completion",
    manualNextDueDate: true,
    nextDueLabel: "Expiry date",
  }),
  metric("Eye test", "Health checks", "", null, null, "qualitative", "medium", 730, "context", "Every 2 years", null, {
    firstDueDate: "2027-06-01",
    intervalMonths: 24,
    placeholder: "Completed",
    entryMode: "completion",
  }),
  metric("Dermatology checkup", "Health checks", "", null, null, "qualitative", "medium", 365, "context", "Every 12 months", null, {
    firstDueDate: "2027-07-01",
    intervalMonths: 12,
    placeholder: "Completed",
    entryMode: "completion",
  }),
  metric("Pap smear", "Health checks", "", null, null, "qualitative", "medium", 1095, "context", "Every 3 years", null, {
    intervalMonths: 36,
    profileIds: ["angelika"],
    placeholder: "Completed",
    entryMode: "completion",
  }),
  metric("Breast screening", "Health checks", "", null, null, "qualitative", "medium", 730, "context", "Every 2 years", null, {
    intervalMonths: 24,
    profileIds: ["angelika"],
    placeholder: "Completed",
    entryMode: "completion",
  }),
  metric("Colonoscopy", "Health checks", "", null, null, "qualitative", "medium", 1825, "context", "Every 5 years", null, {
    intervalMonths: 60,
    placeholder: "Completed and OK",
    entryMode: "completion",
  }),
  metric("ECG", "One-off and infrequent", "", null, null, "qualitative", "lower", 1825, "context", "Every 5 years or as clinically indicated"),
  metric("Coronary artery calcium score", "One-off and infrequent", "Agatston", null, null, "numeric", "lower", 3650, "lower", "Around age 45, then infrequent if useful"),
];

const hasPrivateCloudConfig = Boolean(getSupabaseConfig());
const initialProfiles = hasPrivateCloudConfig ? defaultProfiles : loadProfiles();

const state = {
  profiles: initialProfiles,
  results: hasPrivateCloudConfig ? [] : loadResults(initialProfiles),
  metricRanges: hasPrivateCloudConfig ? {} : loadMetricRanges(),
  scheduleState: hasPrivateCloudConfig ? { snoozes: {} } : loadScheduleState(),
  settings: hasPrivateCloudConfig ? normaliseSettings({}) : loadSettings(),
  filter: "latest",
  activeProfileId: null,
  activeSummaryFilter: "",
  editingProfiles: !profilesAreComplete(initialProfiles),
  editingSnapshot: false,
  editingRangeKey: null,
  referenceDraftKey: null,
  activeTrendKey: "",
  trendRange: "all",
  mobileView: "home",
  telegramPanelOpen: false,
  vitaminsPanelOpen: false,
  completionNextDueTouched: false,
  entrySaveLocked: false,
  entryUnlockTimer: null,
  saveFeedbackTimer: null,
  pendingImport: null,
  pendingImportPage: 1,
  schedulePage: 1,
};

const telegramSetupState = {
  pairingCode: "",
  busy: false,
  status: "",
  error: "",
};

const cloudState = {
  enabled: false,
  client: null,
  session: null,
  user: null,
  profileId: null,
  cloudUpdatedAt: null,
  loadedAt: null,
  saveTimer: null,
  saving: false,
  applyingCloudData: false,
  conflict: false,
  lastError: "",
};
let authRedirectMessage = getAuthRedirectMessage();

const authPanel = document.querySelector("#authPanel");
const authForm = document.querySelector("#authForm");
const authStatus = document.querySelector("#authStatus");
const authEmail = document.querySelector("#authEmail");
const authPassword = document.querySelector("#authPassword");
const magicLinkButton = document.querySelector("#magicLinkButton");
const onboardingPanel = document.querySelector("#onboardingPanel");
const onboardingTitle = document.querySelector("#onboardingTitle");
const onboardingText = document.querySelector("#onboardingText");
const focusEntryButton = document.querySelector("#focusEntryButton");
const focusImportButton = document.querySelector("#focusImportButton");
const profileSection = document.querySelector(".profile-section");
const profileForm = document.querySelector("#profileForm");
const profileCards = document.querySelector("#profileCards");
const personField = document.querySelector("#personField");
const personInput = document.querySelector("#personInput");
const contentGrid = document.querySelector("#contentGrid");
const form = document.querySelector("#resultForm");
const entryPanel = document.querySelector(".entry-panel");
const metricInput = document.querySelector("#markerInput");
const metricSearchInput = document.querySelector("#metricSearchInput");
const quickMetricPanel = document.querySelector("#quickMetricPanel");
const trackingControl = document.querySelector("#trackingControl");
const trackingStatusText = document.querySelector("#trackingStatusText");
const trackingToggleButton = document.querySelector("#trackingToggleButton");
const trendMetricInput = document.querySelector("#trendMetricInput");
const trendPanel = document.querySelector("#trendPanel");
const dateLabelText = document.querySelector("#dateLabelText");
const valueFields = document.querySelector("#valueFields");
const completionPanel = document.querySelector("#completionPanel");
const completionInput = document.querySelector("#completionInput");
const nextDueField = document.querySelector("#nextDueField");
const nextDueLabel = document.querySelector("#nextDueLabel");
const nextDueInput = document.querySelector("#nextDueInput");
const completionHint = document.querySelector("#completionHint");
const unitInput = document.querySelector("#unitInput");
const lowField = document.querySelector("#lowField");
const targetField = document.querySelector("#targetField");
const highField = document.querySelector("#highField");
const lowLabel = document.querySelector("#lowLabel");
const targetLabel = document.querySelector("#targetLabel");
const highLabel = document.querySelector("#highLabel");
const lowInput = document.querySelector("#lowInput");
const targetInput = document.querySelector("#targetInput");
const highInput = document.querySelector("#highInput");
const referencePanel = document.querySelector("#referencePanel");
const referenceOptions = document.querySelector("#referenceOptions");
const referenceLowerEnabled = document.querySelector("#referenceLowerEnabled");
const targetEnabled = document.querySelector("#targetEnabled");
const referenceUpperEnabled = document.querySelector("#referenceUpperEnabled");
const rangeEditButton = document.querySelector("#rangeEditButton");
const rangeHint = document.querySelector("#rangeHint");
const testDateInput = document.querySelector("#dateInput");
const sampleDateInput = document.querySelector("#sampleDateInput");
const valueInput = document.querySelector("#valueInput");
const notesInput = document.querySelector("#notesInput");
const sourceTypeInput = document.querySelector("#sourceTypeInput");
const sourceConfidenceInput = document.querySelector("#sourceConfidenceInput");
const sourceNotesInput = document.querySelector("#sourceNotesInput");
const sourceDocumentInput = document.querySelector("#sourceDocumentInput");
const entryAssist = document.querySelector("#entryAssist");
const resultsBody = document.querySelector("#resultsBody");
const emptyState = document.querySelector("#emptyState");
const tableWrap = document.querySelector(".results-table-wrap");
const resultsPanel = document.querySelector(".results-panel");
const cautionResults = document.querySelector("#cautionResults");
const warningResults = document.querySelector("#warningResults");
const dueSoonResults = document.querySelector("#dueSoonResults");
const nextDueDate = document.querySelector("#nextDueDate");
const nextDueRelative = document.querySelector("#nextDueRelative");
const nextDueCard = document.querySelector("#nextDueCard");
const snapshotSection = document.querySelector("#snapshotSection");
const snapshotUpdated = document.querySelector("#snapshotUpdated");
const snapshotEditButton = document.querySelector("#snapshotEditButton");
const snapshotEditor = document.querySelector("#snapshotEditor");
const snapshotCancelButton = document.querySelector("#snapshotCancelButton");
const snapshotMetricInputs = [
  document.querySelector("#snapshotMetric1"),
  document.querySelector("#snapshotMetric2"),
  document.querySelector("#snapshotMetric3"),
  document.querySelector("#snapshotMetric4"),
];
const snapshotGrid = document.querySelector("#snapshotGrid");
const snapshotList = document.querySelector("#snapshotList");
const markerSummary = document.querySelector("#markerSummary");
const scheduleSection = document.querySelector(".schedule-section");
const schedulePanel = document.querySelector("#schedulePanel");
const schedulePagination = document.querySelector("#schedulePagination");
const schedulePrevButton = document.querySelector("#schedulePrevButton");
const scheduleNextButton = document.querySelector("#scheduleNextButton");
const schedulePageText = document.querySelector("#schedulePageText");
const telegramModal = document.querySelector("#telegramModal");
const telegramPanel = document.querySelector("#telegramPanel");
const telegramStatus = document.querySelector("#telegramStatus");
const telegramConnectionTitle = document.querySelector("#telegramConnectionTitle");
const telegramConnectionText = document.querySelector("#telegramConnectionText");
const telegramPairingCode = document.querySelector("#telegramPairingCode");
const telegramOpenButton = document.querySelector("#telegramOpenButton");
const telegramCloseButton = document.querySelector("#telegramCloseButton");
const telegramPairButton = document.querySelector("#telegramPairButton");
const telegramCheckButton = document.querySelector("#telegramCheckButton");
const telegramTestButton = document.querySelector("#telegramTestButton");
const telegramDueTestButton = document.querySelector("#telegramDueTestButton");
const telegramPauseButton = document.querySelector("#telegramPauseButton");
const telegramDisconnectButton = document.querySelector("#telegramDisconnectButton");
const telegramReminderGroups = document.querySelector("#telegramReminderGroups");
const vitaminsModal = document.querySelector("#vitaminsModal");
const vitaminsPanel = document.querySelector("#vitaminsPanel");
const vitaminsSubtitle = document.querySelector("#vitaminsSubtitle");
const vitaminsOpenButton = document.querySelector("#vitaminsOpenButton");
const vitaminsCloseButton = document.querySelector("#vitaminsCloseButton");
const vitaminsPrintButton = document.querySelector("#vitaminsPrintButton");
const vitaminsDoseFeedback = document.querySelector("#vitaminsDoseFeedback");
const vitaminsEmptyState = document.querySelector("#vitaminsEmptyState");
const vitaminsMainSection = document.querySelector("#vitaminsMainSection");
const vitaminsWeeklySection = document.querySelector("#vitaminsWeeklySection");
const vitaminsMainBody = document.querySelector("#vitaminsMainBody");
const vitaminsWeeklyBody = document.querySelector("#vitaminsWeeklyBody");
const statusStrip = document.querySelector(".status-strip");
const trendViewPanel = document.querySelector("#trendViewPanel");
const resultsViewPanel = document.querySelector("#resultsViewPanel");
const mobileMenuPanel = document.querySelector("#mobileMenuPanel");
const mobileActionBar = document.querySelector("#mobileActionBar");
const exportCsvButton = document.querySelector("#exportCsvButton");
const exportChatGptButton = document.querySelector("#exportChatGptButton");
const exportReviewPackButton = document.querySelector("#exportReviewPackButton");
const importChatGptButton = document.querySelector("#importChatGptButton");
const importChatGptInput = document.querySelector("#importChatGptInput");
const importReviewModal = document.querySelector("#importReviewModal");
const importReviewContent = document.querySelector("#importReviewContent");
const cancelImportButton = document.querySelector("#cancelImportButton");
const discardImportButton = document.querySelector("#discardImportButton");
const confirmImportButton = document.querySelector("#confirmImportButton");
const metricContextModal = document.querySelector("#metricContextModal");
const metricContextTitle = document.querySelector("#metricContextTitle");
const metricContextSubtitle = document.querySelector("#metricContextSubtitle");
const metricContextContent = document.querySelector("#metricContextContent");
const closeContextButton = document.querySelector("#closeContextButton");
const syncStatus = document.querySelector("#syncStatus");
const manualRefreshButton = document.querySelector("#manualRefreshButton");
const appVersion = document.querySelector("#appVersion");
const signOutButton = document.querySelector("#signOutButton");
const resetButton = document.querySelector("#resetButton");
const saveFeedback = document.querySelector("#saveFeedback");
const entrySubmitButton = document.querySelector("#entrySubmitButton");

function metric(name, group, unit, low, high, type, priority, intervalDays, goal, cadence, normal, options = {}) {
  return {
    name,
    group,
    unit,
    low,
    high,
    type,
    priority,
    intervalDays,
    goal,
    cadence: cadence ?? formatInterval(intervalDays),
    normal,
    ...options,
  };
}

function vitaminItem(id, timing, item, quantity, frequency, notes, schedule, days = []) {
  return {
    id,
    timing,
    item,
    quantity,
    frequency,
    notes,
    schedule,
    days,
  };
}

function formatInterval(intervalDays) {
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

function loadProfiles() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) return normaliseProfiles(saved);
  } catch {
    return defaultProfiles;
  }
  return defaultProfiles;
}

function normaliseProfiles(profiles, includeAllDefaults = true, profileFilter = null) {
  const defaults = includeAllDefaults
    ? defaultProfiles
    : defaultProfiles.filter((profile) => !profileFilter || profile.id === profileFilter);
  const merged = defaults.map((defaultProfile) => {
    const saved =
      profiles.find((profile) => profile.id === defaultProfile.id) ??
      profiles.find((profile) => profile.id === "angelica" && defaultProfile.id === "angelika");
    return saved
      ? {
          ...defaultProfile,
          ...saved,
          id: defaultProfile.id,
          name:
            defaultProfile.id === "angelika" && (!saved.name || saved.name === "Angelica")
              ? "Angelika"
              : saved.name,
        }
      : defaultProfile;
  });
  return merged;
}

function profilesAreComplete(profiles) {
  return profiles.every((profile) => profile.name && profile.date_of_birth && profile.height_cm);
}

function saveProfiles() {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.profiles));
  markLocalUpdated();
}

function loadMetricRanges() {
  try {
    return normaliseMetricRanges(JSON.parse(localStorage.getItem(RANGE_STORAGE_KEY)) ?? {});
  } catch {
    return {};
  }
}

function saveMetricRanges() {
  state.metricRanges = normaliseMetricRanges(state.metricRanges);
  localStorage.setItem(RANGE_STORAGE_KEY, JSON.stringify(state.metricRanges));
  markLocalUpdated();
}

function loadScheduleState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SCHEDULE_STORAGE_KEY));
    return {
      snoozes: saved?.snoozes ?? {},
    };
  } catch {
    return { snoozes: {} };
  }
}

function saveScheduleState() {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(state.scheduleState));
  markLocalUpdated();
}

function loadSettings() {
  try {
    return normaliseSettings(JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)));
  } catch {
    return normaliseSettings({});
  }
}

function normaliseSettings(settings = {}) {
  const snapshotMetricsByProfile = settings?.snapshot_metrics_by_profile ?? settings?.snapshotMetricsByProfile ?? {};
  const metricTrackingByProfile = settings?.metric_tracking_by_profile ?? settings?.metricTrackingByProfile ?? {};
  const vitaminsByProfile = settings?.vitamins_by_profile ?? settings?.vitaminsByProfile ?? {};
  const normalisedSnapshotMetrics = {};
  const profileIds = new Set([...defaultProfiles.map((profile) => profile.id), ...Object.keys(snapshotMetricsByProfile)]);
  profileIds.forEach((profileId) => {
    normalisedSnapshotMetrics[profileId] = normaliseSnapshotMetricNames(snapshotMetricsByProfile[profileId]);
  });
  return {
    ...settings,
    snapshot_metrics_by_profile: normalisedSnapshotMetrics,
    metric_tracking_by_profile: normaliseMetricTrackingByProfile(metricTrackingByProfile),
    telegram: normaliseTelegramSettings(settings?.telegram),
    vitamins_by_profile: normaliseVitaminsByProfile(vitaminsByProfile),
  };
}

function normaliseVitaminsByProfile(vitaminsByProfile = {}) {
  const profileIds = new Set([...defaultProfiles.map((profile) => profile.id), ...Object.keys(vitaminsByProfile ?? {})]);
  const normalised = {};
  profileIds.forEach((profileId) => {
    normalised[profileId] = normaliseVitaminProfileSettings(profileId, vitaminsByProfile?.[profileId]);
  });
  return normalised;
}

function normaliseVitaminProfileSettings(profileId, settings = {}) {
  const weekStartDate = normaliseDateString(settings?.week_start_date ?? settings?.weekStartDate) || getMondayDateString(new Date());
  const redYeastDate = normaliseDateString(settings?.next_red_yeast_rice_dose_date ?? settings?.nextRedYeastRiceDoseDate);
  const coq10DaysByWeek = settings?.coq10_days_by_week ?? settings?.coq10DaysByWeek ?? {};
  return {
    week_start_date: weekStartDate,
    next_red_yeast_rice_dose_date: redYeastDate || (profileId === "ben" ? toDateString(new Date()) : ""),
    coq10_days_by_week: normaliseVitaminDayMap(coq10DaysByWeek),
    coq10_finished: Boolean(settings?.coq10_finished ?? settings?.coq10Finished ?? false),
  };
}

function normaliseVitaminDayMap(daysByWeek = {}) {
  const allowedDays = new Set(VITAMIN_WEEK_DAYS.map((day) => day.key));
  const normalised = {};
  Object.entries(daysByWeek ?? {}).forEach(([weekStart, days]) => {
    const dateKey = normaliseDateString(weekStart);
    if (!dateKey || !Array.isArray(days)) return;
    const selectedDays = [...new Set(days.filter((day) => allowedDays.has(day)))];
    if (selectedDays.length) normalised[dateKey] = selectedDays;
  });
  return normalised;
}

function normaliseMetricTrackingByProfile(metricTrackingByProfile = {}) {
  const normalised = {};
  const validNames = new Set(metrics.map((item) => item.name));
  Object.entries(metricTrackingByProfile ?? {}).forEach(([profileId, profileTracking]) => {
    if (!profileTracking || typeof profileTracking !== "object") return;
    Object.entries(profileTracking).forEach(([metricName, status]) => {
      if (!validNames.has(metricName) || status !== TRACKING_NOT_TRACKED) return;
      normalised[profileId] ??= {};
      normalised[profileId][metricName] = TRACKING_NOT_TRACKED;
    });
  });
  return normalised;
}

function normaliseTelegramSettings(settings = {}) {
  const chatId = String(settings?.chat_id ?? settings?.chatId ?? "").trim();
  const explicitEnabled = settings?.enabled ?? settings?.reminders_enabled ?? settings?.remindersEnabled;
  const snoozes = settings?.snoozes && typeof settings.snoozes === "object" ? settings.snoozes : {};
  return {
    chat_id: chatId,
    chat_label: String(settings?.chat_label ?? settings?.chatLabel ?? "").trim(),
    linked_at: settings?.linked_at ?? settings?.linkedAt ?? "",
    test_sent_at: settings?.test_sent_at ?? settings?.testSentAt ?? "",
    due_test_sent_at: settings?.due_test_sent_at ?? settings?.dueTestSentAt ?? "",
    enabled: chatId ? explicitEnabled !== false : false,
    paused_at: settings?.paused_at ?? settings?.pausedAt ?? "",
    last_reminder_sent_date: settings?.last_reminder_sent_date ?? settings?.lastReminderSentDate ?? "",
    last_reminder_signature: settings?.last_reminder_signature ?? settings?.lastReminderSignature ?? "",
    snoozes,
  };
}

function normaliseSnapshotMetricNames(metricNames, profileId = null) {
  const requested = Array.isArray(metricNames) ? metricNames : [];
  const availableMetrics = profileId ? getTrackedMetricsForProfile(profileId) : metrics;
  const validNames = new Set(availableMetrics.map((item) => item.name));
  const selected = [];
  [...requested, ...defaultSnapshotMetricNames, ...availableMetrics.map((item) => item.name)].forEach((name) => {
    if (!validNames.has(name) || selected.includes(name)) return;
    selected.push(name);
  });
  return selected.slice(0, 4);
}

function isMetricAvailableForProfile(selectedMetric, profileId) {
  if (!selectedMetric) return false;
  if (!profileId || !Array.isArray(selectedMetric.profileIds) || !selectedMetric.profileIds.length) return true;
  return selectedMetric.profileIds.includes(profileId);
}

function getMetricTrackingStatus(profileId, metricName) {
  if (!profileId || !metricName) return TRACKING_ACTIVE;
  return state.settings?.metric_tracking_by_profile?.[profileId]?.[metricName] === TRACKING_NOT_TRACKED
    ? TRACKING_NOT_TRACKED
    : TRACKING_ACTIVE;
}

function isMetricTrackedForProfile(selectedMetric, profileId) {
  if (!isMetricAvailableForProfile(selectedMetric, profileId)) return false;
  return getMetricTrackingStatus(profileId, selectedMetric.name) !== TRACKING_NOT_TRACKED;
}

function setMetricTrackingStatus(profileId, metricName, status) {
  state.settings.metric_tracking_by_profile ??= {};
  state.settings.metric_tracking_by_profile[profileId] ??= {};
  if (status === TRACKING_NOT_TRACKED) {
    state.settings.metric_tracking_by_profile[profileId][metricName] = TRACKING_NOT_TRACKED;
    delete state.scheduleState.snoozes[getSnoozeKey(profileId, metricName)];
  } else {
    delete state.settings.metric_tracking_by_profile[profileId][metricName];
    if (!Object.keys(state.settings.metric_tracking_by_profile[profileId]).length) {
      delete state.settings.metric_tracking_by_profile[profileId];
    }
  }
  saveSettings();
  saveScheduleState();
}

function getMetricsForProfile(profileId = getSelectedProfile()?.id ?? state.activeProfileId ?? cloudState.profileId ?? null) {
  return metrics.filter((item) => isMetricAvailableForProfile(item, profileId));
}

function getTrackedMetricsForProfile(profileId = getSelectedProfile()?.id ?? state.activeProfileId ?? cloudState.profileId ?? null) {
  return metrics.filter((item) => isMetricTrackedForProfile(item, profileId));
}

function saveSettings() {
  state.settings = normaliseSettings(state.settings);
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
  markLocalUpdated();
}

function loadResults(profiles = state.profiles) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    return recalculateDerivedFields(stored.map((result) => normaliseResult(result, profiles)), profiles);
  } catch {
    return [];
  }
}

function saveResults() {
  state.results = recalculateDerivedFields(state.results.map((result) => normaliseResult(result)));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.results));
  markLocalUpdated();
}

function markLocalUpdated() {
  localStorage.setItem(LAST_LOCAL_UPDATE_KEY, new Date().toISOString());
  scheduleCloudSave();
  renderSyncFooter();
}

function getSupabaseConfig() {
  const config = window.HEALTH_TRACKER_SUPABASE ?? {};
  const url = String(config.url ?? "").trim();
  const anonKey = String(config.anonKey ?? "").trim();
  if (!url || !anonKey || url.includes("YOUR-PROJECT") || anonKey.includes("YOUR_PUBLIC")) return null;
  return { url, anonKey };
}

function getAuthRedirectUrl() {
  const currentUrl = new URL(window.location.href);
  if (currentUrl.origin === "https://benashy.github.io" && currentUrl.pathname.startsWith("/health-tracker")) {
    return PRODUCTION_AUTH_REDIRECT_URL;
  }
  if (currentUrl.hostname === "localhost" || currentUrl.hostname === "127.0.0.1") {
    return PRODUCTION_AUTH_REDIRECT_URL;
  }
  const cleanPath = currentUrl.pathname.replace(/index\.html$/i, "");
  return `${currentUrl.origin}${cleanPath || "/"}`;
}

function getAuthRedirectMessage() {
  const rawParams = window.location.hash ? window.location.hash.slice(1) : window.location.search.slice(1);
  if (!rawParams) return "";
  const params = new URLSearchParams(rawParams);
  const errorCode = params.get("error_code") ?? "";
  const description = params.get("error_description") ?? params.get("error") ?? "";
  if (!description) return "";
  const lowerMessage = `${errorCode} ${description}`.toLowerCase();
  if (lowerMessage.includes("otp_expired") || lowerMessage.includes("expired")) {
    return "That magic link is invalid or has expired. Request a fresh link and open the newest email.";
  }
  return description.replaceAll("+", " ");
}

function initSupabase() {
  const config = getSupabaseConfig();
  if (!config || !window.supabase?.createClient) {
    setPrivateVisibility(false);
    renderAuthPanel();
    renderSyncFooter();
    return;
  }

  cloudState.enabled = true;
  cloudState.client = window.supabase.createClient(config.url, config.anonKey);
  renderAuthPanel();
  renderSyncFooter();

  cloudState.client.auth.onAuthStateChange((_event, session) => {
    handleSession(session);
  });

  cloudState.client.auth.getSession().then(({ data, error }) => {
    if (error) throw error;
    return handleSession(data.session);
  }).catch((error) => {
    cloudState.lastError = error.message;
    setPrivateVisibility(false);
    renderAuthPanel();
    renderSyncFooter();
  });
}

async function handleSession(session) {
  const sessionUser = session?.user ?? null;
  const approvedUser = sessionUser && isApprovedUser(sessionUser);
  cloudState.session = approvedUser ? session : null;
  cloudState.user = approvedUser ? sessionUser : null;
  cloudState.profileId = cloudState.user ? getProfileIdForUser(cloudState.user) : null;
  cloudState.conflict = false;
  cloudState.lastError = "";

  if (sessionUser && !approvedUser) {
    resetPrivateStateForSignedOut();
    clearPrivateLocalData();
    renderAuthPanel();
    authStatus.textContent = "This signed-in account is not authorised for this private health dashboard.";
    renderSyncFooter();
    setEditingAvailability();
    render();
    await cloudState.client.auth.signOut();
    return;
  }

  if (!cloudState.user) {
    cloudState.cloudUpdatedAt = null;
    cloudState.loadedAt = null;
    resetPrivateStateForSignedOut();
    renderAuthPanel();
    renderSyncFooter();
    setEditingAvailability();
    render();
    return;
  }

  authEmail.value = cloudState.user.email ?? "";
  await loadCloudData();
}

function getProfileIdForUser(user) {
  const email = String(user.email ?? "").toLowerCase();
  if (email.includes("angelika") || email.includes("kleczka")) return "angelika";
  return "ben";
}

function isApprovedUser(user) {
  return APPROVED_EMAILS.has(String(user?.email ?? "").toLowerCase());
}

function clearPrivateLocalData() {
  PRIVATE_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

function resetPrivateStateForSignedOut() {
  if (!hasPrivateCloudConfig) return;
  state.profiles = normaliseProfiles(defaultProfiles);
  state.results = [];
  state.metricRanges = {};
  state.scheduleState = { snoozes: {} };
  state.settings = normaliseSettings({});
  state.activeProfileId = null;
  state.activeSummaryFilter = "";
  state.filter = "latest";
  state.editingProfiles = false;
  state.editingSnapshot = false;
  state.editingRangeKey = null;
  state.referenceDraftKey = null;
  state.mobileView = "home";
  state.vitaminsPanelOpen = false;
  state.pendingImport = null;
  hydrateProfileForm();
  populatePeople();
  populateMetrics();
  populateTrendMetrics();
  setPrivateVisibility(false);
}

function getDefaultProfile(profileId) {
  return defaultProfiles.find((profile) => profile.id === profileId) ?? defaultProfiles[0];
}

function createFreshCloudData(profileId = cloudState.profileId ?? "ben") {
  return {
    data_version: DATA_VERSION,
    app_version: APP_VERSION,
    profiles: [getDefaultProfile(profileId)],
    measurements: [],
    reference_ranges: {},
    schedule_state: { snoozes: {} },
    imports: [],
    settings: normaliseSettings({}),
    exported_at: new Date().toISOString(),
  };
}

function serializeDashboardData() {
  return {
    data_version: DATA_VERSION,
    app_version: APP_VERSION,
    profiles: state.profiles,
    measurements: recalculateDerivedFields(state.results),
    reference_ranges: state.metricRanges,
    schedule_state: state.scheduleState,
    imports: [],
    settings: {
      ...state.settings,
      active_profile_id: state.activeProfileId,
    },
    exported_at: new Date().toISOString(),
  };
}

function applyDashboardData(data) {
  const profileId = cloudState.profileId ?? "ben";
  const fallback = [getDefaultProfile(profileId)];
  const profiles = Array.isArray(data?.profiles) && data.profiles.length ? data.profiles : fallback;
  state.profiles = normaliseProfiles(profiles, false, profileId);
  state.results = recalculateDerivedFields((data?.measurements ?? data?.results ?? []).map((result) => normaliseResult(result, state.profiles)), state.profiles);
  state.metricRanges = normaliseMetricRanges(data?.reference_ranges ?? data?.metricRanges ?? {});
  state.scheduleState = data?.schedule_state ?? data?.scheduleState ?? { snoozes: {} };
  state.settings = normaliseSettings(data?.settings ?? {});
  state.activeProfileId = profileId;
  state.editingProfiles = !profilesAreComplete(state.profiles);
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.profiles));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.results));
  localStorage.setItem(RANGE_STORAGE_KEY, JSON.stringify(state.metricRanges));
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(state.scheduleState));
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
  localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(data ?? createFreshCloudData(profileId)));
}

async function loadCloudData() {
  if (!cloudState.client || !cloudState.user) return;
  if (!navigator.onLine) {
    if (!loadCachedCloudData()) setPrivateVisibility(false);
    renderAuthPanel();
    renderSyncFooter();
    setEditingAvailability();
    return;
  }

  cloudState.applyingCloudData = true;
  try {
    const { data, error } = await cloudState.client
      .from(CLOUD_TABLE)
      .select("data, updated_at")
      .eq("user_id", cloudState.user.id)
      .maybeSingle();
    if (error) throw error;

    let row = data;
    if (!row) row = await createCloudRow();

    cloudState.cloudUpdatedAt = row.updated_at;
    cloudState.loadedAt = new Date().toISOString();
    cloudState.conflict = false;
    applyDashboardData(row.data);
    hydrateProfileForm();
    populatePeople();
    populateMetrics();
    populateTrendMetrics();
    setPrivateVisibility(true);
    render();
  } catch (error) {
    cloudState.lastError = error.message;
    if (!loadCachedCloudData()) setPrivateVisibility(false);
  } finally {
    cloudState.applyingCloudData = false;
    renderAuthPanel();
    renderSyncFooter();
    setEditingAvailability();
  }
}

async function createCloudRow() {
  const nextUpdatedAt = new Date().toISOString();
  const initialData = createFreshCloudData();
  const { data, error } = await cloudState.client
    .from(CLOUD_TABLE)
    .insert({ user_id: cloudState.user.id, data: initialData, updated_at: nextUpdatedAt })
    .select("data, updated_at")
    .single();
  if (error) throw error;
  return data;
}

function loadCachedCloudData() {
  try {
    const cached = JSON.parse(localStorage.getItem(CLOUD_CACHE_KEY));
    if (!cached) return false;
    applyDashboardData(cached);
    hydrateProfileForm();
    populatePeople();
    populateMetrics();
    populateTrendMetrics();
    setPrivateVisibility(true);
    render();
    return true;
  } catch {
    return false;
  }
}

function scheduleCloudSave() {
  if (!cloudState.enabled || !cloudState.user || cloudState.applyingCloudData) return;
  if (isReadOnlyMode()) return;
  if (typeof clearTimeout === "function") clearTimeout(cloudState.saveTimer);
  if (typeof setTimeout === "function") {
    cloudState.saveTimer = setTimeout(() => saveCloudData(), 450);
  }
}

async function saveCloudData() {
  if (!cloudState.client || !cloudState.user || cloudState.saving || isReadOnlyMode()) return false;
  cloudState.saving = true;
  cloudState.lastError = "";
  renderSyncFooter();

  try {
    const nextUpdatedAt = new Date().toISOString();
    const nextDashboardData = serializeDashboardData();
    const { data, error } = await cloudState.client
      .from(CLOUD_TABLE)
      .update({ data: nextDashboardData, updated_at: nextUpdatedAt })
      .eq("user_id", cloudState.user.id)
      .eq("updated_at", cloudState.cloudUpdatedAt)
      .select("updated_at")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      cloudState.conflict = true;
      cloudState.lastError = "Cloud changed on another device. Tap Refresh before saving again.";
      setEditingAvailability();
      window.alert(cloudState.lastError);
      return false;
    }

    cloudState.cloudUpdatedAt = data.updated_at;
    cloudState.loadedAt = new Date().toISOString();
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(nextDashboardData));
    return true;
  } catch (error) {
    cloudState.lastError = error.message;
    return false;
  } finally {
    cloudState.saving = false;
    renderSyncFooter();
  }
}

async function flushCloudSaveNow() {
  if (!cloudState.enabled || !cloudState.user) return true;
  if (typeof clearTimeout === "function" && cloudState.saveTimer) clearTimeout(cloudState.saveTimer);
  cloudState.saveTimer = null;
  return saveCloudData();
}

function isReadOnlyMode() {
  return cloudState.enabled && cloudState.user && (!navigator.onLine || cloudState.conflict);
}

function assertCanEdit() {
  if (!isReadOnlyMode()) return true;
  const message = cloudState.conflict
    ? "Cloud changed on another device. Tap Refresh before saving again."
    : "Offline: viewing saved data. Editing requires internet.";
  window.alert(message);
  return false;
}

function setEditingAvailability() {
  const disabled = isReadOnlyMode();
  [
    profileForm,
    form,
    importChatGptButton,
    exportCsvButton,
    exportChatGptButton,
    exportReviewPackButton,
    trackingToggleButton,
    snapshotEditor,
    snapshotEditButton,
    telegramOpenButton,
    telegramPairButton,
    telegramCheckButton,
    telegramTestButton,
    telegramDueTestButton,
    telegramPauseButton,
    telegramDisconnectButton,
    vitaminsOpenButton,
    resetButton,
  ].forEach((element) => {
    if (element) element.classList.toggle("read-only", disabled);
  });
  document.querySelectorAll("#profileForm input, #profileForm button, #resultForm input, #resultForm select, #resultForm textarea, #resultForm button, #snapshotEditor select, #snapshotEditor button").forEach((element) => {
    element.disabled = disabled;
  });
  document.querySelectorAll("#vitaminsPanel input, #vitaminsPanel select").forEach((element) => {
    element.disabled = disabled;
  });
  if (entrySubmitButton) entrySubmitButton.disabled = disabled || state.entrySaveLocked;
  if (trackingToggleButton) trackingToggleButton.disabled = disabled;
  importChatGptButton.disabled = disabled;
  if (snapshotEditButton) snapshotEditButton.disabled = disabled;
  if (telegramPairButton) telegramPairButton.disabled = disabled || telegramSetupState.busy;
  if (telegramCheckButton) telegramCheckButton.disabled = disabled || telegramSetupState.busy || !telegramSetupState.pairingCode;
  if (telegramTestButton) telegramTestButton.disabled = disabled || telegramSetupState.busy || !getTelegramSettings().chat_id;
  if (telegramDueTestButton) telegramDueTestButton.disabled = disabled || telegramSetupState.busy || !getTelegramSettings().chat_id;
  if (telegramPauseButton) telegramPauseButton.disabled = disabled || telegramSetupState.busy || !getTelegramSettings().chat_id;
  if (telegramDisconnectButton) telegramDisconnectButton.disabled = disabled || telegramSetupState.busy || !getTelegramSettings().chat_id;
  if (resetButton) resetButton.disabled = disabled;
  if (!disabled && metricInput.value) {
    syncRangeDefaults();
    syncSourceDefaults();
  }
}

function renderAuthPanel() {
  const signedIn = Boolean(cloudState.user);
  authPanel.classList.toggle("hidden", signedIn);
  authForm.classList.toggle("hidden", signedIn || !cloudState.enabled);
  if (!cloudState.enabled) {
    authStatus.textContent = "Private sign-in is not configured in this local copy.";
    return;
  }

  authForm.classList.toggle("hidden", signedIn);
  authStatus.textContent = signedIn
    ? `Signed in as ${cloudState.user.email}.`
    : authRedirectMessage || "Sign in to access your private dashboard.";
}

function renderProfileScope() {
  const profileId = cloudState.user ? cloudState.profileId : null;
  document.querySelectorAll("[data-profile-fieldset]").forEach((fieldset) => {
    fieldset.classList.toggle("hidden", Boolean(profileId) && fieldset.dataset.profileFieldset !== profileId);
  });
}

function setPrivateVisibility(isVisible) {
  document.body.classList.remove("app-booting");
  document.querySelectorAll("[data-private]").forEach((section) => {
    if (section.id === "telegramModal") {
      if (!isVisible) state.telegramPanelOpen = false;
      syncTelegramPanelVisibility(isVisible);
      return;
    }
    if (section.id === "vitaminsModal") {
      if (!isVisible) state.vitaminsPanelOpen = false;
      syncVitaminsPanelVisibility(isVisible);
      return;
    }
    if (section.classList.contains("modal")) {
      if (!isVisible) {
        section.classList.add("hidden");
        section.setAttribute("aria-hidden", "true");
      }
      return;
    }
    section.classList.toggle("hidden", !isVisible);
    section.setAttribute("aria-hidden", isVisible ? "false" : "true");
  });
  document.body.classList.toggle("signed-in", isVisible);
}

function renderSyncFooter() {
  appVersion.textContent = APP_VERSION;
  if (cloudState.enabled && cloudState.user) {
    const label = cloudState.saving
      ? "Saving..."
      : cloudState.lastError
        ? cloudState.lastError
        : cloudState.loadedAt
          ? `Updated ${formatRelativeTime(cloudState.loadedAt)}`
          : "Cloud connected";
    const modeText = navigator.onLine ? "Cloud sync" : "Offline: viewing saved data";
    syncStatus.textContent = `${label} · ${modeText}`;
    syncStatus.className = `sync-status ${cloudState.lastError || cloudState.conflict ? "error" : navigator.onLine ? "ok" : "warn"}`;
    syncStatus.classList.remove("hidden");
    manualRefreshButton.classList.remove("hidden");
    manualRefreshButton.disabled = false;
    document.querySelector(".account-sync-footer")?.classList.remove("signed-out-footer");
    signOutButton.classList.remove("hidden");
    signOutButton.disabled = false;
    signOutButton.title = "Sign out of this private account.";
    return;
  }

  syncStatus.textContent = "";
  syncStatus.className = "sync-status hidden";
  manualRefreshButton.classList.add("hidden");
  manualRefreshButton.disabled = true;
  document.querySelector(".account-sync-footer")?.classList.add("signed-out-footer");
  signOutButton.classList.add("hidden");
  signOutButton.disabled = true;
  signOutButton.title = "";
}

function formatRelativeTime(isoDate) {
  const elapsedMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(0, Math.floor(elapsedMs / 60000));
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function normaliseResult(result, profiles = state.profiles) {
  const profileId = result.profile_id === "angelica" ? "angelika" : result.profile_id;
  const profile = profiles.find((item) => item.id === profileId) ?? profiles[0];
  const selectedMetric = getMetric(result.metric, profile?.id);
  const metricMeta = getMetricMeta(result.metric);
  const sourceType = result.source_type ?? getDefaultSourceType(result.metric);
  const migratedTarget = isTargetMetric(result.metric) && result.target_value === undefined;
  const low = parseLimit(result.reference_lower_limit);
  const target = parseLimit(result.target_value ?? (migratedTarget ? result.reference_upper_limit : null));
  const high = parseLimit(migratedTarget ? null : result.reference_upper_limit);
  const referenceFields = normaliseReferenceFields(result.reference_fields, selectedMetric, { low, target, high });
  return {
    ...result,
    profile_id: profile.id,
    person_name: profile.name,
    reference_lower_limit: referenceFields.lower ? low : null,
    target_value: referenceFields.target ? target : null,
    reference_upper_limit: referenceFields.upper ? high : null,
    reference_fields: referenceFields,
    priority: result.priority ?? metricMeta.priority,
    cadence: result.cadence ?? metricMeta.cadence,
    interval_days: result.interval_days ?? metricMeta.intervalDays,
    trend_goal: result.trend_goal ?? metricMeta.goal,
    source_type: sourceType,
    source_confidence: result.source_confidence ?? getSourceConfidence(sourceType),
    source_notes: result.source_notes ?? "",
    linked_source_document: result.linked_source_document ?? "",
  };
}

function populatePeople() {
  personInput.innerHTML = state.profiles
    .map((profile) => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.name)}</option>`)
    .join("");
  personField.classList.toggle("single-profile", state.profiles.length === 1);
  if (state.activeProfileId && getProfile(state.activeProfileId)) {
    personInput.value = state.activeProfileId;
  } else if (state.profiles.length === 1) {
    personInput.value = state.profiles[0].id;
  }
}

function populateTrendMetrics() {
  const availableMetrics = getTrackedMetricsForProfile();
  trendMetricInput.innerHTML = availableMetrics
    .map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`)
    .join("");
  if (!availableMetrics.some((item) => item.name === state.activeTrendKey)) state.activeTrendKey = availableMetrics[0]?.name ?? "";
  trendMetricInput.value = state.activeTrendKey;
}

function hydrateProfileForm() {
  state.profiles.forEach((profile) => {
    document.querySelector(`#${profile.id}Name`).value = profile.name;
    document.querySelector(`#${profile.id}Dob`).value = profile.date_of_birth;
    document.querySelector(`#${profile.id}Height`).value = profile.height_cm;
  });
}

function renderProfiles() {
  const profileFormHidden = !state.editingProfiles && profilesAreComplete(state.profiles);
  profileForm.classList.toggle("hidden", profileFormHidden);
  if (profileSection) profileSection.classList.toggle("details-only", profileFormHidden);
  renderProfileScope();
  const allPeopleCard = cloudState.user
    ? ""
    : `
    <article class="profile-card ${state.activeProfileId === null ? "active" : ""}" data-profile-id="">
      <strong>All people</strong>
      <span>Show Ben and Angelika together</span>
      <span>${state.results.length} measurements</span>
    </article>
  `;
  profileCards.innerHTML = `
    ${allPeopleCard}
    ${state.profiles
      .map((profile) => {
        const count = state.results.filter((result) => result.profile_id === profile.id).length;
        return `
          <article class="profile-card ${state.activeProfileId === profile.id ? "active" : ""}" data-profile-id="${escapeHtml(profile.id)}">
            <div class="profile-card-top">
              <strong>${escapeHtml(profile.name)}</strong>
              <button class="mini-button" type="button" data-edit-profile="${escapeHtml(profile.id)}">Edit</button>
            </div>
            <span>Date of birth: ${profile.date_of_birth ? formatDate(profile.date_of_birth) : "not set"}</span>
            <span>Age: ${profile.date_of_birth ? calculateAge(profile.date_of_birth) : "-"}</span>
            <span>Height: ${profile.height_cm ? `${escapeHtml(profile.height_cm)} cm` : "not set"}</span>
            <span>${count} measurements</span>
          </article>
        `;
      })
      .join("")}
  `;
}

function populateMetrics() {
  const selectedValue = metricInput.value;
  const availableMetrics = getMetricsForProfile();
  const filteredGroups = groupBy(availableMetrics, "group");
  metricInput.innerHTML = Object.entries(filteredGroups)
    .sort(([groupA], [groupB]) => compareMetricInputGroups(groupA, groupB))
    .map(([group, groupMetrics]) => {
      const options = groupMetrics
        .map((item) => {
          const isTracked = isMetricTrackedForProfile(item, getSelectedProfile()?.id);
          const label = isTracked ? item.name : `${item.name} (not tracked)`;
          return `<option value="${escapeHtml(item.name)}">${escapeHtml(label)}</option>`;
        })
        .join("");
      return `<optgroup label="${escapeHtml(group)}">${options}</optgroup>`;
    })
    .join("");
  if (availableMetrics.some((item) => item.name === selectedValue)) {
    metricInput.value = selectedValue;
  } else if (availableMetrics.length) {
    metricInput.value = availableMetrics[0].name;
  }
  syncMetricDefaults();
  renderQuickMetrics();
}

function compareMetricInputGroups(groupA, groupB) {
  const indexA = getMetricInputGroupIndex(groupA);
  const indexB = getMetricInputGroupIndex(groupB);
  return indexA - indexB || groupA.localeCompare(groupB);
}

function getMetricInputGroupIndex(group) {
  const index = metricInputGroupOrder.indexOf(group);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function renderQuickMetrics() {
  quickMetricPanel.innerHTML = getQuickMetricNames()
    .map((name) => `
      <button class="quick-metric-button ${metricInput.value === name ? "active" : ""}" data-metric-name="${escapeHtml(name)}" type="button">
        ${escapeHtml(name)}
      </button>
    `)
    .join("");
}

function getQuickMetricNames() {
  const profileId = getSelectedProfile()?.id ?? state.activeProfileId ?? cloudState.profileId ?? null;
  return starterMetricNames.filter((name) => {
    const selectedMetric = getMetric(name, profileId);
    return selectedMetric && isMetricTrackedForProfile(selectedMetric, profileId);
  });
}

function selectMetric(name) {
  const profileId = getSelectedProfile()?.id ?? state.activeProfileId ?? cloudState.profileId ?? null;
  if (!getMetric(name, profileId)) return;
  metricSearchInput.value = "";
  populateMetrics();
  metricInput.value = name;
  syncMetricDefaults();
  renderQuickMetrics();
}

function renderTrackingControl(selectedMetric, profile) {
  if (!trackingControl || !trackingStatusText || !trackingToggleButton) return;
  if (!selectedMetric || !profile) {
    trackingControl.classList.add("hidden");
    return;
  }
  const isTracked = isMetricTrackedForProfile(selectedMetric, profile.id);
  trackingControl.classList.remove("hidden");
  trackingControl.classList.toggle("not-tracked", !isTracked);
  trackingStatusText.textContent = isTracked
    ? `Tracked for ${profile.name}`
    : `Not tracked for ${profile.name}`;
  trackingToggleButton.textContent = isTracked ? "Stop tracking" : "Track again";
  trackingToggleButton.disabled = isReadOnlyMode();
  form.classList.toggle("metric-not-tracked", !isTracked);
}

function syncMetricDefaults() {
  const profile = getSelectedProfile();
  const selectedMetric = getMetric(metricInput.value, profile?.id);
  if (!selectedMetric || !profile) return;
  const isTracked = isMetricTrackedForProfile(selectedMetric, profile.id);
  renderTrackingControl(selectedMetric, profile);
  const isCompletion = isCompletionMetric(selectedMetric);
  state.completionNextDueTouched = false;
  unitInput.value = selectedMetric.unit;
  valueInput.type = selectedMetric.type === "numeric" ? "number" : "text";
  valueInput.step = selectedMetric.type === "numeric" ? "0.01" : "";
  valueInput.inputMode = selectedMetric.type === "numeric" ? "decimal" : "text";
  valueInput.placeholder =
    selectedMetric.type === "numeric" ? "Result value" : `e.g. ${selectedMetric.placeholder ?? selectedMetric.normal ?? "Normal"}`;
  valueInput.required = !isCompletion;
  if (dateLabelText) dateLabelText.textContent = isCompletion ? "Completed date" : "Date";
  if (valueFields) valueFields.classList.toggle("hidden", isCompletion);
  if (completionPanel) completionPanel.classList.toggle("hidden", !isCompletion);
  if (completionInput) {
    completionInput.checked = isCompletion;
    completionInput.required = isCompletion;
  }
  if (nextDueLabel) nextDueLabel.textContent = selectedMetric.nextDueLabel ?? "Next due date";
  if (nextDueInput) {
    nextDueInput.required = Boolean(isCompletion);
    nextDueInput.disabled = !isCompletion;
    nextDueInput.value = isCompletion ? getCompletionNextDueInputValue(selectedMetric, testDateInput.value) : "";
  }
  if (nextDueField) nextDueField.classList.toggle("hidden", !isCompletion);
  if (completionHint) completionHint.textContent = getCompletionHint(selectedMetric, testDateInput.value);
  syncRangeDefaults();
  syncSourceDefaults();
  renderEntryAssist();
  if (entrySubmitButton) {
    entrySubmitButton.textContent = isTracked ? "Add to tracker" : "Not tracked";
    entrySubmitButton.disabled = !isTracked || isReadOnlyMode() || state.entrySaveLocked;
  }
}

function getDefaultSourceType(metricName) {
  if (manualSourceMetrics.has(metricName)) return "Manual Measurement";
  if (wearableSourceMetrics.has(metricName)) return "Wearable Estimate";
  if (clinicianSourceMetrics.has(metricName)) return "Clinician Report";
  return "Lab Report / PDF";
}

function getSourceConfidence(sourceType) {
  return sourceConfidenceByType[sourceType] ?? "Medium";
}

function syncSourceDefaults() {
  const selectedMetric = getMetric(metricInput.value, getSelectedProfile()?.id);
  if (!selectedMetric) return;
  sourceTypeInput.value = getDefaultSourceType(selectedMetric.name);
  syncSourceConfidence();
}

function syncSourceConfidence() {
  sourceConfidenceInput.value = getSourceConfidence(sourceTypeInput.value);
}

function renderEntryAssist() {
  if (!entryAssist) return;
  const profile = getSelectedProfile();
  const selectedMetric = getMetric(metricInput.value, profile?.id);
  if (!selectedMetric || !profile) {
    entryAssist.innerHTML = "";
    return;
  }

  if (!isMetricTrackedForProfile(selectedMetric, profile.id)) {
    entryAssist.innerHTML = `
      <div>
        <strong>${escapeHtml(selectedMetric.name)} is not tracked</strong>
        <span>Use Track again to include it in results, trends, due checks, and reminders.</span>
      </div>
    `;
    return;
  }

  if (isCompletionMetric(selectedMetric)) {
    const nextDueText = `${selectedMetric.nextDueLabel ?? "Next due date"} defaults to ${getCompletionIntervalLabel(selectedMetric)} after completion; edit if needed`;
    entryAssist.innerHTML = `
      <div>
        <strong>${escapeHtml(getDisplayGroupForMetric(selectedMetric.name))}</strong>
        <span>${escapeHtml(selectedMetric.cadence)} · ${escapeHtml(nextDueText)}</span>
      </div>
    `;
    return;
  }

  const savedRange = getSavedRange(profile.id, selectedMetric.name);
  const fields = savedRange?.fields ?? getDefaultReferenceFields(selectedMetric);
  const rangeLabel = getReferenceSetupLabel(fields);
  const rangeText = savedRange
    ? formatRangeOrTarget({
        metric: selectedMetric.name,
        unit: selectedMetric.unit,
        reference_lower_limit: savedRange.low,
        target_value: savedRange.target,
        reference_upper_limit: savedRange.high,
      })
    : "set on first entry";

  entryAssist.innerHTML = `
    <div>
      <strong>${escapeHtml(getDisplayGroupForMetric(selectedMetric.name))}</strong>
      <span>${escapeHtml(selectedMetric.cadence)} · ${escapeHtml(rangeLabel)} ${escapeHtml(rangeText)}</span>
    </div>
  `;
}

function isCompletionMetric(metricOrName) {
  const selectedMetric = typeof metricOrName === "string" ? getMetric(metricOrName) : metricOrName;
  return Boolean(selectedMetric?.entryMode === "completion" || completionMetricNames.has(selectedMetric?.name));
}

function getCompletionNextDueInputValue(selectedMetric, completedDate) {
  if (!isCompletionMetric(selectedMetric)) return "";
  const nextDueDate = getAutoCompletionNextDueDate(selectedMetric, completedDate);
  return nextDueDate ?? "";
}

function getAutoCompletionNextDueDate(selectedMetric, completedDate) {
  if (!selectedMetric?.intervalMonths || !completedDate) return "";
  const date = parseDateString(completedDate);
  return date ? toDateString(addMonths(date, selectedMetric.intervalMonths)) : "";
}

function getCompletionIntervalLabel(selectedMetric) {
  if (!selectedMetric?.intervalMonths) return selectedMetric?.cadence ?? "the next cycle";
  if (selectedMetric.intervalMonths === 12) return "one year";
  if (selectedMetric.intervalMonths === 24) return "two years";
  if (selectedMetric.intervalMonths % 12 === 0) return `${selectedMetric.intervalMonths / 12} years`;
  return `${selectedMetric.intervalMonths} months`;
}

function getCompletionHint(selectedMetric, completedDate) {
  if (!isCompletionMetric(selectedMetric)) return "";
  const nextDueDate = getAutoCompletionNextDueDate(selectedMetric, completedDate);
  const label = selectedMetric.nextDueLabel ?? "Next due date";
  return nextDueDate
    ? `${label} defaults to ${formatDate(nextDueDate)}; edit if the actual date differs.`
    : `Record the completion date; ${label.toLowerCase()} will default from it.`;
}

function getCompletionResultNextDueDate(selectedMetric, completedDate) {
  if (!isCompletionMetric(selectedMetric)) return "";
  return nextDueInput?.value || getAutoCompletionNextDueDate(selectedMetric, completedDate);
}

function toggleSelectedMetricTracking() {
  if (!assertCanEdit()) return;
  const profile = getSelectedProfile();
  const selectedMetric = getMetric(metricInput.value, profile?.id);
  if (!profile || !selectedMetric) return;
  const isTracked = isMetricTrackedForProfile(selectedMetric, profile.id);
  if (isTracked) {
    const confirmed = window.confirm(
      `Stop tracking ${selectedMetric.name} for ${profile.name}? Existing entries stay saved, but this metric will be hidden from active results, trends, due lists, and Telegram reminders until you track it again.`,
    );
    if (!confirmed) return;
  }

  setMetricTrackingStatus(profile.id, selectedMetric.name, isTracked ? TRACKING_NOT_TRACKED : TRACKING_ACTIVE);
  if (isTracked && state.activeTrendKey === selectedMetric.name) state.activeTrendKey = "";
  populateMetrics();
  metricInput.value = selectedMetric.name;
  populateTrendMetrics();
  syncMetricDefaults();
  renderQuickMetrics();
  render();
}

function getResultStoredNextDueDate(result) {
  return result?.next_due_date ?? result?.nextDueDate ?? result?.expiry_date ?? result?.expiryDate ?? "";
}

function syncCompletionDueFields() {
  const selectedMetric = getMetric(metricInput.value, getSelectedProfile()?.id);
  if (!isCompletionMetric(selectedMetric)) return;
  if (nextDueInput && !state.completionNextDueTouched) {
    nextDueInput.value = getCompletionNextDueInputValue(selectedMetric, testDateInput.value);
  }
  if (completionHint) completionHint.textContent = getCompletionHint(selectedMetric, testDateInput.value);
}

function getMetric(name, profileId = null) {
  const selectedMetric = metrics.find((item) => item.name === name);
  return isMetricAvailableForProfile(selectedMetric, profileId) ? selectedMetric : null;
}

function getProfile(id) {
  return state.profiles.find((profile) => profile.id === id);
}

function getSelectedProfile() {
  return getProfile(personInput.value) ?? state.profiles[0];
}

function getRangeKey(profileId, metricName) {
  return `${profileId}:${metricName}`;
}

function getSavedRange(profileId, metricName) {
  const saved = state.metricRanges[getRangeKey(profileId, metricName)];
  return saved ? normaliseSavedRange(saved, metricName) : null;
}

function normaliseMetricRanges(ranges = {}) {
  return Object.fromEntries(
    Object.entries(ranges ?? {}).map(([key, range]) => {
      const metricName = key.split(":").slice(1).join(":");
      return [key, normaliseSavedRange(range, metricName)];
    }),
  );
}

function normaliseSavedRange(range = {}, metricName = "") {
  const selectedMetric = getMetric(metricName);
  const migratedTarget = isTargetMetric(metricName) && range.target === undefined && range.target_value === undefined;
  const low = parseLimit(range.low ?? range.reference_lower_limit);
  const target = parseLimit(range.target ?? range.target_value ?? (migratedTarget ? range.high ?? range.reference_upper_limit : null));
  const high = parseLimit(migratedTarget ? null : range.high ?? range.reference_upper_limit);
  const fields = normaliseReferenceFields(range.fields ?? range.reference_fields, selectedMetric, { low, target, high });

  return {
    low: fields.lower ? low : null,
    target: fields.target ? target : null,
    high: fields.upper ? high : null,
    fields,
    updated_at: range.updated_at ?? new Date().toISOString(),
  };
}

function getDefaultReferenceFields(selectedMetric, values = {}) {
  if (!selectedMetric) return { lower: false, target: false, upper: false };
  if (isCompletionMetric(selectedMetric)) return { lower: false, target: false, upper: false };
  return {
    lower: values.low !== null && values.low !== undefined ? true : !isTargetMetric(selectedMetric.name) && selectedMetric.low !== null,
    target: values.target !== null && values.target !== undefined ? true : isTargetMetric(selectedMetric.name),
    upper: values.high !== null && values.high !== undefined ? true : !isTargetMetric(selectedMetric.name) && selectedMetric.high !== null,
  };
}

function normaliseReferenceFields(fields = {}, selectedMetric, values = {}) {
  const defaults = getDefaultReferenceFields(selectedMetric, values);
  return {
    lower: fields.lower !== undefined ? Boolean(fields.lower) : fields.low !== undefined ? Boolean(fields.low) : defaults.lower,
    target: fields.target !== undefined ? Boolean(fields.target) : defaults.target,
    upper: fields.upper !== undefined ? Boolean(fields.upper) : fields.high !== undefined ? Boolean(fields.high) : defaults.upper,
  };
}

function setReferenceOptionValues(fields) {
  referenceLowerEnabled.checked = Boolean(fields.lower);
  targetEnabled.checked = Boolean(fields.target);
  referenceUpperEnabled.checked = Boolean(fields.upper);
}

function getReferenceOptionValues() {
  return {
    lower: Boolean(referenceLowerEnabled.checked),
    target: Boolean(targetEnabled.checked),
    upper: Boolean(referenceUpperEnabled.checked),
  };
}

function getReferenceSetupLabel(fields) {
  if (fields.target && (fields.lower || fields.upper)) return "Reference/target";
  if (fields.target) return "Target";
  if (fields.lower || fields.upper) return "Range";
  return "Recorded only";
}

function syncRangeDefaults() {
  const profile = getSelectedProfile();
  const selectedMetric = getMetric(metricInput.value, profile?.id);
  if (!selectedMetric || !profile) return;
  if (isCompletionMetric(selectedMetric)) {
    referencePanel?.classList.add("hidden");
    referenceOptions?.classList.add("hidden");
    lowField?.classList.add("hidden");
    targetField?.classList.add("hidden");
    highField?.classList.add("hidden");
    if (referenceLowerEnabled) referenceLowerEnabled.checked = false;
    if (targetEnabled) targetEnabled.checked = false;
    if (referenceUpperEnabled) referenceUpperEnabled.checked = false;
    if (lowInput) lowInput.value = "";
    if (targetInput) targetInput.value = "";
    if (highInput) highInput.value = "";
    state.editingRangeKey = null;
    state.referenceDraftKey = null;
    return;
  }
  referencePanel?.classList.remove("hidden");

  const key = getRangeKey(profile.id, selectedMetric.name);
  const savedRange = getSavedRange(profile.id, selectedMetric.name);
  const isEditing = state.editingRangeKey === key;
  const isConfiguring = isEditing || !savedRange;
  const defaultRange = {
    low: selectedMetric.low,
    target: null,
    high: isTargetMetric(selectedMetric.name) ? null : selectedMetric.high,
  };
  const range = savedRange ?? {
    ...defaultRange,
    fields: getDefaultReferenceFields(selectedMetric, defaultRange),
  };

  if (state.referenceDraftKey !== key || (!isConfiguring && state.referenceDraftKey === key)) {
    setReferenceOptionValues(range.fields);
    state.referenceDraftKey = key;
  }

  const fields = isConfiguring ? getReferenceOptionValues() : range.fields;
  const locked = Boolean(savedRange) && !isEditing;
  const lowValue = savedRange ? savedRange.low : defaultRange.low;
  const targetValue = savedRange ? savedRange.target : defaultRange.target;
  const highValue = savedRange ? savedRange.high : defaultRange.high;

  lowInput.value = fields.lower ? lowValue ?? "" : "";
  targetInput.value = fields.target ? targetValue ?? "" : "";
  highInput.value = fields.upper ? highValue ?? "" : "";
  lowField.classList.toggle("hidden", !fields.lower);
  targetField.classList.toggle("hidden", !fields.target);
  highField.classList.toggle("hidden", !fields.upper);
  referenceOptions.classList.toggle("hidden", !isConfiguring);
  lowLabel.textContent = "Reference lower limit";
  targetLabel.textContent = "Target";
  highLabel.textContent = "Reference upper limit";
  lowInput.disabled = locked || !fields.lower;
  targetInput.disabled = locked || !fields.target;
  highInput.disabled = locked || !fields.upper;
  referenceLowerEnabled.disabled = !isConfiguring;
  targetEnabled.disabled = !isConfiguring;
  referenceUpperEnabled.disabled = !isConfiguring;
  rangeEditButton.classList.toggle("hidden", !savedRange);
  rangeEditButton.textContent = isEditing ? "Lock fields" : "Edit fields";
  rangeHint.textContent = "";
  rangeHint.classList.add("hidden");
}

function isTargetMetric(metricName) {
  return targetMetricNames.has(metricName);
}

function visibleResults(results = state.results) {
  return results.filter((result) => {
    if (state.activeProfileId && result.profile_id !== state.activeProfileId) return false;
    const selectedMetric = getMetric(result.metric, result.profile_id);
    return selectedMetric ? isMetricTrackedForProfile(selectedMetric, result.profile_id) : true;
  });
}

function getMetricMeta(name) {
  const selectedMetric = getMetric(name) ?? {};
  return {
    priority: selectedMetric.priority ?? "medium",
    cadence: selectedMetric.cadence ?? "Every 12 months",
    intervalDays: selectedMetric.intervalDays ?? 365,
    goal: selectedMetric.goal ?? "context",
  };
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    groups[item[key]] ??= [];
    groups[item[key]].push(item);
    return groups;
  }, {});
}

function parseLimit(value) {
  if (value === null || value === undefined) return null;
  if (String(value).trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseResultValue(value, type) {
  const trimmed = String(value).trim();
  if (type === "qualitative") return trimmed;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function normaliseQualitative(value) {
  return String(value).trim().toLowerCase().replace(/\s*\([^)]*\)\s*/g, "").replace(/s$/, "");
}

function getStatus(result) {
  if (result.metric_type === "qualitative") {
    const selectedMetric = getMetric(result.metric);
    if (!selectedMetric?.normal) return "Recorded";
    return normaliseQualitative(result.result_value) === normaliseQualitative(selectedMetric.normal)
      ? "In range"
      : "Outside range";
  }

  const value = Number(result.result_value);
  const low = getResultReferenceLower(result);
  const target = getResultTarget(result);
  const high = getResultReferenceUpper(result);
  const rangeStatus = getReferenceRangeStatus(result.metric, value, low, high);
  if (rangeStatus === "Outside range" || rangeStatus === "Near limit") return rangeStatus;
  if (target !== null) return getTargetStatus(result, value, target);
  return rangeStatus ?? "Recorded";
}

function getResultReferenceLower(result) {
  return parseLimit(result.reference_lower_limit);
}

function getResultTarget(result) {
  return parseLimit(result.target_value ?? (isTargetMetric(result.metric) ? result.reference_upper_limit : null));
}

function getResultReferenceUpper(result) {
  if (result.target_value === undefined && isTargetMetric(result.metric)) return null;
  return parseLimit(result.reference_upper_limit);
}

function getTargetStatus(result, value, target) {
  if (isTargetMetric(result.metric)) {
    if (value > target) return "Above target";
    return value >= target - getTargetTolerance(result.metric) ? "On target" : "Below target";
  }

  const goal = result.trend_goal ?? getMetricMeta(result.metric).goal;
  if (goal === "higher") return value >= target ? "On target" : "Below target";
  return value <= target ? "On target" : "Above target";
}

function isWarningStatus(status) {
  return ["Outside range", "Near limit", "Above target", "Below target"].includes(status);
}

function isCautionStatus(status) {
  return ["Near limit", "Above target", "Below target"].includes(status);
}

function isRiskContextMetric(metricName) {
  return riskContextMetricNames.has(metricName);
}

function isRiskContextResult(result) {
  return result && isRiskContextMetric(result.metric);
}

function isActionableWarning(result) {
  return result && result.status_vs_range === "Outside range" && !isRiskContextResult(result);
}

function isActionableCaution(result) {
  return result && isCautionStatus(result.status_vs_range) && !isRiskContextResult(result);
}

function isActionableFlag(result) {
  return isActionableWarning(result) || isActionableCaution(result);
}

function getReferenceRangeStatus(metricName, value, low, high) {
  if (low === null && high === null) return null;
  if (low !== null && value < low) return isNearLimit(metricName, value, low, high) ? "Near limit" : "Outside range";
  if (high !== null && value > high) return isNearLimit(metricName, value, low, high) ? "Near limit" : "Outside range";
  return isNearLimit(metricName, value, low, high) ? "Near limit" : "In range";
}

function isNearLimit(metricName, value, low, high) {
  if (relaxedNearLimitMetrics.has(metricName)) return false;
  if (low === null && high === null) return false;
  if (low !== null && isWithinNearLimitBuffer(value, low)) return true;
  if (high !== null && isWithinNearLimitBuffer(value, high)) return true;
  return false;
}

function isWithinNearLimitBuffer(value, limit) {
  const buffer = Math.abs(limit) * NEAR_LIMIT_RATIO;
  if (buffer <= 0) return false;
  return Math.abs(value - limit) <= buffer + Number.EPSILON;
}

function getTargetTolerance() {
  return 1;
}

function getPreviousResult(result, allResults) {
  return allResults
    .filter((item) => item.id !== result.id && item.profile_id === result.profile_id && item.metric === result.metric)
    .filter((item) => {
      if (item.sample_date !== result.sample_date) return item.sample_date < result.sample_date;
      return item.test_date < result.test_date;
    })
    .sort((a, b) => {
      const sampleSort = b.sample_date.localeCompare(a.sample_date);
      return sampleSort || b.test_date.localeCompare(a.test_date);
    })[0];
}

function deriveChange(result, previous) {
  if (!previous) {
    return {
      previous_result: null,
      absolute_change_since_previous_test: null,
      percentage_change_since_previous_test: null,
      trend_direction: "first",
    };
  }

  if (result.metric_type === "qualitative") {
    const changed =
      normaliseQualitative(result.result_value) === normaliseQualitative(previous.result_value)
        ? "unchanged"
        : "changed";
    return {
      previous_result: previous.result_value,
      absolute_change_since_previous_test: changed,
      percentage_change_since_previous_test: changed,
      trend_direction: changed,
    };
  }

  const currentValue = Number(result.result_value);
  const previousValue = Number(previous.result_value);
  const absoluteChange = currentValue - previousValue;
  const percentageChange = previousValue === 0 ? null : (absoluteChange / previousValue) * 100;

  return {
    previous_result: previous.result_value,
    absolute_change_since_previous_test: roundChange(absoluteChange),
    percentage_change_since_previous_test: percentageChange === null ? null : roundChange(percentageChange),
    trend_direction: getTrendDirection(absoluteChange, result, previous),
  };
}

function getTrendDirection(change, result, previous) {
  if (change === 0) return "Stable";
  if (inRangeStableTrendMetrics.has(result.metric) && getStatusForTrend(result) === "In range" && getStatusForTrend(previous) === "In range") {
    return "Stable";
  }
  if (!hasMeaningfulNumericChange(result, previous, change)) return "Stable";
  const goal = result.trend_goal ?? getMetricMeta(result.metric).goal;
  if (goal === "lower") return change < 0 ? "Improved" : "Worse";
  if (goal === "higher") return change > 0 ? "Improved" : "Worse";
  if (goal === "range") return getRangeTrend(result, previous);
  return change > 0 ? "Up" : "Down";
}

function getStatusForTrend(result) {
  if (!result) return "";
  return result.status_vs_range ?? getStatus(result);
}

function getMeaningfulChangeRule(metricName) {
  return meaningfulChangeRules[metricName] ?? null;
}

function hasMeaningfulNumericChange(result, previous, change) {
  if (!result || result.metric_type === "qualitative") return true;
  const rule = getMeaningfulChangeRule(result.metric);
  if (!rule) return true;
  const absolute = Math.abs(Number(change));
  const previousValue = Math.abs(Number(previous?.result_value));
  const percent = previousValue === 0 ? null : (absolute / previousValue) * 100;
  if (rule.absolute !== undefined && absolute < rule.absolute) return false;
  if (rule.percent !== undefined && percent !== null && percent < rule.percent) return false;
  if (rule.percent !== undefined && percent === null && rule.absolute === undefined) return false;
  return true;
}

function getRangeTrend(result, previous) {
  const lower = getResultReferenceLower(result);
  const upper = getResultReferenceUpper(result);
  if (lower === null && upper === null) return "Changed";
  if (lower !== null && upper !== null) {
    const midpoint = (lower + upper) / 2;
    const currentDistance = Math.abs(Number(result.result_value) - midpoint);
    const previousDistance = Math.abs(Number(previous.result_value) - midpoint);
    if (currentDistance < previousDistance) return "Improved";
    if (currentDistance > previousDistance) return "Worse";
    return "Stable";
  }
  if (upper !== null) return Number(result.result_value) < Number(previous.result_value) ? "Improved" : "Worse";
  return Number(result.result_value) > Number(previous.result_value) ? "Improved" : "Worse";
}

function recalculateDerivedFields(results, profiles = state.profiles) {
  const sorted = [...results].sort((a, b) => {
    const personSort = String(a.profile_id).localeCompare(String(b.profile_id));
    const metricSort = a.metric.localeCompare(b.metric);
    const sampleSort = a.sample_date.localeCompare(b.sample_date);
    return personSort || metricSort || sampleSort || a.test_date.localeCompare(b.test_date);
  });

  return sorted.map((result) => {
    const normalised = normaliseResult(result, profiles);
    const previous = getPreviousResult(normalised, sorted);
    const derived = deriveChange(normalised, previous);
    return {
      ...normalised,
      status_vs_range: getStatus(normalised),
      ...derived,
    };
  });
}

function roundChange(value) {
  return Number(value.toFixed(2));
}

function formatValue(value, unit = "") {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}${unit ? ` ${unit}` : ""}`;
}

function formatChange(value, result) {
  if (value === null || value === undefined) return "-";
  if (result.metric_type === "qualitative") return value;
  return `${value > 0 ? "+" : ""}${value}`;
}

function formatPercent(value, result) {
  if (value === null || value === undefined) return "-";
  if (result.metric_type === "qualitative") return value;
  return `${value > 0 ? "+" : ""}${value}%`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function calculateAge(dateOfBirth) {
  const today = new Date();
  const dob = new Date(`${dateOfBirth}T00:00:00`);
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthday =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthday) age -= 1;
  return age;
}

function getDueStatus(profile, selectedMetric) {
  const latest = getLatestResult(profile.id, selectedMetric.name);
  if (!selectedMetric.intervalDays) {
    return latest
      ? { state: "complete", label: "Recorded", latest, nextDate: null }
      : { state: "due", label: "Baseline due", latest: null, nextDate: null };
  }

  let nextDate = getNextDueDate(profile.id, selectedMetric, latest);

  if (!latest && !nextDate) return { state: "due", label: "Baseline due", latest: null, nextDate: null };

  const snoozedDate = getSnoozedDueDate(profile.id, selectedMetric.name);
  if (snoozedDate && (!nextDate || new Date(`${snoozedDate}T00:00:00`) > nextDate)) {
    nextDate = new Date(`${snoozedDate}T00:00:00`);
  }

  const daysRemaining = daysBetween(new Date(), nextDate);
  const warningDays = getWarningDays(selectedMetric);
  if (daysRemaining < 0) return { state: "overdue", label: `Overdue by ${Math.abs(daysRemaining)} days`, latest, nextDate };
  if (daysRemaining === 0) return { state: "due", label: "Due today", latest, nextDate };
  if (daysRemaining <= warningDays) return { state: "soon", label: `Due in ${daysRemaining} days`, latest, nextDate };
  return { state: "ok", label: `Due ${formatDate(toDateString(nextDate))}`, latest, nextDate };
}

function getNextDueDate(profileId, selectedMetric, latest) {
  if (isCompletionMetric(selectedMetric)) {
    const storedNextDueDate = getResultStoredNextDueDate(latest);
    if (storedNextDueDate) return parseDateString(storedNextDueDate);
    if (latest?.sample_date && selectedMetric.intervalMonths && !selectedMetric.manualNextDueDate) {
      return addMonths(parseDateString(latest.sample_date), selectedMetric.intervalMonths);
    }
    if (selectedMetric.firstDueDate) return parseDateString(selectedMetric.firstDueDate);
  }

  if (selectedMetric.firstDueDate) {
    const firstDueDate = parseDateString(selectedMetric.firstDueDate);
    if (!firstDueDate) return null;
    if (selectedMetric.intervalMonths) {
      return getNextFixedDueDate(selectedMetric.firstDueDate, selectedMetric.intervalMonths, latest?.sample_date);
    }
    if (!latest) return firstDueDate;
  }

  const anchorDate = getScheduleAnchorDate(profileId, selectedMetric);
  return anchorDate ? addDays(anchorDate, selectedMetric.intervalDays) : null;
}

function getNextFixedDueDate(firstDueDate, intervalMonths, latestDateString) {
  let dueDate = parseDateString(firstDueDate);
  const latestDate = parseDateString(latestDateString);
  if (!dueDate) return null;
  if (!latestDate) return dueDate;
  while (dueDate <= latestDate) {
    dueDate = addMonths(dueDate, intervalMonths);
  }
  return dueDate;
}

function getScheduleAnchorDate(profileId, selectedMetric) {
  const group = getScheduleGroup(selectedMetric);
  const matchingMetrics = metrics
    .filter((item) =>
      isMetricAvailableForProfile(item, profileId) &&
      isMetricTrackedForProfile(item, profileId) &&
      !item.firstDueDate &&
      getScheduleGroup(item).key === group.key &&
      item.intervalDays === selectedMetric.intervalDays
    )
    .map((item) => item.name);
  const matchingResults = state.results
    .filter((result) => result.profile_id === profileId && matchingMetrics.includes(result.metric))
    .sort((a, b) => b.sample_date.localeCompare(a.sample_date));
  return matchingResults[0]?.sample_date ?? null;
}

function getScheduleGroup(selectedMetric) {
  if (targetMetricNames.has(selectedMetric.name)) return { key: "body", label: "Body composition" };
  if (selectedMetric.name === "VO2 Max") return { key: "fitness", label: "Fitness" };
  if (selectedMetric.name === "Pilot medical") return { key: "pilot-medical", label: "Pilot medical" };
  if (selectedMetric.name === "Eye test") return { key: "eye-test", label: "Eye test" };
  if (selectedMetric.name === "Dermatology checkup") return { key: "dermatology", label: "Dermatology" };
  if (selectedMetric.name === "Pap smear") return { key: "pap-smear", label: "Pap smear" };
  if (selectedMetric.name === "Breast screening") return { key: "breast-screening", label: "Breast screening" };
  if (selectedMetric.name === "Colonoscopy") return { key: "colonoscopy", label: "Colonoscopy" };
  if (selectedMetric.group === "Vitals and fitness") return { key: "vitals-fitness", label: "Vitals and fitness" };
  if (["Metabolic", "Lipids", "Cardiovascular markers"].includes(selectedMetric.group)) {
    return { key: "six-month-bloods", label: "Six-monthly bloods" };
  }
  if (selectedMetric.group === "One-off and infrequent") return { key: "infrequent", label: "Infrequent checks" };
  if (selectedMetric.intervalDays >= 365) return { key: "annual-bloods", label: "Annual bloods" };
  return { key: selectedMetric.group.toLowerCase().replaceAll(" ", "-"), label: selectedMetric.group };
}

function getSnoozeKey(profileId, metricName) {
  return `${profileId}:${metricName}`;
}

function getSnoozedDueDate(profileId, metricName) {
  return state.scheduleState.snoozes?.[getSnoozeKey(profileId, metricName)]?.due_date ?? null;
}

function snoozeScheduleItem(profileId, metricName) {
  if (!assertCanEdit()) return;
  const selectedMetric = getMetric(metricName);
  if (!selectedMetric?.intervalDays) return;
  const nextDate = getNextSnoozeDate(profileId, selectedMetric);
  state.scheduleState.snoozes[getSnoozeKey(profileId, metricName)] = {
    due_date: toDateString(nextDate),
    updated_at: new Date().toISOString(),
  };
  state.schedulePage = 1;
  saveScheduleState();
  render();
}

function getNextSnoozeDate(profileId, selectedMetric) {
  if ((selectedMetric.firstDueDate || isCompletionMetric(selectedMetric)) && selectedMetric.intervalMonths) {
    const nextDate = getDueStatus(profileId ? getProfile(profileId) : state.profiles[0], selectedMetric).nextDate;
    return nextDate
      ? addMonths(nextDate, selectedMetric.intervalMonths)
      : addMonths(parseDateString(selectedMetric.firstDueDate), selectedMetric.intervalMonths);
  }

  const group = getScheduleGroup(selectedMetric);
  const today = new Date();
  const peerDates = metrics
    .filter((item) =>
      isMetricAvailableForProfile(item, profileId) &&
      isMetricTrackedForProfile(item, profileId) &&
      item.name !== selectedMetric.name &&
      item.intervalDays === selectedMetric.intervalDays &&
      !item.firstDueDate &&
      getScheduleGroup(item).key === group.key
    )
    .map((item) => getDueStatus(profileId ? getProfile(profileId) : state.profiles[0], item).nextDate)
    .filter((date) => date && daysBetween(today, date) >= 0)
    .sort((a, b) => a - b);

  if (peerDates.length) return peerDates[0];

  const fallback = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  fallback.setDate(fallback.getDate() + selectedMetric.intervalDays);
  if (selectedMetric.intervalDays >= 180) return new Date(fallback.getFullYear(), fallback.getMonth(), 1);
  return fallback;
}

function getWarningDays(metricOrIntervalDays) {
  if (typeof metricOrIntervalDays === "object" && metricOrIntervalDays?.warningDays !== undefined) {
    return metricOrIntervalDays.warningDays;
  }
  const intervalDays = typeof metricOrIntervalDays === "object" ? metricOrIntervalDays?.intervalDays : metricOrIntervalDays;
  const metricName = typeof metricOrIntervalDays === "object" ? metricOrIntervalDays?.name : "";
  if (!intervalDays) return 0;
  if (metricName === "Colonoscopy") return 120;
  if (intervalDays <= 14) return 1;
  if (intervalDays <= 31) return 3;
  if (intervalDays <= 90) return 7;
  if (intervalDays <= 210) return 30;
  if (intervalDays <= 400) return 30;
  return 90;
}

function getTelegramReminderMilestoneDays(selectedMetric) {
  if (selectedMetric?.telegramReminderDays?.length) return selectedMetric.telegramReminderDays;
  const intervalDays = selectedMetric?.intervalDays ?? 0;
  if (!intervalDays) return [];
  if (selectedMetric.name === "Colonoscopy") return REMINDER_MILESTONES_COLONOSCOPY;
  if (intervalDays <= 14) return REMINDER_MILESTONES_FORTNIGHTLY;
  if (intervalDays <= 31) return REMINDER_MILESTONES_MONTHLY;
  if (intervalDays <= 90) return REMINDER_MILESTONES_QUARTERLY;
  if (intervalDays <= 210) return REMINDER_MILESTONES_SIX_MONTHLY;
  if (intervalDays <= 400) return REMINDER_MILESTONES_ANNUAL;
  return REMINDER_MILESTONES_SCREENING;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date;
}

function addMonths(date, months) {
  const source = date instanceof Date ? date : parseDateString(date);
  if (!source) return null;
  const day = source.getUTCDate();
  const next = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate();
  next.setUTCDate(Math.min(day, lastDay));
  return next;
}

function parseDateString(dateString) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(start, end) {
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.ceil((endDate - startDate) / 86400000);
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function normaliseDateString(value) {
  const parsed = parseDateString(value);
  return parsed ? toDateString(parsed) : "";
}

function getMondayDateString(date = new Date()) {
  const source = date instanceof Date ? date : parseDateString(date);
  if (!source) return "";
  const local = new Date(source.getFullYear(), source.getMonth(), source.getDate());
  const day = local.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  local.setDate(local.getDate() + offset);
  return toDateString(new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate())));
}

function getLatestResult(profileId, metricName) {
  return [...state.results]
    .filter((result) => result.profile_id === profileId && result.metric === metricName)
    .sort((a, b) => {
      const sampleSort = b.sample_date.localeCompare(a.sample_date);
      return sampleSort || b.test_date.localeCompare(a.test_date);
    })[0];
}

function getScheduleItems(profileFilter = state.activeProfileId) {
  return state.profiles
    .filter((profile) => !profileFilter || profile.id === profileFilter)
    .flatMap((profile) =>
      metrics
        .filter((item) => isMetricTrackedForProfile(item, profile.id) && ["highest", "medium"].includes(item.priority))
        .map((item) => ({ profile, metric: item, due: getDueStatus(profile, item) })),
  );
}

function filteredResults() {
  const sorted = [...visibleResults()].sort((a, b) => {
    const sampleSort = b.sample_date.localeCompare(a.sample_date);
    return sampleSort || b.test_date.localeCompare(a.test_date) || a.metric.localeCompare(b.metric);
  });

  if (state.filter === "warnings") {
    return getLatestByMetric(sorted).filter(isActionableWarning);
  }

  if (state.filter === "cautions" || state.filter === "flagged") {
    return getLatestByMetric(sorted).filter(isActionableCaution);
  }

  if (state.filter === "due") {
    const dueMetricNames = new Set(
      getScheduleItems()
        .filter((item) => ["due", "soon", "overdue"].includes(item.due.state))
        .map((item) => `${item.profile.id}:${item.metric.name}`),
    );
    return getLatestByMetric(sorted).filter((result) => dueMetricNames.has(`${result.profile_id}:${result.metric}`));
  }

  if (state.filter === "latest") {
    return getLatestByMetric(sorted);
  }

  return sorted;
}

function getLatestByMetric(results) {
  const latestByMetric = new Map();
  results.forEach((result) => {
    const key = `${result.profile_id}:${result.metric}`;
    if (!latestByMetric.has(key)) latestByMetric.set(key, result);
  });
  return [...latestByMetric.values()];
}

function render() {
  state.results = recalculateDerivedFields(state.results);
  const results = filteredResults();
  const scopedResults = visibleResults();
  const latestScopedResults = getLatestByMetric([...scopedResults].sort((a, b) => b.sample_date.localeCompare(a.sample_date)));
  const cautionCount = latestScopedResults.filter(isActionableCaution).length;
  const warningCount = latestScopedResults.filter(isActionableWarning).length;
  const dueCount = getDueCount();

  cautionResults.textContent = cautionCount;
  warningResults.textContent = warningCount;
  dueSoonResults.textContent = dueCount;
  const nextDueSummary = getNextDueSummary();
  nextDueDate.textContent = nextDueSummary.label;
  if (nextDueRelative) nextDueRelative.textContent = nextDueSummary.relative;
  nextDueCard.classList.toggle("due-now", nextDueSummary.state === "due");
  nextDueCard.classList.toggle("overdue", nextDueSummary.state === "overdue");

  renderQuickMetrics();
  renderOnboarding(scopedResults, cautionCount, warningCount, dueCount);
  renderHealthSnapshot(scopedResults, cautionCount, warningCount, dueCount);
  renderProfiles();
  renderSchedule();
  renderTelegramPanel();
  syncTelegramPanelVisibility();
  renderVitaminsPanel();
  syncVitaminsPanelVisibility();
  renderSummary();
  renderTrends();

  renderEmptyState(results.length, dueCount);
  renderSummarySelection();
  emptyState.classList.toggle("hidden", results.length > 0);
  tableWrap.classList.toggle("hidden", results.length === 0);

  resultsBody.innerHTML = renderResultRows(results);
  renderMobileActions(dueCount);
  renderMobileLayout();
}

function renderHealthSnapshot(scopedResults, cautionCount, warningCount, dueCount) {
  if (!snapshotSection || !snapshotGrid || !snapshotList) return;
  const latestResults = getLatestByMetric([...scopedResults].sort((a, b) => b.sample_date.localeCompare(a.sample_date)));
  const latestDate = scopedResults
    .map((result) => result.sample_date)
    .filter(Boolean)
    .sort()
    .at(-1);
  const dueItems = getScheduleItems().filter((item) => ["due", "soon", "overdue"].includes(item.due.state));
  const snapshotMetricNames = getSnapshotMetricNames();

  snapshotSection.classList.toggle("hidden", !cloudState.user || (!scopedResults.length && !dueItems.length));
  snapshotUpdated.textContent = latestDate
    ? `${warningCount} warnings · ${cautionCount} cautions · ${dueCount} due or overdue`
    : "No measurements yet";
  snapshotGrid.innerHTML = snapshotMetricNames
    .map((metricName) => renderSnapshotFocusCard(metricName, latestResults))
    .join("");
  snapshotList.innerHTML = "";
  renderSnapshotEditor(snapshotMetricNames);
}

function getSnapshotProfileId() {
  return state.activeProfileId || cloudState.profileId || state.profiles[0]?.id || "ben";
}

function getSnapshotMetricNames(profileId = getSnapshotProfileId()) {
  const configured = state.settings?.snapshot_metrics_by_profile?.[profileId];
  return normaliseSnapshotMetricNames(configured, profileId);
}

function renderSnapshotEditor(metricNames = getSnapshotMetricNames()) {
  if (!snapshotEditor) return;
  snapshotEditor.classList.toggle("hidden", !state.editingSnapshot);
  snapshotEditButton.textContent = state.editingSnapshot ? "Editing snapshot" : "Edit snapshot";
  const profileId = getSnapshotProfileId();
  const availableMetrics = getTrackedMetricsForProfile(profileId);
  const options = availableMetrics.map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`).join("");
  snapshotMetricInputs.forEach((input, index) => {
    if (!input) return;
    input.innerHTML = options;
    input.value = metricNames[index] ?? defaultSnapshotMetricNames[index] ?? availableMetrics[index]?.name ?? "";
  });
}

function saveSnapshotMetrics(event) {
  event.preventDefault();
  if (!assertCanEdit()) return;
  const selected = snapshotMetricInputs.map((input) => input?.value).filter(Boolean);
  if (new Set(selected).size !== selected.length) {
    window.alert("Choose four different snapshot metrics.");
    return;
  }
  const profileId = getSnapshotProfileId();
  state.settings.snapshot_metrics_by_profile ??= {};
  state.settings.snapshot_metrics_by_profile[profileId] = normaliseSnapshotMetricNames(selected, profileId);
  state.editingSnapshot = false;
  saveSettings();
  render();
}

function renderSnapshotFocusCard(metricName, latestResults) {
  const result = getSnapshotResult(metricName, latestResults);
  if (!result) {
    return `
      <article class="snapshot-card focus neutral" role="button" tabindex="0" data-snapshot-metric="${escapeHtml(metricName)}">
        <strong>-</strong>
        <span>${escapeHtml(metricName)}</span>
        <em>No result yet</em>
      </article>
    `;
  }

  const statusClass = getSnapshotStatusClass(result);
  const profileAttribute = result.profile_id ? ` data-snapshot-profile="${escapeHtml(result.profile_id)}"` : "";
  return `
    <article class="snapshot-card focus ${statusClass}" role="button" tabindex="0" data-snapshot-metric="${escapeHtml(result.metric)}"${profileAttribute}>
      <strong>${escapeHtml(formatValue(result.result_value, result.unit))}</strong>
      <span>${escapeHtml(result.metric)}</span>
      <em>${escapeHtml(result.status_vs_range)} · ${escapeHtml(getSnapshotTrendLabel(result))} · ${formatDate(result.sample_date)}</em>
    </article>
  `;
}

function getSnapshotResult(metricName, latestResults) {
  const profileId = state.activeProfileId || cloudState.profileId;
  return latestResults.find((result) => result.metric === metricName && (!profileId || result.profile_id === profileId)) ??
    latestResults.find((result) => result.metric === metricName) ??
    null;
}

function getSnapshotStatusClass(result) {
  if (isActionableWarning(result)) return "bad";
  if (isActionableCaution(result)) return "warning";
  if (result.status_vs_range === "In range" || result.status_vs_range === "On target") return "ok";
  return "neutral";
}

function getSnapshotTrendLabel(result) {
  const previous = getPreviousResult(result, state.results);
  if (!previous) return "first result";
  if (isTargetMetric(result.metric)) return getTargetSnapshotTrend(result, previous);
  if (["LDL", "Total cholesterol"].includes(result.metric)) return getLowerIsBetterSnapshotTrend(result, previous);
  return formatSnapshotTrend(result.trend_direction);
}

function getTargetSnapshotTrend(result, previous) {
  const target = result.reference_upper_limit;
  if (target === null || target === undefined) return formatSnapshotTrend(result.trend_direction);
  const currentValue = Number(result.result_value);
  const previousValue = Number(previous.result_value);
  if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue)) return formatSnapshotTrend(result.trend_direction);
  const tolerance = getMeaningfulChangeRule(result.metric)?.absolute ?? getTargetTolerance(result.metric);
  const currentDistance = Math.abs(currentValue - Number(target));
  const previousDistance = Math.abs(previousValue - Number(target));
  const distanceChange = previousDistance - currentDistance;
  if (Math.abs(distanceChange) < tolerance) return "trend static";
  return distanceChange > 0 ? "trend improving" : "trend worsening";
}

function getLowerIsBetterSnapshotTrend(result, previous) {
  const change = Number(result.result_value) - Number(previous.result_value);
  if (!Number.isFinite(change) || !hasMeaningfulNumericChange(result, previous, change)) return "trend static";
  if (change < 0) return "trend improving";
  if (change > 0) return "trend worsening";
  return "trend static";
}

function formatSnapshotTrend(trend) {
  if (trend === "Improved") return "trend improving";
  if (trend === "Worse") return "trend worsening";
  if (trend === "Stable") return "trend static";
  if (trend === "first") return "first result";
  if (trend === "changed") return "changed";
  if (trend === "unchanged") return "unchanged";
  return String(trend || "recorded").toLowerCase();
}

function renderSnapshotItem(item) {
  const profileAttribute = item.profileId ? ` data-snapshot-profile="${escapeHtml(item.profileId)}"` : "";
  return `
    <article class="snapshot-item ${escapeHtml(item.type)}" role="button" tabindex="0" data-snapshot-metric="${escapeHtml(item.metric)}"${profileAttribute}>
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.text)}</span>
    </article>
  `;
}

function handleSnapshotAction(target) {
  const metricItem = target.closest("[data-snapshot-metric]");
  if (metricItem) {
    const profileId = metricItem.dataset.snapshotProfile;
    if (profileId) focusMetricEntry(profileId, metricItem.dataset.snapshotMetric);
    state.activeTrendKey = metricItem.dataset.snapshotMetric;
    trendMetricInput.value = metricItem.dataset.snapshotMetric;
    renderTrends();
    return;
  }

  const card = target.closest("[data-snapshot-filter]");
  if (!card) return;
  if (card.dataset.snapshotFilter === "warnings") setFilter("warnings");
  else if (card.dataset.snapshotFilter === "cautions") setFilter("cautions");
  else if (card.dataset.snapshotFilter === "flagged") setFilter("cautions");
  else if (card.dataset.snapshotFilter === "due") setFilter("due");
  else if (card.dataset.snapshotFilter === "changes") {
    state.filter = "all";
    state.activeSummaryFilter = "changes";
    render();
  } else setFilter("latest");
}

function renderResultRows(results) {
  const sorted = [...results].sort((a, b) => {
    const groupSort = getDisplayGroupOrder(a.metric) - getDisplayGroupOrder(b.metric);
    if (groupSort) return groupSort;
    return a.metric.localeCompare(b.metric) || b.sample_date.localeCompare(a.sample_date);
  });
  let currentGroup = "";
  return sorted
    .map((result) => {
      const group = getDisplayGroupForMetric(result.metric);
      const heading = group === currentGroup ? "" : `<tr class="result-group-row"><th colspan="12">${escapeHtml(group)}</th></tr>`;
      currentGroup = group;
      const statusClass = getStatusClass(result.status_vs_range);
      const due = getDueStatus(getProfile(result.profile_id), getMetric(result.metric));
      const range = formatRangeOrTarget(result);
      const status = renderStatusPill(result, statusClass);

      return `
        ${heading}
        <tr>
          <td data-label="Person">${escapeHtml(result.person_name)}</td>
          <td data-label="Date">${formatDate(result.sample_date)}</td>
          <td data-label="Metric">
            <div class="metric-cell">
              <strong>${escapeHtml(result.metric)}</strong>
              <button class="info-button" type="button" data-context-metric="${escapeHtml(result.metric)}" aria-label="Show context for ${escapeHtml(result.metric)}">Info</button>
            </div>
          </td>
          <td class="value-cell" data-label="Value"><strong>${escapeHtml(result.result_value)}</strong><span>${escapeHtml(result.unit)}</span></td>
          <td data-label="Range / target">${range}</td>
          <td data-label="Status">${status}</td>
          <td data-label="Due"><span class="due-pill ${due.state}">${escapeHtml(due.label)}</span></td>
          <td data-label="Previous">${formatValue(result.previous_result, result.unit)}</td>
          <td data-label="Abs change">${formatChange(result.absolute_change_since_previous_test, result)}</td>
          <td data-label="% change">${formatPercent(result.percentage_change_since_previous_test, result)}</td>
          <td data-label="Trend">${escapeHtml(result.trend_direction)}</td>
          <td data-label="Action"><button class="delete-button" type="button" data-id="${result.id}" aria-label="Delete result">Delete</button></td>
        </tr>
      `;
    })
    .join("");
}

function renderStatusPill(result, statusClass) {
  if (!isWarningStatus(result.status_vs_range)) {
    return `<span class="status-pill ${statusClass}">${escapeHtml(result.status_vs_range)}</span>`;
  }
  return `<button class="status-pill ${statusClass}" type="button" data-warning-id="${escapeHtml(result.id)}">${escapeHtml(result.status_vs_range)}</button>`;
}

function getDisplayGroupForMetric(metricName) {
  const selectedMetric = getMetric(metricName);
  const group = selectedMetric?.group ?? "";
  if (targetMetricNames.has(metricName)) return "Body composition";
  if (["Blood pressure systolic", "Blood pressure diastolic", "Resting heart rate", "VO2 Max"].includes(metricName)) {
    return "Vitals and fitness";
  }
  if (["Lipids", "Cardiovascular markers", "Amino acids"].includes(group)) return "Cardiovascular";
  if (group === "Metabolic") return "Metabolic";
  if (group === "Full blood count") return "Full blood count";
  if (["Renal and purines", "Proteins"].includes(group)) return "Kidney and proteins";
  if (group === "Liver and enzymes") return "Liver and bilirubin";
  if (group === "Electrolytes") return "Electrolytes";
  if (group === "Vitamins and iron") return "Vitamins and iron";
  if (group === "Endocrine") return "Thyroid and endocrine";
  if (group.startsWith("Hormone panel")) return "Hormones";
  if (group === "Urinalysis") return "Urinalysis";
  if (group === "Health checks") return "Health checks";
  if (group === "One-off and infrequent") return "Infrequent checks";
  return group || "Other";
}

function getDisplayGroupOrder(metricName) {
  const order = [
    "Body composition",
    "Vitals and fitness",
    "Health checks",
    "Cardiovascular",
    "Metabolic",
    "Full blood count",
    "Kidney and proteins",
    "Liver and bilirubin",
    "Electrolytes",
    "Vitamins and iron",
    "Thyroid and endocrine",
    "Hormones",
    "Urinalysis",
    "Infrequent checks",
    "Other",
  ];
  const index = order.indexOf(getDisplayGroupForMetric(metricName));
  return index === -1 ? order.length : index;
}

function renderEmptyState(resultCount, dueCount) {
  if (resultCount > 0) return;
  if (state.filter === "due") {
    emptyState.innerHTML = dueCount
      ? `
          <strong>Due checks are waiting</strong>
          <span>Use the due list to enter the next measurement or snooze it into the next grouped set.</span>
          <div class="empty-actions">
            <button class="mini-button" type="button" data-empty-action="due">Show due list</button>
            <button class="mini-button" type="button" data-empty-action="add">Add manually</button>
          </div>
        `
      : `
          <strong>Nothing due</strong>
          <span>No tests are currently due or overdue.</span>
          <div class="empty-actions">
            <button class="mini-button" type="button" data-empty-action="current">View current results</button>
          </div>
        `;
    return;
  }
  if (state.filter === "warnings") {
    emptyState.innerHTML = `
      <strong>No range warnings</strong>
      <span>Current measurements have no clearly outside-range warnings.</span>
      <div class="empty-actions">
        <button class="mini-button" type="button" data-empty-action="current">View current results</button>
      </div>
    `;
    return;
  }
  if (state.filter === "cautions" || state.filter === "flagged") {
    emptyState.innerHTML = `
      <strong>No range cautions</strong>
      <span>Current measurements have no near-limit or target cautions.</span>
      <div class="empty-actions">
        <button class="mini-button" type="button" data-empty-action="current">View current results</button>
      </div>
    `;
    return;
  }
  emptyState.innerHTML = `
    <strong>No results yet</strong>
    <span>Start with a regular metric, or import reviewed data from ChatGPT.</span>
    <div class="empty-actions">
      <button class="mini-button" type="button" data-empty-action="add">Add measurement</button>
      <button class="mini-button" type="button" data-empty-action="import">Import file</button>
    </div>
  `;
}

function renderOnboarding(scopedResults, cautionCount, warningCount, dueCount) {
  if (!cloudState.user) return;
  const profileName = state.profiles[0]?.name ?? "Your profile";
  const hasProfile = profilesAreComplete(state.profiles);
  onboardingPanel.classList.toggle("hidden", scopedResults.length > 0 && hasProfile);
  if (!hasProfile) {
    onboardingTitle.textContent = `${profileName}: profile details`;
    onboardingText.textContent = "Complete date of birth and height before adding measurements.";
    return;
  }
  if (!scopedResults.length) {
    onboardingTitle.textContent = `${profileName}: ready for first measurement`;
    onboardingText.textContent = "Add a result manually or import a reviewed ChatGPT JSON file.";
    return;
  }
  onboardingTitle.textContent = `${profileName}: ${scopedResults.length} measurements`;
  onboardingText.textContent = `${warningCount} warnings · ${cautionCount} cautions · ${dueCount} due or overdue`;
}

function formatRangeOrTarget(result) {
  if (isCompletionMetric(result.metric)) {
    const nextDueDate = getResultStoredNextDueDate(result);
    if (!nextDueDate) return "-";
    const label = getMetric(result.metric)?.manualNextDueDate ? "Expires" : "Next due";
    return `${label} ${formatDate(nextDueDate)}`;
  }
  const low = getResultReferenceLower(result);
  const target = getResultTarget(result);
  const high = getResultReferenceUpper(result);
  const unit = result.unit ? ` ${result.unit}` : "";
  const parts = [];
  if (target !== null) parts.push(`Target ${formatAxisValue(target)}${unit}`);
  if (low !== null && high !== null) parts.push(`${formatAxisValue(low)} - ${formatAxisValue(high)}${unit}`);
  else if (low === null && high !== null) parts.push(`<= ${formatAxisValue(high)}${unit}`);
  else if (low !== null && high === null) parts.push(`>= ${formatAxisValue(low)}${unit}`);
  return parts.length ? parts.join("; ") : "-";
}

function saveRangeForResult(result) {
  if (isCompletionMetric(result.metric)) return;
  const key = getRangeKey(result.profile_id, result.metric);
  const fields = normaliseReferenceFields(result.reference_fields, getMetric(result.metric), {
    low: result.reference_lower_limit,
    target: result.target_value,
    high: result.reference_upper_limit,
  });
  state.metricRanges[key] = {
    low: fields.lower ? result.reference_lower_limit : null,
    target: fields.target ? result.target_value : null,
    high: fields.upper ? result.reference_upper_limit : null,
    fields,
    updated_at: new Date().toISOString(),
  };
  saveMetricRanges();
  state.editingRangeKey = null;
}

function toggleRangeEditing() {
  const profile = getSelectedProfile();
  const selectedMetric = getMetric(metricInput.value, profile?.id);
  if (!selectedMetric || !profile) return;

  const key = getRangeKey(profile.id, selectedMetric.name);
  if (state.editingRangeKey === key) {
    const fields = getReferenceOptionValues();
    state.metricRanges[key] = {
      low: fields.lower ? parseLimit(lowInput.value) : null,
      target: fields.target ? parseLimit(targetInput.value) : null,
      high: fields.upper ? parseLimit(highInput.value) : null,
      fields,
      updated_at: new Date().toISOString(),
    };
    state.editingRangeKey = null;
    saveMetricRanges();
  } else {
    const savedRange = getSavedRange(profile.id, selectedMetric.name);
    const defaultRange = {
      low: selectedMetric.low,
      target: null,
      high: isTargetMetric(selectedMetric.name) ? null : selectedMetric.high,
    };
    const fields = savedRange?.fields ?? getDefaultReferenceFields(selectedMetric, defaultRange);
    setReferenceOptionValues(fields);
    state.referenceDraftKey = key;
    state.editingRangeKey = key;
  }
  syncRangeDefaults();
  renderTrends();
}

function renderTrends() {
  const selectedMetricName = state.activeTrendKey || trendMetricInput.value;
  const allScopedResults = visibleResults()
    .filter((result) => result.metric === selectedMetricName)
    .sort((a, b) => a.sample_date.localeCompare(b.sample_date));
  const scopedResults = filterTrendResultsByRange(allScopedResults);

  if (!allScopedResults.length) {
    trendPanel.innerHTML = `
      <article class="trend-card">
        <strong>No trend data yet</strong>
        <span>Add ${escapeHtml(selectedMetricName)} measurements to see history, high, low, latest, and change.</span>
      </article>
    `;
    return;
  }

  const numericResults = scopedResults.filter((result) => result.metric_type === "numeric");
  const latest = scopedResults[scopedResults.length - 1];
  const previous = scopedResults[scopedResults.length - 2];
  const high = numericResults.length ? maxBy(numericResults, (result) => Number(result.result_value)) : null;
  const low = numericResults.length ? minBy(numericResults, (result) => Number(result.result_value)) : null;
  const changeClass = getTrendClass(latest.trend_direction);
  const chart = numericResults.length >= 2 ? createSparkline(numericResults, latest) : "";
  const rangeText = formatRangeOrTarget(latest);
  const rangeLabel = isTargetMetric(latest.metric) ? "Target" : "Reference";
  const yearComparison = latest.metric_type === "numeric" ? findClosestPriorResult(allScopedResults, latest, 365, 75) : null;
  const average = numericResults.length
    ? numericResults.reduce((sum, result) => sum + Number(result.result_value), 0) / numericResults.length
    : null;
  const timeline = scopedResults
    .slice(-4)
    .map((result) => `
      <li>
        <span>${formatDate(result.sample_date)}</span>
        <strong>${escapeHtml(result.person_name)} · ${escapeHtml(formatValue(result.result_value, result.unit))}</strong>
        <em>${escapeHtml(result.status_vs_range)} · ${escapeHtml(result.trend_direction)}</em>
      </li>
    `)
    .join("");

  trendPanel.innerHTML = `
    <article class="trend-card trend-controls">
      <strong>Range</strong>
      <div class="segmented-control" role="group" aria-label="Trend range">
        ${renderTrendRangeButton("6m", "6 months")}
        ${renderTrendRangeButton("1y", "1 year")}
        ${renderTrendRangeButton("2y", "2 years")}
        ${renderTrendRangeButton("all", "All time")}
      </div>
      <em>${scopedResults.length} of ${allScopedResults.length} results shown</em>
    </article>
    <article class="trend-card">
      <strong>Latest <button class="info-button inline-info" type="button" data-context-metric="${escapeHtml(latest.metric)}">Info</button></strong>
      <span>${escapeHtml(latest.person_name)} · ${escapeHtml(formatValue(latest.result_value, latest.unit))}</span>
      <em>${formatDate(latest.sample_date)} · ${escapeHtml(latest.status_vs_range)}</em>
    </article>
    <article class="trend-card">
      <strong>Change</strong>
      <span class="${changeClass}">${previous ? `${formatChange(latest.absolute_change_since_previous_test, latest)} (${formatPercent(latest.percentage_change_since_previous_test, latest)})` : "-"}</span>
      <em>${previous ? `Since ${formatDate(previous.sample_date)}` : "First result"}</em>
    </article>
    <article class="trend-card">
      <strong>${rangeLabel}</strong>
      <span>${escapeHtml(rangeText)}</span>
      <em>${escapeHtml(latest.cadence)}</em>
    </article>
    <article class="trend-card">
      <strong>Year-on-year</strong>
      <span class="${yearComparison ? getTrendClass(compareTrend(latest, yearComparison)) : ""}">${yearComparison ? formatYearComparison(latest, yearComparison) : "-"}</span>
      <em>${yearComparison ? `Versus ${formatDate(yearComparison.sample_date)}` : "Needs a similar result about 12 months earlier"}</em>
    </article>
    <article class="trend-card">
      <strong>Average</strong>
      <span>${average === null ? "-" : escapeHtml(formatValue(roundChange(average), latest.unit))}</span>
      <em>${numericResults.length ? `Across selected range` : "Not numeric"}</em>
    </article>
    <article class="trend-card">
      <strong>Lowest</strong>
      <span>${low ? escapeHtml(formatValue(low.result_value, low.unit)) : "-"}</span>
      <em>${low ? `${escapeHtml(low.person_name)} · ${formatDate(low.sample_date)}` : "Not numeric"}</em>
    </article>
    <article class="trend-card">
      <strong>Highest</strong>
      <span>${high ? escapeHtml(formatValue(high.result_value, high.unit)) : "-"}</span>
      <em>${high ? `${escapeHtml(high.person_name)} · ${formatDate(high.sample_date)}` : "Not numeric"}</em>
    </article>
    <article class="trend-card trend-chart">
      <strong>Chart</strong>
      ${chart || "<span>-</span><em>Add at least two numeric results.</em>"}
    </article>
    <article class="trend-card trend-history">
      <strong>Recent history</strong>
      <ul>${timeline}</ul>
    </article>
  `;
}

function renderTrendRangeButton(range, label) {
  return `<button class="${state.trendRange === range ? "active" : ""}" type="button" data-trend-range="${range}">${label}</button>`;
}

function filterTrendResultsByRange(results) {
  if (state.trendRange === "all" || !results.length) return results;
  const latest = results[results.length - 1];
  const end = new Date(`${latest.sample_date}T00:00:00`);
  const start = new Date(end);
  const months = state.trendRange === "6m" ? 6 : state.trendRange === "2y" ? 24 : 12;
  start.setMonth(start.getMonth() - months);
  return results.filter((result) => new Date(`${result.sample_date}T00:00:00`) >= start);
}

function findClosestPriorResult(results, latest, targetDays, toleranceDays) {
  const latestDate = new Date(`${latest.sample_date}T00:00:00`);
  const candidates = results
    .filter((result) => result.id !== latest.id && result.metric_type === "numeric" && result.sample_date < latest.sample_date)
    .map((result) => {
      const days = daysBetween(new Date(`${result.sample_date}T00:00:00`), latestDate);
      return { result, distance: Math.abs(days - targetDays) };
    })
    .filter((item) => item.distance <= toleranceDays)
    .sort((a, b) => a.distance - b.distance);
  return candidates[0]?.result ?? null;
}

function compareTrend(current, previous) {
  return getTrendDirection(Number(current.result_value) - Number(previous.result_value), current, previous);
}

function formatYearComparison(current, previous) {
  const change = roundChange(Number(current.result_value) - Number(previous.result_value));
  const percentage = Number(previous.result_value) === 0 ? null : roundChange((change / Number(previous.result_value)) * 100);
  return `${formatChange(change, current)} (${formatPercent(percentage, current)})`;
}

function createSparkline(results, latest) {
  const width = 720;
  const height = 220;
  const padding = { top: 24, right: 28, bottom: 42, left: 62 };
  const values = results.map((result) => Number(result.result_value));
  const rangeValues = [getResultReferenceLower(latest), getResultTarget(latest), getResultReferenceUpper(latest)].filter((value) => value !== null);
  const min = Math.min(...values, ...rangeValues);
  const max = Math.max(...values, ...rangeValues);
  const spread = max - min || 1;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const xForIndex = (index) => padding.left + (index / Math.max(results.length - 1, 1)) * chartWidth;
  const yForValue = (value) => padding.top + chartHeight - ((Number(value) - min) / spread) * chartHeight;
  const points = results.map((result, index) => `${roundChange(xForIndex(index))},${roundChange(yForValue(result.result_value))}`).join(" ");
  const rangeBand = createRangeBand(latest, padding, width, chartWidth, yForValue);
  const circles = results
    .map((result, index) => {
      const [x, y] = points.split(" ")[index].split(",");
      const isLatest = index === results.length - 1;
      return `<circle class="${isLatest ? "latest-point" : ""}" cx="${x}" cy="${y}" r="${isLatest ? 6 : 4}"><title>${escapeHtml(result.person_name)} ${formatDate(result.sample_date)}: ${escapeHtml(formatValue(result.result_value, result.unit))}</title></circle>`;
    })
    .join("");
  const first = results[0];
  const last = results[results.length - 1];

  return `
    <svg class="sparkline" viewBox="0 0 ${width} ${height}" role="img" aria-label="Trend chart">
      ${rangeBand}
      <line class="axis" x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}"></line>
      <line class="axis" x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}"></line>
      <text x="${padding.left - 8}" y="${roundChange(yForValue(max) + 4)}" text-anchor="end">${escapeHtml(formatAxisValue(max))}</text>
      <text x="${padding.left - 8}" y="${roundChange(yForValue(min) + 4)}" text-anchor="end">${escapeHtml(formatAxisValue(min))}</text>
      <text x="${padding.left}" y="${height - 12}" text-anchor="start">${formatDate(first.sample_date)}</text>
      <text x="${width - padding.right}" y="${height - 12}" text-anchor="end">${formatDate(last.sample_date)}</text>
      <polyline points="${points}"></polyline>
      ${circles}
    </svg>
    <em>${formatValue(min, results[0].unit)} to ${formatValue(max, results[0].unit)} across ${results.length} results</em>
  `;
}

function createRangeBand(latest, padding, width, chartWidth, yForValue) {
  const low = getResultReferenceLower(latest);
  const target = getResultTarget(latest);
  const high = getResultReferenceUpper(latest);
  if (low === null && high === null && target === null) return "";

  if (low !== null && high !== null) {
    const yTop = yForValue(high);
    const yBottom = yForValue(low);
    return `<rect class="range-band" x="${padding.left}" y="${roundChange(yTop)}" width="${chartWidth}" height="${roundChange(yBottom - yTop)}"></rect>`;
  }

  const y = yForValue(target ?? low ?? high);
  return `<line class="range-limit" x1="${padding.left}" y1="${roundChange(y)}" x2="${width - padding.right}" y2="${roundChange(y)}"></line>`;
}

function formatAxisValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function getTrendClass(trend) {
  if (trend === "Improved") return "trend-good";
  if (trend === "Worse") return "trend-bad";
  if (trend === "Stable" || trend === "unchanged") return "trend-neutral";
  return "";
}

function maxBy(items, getter) {
  return items.reduce((best, item) => (getter(item) > getter(best) ? item : best), items[0]);
}

function minBy(items, getter) {
  return items.reduce((best, item) => (getter(item) < getter(best) ? item : best), items[0]);
}

function renderSchedule() {
  const priorityOrder = { overdue: 0, due: 1, soon: 2, ok: 3, complete: 4 };
  const items = getScheduleItems()
    .filter((item) => ["overdue", "due", "soon"].includes(item.due.state))
    .sort((a, b) => priorityOrder[a.due.state] - priorityOrder[b.due.state] || a.metric.name.localeCompare(b.metric.name));
  const totalPages = Math.max(1, Math.ceil(items.length / SCHEDULE_PAGE_SIZE));
  state.schedulePage = Math.min(Math.max(1, state.schedulePage), totalPages);
  const startIndex = (state.schedulePage - 1) * SCHEDULE_PAGE_SIZE;
  const visibleItems = items.slice(startIndex, startIndex + SCHEDULE_PAGE_SIZE);
  renderSchedulePagination(items.length, startIndex, visibleItems.length, totalPages);

  schedulePanel.innerHTML = visibleItems.length
    ? visibleItems
        .map((item) => `
          <article class="schedule-card ${item.due.state}" role="button" tabindex="0" data-schedule-profile="${escapeHtml(item.profile.id)}" data-schedule-metric="${escapeHtml(item.metric.name)}">
            <strong>${escapeHtml(item.metric.name)}</strong>
            <span>${escapeHtml(item.profile.name)} · ${escapeHtml(getScheduleGroup(item.metric).label)} · ${escapeHtml(item.metric.cadence)}</span>
            <em>${escapeHtml(item.due.label)} · tap to enter</em>
            <small>Snooze aligns this with the next grouped check.</small>
            <button class="mini-button snooze-button" type="button" data-snooze-profile="${escapeHtml(item.profile.id)}" data-snooze-metric="${escapeHtml(item.metric.name)}">Snooze</button>
          </article>
        `)
        .join("")
    : renderCalmScheduleCard();
}

function renderSchedulePagination(totalItems, startIndex, visibleCount, totalPages) {
  if (!schedulePagination || !schedulePrevButton || !scheduleNextButton || !schedulePageText) return;
  const showPagination = totalItems > SCHEDULE_PAGE_SIZE;
  schedulePagination.classList.toggle("hidden", !showPagination);
  if (!showPagination) {
    schedulePageText.textContent = "";
    return;
  }
  const endIndex = startIndex + visibleCount;
  schedulePageText.textContent = `${startIndex + 1}-${endIndex} of ${totalItems}`;
  schedulePrevButton.disabled = state.schedulePage <= 1;
  scheduleNextButton.disabled = state.schedulePage >= totalPages;
}

function changeSchedulePage(direction) {
  state.schedulePage += direction;
  renderSchedule();
}

function renderCalmScheduleCard() {
  const nextDueSummary = getNextDueSummary();
  const nextText = nextDueSummary.state === "future" ? `Next check: ${nextDueSummary.label}` : "No priority checks are waiting.";
  return `
    <article class="schedule-card ok calm-card">
      <strong>Nothing due</strong>
      <span>Priority metrics are up to date.</span>
      <em>${escapeHtml(nextText)}</em>
    </article>
  `;
}

function getTelegramSettings() {
  state.settings.telegram = normaliseTelegramSettings(state.settings.telegram);
  return state.settings.telegram;
}

function syncTelegramPanelVisibility(isPrivateVisible = Boolean(cloudState.user)) {
  if (!telegramModal) return;
  const shouldShow = Boolean(isPrivateVisible && cloudState.user && state.telegramPanelOpen);
  telegramModal.classList.toggle("hidden", !shouldShow);
  telegramModal.setAttribute("aria-hidden", shouldShow ? "false" : "true");
}

function renderTelegramPanel() {
  if (!telegramPanel) return;
  const settings = getTelegramSettings();
  const isConnected = Boolean(settings.chat_id);
  const isPairing = Boolean(telegramSetupState.pairingCode);
  const showConnected = isConnected && !isPairing;
  const isPaused = showConnected && settings.enabled === false;
  const statusParts = [];
  if (telegramSetupState.busy) statusParts.push("Checking...");
  else if (telegramSetupState.error) statusParts.push(telegramSetupState.error);
  else if (telegramSetupState.status) statusParts.push(telegramSetupState.status);
  else statusParts.push(showConnected ? (isPaused ? "Paused" : "Connected") : "Not connected");

  telegramStatus.textContent = statusParts.join(" ");
  telegramStatus.className = `privacy-note ${telegramSetupState.error ? "telegram-error" : showConnected && !isPaused ? "telegram-ok" : isPaused ? "telegram-paused" : ""}`;
  telegramConnectionTitle.textContent = showConnected
    ? `Connected to ${settings.chat_label || "Telegram"}`
    : isPairing
      ? "Send this code to Health Tracker Bot"
    : "Connect Health Tracker Bot";
  telegramConnectionText.innerHTML = showConnected
    ? `${isPaused ? "Reminders are paused." : "Reminders are ready."}${settings.test_sent_at ? ` Last test ${escapeHtml(formatRelativeTime(settings.test_sent_at))}.` : ""}${settings.due_test_sent_at ? ` Last due test ${escapeHtml(formatRelativeTime(settings.due_test_sent_at))}.` : ""}`
    : `Open <a href="https://t.me/${TELEGRAM_BOT_USERNAME}" target="_blank" rel="noopener">Health Tracker Bot</a>, send the pairing code, then check it here.`;

  telegramPairingCode.textContent = telegramSetupState.pairingCode;
  telegramPairingCode.classList.toggle("hidden", !isPairing);
  telegramPairButton.textContent = showConnected ? "Replace Telegram" : isPairing ? "New code" : "Pair Telegram";
  telegramCheckButton.classList.toggle("hidden", !isPairing);
  telegramTestButton.classList.toggle("hidden", !showConnected);
  telegramDueTestButton.classList.toggle("hidden", !showConnected);
  telegramPauseButton?.classList.toggle("hidden", !showConnected);
  telegramDisconnectButton?.classList.toggle("hidden", !showConnected);
  if (telegramPauseButton) telegramPauseButton.textContent = isPaused ? "Resume reminders" : "Pause reminders";
  telegramPairButton.disabled = telegramSetupState.busy || isReadOnlyMode();
  telegramCheckButton.disabled = telegramSetupState.busy || !telegramSetupState.pairingCode || isReadOnlyMode();
  telegramTestButton.disabled = telegramSetupState.busy || !settings.chat_id || isReadOnlyMode();
  telegramDueTestButton.disabled = telegramSetupState.busy || !settings.chat_id || isReadOnlyMode();
  if (telegramPauseButton) telegramPauseButton.disabled = telegramSetupState.busy || !settings.chat_id || isReadOnlyMode();
  if (telegramDisconnectButton) telegramDisconnectButton.disabled = telegramSetupState.busy || !settings.chat_id || isReadOnlyMode();
  renderTelegramReminderGroups();
}

function renderTelegramReminderGroups() {
  if (!telegramReminderGroups) return;
  const settings = getTelegramSettings();
  telegramReminderGroups.innerHTML = `
    <div class="telegram-group-heading">
      <strong>Reminder groups</strong>
      <span>Next-cycle snooze options show the cycle length before you choose them.</span>
    </div>
    <div class="telegram-group-grid">
      ${TELEGRAM_REMINDER_GROUPS.map(
        (group) => `
          <article>
            <strong>${escapeHtml(group.label)}</strong>
            <span>Snooze until next cycle (${escapeHtml(group.cycleLabel)})</span>
            ${settings.snoozes?.[group.key]?.until ? `<em>Snoozed until ${escapeHtml(formatDate(settings.snoozes[group.key].until))}</em>` : ""}
          </article>
        `,
      ).join("")}
    </div>
  `;
}

function openTelegramPanel() {
  if (!telegramModal || !cloudState.user) return;
  state.telegramPanelOpen = true;
  renderTelegramPanel();
  syncTelegramPanelVisibility(true);
}

function closeTelegramPanel() {
  if (!telegramModal) return;
  state.telegramPanelOpen = false;
  syncTelegramPanelVisibility();
}

function generateTelegramPairingCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(6);
  window.crypto.getRandomValues(values);
  return `HT-${[...values].map((value) => alphabet[value % alphabet.length]).join("")}`;
}

async function invokeTelegramFunction(action, body = {}) {
  if (!cloudState.client || !cloudState.user) {
    throw new Error("Sign in before setting up Telegram reminders.");
  }
  const { data, error } = await cloudState.client.functions.invoke(TELEGRAM_FUNCTION_NAME, {
    body: { action, ...body },
  });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error ?? "Telegram setup failed.");
  return data;
}

async function startTelegramPairing() {
  if (!assertCanEdit()) return;
  telegramSetupState.pairingCode = generateTelegramPairingCode();
  telegramSetupState.error = "";
  telegramSetupState.status = "Send this code to the bot.";
  renderTelegramPanel();
}

async function checkTelegramPairingCode() {
  if (!assertCanEdit()) return;
  if (!telegramSetupState.pairingCode) {
    startTelegramPairing();
    return;
  }

  telegramSetupState.busy = true;
  telegramSetupState.error = "";
  telegramSetupState.status = "Looking for your Telegram message...";
  renderTelegramPanel();

  try {
    const data = await invokeTelegramFunction("resolve_chat", { code: telegramSetupState.pairingCode });
    if (data.status === "waiting") {
      telegramSetupState.status = data.message ?? "No matching Telegram message found yet.";
      return;
    }

    state.settings.telegram = normaliseTelegramSettings({
      chat_id: data.chat.id,
      chat_label: data.chat.label,
      linked_at: new Date().toISOString(),
      test_sent_at: "",
      due_test_sent_at: "",
      enabled: true,
      paused_at: "",
      last_reminder_sent_date: "",
      last_reminder_signature: "",
      snoozes: {},
    });
    telegramSetupState.pairingCode = "";
    telegramSetupState.status = "Telegram linked.";
    saveSettings();
  } catch (error) {
    telegramSetupState.error = error.message;
  } finally {
    telegramSetupState.busy = false;
    render();
  }
}

async function sendTelegramTestMessage() {
  if (!assertCanEdit()) return;
  const settings = getTelegramSettings();
  if (!settings.chat_id) {
    startTelegramPairing();
    return;
  }

  telegramSetupState.busy = true;
  telegramSetupState.error = "";
  telegramSetupState.status = "Sending test...";
  renderTelegramPanel();

  try {
    await invokeTelegramFunction("send_test", { chat_id: settings.chat_id });
    state.settings.telegram = normaliseTelegramSettings({
      ...settings,
      test_sent_at: new Date().toISOString(),
    });
    telegramSetupState.status = "Test sent.";
    saveSettings();
  } catch (error) {
    telegramSetupState.error = error.message;
  } finally {
    telegramSetupState.busy = false;
    render();
  }
}

async function sendTelegramDueTestMessage() {
  if (!assertCanEdit()) return;
  const settings = getTelegramSettings();
  if (!settings.chat_id) {
    startTelegramPairing();
    return;
  }

  telegramSetupState.busy = true;
  telegramSetupState.error = "";
  telegramSetupState.status = "Sending due test...";
  renderTelegramPanel();

  try {
    const data = await invokeTelegramFunction("send_due_summary");
    state.settings.telegram = normaliseTelegramSettings({
      ...settings,
      due_test_sent_at: new Date().toISOString(),
    });
    telegramSetupState.status = data.due_count
      ? `Due test sent with ${data.due_count} checks and snooze buttons.`
      : "Due test sent. Nothing is due right now.";
    saveSettings();
  } catch (error) {
    telegramSetupState.error = error.message;
  } finally {
    telegramSetupState.busy = false;
    render();
  }
}

function toggleTelegramReminders() {
  if (!assertCanEdit()) return;
  const settings = getTelegramSettings();
  if (!settings.chat_id) {
    startTelegramPairing();
    return;
  }
  const nextEnabled = settings.enabled === false;
  state.settings.telegram = normaliseTelegramSettings({
    ...settings,
    enabled: nextEnabled,
    paused_at: nextEnabled ? "" : new Date().toISOString(),
  });
  telegramSetupState.error = "";
  telegramSetupState.status = nextEnabled ? "Reminders resumed." : "Reminders paused.";
  saveSettings();
  render();
}

function disconnectTelegramReminders() {
  if (!assertCanEdit()) return;
  const settings = getTelegramSettings();
  if (!settings.chat_id) return;
  if (!window.confirm("Disconnect Telegram reminders for this account?")) return;
  state.settings.telegram = normaliseTelegramSettings({
    chat_id: "",
    chat_label: "",
    linked_at: "",
    test_sent_at: "",
    due_test_sent_at: "",
    enabled: false,
    paused_at: "",
    last_reminder_sent_date: "",
    last_reminder_signature: "",
    snoozes: {},
  });
  telegramSetupState.pairingCode = "";
  telegramSetupState.error = "";
  telegramSetupState.status = "Telegram disconnected.";
  saveSettings();
  render();
}

function getVitaminProfileId() {
  return cloudState.profileId || state.activeProfileId || state.profiles[0]?.id || "ben";
}

function getVitaminProfileSettings(profileId = getVitaminProfileId()) {
  state.settings.vitamins_by_profile = normaliseVitaminsByProfile(state.settings.vitamins_by_profile);
  state.settings.vitamins_by_profile[profileId] = normaliseVitaminProfileSettings(
    profileId,
    state.settings.vitamins_by_profile[profileId],
  );
  return state.settings.vitamins_by_profile[profileId];
}

function getVitaminItems(profileId = getVitaminProfileId()) {
  const defaultItems = VITAMIN_ITEMS_BY_PROFILE[profileId] ?? [];
  return defaultItems.filter((item) => item.schedule !== "optional" || !getVitaminProfileSettings(profileId).coq10_finished);
}

function syncVitaminsPanelVisibility(isPrivateVisible = Boolean(cloudState.user)) {
  if (!vitaminsModal) return;
  const shouldShow = Boolean(isPrivateVisible && cloudState.user && state.vitaminsPanelOpen);
  vitaminsModal.classList.toggle("hidden", !shouldShow);
  vitaminsModal.setAttribute("aria-hidden", shouldShow ? "false" : "true");
}

function openVitaminsPanel() {
  if (!vitaminsModal || !cloudState.user) return;
  state.vitaminsPanelOpen = true;
  renderVitaminsPanel();
  syncVitaminsPanelVisibility(true);
}

function closeVitaminsPanel() {
  if (!vitaminsModal) return;
  state.vitaminsPanelOpen = false;
  syncVitaminsPanelVisibility();
}

function renderVitaminsPanel() {
  if (!vitaminsPanel) return;
  const profileId = getVitaminProfileId();
  const profile = getProfile(profileId) ?? getDefaultProfile(profileId);
  const items = getVitaminItems(profileId);

  if (vitaminsSubtitle) vitaminsSubtitle.textContent = `${profile.name}: weekly tablet organiser`;

  vitaminsEmptyState?.classList.toggle("hidden", items.length > 0);
  vitaminsMainSection?.classList.toggle("hidden", items.length === 0);
  vitaminsWeeklySection?.classList.toggle("hidden", items.length === 0);
  if (vitaminsMainBody) vitaminsMainBody.innerHTML = renderVitaminMainRows(items);
  if (vitaminsWeeklyBody) vitaminsWeeklyBody.innerHTML = renderVitaminWeeklyRows(profileId, items);
  setEditingAvailability();
}

function renderVitaminMainRows(items) {
  return items
    .map(
      (item) => `
        <tr>
          <td data-label="Timing">${escapeHtml(item.timing)}</td>
          <td data-label="Item">
            <strong>${escapeHtml(item.item)}</strong>
            <span class="vitamin-type ${escapeHtml(item.schedule)}">${escapeHtml(getVitaminScheduleLabel(item))}</span>
          </td>
          <td data-label="Quantity">${escapeHtml(item.quantity)}</td>
          <td data-label="Frequency / Days">${escapeHtml(item.frequency)}</td>
          <td data-label="Notes">${escapeHtml(item.notes)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderVitaminWeeklyRows(profileId, items) {
  return VITAMIN_TIMINGS.map((timing) => {
    const timingItems = items.filter((item) => item.timing === timing);
    return `
      <tr>
        <th data-label="Timing">${escapeHtml(timing)}</th>
        ${VITAMIN_WEEK_DAYS.map((day) => {
          const dayItems = timingItems.filter((item) => shouldShowVitaminItemOnDate(profileId, item, day.key));
          const cellContent = dayItems.length
            ? dayItems.map((item) => renderVitaminCellItem(profileId, item, day.key)).join("")
            : "<span class=\"vitamin-empty-cell\">-</span>";
          return `<td data-label="${escapeHtml(day.label)}">${cellContent}</td>`;
        }).join("")}
      </tr>
    `;
  }).join("");
}

function renderVitaminCellItem(profileId, item, dayKey) {
  const label = item.schedule === "optional" ? `${item.item} optional` : item.item;
  const doseText = getVitaminDoseText(item);
  return `
    <button class="vitamin-cell-item ${escapeHtml(item.schedule)}" type="button" data-vitamin-dose="${escapeHtml(doseText)}" title="${escapeHtml(doseText)}" aria-label="${escapeHtml(`${label}. ${doseText}`)}">
      ${escapeHtml(label)}
    </button>
  `;
}

function getVitaminDoseText(item) {
  return `${item.item}: ${item.quantity}`;
}

function showVitaminDoseFeedback(message) {
  if (!vitaminsDoseFeedback) return;
  vitaminsDoseFeedback.textContent = message;
  vitaminsDoseFeedback.classList.add("visible");
}

function shouldShowVitaminItemOnDate(profileId, item, dayKey) {
  if (item.schedule === "daily") return true;
  if (item.schedule === "fixed") return item.days.includes(dayKey);
  if (item.schedule === "every_other_day") return item.days.includes(dayKey);
  if (item.schedule === "optional") return true;
  return false;
}

function isEveryOtherDayDose(profileId, date) {
  const nextDose = parseDateString(getVitaminProfileSettings(profileId).next_red_yeast_rice_dose_date);
  if (!nextDose || !date) return false;
  const days = daysBetween(nextDose, date);
  return days >= 0 && days % 2 === 0;
}

function getVitaminScheduleLabel(item) {
  if (item.schedule === "daily") return "Daily";
  if (item.schedule === "fixed" && item.days.length === 1) return "Weekly";
  if (item.schedule === "fixed") return "Twice weekly";
  if (item.schedule === "every_other_day") return "Every other day";
  if (item.schedule === "optional") return "Optional";
  return "Scheduled";
}

function printVitaminsPanel() {
  if (typeof window.print === "function") window.print();
}

function renderMobileActions(dueCount) {
  if (!mobileActionBar) return;
  if (!cloudState.user) {
    mobileActionBar.innerHTML = "";
    mobileActionBar.classList.remove("has-due");
    return;
  }
  const actions = [
    { key: "home", label: "Home", count: dueCount },
    { key: "menu", label: "Menu" },
    { key: "add", label: "Add", primary: true },
    { key: "trends", label: "Trends" },
    { key: "results", label: "Results" },
  ];
  mobileActionBar.classList.toggle("has-due", dueCount > 0);
  mobileActionBar.innerHTML = actions
    .map((action) => {
      const isActive = state.mobileView === action.key;
      const classes = [isActive ? "active" : "", action.primary && isActive ? "primary" : ""]
        .filter(Boolean)
        .join(" ");
      const label = `${escapeHtml(action.label)}${action.count ? `<span class="mobile-tab-badge">${escapeHtml(action.count)}</span>` : ""}`;
      return `<button class="${classes}" type="button" data-mobile-action="${escapeHtml(action.key)}">${label}</button>`;
    })
    .join("");
}

function isMobileLayout() {
  return Boolean(window.matchMedia?.("(max-width: 700px)").matches);
}

function setMobileOnlyHidden(element, isHidden) {
  if (!element) return;
  element.classList.toggle("mobile-view-hidden", isHidden);
}

function renderMobileLayout() {
  const mobile = isMobileLayout();
  const signedIn = Boolean(cloudState.user);
  const selectedView = signedIn ? state.mobileView || "home" : "home";
  const allMobileSections = [
    profileSection,
    onboardingPanel,
    snapshotSection,
    statusStrip,
    scheduleSection,
    contentGrid,
    entryPanel,
    resultsPanel,
    trendViewPanel,
    resultsViewPanel,
    mobileMenuPanel,
  ];

  if (!mobile || !signedIn) {
    allMobileSections.forEach((section) => setMobileOnlyHidden(section, false));
    contentGrid?.classList.remove("mobile-single-view");
    resultsPanel?.classList.remove("mobile-tab-surface");
    return;
  }

  const onHome = selectedView === "home";
  const onAdd = selectedView === "add";
  const onTrends = selectedView === "trends";
  const onResults = selectedView === "results";
  const onMenu = selectedView === "menu";

  setMobileOnlyHidden(profileSection, !onHome);
  setMobileOnlyHidden(onboardingPanel, !onHome);
  setMobileOnlyHidden(snapshotSection, !onHome);
  setMobileOnlyHidden(statusStrip, !onHome);
  setMobileOnlyHidden(scheduleSection, !onHome);
  setMobileOnlyHidden(contentGrid, !(onAdd || onTrends || onResults));
  setMobileOnlyHidden(entryPanel, !onAdd);
  setMobileOnlyHidden(resultsPanel, !(onTrends || onResults));
  setMobileOnlyHidden(trendViewPanel, !onTrends);
  setMobileOnlyHidden(resultsViewPanel, !onResults);
  setMobileOnlyHidden(mobileMenuPanel, !onMenu);
  contentGrid?.classList.toggle("mobile-single-view", onAdd || onTrends || onResults);
  resultsPanel?.classList.toggle("mobile-tab-surface", onTrends || onResults);
}

function setMobileView(view, options = {}) {
  if (!cloudState.user) {
    state.mobileView = "home";
    renderMobileActions(0);
    renderMobileLayout();
    return;
  }
  const allowedViews = new Set(["home", "add", "trends", "results", "menu"]);
  state.mobileView = allowedViews.has(view) ? view : "home";
  renderMobileActions(getDueCount());
  renderMobileLayout();

  if (!isMobileLayout() || options.scroll === false) return;
  const target = {
    home: snapshotSection ?? profileSection,
    add: form,
    trends: resultsPanel,
    results: resultsPanel,
    menu: mobileMenuPanel,
  }[state.mobileView];
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (state.mobileView === "add" && options.focusValue !== false) focusCurrentEntryControl();
}

function renderSummary() {
  const latestByMetric = new Map();
  [...visibleResults()]
    .sort((a, b) => b.sample_date.localeCompare(a.sample_date))
    .forEach((result) => {
      const key = `${result.profile_id}:${result.metric}`;
      if (!latestByMetric.has(key)) latestByMetric.set(key, result);
    });

  markerSummary.innerHTML = [...latestByMetric.values()]
    .slice(0, 4)
    .map((result) => `
      <article class="summary-card" role="button" tabindex="0" data-summary-metric="${escapeHtml(result.metric)}">
        <strong>${escapeHtml(result.person_name)} · ${escapeHtml(result.metric)}</strong>
        <span>${escapeHtml(formatValue(result.result_value, result.unit))} · ${escapeHtml(result.status_vs_range)}</span>
      </article>
    `)
    .join("");
}

function setFilter(filter, summaryKey = filter) {
  state.filter = filter;
  state.activeSummaryFilter = summaryKey;
  document.querySelectorAll(".filter-button").forEach((item) => {
    item.classList.toggle("active", item.dataset.filter === filter);
  });
  renderSummarySelection();
  render();
}

function renderSummarySelection() {
  document.querySelectorAll("[data-summary-filter]").forEach((item) => {
    item.classList.toggle("active", (item.dataset.summaryKey ?? item.dataset.summaryFilter) === state.activeSummaryFilter);
  });
}

function getNextDueSummary() {
  const scheduleItems = getScheduleItems();
  const overdueItems = scheduleItems.filter((item) => item.due.state === "overdue");
  if (overdueItems.length) {
    const nextDate = overdueItems
      .map((item) => item.due.nextDate)
      .filter(Boolean)
      .sort((a, b) => a - b)[0];
    return {
      label: nextDate ? formatDate(toDateString(nextDate)) : "Overdue",
      relative: nextDate ? formatRelativeDueLabel(nextDate) : "overdue now",
      state: "overdue",
    };
  }
  if (scheduleItems.some((item) => item.due.state === "due")) return { label: "Today", relative: "due today", state: "due" };
  const next = scheduleItems
    .map((item) => item.due.nextDate)
    .filter(Boolean)
    .sort((a, b) => a - b)[0];
  return next
    ? { label: formatDate(toDateString(next)), relative: formatRelativeDueLabel(next), state: "future" }
    : { label: "-", relative: "nothing scheduled", state: "none" };
}

function formatRelativeDueLabel(date) {
  const days = daysBetween(new Date(), date);
  if (days < 0) {
    const overdueDays = Math.abs(days);
    return `overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`;
  }
  if (days === 0) return "due today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

function getDueCount() {
  return getScheduleItems().filter((item) => ["due", "soon", "overdue"].includes(item.due.state)).length;
}

function focusMetricEntry(profileId, metricName) {
  const profile = getProfile(profileId);
  const selectedMetric = getMetric(metricName, profileId);
  if (!profile || !selectedMetric) return;

  state.activeProfileId = profile.id;
  populatePeople();
  personInput.value = profile.id;
  metricInput.value = selectedMetric.name;
  setTodayDefaults();
  syncMetricDefaults();
  syncRangeDefaults();
  syncSourceDefaults();
  renderQuickMetrics();
  if (isMobileLayout()) setMobileView("add", { scroll: false, focusValue: false });
  focusEntryPanel();
}

function focusEntryPanel() {
  if (isMobileLayout()) setMobileView("add", { scroll: false });
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  focusCurrentEntryControl();
}

function focusCurrentEntryControl() {
  const selectedMetric = getMetric(metricInput.value, getSelectedProfile()?.id);
  if (isCompletionMetric(selectedMetric)) {
    nextDueInput?.focus();
    return;
  }
  valueInput.focus();
}

function focusDuePanel() {
  if (isMobileLayout()) state.mobileView = "home";
  setFilter("due");
  schedulePanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function focusCurrentResults() {
  if (isMobileLayout()) state.mobileView = "results";
  setFilter("latest");
  resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleActionShortcut(action) {
  if (!cloudState.user && ["home", "add", "trends", "results", "menu", "due", "current", "import", "review", "vitamins"].includes(action)) {
    return;
  }
  if (action === "add") {
    focusEntryPanel();
    return;
  }
  if (["home", "trends", "results", "menu"].includes(action)) {
    setMobileView(action);
    return;
  }
  if (action === "due") {
    focusDuePanel();
    return;
  }
  if (action === "current") {
    focusCurrentResults();
    return;
  }
  if (action === "import") {
    importChatGptInput.click();
    return;
  }
  if (action === "review") {
    exportReviewPackButton.click();
    return;
  }
  if (action === "vitamins") {
    openVitaminsPanel();
  }
}

function handleMenuAction(action) {
  if (!cloudState.user) return;
  if (action === "import-gpt") {
    if (importChatGptButton.disabled) return;
    importChatGptInput.click();
    return;
  }
  if (action === "ai-review") {
    exportReviewPack();
    return;
  }
  if (action === "csv") {
    exportCsv();
    return;
  }
  if (action === "telegram") openTelegramPanel();
  if (action === "vitamins") openVitaminsPanel();
}

function activateSummaryFilter(card) {
  const nextFilter = card.dataset.summaryFilter;
  const summaryKey = card.dataset.summaryKey ?? nextFilter;
  if (isMobileLayout()) state.mobileView = nextFilter === "due" ? "home" : "results";
  setFilter(nextFilter, summaryKey);
  if (isMobileLayout() && nextFilter === "due") {
    schedulePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function explainWarning(resultId) {
  const result = state.results.find((item) => item.id === resultId);
  if (!result) return;
  const label = getResultTarget(result) !== null && (getResultReferenceLower(result) !== null || getResultReferenceUpper(result) !== null)
    ? "Reference/target"
    : getResultTarget(result) !== null
      ? "Target"
      : "Reference";
  const message = [
    `${result.metric}: ${formatValue(result.result_value, result.unit)}`,
    `Status: ${result.status_vs_range}`,
    `${label}: ${formatRangeOrTarget(result)}`,
    `Date: ${formatDate(result.sample_date)}`,
  ];
  if (result.previous_result !== null && result.previous_result !== undefined) {
    message.push(`Previous: ${formatValue(result.previous_result, result.unit)}`);
    message.push(`Change: ${formatChange(result.absolute_change_since_previous_test, result)} (${formatPercent(result.percentage_change_since_previous_test, result)})`);
  }
  const medicalNote = getMetricMedicalNote(result.metric);
  if (medicalNote) {
    message.push("");
    message.push(medicalNote);
  }
  window.alert(message.join("\n"));
}

function getMetricMedicalNote(metricName) {
  const note = metricContextNotes[metricName] ?? getFallbackMetricContext(metricName);
  return note ? `Medical context: ${note}` : "";
}

function getFallbackMetricContext(metricName) {
  const selectedMetric = getMetric(metricName);
  if (!selectedMetric) return "";
  return `${selectedMetric.name} is tracked in the ${getDisplayGroupForMetric(metricName).toLowerCase()} group. Interpret the result with the lab range, previous results, symptoms, timing, and the wider trend rather than one isolated value.`;
}

function showMetricContext(metricName) {
  const selectedMetric = getMetric(metricName);
  if (!metricContextModal || !selectedMetric) return;
  const rawNote = metricContextNotes[metricName] ?? getFallbackMetricContext(metricName);
  metricContextTitle.textContent = selectedMetric.name;
  metricContextSubtitle.textContent = `${getDisplayGroupForMetric(metricName)} · ${selectedMetric.cadence}`;
  metricContextContent.innerHTML = `
    <p>${escapeHtml(rawNote)}</p>
    <div class="context-meta">
      <span>${escapeHtml(selectedMetric.type === "qualitative" ? "Qualitative metric" : "Numeric metric")}</span>
      <span>${escapeHtml(isCompletionMetric(selectedMetric) ? "Completion based" : isTargetMetric(metricName) ? "Target based" : "Reference range based")}</span>
      <span>${escapeHtml(getDefaultSourceType(metricName))}</span>
    </div>
    <p class="privacy-note">General prevention context only. Use persistent, marked, symptomatic, or concerning changes as prompts for clinician discussion.</p>
  `;
  metricContextModal.classList.remove("hidden");
  metricContextModal.setAttribute("aria-hidden", "false");
}

function closeMetricContext() {
  if (!metricContextModal) return;
  metricContextModal.classList.add("hidden");
  metricContextModal.setAttribute("aria-hidden", "true");
}

function getStatusClass(status) {
  if (status === "Outside range") return "bad";
  if (status === "Near limit" || status === "Above target" || status === "Below target") return "near";
  if (status === "In range" || status === "On target") return "ok";
  if (status === "Recorded") return "recorded";
  return "neutral";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showSaveFeedback(metricName) {
  if (saveFeedback) {
    saveFeedback.textContent = `${metricName} added to tracker.`;
    saveFeedback.classList.add("visible");
    if (typeof clearTimeout === "function") clearTimeout(state.saveFeedbackTimer);
    if (typeof setTimeout === "function") {
      state.saveFeedbackTimer = setTimeout(() => saveFeedback.classList.remove("visible"), 4500);
    }
  }

  if (!entrySubmitButton) return;
  state.entrySaveLocked = true;
  entrySubmitButton.disabled = true;
  entrySubmitButton.textContent = "Added";
  if (typeof clearTimeout === "function") clearTimeout(state.entryUnlockTimer);
  if (typeof setTimeout === "function") {
    state.entryUnlockTimer = setTimeout(unlockEntrySubmit, 1200);
  } else {
    unlockEntrySubmit();
  }
}

function unlockEntrySubmit() {
  state.entrySaveLocked = false;
  if (!entrySubmitButton) return;
  entrySubmitButton.textContent = "Add to tracker";
  entrySubmitButton.disabled = isReadOnlyMode();
}

function addResult(event) {
  event.preventDefault();
  if (state.entrySaveLocked) return;
  if (!assertCanEdit()) return;

  const profile = getProfile(personInput.value);
  const selectedMetric = getMetric(metricInput.value, profile?.id);
  if (!selectedMetric || !profile) return;
  if (!isMetricTrackedForProfile(selectedMetric, profile.id)) {
    window.alert("Track this metric again before adding a measurement.");
    return;
  }
  const isCompletion = isCompletionMetric(selectedMetric);

  const resultValue = isCompletion ? "Completed" : parseResultValue(valueInput.value, selectedMetric.type);
  if (resultValue === null || resultValue === "") return;
  if (isCompletion && !completionInput.checked) {
    window.alert("Tick completed before saving this health check.");
    return;
  }

  const measurementDate = testDateInput.value;
  const completionNextDueDate = getCompletionResultNextDueDate(selectedMetric, measurementDate);
  if (isCompletion && !completionNextDueDate) {
    window.alert("Enter the next due or expiry date before saving this health check.");
    return;
  }
  const referenceFields = isCompletion ? { lower: false, target: false, upper: false } : getReferenceOptionValues();
  const result = {
    id: getId(),
    profile_id: profile.id,
    person_name: profile.name,
    test_date: measurementDate,
    sample_date: measurementDate,
    metric: selectedMetric.name,
    group: selectedMetric.group,
    metric_type: selectedMetric.type,
    result_value: resultValue,
    unit: isCompletion ? "" : unitInput.value.trim(),
    reference_lower_limit: referenceFields.lower ? parseLimit(lowInput.value) : null,
    target_value: referenceFields.target ? parseLimit(targetInput.value) : null,
    reference_upper_limit: referenceFields.upper ? parseLimit(highInput.value) : null,
    reference_fields: referenceFields,
    priority: selectedMetric.priority,
    cadence: selectedMetric.cadence,
    interval_days: selectedMetric.intervalDays,
    trend_goal: selectedMetric.goal,
    status_vs_range: null,
    previous_result: null,
    absolute_change_since_previous_test: null,
    percentage_change_since_previous_test: null,
    trend_direction: "first",
    completed: isCompletion ? true : undefined,
    next_due_date: isCompletion ? completionNextDueDate : undefined,
    expiry_date: isCompletion && selectedMetric.manualNextDueDate ? completionNextDueDate : undefined,
    notes: notesInput.value.trim(),
    source_type: sourceTypeInput.value,
    source_confidence: sourceConfidenceInput.value,
    source_notes: sourceNotesInput.value.trim(),
    linked_source_document: sourceDocumentInput.value.trim(),
  };

  state.results.push(result);
  delete state.scheduleState.snoozes[getSnoozeKey(profile.id, selectedMetric.name)];
  if (!isCompletion) saveRangeForResult(result);
  state.schedulePage = 1;
  saveScheduleState();
  saveResults();
  form.reset();
  setTodayDefaults();
  populatePeople();
  metricInput.value = selectedMetric.name;
  syncMetricDefaults();
  syncSourceDefaults();
  renderQuickMetrics();
  render();
  showSaveFeedback(selectedMetric.name);
}

function saveProfile(event) {
  event.preventDefault();
  if (!assertCanEdit()) return;

  state.profiles = state.profiles.map((profile) => {
    const prefix = profile.id;
    const name = document.querySelector(`#${prefix}Name`).value.trim() || profile.name;
    const dateOfBirth = document.querySelector(`#${prefix}Dob`).value;
    const height = document.querySelector(`#${prefix}Height`).value;
    return {
      ...profile,
      name,
      date_of_birth: dateOfBirth,
      height_cm: height,
    };
  });

  state.results = state.results.map((result) => {
    const profile = getProfile(result.profile_id);
    return profile ? { ...result, person_name: profile.name } : result;
  });
  saveProfiles();
  saveResults();
  state.editingProfiles = false;
  populatePeople();
  render();
}

function deleteResult(id) {
  if (!assertCanEdit()) return;
  state.results = state.results.filter((result) => result.id !== id);
  saveResults();
  render();
}

function getId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function exportCsv() {
  const header = [
    "profile_id",
    "person_name",
    "test_date",
    "sample_date",
    "metric",
    "result_value",
    "completed",
    "next_due_date",
    "expiry_date",
    "unit",
    "reference_lower_limit",
    "target_value",
    "reference_upper_limit",
    "reference_fields",
    "priority",
    "cadence",
    "interval_days",
    "trend_goal",
    "status_vs_range",
    "previous_result",
    "absolute_change_since_previous_test",
    "percentage_change_since_previous_test",
    "trend_direction",
    "notes",
    "source_type",
    "source_confidence",
    "source_notes",
    "linked_source_document",
  ];
  const rows = state.results
    .sort((a, b) => a.sample_date.localeCompare(b.sample_date) || a.metric.localeCompare(b.metric))
    .map((result) => header.map((key) => (key === "reference_fields" ? JSON.stringify(result.reference_fields ?? {}) : result[key] ?? "")));

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = getExportFilename("results", "csv");
  link.click();
  URL.revokeObjectURL(url);
}

function exportForChatGpt() {
  const now = new Date().toISOString();
  const scopedResults = state.results;
  const dueItems = getScheduleItems(null).filter((item) => ["due", "soon", "overdue"].includes(item.due.state));
  const latestResults = getLatestResultsForExport(scopedResults);
  const warnings = latestResults.filter(isActionableWarning);
  const cautions = latestResults.filter(isActionableCaution);
  const riskContextResults = latestResults.filter(isRiskContextResult);
  const importSchema = getChatGptImportInstructions();
  const exportScope = getExportScopeLabel();

  const lines = [
    "# Preventative Health Dashboard Export",
    "",
    `Exported: ${now}`,
    `Scope: all available data for ${exportScope}`,
    "",
    "## Purpose",
    "",
    "This dashboard is for long-term preventative health trend analysis. It focuses on cardiovascular, metabolic, hormonal, fitness, blood and urine trends. It is not intended to diagnose disease. STI and immunoserology tests are intentionally excluded.",
    "",
    "## How To Use This Export",
    "",
    "Please review longitudinal trends, range warnings, near-limit values, due or overdue monitoring, and meaningful changes since previous measurements. Prioritise prevention and trend context over single isolated values.",
    "",
    "If I upload a lab report or health data file after this export, extract only relevant prevention-dashboard data and return a single JSON file using the schema below. Do not include STI or immunoserology tests. Do not invent values that are not present in the source file.",
    "",
    "## ChatGPT Import JSON Schema",
    "",
    "Return only valid JSON. The prevention log can import this structure directly:",
    "",
    "```json",
    importSchema,
    "```",
    "",
    "Allowed metric names:",
    "",
    metrics.map((item) => `- ${item.name}`).join("\n"),
    "",
    "## People",
    "",
    ...state.profiles.map(
      (profile) =>
        `- ${profile.name}: date of birth ${profile.date_of_birth || "not set"}, age ${
          profile.date_of_birth ? calculateAge(profile.date_of_birth) : "-"
        }, height ${profile.height_cm ? `${profile.height_cm} cm` : "not set"}`,
    ),
    "",
    "## Current Range Warnings",
    "",
    ...(warnings.length
      ? warnings.map(formatResultForExport)
      : ["- No range warnings in the selected data."]),
    "",
    "## Current Range Cautions",
    "",
    ...(cautions.length
      ? cautions.map(formatResultForExport)
      : ["- No range cautions in the selected data."]),
    "",
    "## Risk Context",
    "",
    ...(riskContextResults.length
      ? riskContextResults.map(
          (result) =>
            `${formatResultForExport(result)}; interpretation note: inherited or relatively stable context marker, not treated as an active dashboard warning.`,
        )
      : ["- No inherited or stable risk-context markers recorded."]),
    "",
    "## Due Or Overdue",
    "",
    ...(dueItems.length
      ? dueItems.map(
          (item) =>
            `- ${item.profile.name}: ${item.metric.name} (${item.metric.cadence}) - ${item.due.label}`,
        )
      : ["- No priority metrics are currently due or overdue."]),
    "",
    "## Latest Measurement Per Metric",
    "",
    ...(latestResults.length ? latestResults.map(formatResultForExport) : ["- No measurements recorded."]),
    "",
    "## All Measurements",
    "",
    ...(scopedResults.length ? scopedResults.map(formatResultForExport) : ["- No measurements recorded."]),
    "",
  ];

  downloadText(
    getExportFilename("", "md"),
    lines.join("\n"),
    "text/markdown",
  );
}

function exportReviewPack() {
  const now = new Date().toISOString();
  const dueItems = getScheduleItems(null).filter((item) => ["due", "soon", "overdue"].includes(item.due.state));
  const materialChanges = getMaterialChanges(state.results);
  const exportScope = getExportScopeLabel();
  const latestResults = getLatestResultsForExport(state.results);
  const warnings = latestResults.filter(isActionableWarning);
  const cautions = latestResults.filter(isActionableCaution);
  const riskContextResults = latestResults.filter(isRiskContextResult);

  const lines = [
    "# Prepare AI Review",
    "",
    `Exported: ${now}`,
    `Scope: focused AI review brief for ${exportScope}`,
    "",
    "## Instructions For ChatGPT",
    "",
    "Review this as a long-term preventative health dashboard, not as a diagnostic system. Focus on trends, cardiovascular/metabolic prevention, due monitoring, and changes worth discussing with a clinician if persistent or clinically relevant.",
    "",
    "Do not suggest excessive testing. Prefer practical next steps, questions to clarify context, and year-on-year interpretation. STI and immunoserology tests are intentionally excluded from this project.",
    "",
    "## Current Snapshot",
    "",
    `- Active warnings: ${warnings.length}`,
    `- Active cautions: ${cautions.length}`,
    `- Due or overdue items: ${dueItems.length}`,
    `- Material changes: ${materialChanges.length}`,
    `- Latest measurements tracked: ${latestResults.length}`,
    "",
    "## Range Warnings",
    "",
    ...(warnings.length ? warnings.map(formatResultForExport) : ["- No current range warnings."]),
    "",
    "## Range Cautions",
    "",
    ...(cautions.length ? cautions.map(formatResultForExport) : ["- No current range cautions."]),
    "",
    "## Risk Context",
    "",
    ...(riskContextResults.length
      ? riskContextResults.map(
          (result) =>
            `${formatResultForExport(result)}; interpretation note: inherited or relatively stable context marker, not treated as an active dashboard warning.`,
        )
      : ["- No inherited or stable risk-context markers recorded."]),
    "",
    "## Due Or Overdue Monitoring",
    "",
    ...(dueItems.length
      ? dueItems.map(
          (item) =>
            `- ${item.profile.name}: ${item.metric.name} (${item.metric.cadence}) - ${item.due.label}`,
        )
      : ["- No priority metrics are due or overdue."]),
    "",
    "## Material Changes",
    "",
    ...(materialChanges.length ? materialChanges.map(formatResultForExport) : ["- No material changes detected using the current threshold."]),
    "",
    "## Latest Results",
    "",
    ...(latestResults.length ? latestResults.map(formatResultForExport) : ["- No measurements recorded."]),
    "",
    "## Threshold Used",
    "",
    "- Numeric results: included when percentage change is at least 10%, trend is meaningfully worse, or status is an actionable near/outside range or target warning.",
    "- Lp(a) and similar stable inherited markers are kept as risk context rather than active warnings.",
    "- Small in-range vital-sign movements are treated cautiously because single readings and wearable estimates can vary.",
    "- Qualitative results: included when changed.",
    "- Metric context notes are available in the app and in METRIC_CONTEXT_NOTES.md; use cautious, non-diagnostic language.",
    "",
  ];

  downloadText(
    getExportFilename("AI review", "md"),
    lines.join("\n"),
    "text/markdown",
  );
}

function getExportFilename(label, extension, date = new Date()) {
  const person = getExportFilePersonName();
  const dateText = formatExportDateForFilename(date);
  const middle = label ? ` ${label}` : "";
  return `health dashboard ${person}${middle} ${dateText}.${extension}`;
}

function getExportFilePersonName() {
  const profile =
    (cloudState.profileId && getProfile(cloudState.profileId)) ||
    (state.activeProfileId && getProfile(state.activeProfileId)) ||
    (state.profiles.length === 1 ? state.profiles[0] : null);
  if (!profile && state.profiles.length > 1) return "All";
  return getCanonicalProfileName(profile);
}

function getCanonicalProfileName(profile) {
  if (!profile) return "Health";
  if (profile.id === "ben") return "Ben";
  if (profile.id === "angelika" || profile.id === "angelica") return "Angelika";
  return sanitiseFilenamePart(profile.name || profile.id || "Health");
}

function formatExportDateForFilename(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function sanitiseFilenamePart(value) {
  return String(value).trim().replace(/[^a-z0-9]+/gi, " ").replace(/\s+/g, " ").trim() || "Health";
}

function getExportScopeLabel() {
  const names = state.profiles.map((profile) => profile.name).filter(Boolean);
  if (names.length === 0) return "this private account";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function getMaterialChanges(results) {
  return results
    .filter((result) => result.previous_result !== null && result.previous_result !== undefined)
    .filter((result) => {
      if (isRiskContextResult(result)) return false;
      if (result.metric_type === "qualitative") return result.trend_direction === "changed";
      const previous = getPreviousResult(result, results);
      if (inRangeStableTrendMetrics.has(result.metric) && getStatusForTrend(result) === "In range" && getStatusForTrend(previous) === "In range") {
        return false;
      }
      const percent = Math.abs(Number(result.percentage_change_since_previous_test));
      return (
        result.trend_direction === "Worse" ||
        isActionableFlag(result) ||
        (Number.isFinite(percent) && percent >= 10)
      );
    })
    .sort((a, b) => b.sample_date.localeCompare(a.sample_date));
}

function getChatGptImportInstructions() {
  return JSON.stringify(
    {
      import_type: "health_dashboard_measurements",
      version: 1,
      notes: "Use the profile_id values already present in the export. Prefer date for the measurement date. result_date and sample_date are also accepted for compatibility. Use null for missing lower, target, or upper reference fields. Include reference_fields to say which reference fields apply. Include source_type, source_confidence, source_notes, and linked_source_document where available. Keep qualitative urine values as text such as Negative or Rare. Exclude STI and immunoserology tests.",
      measurements: [
        {
          profile_id: "ben",
          date: "YYYY-MM-DD",
          metric: "LDL",
          result_value: 123,
          unit: "mg/dL",
          reference_lower_limit: null,
          target_value: null,
          reference_upper_limit: 115,
          reference_fields: {
            lower: false,
            target: false,
            upper: true,
          },
          source_type: "Lab Report / PDF",
          source_confidence: "High",
          source_notes: "Optional source/context note",
          linked_source_document: "Optional report filename or link",
          notes: "Optional source/context note",
        },
      ],
      reference_ranges: [
        {
          profile_id: "ben",
          metric: "LDL",
          reference_lower_limit: null,
          target_value: null,
          reference_upper_limit: 115,
          reference_fields: {
            lower: false,
            target: false,
            upper: true,
          },
        },
      ],
    },
    null,
    2,
  );
}

function importFromChatGptFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const review = prepareChatGptImport(parsed);
      renderImportReview(review);
    } catch (error) {
      window.alert(`Import failed: ${error.message}`);
    } finally {
      importChatGptInput.value = "";
    }
  });
  reader.readAsText(file);
}

function prepareChatGptImport(payload) {
  if (!payload || payload.import_type !== "health_dashboard_measurements") {
    throw new Error("This does not look like a health dashboard import file.");
  }

  const incomingMeasurements = Array.isArray(payload.measurements) ? payload.measurements : [];
  const incomingRanges = Array.isArray(payload.reference_ranges) ? payload.reference_ranges : [];
  const prepared = {
    measurements: [],
    ranges: [],
    skipped: [],
  };
  const seenMeasurementKeys = new Set();

  incomingRanges.forEach((range) => {
    const profile = resolveImportProfile(range);
    const selectedMetric = getMetric(range.metric, profile?.id);
    if (!profile || !selectedMetric) {
      prepared.skipped.push({ reason: "Unknown profile or metric", item: range });
      return;
    }
    const importedRangeTarget = parseLimit(range.target_value ?? (isTargetMetric(selectedMetric.name) ? range.reference_upper_limit : null));
    const importedRangeHigh = parseLimit(isTargetMetric(selectedMetric.name) && range.target_value === undefined ? null : range.reference_upper_limit);
    if (isCompletionMetric(selectedMetric)) return;
    prepared.ranges.push({
      profile_id: profile.id,
      person_name: profile.name,
      metric: selectedMetric.name,
      low: parseLimit(range.reference_lower_limit),
      target: importedRangeTarget,
      high: importedRangeHigh,
      fields: normaliseReferenceFields(range.reference_fields, selectedMetric, {
        low: parseLimit(range.reference_lower_limit),
        target: importedRangeTarget,
        high: importedRangeHigh,
      }),
    });
  });

  incomingMeasurements.forEach((item) => {
    const profile = resolveImportProfile(item);
    const selectedMetric = getMetric(item.metric, profile?.id);
    if (!profile || !selectedMetric) {
      prepared.skipped.push({ reason: "Unknown profile or metric", item });
      return;
    }

    const resultValue = isCompletionMetric(selectedMetric)
      ? "Completed"
      : parseResultValue(item.result_value, selectedMetric.type);
    if (resultValue === null || resultValue === "") {
      prepared.skipped.push({ reason: "Missing or invalid result value", item });
      return;
    }
    const sourceType = item.source_type || getDefaultSourceType(selectedMetric.name);
    const importedTarget = parseLimit(item.target_value ?? (isTargetMetric(selectedMetric.name) ? item.reference_upper_limit : null));
    const importedHigh = parseLimit(isTargetMetric(selectedMetric.name) && item.target_value === undefined ? null : item.reference_upper_limit);

    const importedNextDueDate = item.next_due_date ?? item.nextDueDate ?? item.expiry_date ?? item.expiryDate ?? "";
    const result = {
      id: getId(),
      profile_id: profile.id,
      person_name: profile.name,
      test_date: item.date || item.result_date || item.test_date || item.sample_date,
      sample_date: item.date || item.sample_date || item.result_date || item.test_date,
      metric: selectedMetric.name,
      group: selectedMetric.group,
      metric_type: selectedMetric.type,
      result_value: resultValue,
      completed: isCompletionMetric(selectedMetric) ? true : undefined,
      next_due_date: isCompletionMetric(selectedMetric)
        ? importedNextDueDate || getAutoCompletionNextDueDate(selectedMetric, item.date || item.sample_date || item.result_date || item.test_date)
        : undefined,
      expiry_date: isCompletionMetric(selectedMetric) && selectedMetric.manualNextDueDate ? importedNextDueDate : undefined,
      unit: isCompletionMetric(selectedMetric) ? "" : item.unit ?? selectedMetric.unit,
      reference_lower_limit: isCompletionMetric(selectedMetric) ? null : parseLimit(item.reference_lower_limit),
      target_value: isCompletionMetric(selectedMetric) ? null : importedTarget,
      reference_upper_limit: isCompletionMetric(selectedMetric) ? null : importedHigh,
      reference_fields: isCompletionMetric(selectedMetric) ? { lower: false, target: false, upper: false } : normaliseReferenceFields(item.reference_fields, selectedMetric, {
        low: parseLimit(item.reference_lower_limit),
        target: importedTarget,
        high: importedHigh,
      }),
      priority: selectedMetric.priority,
      cadence: selectedMetric.cadence,
      interval_days: selectedMetric.intervalDays,
      trend_goal: selectedMetric.goal,
      status_vs_range: null,
      previous_result: null,
      absolute_change_since_previous_test: null,
      percentage_change_since_previous_test: null,
      trend_direction: "first",
      notes: item.notes ?? "Imported from ChatGPT extraction.",
      source_type: sourceType,
      source_confidence: item.source_confidence || getSourceConfidence(sourceType),
      source_notes: item.source_notes ?? "",
      linked_source_document: item.linked_source_document ?? item.source_document ?? "",
    };

    if (!result.test_date || !result.sample_date) {
      prepared.skipped.push({ reason: "Missing date", item });
      return;
    }
    const duplicateKey = getMeasurementKey(result);
    if (isDuplicateMeasurement(result) || seenMeasurementKeys.has(duplicateKey)) {
      prepared.skipped.push({ reason: "Duplicate measurement already exists", item });
      return;
    }
    seenMeasurementKeys.add(duplicateKey);
    prepared.measurements.push(result);
  });

  return prepared;
}

function importChatGptPayload(payload) {
  return commitPreparedImport(prepareChatGptImport(payload));
}

function commitPreparedImport(prepared) {
  prepared.ranges.forEach((range) => {
    state.metricRanges[getRangeKey(range.profile_id, range.metric)] = {
      low: range.low,
      target: range.target,
      high: range.high,
      fields: range.fields,
      updated_at: new Date().toISOString(),
    };
  });

  prepared.measurements.forEach((result) => {
    state.results.push(result);
    if (!isCompletionMetric(result.metric)) saveRangeForResult(result);
  });

  saveMetricRanges();
  saveResults();
  syncRangeDefaults();
  render();

  return {
    measurementCount: prepared.measurements.length,
    rangeCount: prepared.ranges.length,
    skippedCount: prepared.skipped.length,
  };
}

function renderImportReview(review) {
  if (!assertCanEdit()) return;
  state.pendingImport = review;
  state.pendingImportPage = 1;
  confirmImportButton.disabled = !review.measurements.length && !review.ranges.length;
  renderImportReviewContent();
  importReviewModal.classList.remove("hidden");
  importReviewModal.setAttribute("aria-hidden", "false");
}

function renderImportReviewContent() {
  const review = state.pendingImport;
  if (!review) return;
  const totalMeasurements = review.measurements.length;
  const pageCount = Math.max(1, Math.ceil(totalMeasurements / IMPORT_REVIEW_PAGE_SIZE));
  state.pendingImportPage = Math.min(Math.max(state.pendingImportPage || 1, 1), pageCount);
  const page = state.pendingImportPage;
  const startIndex = (page - 1) * IMPORT_REVIEW_PAGE_SIZE;
  const endIndex = Math.min(startIndex + IMPORT_REVIEW_PAGE_SIZE, totalMeasurements);
  const measurementRows = review.measurements
    .slice(startIndex, endIndex)
    .map(
      (result) => `
        <tr>
          <td>${escapeHtml(result.person_name)}</td>
          <td>${escapeHtml(result.metric)}</td>
          <td>${escapeHtml(formatValue(result.result_value, result.unit))}</td>
          <td>${formatDate(result.sample_date)}</td>
          <td>${escapeHtml(formatRangeOrTarget(result))}</td>
          <td>${escapeHtml(result.source_confidence)} · ${escapeHtml(result.source_type)}</td>
        </tr>
      `,
    )
    .join("");
  const skippedRows = review.skipped
    .slice(0, 8)
    .map((item) => `<li><strong>${escapeHtml(item.reason)}</strong><span>${escapeHtml(formatSkippedImportItem(item.item))}</span></li>`)
    .join("");
  const skippedBreakdown = countSkippedReasons(review.skipped);
  const pagination =
    totalMeasurements > IMPORT_REVIEW_PAGE_SIZE
      ? `<div class="import-pagination" role="navigation" aria-label="Import measurement pages">
          <span>Showing ${startIndex + 1}-${endIndex} of ${totalMeasurements}</span>
          <div class="import-pagination-actions">
            <button class="mini-button" type="button" data-import-page="prev" ${page === 1 ? "disabled" : ""}>Previous</button>
            <span>Page ${page} of ${pageCount}</span>
            <button class="mini-button" type="button" data-import-page="next" ${page === pageCount ? "disabled" : ""}>Next</button>
          </div>
        </div>`
      : "";

  importReviewContent.innerHTML = `
    <div class="import-summary">
      <article><strong>${review.measurements.length}</strong><span>measurements ready</span></article>
      <article><strong>${review.ranges.length}</strong><span>ranges ready</span></article>
      <article><strong>${review.skipped.length}</strong><span>skipped</span></article>
    </div>
    ${
      review.skipped.length
        ? `<div class="import-breakdown">${Object.entries(skippedBreakdown)
            .map(([reason, count]) => `<span>${escapeHtml(reason)}: ${count}</span>`)
            .join("")}</div>`
        : ""
    }
    ${pagination}
    ${
      review.measurements.length
        ? `<div class="import-table-wrap"><table class="import-table"><thead><tr><th>Person</th><th>Metric</th><th>Value</th><th>Date</th><th>Range</th><th>Source</th></tr></thead><tbody>${measurementRows}</tbody></table></div>`
        : `<p>No measurements are ready to import.</p>`
    }
    ${review.skipped.length ? `<div class="import-skipped"><strong>Skipped items</strong><ul>${skippedRows}</ul></div>` : ""}
  `;
}

function setImportReviewPage(page) {
  if (!state.pendingImport) return;
  const totalPages = Math.max(1, Math.ceil(state.pendingImport.measurements.length / IMPORT_REVIEW_PAGE_SIZE));
  state.pendingImportPage = Math.min(Math.max(page, 1), totalPages);
  renderImportReviewContent();
}

function handleImportReviewNavigation(event) {
  const button = event.target.closest("[data-import-page]");
  if (!button || button.disabled) return;
  const direction = button.dataset.importPage;
  const nextPage = direction === "next" ? state.pendingImportPage + 1 : state.pendingImportPage - 1;
  setImportReviewPage(nextPage);
}

function countSkippedReasons(skippedItems) {
  return skippedItems.reduce((counts, item) => {
    counts[item.reason] = (counts[item.reason] ?? 0) + 1;
    return counts;
  }, {});
}

function formatSkippedImportItem(item) {
  if (!item || typeof item !== "object") return "No item details available";
  const person = item.profile_id || item.person_name || item.person || "unknown person";
  const metricName = item.metric || "unknown metric";
  const date = item.date || item.sample_date || item.result_date || item.test_date || "no date";
  const value = item.result_value ?? item.value ?? "no value";
  return `${person} · ${metricName} · ${value} · ${date}`;
}

function closeImportReview() {
  state.pendingImport = null;
  state.pendingImportPage = 1;
  importReviewContent.innerHTML = "";
  confirmImportButton.disabled = false;
  importReviewModal.classList.add("hidden");
  importReviewModal.setAttribute("aria-hidden", "true");
}

async function confirmReviewedImport() {
  if (!assertCanEdit()) return;
  if (!state.pendingImport) return;
  confirmImportButton.disabled = true;
  confirmImportButton.textContent = "Saving...";
  const imported = commitPreparedImport(state.pendingImport);
  const cloudSaved = await flushCloudSaveNow();
  closeImportReview();
  confirmImportButton.textContent = "Import reviewed data";
  const cloudText = cloudState.enabled && cloudState.user
    ? cloudSaved
      ? " Saved to cloud."
      : ` Imported locally, but cloud save did not complete: ${cloudState.lastError || "check sync status and refresh before leaving the app."}`
    : "";
  window.alert(
    `Imported ${imported.measurementCount} measurements and ${imported.rangeCount} reference ranges. Skipped ${imported.skippedCount}.${cloudText}`,
  );
}

function isDuplicateMeasurement(candidate) {
  return state.results.some(
    (result) => getMeasurementKey(result) === getMeasurementKey(candidate),
  );
}

function getMeasurementKey(result) {
  return `${result.profile_id}:${result.metric}:${result.sample_date}:${String(result.result_value)}`;
}

function resolveImportProfile(item) {
  const raw = String(item.profile_id || item.person_name || item.person || "").trim().toLowerCase();
  if (raw.includes("angelica") || raw.includes("angelika")) return getProfile("angelika");
  if (raw.includes("ben") || raw.includes("benjamin")) return getProfile("ben");
  return state.activeProfileId ? getProfile(state.activeProfileId) : null;
}

function getLatestResultsForExport(results) {
  const latestByMetric = new Map();
  [...results]
    .sort((a, b) => {
      const sampleSort = b.sample_date.localeCompare(a.sample_date);
      return sampleSort || b.test_date.localeCompare(a.test_date);
    })
    .forEach((result) => {
      const key = `${result.profile_id}:${result.metric}`;
      if (!latestByMetric.has(key)) latestByMetric.set(key, result);
    });
  return [...latestByMetric.values()];
}

function formatResultForExport(result) {
  const dueText = getResultStoredNextDueDate(result) ? `; next due ${getResultStoredNextDueDate(result)}` : "";
  return `- ${result.person_name}: ${result.metric} = ${formatValue(result.result_value, result.unit)} on ${result.sample_date}${dueText}; status ${result.status_vs_range}; reference/target ${formatRangeOrTarget(result)}; previous ${formatValue(result.previous_result, result.unit)}; change ${formatChange(result.absolute_change_since_previous_test, result)} (${formatPercent(result.percentage_change_since_previous_test, result)}); trend ${result.trend_direction}; cadence ${result.cadence}; source ${result.source_type ?? "not set"} (${result.source_confidence ?? "not set"})${result.linked_source_document ? `; document: ${result.linked_source_document}` : ""}${result.source_notes ? `; source notes: ${result.source_notes}` : ""}${result.notes ? `; notes: ${result.notes}` : ""}`;
}

function downloadText(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function setTodayDefaults() {
  const today = new Date().toISOString().slice(0, 10);
  testDateInput.value = today;
  sampleDateInput.value = today;
}

function clearLegacyData() {
  LEGACY_STORAGE_KEYS.forEach((key) => {
    if (localStorage.getItem(key) && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.removeItem(key);
    }
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol === "file:") return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js?v=0.69").catch(() => {});
  });
}

async function signInWithPassword(event) {
  event.preventDefault();
  if (!cloudState.client) return;
  const email = authEmail.value.trim();
  const password = authPassword.value;
  if (!email || !password) {
    window.alert("Enter email and password to sign in.");
    return;
  }

  authStatus.textContent = "Signing in...";
  const { error } = await cloudState.client.auth.signInWithPassword({ email, password });
  if (error) {
    authStatus.textContent = error.message;
    return;
  }
  authPassword.value = "";
}

async function sendMagicLink() {
  if (!cloudState.client) return;
  const email = authEmail.value.trim();
  if (!email) {
    window.alert("Enter your email address first.");
    return;
  }

  authStatus.textContent = "Sending magic link...";
  authRedirectMessage = "";
  const { error } = await cloudState.client.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });
  authStatus.textContent = error
    ? error.message
    : "Magic link sent. If links are rate-limited, wait before requesting another.";
}

async function signOut() {
  if (!cloudState.client || !cloudState.user) return;
  await cloudState.client.auth.signOut();
  window.location.reload();
}

profileForm.addEventListener("submit", saveProfile);
authForm.addEventListener("submit", signInWithPassword);
magicLinkButton.addEventListener("click", sendMagicLink);
personInput.addEventListener("change", () => {
  populateMetrics();
  populateTrendMetrics();
});
metricInput.addEventListener("change", () => {
  syncMetricDefaults();
  renderQuickMetrics();
});
if (trackingToggleButton) trackingToggleButton.addEventListener("click", toggleSelectedMetricTracking);
if (schedulePrevButton) schedulePrevButton.addEventListener("click", () => changeSchedulePage(-1));
if (scheduleNextButton) scheduleNextButton.addEventListener("click", () => changeSchedulePage(1));
testDateInput.addEventListener("change", syncCompletionDueFields);
function markCompletionNextDueEdited() {
  state.completionNextDueTouched = true;
  const selectedMetric = getMetric(metricInput.value, getSelectedProfile()?.id);
  if (completionHint && isCompletionMetric(selectedMetric)) {
    completionHint.textContent = nextDueInput.value
      ? `${selectedMetric.nextDueLabel ?? "Next due date"} set to ${formatDate(nextDueInput.value)}.`
      : getCompletionHint(selectedMetric, testDateInput.value);
  }
}

if (nextDueInput) {
  nextDueInput.addEventListener("input", markCompletionNextDueEdited);
  nextDueInput.addEventListener("change", markCompletionNextDueEdited);
}
metricSearchInput.addEventListener("input", populateMetrics);
quickMetricPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-metric-name]");
  if (!button) return;
  selectMetric(button.dataset.metricName);
  valueInput.focus();
});
sourceTypeInput.addEventListener("change", syncSourceConfidence);
focusEntryButton.addEventListener("click", () => {
  focusEntryPanel();
});
focusImportButton.addEventListener("click", () => importChatGptInput.click());
trendMetricInput.addEventListener("change", () => {
  state.activeTrendKey = trendMetricInput.value;
  renderTrends();
});
rangeEditButton.addEventListener("click", toggleRangeEditing);
[referenceLowerEnabled, targetEnabled, referenceUpperEnabled].forEach((checkbox) => {
  checkbox.addEventListener("change", syncRangeDefaults);
});
form.addEventListener("submit", addResult);
exportCsvButton.addEventListener("click", exportCsv);
if (exportChatGptButton) exportChatGptButton.addEventListener("click", exportForChatGpt);
exportReviewPackButton.addEventListener("click", exportReviewPack);
importChatGptButton.addEventListener("click", () => importChatGptInput.click());
importChatGptInput.addEventListener("change", () => importFromChatGptFile(importChatGptInput.files[0]));
cancelImportButton.addEventListener("click", closeImportReview);
discardImportButton.addEventListener("click", closeImportReview);
confirmImportButton.addEventListener("click", confirmReviewedImport);
manualRefreshButton.addEventListener("click", () => {
  if (cloudState.enabled && cloudState.user) loadCloudData();
  else window.location.reload();
});
signOutButton.addEventListener("click", signOut);
window.addEventListener("online", () => {
  renderSyncFooter();
  setEditingAvailability();
  if (cloudState.enabled && cloudState.user) loadCloudData();
});
window.addEventListener("offline", () => {
  renderSyncFooter();
  setEditingAvailability();
});
window.addEventListener("resize", renderMobileLayout);
importReviewModal.addEventListener("click", (event) => {
  if (event.target === importReviewModal) closeImportReview();
});
importReviewContent.addEventListener("click", handleImportReviewNavigation);
metricContextModal.addEventListener("click", (event) => {
  if (event.target === metricContextModal) closeMetricContext();
});
closeContextButton.addEventListener("click", closeMetricContext);
if (telegramOpenButton) telegramOpenButton.addEventListener("click", openTelegramPanel);
if (telegramCloseButton) telegramCloseButton.addEventListener("click", closeTelegramPanel);
if (telegramPairButton) telegramPairButton.addEventListener("click", startTelegramPairing);
if (telegramCheckButton) telegramCheckButton.addEventListener("click", checkTelegramPairingCode);
if (telegramTestButton) telegramTestButton.addEventListener("click", sendTelegramTestMessage);
if (telegramDueTestButton) telegramDueTestButton.addEventListener("click", sendTelegramDueTestMessage);
if (telegramPauseButton) telegramPauseButton.addEventListener("click", toggleTelegramReminders);
if (telegramDisconnectButton) telegramDisconnectButton.addEventListener("click", disconnectTelegramReminders);
if (telegramModal) {
  telegramModal.addEventListener("click", (event) => {
    if (event.target === telegramModal) closeTelegramPanel();
  });
}
if (vitaminsOpenButton) vitaminsOpenButton.addEventListener("click", openVitaminsPanel);
if (vitaminsCloseButton) vitaminsCloseButton.addEventListener("click", closeVitaminsPanel);
if (vitaminsPrintButton) vitaminsPrintButton.addEventListener("click", printVitaminsPanel);
if (vitaminsWeeklyBody) {
  vitaminsWeeklyBody.addEventListener("click", (event) => {
    const doseButton = event.target.closest("[data-vitamin-dose]");
    if (!doseButton) return;
    showVitaminDoseFeedback(doseButton.dataset.vitaminDose);
  });
}
if (vitaminsModal) {
  vitaminsModal.addEventListener("click", (event) => {
    if (event.target === vitaminsModal) closeVitaminsPanel();
  });
}
if (resetButton) {
  resetButton.addEventListener("click", () => {
    if (!assertCanEdit()) return;
    if (!state.results.length) return;
    if (!window.confirm("Clear all saved health measurements from this browser?")) return;
    state.results = [];
    saveResults();
    render();
  });
}

profileCards.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-profile]");
  if (editButton) {
    state.editingProfiles = true;
    hydrateProfileForm();
    render();
    return;
  }

  const card = event.target.closest("[data-profile-id]");
  if (!card) return;
  state.activeProfileId = card.dataset.profileId || null;
  populatePeople();
  render();
});

document.querySelector(".filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  setFilter(button.dataset.filter);
});

statusStrip.addEventListener("click", (event) => {
  const card = event.target.closest("[data-summary-filter]");
  if (!card) return;
  activateSummaryFilter(card);
});

statusStrip.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const card = event.target.closest("[data-summary-filter]");
  if (!card) return;
  event.preventDefault();
  activateSummaryFilter(card);
});

mobileActionBar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mobile-action]");
  if (!button) return;
  handleActionShortcut(button.dataset.mobileAction);
});

if (mobileMenuPanel) {
  mobileMenuPanel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-menu-action]");
    if (!button) return;
    handleMenuAction(button.dataset.menuAction);
  });
}

emptyState.addEventListener("click", (event) => {
  const button = event.target.closest("[data-empty-action]");
  if (!button) return;
  handleActionShortcut(button.dataset.emptyAction);
});

snapshotSection.addEventListener("click", (event) => {
  handleSnapshotAction(event.target);
});

snapshotSection.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  handleSnapshotAction(event.target);
});

snapshotEditButton.addEventListener("click", () => {
  if (!assertCanEdit()) return;
  state.editingSnapshot = !state.editingSnapshot;
  render();
});

snapshotCancelButton.addEventListener("click", () => {
  state.editingSnapshot = false;
  render();
});

snapshotEditor.addEventListener("submit", saveSnapshotMetrics);

markerSummary.addEventListener("click", (event) => {
  const card = event.target.closest("[data-summary-metric]");
  if (!card) return;
  state.activeTrendKey = card.dataset.summaryMetric;
  trendMetricInput.value = card.dataset.summaryMetric;
  if (isMobileLayout()) state.mobileView = "trends";
  setFilter("latest");
  renderTrends();
});

markerSummary.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const card = event.target.closest("[data-summary-metric]");
  if (!card) return;
  event.preventDefault();
  state.activeTrendKey = card.dataset.summaryMetric;
  trendMetricInput.value = card.dataset.summaryMetric;
  if (isMobileLayout()) state.mobileView = "trends";
  setFilter("latest");
  renderTrends();
});

trendPanel.addEventListener("click", (event) => {
  const contextButton = event.target.closest("[data-context-metric]");
  if (contextButton) {
    showMetricContext(contextButton.dataset.contextMetric);
    return;
  }

  const button = event.target.closest("[data-trend-range]");
  if (!button) return;
  state.trendRange = button.dataset.trendRange;
  renderTrends();
});

schedulePanel.addEventListener("click", (event) => {
  const snoozeButton = event.target.closest("[data-snooze-profile]");
  if (snoozeButton) {
    event.stopPropagation();
    snoozeScheduleItem(snoozeButton.dataset.snoozeProfile, snoozeButton.dataset.snoozeMetric);
    return;
  }

  const card = event.target.closest("[data-schedule-profile]");
  if (!card) return;
  focusMetricEntry(card.dataset.scheduleProfile, card.dataset.scheduleMetric);
});

schedulePanel.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const card = event.target.closest("[data-schedule-profile]");
  if (!card) return;
  event.preventDefault();
  focusMetricEntry(card.dataset.scheduleProfile, card.dataset.scheduleMetric);
});

resultsBody.addEventListener("click", (event) => {
  const contextButton = event.target.closest("[data-context-metric]");
  if (contextButton) {
    showMetricContext(contextButton.dataset.contextMetric);
    return;
  }

  const warningButton = event.target.closest("[data-warning-id]");
  if (warningButton) {
    explainWarning(warningButton.dataset.warningId);
    return;
  }

  const button = event.target.closest("[data-id]");
  if (!button) return;
  if (button.dataset.confirming !== "true") {
    resultsBody.querySelectorAll(".delete-button").forEach((item) => {
      item.dataset.confirming = "false";
      item.textContent = "Delete";
      item.classList.remove("confirming");
    });
    button.dataset.confirming = "true";
    button.textContent = "Confirm";
    button.classList.add("confirming");
    return;
  }
  deleteResult(button.dataset.id);
});

clearLegacyData();
hydrateProfileForm();
populatePeople();
populateMetrics();
populateTrendMetrics();
setTodayDefaults();
syncSourceDefaults();
renderSyncFooter();
render();
registerServiceWorker();
initSupabase();
