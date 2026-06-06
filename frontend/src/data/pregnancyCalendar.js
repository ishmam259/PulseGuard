// ═══════════════════════════════════════════════════════════
// Pregnancy Calendar — Weekly Content
//
// Static English content for weeks 1–40 of pregnancy. All UI
// labels (section headings, button text) are i18n'd via the
// $() helper; weekly body copy remains English in v1, matching
// the convention used by frontend/src/data/education.js.
//
// Content sources: WHO antenatal care recommendations, NHS
// "Week-by-week" pregnancy guide, and ACOG "Your Pregnancy
// Week by Week". Every value is general educational
// information — not a substitute for clinical advice.
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} WeekContent
 * @property {{ size: string, caption: string, highlights: string[] }} baby
 * @property {{ changes: string[] }} body
 * @property {{ normal: string[], warning: string[] }} symptoms
 * @property {{ nutrition: string[], exercise: string[], mentalHealth: string[], preparation: string[] }} tips
 */

/** @type {Record<number, WeekContent>} */
export const PREGNANCY_CALENDAR = {
  1: {
    baby: {
      size: 'A single cell (the zygote)',
      caption: 'Conception has just occurred. The fertilized egg is travelling down the fallopian tube and will implant in the uterus this week.',
      highlights: [
        'Cell division is rapidly underway',
        'Genetic material from both parents is combined',
        'Implantation into the uterine lining begins',
      ],
    },
    body: {
      changes: [
        'Implantation bleeding (light spotting) is possible',
        'Mild uterine cramping',
        'Hormonal changes begin immediately',
        'Fatigue may start to appear',
      ],
    },
    symptoms: {
      normal: ['Light spotting', 'Mild cramps', 'Bloating'],
      warning: ['Heavy bleeding with severe pain', 'Persistent high fever'],
    },
    tips: {
      nutrition: ['Start taking folic acid (400–800 µg daily) if you have not already.'],
      exercise: ['Maintain your usual gentle activity; no new intense routines yet.'],
      mentalHealth: ['Take a moment to breathe — this is the start of a long journey.'],
      preparation: ['Schedule your first antenatal appointment (ideally before week 12).'],
    },
  },

  2: {
    baby: {
      size: 'A poppy seed (≈ 0.1 mm)',
      caption: 'The blastocyst implants into the uterine wall and begins producing the pregnancy hormone hCG.',
      highlights: [
        'Cells are dividing into groups that will form the placenta and embryo',
        'hCG hormone starts signalling pregnancy to your body',
        'Amniotic sac and yolk sac are forming',
      ],
    },
    body: {
      changes: [
        'hCG hormone begins rising rapidly',
        'Basal body temperature stays elevated',
        'Mild bloating or water retention',
      ],
    },
    symptoms: {
      normal: ['Tender breasts', 'Mild fatigue', 'Heightened sense of smell'],
      warning: ['Severe one-sided abdominal pain'],
    },
    tips: {
      nutrition: ['Begin iron-rich foods (leafy greens, lentils, dates).'],
      exercise: ['Daily 20-minute walk is a great baseline.'],
      mentalHealth: ['Share the news only when you feel ready.'],
      preparation: ['Confirm prenatal vitamins include DHA and iodine.'],
    },
  },

  3: {
    baby: {
      size: 'A sesame seed (≈ 0.2 mm)',
      caption: 'The embryo begins to take shape. Three layers will form every organ and tissue in the body.',
      highlights: [
        'Three germ layers (ectoderm, mesoderm, endoderm) are forming',
        'The neural tube begins to close',
        'Placenta starts producing hCG',
      ],
    },
    body: {
      changes: [
        'hCG levels double roughly every 48 hours',
        'Mild breast tenderness',
        'Possible light spotting from implantation',
      ],
    },
    symptoms: {
      normal: ['Spotting', 'Cramps', 'Fatigue'],
      warning: ['Heavy bleeding with clots'],
    },
    tips: {
      nutrition: ['Stay hydrated — aim for 8–10 cups of fluid daily.'],
      exercise: ['Listen to your body; rest when you feel tired.'],
      mentalHealth: ['Mood swings are common — be gentle with yourself.'],
      preparation: ['Stop smoking, alcohol, and limit caffeine if applicable.'],
    },
  },

  4: {
    baby: {
      size: 'A poppy seed (≈ 0.4 mm)',
      caption: 'A home pregnancy test can usually confirm pregnancy this week as hCG rises.',
      highlights: [
        'Implantation is complete',
        'Amniotic fluid is beginning to accumulate',
        'The earliest stages of the brain and spinal cord are forming',
      ],
    },
    body: {
      changes: [
        'Missed period is the first obvious sign',
        'Hormonal shifts intensify',
        'Possible morning sickness begins',
      ],
    },
    symptoms: {
      normal: ['Nausea', 'Tender breasts', 'Fatigue', 'Frequent urination'],
      warning: ['Heavy bleeding', 'Severe one-sided pain'],
    },
    tips: {
      nutrition: ['Small, frequent meals help manage nausea.'],
      exercise: ['Gentle yoga or walking is safe to continue.'],
      mentalHealth: ['It is normal to feel anxious — talk with your partner or a friend.'],
      preparation: ['Book your first antenatal visit if you have not yet.'],
    },
  },

  5: {
    baby: {
      size: 'A sesame seed (≈ 1.5 mm)',
      caption: 'The heart is forming and may begin to beat. The neural tube is closing this week.',
      highlights: [
        'A tiny heart tube begins to beat',
        'The brain and spinal cord are forming',
        'Arm and leg buds are visible',
      ],
    },
    body: {
      changes: [
        'hCG levels peak around this time',
        'Morning sickness often intensifies',
        'Heightened sense of smell and food aversions',
      ],
    },
    symptoms: {
      normal: ['Nausea', 'Vomiting', 'Tender breasts', 'Mood swings'],
      warning: ['Persistent vomiting preventing fluid intake', 'Severe abdominal pain'],
    },
    tips: {
      nutrition: ['Ginger tea and vitamin B6 may reduce nausea.'],
      exercise: ['Rest when nausea peaks; movement helps when you feel able.'],
      mentalHealth: ['Mood changes are hormonal — communicate with loved ones.'],
      preparation: ['Choose your antenatal clinic and book your first visit.'],
    },
  },

  6: {
    baby: {
      size: 'A lentil (≈ 4 mm)',
      caption: 'Facial features are beginning to take shape. The heart is now beating regularly.',
      highlights: [
        'Eyes, ears, and mouth are forming',
        'Heartbeat is detectable on ultrasound',
        'Limb buds are lengthening',
      ],
    },
    body: {
      changes: [
        'Morning sickness often at its peak',
        'Saliva production increases',
        'Uterus is beginning to enlarge',
      ],
    },
    symptoms: {
      normal: ['Nausea and vomiting', 'Fatigue', 'Food aversions', 'Frequent urination'],
      warning: ['Heavy bleeding', 'Severe right-lower abdominal pain (rule out ectopic)'],
    },
    tips: {
      nutrition: ['Eat protein at every meal to stabilise blood sugar.'],
      exercise: ['15–20 minutes of light walking daily.'],
      mentalHealth: ['Practice slow deep breathing when overwhelmed.'],
      preparation: ['Confirm the pregnancy with a healthcare provider.'],
    },
  },

  7: {
    baby: {
      size: 'A blueberry (≈ 1 cm)',
      caption: 'Hands and feet are emerging. The brain is developing rapidly.',
      highlights: [
        'Tiny fingers and toes are forming',
        'Brain hemispheres are growing',
        'Tail is shrinking as the spine straightens',
      ],
    },
    body: {
      changes: [
        'Uterus has doubled in size',
        'Blood volume is increasing',
        'Acne or skin changes may appear',
      ],
    },
    symptoms: {
      normal: ['Nausea', 'Heartburn', 'Constipation', 'Mood swings'],
      warning: ['Heavy bleeding', 'Severe abdominal pain', 'High fever'],
    },
    tips: {
      nutrition: ['Fibre-rich foods and plenty of water to ease constipation.'],
      exercise: ['Continue light daily activity; avoid overheating.'],
      mentalHealth: ['Consider a pregnancy journal to track emotions.'],
      preparation: ['Research childbirth classes in your area.'],
    },
  },

  8: {
    baby: {
      size: 'A kidney bean (≈ 1.6 cm)',
      caption: 'The embryo is now a foetus. Eyelids and ears are forming in detail.',
      highlights: [
        'Facial features are more defined',
        'Arms and legs are lengthening',
        'The heart has four chambers',
      ],
    },
    body: {
      changes: [
        'Uterus is the size of a lemon',
        'Breast tenderness continues',
        'Possible visible veins on the chest',
      ],
    },
    symptoms: {
      normal: ['Nausea', 'Fatigue', 'Bloating', 'Heartburn'],
      warning: ['Heavy bleeding', 'Severe abdominal cramping'],
    },
    tips: {
      nutrition: ['Continue folic acid and prenatal vitamins.'],
      exercise: ['Pelvic floor exercises (Kegels) are safe and beneficial.'],
      mentalHealth: ['Share your feelings with your partner — open communication helps.'],
      preparation: ['Schedule your first ultrasound (dating scan).'],
    },
  },

  9: {
    baby: {
      size: 'A grape (≈ 2.3 cm)',
      caption: 'The tail has disappeared. Tiny muscles are forming, allowing the first movements.',
      highlights: [
        'Arms can now bend at the elbow',
        'Fingers and toes are more defined',
        'Essential organs are in place',
      ],
    },
    body: {
      changes: [
        'Waist may begin to thicken slightly',
        'Hormones may affect gums (pregnancy gingivitis)',
        'Heartburn may worsen',
      ],
    },
    symptoms: {
      normal: ['Nausea', 'Food cravings or aversions', 'Fatigue', 'Mood swings'],
      warning: ['Severe right-side pain', 'Heavy bleeding'],
    },
    tips: {
      nutrition: ['Small frequent meals; avoid lying down right after eating.'],
      exercise: ['Continue 20–30 minutes of safe movement daily.'],
      mentalHealth: ['Try 10 minutes of guided meditation each morning.'],
      preparation: ['Discuss genetic screening options with your provider.'],
    },
  },

  10: {
    baby: {
      size: 'A kumquat (≈ 3.1 cm)',
      caption: 'The critical period of organ formation is complete. The foetus now focuses on growth.',
      highlights: [
        'All vital organs have formed',
        'The brain is producing 250,000 neurons per minute',
        'Fingers and toes are separated',
      ],
    },
    body: {
      changes: [
        'Uterus is the size of a small orange',
        'Mild weight gain begins',
        'Round ligament stretching may cause brief twinges',
      ],
    },
    symptoms: {
      normal: ['Mild nausea', 'Visible veins', 'Heartburn', 'Fatigue'],
      warning: ['Heavy bleeding', 'Severe pelvic pain'],
    },
    tips: {
      nutrition: ['Add calcium-rich foods: yoghurt, milk, sesame seeds.'],
      exercise: ['Swimming is excellent — relieves pressure on joints.'],
      mentalHealth: ['Talk to friends or family who have been pregnant.'],
      preparation: ['Start thinking about where you want to give birth.'],
    },
  },

  11: {
    baby: {
      size: 'A fig (≈ 4.1 cm)',
      caption: 'The foetus is starting to look distinctly human. Tooth buds are forming under the gums.',
      highlights: [
        'Tooth buds and hair follicles form',
        'The diaphragm is developing (practice hiccups)',
        'External genitalia begin to differentiate',
      ],
    },
    body: {
      changes: [
        'Nausea often begins to ease',
        'Energy levels may improve',
        'Uterus fills the pelvis',
      ],
    },
    symptoms: {
      normal: ['Mild nausea', 'Increased appetite', 'Constipation', 'Headaches'],
      warning: ['Blurred vision', 'Severe headache', 'Sudden swelling'],
    },
    tips: {
      nutrition: ['Iron-rich foods help support rising blood volume.'],
      exercise: ['Try prenatal yoga for flexibility and breathwork.'],
      mentalHealth: ['Nausea easing can lift your mood — enjoy the relief.'],
      preparation: ['Confirm any planned travel is safe for the second trimester.'],
    },
  },

  12: {
    baby: {
      size: 'A lime (≈ 5.4 cm)',
      caption: 'You are nearing the end of the first trimester. The foetus can make small movements.',
      highlights: [
        'Reflexes are developing',
        'Vocal cords form',
        'Intestines move from the umbilical cord into the abdomen',
      ],
    },
    body: {
      changes: [
        'First trimester symptoms begin to subside',
        'Skin may "glow" from increased blood flow',
        'Uterus rises above the pelvic bone',
      ],
    },
    symptoms: {
      normal: ['Mild headaches', 'Dizziness when standing quickly', 'Increased energy'],
      warning: ['Severe right-side pain', 'Heavy bleeding', 'Persistent vomiting'],
    },
    tips: {
      nutrition: ['Aim for 5 small meals of varied colours daily.'],
      exercise: ['Strengthen core gently with approved prenatal moves.'],
      mentalHealth: ['Celebrate the first-trimester milestone.'],
      preparation: ['Schedule the nuchal translucency ultrasound if desired.'],
    },
  },

  13: {
    baby: {
      size: 'A lemon (≈ 7.4 cm)',
      caption: 'Welcome to the second trimester! Fingerprints have formed and the foetus is moving actively.',
      highlights: [
        'Fingerprints are fully formed',
        'Vocal cords are ready',
        'Sucking reflex develops',
      ],
    },
    body: {
      changes: [
        'Energy returns',
        'Nausea typically fades',
        'Visible bump may start to show',
      ],
    },
    symptoms: {
      normal: ['Increased appetite', 'Mild dizziness', 'Round ligament pain'],
      warning: ['Severe abdominal pain', 'Heavy bleeding'],
    },
    tips: {
      nutrition: ['Increase protein intake to 60–80 g per day.'],
      exercise: ['150 minutes of moderate exercise per week is ideal.'],
      mentalHealth: ['Reduced nausea often improves mood — enjoy this phase.'],
      preparation: ['Begin thinking about maternity clothing needs.'],
    },
  },

  14: {
    baby: {
      size: 'A peach (≈ 8.7 cm)',
      caption: 'Facial expressions begin. The foetus can squint, frown, and grimace.',
      highlights: [
        'Facial muscles work',
        'Lanugo (fine hair) covers the body',
        'Prostate or ovaries develop',
      ],
    },
    body: {
      changes: [
        'Bump becomes more noticeable',
        'Breast changes continue',
        'Possible nasal congestion ("pregnancy rhinitis")',
      ],
    },
    symptoms: {
      normal: ['Nasal congestion', 'Increased energy', 'Mild swelling of ankles'],
      warning: ['Severe headache with vision changes', 'Sudden swelling of face/hands'],
    },
    tips: {
      nutrition: ['Salmon and walnuts for omega-3 (DHA) support.'],
      exercise: ['Pelvic tilts help relieve lower back strain.'],
      mentalHealth: ['Share news with wider family and friends if you wish.'],
      preparation: ['Consider starting a baby-name list.'],
    },
  },

  15: {
    baby: {
      size: 'An apple (≈ 10 cm)',
      caption: 'The foetus can sense light through the eyelids and may react to bright light on the belly.',
      highlights: [
        'Eyes begin to detect light',
        'Skeleton is hardening',
        'Taste buds form',
      ],
    },
    body: {
      changes: [
        'Possible weight gain of 1–2 kg this month',
        'Skin darkening (linea nigra) may appear',
        'Backaches begin as posture shifts',
      ],
    },
    symptoms: {
      normal: ['Mild back pain', 'Round ligament pain', 'Increased appetite'],
      warning: ['Severe abdominal pain', 'Bleeding'],
    },
    tips: {
      nutrition: ['Add magnesium-rich foods: almonds, spinach, avocado.'],
      exercise: ['Swimming remains a top recommendation for back relief.'],
      mentalHealth: ['Practice gratitude — research shows it lowers stress.'],
      preparation: ['Begin researching baby essentials (car seat, pram).'],
    },
  },

  16: {
    baby: {
      size: 'An avocado (≈ 11.6 cm)',
      caption: 'You may feel the first flutters of movement — "quickening".',
      highlights: [
        'First movements may be felt',
        'The nervous system is functional',
        'Ears are developed enough to hear sounds',
      ],
    },
    body: {
      changes: [
        'Uterus is halfway between pubic bone and navel',
        'Possible "pregnancy brain" forgetfulness',
        'Heartburn may increase',
      ],
    },
    symptoms: {
      normal: ['First foetal movements ("flutters")', 'Heartburn', 'Mild swelling'],
      warning: ['No foetal movement after previously feeling it (seek advice)'],
    },
    tips: {
      nutrition: ['Eat slowly and avoid trigger foods for heartburn.'],
      exercise: ['Try side-lying leg lifts to strengthen hips.'],
      mentalHealth: ['Talk or sing to your baby — they can hear you.'],
      preparation: ['Start thinking about your birth plan preferences.'],
    },
  },

  17: {
    baby: {
      size: 'A pear (≈ 13 cm)',
      caption: 'Fat stores are beginning to form under the skin. The skeleton is hardening from cartilage to bone.',
      highlights: [
        'Skeleton is ossifying',
        'Subcutaneous fat forms',
        'Sweat glands develop',
      ],
    },
    body: {
      changes: [
        'Possible weight gain of 0.5 kg per week',
        'Centre of gravity shifts; balance may feel off',
        'Possible vivid dreams',
      ],
    },
    symptoms: {
      normal: ['Dizziness on standing', 'Round ligament pain', 'Heartburn'],
      warning: ['Severe headache', 'Vision changes', 'Sudden swelling'],
    },
    tips: {
      nutrition: ['Healthy fats (avocado, nuts, olive oil) for brain development.'],
      exercise: ['Wall push-ups strengthen the upper body for carrying baby later.'],
      mentalHealth: ['Maintain a regular sleep schedule.'],
      preparation: ['Consider when to announce at work (if you have not already).'],
    },
  },

  18: {
    baby: {
      size: 'A bell pepper (≈ 14.2 cm)',
      caption: 'The foetus is now yawning, hiccupping, and may react to loud sounds.',
      highlights: [
        'Yawning and hiccupping begin',
        'Ears are in final position',
        'Nervous system is forming myelin sheaths',
      ],
    },
    body: {
      changes: [
        'Bump is visibly obvious',
        'Possible low back pain',
        'Increased appetite',
      ],
    },
    symptoms: {
      normal: ['Back pain', 'Mild swelling', 'Vivid dreams'],
      warning: ['Reduced foetal movement', 'Severe abdominal pain'],
    },
    tips: {
      nutrition: ['Vitamin C supports iron absorption — pair with citrus.'],
      exercise: ['Cat-cow stretches ease back tension.'],
      mentalHealth: ['Consider joining a pregnancy support group.'],
      preparation: ['Begin planning your maternity leave.'],
    },
  },

  19: {
    baby: {
      size: 'A tomato (≈ 15.3 cm)',
      caption: 'Sensory development is rapid. The brain is designating areas for the five senses.',
      highlights: [
        'Brain assigns regions to each sense',
        'Vernix (white protective coating) covers the skin',
        'Movement is more coordinated',
      ],
    },
    body: {
      changes: [
        'Possible leg cramps at night',
        'Skin stretching may cause itchiness',
        'Round ligament pain continues',
      ],
    },
    symptoms: {
      normal: ['Leg cramps', 'Itchy skin', 'Mild swelling'],
      warning: ['No foetal movement for over 24 hours after week 20'],
    },
    tips: {
      nutrition: ['Bananas and potassium may help prevent leg cramps.'],
      exercise: ['Stretch calves before bed to reduce night cramps.'],
      mentalHealth: ['Aromatherapy (lavender) can promote calm before sleep.'],
      preparation: ['Begin shopping for maternity clothes if needed.'],
    },
  },

  20: {
    baby: {
      size: 'A banana (≈ 25.6 cm)',
      caption: 'You are halfway! The anatomy scan can reveal the baby\'s sex if you wish to know.',
      highlights: [
        'Swallowing reflex is mature',
        'Meconium is accumulating in the bowel',
        'Movement is strong and frequent',
      ],
    },
    body: {
      changes: [
        'Uterus reaches the navel',
        'Possible linea nigra and darker nipples',
        'Increased vaginal discharge (leukorrhea) is normal',
      ],
    },
    symptoms: {
      normal: ['Increased vaginal discharge', 'Heartburn', 'Back pain'],
      warning: ['Bleeding', 'Severe headache', 'Sudden swelling', 'No foetal movement'],
    },
    tips: {
      nutrition: ['Continue iron-rich foods to support increased blood volume.'],
      exercise: ['Daily walking remains excellent; listen to your body.'],
      mentalHealth: ['Halfway milestone — celebrate your progress.'],
      preparation: ['Schedule the 20-week anatomy scan.'],
    },
  },

  21: {
    baby: {
      size: 'A carrot (≈ 26.7 cm)',
      caption: 'The foetus can hear external sounds clearly. Talk, sing, or read to your baby.',
      highlights: [
        'Hearing is sharp',
        'Eyelids are still fused shut',
        'Movements become more vigorous',
      ],
    },
    body: {
      changes: [
        'Possible varicose veins',
        'Stretch marks may begin to appear',
        'Mild Braxton Hicks contractions may start',
      ],
    },
    symptoms: {
      normal: ['Stretch marks', 'Mild Braxton Hicks', 'Mild swelling'],
      warning: ['Regular painful contractions', 'Bleeding', 'Severe headache'],
    },
    tips: {
      nutrition: ['Stay hydrated to reduce Braxton Hicks discomfort.'],
      exercise: ['Side-lying leg lifts reduce hip strain.'],
      mentalHealth: ['Start reading or playing music to the baby.'],
      preparation: ['Think through pain-management preferences for labour.'],
    },
  },

  22: {
    baby: {
      size: 'A coconut (≈ 27.8 cm)',
      caption: 'The foetus looks like a miniature newborn. Eyebrows and eyelids are visible.',
      highlights: [
        'Eyes are formed, though iris lacks pigment',
        'Lips and eyebrows are distinct',
        'Pancreas is producing hormones',
      ],
    },
    body: {
      changes: [
        'Possible bleeding gums (pregnancy gingivitis)',
        'Increased appetite',
        'Noticeable weight gain',
      ],
    },
    symptoms: {
      normal: ['Bleeding gums', 'Heartburn', 'Mild swelling'],
      warning: ['Severe headache with vision changes', 'Sudden severe swelling'],
    },
    tips: {
      nutrition: ['Vitamin K-rich greens (kale, spinach) support blood clotting.'],
      exercise: ['Swimming is ideal for joint and back relief.'],
      mentalHealth: ['Continue bonding activities — your voice is familiar.'],
      preparation: ['Consider a tour of the birthing facility.'],
    },
  },

  23: {
    baby: {
      size: 'A grapefruit (≈ 28.9 cm)',
      caption: 'The lungs are practising breathing movements. Hearing is responding to familiar voices.',
      highlights: [
        'Lungs are practising breathing',
        'Skin is still translucent',
        'Recognises familiar voices',
      ],
    },
    body: {
      changes: [
        'Possible swelling of ankles and feet',
        'Skin may feel itchy as it stretches',
        'Backaches are common',
      ],
    },
    symptoms: {
      normal: ['Ankle swelling', 'Back pain', 'Itchy skin'],
      warning: ['Sudden severe swelling of face or hands', 'Severe headache'],
    },
    tips: {
      nutrition: ['Hydrate well to reduce swelling and support amniotic fluid.'],
      exercise: ['Ankle rotations help reduce swelling.'],
      mentalHealth: ['Practice body-positive affirmations — your body is doing incredible work.'],
      preparation: ['Begin researching paediatricians.'],
    },
  },

  24: {
    baby: {
      size: 'An ear of corn (≈ 30 cm)',
      caption: 'The baby\'s hearing is improving. Loud sounds may startle them; familiar voices calm them.',
      highlights: [
        'Hearing is improving',
        'Lungs continue developing surfactant',
        'Baby responds to sounds and voices',
        'Facial features are fully defined',
      ],
    },
    body: {
      changes: [
        'You may feel rhythmic movements (hiccups)',
        'Possible rib pain as uterus expands',
        'Skin may feel tight and itchy',
      ],
    },
    symptoms: {
      normal: ['Foetal hiccups', 'Mild rib pain', 'Stretch marks'],
      warning: ['Heavy bleeding', 'Severe abdominal pain', 'Reduced foetal movement'],
    },
    tips: {
      nutrition: ['Increase iron-rich foods — blood volume peaks around now.'],
      exercise: ['20–30 minutes of walking is highly recommended.'],
      mentalHealth: ['Try gentle prenatal yoga for relaxation.'],
      preparation: ['Discuss your birth plan with your healthcare provider.'],
    },
  },

  25: {
    baby: {
      size: 'A cauliflower (≈ 34.6 cm)',
      caption: 'The baby is gaining fat and looks plumper. Hands are fully developed with working joints.',
      highlights: [
        'Subcutaneous fat smooths the skin',
        'Spine is forming its 33 vertebrae',
        'Nostrils begin to open',
      ],
    },
    body: {
      changes: [
        'Possible hemorrhoids from pressure',
        'Heartburn may continue',
        'Sleep may be more difficult',
      ],
    },
    symptoms: {
      normal: ['Hemorrhoids', 'Insomnia', 'Heartburn'],
      warning: ['Severe abdominal pain', 'Bleeding', 'Reduced foetal movement'],
    },
    tips: {
      nutrition: ['Fibre-rich foods reduce constipation and hemorrhoid discomfort.'],
      exercise: ['Pelvic tilts and stretches before bed promote sleep.'],
      mentalHealth: ['Use a pregnancy pillow to support side-sleeping.'],
      preparation: ['Begin planning baby\'s sleeping arrangement.'],
    },
  },

  26: {
    baby: {
      size: 'A butternut squash (≈ 35.6 cm)',
      caption: 'The baby opens their eyes for the first time. Brain wave activity shows response to sound.',
      highlights: [
        'Eyes open for the first time',
        'Brain responds to sound waves',
        'Lungs are producing surfactant',
      ],
    },
    body: {
      changes: [
        'Possible leg cramps, especially at night',
        'Braxton Hicks may become more frequent',
        'Uterus is well above the navel',
      ],
    },
    symptoms: {
      normal: ['Leg cramps', 'Braxton Hicks', 'Mild swelling'],
      warning: ['Persistent painful contractions', 'Severe headache', 'Vision changes'],
    },
    tips: {
      nutrition: ['Calcium (1000 mg/day) supports baby\'s bone development.'],
      exercise: ['Daily walks and gentle stretching.'],
      mentalHealth: ['Talk with your provider about any anxiety about labour.'],
      preparation: ['Consider who you want present at the birth.'],
    },
  },

  27: {
    baby: {
      size: 'A head of lettuce (≈ 36.6 cm)',
      caption: 'You are at the end of the second trimester. The baby can recognise your voice.',
      highlights: [
        'Brain is highly active',
        'Lungs are immature but functional',
        'Baby can recognise familiar voices',
      ],
    },
    body: {
      changes: [
        'Possible shortness of breath as uterus presses on lungs',
        'Backaches intensify',
        'Mild ankle swelling is common',
      ],
    },
    symptoms: {
      normal: ['Shortness of breath', 'Back pain', 'Mild swelling'],
      warning: ['Severe shortness of breath at rest', 'Chest pain'],
    },
    tips: {
      nutrition: ['Smaller, more frequent meals ease breathing.'],
      exercise: ['Prop yourself up while exercising to ease breathlessness.'],
      mentalHealth: ['Practice slow breathing exercises for labour preparation.'],
      preparation: ['Schedule the glucose screening test if not yet done.'],
    },
  },

  28: {
    baby: {
      size: 'An aubergine (≈ 37.6 cm)',
      caption: 'Welcome to the third trimester! The baby can dream (REM sleep is detectable).',
      highlights: [
        'REM sleep occurs',
        'Brain is developing billions of neurons',
        'Baby may respond to bright light on the belly',
      ],
    },
    body: {
      changes: [
        'Possible round ligament pain',
        'Braxton Hicks become more noticeable',
        'Increased fatigue is common',
      ],
    },
    symptoms: {
      normal: ['Braxton Hicks', 'Fatigue', 'Swelling'],
      warning: ['Heavy bleeding', 'Severe headache', 'Reduced foetal movement'],
    },
    tips: {
      nutrition: ['Continue iron-rich foods; consider adding vitamin C.'],
      exercise: ['Reduce intensity; focus on mobility and rest.'],
      mentalHealth: ['Third-trimester fatigue is real — rest as much as you can.'],
      preparation: ['Begin gathering baby essentials and washing baby clothes.'],
    },
  },

  29: {
    baby: {
      size: 'A butternut squash (≈ 38.6 cm)',
      caption: 'The baby\'s muscles and lungs are maturing. Head is growing to accommodate brain development.',
      highlights: [
        'Muscle tone is improving',
        'Bones are fully formed but still soft',
        'Head size increases to fit the brain',
      ],
    },
    body: {
      changes: [
        'Heartburn may worsen as the uterus pushes the stomach',
        'Possible pelvic discomfort as baby settles lower',
        'More frequent urination returns',
      ],
    },
    symptoms: {
      normal: ['Heartburn', 'Pelvic pressure', 'Frequent urination'],
      warning: ['Severe abdominal pain', 'Heavy bleeding', 'Reduced foetal movement'],
    },
    tips: {
      nutrition: ['Eat smaller meals and avoid lying down right after eating.'],
      exercise: ['Pelvic floor exercises support the added weight.'],
      mentalHealth: ['Discuss any birth anxieties with your provider.'],
      preparation: ['Pre-register at the hospital if you have not already.'],
    },
  },

  30: {
    baby: {
      size: 'A large cabbage (≈ 39.9 cm)',
      caption: 'The baby can regulate their own body temperature to a small degree. Brain is rapidly maturing.',
      highlights: [
        'Brain folds and grooves deepen',
        'Bone marrow is producing red blood cells',
        'Body temperature regulation is improving',
      ],
    },
    body: {
      changes: [
        'Possible difficulty sleeping',
        'Heartburn may continue',
        'Swelling of feet and ankles',
      ],
    },
    symptoms: {
      normal: ['Insomnia', 'Heartburn', 'Swelling'],
      warning: ['Sudden severe swelling', 'Severe headache', 'Visual disturbances'],
    },
    tips: {
      nutrition: ['Avoid spicy and acidic foods to reduce heartburn.'],
      exercise: ['Swimming or water walking relieves pressure.'],
      mentalHealth: ['Try a warm bath before bed to improve sleep.'],
      preparation: ['Pack your hospital bag checklist.'],
    },
  },

  31: {
    baby: {
      size: 'A coconut (≈ 41.1 cm)',
      caption: 'The baby is gaining weight rapidly. All five senses are fully functional.',
      highlights: [
        'Rapid weight gain (≈ 200 g per week)',
        'All five senses are working',
        'Bones are hardening',
      ],
    },
    body: {
      changes: [
        'Possible shortness of breath',
        'Braxton Hicks become more frequent',
        'Leaking colostrum from breasts is normal',
      ],
    },
    symptoms: {
      normal: ['Braxton Hicks', 'Leaking colostrum', 'Shortness of breath'],
      warning: ['Regular painful contractions', 'Vaginal bleeding', 'Severe abdominal pain'],
    },
    tips: {
      nutrition: ['Calcium (1000 mg/day) for the baby\'s growing bones.'],
      exercise: ['Short, frequent walks are easier than long sessions.'],
      mentalHealth: ['Practice perineal massage to reduce tearing at birth (after 34 weeks).'],
      preparation: ['Finalise your birth plan and share it with your provider.'],
    },
  },

  32: {
    baby: {
      size: 'A jicama (≈ 42.4 cm)',
      caption: 'The baby is rehearsing breathing, sucking, and swallowing — all skills needed after birth.',
      highlights: [
        'Practising breathing, sucking, and swallowing',
        'Skin is becoming less translucent',
        'Toenails and fingernails have formed',
      ],
    },
    body: {
      changes: [
        'Possible pelvic pressure as baby drops lower',
        'Increased vaginal discharge',
        'Backaches are common',
      ],
    },
    symptoms: {
      normal: ['Pelvic pressure', 'Increased discharge', 'Back pain'],
      warning: ['Heavy bleeding', 'Reduced foetal movement', 'Severe headache'],
    },
    tips: {
      nutrition: ['Smaller meals help; eat 5–6 times a day.'],
      exercise: ['Pelvic tilts and wall squats prepare the body for labour.'],
      mentalHealth: ['Write a list of comforting things for labour.'],
      preparation: ['Wash baby clothes and set up the changing station.'],
    },
  },

  33: {
    baby: {
      size: 'A celery stalk (≈ 43.7 cm)',
      caption: 'The baby\'s bones are hardening (except the skull, which stays soft for delivery).',
      highlights: [
        'Bones are hardening',
        'The skull remains soft for birth',
        'Immune system is developing',
      ],
    },
    body: {
      changes: [
        'Possible carpal tunnel symptoms (tingling fingers)',
        'Fatigue increases',
        'Braxton Hicks become more frequent',
      ],
    },
    symptoms: {
      normal: ['Carpal tunnel tingling', 'Fatigue', 'Braxton Hicks'],
      warning: ['Severe headache', 'Vision changes', 'Heavy bleeding'],
    },
    tips: {
      nutrition: ['Vitamin D-rich foods support baby\'s bone development.'],
      exercise: ['Hand stretches ease carpal tunnel discomfort.'],
      mentalHealth: ['Rest often; fatigue is your body\'s signal.'],
      preparation: ['Confirm your transportation plan to the hospital.'],
    },
  },

  34: {
    baby: {
      size: 'A pineapple (≈ 45 cm)',
      caption: 'The baby\'s lungs are nearly mature. The nervous system is fully developed.',
      highlights: [
        'Lungs are nearly mature',
        'Central nervous system is fully developed',
        'Vernix (white coating) is thickening',
      ],
    },
    body: {
      changes: [
        'Pelvic pressure increases as baby engages',
        'Possible difficulty walking long distances',
        'Insomnia is common',
      ],
    },
    symptoms: {
      normal: ['Pelvic pressure', 'Insomnia', 'Frequent urination'],
      warning: ['Reduced foetal movement', 'Heavy bleeding', 'Severe headache'],
    },
    tips: {
      nutrition: ['Iron-rich foods support blood loss during delivery.'],
      exercise: ['Short, slow walks; focus on mobility.'],
      mentalHealth: ['Rest in left-lateral position to optimise blood flow.'],
      preparation: ['Install the car seat and have it inspected if needed.'],
    },
  },

  35: {
    baby: {
      size: 'A honeydew melon (≈ 46.2 cm)',
      caption: 'The baby is filling out and gaining about 200 g per week. Kidneys are fully developed.',
      highlights: [
        'Rapid weight gain continues',
        'Kidneys are fully developed',
        'Liver is processing waste',
      ],
    },
    body: {
      changes: [
        'Possible lightning (baby dropping into pelvis)',
        'Easier breathing once baby drops',
        'Increased pelvic pressure',
      ],
    },
    symptoms: {
      normal: ['Increased pelvic pressure', 'Easier breathing', 'Frequent urination'],
      warning: ['No foetal movement', 'Vaginal bleeding', 'Severe abdominal pain'],
    },
    tips: {
      nutrition: ['Continue balanced meals; protein is especially important.'],
      exercise: ['Pelvic floor exercises and squats.'],
      mentalHealth: ['Visualise a positive birth experience.'],
      preparation: ['Confirm your support person knows the plan.'],
    },
  },

  36: {
    baby: {
      size: 'A romaine lettuce (≈ 47.4 cm)',
      caption: 'The baby is considered "early term" by medical definitions. The head may engage in the pelvis.',
      highlights: [
        'Head may engage in the pelvis ("lightening")',
        'Skin is smoothing as fat accumulates',
        'Gums are firm',
      ],
    },
    body: {
      changes: [
        'Possible loose bowel movements (a sign labour is near)',
        'Increased Braxton Hicks',
        'Difficulty sleeping persists',
      ],
    },
    symptoms: {
      normal: ['Loose stools', 'Braxton Hicks', 'Difficulty sleeping'],
      warning: ['Vaginal bleeding', 'Severe headache', 'Reduced foetal movement'],
    },
    tips: {
      nutrition: ['Stay hydrated; labour requires stamina.'],
      exercise: ['Slow walking and stretching.'],
      mentalHealth: ['Practice deep breathing to manage anticipation.'],
      preparation: ['Have a list of people to contact when labour begins.'],
    },
  },

  37: {
    baby: {
      size: 'A winter melon (≈ 48.6 cm)',
      caption: 'The baby is now considered "early term". Organs are ready for life outside the womb.',
      highlights: [
        'All organs are ready for life outside',
        'Grasp reflex is strong',
        'Lungs are mature',
      ],
    },
    body: {
      changes: [
        'Possible bloody show (mucus plug discharge)',
        'Strong Braxton Hicks',
        'Pelvic discomfort intensifies',
      ],
    },
    symptoms: {
      normal: ['Bloody show', 'Strong Braxton Hicks', 'Pelvic discomfort'],
      warning: ['Heavy bleeding', 'Reduced foetal movement', 'Severe abdominal pain'],
    },
    tips: {
      nutrition: ['Eat light, easy-to-digest meals.'],
      exercise: ['Rest is more important than exercise now.'],
      mentalHealth: ['Trust your body — it knows what to do.'],
      preparation: ['Final check of hospital bag and birth plan.'],
    },
  },

  38: {
    baby: {
      size: 'A leek (≈ 49.8 cm)',
      caption: 'The baby is "full term" any day now. They are shedding lanugo (fine hair).',
      highlights: [
        'Shedding lanugo',
        'Grasp reflex is strong',
        'Lungs are mature and ready',
      ],
    },
    body: {
      changes: [
        'More frequent Braxton Hicks',
        'Possible backache',
        'Difficulty sleeping',
      ],
    },
    symptoms: {
      normal: ['Frequent Braxton Hicks', 'Backache', 'Insomnia'],
      warning: ['Reduced foetal movement', 'Heavy bleeding', 'Severe abdominal pain'],
    },
    tips: {
      nutrition: ['Continue iron and protein-rich foods.'],
      exercise: ['Gentle walking and stretching.'],
      mentalHealth: ['Stay calm and ready.'],
      preparation: ['Keep your phone charged and plan to call your provider.'],
    },
  },

  39: {
    baby: {
      size: 'A small pumpkin (≈ 50.7 cm)',
      caption: 'The baby is "full term" and ready for birth. Brain continues rapid development.',
      highlights: [
        'Brain continues developing rapidly',
        'Placenta is still providing antibodies',
        'Movements may feel different (less rolling, more squirming)',
      ],
    },
    body: {
      changes: [
        'Possible water breaking (rupture of membranes)',
        'Strong, regular contractions may begin',
        'Nesting instinct often peaks',
      ],
    },
    symptoms: {
      normal: ['Strong contractions', 'Nesting urges', 'Water breaking'],
      warning: ['Heavy bleeding', 'No foetal movement', 'Severe headache with vision changes'],
    },
    tips: {
      nutrition: ['Eat light, energy-rich snacks if labour begins.'],
      exercise: ['Rest as much as possible; conserve energy.'],
      mentalHealth: ['Trust your body and your support team.'],
      preparation: ['Notify your support team if contractions are 5 minutes apart.'],
    },
  },

  40: {
    baby: {
      size: 'A watermelon (≈ 51.2 cm)',
      caption: 'The baby is officially "full term". They are ready to meet you any moment.',
      highlights: [
        'Fully developed and ready for birth',
        'Antibodies are crossing the placenta',
        'Movements may feel different due to limited space',
      ],
    },
    body: {
      changes: [
        'Cervix is softening and may begin to dilate',
        'Stronger and more frequent Braxton Hicks',
        'Possible bloody show',
      ],
    },
    symptoms: {
      normal: ['Bloody show', 'Strong Braxton Hicks', 'Loose stools'],
      warning: ['Heavy bleeding', 'Reduced foetal movement', 'Severe abdominal pain', 'Rupture of membranes with green or brown fluid'],
    },
    tips: {
      nutrition: ['Light, easy-to-digest meals; keep sipping water.'],
      exercise: ['Gentle walking may help labour begin.'],
      mentalHealth: ['Stay focused — you are about to meet your baby.'],
      preparation: ['Time contractions (frequency and duration) once they begin.'],
    },
  },
}

/**
 * Return the content object for a given gestational week, clamped to 1–40.
 * @param {number | null | undefined} w
 * @returns {WeekContent}
 */
export function weekContent(w) {
  const n = Number(w)
  const safe = Number.isFinite(n) ? Math.max(1, Math.min(40, Math.trunc(n))) : 20
  return PREGNANCY_CALENDAR[safe]
}
