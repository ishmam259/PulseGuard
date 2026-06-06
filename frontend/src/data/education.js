// ──────────────────────────────────────────────────────────────
// Pregnancy Education Content (static data)
//
// All article content lives in this file so the Education page
// works fully offline (no network calls). The FAQ category labels
// and the library category labels are looked up via $() in
// src/config/strings.js — see the "EDU_FAQ_CAT_*" and
// "EDU_LIB_CAT_*" keys. Individual article *titles* and *body
// text* remain in English in v1 (per the spec's chosen approach).
// ──────────────────────────────────────────────────────────────

// Helper: stable trimester string for a given gestational week.
export function trimesterOfWeek(week) {
  const w = Number(week)
  if (!Number.isFinite(w) || w <= 0) return null
  if (w <= 13) return 'first'
  if (w <= 27) return 'second'
  return 'third'
}

export const TRIMESTER_LABEL_KEY = {
  first: 'EDU_BANNER_TRIMESTER_1',
  second: 'EDU_BANNER_TRIMESTER_2',
  third: 'EDU_BANNER_TRIMESTER_3',
}

// ─── Section 1: FAQ ─────────────────────────────────────────
// 9 categories. Each item is { q, a, trimester? } where
// `trimester` (optional) flags which trimester the question is
// most relevant to, used to power the "Recommended for you"
// section.
export const FAQ_CATEGORIES = [
  {
    id: 'first-trimester',
    key: 'EDU_FAQ_CAT_FIRST',
    items: [
      {
        q: 'Is nausea normal during pregnancy?',
        a: 'Yes. Nausea and vomiting ("morning sickness") are very common in the first trimester and usually peak between weeks 6 and 12. Try small frequent meals, ginger tea, and rest. If you cannot keep any food or fluids down for 24 hours, contact your health worker.',
        trimester: 'first',
      },
      {
        q: 'When should I have my first antenatal visit?',
        a: 'As soon as you suspect or confirm pregnancy — ideally before week 12. Early visits help establish a baseline, screen for anaemia and infections, and start folic acid and iron supplementation.',
        trimester: 'first',
      },
      {
        q: 'Can I exercise during the first trimester?',
        a: 'Light to moderate activity such as walking, swimming, and prenatal yoga is generally safe. Avoid contact sports, heavy lifting, and any activity that risks falling. Stop and rest if you feel dizzy, short of breath, or have pain.',
        trimester: 'first',
      },
    ],
  },
  {
    id: 'second-trimester',
    key: 'EDU_FAQ_CAT_SECOND',
    items: [
      {
        q: 'When should I feel baby movements?',
        a: 'Most first-time mothers feel the first flutters ("quickening") between weeks 18 and 22. If you have been pregnant before, you may notice movement as early as week 16. By week 24 you should feel regular movement every day. Report any sudden decrease.',
        trimester: 'second',
      },
      {
        q: 'What tests are done in the second trimester?',
        a: 'Anomaly (ultrasound) scan between weeks 18 and 22, blood glucose screening for gestational diabetes around weeks 24 to 28, and repeat haemoglobin and blood-pressure checks at each ANC visit.',
        trimester: 'second',
      },
      {
        q: 'Is it safe to travel in the second trimester?',
        a: 'For most low-risk pregnancies, the second trimester is the safest time to travel. Stay hydrated, walk every 1–2 hours, carry your ANC records, and know the location of the nearest hospital at your destination.',
        trimester: 'second',
      },
    ],
  },
  {
    id: 'third-trimester',
    key: 'EDU_FAQ_CAT_THIRD',
    items: [
      {
        q: 'How often should I see my health worker now?',
        a: 'From week 28 to 36, visits are usually every 2 weeks. After week 36, every week until delivery. High-risk pregnancies may need more frequent monitoring.',
        trimester: 'third',
      },
      {
        q: 'How do I know labour is near?',
        a: 'Signs include a "show" (mucus plug), regular painful contractions that get closer together, lower back pain, your water breaking, and a feeling of pressure in the pelvis. Call your health worker when contractions are 5 minutes apart for an hour (or sooner if advised).',
        trimester: 'third',
      },
      {
        q: 'Is swelling of the feet normal?',
        a: 'Mild swelling in the ankles and feet is common, especially at the end of the day. Sudden severe swelling of the face, hands, and feet together with headache or blurred vision can be a warning sign of pre-eclampsia — seek care immediately.',
        trimester: 'third',
      },
    ],
  },
  {
    id: 'labor-delivery',
    key: 'EDU_FAQ_CAT_LABOR',
    items: [
      {
        q: 'When should I go to the hospital for delivery?',
        a: 'Go to the hospital when: (1) contractions are regular and 5 minutes apart for at least 1 hour, (2) your water has broken, (3) you have any bleeding, severe headache, blurred vision, or reduced baby movements. In doubt, go and be checked — it is always safer.',
        trimester: 'third',
      },
      {
        q: 'How long does labour usually last?',
        a: 'For first-time mothers, active labour often lasts 8 to 18 hours. It is usually shorter for subsequent pregnancies. Each woman is different — your health worker will monitor progress and intervene if needed.',
        trimester: 'third',
      },
      {
        q: 'What is a birth plan?',
        a: 'A simple written list of your preferences for labour — who you want present, pain relief choices, position preferences, who cuts the cord, and feeding plans. It guides your team but can be changed if the medical situation changes.',
        trimester: 'third',
      },
    ],
  },
  {
    id: 'postpartum',
    key: 'EDU_FAQ_CAT_POSTPARTUM',
    items: [
      {
        q: 'How long does bleeding last after delivery?',
        a: 'Vaginal bleeding (lochia) is normal for 2 to 6 weeks, gradually changing from red to brown to yellow-white. Soaking more than one pad per hour, large clots, or foul smell needs urgent review.',
      },
      {
        q: 'When can I resume normal activity?',
        a: 'Start with gentle walking within a few days. Avoid heavy lifting for 6 weeks. Most women can gradually return to normal routines by 6 to 8 weeks, or as advised at your postnatal check.',
      },
      {
        q: 'How do I know if I have postpartum depression?',
        a: 'Persistent sadness, loss of interest in the baby, sleep or appetite changes, and feelings of guilt or hopelessness lasting more than 2 weeks are warning signs. Postpartum depression is common and treatable — please talk to your health worker.',
      },
    ],
  },
  {
    id: 'medication',
    key: 'EDU_FAQ_CAT_MEDICATION',
    items: [
      {
        q: 'Which medicines are safe in pregnancy?',
        a: 'Iron, folic acid, calcium, and prescribed prenatal vitamins are recommended. Paracetamol is generally safe for pain or fever in recommended doses. Always check with your health worker before taking any new medicine, including herbal or over-the-counter drugs.',
      },
      {
        q: 'Are herbal remedies safe?',
        a: 'Not always. Many herbs have not been studied in pregnancy and some can cause contractions or harm the baby. Discuss every remedy — including teas and traditional preparations — with your health worker.',
      },
    ],
  },
  {
    id: 'nutrition',
    key: 'EDU_FAQ_CAT_NUTRITION',
    items: [
      {
        q: 'How much water should I drink?',
        a: 'Aim for 8 to 10 glasses (about 2 to 2.5 litres) of clean water per day. More if you are physically active, in hot weather, or experiencing vomiting. Carry a water bottle and sip regularly.',
      },
      {
        q: 'Which foods should I avoid?',
        a: 'Avoid raw/undercooked meat, fish and eggs, unpasteurised milk and cheese, unwashed salad, excess caffeine, and alcohol. Limit large fish high in mercury (e.g. swordfish).',
      },
      {
        q: 'Do I need extra iron?',
        a: 'Yes. Iron requirements almost double in pregnancy. Eat iron-rich foods daily (green leafy vegetables, lentils, lean meat, jaggery) and take the iron-folic acid tablets prescribed by your health worker, with vitamin C to help absorption.',
      },
    ],
  },
  {
    id: 'exercise',
    key: 'EDU_FAQ_CAT_EXERCISE',
    items: [
      {
        q: 'Can I exercise while pregnant?',
        a: 'Yes, for most women 30 minutes of moderate activity (walking, swimming, prenatal yoga) on most days is safe and recommended. Avoid contact sports, lying flat on your back after the first trimester, and exercising in very hot or humid conditions.',
      },
      {
        q: 'When should I stop exercising?',
        a: 'Stop and seek care if you have vaginal bleeding, dizziness, chest pain, contractions, fluid leaking, or reduced baby movement during or after exercise.',
      },
    ],
  },
  {
    id: 'general',
    key: 'EDU_FAQ_CAT_GENERAL',
    items: [
      {
        q: 'How often are antenatal visits?',
        a: 'The WHO recommends at least 8 contacts: weeks 12, 20, 26, 30, 34, 36, 38, 40. Each visit checks your weight, blood pressure, urine, haemoglobin, baby growth, and answers your questions.',
      },
      {
        q: 'Can I get the flu and COVID vaccines while pregnant?',
        a: 'Yes. Inactivated vaccines (flu shot, COVID-19 vaccine, tetanus/diphtheria) are recommended in pregnancy and protect both you and the baby. Live vaccines (MMR, varicella) are not given in pregnancy.',
      },
    ],
  },
]

// ─── Section 2: Pregnancy Knowledge Library ─────────────────
// Each category exports an array of articles. Article shape
// depends on category — see comments per category.
export const LIBRARY_CATEGORIES = [
  // ── A: Risks & Warning Signs ──
  // shape: { id, title, trimester, definition, symptoms, risk_factors, prevention, seek_help }
  {
    id: 'A',
    key: 'EDU_LIB_CAT_A',
    articles: [
      {
        id: 'preeclampsia',
        title: 'Preeclampsia',
        trimester: 'third',
        definition: 'A serious condition developing usually after week 20, marked by high blood pressure and protein in the urine. It can affect the mother\'s organs and the baby\'s growth.',
        symptoms: 'Severe headache, blurred vision or seeing spots, upper abdominal pain, sudden swelling of face/hands/feet, high blood pressure (≥140/90), reduced baby movement.',
        risk_factors: 'First pregnancy, age under 20 or over 35, previous preeclampsia, obesity, multiple pregnancy, family history, pre-existing hypertension or diabetes.',
        prevention: 'Attend every ANC visit for BP and urine checks, take prescribed calcium and low-dose aspirin when advised, rest as needed, and report warning signs immediately.',
        seek_help: 'Go to the hospital immediately if you have severe headache, vision changes, upper abdominal pain, sudden severe swelling, or BP ≥160/110.',
      },
      {
        id: 'gestational-diabetes',
        title: 'Gestational Diabetes',
        trimester: 'second',
        definition: 'High blood sugar that develops during pregnancy, usually in the second or third trimester, and usually resolves after delivery.',
        symptoms: 'Often none. Some women feel very thirsty, pass more urine than usual, or feel unusually tired.',
        risk_factors: 'Overweight, age over 25, family history of diabetes, previous gestational diabetes, previous baby over 4 kg, polycystic ovary syndrome.',
        prevention: 'Healthy balanced diet, regular physical activity, healthy weight gain, and routine glucose screening between weeks 24 and 28.',
        seek_help: 'If you have been diagnosed and feel very thirsty, very tired, have blurred vision, or recurrent infections — contact your health worker.',
      },
      {
        id: 'preterm-labor',
        title: 'Preterm Labor',
        trimester: 'third',
        definition: 'Labour that starts before 37 completed weeks of pregnancy. Babies born early can have serious health problems, so prevention and early detection are vital.',
        symptoms: 'Regular painful contractions every 10 minutes or less, lower back pain, pelvic pressure, a "show" (mucus or blood), water leaking, period-like cramps.',
        risk_factors: 'Previous preterm birth, multiple pregnancy, infections (urinary, vaginal, gum), smoking, high blood pressure, poor nutrition, short time between pregnancies.',
        prevention: 'Attend ANC early, treat infections promptly, avoid smoking, rest adequately, and follow your health worker\'s advice on nutrition and supplements.',
        seek_help: 'Go to the hospital immediately if you have contractions every 10 minutes for an hour, water breaking, bleeding, or severe cramps before 37 weeks.',
      },
      {
        id: 'anemia',
        title: 'Anemia',
        trimester: 'second',
        definition: 'Low haemoglobin in the blood, most often from iron deficiency. Common in pregnancy because iron needs almost double.',
        symptoms: 'Tiredness, weakness, pale inner eyelids and palms, dizziness, shortness of breath, fast heartbeat, cravings for non-food items (ice, clay).',
        risk_factors: 'Poor dietary iron, vegetarian diet without planning, closely spaced pregnancies, heavy periods before pregnancy, parasitic infection, teenage pregnancy.',
        prevention: 'Eat iron-rich foods daily, take prescribed iron-folic acid tablets with vitamin C, cook in iron pots when possible, deworm when advised, and space pregnancies at least 2 years apart.',
        seek_help: 'Tell your health worker if you feel very weak, dizzy, or short of breath, or cannot take your iron tablets due to side effects — alternatives exist.',
      },
      {
        id: 'dehydration',
        title: 'Dehydration',
        trimester: 'first',
        definition: 'Loss of body fluid greater than what you take in, common with vomiting in early pregnancy or in hot climates.',
        symptoms: 'Dark yellow urine, dry mouth and lips, dizziness on standing, headache, reduced urine output, fast heartbeat, fainting.',
        risk_factors: 'Severe morning sickness, diarrhoea, hot/humid environment, intense physical activity, not drinking enough water.',
        prevention: 'Drink 8–10 glasses of clean water daily, sip small amounts often when vomiting, include watery foods (soups, fruits), and rest in the shade.',
        seek_help: 'Seek care if you cannot keep fluids down for 24 hours, feel dizzy when standing, have a fast heartbeat, or your urine is very dark or absent for 8+ hours.',
      },
      {
        id: 'high-blood-pressure',
        title: 'High Blood Pressure (Hypertension)',
        trimester: 'third',
        definition: 'Blood pressure readings of 140/90 mmHg or higher on two occasions, in a woman who may or may not have had high BP before pregnancy.',
        symptoms: 'Often no symptoms. Severe cases cause headache, vision changes, chest pain, or upper abdominal pain. Pre-eclampsia is a more dangerous form.',
        risk_factors: 'Pre-existing hypertension, obesity, age over 35, first pregnancy, family history, kidney disease, diabetes.',
        prevention: 'Regular ANC visits for BP checks, low-salt balanced diet, healthy weight, regular activity, take prescribed medicines, and report warning signs.',
        seek_help: 'Seek urgent care for severe headache, vision changes, upper abdominal pain, sudden swelling, or BP readings above 160/110.',
      },
      {
        id: 'infection',
        title: 'Infection in Pregnancy',
        trimester: 'first',
        definition: 'Bacterial, viral, or parasitic infections that can affect the pregnancy. Some are mild; others can harm the mother or baby if untreated.',
        symptoms: 'Fever, burning urination, unusual vaginal discharge with smell or itching, persistent cough, skin rashes, severe diarrhoea, flu-like symptoms.',
        risk_factors: 'Untreated urinary or vaginal infections, poor food/water hygiene, contact with sick people, mosquito bites (malaria, dengue), unsafe sexual practices.',
        prevention: 'Hand washing, safe food and water, treated bed nets in malaria areas, completing prescribed antibiotics, and routine infection screening at ANC.',
        seek_help: 'Any fever above 38°C in pregnancy, painful urination, foul discharge, or persistent illness — see your health worker the same day.',
      },
    ],
  },

  // ── B: Health & Wellness ──
  // shape: { id, title, body }
  {
    id: 'B',
    key: 'EDU_LIB_CAT_B',
    articles: [
      {
        id: 'sleep',
        title: 'Sleep',
        body: 'Aim for 7 to 9 hours every night. Sleep on your left side from the second trimester onwards to improve blood flow to the baby. Use pillows between your knees and under your belly. Avoid screens, heavy meals, and caffeine close to bedtime. If snoring starts or you feel very sleepy in the day, mention it at your next ANC visit.',
      },
      {
        id: 'stress',
        title: 'Stress Management',
        body: 'Some stress is normal, but ongoing high stress can affect sleep, blood pressure, and baby growth. Try slow breathing, gentle walks, talking to a trusted person, and limiting difficult news. Your health worker can connect you to support if you feel overwhelmed.',
      },
      {
        id: 'weight-gain',
        title: 'Weight Gain',
        body: 'Healthy total gain in pregnancy is usually 11 to 16 kg for women with normal pre-pregnancy weight. Gain is small in the first trimester (1 to 2 kg), then about 0.5 kg per week. Your health worker will track gain at every visit and advise if it is too little or too much.',
      },
      {
        id: 'hydration',
        title: 'Hydration',
        body: 'Drink 8 to 10 glasses (about 2 to 2.5 litres) of clean water every day. More in hot weather, when physically active, or when vomiting. Carry a water bottle, and choose water over sugary drinks. Signs of good hydration: pale yellow urine and regular urination.',
      },
      {
        id: 'mental-health',
        title: 'Mental Health',
        body: 'Mood changes, anxiety, and low feelings are common in pregnancy and after birth. Tell someone you trust and your health worker — these are medical issues, not weakness. Warning signs needing urgent help: thoughts of harming yourself or the baby, or persistent deep sadness for more than 2 weeks.',
      },
    ],
  },

  // ── C: Nutrition ──
  // shape: { id, title, body }
  {
    id: 'C',
    key: 'EDU_LIB_CAT_C',
    articles: [
      {
        id: 'required-nutrients',
        title: 'Required Nutrients',
        body: 'You need more of: iron, folic acid, calcium, vitamin D, iodine, protein, and omega-3 (DHA). A varied daily diet plus prescribed prenatal supplements covers most needs. Avoid vitamin A in high doses (liver, megavitamins) as it can harm the baby.',
      },
      {
        id: 'iron-rich-foods',
        title: 'Iron-Rich Foods',
        body: 'Include daily: dark green leafy vegetables (spinach, amaranth), lentils and beans, jaggery, lean red meat, chicken liver, eggs, dried fish (in moderation), and fortified cereals. Take iron tablets with vitamin C (lemon, orange, tomato) and avoid tea/coffee within 1 hour.',
      },
      {
        id: 'calcium-rich-foods',
        title: 'Calcium-Rich Foods',
        body: 'Milk, yogurt, cheese, small fish eaten with bones (e.g. anchovies, mola), sesame seeds (til), ragi, almonds, and dark leafy greens. Aim for 1000 mg per day. Take calcium tablets at a different time of day from iron tablets, as they reduce each other\'s absorption.',
      },
      {
        id: 'folic-acid',
        title: 'Folic Acid',
        body: 'Take 400 micrograms (0.4 mg) of folic acid daily from at least 1 month before conception through the first 12 weeks of pregnancy. It prevents serious brain and spine defects. Higher doses (5 mg) are needed if you have had a previous affected pregnancy or are on certain medicines — your health worker will advise.',
      },
      {
        id: 'protein',
        title: 'Protein Requirements',
        body: 'You need about 60 to 80 grams of protein per day (about 25 g more than before). Include in every meal: pulses, eggs, dairy, fish, chicken, lean meat, soy, nuts, and seeds. Vegetarians can combine dal with whole grains or dairy to get all essential amino acids.',
      },
      {
        id: 'foods-to-avoid',
        title: 'Foods to Avoid',
        body: 'Avoid: raw/undercooked meat, fish, and eggs; unpasteurised milk and soft cheeses; unwashed salads; excess caffeine (limit to 200 mg/day, about 1 cup of coffee); alcohol; liver and high-dose vitamin A; large predator fish high in mercury (swordfish, king mackerel); street food of doubtful hygiene.',
      },
    ],
  },

  // ── D: Exercise ──
  // shape: { id, title, trimester, benefits, precautions, contraindications }
  {
    id: 'D',
    key: 'EDU_LIB_CAT_D',
    articles: [
      {
        id: 'safe-exercises-by-trimester',
        title: 'Safe Exercises by Trimester',
        trimester: 'first',
        benefits: 'Reduces back pain, improves sleep, lowers risk of gestational diabetes and pre-eclampsia, boosts mood, prepares your body for labour, and helps with healthy weight gain.',
        precautions: 'Warm up and cool down, wear supportive shoes and a good bra, stay hydrated, stop if you feel dizzy, short of breath, or have pain, and avoid lying flat on your back after the first trimester.',
        contraindications: 'Do NOT start a new strenuous programme. Avoid: contact sports, activities with falling risk (cycling, skiing, horse riding after week 12), scuba diving, exercising at high altitude, and hot yoga. Stop any exercise if you have bleeding, contractions, fluid leaking, chest pain, or reduced baby movement.',
      },
      {
        id: 'walking',
        title: 'Walking',
        trimester: 'first',
        benefits: 'Easy, free, and safe in all trimesters. Improves heart fitness, helps control weight gain, reduces swelling, and boosts mood. Aim for 30 minutes at a comfortable pace on most days.',
        precautions: 'Wear flat supportive shoes, walk on even ground, carry water, avoid hot midday sun, and walk with someone after week 28 in case you need help. Stop and rest if you feel tired, dizzy, or have cramps.',
        contraindications: 'Placenta previa (after week 20), preterm labour signs, severe anaemia, ruptured membranes, cervical insufficiency, or pre-eclampsia with severe symptoms — check with your health worker first.',
      },
      {
        id: 'stretching',
        title: 'Stretching',
        trimester: 'first',
        benefits: 'Eases back, hip, and leg tension; improves posture; helps relaxation; and prepares muscles for labour. Gentle stretching can be done daily.',
        precautions: 'Move slowly, do not bounce, avoid deep twisting of the abdomen, do not stretch a joint past its normal range, and breathe steadily. Stop if you feel pain or cramping.',
        contraindications: 'Avoid stretches that require lying flat on your back after the first trimester, deep forward bends that compress the belly, and any stretch that causes dizziness or contractions.',
      },
      {
        id: 'pelvic-floor',
        title: 'Pelvic Floor Exercises (Kegels)',
        trimester: 'second',
        benefits: 'Strengthens the muscles that support the uterus, bladder, and bowel. Reduces urine leakage during and after pregnancy, helps with recovery, and may ease the pushing stage of labour.',
        precautions: 'Empty your bladder first. Tighten as if stopping urine mid-flow and holding back gas — that is the right muscle. Do not hold your breath. Begin with 5 second holds, 5 second rests, 10 repetitions, 3 times a day. Avoid practising by actually stopping urine flow regularly.',
        contraindications: 'If you have pain during pelvic floor exercise, a prolapse diagnosis, or recent pelvic surgery, ask your health worker for individual guidance before continuing.',
      },
    ],
  },

  // ── E: Medical Reports & Terminology ──
  // shape: { id, term, meaning, why_it_matters, normal_range? }
  {
    id: 'E',
    key: 'EDU_LIB_CAT_E',
    articles: [
      {
        id: 'anc',
        term: 'ANC',
        meaning: 'Antenatal Care — the regular check-ups you have during pregnancy with a health worker.',
        why_it_matters: 'ANC visits screen for and detect problems early (anaemia, high blood pressure, gestational diabetes, growth issues) and give you a chance to ask questions. WHO recommends at least 8 contacts.',
        normal_range: 'At least 8 visits for an uncomplicated pregnancy.',
      },
      {
        id: 'edd',
        term: 'EDD',
        meaning: 'Estimated Date of Delivery — the calculated date your baby is most likely to be born, based on your last menstrual period (LMP) or early ultrasound.',
        why_it_matters: 'It guides timing of tests, decisions about travel, and when to prepare for delivery. Most babies are born within 2 weeks before or after the EDD.',
        normal_range: 'Full term is 37 to 42 completed weeks.',
      },
      {
        id: 'ga',
        term: 'GA',
        meaning: 'Gestational Age — how many weeks and days the pregnancy has progressed, counted from the first day of your last menstrual period.',
        why_it_matters: 'GA tells you which trimester you are in, what tests are due, what baby development to expect, and when it is safe to deliver.',
        normal_range: 'A pregnancy lasts about 40 weeks (280 days) from LMP.',
      },
      {
        id: 'fhr',
        term: 'FHR',
        meaning: 'Fetal Heart Rate — the baby\'s heartbeats per minute, heard with a doppler or fetoscope.',
        why_it_matters: 'A normal FHR reassures that the baby is getting enough oxygen. Sudden changes can be a sign of distress and need review.',
        normal_range: '110 to 160 beats per minute is normal.',
      },
      {
        id: 'bp',
        term: 'BP',
        meaning: 'Blood Pressure — the force of blood against artery walls, written as systolic/diastolic (e.g. 120/80).',
        why_it_matters: 'High BP in pregnancy can mean pre-eclampsia — a serious condition for mother and baby. Low BP can cause dizziness and falls.',
        normal_range: 'Around 110 to 130 / 70 to 85 mmHg. High: ≥140/90. Urgent: ≥160/110.',
      },
      {
        id: 'hb',
        term: 'Hb',
        meaning: 'Haemoglobin — the protein in red blood cells that carries oxygen. Measured from a small blood sample.',
        why_it_matters: 'Low Hb means anaemia, which makes you tired, increases infection risk, and can lead to bleeding problems at delivery.',
        normal_range: 'At least 11 g/dL in pregnancy. Below 7 g/dL is severe and needs urgent treatment.',
      },
      {
        id: 'placenta',
        term: 'Placenta',
        meaning: 'The organ attached to the inside of the uterus, connected to the baby by the umbilical cord. It delivers oxygen and nutrients and removes waste.',
        why_it_matters: 'A healthy placenta is essential for baby growth. Problems include placenta previa (covering the birth canal), placental abruption (early separation), and placenta accreta. All need specialist care.',
      },
      {
        id: 'amniotic-fluid',
        term: 'Amniotic Fluid',
        meaning: 'The clear warm fluid inside the amniotic sac that surrounds and protects the baby.',
        why_it_matters: 'Too little (oligohydramnios) or too much (polyhydramnios) fluid can signal problems with the baby or pregnancy. Sudden leaking of fluid before term may mean the sac has broken and needs assessment.',
        normal_range: 'Amniotic Fluid Index (AFI) usually 8 to 18 cm.',
      },
      {
        id: 'gestational-diabetes-term',
        term: 'Gestational Diabetes',
        meaning: 'High blood glucose that develops in pregnancy, usually diagnosed with a glucose test between weeks 24 and 28.',
        why_it_matters: 'Untreated, it can lead to a very large baby, birth difficulties, low baby blood sugar after birth, and increased risk of type 2 diabetes for the mother later in life. It is usually managed well with diet, activity, and sometimes insulin.',
        normal_range: 'Fasting glucose < 92 mg/dL; 1-hour after 75 g glucose < 180 mg/dL; 2-hour < 153 mg/dL.',
      },
    ],
  },

  // ── F: Delivery Preparation ──
  // shape: { id, title, body }
  {
    id: 'F',
    key: 'EDU_LIB_CAT_F',
    articles: [
      {
        id: 'signs-of-labor',
        title: 'Signs of Labor',
        body: '1) Regular contractions that get stronger and closer (about every 5 minutes for an hour). 2) A "show" — pink or blood-stained mucus from the vagina. 3) Your water breaking — a gush or slow leak of clear fluid. 4) Lower back pain or pelvic pressure that comes and goes. 5) Period-like cramps. Call your health worker when contractions are 5 minutes apart for an hour, your water breaks, or you have bleeding.',
      },
      {
        id: 'hospital-admission',
        title: 'Hospital Admission Process',
        body: 'On arrival you will be: 1) registered with your ID and ANC records, 2) examined (BP, temperature, pulse, baby heart rate, contractions, cervical check), 3) classified (early labour, active labour, or a complication needing urgent care). Bring your ANC card, ultrasound reports, ID, and the hospital bag. A companion is usually allowed; ask in advance about your facility\'s policy.',
      },
      {
        id: 'birth-plan',
        title: 'Birth Plan',
        body: 'A simple 1-page note covering: who you want with you, your preferred birth position, pain relief preferences, who cuts the cord, immediate skin-to-skin, breastfeeding intention, and any cultural/religious practices. Discuss it with your health worker in advance and bring two copies — one for you, one for the team. Be flexible: plans can change if the medical situation requires.',
      },
      {
        id: 'emergency-contacts',
        title: 'Emergency Contacts',
        body: 'Keep these written somewhere visible at home: your health worker\'s number, the ambulance / hospital emergency number, the nearest hospital address, a trusted family member or neighbour, and your own blood group. Save them in your phone under speed-dial before week 32. If you live far from the hospital, ask your health worker about a closer place for the last weeks.',
      },
      {
        id: 'transportation',
        title: 'Transportation Planning',
        body: 'Before week 34, decide: 1) who will drive / accompany you, 2) the route and an alternate route, 3) backup if your first driver is unavailable, 4) money set aside for transport at any hour, 5) care for other children or pets. Pre-arrange a vehicle that can fit you lying down if needed. Re-check the plan every week from week 36.',
      },
    ],
  },
]

// ─── Section 3: Hospital Bag Checklist ──────────────────────
// Stable id per item so the localStorage state survives renames
// or reordering. Wrap raw labels with { id, label } at runtime.
const RAW_BAG = {
  mother: [
    'ID card',
    'Medical records',
    'Comfortable clothing',
    'Toiletries',
    'Sanitary pads (maternity)',
    'Nursing bras',
    'Slippers',
    'Mobile phone and charger',
  ],
  baby: [
    'Newborn clothes (3 sets)',
    'Soft blanket',
    'Diapers (newborn size)',
    'Baby wipes',
    'Hat and socks',
    'Towel',
    'Burp cloths',
  ],
  documents: [
    'ANC card / records',
    'Ultrasound reports',
    'Blood group report',
    'Insurance information (if applicable)',
    'Government ID copies',
    'Birth plan (1 printed copy)',
  ],
}

export const HOSPITAL_BAG = {
  mother: RAW_BAG.mother.map((label) => ({
    id: 'mother.' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label,
  })),
  baby: RAW_BAG.baby.map((label) => ({
    id: 'baby.' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label,
  })),
  documents: RAW_BAG.documents.map((label) => ({
    id: 'docs.' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label,
  })),
}

export const HOSPITAL_BAG_TOTAL =
  HOSPITAL_BAG.mother.length + HOSPITAL_BAG.baby.length + HOSPITAL_BAG.documents.length

export const HOSPITAL_BAG_STORAGE_KEY = 'pg_hospital_bag_packed:v1'
