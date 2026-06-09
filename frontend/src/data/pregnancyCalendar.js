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


export const PREGNANCY_CALENDAR_BN = {
  1: {
    size_bn: 'একটি একক কোষ (জাইগোট)',
    caption_bn:
      'এইমাত্র গর্ভধারণ হয়েছে। নিষিক্ত ডিম্বাণু ফ্যালোপিয়ান টিউব দিয়ে নেমে আসছে এবং এই সপ্তাহে জরায়ুতে প্রতিস্থাপিত হবে।',
    highlights_bn: [
      'কোষ বিভাজন দ্রুতগতিতে চলছে',
      'উভয় বাবা-মায়ের জেনেটিক উপাদান একত্রিত হয়েছে',
      'জরায়ুর আস্তরণে প্রতিস্থাপন শুরু হচ্ছে',
    ],
    changes_bn: [
      'প্রতিস্থাপন রক্তপাত (হালকা দাগ) হতে পারে',
      'হালকা জরায়ু সংকোচন',
      'হরমোনাল পরিবর্তন তাৎক্ষণিকভাবে শুরু হয়',
      'ক্লান্তি শুরু হতে পারে',
    ],
    normal_bn: ['হালকা দাগ', 'হালকা খিঁচুনি', 'পেট ফাঁপা'],
    warning_bn: ['তীব্র ব্যথাসহ ভারী রক্তপাত', 'দীর্ঘস্থায়ী উচ্চ জ্বর'],
    nutrition_bn: [
      'যদি এখনো না করে থাকেন, ফলিক অ্যাসিড (৪০০–৮০০ মাইক্রোগ্রাম/দিন) শুরু করুন।',
    ],
    exercise_bn: [
      'আপনার স্বাভাবিক হালকা কার্যকলাপ বজায় রাখুন; এখনই নতুন কঠোর রুটিন শুরু করবেন না।',
    ],
    mentalHealth_bn: ['একটু শ্বাস নিন — এটি একটি দীর্ঘ যাত্রার শুরু।'],
    preparation_bn: [
      'প্রথম প্রসবপূর্ব অ্যাপয়েন্টমেন্ট নির্ধারণ করুন (আদর্শভাবে ১২ সপ্তাহের আগে)।',
    ],
  },
  2: {
    size_bn: 'একটি পোস্তদানা (≈ ০.১ মিমি)',
    caption_bn:
      'ব্লাস্টোসিস্ট জরায়ুর দেওয়ালে প্রতিস্থাপিত হয় এবং গর্ভাবস্থার হরমোন hCG উৎপাদন শুরু করে।',
    highlights_bn: [
      'কোষগুলি প্লাসেন্টা ও ভ্রূণ গঠনকারী দলে বিভক্ত হচ্ছে',
      'hCG হরমোন আপনার শরীরে গর্ভাবস্থার সংকেত দিতে শুরু করে',
      'অ্যামনিওটিক থলি ও ইয়োক থলি তৈরি হচ্ছে',
    ],
    changes_bn: [
      'hCG হরমোন দ্রুত বাড়তে শুরু করে',
      'বেসাল শরীরের তাপমাত্রা উঁচুতে থাকে',
      'হালকা পেট ফাঁপা বা জলধারণ',
    ],
    normal_bn: ['স্তন সংবেদনশীলতা', 'হালকা ক্লান্তি', 'গন্ধের তীব্র অনুভূতি'],
    warning_bn: ['এক পাশে তীব্র পেটব্যথা'],
    nutrition_bn: ['আয়রনসমৃদ্ধ খাবার শুরু করুন (সবুজ শাক, মসুর ডাল, খেজুর)।'],
    exercise_bn: ['প্রতিদিন ২০ মিনিটের হাঁটা একটি ভালো বেসলাইন।'],
    mentalHealth_bn: ['নিজের ইচ্ছামতো সময়ে সংবাদ শেয়ার করুন।'],
    preparation_bn: ['নিশ্চিত করুন প্রসবপূর্ব ভিটামিনে DHA ও আয়োডিন আছে।'],
  },
  3: {
    size_bn: 'একটি তিলের দানা (≈ ০.২ মিমি)',
    caption_bn:
      'ভ্রূণ আকার নিতে শুরু করে। তিনটি স্তর শরীরের প্রতিটি অঙ্গ ও টিস্যু গঠন করবে।',
    highlights_bn: [
      'তিনটি জার্ম স্তর (এক্টোডার্ম, মেসোডার্ম, এন্ডোডার্ম) গঠিত হচ্ছে',
      'নিউরাল টিউব বন্ধ হতে শুরু করে',
      'প্লাসেন্টা hCG উৎপাদন শুরু করে',
    ],
    changes_bn: [
      'hCG মাত্রা প্রতি ৪৮ ঘণ্টায় প্রায় দ্বিগুণ হয়',
      'হালকা স্তন সংবেদনশীলতা',
      'প্রতিস্থাপন থেকে হালকা দাগ সম্ভব',
    ],
    normal_bn: ['দাগ', 'খিঁচুনি', 'ক্লান্তি'],
    warning_bn: ['রক্ত জমাট সহ ভারী রক্তপাত'],
    nutrition_bn: ['হাইড্রেটেড থাকুন — প্রতিদিন ৮–১০ কাপ তরল পান করুন।'],
    exercise_bn: ['আপনার শরীরের কথা শুনুন; ক্লান্ত হলে বিশ্রাম নিন।'],
    mentalHealth_bn: ['মেজাজ পরিবর্তন স্বাভাবিক — নিজের প্রতি সদয় হন।'],
    preparation_bn: [
      'প্রযোজ্য হলে ধূমপান, অ্যালকোহল বন্ধ করুন এবং ক্যাফেইন সীমিত করুন।',
    ],
  },
  4: {
    size_bn: 'একটি পোস্তদানা (≈ ০.৪ মিমি)',
    caption_bn:
      'hCG বাড়ার সাথে সাথে এই সপ্তাহে সাধারণত একটি হোম প্রেগন্যান্সি টেস্ট গর্ভাবস্থা নিশ্চিত করতে পারে।',
    highlights_bn: [
      'প্রতিস্থাপন সম্পন্ন',
      'অ্যামনিওটিক তরল জমা হতে শুরু করেছে',
      'মস্তিষ্ক ও মেরুদণ্ডের প্রাথমিক পর্যায় গঠিত হচ্ছে',
    ],
    changes_bn: [
      'মিসড পিরিয়ড প্রথম স্পষ্ট লক্ষণ',
      'হরমোনাল পরিবর্তন তীব্র হয়',
      'সম্ভব সকালের বমি শুরু',
    ],
    normal_bn: [
      'বমি বমি ভাব',
      'স্তন সংবেদনশীলতা',
      'ক্লান্তি',
      'ঘন ঘন প্রস্রাব',
    ],
    warning_bn: ['ভারী রক্তপাত', 'এক পাশে তীব্র ব্যথা'],
    nutrition_bn: ['ছোট ছোট, ঘন ঘন খাবার বমি বমি ভাব নিয়ন্ত্রণে সাহায্য করে।'],
    exercise_bn: ['হালকা যোগব্যায়াম বা হাঁটা অব্যাহত রাখা নিরাপদ।'],
    mentalHealth_bn: [
      'উদ্বিগ্ন বোধ করা স্বাভাবিক — সঙ্গী বা বন্ধুর সাথে কথা বলুন।',
    ],
    preparation_bn: ['এখনো না হলে প্রথম প্রসবপূর্ব ভিজিট বুক করুন।'],
  },
  5: {
    size_bn: 'একটি তিলের দানা (≈ ১.৫ মিমি)',
    caption_bn:
      'হৃদয় গঠিত হচ্ছে এবং স্পন্দন শুরু হতে পারে। এই সপ্তাহে নিউরাল টিউব বন্ধ হচ্ছে।',
    highlights_bn: [
      'একটি ক্ষুদ্র হৃদয় নল স্পন্দন করতে শুরু করে',
      'মস্তিষ্ক ও মেরুদণ্ড গঠিত হচ্ছে',
      'বাহু ও পায়ের কুঁড়ি দৃশ্যমান',
    ],
    changes_bn: [
      'এই সময়ে hCG মাত্রা সর্বোচ্চে পৌঁছায়',
      'সকালের বমি প্রায়ই তীব্র হয়',
      'গন্ধের তীব্র অনুভূতি ও খাবারে বিতৃষ্ণা',
    ],
    normal_bn: ['বমি বমি ভাব', 'বমি', 'স্তন সংবেদনশীলতা', 'মেজাজ পরিবর্তন'],
    warning_bn: ['তরল গ্রহণ রোধকারী ক্রমাগত বমি', 'তীব্র পেটব্যথা'],
    nutrition_bn: ['আদা চা ও ভিটামিন B6 বমি বমি ভাব কমাতে পারে।'],
    exercise_bn: [
      'বমি বমি ভাবের শীর্ষে বিশ্রাম নিন; সক্ষম হলে নড়াচড়া সাহায্য করে।',
    ],
    mentalHealth_bn: [
      'মেজাজ পরিবর্তন হরমোনাল — প্রিয়জনদের সাথে যোগাযোগ রাখুন।',
    ],
    preparation_bn: [
      'আপনার প্রসবপূর্ব ক্লিনিক বেছে নিন এবং প্রথম ভিজিট বুক করুন।',
    ],
  },
  6: {
    size_bn: 'একটি মসুরের ডাল (≈ ৪ মিমি)',
    caption_bn:
      'মুখের বৈশিষ্ট্য গঠন হতে শুরু করেছে। হৃদয় এখন নিয়মিত স্পন্দন করছে।',
    highlights_bn: [
      'চোখ, কান ও মুখ গঠিত হচ্ছে',
      'আল্ট্রাসাউন্ডে হৃদস্পন্দন শনাক্তযোগ্য',
      'অঙ্গের কুঁড়ি দীর্ঘ হচ্ছে',
    ],
    changes_bn: [
      'সকালের বমি প্রায়ই শীর্ষে',
      'লালার উৎপাদন বাড়ে',
      'জরায়ু প্রসারিত হতে শুরু করেছে',
    ],
    normal_bn: [
      'বমি বমি ভাব ও বমি',
      'ক্লান্তি',
      'খাবারে বিতৃষ্ণা',
      'ঘন ঘন প্রস্রাব',
    ],
    warning_bn: [
      'ভারী রক্তপাত',
      'নিচের ডানদিকে তীব্র পেটব্যথা (একটোপিক বাদ দিন)',
    ],
    nutrition_bn: ['রক্তে শর্করা স্থিতিশীল করতে প্রতিটি খাবারে প্রোটিন খান।'],
    exercise_bn: ['প্রতিদিন ১৫–২০ মিনিট হালকা হাঁটা।'],
    mentalHealth_bn: ['অভিভূত হলে ধীরে ধীরে গভীর শ্বাস নিন।'],
    preparation_bn: ['স্বাস্থ্যসেবা প্রদানকারীর সাথে গর্ভাবস্থা নিশ্চিত করুন।'],
  },
  7: {
    size_bn: 'একটি ব্লুবেরি (≈ ১ সেমি)',
    caption_bn: 'হাত ও পা আকার নিচ্ছে। মস্তিষ্ক দ্রুতগতিতে বিকশিত হচ্ছে।',
    highlights_bn: [
      'ক্ষুদ্র আঙুল ও পায়ের আঙুল গঠিত হচ্ছে',
      'মস্তিষ্কের গোলার্ধ বাড়ছে',
      'মেরুদণ্ড সোজা হওয়ার সাথে লেজ সংকুচিত হচ্ছে',
    ],
    changes_bn: [
      'জরায়ু দ্বিগুণ আকার হয়েছে',
      'রক্তের পরিমাণ বাড়ছে',
      'ব্রণ বা ত্বকের পরিবর্তন হতে পারে',
    ],
    normal_bn: ['বমি বমি ভাব', 'বুকজ্বালা', 'কোষ্ঠকাঠিন্য', 'মেজাজ পরিবর্তন'],
    warning_bn: ['ভারী রক্তপাত', 'তীব্র পেটব্যথা', 'উচ্চ জ্বর'],
    nutrition_bn: ['কোষ্ঠকাঠিন্য কমাতে ফাইবারসমৃদ্ধ খাবার ও প্রচুর পানি।'],
    exercise_bn: [
      'হালকা দৈনিক কার্যকলাপ অব্যাহত রাখুন; অতিরিক্ত গরম এড়িয়ে চলুন।',
    ],
    mentalHealth_bn: [
      'আবেগ ট্র্যাক করতে একটি গর্ভাবস্থা জার্নাল বিবেচনা করুন।',
    ],
    preparation_bn: ['আপনার এলাকায় প্রসব শিক্ষার ক্লাস খোঁজ করুন।'],
  },
  8: {
    size_bn: 'একটি কিডনি বিন (≈ ১.৬ সেমি)',
    caption_bn: 'ভ্রূণ এখন ফিটাস। চোখের পাতা ও কান বিস্তারিতভাবে গঠিত হচ্ছে।',
    highlights_bn: [
      'মুখের বৈশিষ্ট্য আরও স্পষ্ট',
      'বাহু ও পা দীর্ঘ হচ্ছে',
      'হৃদয়ে চারটি প্রকোষ্ঠ আছে',
    ],
    changes_bn: [
      'জরায়ু একটি লেবুর আকার',
      'স্তন সংবেদনশীলতা অব্যাহত',
      'বুকে দৃশ্যমান শিরা হতে পারে',
    ],
    normal_bn: ['বমি বমি ভাব', 'ক্লান্তি', 'পেট ফাঁপা', 'বুকজ্বালা'],
    warning_bn: ['ভারী রক্তপাত', 'তীব্র পেটব্যথা'],
    nutrition_bn: ['ফলিক অ্যাসিড ও প্রসবপূর্ব ভিটামিন অব্যাহত রাখুন।'],
    exercise_bn: ['পেলভিক ফ্লোর ব্যায়াম (কেগেলস) নিরাপদ ও উপকারী।'],
    mentalHealth_bn: [
      'সঙ্গীর সাথে অনুভূতি ভাগ করুন — উন্মুক্ত যোগাযোগ সাহায্য করে।',
    ],
    preparation_bn: ['প্রথম আল্ট্রাসাউন্ড (ডেটিং স্ক্যান) নির্ধারণ করুন।'],
  },
  9: {
    size_bn: 'একটি আঙুর (≈ ২.৩ সেমি)',
    caption_bn:
      'লেজ অদৃশ্য হয়েছে। ক্ষুদ্র পেশি গঠিত হচ্ছে, যা প্রথম নড়াচড়ার সুযোগ দেয়।',
    highlights_bn: [
      'বাহু এখন কনুইতে বাঁকানো যায়',
      'আঙুল ও পায়ের আঙুল আরও স্পষ্ট',
      'অপরিহার্য অঙ্গ স্থাপিত',
    ],
    changes_bn: [
      'কোমর সামান্য মোটা হতে শুরু হতে পারে',
      'হরমোন মাড়িকে প্রভাবিত করতে পারে (গর্ভাবস্থার মাড়ির রোগ)',
      'বুকজ্বালা আরও খারাপ হতে পারে',
    ],
    normal_bn: [
      'বমি বমি ভাব',
      'খাবারে আকর্ষণ বা বিতৃষ্ণা',
      'ক্লান্তি',
      'মেজাজ পরিবর্তন',
    ],
    warning_bn: ['ডানদিকে তীব্র ব্যথা', 'ভারী রক্তপাত'],
    nutrition_bn: ['ছোট ঘন ঘন খাবার; খাওয়ার পরপরই শুয়ে পড়বেন না।'],
    exercise_bn: ['প্রতিদিন ২০–৩০ মিনিটের নিরাপদ নড়াচড়া অব্যাহত রাখুন।'],
    mentalHealth_bn: ['প্রতি সকালে ১০ মিনিট গাইডেড মেডিটেশন চেষ্টা করুন।'],
    preparation_bn: [
      'প্রদানকারীর সাথে জেনেটিক স্ক্রিনিং বিকল্পগুলি আলোচনা করুন।',
    ],
  },
  10: {
    size_bn: 'একটি কুমকুয়াট (≈ ৩.১ সেমি)',
    caption_bn: 'অঙ্গ গঠনের সংকটকাল সম্পন্ন। ফিটাস এখন বৃদ্ধিতে মনোযোগ দেয়।',
    highlights_bn: [
      'সমস্ত গুরুত্বপূর্ণ অঙ্গ গঠিত হয়েছে',
      'মস্তিষ্ক প্রতি মিনিটে ২৫০,০০০ নিউরন তৈরি করছে',
      'আঙুল ও পায়ের আঙুল আলাদা',
    ],
    changes_bn: [
      'জরায়ু একটি ছোট কমলালেবুর আকার',
      'হালকা ওজন বাড়তে শুরু করে',
      'রাউন্ড লিগামেন্ট প্রসারিত হওয়ায় সংক্ষিপ্ত যন্ত্রণা হতে পারে',
    ],
    normal_bn: ['হালকা বমি বমি ভাব', 'দৃশ্যমান শিরা', 'বুকজ্বালা', 'ক্লান্তি'],
    warning_bn: ['ভারী রক্তপাত', 'তীব্র পেলভিক ব্যথা'],
    nutrition_bn: ['ক্যালসিয়ামসমৃদ্ধ খাবার যোগ করুন: দই, দুধ, তিলের বীজ।'],
    exercise_bn: ['সাঁতার চমৎকার — জয়েন্টের চাপ কমায়।'],
    mentalHealth_bn: ['গর্ভবতী হয়েছেন এমন বন্ধু বা পরিবারের সাথে কথা বলুন।'],
    preparation_bn: ['কোথায় প্রসব করতে চান তা ভাবা শুরু করুন।'],
  },
  11: {
    size_bn: 'একটি ডুমুর (≈ ৪.১ সেমি)',
    caption_bn:
      'ফিটাস স্পষ্টভাবে মানবিক দেখাচ্ছে। মাড়ির নিচে দাঁতের কুঁড়ি গঠিত হচ্ছে।',
    highlights_bn: [
      'দাঁতের কুঁড়ি ও চুলের ফলিকল গঠিত',
      'ডায়াফ্রাম বিকশিত হচ্ছে (অনুশীলন হেঁচকি)',
      'বাহ্যিক যৌনাঙ্গ পার্থক্য করতে শুরু করে',
    ],
    changes_bn: [
      'বমি বমি ভাব প্রায়ই কমতে শুরু করে',
      'শক্তির মাত্রা উন্নত হতে পারে',
      'জরায়ু পেলভিস পূরণ করে',
    ],
    normal_bn: [
      'হালকা বমি বমি ভাব',
      'বর্ধিত ক্ষুধা',
      'কোষ্ঠকাঠিন্য',
      'মাথাব্যথা',
    ],
    warning_bn: ['ঝাপসা দৃষ্টি', 'তীব্র মাথাব্যথা', 'হঠাৎ ফোলা'],
    nutrition_bn: ['আয়রনসমৃদ্ধ খাবার রক্তের পরিমাণ বাড়াতে সাহায্য করে।'],
    exercise_bn: [
      'নমনীয়তা ও শ্বাসকার্যের জন্য প্রসবপূর্ব যোগব্যায়াম চেষ্টা করুন।',
    ],
    mentalHealth_bn: ['বমি বমি ভাব কমলে মেজাজ উন্নত হয় — স্বস্তি উপভোগ করুন।'],
    preparation_bn: [
      'দ্বিতীয় ত্রৈমাসিকে কোনো পরিকল্পিত ভ্রমণ নিরাপদ কিনা নিশ্চিত করুন।',
    ],
  },
  12: {
    size_bn: 'একটি লেবু (≈ ৫.৪ সেমি)',
    caption_bn:
      'প্রথম ত্রৈমাসিকের শেষ ঘনিয়ে আসছে। ফিটাস ছোট নড়াচড়া করতে পারে।',
    highlights_bn: [
      'প্রতিচ্ছবি বিকশিত হচ্ছে',
      'স্বরতন্ত্র গঠিত',
      'অন্ত্র নাভি রজ্জু থেকে পেটে স্থানান্তরিত হয়',
    ],
    changes_bn: [
      'প্রথম ত্রৈমাসিকের লক্ষণ কমতে শুরু করে',
      "রক্ত প্রবাহ বৃদ্ধির কারণে ত্বক 'চকচকে' হতে পারে",
      'জরায়ু পেলভিক হাড়ের উপরে ওঠে',
    ],
    normal_bn: ['হালকা মাথাব্যথা', 'দ্রুত দাঁড়ালে মাথা ঘোরা', 'বর্ধিত শক্তি'],
    warning_bn: ['ডানদিকে তীব্র ব্যথা', 'ভারী রক্তপাত', 'ক্রমাগত বমি'],
    nutrition_bn: [
      'প্রতিদিন ৫টি বৈচিত্র্যময় রঙের ছোট খাবার খাওয়ার লক্ষ্য রাখুন।',
    ],
    exercise_bn: [
      'অনুমোদিত প্রসবপূর্ব নড়াচড়া দিয়ে মূল অংশ হালকাভাবে শক্তিশালী করুন।',
    ],
    mentalHealth_bn: ['প্রথম ত্রৈমাসিকের মাইলফলক উদযাপন করুন।'],
    preparation_bn: [
      'নিউক্লিয়াল ট্রান্সলুসেন্সি আল্ট্রাসাউন্ড নির্ধারণ করুন যদি চান।',
    ],
  },
  13: {
    size_bn: 'একটি লেবু (≈ ৭.৪ সেমি)',
    caption_bn:
      'দ্বিতীয় ত্রৈমাসিকে স্বাগতম! আঙুলের ছাপ গঠিত হয়েছে এবং ফিটাস সক্রিয়ভাবে নড়ছে।',
    highlights_bn: [
      'আঙুলের ছাপ সম্পূর্ণভাবে গঠিত',
      'স্বরতন্ত্র প্রস্তুত',
      'চোষার প্রতিচ্ছবি বিকশিত হয়',
    ],
    changes_bn: [
      'শক্তি ফিরে আসে',
      'বমি বমি ভাব সাধারণত কমে',
      'দৃশ্যমান বাম্প দেখা শুরু হতে পারে',
    ],
    normal_bn: ['বর্ধিত ক্ষুধা', 'হালকা মাথা ঘোরা', 'রাউন্ড লিগামেন্ট ব্যথা'],
    warning_bn: ['তীব্র পেটব্যথা', 'ভারী রক্তপাত'],
    nutrition_bn: ['প্রতিদিন ৬০–৮০ গ্রাম প্রোটিন গ্রহণ বাড়ান।'],
    exercise_bn: ['সপ্তাহে ১৫০ মিনিট মাঝারি ব্যায়াম আদর্শ।'],
    mentalHealth_bn: [
      'কম বমি বমি ভাব প্রায়ই মেজাজ উন্নত করে — এই পর্যায়টি উপভোগ করুন।',
    ],
    preparation_bn: [
      'মাতৃত্বকালীন পোশাকের প্রয়োজনীয়তা সম্পর্কে ভাবতে শুরু করুন।',
    ],
  },
  14: {
    size_bn: 'একটি পিচ ফল (≈ ৮.৭ সেমি)',
    caption_bn:
      'মুখের অভিব্যক্তি শুরু হয়। ফিটাস চোখ কুঁচকাতে, ভ্রু কোঁচকাতে ও মুখ বাঁকাতে পারে।',
    highlights_bn: [
      'মুখের পেশি কাজ করে',
      'লানুগো (সূক্ষ্ম চুল) শরীর ঢেকে রাখে',
      'প্রোস্টেট বা ডিম্বাশয় বিকশিত হয়',
    ],
    changes_bn: [
      'বাম্প আরও স্পষ্ট হয়ে ওঠে',
      'স্তনের পরিবর্তন অব্যাহত',
      "সম্ভব নাকের কনজেশন ('গর্ভাবস্থার রাইনাইটিস')",
    ],
    normal_bn: ['নাকের কনজেশন', 'বর্ধিত শক্তি', 'গোড়ালিতে হালকা ফোলা'],
    warning_bn: ['দৃষ্টি পরিবর্তনসহ তীব্র মাথাব্যথা', 'মুখ/হাতে হঠাৎ ফোলা'],
    nutrition_bn: ['ওমেগা-৩ (DHA) সহায়তার জন্য স্যামন ও আখরোট।'],
    exercise_bn: ['পেলভিক টিল্ট নিচের পিঠের চাপ কমায়।'],
    mentalHealth_bn: [
      'ইচ্ছা হলে বৃহত্তর পরিবার ও বন্ধুদের সাথে সংবাদ শেয়ার করুন।',
    ],
    preparation_bn: ['শিশুর নামের তালিকা তৈরি শুরু বিবেচনা করুন।'],
  },
  15: {
    size_bn: 'একটি আপেল (≈ ১০ সেমি)',
    caption_bn:
      'ফিটাস চোখের পাতার মাধ্যমে আলো অনুভব করতে পারে এবং পেটে উজ্জ্বল আলোতে প্রতিক্রিয়া দেখাতে পারে।',
    highlights_bn: [
      'চোখ আলো শনাক্ত করতে শুরু করে',
      'হাড়ের কঙ্কাল শক্ত হচ্ছে',
      'স্বাদ কুঁড়ি গঠিত',
    ],
    changes_bn: [
      'এই মাসে সম্ভব ১–২ কেজি ওজন বাড়া',
      'ত্বক কালো হওয়া (লিনিয়া নিগ্রা) হতে পারে',
      'ভঙ্গি পরিবর্তনের কারণে পিঠব্যথা শুরু',
    ],
    normal_bn: ['হালকা পিঠব্যথা', 'রাউন্ড লিগামেন্ট ব্যথা', 'বর্ধিত ক্ষুধা'],
    warning_bn: ['তীব্র পেটব্যথা', 'রক্তপাত'],
    nutrition_bn: [
      'ম্যাগনেসিয়ামসমৃদ্ধ খাবার যোগ করুন: বাদাম, পালং শাক, অ্যাভোকাডো।',
    ],
    exercise_bn: ['পিঠের স্বস্তির জন্য সাঁতার শীর্ষ সুপারিশ থাকে।'],
    mentalHealth_bn: ['কৃতজ্ঞতা অনুশীলন করুন — গবেষণা দেখায় এটি চাপ কমায়।'],
    preparation_bn: [
      'শিশুর প্রয়োজনীয়তা (কার সিট, প্র্যাম) নিয়ে গবেষণা শুরু করুন।',
    ],
  },
  16: {
    size_bn: 'একটি অ্যাভোকাডো (≈ ১১.৬ সেমি)',
    caption_bn: "আপনি প্রথম নড়াচড়ার অনুভূতি পেতে পারেন — 'কুইকেনিং'।",
    highlights_bn: [
      'প্রথম নড়াচড়া অনুভব হতে পারে',
      'স্নায়ুতন্ত্র কার্যকর',
      'কান যথেষ্ট বিকশিত যে শব্দ শুনতে পারে',
    ],
    changes_bn: [
      'জরায়ু পিউবিক হাড় ও নাভির মাঝামাঝি',
      "সম্ভব 'গর্ভাবস্থার মস্তিষ্ক' বিস্মৃতি",
      'বুকজ্বালা বাড়তে পারে',
    ],
    normal_bn: ["প্রথম ভ্রূণের নড়াচড়া ('ঝাপটা')", 'বুকজ্বালা', 'হালকা ফোলা'],
    warning_bn: ['পূর্বে অনুভব করার পর ভ্রূণের নড়াচড়া না থাকা (পরামর্শ নিন)'],
    nutrition_bn: ['ধীরে খান এবং বুকজ্বালার ট্রিগার খাবার এড়িয়ে চলুন।'],
    exercise_bn: ['নিতম্ব শক্তিশালী করতে পাশ শুয়ে পা তোলা চেষ্টা করুন।'],
    mentalHealth_bn: ['শিশুর সাথে কথা বলুন বা গান গাইন — তারা শুনতে পাচ্ছে।'],
    preparation_bn: ['আপনার প্রসব পরিকল্পনার পছন্দ ভাবতে শুরু করুন।'],
  },
  17: {
    size_bn: 'একটি নাশপাতি (≈ ১৩ সেমি)',
    caption_bn:
      'ত্বকের নিচে চর্বির মজুদ গঠিত হতে শুরু করেছে। কঙ্কাল তরুণাস্থি থেকে হাড়ে শক্ত হচ্ছে।',
    highlights_bn: [
      'কঙ্কাল অস্থিভবন হচ্ছে',
      'ত্বকের নিচে চর্বি জমছে',
      'ঘর্মগ্রন্থি বিকশিত হচ্ছে',
    ],
    changes_bn: [
      'সম্ভব প্রতি সপ্তাহে ০.৫ কেজি ওজন বাড়া',
      'মাধ্যাকর্ষণ কেন্দ্র সরে যায়; ভারসাম্য অস্বস্তিকর মনে হতে পারে',
      'সম্ভব জীবন্ত স্বপ্ন',
    ],
    normal_bn: ['দাঁড়ালে মাথা ঘোরা', 'রাউন্ড লিগামেন্ট ব্যথা', 'বুকজ্বালা'],
    warning_bn: ['তীব্র মাথাব্যথা', 'দৃষ্টি পরিবর্তন', 'হঠাৎ ফোলা'],
    nutrition_bn: [
      'মস্তিষ্কের বিকাশের জন্য স্বাস্থ্যকর ফ্যাট (অ্যাভোকাডো, বাদাম, জলপাই তেল)।',
    ],
    exercise_bn: [
      'দেওয়াল পুশ-আপ পরে শিশু বহনের জন্য উপরের শরীর শক্তিশালী করে।',
    ],
    mentalHealth_bn: ['নিয়মিত ঘুমের সময়সূচি বজায় রাখুন।'],
    preparation_bn: [
      'কর্মক্ষেত্রে কখন ঘোষণা করবেন তা বিবেচনা করুন (যদি এখনো না করে থাকেন)।',
    ],
  },
  18: {
    size_bn: 'একটি বেল পেপার (≈ ১৪.২ সেমি)',
    caption_bn:
      'ফিটাস এখন হাই তুলছে, হেঁচকি দিচ্ছে এবং উচ্চ শব্দে প্রতিক্রিয়া দেখাতে পারে।',
    highlights_bn: [
      'হাই তোলা ও হেঁচকি শুরু হয়',
      'কান চূড়ান্ত অবস্থানে আছে',
      'স্নায়ুতন্ত্র মায়েলিন আবরণ গঠন করছে',
    ],
    changes_bn: [
      'বাম্প স্পষ্টভাবে দৃশ্যমান',
      'সম্ভব নিচের পিঠব্যথা',
      'বর্ধিত ক্ষুধা',
    ],
    normal_bn: ['পিঠব্যথা', 'হালকা ফোলা', 'জীবন্ত স্বপ্ন'],
    warning_bn: ['ভ্রূণের নড়াচড়া কমা', 'তীব্র পেটব্যথা'],
    nutrition_bn: [
      'আয়রন শোষণে ভিটামিন C সাহায্য করে — সাইট্রাসের সাথে যুক্ত করুন।',
    ],
    exercise_bn: ['ক্যাট-কাউ স্ট্রেচ পিঠের টান কমায়।'],
    mentalHealth_bn: [
      'গর্ভাবস্থা সহায়তা গোষ্ঠীতে যোগ দেওয়ার কথা বিবেচনা করুন।',
    ],
    preparation_bn: ['মাতৃত্বকালীন ছুটি পরিকল্পনা শুরু করুন।'],
  },
  19: {
    size_bn: 'একটি টমেটো (≈ ১৫.৩ সেমি)',
    caption_bn:
      'সংবেদনশীল বিকাশ দ্রুত। মস্তিষ্ক পাঁচটি ইন্দ্রিয়ের জন্য অঞ্চল নির্ধারণ করছে।',
    highlights_bn: [
      'মস্তিষ্ক প্রতিটি ইন্দ্রিয়ের জন্য অঞ্চল নির্ধারণ করে',
      'ভার্নিক্স (সাদা প্রতিরক্ষামূলক আবরণ) ত্বক ঢাকে',
      'নড়াচড়া আরও সমন্বিত',
    ],
    changes_bn: [
      'সম্ভব রাতে পায়ে খিঁচুনি',
      'ত্বক প্রসারিত হওয়ায় চুলকানি হতে পারে',
      'রাউন্ড লিগামেন্ট ব্যথা অব্যাহত',
    ],
    normal_bn: ['পায়ে খিঁচুনি', 'চুলকানো ত্বক', 'হালকা ফোলা'],
    warning_bn: ['২০ সপ্তাহের পর ২৪ ঘণ্টার বেশি ভ্রূণের নড়াচড়া না থাকা'],
    nutrition_bn: [
      'কলা ও পটাসিয়াম পায়ের খিঁচুনি প্রতিরোধে সাহায্য করতে পারে।',
    ],
    exercise_bn: ['রাতের খিঁচুনি কমাতে ঘুমানোর আগে বাছুর স্ট্রেচ করুন।'],
    mentalHealth_bn: [
      'ঘুমানোর আগে শান্তির জন্য অ্যারোমাথেরাপি (ল্যাভেন্ডার) চেষ্টা করুন।',
    ],
    preparation_bn: ['প্রয়োজনে মাতৃত্বকালীন পোশাক কেনা শুরু করুন।'],
  },
  20: {
    size_bn: 'একটি কলা (≈ ২৫.৬ সেমি)',
    caption_bn:
      'আপনি মাঝপথে! অ্যানাটমি স্ক্যান চাইলে শিশুর লিঙ্গ প্রকাশ করতে পারে।',
    highlights_bn: [
      'গিলার প্রতিচ্ছবি পরিপক্ক',
      'অন্ত্রে মেকোনিয়াম জমছে',
      'নড়াচড়া শক্তিশালী ও ঘন ঘন',
    ],
    changes_bn: [
      'জরায়ু নাভিতে পৌঁছায়',
      'সম্ভব লিনিয়া নিগ্রা ও গাঢ় নিপল',
      'বর্ধিত যোনি স্রাব (লিউকোরিয়া) স্বাভাবিক',
    ],
    normal_bn: ['বর্ধিত যোনি স্রাব', 'বুকজ্বালা', 'পিঠব্যথা'],
    warning_bn: [
      'রক্তপাত',
      'তীব্র মাথাব্যথা',
      'হঠাৎ ফোলা',
      'ভ্রূণের নড়াচড়া না থাকা',
    ],
    nutrition_bn: [
      'রক্তের পরিমাণ বৃদ্ধিতে সহায়তার জন্য আয়রনসমৃদ্ধ খাবার অব্যাহত রাখুন।',
    ],
    exercise_bn: ['দৈনিক হাঁটা চমৎকার থাকে; আপনার শরীরের কথা শুনুন।'],
    mentalHealth_bn: ['অর্ধেক পথ মাইলফলক — আপনার অগ্রগতি উদযাপন করুন।'],
    preparation_bn: ['২০ সপ্তাহের অ্যানাটমি স্ক্যান নির্ধারণ করুন।'],
  },
  21: {
    size_bn: 'একটি গাজর (≈ ২৬.৭ সেমি)',
    caption_bn:
      'ফিটাস বাইরের শব্দ স্পষ্টভাবে শুনতে পাচ্ছে। শিশুর সাথে কথা বলুন, গান গাইন বা পড়ুন।',
    highlights_bn: [
      'শ্রবণ তীক্ষ্ণ',
      'চোখের পাতা এখনো জুড়ে বন্ধ',
      'নড়াচড়া আরও জোরদার হয়',
    ],
    changes_bn: [
      'সম্ভব ভেরিকোস শিরা',
      'স্ট্রেচ মার্ক দেখা দিতে পারে',
      'হালকা ব্র্যাক্সটন হিকস সংকোচন শুরু হতে পারে',
    ],
    normal_bn: ['স্ট্রেচ মার্ক', 'হালকা ব্র্যাক্সটন হিকস', 'হালকা ফোলা'],
    warning_bn: ['নিয়মিত বেদনাদায়ক সংকোচন', 'রক্তপাত', 'তীব্র মাথাব্যথা'],
    nutrition_bn: ['ব্র্যাক্সটন হিকসের অস্বস্তি কমাতে হাইড্রেটেড থাকুন।'],
    exercise_bn: ['নিতম্বের চাপ কমাতে পাশ শুয়ে পা তোলা।'],
    mentalHealth_bn: ['শিশুকে পড়া বা সঙ্গীত বাজানো শুরু করুন।'],
    preparation_bn: ['প্রসব ব্যথা ব্যবস্থাপনার পছন্দ নিয়ে ভাবুন।'],
  },
  22: {
    size_bn: 'একটি নারকেল (≈ ২৭.৮ সেমি)',
    caption_bn:
      'ফিটাস একটি ক্ষুদে নবজাতকের মতো দেখাচ্ছে। ভ্রু ও চোখের পাতা দৃশ্যমান।',
    highlights_bn: [
      'চোখ গঠিত, যদিও আইরিসে রঙ নেই',
      'ঠোঁট ও ভ্রু স্পষ্ট',
      'অগ্ন্যাশয় হরমোন উৎপাদন করছে',
    ],
    changes_bn: [
      'সম্ভব মাড়ি থেকে রক্তপাত (গর্ভাবস্থার মাড়ির রোগ)',
      'বর্ধিত ক্ষুধা',
      'উল্লেখযোগ্য ওজন বাড়া',
    ],
    normal_bn: ['মাড়ি থেকে রক্তপাত', 'বুকজ্বালা', 'হালকা ফোলা'],
    warning_bn: ['দৃষ্টি পরিবর্তনসহ তীব্র মাথাব্যথা', 'হঠাৎ তীব্র ফোলা'],
    nutrition_bn: [
      'ভিটামিন K সমৃদ্ধ সবুজ শাক (কেল, পালং শাক) রক্ত জমাট বাঁধাতে সহায়তা করে।',
    ],
    exercise_bn: ['জয়েন্ট ও পিঠের স্বস্তির জন্য সাঁতার আদর্শ।'],
    mentalHealth_bn: ['বন্ধন কার্যকলাপ অব্যাহত রাখুন — আপনার কণ্ঠস্বর পরিচিত।'],
    preparation_bn: ['প্রসব সুবিধার একটি ট্যুর বিবেচনা করুন।'],
  },
  23: {
    size_bn: 'একটি জাম্বুরা (≈ ২৮.৯ সেমি)',
    caption_bn:
      'ফুসফুস শ্বাসের নড়াচড়া অনুশীলন করছে। শ্রবণ পরিচিত কণ্ঠস্বরে সাড়া দিচ্ছে।',
    highlights_bn: [
      'ফুসফুস শ্বাস অনুশীলন করছে',
      'ত্বক এখনো স্বচ্ছ',
      'পরিচিত কণ্ঠস্বর চেনে',
    ],
    changes_bn: [
      'গোড়ালি ও পায়ে সম্ভব ফোলা',
      'প্রসারিত হওয়ায় ত্বকে চুলকানি হতে পারে',
      'পিঠব্যথা সাধারণ',
    ],
    normal_bn: ['গোড়ালি ফোলা', 'পিঠব্যথা', 'চুলকানো ত্বক'],
    warning_bn: ['মুখ বা হাতে হঠাৎ তীব্র ফোলা', 'তীব্র মাথাব্যথা'],
    nutrition_bn: [
      'ফোলা কমাতে ও অ্যামনিওটিক তরল সহায়তায় ভালোভাবে হাইড্রেট করুন।',
    ],
    exercise_bn: ['ফোলা কমাতে গোড়ালি ঘোরানো।'],
    mentalHealth_bn: [
      'শরীরকে ইতিবাচকভাবে দেখুন — আপনার শরীর অবিশ্বাস্য কাজ করছে।',
    ],
    preparation_bn: ['শিশুরোগ বিশেষজ্ঞ নিয়ে গবেষণা শুরু করুন।'],
  },
  24: {
    size_bn: 'একটি ভুট্টার কান (≈ ৩০ সেমি)',
    caption_bn:
      'শিশুর শ্রবণ উন্নত হচ্ছে। উচ্চ শব্দ তাদের চমকাতে পারে; পরিচিত কণ্ঠস্বর শান্ত করে।',
    highlights_bn: [
      'শ্রবণ উন্নত হচ্ছে',
      'ফুসফুস সার্ফেক্ট্যান্ট তৈরি অব্যাহত রাখে',
      'শিশু শব্দ ও কণ্ঠস্বরে সাড়া দেয়',
      'মুখের বৈশিষ্ট্য সম্পূর্ণভাবে সংজ্ঞায়িত',
    ],
    changes_bn: [
      'আপনি ছন্দময় নড়াচড়া (হেঁচকি) অনুভব করতে পারেন',
      'জরায়ু প্রসারিত হওয়ায় সম্ভব পাঁজরে ব্যথা',
      'ত্বক শক্ত ও চুলকানো মনে হতে পারে',
    ],
    normal_bn: ['ভ্রূণের হেঁচকি', 'হালকা পাঁজরে ব্যথা', 'স্ট্রেচ মার্ক'],
    warning_bn: ['ভারী রক্তপাত', 'তীব্র পেটব্যথা', 'ভ্রূণের নড়াচড়া কমা'],
    nutrition_bn: [
      'আয়রনসমৃদ্ধ খাবার বাড়ান — এই সময়ে রক্তের পরিমাণ সর্বোচ্চে পৌঁছায়।',
    ],
    exercise_bn: ['২০–৩০ মিনিটের হাঁটা অত্যন্ত প্রস্তাবিত।'],
    mentalHealth_bn: [
      'বিশ্রামের জন্য হালকা প্রসবপূর্ব যোগব্যায়াম চেষ্টা করুন।',
    ],
    preparation_bn: [
      'স্বাস্থ্যসেবা প্রদানকারীর সাথে আপনার প্রসব পরিকল্পনা আলোচনা করুন।',
    ],
  },
  25: {
    size_bn: 'একটি ফুলকপি (≈ ৩৪.৬ সেমি)',
    caption_bn:
      'শিশু চর্বি অর্জন করছে এবং গোলগাল দেখাচ্ছে। হাত সম্পূর্ণভাবে বিকশিত।',
    highlights_bn: [
      'ত্বকের নিচের চর্বি ত্বক মসৃণ করে',
      'মেরুদণ্ড ৩৩টি মেরুদণ্ডী গঠন করছে',
      'নাকের ছিদ্র খুলতে শুরু করে',
    ],
    changes_bn: [
      'চাপ থেকে সম্ভব অর্শ্বরোগ',
      'বুকজ্বালা অব্যাহত থাকতে পারে',
      'ঘুম আরও কঠিন হতে পারে',
    ],
    normal_bn: ['অর্শ্বরোগ', 'অনিদ্রা', 'বুকজ্বালা'],
    warning_bn: ['তীব্র পেটব্যথা', 'রক্তপাত', 'ভ্রূণের নড়াচড়া কমা'],
    nutrition_bn: [
      'ফাইবারসমৃদ্ধ খাবার কোষ্ঠকাঠিন্য ও অর্শ্বরোগের অস্বস্তি কমায়।',
    ],
    exercise_bn: ['ঘুম বাড়াতে ঘুমানোর আগে পেলভিক টিল্ট ও স্ট্রেচ।'],
    mentalHealth_bn: ['পাশে শোওয়া সহজ করতে গর্ভাবস্থার বালিশ ব্যবহার করুন।'],
    preparation_bn: ['শিশুর ঘুমানোর ব্যবস্থা পরিকল্পনা শুরু করুন।'],
  },
  26: {
    size_bn: 'একটি বাটারনাট স্কোয়াশ (≈ ৩৫.৬ সেমি)',
    caption_bn:
      'শিশু প্রথমবারের মতো চোখ খুলছে। মস্তিষ্কের তরঙ্গ কার্যকলাপ শব্দে সাড়া দেখায়।',
    highlights_bn: [
      'প্রথমবারের মতো চোখ খোলে',
      'মস্তিষ্ক শব্দ তরঙ্গে সাড়া দেয়',
      'ফুসফুস সার্ফেক্ট্যান্ট তৈরি করছে',
    ],
    changes_bn: [
      'সম্ভব পায়ে খিঁচুনি, বিশেষত রাতে',
      'ব্র্যাক্সটন হিকস আরও ঘন ঘন হতে পারে',
      'জরায়ু নাভির উপরে',
    ],
    normal_bn: ['পায়ে খিঁচুনি', 'ব্র্যাক্সটন হিকস', 'হালকা ফোলা'],
    warning_bn: [
      'ক্রমাগত বেদনাদায়ক সংকোচন',
      'তীব্র মাথাব্যথা',
      'দৃষ্টি পরিবর্তন',
    ],
    nutrition_bn: ['শিশুর হাড়ের বিকাশের জন্য ক্যালসিয়াম (১০০০ মিগ্রা/দিন)।'],
    exercise_bn: ['দৈনিক হাঁটা ও হালকা স্ট্রেচিং।'],
    mentalHealth_bn: [
      'প্রসব নিয়ে কোনো উদ্বেগ স্বাস্থ্যসেবা প্রদানকারীর সাথে কথা বলুন।',
    ],
    preparation_bn: ['প্রসবের সময় কাকে উপস্থিত চান তা বিবেচনা করুন।'],
  },
  27: {
    size_bn: 'একটি লেটুসের মাথা (≈ ৩৬.৬ সেমি)',
    caption_bn:
      'আপনি দ্বিতীয় ত্রৈমাসিকের শেষে আছেন। শিশু আপনার কণ্ঠস্বর চিনতে পারে।',
    highlights_bn: [
      'মস্তিষ্ক অত্যন্ত সক্রিয়',
      'ফুসফুস অপরিপক্ক কিন্তু কার্যকর',
      'শিশু পরিচিত কণ্ঠস্বর চিনতে পারে',
    ],
    changes_bn: [
      'জরায়ু ফুসফুসে চাপ দেওয়ায় সম্ভব শ্বাসকষ্ট',
      'পিঠব্যথা তীব্র হয়',
      'গোড়ালিতে হালকা ফোলা সাধারণ',
    ],
    normal_bn: ['শ্বাসকষ্ট', 'পিঠব্যথা', 'হালকা ফোলা'],
    warning_bn: ['বিশ্রামে তীব্র শ্বাসকষ্ট', 'বুকব্যথা'],
    nutrition_bn: ['ছোট, ঘন ঘন খাবার শ্বাস নেওয়া সহজ করে।'],
    exercise_bn: ['শ্বাসকষ্ট কমাতে ব্যায়ামের সময় নিজেকে উপরে রাখুন।'],
    mentalHealth_bn: [
      'প্রসব প্রস্তুতির জন্য ধীরে শ্বাস-প্রশ্বাসের ব্যায়াম অনুশীলন করুন।',
    ],
    preparation_bn: ['গ্লুকোজ স্ক্রিনিং পরীক্ষা না হলে নির্ধারণ করুন।'],
  },
  28: {
    size_bn: 'একটি বেগুন (≈ ৩৭.৬ সেমি)',
    caption_bn:
      'তৃতীয় ত্রৈমাসিকে স্বাগতম! শিশু স্বপ্ন দেখতে পারে (REM ঘুম শনাক্তযোগ্য)।',
    highlights_bn: [
      'REM ঘুম হচ্ছে',
      'মস্তিষ্ক কোটি কোটি নিউরন বিকশিত করছে',
      'শিশু পেটে উজ্জ্বল আলোতে সাড়া দিতে পারে',
    ],
    changes_bn: [
      'সম্ভব রাউন্ড লিগামেন্ট ব্যথা',
      'ব্র্যাক্সটন হিকস আরও স্পষ্ট হয়',
      'বর্ধিত ক্লান্তি সাধারণ',
    ],
    normal_bn: ['ব্র্যাক্সটন হিকস', 'ক্লান্তি', 'ফোলা'],
    warning_bn: ['ভারী রক্তপাত', 'তীব্র মাথাব্যথা', 'ভ্রূণের নড়াচড়া কমা'],
    nutrition_bn: [
      'আয়রনসমৃদ্ধ খাবার অব্যাহত রাখুন; ভিটামিন C যোগ করার কথা বিবেচনা করুন।',
    ],
    exercise_bn: ['তীব্রতা কমান; গতিশীলতা ও বিশ্রামে মনোযোগ দিন।'],
    mentalHealth_bn: [
      'তৃতীয় ত্রৈমাসিকের ক্লান্তি সত্যিকার — যতটুকু পারেন বিশ্রাম নিন।',
    ],
    preparation_bn: [
      'শিশুর জিনিসপত্র সংগ্রহ শুরু করুন এবং শিশুর কাপড় ধুয়ে নিন।',
    ],
  },
  29: {
    size_bn: 'একটি বাটারনাট স্কোয়াশ (≈ ৩৮.৬ সেমি)',
    caption_bn:
      'শিশুর পেশি ও ফুসফুস পরিপক্ক হচ্ছে। মস্তিষ্কের বিকাশ মেলে ধরতে মাথার আকার বাড়ছে।',
    highlights_bn: [
      'পেশির টোন উন্নত হচ্ছে',
      'হাড় সম্পূর্ণভাবে গঠিত কিন্তু এখনো নরম',
      'মস্তিষ্ক মেলে ধরতে মাথার আকার বাড়ছে',
    ],
    changes_bn: [
      'জরায়ু পেট চেপে ধরায় বুকজ্বালা আরও খারাপ হতে পারে',
      'শিশু নিচে নামার সাথে সম্ভব পেলভিক অস্বস্তি',
      'ঘন ঘন প্রস্রাব আবার ফিরে আসে',
    ],
    normal_bn: ['বুকজ্বালা', 'পেলভিক চাপ', 'ঘন ঘন প্রস্রাব'],
    warning_bn: ['তীব্র পেটব্যথা', 'ভারী রক্তপাত', 'ভ্রূণের নড়াচড়া কমা'],
    nutrition_bn: ['ছোট খাবার খান এবং খাওয়ার পরপরই শুয়ে পড়বেন না।'],
    exercise_bn: ['পেলভিক ফ্লোর ব্যায়াম বাড়তি ওজন সহায়তা করে।'],
    mentalHealth_bn: [
      'প্রসব নিয়ে যেকোনো উদ্বেগ স্বাস্থ্যসেবা প্রদানকারীর সাথে আলোচনা করুন।',
    ],
    preparation_bn: ['এখনো না হলে হাসপাতালে প্রি-রেজিস্ট্রেশন করুন।'],
  },
  30: {
    size_bn: 'একটি বড় বাঁধাকপি (≈ ৩৯.৯ সেমি)',
    caption_bn:
      'শিশু কিছুটা নিজের শরীরের তাপমাত্রা নিয়ন্ত্রণ করতে পারে। মস্তিষ্ক দ্রুত পরিপক্ক হচ্ছে।',
    highlights_bn: [
      'মস্তিষ্কের ভাঁজ ও খাঁজ গভীর হয়',
      'অস্থিমজ্জা লোহিত রক্তকণিকা উৎপাদন করছে',
      'শরীরের তাপমাত্রা নিয়ন্ত্রণ উন্নত হচ্ছে',
    ],
    changes_bn: [
      'ঘুমের সম্ভব সমস্যা',
      'বুকজ্বালা অব্যাহত থাকতে পারে',
      'পা ও গোড়ালিতে ফোলা',
    ],
    normal_bn: ['অনিদ্রা', 'বুকজ্বালা', 'ফোলা'],
    warning_bn: ['হঠাৎ তীব্র ফোলা', 'তীব্র মাথাব্যথা', 'দৃশ্যত বিঘ্ন'],
    nutrition_bn: ['বুকজ্বালা কমাতে ঝাল ও অ্যাসিডিক খাবার এড়িয়ে চলুন।'],
    exercise_bn: ['চাপ কমাতে সাঁতার বা পানিতে হাঁটা।'],
    mentalHealth_bn: ['ঘুম উন্নত করতে ঘুমানোর আগে উষ্ণ স্নান চেষ্টা করুন।'],
    preparation_bn: ['হাসপাতালের ব্যাগের চেকলিস্ট তৈরি করুন।'],
  },
  31: {
    size_bn: 'একটি নারকেল (≈ ৪১.১ সেমি)',
    caption_bn:
      'শিশু দ্রুত ওজন বাড়াচ্ছে। পাঁচটি ইন্দ্রিয় সম্পূর্ণভাবে কার্যকর।',
    highlights_bn: [
      'দ্রুত ওজন বাড়া (≈ ২০০ গ্রাম/সপ্তাহ)',
      'পাঁচটি ইন্দ্রিয় কাজ করছে',
      'হাড় শক্ত হচ্ছে',
    ],
    changes_bn: [
      'সম্ভব শ্বাসকষ্ট',
      'ব্র্যাক্সটন হিকস আরও ঘন ঘন হয়',
      'স্তন থেকে কোলোস্ট্রাম বের হওয়া স্বাভাবিক',
    ],
    normal_bn: ['ব্র্যাক্সটন হিকস', 'কোলোস্ট্রাম বের হওয়া', 'শ্বাসকষ্ট'],
    warning_bn: ['নিয়মিত বেদনাদায়ক সংকোচন', 'যোনি রক্তপাত', 'তীব্র পেটব্যথা'],
    nutrition_bn: ['শিশুর বাড়তি হাড়ের জন্য ক্যালসিয়াম (১০০০ মিগ্রা/দিন)।'],
    exercise_bn: ['দীর্ঘ সেশনের চেয়ে ছোট, ঘন ঘন হাঁটা সহজ।'],
    mentalHealth_bn: [
      'জন্মে ছিঁড়ে যাওয়া কমাতে পেরিনিয়াল ম্যাসাজ অনুশীলন করুন (৩৪ সপ্তাহের পরে)।',
    ],
    preparation_bn: [
      'আপনার প্রসব পরিকল্পনা চূড়ান্ত করুন এবং প্রদানকারীর সাথে শেয়ার করুন।',
    ],
  },
  32: {
    size_bn: 'একটি জিকামা (≈ ৪২.৪ সেমি)',
    caption_bn:
      'শিশু শ্বাস নেওয়া, চোষা ও গেলা অনুশীলন করছে — জন্মের পর প্রয়োজনীয় সব দক্ষতা।',
    highlights_bn: [
      'শ্বাস, চোষা ও গেলা অনুশীলন করছে',
      'ত্বক কম স্বচ্ছ হচ্ছে',
      'পায়ের নখ ও আঙুলের নখ গঠিত',
    ],
    changes_bn: [
      'শিশু নিচে নামায় সম্ভব পেলভিক চাপ',
      'বর্ধিত যোনি স্রাব',
      'পিঠব্যথা সাধারণ',
    ],
    normal_bn: ['পেলভিক চাপ', 'বর্ধিত স্রাব', 'পিঠব্যথা'],
    warning_bn: ['ভারী রক্তপাত', 'ভ্রূণের নড়াচড়া কমা', 'তীব্র মাথাব্যথা'],
    nutrition_bn: ['ছোট খাবার; দিনে ৫–৬ বার খান।'],
    exercise_bn: [
      'পেলভিক টিল্ট ও দেওয়াল স্কোয়াট শরীরকে প্রসবের জন্য প্রস্তুত করে।',
    ],
    mentalHealth_bn: ['প্রসবের জন্য আরামদায়ক জিনিসের তালিকা লিখুন।'],
    preparation_bn: ['শিশুর কাপড় ধুয়ে নিন এবং চেঞ্জিং স্টেশন সেট আপ করুন।'],
  },
  33: {
    size_bn: 'একটি সেলারি স্টক (≈ ৪৩.৭ সেমি)',
    caption_bn:
      'শিশুর হাড় শক্ত হচ্ছে (খুলি বাদ দিয়ে, যা প্রসবের জন্য নরম থাকে)।',
    highlights_bn: [
      'হাড় শক্ত হচ্ছে',
      'খুলি প্রসবের জন্য নরম থাকে',
      'রোগ প্রতিরোধ ক্ষমতা বিকশিত হচ্ছে',
    ],
    changes_bn: [
      'সম্ভব কার্পাল টানেল লক্ষণ (আঙুলে ঝিনঝিন)',
      'ক্লান্তি বাড়ে',
      'ব্র্যাক্সটন হিকস আরও ঘন ঘন হয়',
    ],
    normal_bn: ['কার্পাল টানেল ঝিনঝিন', 'ক্লান্তি', 'ব্র্যাক্সটন হিকস'],
    warning_bn: ['তীব্র মাথাব্যথা', 'দৃষ্টি পরিবর্তন', 'ভারী রক্তপাত'],
    nutrition_bn: ['ভিটামিন D সমৃদ্ধ খাবার শিশুর হাড়ের বিকাশ সহায়তা করে।'],
    exercise_bn: ['হাতের স্ট্রেচ কার্পাল টানেলের অস্বস্তি কমায়।'],
    mentalHealth_bn: ['প্রায়ই বিশ্রাম নিন; ক্লান্তি আপনার শরীরের সংকেত।'],
    preparation_bn: ['হাসপাতালে যাওয়ার পরিবহন পরিকল্পনা নিশ্চিত করুন।'],
  },
  34: {
    size_bn: 'একটি আনারস (≈ ৪৫ সেমি)',
    caption_bn:
      'শিশুর ফুসফুস প্রায় পরিপক্ক। স্নায়ুতন্ত্র সম্পূর্ণভাবে বিকশিত।',
    highlights_bn: [
      'ফুসফুস প্রায় পরিপক্ক',
      'কেন্দ্রীয় স্নায়ুতন্ত্র সম্পূর্ণভাবে বিকশিত',
      'ভার্নিক্স (সাদা আবরণ) ঘন হচ্ছে',
    ],
    changes_bn: [
      'শিশু নিচে নামায় পেলভিক চাপ বাড়ে',
      'দীর্ঘ দূরত্ব হাঁটা কঠিন হতে পারে',
      'অনিদ্রা সাধারণ',
    ],
    normal_bn: ['পেলভিক চাপ', 'অনিদ্রা', 'ঘন ঘন প্রস্রাব'],
    warning_bn: ['ভ্রূণের নড়াচড়া কমা', 'ভারী রক্তপাত', 'তীব্র মাথাব্যথা'],
    nutrition_bn: ['আয়রনসমৃদ্ধ খাবার প্রসবের সময় রক্ত হারানো সহায়তা করে।'],
    exercise_bn: ['ছোট, ধীর হাঁটা; গতিশীলতায় মনোযোগ দিন।'],
    mentalHealth_bn: ['রক্ত প্রবাহ সর্বোচ্চ করতে বাম পাশে শুয়ে বিশ্রাম নিন।'],
    preparation_bn: ['কার সিট ইনস্টল করুন এবং প্রয়োজনে পরিদর্শন করান।'],
  },
  35: {
    size_bn: 'একটি মধুর মেলন (≈ ৪৬.২ সেমি)',
    caption_bn:
      'শিশু পূর্ণ হচ্ছে এবং প্রতি সপ্তাহে প্রায় ২০০ গ্রাম বাড়ছে। কিডনি সম্পূর্ণভাবে বিকশিত।',
    highlights_bn: [
      'দ্রুত ওজন বাড়া অব্যাহত',
      'কিডনি সম্পূর্ণভাবে বিকশিত',
      'যকৃৎ বর্জ্য প্রক্রিয়া করছে',
    ],
    changes_bn: [
      'সম্ভব বজ্রপাত (শিশু পেলভিসে নামা)',
      'শিশু নামলে শ্বাস নেওয়া সহজ হয়',
      'বর্ধিত পেলভিক চাপ',
    ],
    normal_bn: ['বর্ধিত পেলভিক চাপ', 'সহজ শ্বাস', 'ঘন ঘন প্রস্রাব'],
    warning_bn: ['ভ্রূণের নড়াচড়া না থাকা', 'যোনি রক্তপাত', 'তীব্র পেটব্যথা'],
    nutrition_bn: ['সুষম খাবার অব্যাহত রাখুন; প্রোটিন বিশেষভাবে গুরুত্বপূর্ণ।'],
    exercise_bn: ['পেলভিক ফ্লোর ব্যায়াম ও স্কোয়াট।'],
    mentalHealth_bn: ['একটি ইতিবাচক প্রসবের অভিজ্ঞতা কল্পনা করুন।'],
    preparation_bn: ['আপনার সহায়তা ব্যক্তি পরিকল্পনা জানে তা নিশ্চিত করুন।'],
  },
  36: {
    size_bn: 'একটি রোমেইন লেটুস (≈ ৪৭.৪ সেমি)',
    caption_bn:
      "শিশু চিকিৎসাগত সংজ্ঞায় 'আর্লি টার্ম' বলে বিবেচিত। মাথা পেলভিসে নিচে নামতে পারে।",
    highlights_bn: [
      "মাথা পেলভিসে নিচে নামতে পারে ('লাইটেনিং')",
      'চর্বি জমার সাথে ত্বক মসৃণ হচ্ছে',
      'মাড়ি শক্ত',
    ],
    changes_bn: [
      'সম্ভব পাতলা পায়খানা (প্রসব নিকটবর্তীর লক্ষণ)',
      'ব্র্যাক্সটন হিকস বাড়ছে',
      'ঘুমের সমস্যা অব্যাহত',
    ],
    normal_bn: ['পাতলা পায়খানা', 'ব্র্যাক্সটন হিকস', 'ঘুমের সমস্যা'],
    warning_bn: ['যোনি রক্তপাত', 'তীব্র মাথাব্যথা', 'ভ্রূণের নড়াচড়া কমা'],
    nutrition_bn: ['হাইড্রেটেড থাকুন; প্রসবের জন্য সহনশীলতা প্রয়োজন।'],
    exercise_bn: ['ধীরে হাঁটা ও স্ট্রেচিং।'],
    mentalHealth_bn: ['প্রত্যাশা নিয়ন্ত্রণে গভীর শ্বাস অনুশীলন করুন।'],
    preparation_bn: ['প্রসব শুরু হলে যোগাযোগ করার একটি তালিকা রাখুন।'],
  },
  37: {
    size_bn: 'একটি শীতকালীন তরমুজ (≈ ৪৮.৬ সেমি)',
    caption_bn:
      "শিশু এখন 'আর্লি টার্ম' বলে বিবেচিত। অঙ্গগুলি গর্ভের বাইরে জীবনের জন্য প্রস্তুত।",
    highlights_bn: [
      'সমস্ত অঙ্গ বাইরের জীবনের জন্য প্রস্তুত',
      'আঁকড়ানোর প্রতিচ্ছবি শক্তিশালী',
      'ফুসফুস পরিপক্ক',
    ],
    changes_bn: [
      'সম্ভব ব্লাডি শো (মিউকাস প্লাগ নিঃসরণ)',
      'শক্তিশালী ব্র্যাক্সটন হিকস',
      'পেলভিক অস্বস্তি তীব্র হয়',
    ],
    normal_bn: ['ব্লাডি শো', 'শক্তিশালী ব্র্যাক্সটন হিকস', 'পেলভিক অস্বস্তি'],
    warning_bn: ['ভারী রক্তপাত', 'ভ্রূণের নড়াচড়া কমা', 'তীব্র পেটব্যথা'],
    nutrition_bn: ['হালকা, সহজে হজমযোগ্য খাবার খান।'],
    exercise_bn: ['এখন ব্যায়ামের চেয়ে বিশ্রাম বেশি গুরুত্বপূর্ণ।'],
    mentalHealth_bn: ['আপনার শরীরকে বিশ্বাস করুন — এটি জানে কী করতে হবে।'],
    preparation_bn: ['হাসপাতালের ব্যাগ ও প্রসব পরিকল্পনার চূড়ান্ত পরীক্ষা।'],
  },
  38: {
    size_bn: 'একটি লিক (≈ ৪৯.৮ সেমি)',
    caption_bn:
      "শিশু যেকোনো দিন 'পূর্ণ মেয়াদ' হবে। তারা লানুগো (সূক্ষ্ম চুল) ঝরাচ্ছে।",
    highlights_bn: [
      'লানুগো ঝরানো',
      'আঁকড়ানোর প্রতিচ্ছবি শক্তিশালী',
      'ফুসফুস পরিপক্ক ও প্রস্তুত',
    ],
    changes_bn: [
      'আরও ঘন ঘন ব্র্যাক্সটন হিকস',
      'সম্ভব পিঠব্যথা',
      'ঘুমের সমস্যা',
    ],
    normal_bn: ['ঘন ঘন ব্র্যাক্সটন হিকস', 'পিঠব্যথা', 'অনিদ্রা'],
    warning_bn: ['ভ্রূণের নড়াচড়া কমা', 'ভারী রক্তপাত', 'তীব্র পেটব্যথা'],
    nutrition_bn: ['আয়রন ও প্রোটিনসমৃদ্ধ খাবার অব্যাহত রাখুন।'],
    exercise_bn: ['হালকা হাঁটা ও স্ট্রেচিং।'],
    mentalHealth_bn: ['শান্ত ও প্রস্তুত থাকুন।'],
    preparation_bn: [
      'ফোন চার্জ রাখুন এবং প্রদানকারীকে কল করার পরিকল্পনা করুন।',
    ],
  },
  39: {
    size_bn: 'একটি ছোট কুমড়া (≈ ৫০.৭ সেমি)',
    caption_bn:
      "শিশু 'পূর্ণ মেয়াদ' এবং জন্মের জন্য প্রস্তুত। মস্তিষ্ক দ্রুত বিকশিত হচ্ছে।",
    highlights_bn: [
      'মস্তিষ্ক দ্রুতগতিতে বিকশিত হচ্ছে',
      'প্লাসেন্টা এখনো অ্যান্টিবডি সরবরাহ করছে',
      'নড়াচড়া ভিন্ন মনে হতে পারে (কম গড়ানো, বেশি নড়াচড়া)',
    ],
    changes_bn: [
      'সম্ভব জল ভেঙে যাওয়া (ঝিল্লির ফাটল)',
      'শক্তিশালী, নিয়মিত সংকোচন শুরু হতে পারে',
      'নেস্টিং প্রবৃত্তি প্রায়ই চরমে',
    ],
    normal_bn: ['শক্তিশালী সংকোচন', 'নেস্টিং তাড়না', 'জল ভাঙা'],
    warning_bn: [
      'ভারী রক্তপাত',
      'ভ্রূণের নড়াচড়া না থাকা',
      'দৃষ্টি পরিবর্তনসহ তীব্র মাথাব্যথা',
    ],
    nutrition_bn: ['প্রসব শুরু হলে হালকা, শক্তিসমৃদ্ধ স্ন্যাক্স খান।'],
    exercise_bn: ['যতটুকু সম্ভব বিশ্রাম নিন; শক্তি সঞ্চয় করুন।'],
    mentalHealth_bn: ['আপনার শরীর ও সহায়তা দলকে বিশ্বাস করুন।'],
    preparation_bn: ['সংকোচন ৫ মিনিট অন্তর হলে সহায়তা দলকে জানান।'],
  },
  40: {
    size_bn: 'একটি তরমুজ (≈ ৫১.২ সেমি)',
    caption_bn:
      "শিশু আনুষ্ঠানিকভাবে 'পূর্ণ মেয়াদ'। তারা যেকোনো মুহূর্তে আপনার সাথে দেখা করতে প্রস্তুত।",
    highlights_bn: [
      'সম্পূর্ণভাবে বিকশিত ও জন্মের জন্য প্রস্তুত',
      'প্লাসেন্টা অ্যান্টিবডি পাস করছে',
      'সীমিত জায়গার কারণে নড়াচড়া ভিন্ন মনে হতে পারে',
    ],
    changes_bn: [
      'জরায়ুর মুখ নরম হচ্ছে এবং প্রসারিত হতে পারে',
      'শক্তিশালী ও ঘন ঘন ব্র্যাক্সটন হিকস',
      'সম্ভব ব্লাডি শো',
    ],
    normal_bn: ['ব্লাডি শো', 'শক্তিশালী ব্র্যাক্সটন হিকস', 'পাতলা পায়খানা'],
    warning_bn: [
      'ভারী রক্তপাত',
      'ভ্রূণের নড়াচড়া কমা',
      'তীব্র পেটব্যথা',
      'সবুজ বা বাদামী তরলসহ ঝিল্লির ফাটল',
    ],
    nutrition_bn: ['হালকা, সহজে হজমযোগ্য খাবার; পানি পান অব্যাহত রাখুন।'],
    exercise_bn: ['হালকা হাঁটা প্রসব শুরু করতে সাহায্য করতে পারে।'],
    mentalHealth_bn: [
      'মনোযোগী থাকুন — আপনি আপনার শিশুর সাথে দেখা করতে চলেছেন।',
    ],
    preparation_bn: ['সংকোচন শুরু হলে সেগুলির সময় নিন (ঘনত্ব ও সময়কাল)।'],
  },
}

export function weekContentBn(w) {
  const n = Number(w)
  const safe = Number.isFinite(n) ? Math.max(1, Math.min(40, Math.trunc(n))) : 20
  return PREGNANCY_CALENDAR_BN[safe]
}