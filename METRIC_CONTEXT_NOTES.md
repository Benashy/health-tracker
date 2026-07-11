# Metric Context Notes

Last updated: 2026-07-11

These notes are a first-pass medical context library for the Health Tracker. They are intended for calm, prevention-focused explanations inside the app, especially when a result is borderline, outside range, or changing over time.

They are not diagnostic advice. Each note should be interpreted with symptoms, repeat results, reference ranges from the lab, medication/supplement history, and clinician input where needed.

## How To Use In The App Later

- Add a small `Info` or `Why?` control to metric rows, warning pills, and trend cards.
- Show one or two short paragraphs only.
- Use language such as "can be associated with", "may reflect", and "interpret alongside".
- Prefer trend and pattern language over single-result alarm.
- Keep source links available in expanded detail.

## Core Body Metrics

| Metric | Context note |
| --- | --- |
| Weight | Weight is useful for long-term trend tracking, but day-to-day values can shift with hydration, meals, bowel contents, and training. Interpret changes alongside waist circumference, blood pressure, glucose/HbA1c, lipids, and how the measurement was taken. |
| Waist circumference | Waist circumference is a practical marker of central body fat and cardiometabolic risk. Small changes can reflect tape position or technique, so measure consistently at the navel and focus on the longer-term direction. |

## Vitals And Fitness

| Metric | Context note |
| --- | --- |
| Blood pressure systolic | Systolic blood pressure is the pressure when the heart contracts. Home readings are most useful as repeated, rested measurements; persistent elevation matters more than a single reading. |
| Blood pressure diastolic | Diastolic blood pressure is the pressure between beats. Interpret with systolic pressure, home technique, stress, caffeine, sleep, exercise, and whether readings are repeatedly elevated. |
| Resting heart rate | Resting heart rate can reflect fitness, recovery, sleep, stress, illness, medication, caffeine, and hydration. Trends are more useful than isolated wearable or single-day values. |
| VO2 Max | VO2 max estimates cardiorespiratory fitness. Wearable estimates are useful for trend tracking, but they are not equivalent to formal cardiopulmonary exercise testing. |

## Full Blood Count

| Metric | Context note |
| --- | --- |
| Haemoglobin | Haemoglobin carries oxygen in red blood cells. Low values can fit with anaemia, blood loss, iron/B12/folate issues, or chronic illness; high values can reflect dehydration, smoking, altitude, or less commonly blood disorders. |
| Erythrocytes | Erythrocytes are red blood cells. Interpret the count with haemoglobin, haematocrit, MCV, ferritin, B12, folate, hydration status, and recent training or altitude exposure. |
| Haematocrit | Haematocrit is the proportion of blood made up by red blood cells. It can rise with dehydration or increased red cell mass and fall with anaemia or overhydration, so context matters. |
| MCV | MCV reflects average red-cell size. Low MCV often points toward iron deficiency or thalassaemia trait; high MCV can be seen with B12/folate deficiency, alcohol, liver disease, thyroid issues, or some medicines. |
| MCH | MCH estimates the amount of haemoglobin per red blood cell. Low values often travel with iron-deficiency patterns, while interpretation is strongest when paired with MCV, MCHC, RDW, and ferritin. |
| MCHC | MCHC reflects haemoglobin concentration inside red blood cells. Borderline changes are often interpreted with the rest of the red-cell indices rather than alone. |
| RDW | RDW measures variation in red-cell size. A higher RDW can appear with evolving or mixed deficiencies, recovery after blood loss, or mixed red-cell populations; interpret with MCV, ferritin, B12, and folate. |
| Leukocytes | Leukocytes are total white blood cells. High values can occur with infection, inflammation, stress, smoking, or steroid use; low values can occur with viral illness, medicines, autoimmune conditions, or bone marrow issues. |
| Neutrophils | Neutrophils are the main rapid-response white cells for bacterial infection and inflammation. They can rise with infection, stress, steroids, or intense exercise, and fall with some viral illnesses or medicines. |
| Eosinophils | Eosinophils are involved in allergic and inflammatory responses. Borderline high percentages can fit with common allergic conditions such as hay fever, asthma, or eczema, but should be interpreted with the absolute eosinophil count and whether the pattern persists. |
| Basophils | Basophils are a small white-cell subtype involved in allergic and inflammatory signalling. Mild percentage variation is often nonspecific; persistent or marked elevation should be interpreted with the total white cell count and the wider differential. |
| Lymphocytes | Lymphocytes are important immune cells, including B cells and T cells. They can rise with some viral infections and immune activation, and fall with stress, steroids, some infections, or immune suppression. |
| Monocytes | Monocytes help clear infection and support immune response. A mild isolated rise can be seen after recent infection, inflammation, or stress, but significance depends on the absolute monocyte count, symptoms, and repeat results. |
| Platelets | Platelets help blood clot. High values can be reactive after inflammation, infection, bleeding, or iron deficiency; low values can increase bleeding risk and need context from symptoms, repeat testing, and medications. |

## Vitamins And Iron

| Metric | Context note |
| --- | --- |
| B12 | Vitamin B12 is important for red blood cells and nerve function. Low or borderline values are best interpreted with symptoms, MCV, homocysteine, folate, diet, absorption risk, and supplementation history. |
| Folate | Folate supports DNA production and red blood cell formation. Low values can contribute to macrocytosis and raised homocysteine, but should be interpreted alongside B12 so B12 deficiency is not missed. |
| Ferritin | Ferritin reflects iron stores, but it also rises with inflammation, liver disease, infection, and some metabolic conditions. Low ferritin strongly supports iron deficiency; high ferritin is not automatically iron overload. |
| Vitamin D | Vitamin D supports bone, muscle, nerve, and immune function. Levels vary with season, sun exposure, supplements, skin coverage, and absorption; routine testing is not needed for everyone but can be useful when tracking deficiency or replacement. |

## Metabolic Markers

| Metric | Context note |
| --- | --- |
| Glucose | Blood glucose is a snapshot of blood sugar at the time of testing. It is affected by meals, fasting status, stress, illness, sleep, and exercise, so trend it with HbA1c and the test context. |
| Fasting glucose | Fasting glucose is more interpretable for metabolic risk than a random glucose value. It should be read with HbA1c, triglycerides, waist circumference, blood pressure, and whether the fast was genuine. |
| HbA1c NGSP | HbA1c estimates average blood glucose over roughly the previous two to three months. It can be affected by anaemia, red-cell turnover, haemoglobin variants, kidney disease, and recent blood loss. |
| HbA1c IFCC | HbA1c IFCC is the mmol/mol version of HbA1c. It gives the same broad long-term glucose picture as HbA1c NGSP, so the trend matters more than the reporting format. |

## Lipids And Cardiovascular Markers

| Metric | Context note |
| --- | --- |
| Total cholesterol | Total cholesterol is a broad measure combining several cholesterol fractions. It is useful for context but less informative than LDL, HDL, triglycerides, ApoB, Lp(a), blood pressure, glucose, and family history. |
| LDL | LDL is a major atherogenic cholesterol fraction and is central to cardiovascular prevention. Lower LDL is generally favourable, especially when ApoB or Lp(a) is high or family risk is present. |
| HDL | HDL is often described as protective, but it is best used as a risk marker rather than a treatment target by itself. Interpret HDL with triglycerides, LDL/ApoB, exercise, weight, alcohol, and metabolic health. |
| Triglycerides | Triglycerides are circulating fats used for energy. They rise with recent food intake, alcohol, insulin resistance, weight gain, some medicines, and genetic factors; fasting status is important. |
| ApoB | ApoB approximates the number of atherogenic particles that can enter artery walls. It can be a clearer marker of particle burden than LDL alone, especially when triglycerides are high or metabolic risk is present. |
| Lipoprotein(a) | Lp(a) is mostly genetically determined and usually stable across life. High Lp(a) can increase cardiovascular risk even when LDL looks acceptable, so it mainly informs how aggressively to manage overall risk. |
| Homocysteine | Homocysteine is an amino acid influenced by B12, folate, B6, kidney function, genetics, and some medicines. Higher values can be associated with cardiovascular risk, but it should be interpreted as part of a broader risk pattern. |

## Proteins, Inflammation, Kidney And Purines

| Metric | Context note |
| --- | --- |
| Albumin | Albumin is a major blood protein made by the liver. Low values can reflect inflammation, kidney or gut protein loss, liver disease, or nutrition issues; interpret with CRP, liver markers, urine protein, and overall health. |
| CRP | CRP is a nonspecific inflammation marker. It can rise with infection, injury, inflammatory conditions, recent intense exercise, and some chronic cardiometabolic risk patterns; repeat context is important. |
| Uric acid | Uric acid is a breakdown product of purines. Higher values can be associated with gout or kidney stones, but many people with high uric acid do not have gout; interpret with symptoms, kidney function, hydration, alcohol, and diet. |
| Urea | Urea reflects protein metabolism and kidney excretion, and is strongly affected by hydration and protein intake. It is most useful alongside creatinine, eGFR, electrolytes, and clinical context. |
| Creatinine | Creatinine is a muscle-derived waste product used to estimate kidney function. It varies with muscle mass, hydration, recent intense exercise, supplements such as creatine, and kidney filtration. |
| eGFR | eGFR estimates how well the kidneys filter blood, usually using creatinine, age, and sex. Persistent reduction is more meaningful than a single borderline value and should be read with urine protein/blood and blood pressure. |

## Liver And Bilirubin

| Metric | Context note |
| --- | --- |
| LDH | LDH is an enzyme found in many tissues, so it is nonspecific. It can rise with sample haemolysis, muscle injury, liver issues, inflammation, or tissue damage; interpret with AST, ALT, bilirubin, blood count, and symptoms. |
| AST | AST is found in liver, muscle, heart, and other tissues. A rise can reflect liver irritation but also muscle injury or recent hard exercise, so compare with ALT, GGT, bilirubin, CK if available, and recent training. |
| ALT | ALT is more liver-focused than AST and can rise with fatty liver, alcohol, medicines/supplements, viral hepatitis, metabolic risk, or other liver irritation. Trends and the wider liver panel matter. |
| GGT | GGT is a liver and bile-duct enzyme. It can rise with alcohol, fatty liver, bile duct irritation, some medicines, and metabolic risk; interpret with ALT, AST, ALP if available, and bilirubin. |
| Bilirubin total | Total bilirubin reflects bilirubin from red-cell breakdown and liver/bile handling. Mild isolated elevation can be benign in Gilbert syndrome, but context from direct/indirect bilirubin and liver enzymes matters. |
| Bilirubin direct | Direct bilirubin is conjugated bilirubin. Elevation can point more toward liver processing or bile flow issues, especially when paired with abnormal ALT, AST, GGT, ALP, or symptoms such as jaundice. |
| Bilirubin indirect | Indirect bilirubin is unconjugated bilirubin. It can rise with Gilbert syndrome, fasting, illness, or increased red-cell breakdown; interpret with haemoglobin, reticulocytes if available, and liver enzymes. |

## Electrolytes

| Metric | Context note |
| --- | --- |
| Sodium | Sodium reflects water and salt balance. Meaningful abnormalities can occur with dehydration, overhydration, kidney/adrenal issues, medicines, vomiting/diarrhoea, or illness; significant changes deserve clinician review. |
| Potassium | Potassium is important for heart rhythm, nerves, and muscles. Abnormal results can relate to kidney function, medicines, supplements, sample handling, dehydration, or hormone issues and can be clinically important. |
| Chloride | Chloride helps maintain fluid and acid-base balance. It is usually interpreted with sodium, potassium, bicarbonate/CO2 if available, kidney function, hydration, and gastrointestinal losses. |

## Thyroid, Adrenal And Hormone Panel

| Metric | Context note |
| --- | --- |
| TSH | TSH is the pituitary signal to the thyroid. High TSH often suggests underactive thyroid tendency; low TSH can suggest overactive thyroid or excess replacement, but FT4 and symptoms are needed. |
| FT4 | Free T4 is the circulating thyroid hormone available to tissues. Interpret with TSH, symptoms, medication timing, biotin/supplements, and whether the pattern is persistent. |
| Cortisol | Cortisol is a stress and adrenal hormone with strong daily rhythm. Time of day, illness, stress, steroid medication, sleep disruption, and testing method are critical for interpretation. |
| Total testosterone | Total testosterone should be interpreted with symptoms, morning timing, repeat testing, SHBG, free testosterone estimate, illness, sleep, weight, and medications. Low libido or fatigue alone is not enough without objective pattern. |
| SHBG | SHBG binds testosterone and oestradiol and changes how much hormone is available to tissues. It can be influenced by thyroid status, liver function, weight, insulin resistance, age, medications, and sex hormone levels. |
| LH | LH is a pituitary signal to the testes/ovaries. In men, high LH with low testosterone can suggest primary testicular failure; low/inappropriately normal LH with low testosterone can suggest pituitary or functional suppression. |
| FSH | FSH is a pituitary hormone involved in sperm production and ovarian follicle development. In a male hormone workup it is most useful when testosterone or fertility markers are abnormal. |
| Prolactin | Prolactin is a pituitary hormone that can suppress the gonadal axis when elevated. Stress, sleep, exercise, sex, some medicines, pituitary causes, and macroprolactin can affect interpretation. |
| Oestradiol | Oestradiol is an estrogen important for bone, libido, body composition, and reproductive health in both sexes. Interpretation depends heavily on sex, age, symptoms, testosterone/SHBG, medication, and assay quality. |

## Urinalysis

| Metric | Context note |
| --- | --- |
| Urine pH | Urine pH reflects urine acidity, not blood pH. Diet, hydration, kidney handling, infection with urease-producing bacteria, and stone risk can influence it. |
| Urine specific gravity | Specific gravity estimates urine concentration. It mainly reflects hydration and kidney concentrating ability; small changes near the reference edge are often less meaningful than persistent extremes. |
| Urine nitrites | Nitrites can be positive when certain bacteria convert nitrates in urine, supporting a possible UTI. A negative result does not exclude infection, especially with frequent urination or bacteria that do not produce nitrite. |
| Urine protein | Urine protein can be transient after exercise, fever, dehydration, or illness, but persistent protein can suggest kidney filtering stress. It is important alongside blood pressure, eGFR, and repeat urine testing. |
| Urine glucose | Glucose in urine can occur when blood glucose is high enough to spill into urine, or less commonly with renal tubular handling differences. Interpret with blood glucose and HbA1c. |
| Urine ketones | Ketones can appear with fasting, low-carbohydrate diets, prolonged exercise, vomiting, or diabetes-related insulin deficiency. Context and blood glucose are important. |
| Urine urobilinogen | Urobilinogen reflects bilirubin metabolism through the gut and liver. Abnormal values are interpreted with bilirubin, liver enzymes, haemolysis markers, and sample handling. |
| Urine bilirubin | Bilirubin in urine usually reflects conjugated bilirubin and can suggest liver or bile-flow issues. Interpret with blood bilirubin fractions, ALT/AST/GGT/ALP if available, and symptoms such as jaundice or dark urine. |
| Urine haemoglobin | A positive urine blood/haemoglobin result can reflect red cells, haemoglobin, or myoglobin. Causes include UTI, stones, exercise, contamination, kidney/urological issues, or muscle injury; microscopy helps clarify. |
| Urine leukocytes | Leukocytes or leukocyte esterase suggest white cells in the urine. This can fit UTI or urinary inflammation, but contamination is common, especially if epithelial cells are also present. |
| Urine epithelial cells | Epithelial cells often reflect sample contamination from skin or genital tract, especially when many are present. They are mainly useful for judging urine sample quality. |
| Urinary leukocytes | Microscopic urinary leukocytes can support infection or inflammation when elevated. Interpret with symptoms, nitrites, culture if done, epithelial cells, and whether the sample was clean-catch. |

## One-Off And Infrequent Tests

| Metric | Context note |
| --- | --- |
| ECG | An ECG is a short snapshot of the heart's electrical activity. It can show rhythm, conduction, and signs of previous or current strain/injury, but a normal ECG does not exclude intermittent rhythm problems or all heart disease. |
| Coronary artery calcium score | CAC score measures calcified plaque in the coronary arteries. Higher scores generally mean higher future cardiovascular risk; a score of zero is reassuring but does not exclude non-calcified plaque or future risk. |

## Source Notes

Primary source set used for this first draft:

- MedlinePlus lab test library: https://medlineplus.gov/lab-tests/
- MedlinePlus CBC: https://medlineplus.gov/lab-tests/complete-blood-count-cbc/
- MedlinePlus blood differential: https://medlineplus.gov/lab-tests/blood-differential/
- MedlinePlus cholesterol levels: https://medlineplus.gov/lab-tests/cholesterol-levels/
- CDC LDL/HDL/triglycerides: https://www.cdc.gov/cholesterol/about/ldl-and-hdl-cholesterol-and-triglycerides.html
- MedlinePlus lipoprotein(a): https://medlineplus.gov/lab-tests/lipoprotein-a-blood-test/
- Cleveland Clinic ApoB: https://my.clevelandclinic.org/health/diagnostics/24992-apolipoprotein-b-test
- MedlinePlus HbA1c: https://medlineplus.gov/lab-tests/hemoglobin-a1c-hba1c-test/
- MedlinePlus ferritin: https://medlineplus.gov/lab-tests/ferritin-blood-test/
- MedlinePlus vitamin B testing: https://medlineplus.gov/lab-tests/vitamin-b-test/
- MedlinePlus vitamin D: https://medlineplus.gov/lab-tests/vitamin-d-test/
- MedlinePlus homocysteine: https://medlineplus.gov/lab-tests/homocysteine-test/
- MedlinePlus CMP: https://medlineplus.gov/lab-tests/comprehensive-metabolic-panel-cmp/
- MedlinePlus BMP: https://medlineplus.gov/lab-tests/basic-metabolic-panel-bmp/
- MedlinePlus kidney tests: https://medlineplus.gov/kidneytests.html
- MedlinePlus creatinine: https://medlineplus.gov/lab-tests/creatinine-test/
- MedlinePlus electrolyte panel: https://medlineplus.gov/lab-tests/electrolyte-panel/
- MedlinePlus liver function tests: https://medlineplus.gov/lab-tests/liver-function-tests/
- Cleveland Clinic liver function tests: https://my.clevelandclinic.org/health/diagnostics/17662-liver-function-tests
- MedlinePlus thyroid function tests: https://medlineplus.gov/ency/article/003444.htm
- MedlinePlus TSH: https://medlineplus.gov/lab-tests/tsh-thyroid-stimulating-hormone-test/
- MedlinePlus SHBG: https://medlineplus.gov/lab-tests/shbg-blood-test/
- MedlinePlus LH: https://medlineplus.gov/lab-tests/luteinizing-hormone-lh-levels-test/
- MedlinePlus prolactin: https://medlineplus.gov/lab-tests/prolactin-levels/
- MedlinePlus estrogen levels: https://medlineplus.gov/lab-tests/estrogen-levels-test/
- MedlinePlus urinalysis: https://medlineplus.gov/urinalysis.html
- MedlinePlus ketones in urine: https://medlineplus.gov/lab-tests/ketones-in-urine/
- MedlinePlus ECG: https://medlineplus.gov/lab-tests/electrocardiogram/
- CDC high blood pressure: https://www.cdc.gov/high-blood-pressure/about/index.html
- American Heart Association heart rate: https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse
- Mayo Clinic fitness tracking/VO2 max context: https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/fitness/art-20046433
- American Heart Association CAC test: https://www.heart.org/en/health-topics/heart-attack/diagnosing-a-heart-attack/cac-test
- Mayo Clinic coronary calcium scan: https://www.mayoclinic.org/tests-procedures/heart-scan/about/pac-20384686
