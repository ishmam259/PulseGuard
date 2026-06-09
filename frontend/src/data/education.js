// ──────────────────────────────────────────────────────────────
// Pregnancy Education Content (static data)
//
// All article content lives in this file so the Education page
// works fully offline (no network calls). The FAQ category labels
// and the library category labels are looked up via $() in
// src/config/strings.js — see the "EDU_FAQ_CAT_*" and
// "EDU_LIB_CAT_*" keys. Individual article *titles* and *body
// text* have _bn counterparts for Bengali locale support.
// ──────────────────────────────────────────────────────────────

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
export const FAQ_CATEGORIES = [
  {
    id: 'first-trimester',
    key: 'EDU_FAQ_CAT_FIRST',
    items: [
      {
        q: 'Is nausea normal during pregnancy?',
        q_bn: 'গর্ভাবস্থায় বমি বমি ভাব কি স্বাভাবিক?',
        a: 'Yes. Nausea and vomiting ("morning sickness") are very common in the first trimester and usually peak between weeks 6 and 12. Try small frequent meals, ginger tea, and rest. If you cannot keep any food or fluids down for 24 hours, contact your health worker.',
        a_bn: 'হ্যাঁ। বমি বমি ভাব এবং বমি ("মর্নিং সিকনেস") প্রথম ত্রৈমাসিকে খুবই সাধারণ এবং সাধারণত ৬ থেকে ১২ সপ্তাহের মধ্যে সর্বোচ্চে পৌঁছায়। অল্প অল্প করে ঘন ঘন খাওয়া, আদা চা এবং বিশ্রাম নিন। যদি ২৪ ঘণ্টা কোনো খাবার বা পানীয় ধরে রাখতে না পারেন, তাহলে স্বাস্থ্যকর্মীর সাথে যোগাযোগ করুন।',
        trimester: 'first',
      },
      {
        q: 'When should I have my first antenatal visit?',
        q_bn: 'আমার প্রথম প্রসবপূর্ব পরিদর্শন কখন হওয়া উচিত?',
        a: 'As soon as you suspect or confirm pregnancy — ideally before week 12. Early visits help establish a baseline, screen for anaemia and infections, and start folic acid and iron supplementation.',
        a_bn: 'গর্ভাবস্থা সন্দেহ বা নিশ্চিত হওয়ার সাথে সাথে — আদর্শভাবে ১২ সপ্তাহের আগে। প্রাথমিক পরিদর্শন বেসলাইন নির্ধারণ, রক্তস্বল্পতা ও সংক্রমণ পরীক্ষা এবং ফলিক অ্যাসিড ও আয়রন সাপ্লিমেন্ট শুরু করতে সাহায্য করে।',
        trimester: 'first',
      },
      {
        q: 'Can I exercise during the first trimester?',
        q_bn: 'প্রথম ত্রৈমাসিকে কি ব্যায়াম করা যাবে?',
        a: 'Light to moderate activity such as walking, swimming, and prenatal yoga is generally safe. Avoid contact sports, heavy lifting, and any activity that risks falling. Stop and rest if you feel dizzy, short of breath, or have pain.',
        a_bn: 'হালকা থেকে মাঝারি কার্যকলাপ যেমন হাঁটা, সাঁতার এবং প্রসব-পূর্ব যোগব্যায়াম সাধারণত নিরাপদ। যোগাযোগ খেলাধুলা, ভারী জিনিস তোলা এবং পড়ে যাওয়ার ঝুঁকি আছে এমন কার্যকলাপ এড়িয়ে চলুন। মাথা ঘোরা, শ্বাসকষ্ট বা ব্যথা অনুভব করলে থামুন এবং বিশ্রাম নিন।',
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
        q_bn: 'শিশুর নড়াচড়া কখন অনুভব করব?',
        a: 'Most first-time mothers feel the first flutters ("quickening") between weeks 18 and 22. If you have been pregnant before, you may notice movement as early as week 16. By week 24 you should feel regular movement every day. Report any sudden decrease.',
        a_bn: 'অধিকাংশ প্রথমবার মায়েরা ১৮ থেকে ২২ সপ্তাহের মধ্যে প্রথম নড়াচড়া ("কুইকেনিং") অনুভব করেন। আগে গর্ভবতী হয়ে থাকলে ১৬ সপ্তাহ থেকেই নড়াচড়া অনুভব করতে পারেন। ২৪ সপ্তাহের মধ্যে প্রতিদিন নিয়মিত নড়াচড়া অনুভব করা উচিত। হঠাৎ কমে গেলে জানান।',
        trimester: 'second',
      },
      {
        q: 'What tests are done in the second trimester?',
        q_bn: 'দ্বিতীয় ত্রৈমাসিকে কী পরীক্ষা করা হয়?',
        a: 'Anomaly (ultrasound) scan between weeks 18 and 22, blood glucose screening for gestational diabetes around weeks 24 to 28, and repeat haemoglobin and blood-pressure checks at each ANC visit.',
        a_bn: '১৮ থেকে ২২ সপ্তাহের মধ্যে অ্যানোমালি (আল্ট্রাসাউন্ড) স্ক্যান, ২৪ থেকে ২৮ সপ্তাহের মধ্যে গর্ভকালীন ডায়াবেটিসের জন্য রক্তের গ্লুকোজ পরীক্ষা, এবং প্রতিটি প্রসবপূর্ব পরিদর্শনে হিমোগ্লোবিন ও রক্তচাপ পুনরায় পরীক্ষা।',
        trimester: 'second',
      },
      {
        q: 'Is it safe to travel in the second trimester?',
        q_bn: 'দ্বিতীয় ত্রৈমাসিকে ভ্রমণ কি নিরাপদ?',
        a: 'For most low-risk pregnancies, the second trimester is the safest time to travel. Stay hydrated, walk every 1–2 hours, carry your ANC records, and know the location of the nearest hospital at your destination.',
        a_bn: 'অধিকাংশ কম-ঝুঁকিপূর্ণ গর্ভাবস্থার জন্য দ্বিতীয় ত্রৈমাসিক ভ্রমণের সবচেয়ে নিরাপদ সময়। হাইড্রেটেড থাকুন, প্রতি ১–২ ঘণ্টায় হাঁটুন, প্রসবপূর্ব রেকর্ড নিন এবং গন্তব্যে নিকটতম হাসপাতালের অবস্থান জেনে রাখুন।',
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
        q_bn: 'এখন কতবার স্বাস্থ্যকর্মীর কাছে যাওয়া উচিত?',
        a: 'From week 28 to 36, visits are usually every 2 weeks. After week 36, every week until delivery. High-risk pregnancies may need more frequent monitoring.',
        a_bn: '২৮ থেকে ৩৬ সপ্তাহে সাধারণত প্রতি ২ সপ্তাহে পরিদর্শন হয়। ৩৬ সপ্তাহের পরে, প্রসব পর্যন্ত প্রতি সপ্তাহে। উচ্চ-ঝুঁকিপূর্ণ গর্ভাবস্থায় আরও ঘন ঘন পর্যবেক্ষণের প্রয়োজন হতে পারে।',
        trimester: 'third',
      },
      {
        q: 'How do I know labour is near?',
        q_bn: 'প্রসব কাছে আসছে কীভাবে বুঝব?',
        a: 'Signs include a "show" (mucus plug), regular painful contractions that get closer together, lower back pain, your water breaking, and a feeling of pressure in the pelvis. Call your health worker when contractions are 5 minutes apart for an hour (or sooner if advised).',
        a_bn: 'লক্ষণগুলির মধ্যে রয়েছে "শো" (মিউকাস প্লাগ), নিয়মিত বেদনাদায়ক সংকোচন যা ঘনিয়ে আসে, নিচের পিঠে ব্যথা, পানি ভাঙা এবং পেলভিসে চাপের অনুভূতি। এক ঘণ্টা ধরে ৫ মিনিট অন্তর সংকোচন হলে স্বাস্থ্যকর্মীকে ফোন করুন (বা পরামর্শ অনুযায়ী আগে)।',
        trimester: 'third',
      },
      {
        q: 'Is swelling of the feet normal?',
        q_bn: 'পায়ে ফোলা কি স্বাভাবিক?',
        a: 'Mild swelling in the ankles and feet is common, especially at the end of the day. Sudden severe swelling of the face, hands, and feet together with headache or blurred vision can be a warning sign of pre-eclampsia — seek care immediately.',
        a_bn: 'গোড়ালি ও পায়ে হালকা ফোলা সাধারণ, বিশেষত দিনের শেষে। মুখ, হাত ও পায়ে হঠাৎ তীব্র ফোলা, মাথাব্যথা বা ঝাপসা দৃষ্টির সাথে মিলে প্রি-এক্লাম্পসিয়ার সতর্কতা সংকেত হতে পারে — অবিলম্বে চিকিৎসা নিন।',
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
        q_bn: 'প্রসবের জন্য কখন হাসপাতালে যাব?',
        a: 'Go to the hospital when: (1) contractions are regular and 5 minutes apart for at least 1 hour, (2) your water has broken, (3) you have any bleeding, severe headache, blurred vision, or reduced baby movements. In doubt, go and be checked — it is always safer.',
        a_bn: 'হাসপাতালে যান যখন: (১) কমপক্ষে ১ ঘণ্টা ধরে নিয়মিত এবং ৫ মিনিট অন্তর সংকোচন, (২) পানি ভেঙেছে, (৩) কোনো রক্তপাত, তীব্র মাথাব্যথা, ঝাপসা দৃষ্টি বা শিশুর নড়াচড়া কমে গেছে। সন্দেহ হলে গিয়ে পরীক্ষা করান — এটি সবসময় নিরাপদ।',
        trimester: 'third',
      },
      {
        q: 'How long does labour usually last?',
        q_bn: 'প্রসব সাধারণত কতক্ষণ স্থায়ী হয়?',
        a: 'For first-time mothers, active labour often lasts 8 to 18 hours. It is usually shorter for subsequent pregnancies. Each woman is different — your health worker will monitor progress and intervene if needed.',
        a_bn: 'প্রথমবার মায়েদের জন্য সক্রিয় প্রসব প্রায়ই ৮ থেকে ১৮ ঘণ্টা স্থায়ী হয়। পরবর্তী গর্ভাবস্থায় সাধারণত কম সময় লাগে। প্রতিটি মহিলা আলাদা — আপনার স্বাস্থ্যকর্মী অগ্রগতি পর্যবেক্ষণ করবেন এবং প্রয়োজনে হস্তক্ষেপ করবেন।',
        trimester: 'third',
      },
      {
        q: 'What is a birth plan?',
        q_bn: 'বার্থ প্ল্যান কী?',
        a: 'A simple written list of your preferences for labour — who you want present, pain relief choices, position preferences, who cuts the cord, and feeding plans. It guides your team but can be changed if the medical situation changes.',
        a_bn: 'আপনার প্রসবের পছন্দগুলির একটি সহজ লিখিত তালিকা — কে উপস্থিত থাকবেন, ব্যথা নিরাময়ের পছন্দ, অবস্থানের পছন্দ, কে কর্ড কাটবেন এবং খাওয়ানোর পরিকল্পনা। এটি আপনার দলকে গাইড করে তবে চিকিৎসা পরিস্থিতি পরিবর্তন হলে পরিবর্তন করা যায়।',
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
        q_bn: 'প্রসবের পর রক্তপাত কতদিন থাকে?',
        a: 'Vaginal bleeding (lochia) is normal for 2 to 6 weeks, gradually changing from red to brown to yellow-white. Soaking more than one pad per hour, large clots, or foul smell needs urgent review.',
        a_bn: 'যোনি রক্তপাত (লোকিয়া) ২ থেকে ৬ সপ্তাহ স্বাভাবিক, ধীরে ধীরে লাল থেকে বাদামি থেকে হলুদ-সাদায় পরিণত হয়। ঘণ্টায় একটির বেশি প্যাড ভেজানো, বড় জমাট বা দুর্গন্ধ হলে জরুরি পর্যালোচনা প্রয়োজন।',
      },
      {
        q: 'When can I resume normal activity?',
        q_bn: 'কখন স্বাভাবিক কার্যকলাপে ফিরতে পারব?',
        a: 'Start with gentle walking within a few days. Avoid heavy lifting for 6 weeks. Most women can gradually return to normal routines by 6 to 8 weeks, or as advised at your postnatal check.',
        a_bn: 'কয়েক দিনের মধ্যে হালকা হাঁটা শুরু করুন। ৬ সপ্তাহ ভারী জিনিস তোলা এড়িয়ে চলুন। বেশিরভাগ মহিলারা ৬ থেকে ৮ সপ্তাহের মধ্যে ধীরে ধীরে স্বাভাবিক দিনচর্যায় ফিরতে পারেন, বা প্রসব-পরবর্তী পরীক্ষায় পরামর্শ অনুযায়ী।',
      },
      {
        q: 'How do I know if I have postpartum depression?',
        q_bn: 'প্রসব-পরবর্তী বিষণ্নতা হয়েছে কীভাবে বুঝব?',
        a: 'Persistent sadness, loss of interest in the baby, sleep or appetite changes, and feelings of guilt or hopelessness lasting more than 2 weeks are warning signs. Postpartum depression is common and treatable — please talk to your health worker.',
        a_bn: '২ সপ্তাহের বেশি স্থায়ী মানসিক কষ্ট, শিশুর প্রতি আগ্রহ হারানো, ঘুম বা খাওয়ার পরিবর্তন এবং অপরাধবোধ বা আশাহীনতার অনুভূতি সতর্কতার লক্ষণ। প্রসব-পরবর্তী বিষণ্নতা সাধারণ এবং চিকিৎসাযোগ্য — অনুগ্রহ করে স্বাস্থ্যকর্মীর সাথে কথা বলুন।',
      },
    ],
  },
  {
    id: 'medication',
    key: 'EDU_FAQ_CAT_MEDICATION',
    items: [
      {
        q: 'Which medicines are safe in pregnancy?',
        q_bn: 'গর্ভাবস্থায় কোন ওষুধ নিরাপদ?',
        a: 'Iron, folic acid, calcium, and prescribed prenatal vitamins are recommended. Paracetamol is generally safe for pain or fever in recommended doses. Always check with your health worker before taking any new medicine, including herbal or over-the-counter drugs.',
        a_bn: 'আয়রন, ফলিক অ্যাসিড, ক্যালসিয়াম এবং নির্ধারিত প্রসব-পূর্ব ভিটামিন প্রস্তাবিত। প্যারাসিটামল সাধারণত প্রস্তাবিত ডোজে ব্যথা বা জ্বরের জন্য নিরাপদ। যেকোনো নতুন ওষুধ গ্রহণের আগে সবসময় স্বাস্থ্যকর্মীর সাথে পরামর্শ করুন, ভেষজ বা ওভার-দ্য-কাউন্টার ওষুধ সহ।',
      },
      {
        q: 'Are herbal remedies safe?',
        q_bn: 'ভেষজ প্রতিকার কি নিরাপদ?',
        a: 'Not always. Many herbs have not been studied in pregnancy and some can cause contractions or harm the baby. Discuss every remedy — including teas and traditional preparations — with your health worker.',
        a_bn: 'সবসময় নয়। অনেক ভেষজ গর্ভাবস্থায় পরীক্ষা করা হয়নি এবং কিছু সংকোচন ঘটাতে বা শিশুর ক্ষতি করতে পারে। চা ও ঐতিহ্যগত প্রস্তুতি সহ প্রতিটি প্রতিকার আপনার স্বাস্থ্যকর্মীর সাথে আলোচনা করুন।',
      },
    ],
  },
  {
    id: 'nutrition',
    key: 'EDU_FAQ_CAT_NUTRITION',
    items: [
      {
        q: 'How much water should I drink?',
        q_bn: 'কতটা পানি পান করা উচিত?',
        a: 'Aim for 8 to 10 glasses (about 2 to 2.5 litres) of clean water per day. More if you are physically active, in hot weather, or experiencing vomiting. Carry a water bottle and sip regularly.',
        a_bn: 'প্রতিদিন ৮ থেকে ১০ গ্লাস (প্রায় ২ থেকে ২.৫ লিটার) পরিষ্কার পানি পান করুন। শারীরিকভাবে সক্রিয় থাকলে, গরম আবহাওয়ায় বা বমি হলে বেশি পান করুন। পানির বোতল বহন করুন এবং নিয়মিত চুমুক দিন।',
      },
      {
        q: 'Which foods should I avoid?',
        q_bn: 'কোন খাবার এড়ানো উচিত?',
        a: 'Avoid raw/undercooked meat, fish and eggs, unpasteurised milk and cheese, unwashed salad, excess caffeine, and alcohol. Limit large fish high in mercury (e.g. swordfish).',
        a_bn: 'কাঁচা/কম রান্না করা মাংস, মাছ ও ডিম, পাস্তুরিত নয় এমন দুধ ও পনির, না ধোয়া সালাদ, অতিরিক্ত ক্যাফেইন এবং অ্যালকোহল এড়িয়ে চলুন। পারদ বেশি থাকে এমন বড় মাছ সীমিত করুন (যেমন সোর্ডফিশ)।',
      },
      {
        q: 'Do I need extra iron?',
        q_bn: 'অতিরিক্ত আয়রনের প্রয়োজন আছে কি?',
        a: 'Yes. Iron requirements almost double in pregnancy. Eat iron-rich foods daily (green leafy vegetables, lentils, lean meat, jaggery) and take the iron-folic acid tablets prescribed by your health worker, with vitamin C to help absorption.',
        a_bn: 'হ্যাঁ। গর্ভাবস্থায় আয়রনের চাহিদা প্রায় দ্বিগুণ হয়। প্রতিদিন আয়রন সমৃদ্ধ খাবার খান (সবুজ শাকসবজি, মসুর ডাল, চর্বিহীন মাংস, গুড়) এবং স্বাস্থ্যকর্মীর দেওয়া আয়রন-ফলিক অ্যাসিড ট্যাবলেট শোষণ বাড়াতে ভিটামিন সি সহ নিন।',
      },
    ],
  },
  {
    id: 'exercise',
    key: 'EDU_FAQ_CAT_EXERCISE',
    items: [
      {
        q: 'Can I exercise while pregnant?',
        q_bn: 'গর্ভাবস্থায় ব্যায়াম করা যাবে কি?',
        a: 'Yes, for most women 30 minutes of moderate activity (walking, swimming, prenatal yoga) on most days is safe and recommended. Avoid contact sports, lying flat on your back after the first trimester, and exercising in very hot or humid conditions.',
        a_bn: 'হ্যাঁ, বেশিরভাগ মহিলার জন্য বেশিরভাগ দিনে ৩০ মিনিটের মাঝারি কার্যকলাপ (হাঁটা, সাঁতার, প্রসব-পূর্ব যোগব্যায়াম) নিরাপদ এবং প্রস্তাবিত। যোগাযোগ খেলাধুলা, প্রথম ত্রৈমাসিকের পরে চিত হয়ে শোয়া এবং খুব গরম বা আর্দ্র পরিবেশে ব্যায়াম এড়িয়ে চলুন।',
      },
      {
        q: 'When should I stop exercising?',
        q_bn: 'ব্যায়াম কখন বন্ধ করব?',
        a: 'Stop and seek care if you have vaginal bleeding, dizziness, chest pain, contractions, fluid leaking, or reduced baby movement during or after exercise.',
        a_bn: 'যদি ব্যায়ামের সময় বা পরে যোনি রক্তপাত, মাথা ঘোরা, বুকে ব্যথা, সংকোচন, তরল বের হওয়া বা শিশুর নড়াচড়া কমে যায় তাহলে থামুন এবং চিকিৎসা নিন।',
      },
    ],
  },
  {
    id: 'general',
    key: 'EDU_FAQ_CAT_GENERAL',
    items: [
      {
        q: 'How often are antenatal visits?',
        q_bn: 'প্রসবপূর্ব পরিদর্শন কতবার হয়?',
        a: 'The WHO recommends at least 8 contacts: weeks 12, 20, 26, 30, 34, 36, 38, 40. Each visit checks your weight, blood pressure, urine, haemoglobin, baby growth, and answers your questions.',
        a_bn: 'WHO কমপক্ষে ৮টি যোগাযোগের সুপারিশ করে: ১২, ২০, ২৬, ৩০, ৩৪, ৩৬, ৩৮, ৪০ সপ্তাহে। প্রতিটি পরিদর্শনে ওজন, রক্তচাপ, প্রস্রাব, হিমোগ্লোবিন, শিশুর বৃদ্ধি পরীক্ষা করা হয় এবং প্রশ্নের উত্তর দেওয়া হয়।',
      },
      {
        q: 'Can I get the flu and COVID vaccines while pregnant?',
        q_bn: 'গর্ভাবস্থায় ফ্লু ও কোভিড ভ্যাকসিন নেওয়া যাবে কি?',
        a: 'Yes. Inactivated vaccines (flu shot, COVID-19 vaccine, tetanus/diphtheria) are recommended in pregnancy and protect both you and the baby. Live vaccines (MMR, varicella) are not given in pregnancy.',
        a_bn: 'হ্যাঁ। ইনঅ্যাক্টিভেটেড ভ্যাকসিন (ফ্লু শট, কোভিড-১৯ ভ্যাকসিন, টিটেনাস/ডিপথেরিয়া) গর্ভাবস্থায় প্রস্তাবিত এবং আপনাকে ও শিশুকে উভয়কেই রক্ষা করে। লাইভ ভ্যাকসিন (MMR, ভ্যারিসেলা) গর্ভাবস্থায় দেওয়া হয় না।',
      },
    ],
  },
]

// ─── Section 2: Pregnancy Knowledge Library ─────────────────
export const LIBRARY_CATEGORIES = [
  {
    id: 'A',
    key: 'EDU_LIB_CAT_A',
    articles: [
      {
        id: 'preeclampsia',
        title: 'Preeclampsia',
        title_bn: 'প্রি-এক্লাম্পসিয়া',
        trimester: 'third',
        definition: 'A serious condition developing usually after week 20, marked by high blood pressure and protein in the urine. It can affect the mother\'s organs and the baby\'s growth.',
        definition_bn: '২০ সপ্তাহের পরে সাধারণত বিকশিত একটি গুরুতর অবস্থা, উচ্চ রক্তচাপ এবং প্রস্রাবে প্রোটিন দ্বারা চিহ্নিত। এটি মায়ের অঙ্গ এবং শিশুর বৃদ্ধিকে প্রভাবিত করতে পারে।',
        symptoms: 'Severe headache, blurred vision or seeing spots, upper abdominal pain, sudden swelling of face/hands/feet, high blood pressure (≥140/90), reduced baby movement.',
        symptoms_bn: 'তীব্র মাথাব্যথা, ঝাপসা দৃষ্টি বা আলোক দেখা, উপরের পেটে ব্যথা, মুখ/হাত/পায়ে হঠাৎ ফোলা, উচ্চ রক্তচাপ (≥১৪০/৯০), শিশুর নড়াচড়া কমে যাওয়া।',
        risk_factors: 'First pregnancy, age under 20 or over 35, previous preeclampsia, obesity, multiple pregnancy, family history, pre-existing hypertension or diabetes.',
        risk_factors_bn: 'প্রথম গর্ভাবস্থা, ২০ বছরের কম বা ৩৫ বছরের বেশি বয়স, পূর্ববর্তী প্রি-এক্লাম্পসিয়া, স্থূলতা, একাধিক গর্ভাবস্থা, পারিবারিক ইতিহাস, পূর্ব-বিদ্যমান উচ্চ রক্তচাপ বা ডায়াবেটিস।',
        prevention: 'Attend every ANC visit for BP and urine checks, take prescribed calcium and low-dose aspirin when advised, rest as needed, and report warning signs immediately.',
        prevention_bn: 'রক্তচাপ ও প্রস্রাব পরীক্ষার জন্য প্রতিটি প্রসবপূর্ব পরিদর্শনে উপস্থিত থাকুন, পরামর্শ দিলে নির্ধারিত ক্যালসিয়াম ও কম-ডোজের অ্যাসপিরিন গ্রহণ করুন, প্রয়োজনমতো বিশ্রাম নিন এবং সতর্কতার লক্ষণ অবিলম্বে জানান।',
        seek_help: 'Go to the hospital immediately if you have severe headache, vision changes, upper abdominal pain, sudden severe swelling, or BP ≥160/110.',
        seek_help_bn: 'তীব্র মাথাব্যথা, দৃষ্টি পরিবর্তন, উপরের পেটে ব্যথা, হঠাৎ তীব্র ফোলা বা রক্তচাপ ≥১৬০/১১০ হলে অবিলম্বে হাসপাতালে যান।',
      },
      {
        id: 'gestational-diabetes',
        title: 'Gestational Diabetes',
        title_bn: 'গর্ভকালীন ডায়াবেটিস',
        trimester: 'second',
        definition: 'High blood sugar that develops during pregnancy, usually in the second or third trimester, and usually resolves after delivery.',
        definition_bn: 'গর্ভাবস্থায় বিকশিত উচ্চ রক্তে শর্করা, সাধারণত দ্বিতীয় বা তৃতীয় ত্রৈমাসিকে, এবং সাধারণত প্রসবের পরে সমাধান হয়।',
        symptoms: 'Often none. Some women feel very thirsty, pass more urine than usual, or feel unusually tired.',
        symptoms_bn: 'প্রায়ই কোনো লক্ষণ নেই। কিছু মহিলা খুব তৃষ্ণার্ত অনুভব করেন, স্বাভাবিকের চেয়ে বেশি প্রস্রাব করেন, বা অস্বাভাবিকভাবে ক্লান্ত অনুভব করেন।',
        risk_factors: 'Overweight, age over 25, family history of diabetes, previous gestational diabetes, previous baby over 4 kg, polycystic ovary syndrome.',
        risk_factors_bn: 'অতিরিক্ত ওজন, ২৫ বছরের বেশি বয়স, ডায়াবেটিসের পারিবারিক ইতিহাস, পূর্ববর্তী গর্ভকালীন ডায়াবেটিস, আগে ৪ কেজির বেশি শিশু, পলিসিস্টিক ওভারি সিন্ড্রোম।',
        prevention: 'Healthy balanced diet, regular physical activity, healthy weight gain, and routine glucose screening between weeks 24 and 28.',
        prevention_bn: 'সুষম স্বাস্থ্যকর খাদ্য, নিয়মিত শারীরিক কার্যকলাপ, স্বাস্থ্যকর ওজন বৃদ্ধি এবং ২৪ থেকে ২৮ সপ্তাহের মধ্যে রুটিন গ্লুকোজ স্ক্রিনিং।',
        seek_help: 'If you have been diagnosed and feel very thirsty, very tired, have blurred vision, or recurrent infections — contact your health worker.',
        seek_help_bn: 'যদি রোগ নির্ণয় হয়ে থাকে এবং খুব তৃষ্ণার্ত অনুভব করেন, খুব ক্লান্ত থাকেন, ঝাপসা দৃষ্টি বা বারবার সংক্রমণ হয় — স্বাস্থ্যকর্মীর সাথে যোগাযোগ করুন।',
      },
      {
        id: 'preterm-labor',
        title: 'Preterm Labor',
        title_bn: 'অকাল প্রসব',
        trimester: 'third',
        definition: 'Labour that starts before 37 completed weeks of pregnancy. Babies born early can have serious health problems, so prevention and early detection are vital.',
        definition_bn: 'গর্ভাবস্থার ৩৭ সম্পূর্ণ সপ্তাহের আগে শুরু হওয়া প্রসব। অকালে জন্মানো শিশুদের গুরুতর স্বাস্থ্য সমস্যা হতে পারে, তাই প্রতিরোধ ও প্রাথমিক সনাক্তকরণ অত্যন্ত গুরুত্বপূর্ণ।',
        symptoms: 'Regular painful contractions every 10 minutes or less, lower back pain, pelvic pressure, a "show" (mucus or blood), water leaking, period-like cramps.',
        symptoms_bn: 'প্রতি ১০ মিনিট বা তার কম সময়ে নিয়মিত বেদনাদায়ক সংকোচন, নিচের পিঠে ব্যথা, পেলভিক চাপ, "শো" (মিউকাস বা রক্ত), পানি বের হওয়া, পিরিয়ডের মতো ব্যথা।',
        risk_factors: 'Previous preterm birth, multiple pregnancy, infections (urinary, vaginal, gum), smoking, high blood pressure, poor nutrition, short time between pregnancies.',
        risk_factors_bn: 'পূর্ববর্তী অকাল প্রসব, একাধিক গর্ভাবস্থা, সংক্রমণ (মূত্রনালী, যোনি, দাঁতের মাড়ি), ধূমপান, উচ্চ রক্তচাপ, অপুষ্টি, গর্ভধারণের মধ্যে কম সময়।',
        prevention: 'Attend ANC early, treat infections promptly, avoid smoking, rest adequately, and follow your health worker\'s advice on nutrition and supplements.',
        prevention_bn: 'প্রাথমিক প্রসবপূর্ব পরিচর্যায় উপস্থিত থাকুন, সংক্রমণ দ্রুত চিকিৎসা করুন, ধূমপান এড়িয়ে চলুন, পর্যাপ্ত বিশ্রাম নিন এবং পুষ্টি ও সাপ্লিমেন্ট সম্পর্কে স্বাস্থ্যকর্মীর পরামর্শ অনুসরণ করুন।',
        seek_help: 'Go to the hospital immediately if you have contractions every 10 minutes for an hour, water breaking, bleeding, or severe cramps before 37 weeks.',
        seek_help_bn: 'যদি ৩৭ সপ্তাহের আগে এক ঘণ্টায় প্রতি ১০ মিনিটে সংকোচন, পানি ভাঙা, রক্তপাত বা তীব্র ব্যথা হয় তাহলে অবিলম্বে হাসপাতালে যান।',
      },
      {
        id: 'anemia',
        title: 'Anemia',
        title_bn: 'রক্তস্বল্পতা (অ্যানিমিয়া)',
        trimester: 'second',
        definition: 'Low haemoglobin in the blood, most often from iron deficiency. Common in pregnancy because iron needs almost double.',
        definition_bn: 'রক্তে কম হিমোগ্লোবিন, সাধারণত আয়রনের অভাব থেকে। গর্ভাবস্থায় সাধারণ কারণ আয়রনের চাহিদা প্রায় দ্বিগুণ হয়।',
        symptoms: 'Tiredness, weakness, pale inner eyelids and palms, dizziness, shortness of breath, fast heartbeat, cravings for non-food items (ice, clay).',
        symptoms_bn: 'ক্লান্তি, দুর্বলতা, চোখের ভেতরের পাতা ও হাতের তালু ফ্যাকাশে, মাথা ঘোরা, শ্বাসকষ্ট, দ্রুত হৃদস্পন্দন, খাবার ছাড়া অন্য জিনিস খাওয়ার ইচ্ছা (বরফ, মাটি)।',
        risk_factors: 'Poor dietary iron, vegetarian diet without planning, closely spaced pregnancies, heavy periods before pregnancy, parasitic infection, teenage pregnancy.',
        risk_factors_bn: 'খাদ্যে পর্যাপ্ত আয়রন না থাকা, পরিকল্পনা ছাড়া নিরামিষ খাবার, ঘন ঘন গর্ভধারণ, গর্ভাবস্থার আগে অতিরিক্ত মাসিক, পরজীবী সংক্রমণ, কিশোর বয়সে গর্ভাবস্থা।',
        prevention: 'Eat iron-rich foods daily, take prescribed iron-folic acid tablets with vitamin C, cook in iron pots when possible, deworm when advised, and space pregnancies at least 2 years apart.',
        prevention_bn: 'প্রতিদিন আয়রন সমৃদ্ধ খাবার খান, নির্ধারিত আয়রন-ফলিক অ্যাসিড ট্যাবলেট ভিটামিন সি সহ নিন, সম্ভব হলে লোহার পাত্রে রান্না করুন, পরামর্শ দিলে কৃমিনাশ করুন এবং গর্ভধারণের মধ্যে কমপক্ষে ২ বছর বিরতি রাখুন।',
        seek_help: 'Tell your health worker if you feel very weak, dizzy, or short of breath, or cannot take your iron tablets due to side effects — alternatives exist.',
        seek_help_bn: 'স্বাস্থ্যকর্মীকে জানান যদি খুব দুর্বল, মাথা ঘোরা বা শ্বাসকষ্ট অনুভব করেন, বা পার্শ্বপ্রতিক্রিয়ার কারণে আয়রন ট্যাবলেট নিতে না পারেন — বিকল্প আছে।',
      },
      {
        id: 'dehydration',
        title: 'Dehydration',
        title_bn: 'পানিশূন্যতা (ডিহাইড্রেশন)',
        trimester: 'first',
        definition: 'Loss of body fluid greater than what you take in, common with vomiting in early pregnancy or in hot climates.',
        definition_bn: 'যা গ্রহণ করেন তার চেয়ে বেশি শরীরের তরল হারানো, গর্ভাবস্থার প্রথম দিকে বমি বা গরম আবহাওয়ায় সাধারণ।',
        symptoms: 'Dark yellow urine, dry mouth and lips, dizziness on standing, headache, reduced urine output, fast heartbeat, fainting.',
        symptoms_bn: 'গাঢ় হলুদ প্রস্রাব, শুকনো মুখ ও ঠোঁট, দাঁড়ালে মাথা ঘোরা, মাথাব্যথা, কম প্রস্রাব হওয়া, দ্রুত হৃদস্পন্দন, অজ্ঞান হওয়া।',
        risk_factors: 'Severe morning sickness, diarrhoea, hot/humid environment, intense physical activity, not drinking enough water.',
        risk_factors_bn: 'তীব্র মর্নিং সিকনেস, ডায়রিয়া, গরম/আর্দ্র পরিবেশ, তীব্র শারীরিক কার্যকলাপ, পর্যাপ্ত পানি না পান করা।',
        prevention: 'Drink 8–10 glasses of clean water daily, sip small amounts often when vomiting, include watery foods (soups, fruits), and rest in the shade.',
        prevention_bn: 'প্রতিদিন ৮–১০ গ্লাস পরিষ্কার পানি পান করুন, বমির সময় অল্প অল্প করে চুমুক দিন, পানিযুক্ত খাবার (স্যুপ, ফল) খান এবং ছায়ায় বিশ্রাম নিন।',
        seek_help: 'Seek care if you cannot keep fluids down for 24 hours, feel dizzy when standing, have a fast heartbeat, or your urine is very dark or absent for 8+ hours.',
        seek_help_bn: '২৪ ঘণ্টা তরল ধরে রাখতে না পারলে, দাঁড়ালে মাথা ঘোরালে, দ্রুত হৃদস্পন্দন হলে বা ৮+ ঘণ্টা প্রস্রাব খুব কম বা না হলে চিকিৎসা নিন।',
      },
      {
        id: 'high-blood-pressure',
        title: 'High Blood Pressure (Hypertension)',
        title_bn: 'উচ্চ রক্তচাপ (হাইপারটেনশন)',
        trimester: 'third',
        definition: 'Blood pressure readings of 140/90 mmHg or higher on two occasions, in a woman who may or may not have had high BP before pregnancy.',
        definition_bn: 'দুটি পৃথক পরিমাপে ১৪০/৯০ মিমিHg বা তার বেশি রক্তচাপ, এমন মহিলার ক্ষেত্রে যার গর্ভাবস্থার আগে উচ্চ রক্তচাপ থাকতে পারে বা নাও থাকতে পারে।',
        symptoms: 'Often no symptoms. Severe cases cause headache, vision changes, chest pain, or upper abdominal pain. Pre-eclampsia is a more dangerous form.',
        symptoms_bn: 'প্রায়ই কোনো লক্ষণ নেই। গুরুতর ক্ষেত্রে মাথাব্যথা, দৃষ্টি পরিবর্তন, বুকে ব্যথা বা উপরের পেটে ব্যথা হয়। প্রি-এক্লাম্পসিয়া আরও বিপজ্জনক রূপ।',
        risk_factors: 'Pre-existing hypertension, obesity, age over 35, first pregnancy, family history, kidney disease, diabetes.',
        risk_factors_bn: 'পূর্ব-বিদ্যমান উচ্চ রক্তচাপ, স্থূলতা, ৩৫ বছরের বেশি বয়স, প্রথম গর্ভাবস্থা, পারিবারিক ইতিহাস, কিডনি রোগ, ডায়াবেটিস।',
        prevention: 'Regular ANC visits for BP checks, low-salt balanced diet, healthy weight, regular activity, take prescribed medicines, and report warning signs.',
        prevention_bn: 'রক্তচাপ পরীক্ষার জন্য নিয়মিত প্রসবপূর্ব পরিদর্শন, কম লবণযুক্ত সুষম খাদ্য, স্বাস্থ্যকর ওজন, নিয়মিত কার্যকলাপ, নির্ধারিত ওষুধ নিন এবং সতর্কতার লক্ষণ জানান।',
        seek_help: 'Seek urgent care for severe headache, vision changes, upper abdominal pain, sudden swelling, or BP readings above 160/110.',
        seek_help_bn: 'তীব্র মাথাব্যথা, দৃষ্টি পরিবর্তন, উপরের পেটে ব্যথা, হঠাৎ ফোলা বা রক্তচাপ ১৬০/১১০-এর বেশি হলে জরুরি চিকিৎসা নিন।',
      },
      {
        id: 'infection',
        title: 'Infection in Pregnancy',
        title_bn: 'গর্ভাবস্থায় সংক্রমণ',
        trimester: 'first',
        definition: 'Bacterial, viral, or parasitic infections that can affect the pregnancy. Some are mild; others can harm the mother or baby if untreated.',
        definition_bn: 'ব্যাকটেরিয়া, ভাইরাল বা পরজীবী সংক্রমণ যা গর্ভাবস্থাকে প্রভাবিত করতে পারে। কিছু হালকা; অন্যগুলো চিকিৎসা না হলে মা বা শিশুর ক্ষতি করতে পারে।',
        symptoms: 'Fever, burning urination, unusual vaginal discharge with smell or itching, persistent cough, skin rashes, severe diarrhoea, flu-like symptoms.',
        symptoms_bn: 'জ্বর, প্রস্রাবে জ্বালাপোড়া, গন্ধ বা চুলকানিসহ অস্বাভাবিক যোনি স্রাব, ক্রমাগত কাশি, ত্বকে ফুসকুড়ি, তীব্র ডায়রিয়া, ফ্লুর মতো লক্ষণ।',
        risk_factors: 'Untreated urinary or vaginal infections, poor food/water hygiene, contact with sick people, mosquito bites (malaria, dengue), unsafe sexual practices.',
        risk_factors_bn: 'অচিকিৎসিত মূত্রনালী বা যোনি সংক্রমণ, খাবার/পানির স্বাস্থ্যবিধি দুর্বল, অসুস্থ মানুষের সংস্পর্শ, মশার কামড় (ম্যালেরিয়া, ডেঙ্গু), অনিরাপদ যৌন অভ্যাস।',
        prevention: 'Hand washing, safe food and water, treated bed nets in malaria areas, completing prescribed antibiotics, and routine infection screening at ANC.',
        prevention_bn: 'হাত ধোয়া, নিরাপদ খাবার ও পানি, ম্যালেরিয়া এলাকায় মশারি ব্যবহার, নির্ধারিত অ্যান্টিবায়োটিক সম্পূর্ণ করা এবং প্রসবপূর্ব পরিচর্যায় রুটিন সংক্রমণ স্ক্রিনিং।',
        seek_help: 'Any fever above 38°C in pregnancy, painful urination, foul discharge, or persistent illness — see your health worker the same day.',
        seek_help_bn: 'গর্ভাবস্থায় ৩৮°C-এর বেশি জ্বর, বেদনাদায়ক প্রস্রাব, দুর্গন্ধযুক্ত স্রাব বা ক্রমাগত অসুস্থতা হলে সেই দিনই স্বাস্থ্যকর্মীকে দেখান।',
      },
    ],
  },

  {
    id: 'B',
    key: 'EDU_LIB_CAT_B',
    articles: [
      {
        id: 'sleep',
        title: 'Sleep',
        title_bn: 'ঘুম',
        body: 'Aim for 7 to 9 hours every night. Sleep on your left side from the second trimester onwards to improve blood flow to the baby. Use pillows between your knees and under your belly. Avoid screens, heavy meals, and caffeine close to bedtime. If snoring starts or you feel very sleepy in the day, mention it at your next ANC visit.',
        body_bn: 'প্রতি রাতে ৭ থেকে ৯ ঘণ্টা ঘুমানোর চেষ্টা করুন। দ্বিতীয় ত্রৈমাসিক থেকে শিশুর রক্ত প্রবাহ উন্নত করতে বাম দিকে শুন। হাঁটু ও পেটের নিচে বালিশ ব্যবহার করুন। ঘুমানোর আগে স্ক্রিন, ভারী খাবার ও ক্যাফেইন এড়িয়ে চলুন। নাক ডাকা শুরু হলে বা দিনে অত্যন্ত ঘুমঘুম লাগলে পরবর্তী প্রসবপূর্ব পরিদর্শনে উল্লেখ করুন।',
      },
      {
        id: 'stress',
        title: 'Stress Management',
        title_bn: 'মানসিক চাপ ব্যবস্থাপনা',
        body: 'Some stress is normal, but ongoing high stress can affect sleep, blood pressure, and baby growth. Try slow breathing, gentle walks, talking to a trusted person, and limiting difficult news. Your health worker can connect you to support if you feel overwhelmed.',
        body_bn: 'কিছু মানসিক চাপ স্বাভাবিক, তবে ক্রমাগত উচ্চ মানসিক চাপ ঘুম, রক্তচাপ ও শিশুর বৃদ্ধিকে প্রভাবিত করতে পারে। ধীর শ্বাস-প্রশ্বাস, হালকা হাঁটা, বিশ্বস্ত কারো সাথে কথা বলা এবং কঠিন খবর সীমিত করার চেষ্টা করুন। আপনার স্বাস্থ্যকর্মী অভিভূত বোধ করলে সহায়তার সাথে সংযুক্ত করতে পারেন।',
      },
      {
        id: 'weight-gain',
        title: 'Weight Gain',
        title_bn: 'ওজন বৃদ্ধি',
        body: 'Healthy total gain in pregnancy is usually 11 to 16 kg for women with normal pre-pregnancy weight. Gain is small in the first trimester (1 to 2 kg), then about 0.5 kg per week. Your health worker will track gain at every visit and advise if it is too little or too much.',
        body_bn: 'গর্ভাবস্থায় স্বাস্থ্যকর মোট বৃদ্ধি সাধারণত স্বাভাবিক গর্ভপূর্ব ওজনের মহিলাদের জন্য ১১ থেকে ১৬ কেজি। প্রথম ত্রৈমাসিকে বৃদ্ধি কম (১ থেকে ২ কেজি), তারপর প্রায় প্রতি সপ্তাহে ০.৫ কেজি। আপনার স্বাস্থ্যকর্মী প্রতিটি পরিদর্শনে বৃদ্ধি ট্র্যাক করবেন এবং কম বা বেশি হলে পরামর্শ দেবেন।',
      },
      {
        id: 'hydration',
        title: 'Hydration',
        title_bn: 'হাইড্রেশন (পানি পান)',
        body: 'Drink 8 to 10 glasses (about 2 to 2.5 litres) of clean water every day. More in hot weather, when physically active, or when vomiting. Carry a water bottle, and choose water over sugary drinks. Signs of good hydration: pale yellow urine and regular urination.',
        body_bn: 'প্রতিদিন ৮ থেকে ১০ গ্লাস (প্রায় ২ থেকে ২.৫ লিটার) পরিষ্কার পানি পান করুন। গরম আবহাওয়ায়, শারীরিকভাবে সক্রিয় থাকলে বা বমির সময় বেশি পান করুন। পানির বোতল বহন করুন এবং মিষ্টি পানীয়ের পরিবর্তে পানি বেছে নিন। ভালো হাইড্রেশনের লক্ষণ: হালকা হলুদ প্রস্রাব ও নিয়মিত প্রস্রাব।',
      },
      {
        id: 'mental-health',
        title: 'Mental Health',
        title_bn: 'মানসিক স্বাস্থ্য',
        body: 'Mood changes, anxiety, and low feelings are common in pregnancy and after birth. Tell someone you trust and your health worker — these are medical issues, not weakness. Warning signs needing urgent help: thoughts of harming yourself or the baby, or persistent deep sadness for more than 2 weeks.',
        body_bn: 'মেজাজ পরিবর্তন, উদ্বেগ এবং নিচু অনুভূতি গর্ভাবস্থায় এবং জন্মের পরে সাধারণ। বিশ্বস্ত কাউকে এবং আপনার স্বাস্থ্যকর্মীকে বলুন — এগুলো চিকিৎসাযোগ্য সমস্যা, দুর্বলতা নয়। জরুরি সহায়তার প্রয়োজন এমন সতর্কতার লক্ষণ: নিজেকে বা শিশুকে ক্ষতি করার চিন্তা, বা ২ সপ্তাহের বেশি ক্রমাগত গভীর বিষণ্নতা।',
      },
    ],
  },

  {
    id: 'C',
    key: 'EDU_LIB_CAT_C',
    articles: [
      {
        id: 'required-nutrients',
        title: 'Required Nutrients',
        title_bn: 'প্রয়োজনীয় পুষ্টি উপাদান',
        body: 'You need more of: iron, folic acid, calcium, vitamin D, iodine, protein, and omega-3 (DHA). A varied daily diet plus prescribed prenatal supplements covers most needs. Avoid vitamin A in high doses (liver, megavitamins) as it can harm the baby.',
        body_bn: 'আপনার আরও বেশি দরকার: আয়রন, ফলিক অ্যাসিড, ক্যালসিয়াম, ভিটামিন ডি, আয়োডিন, প্রোটিন এবং ওমেগা-৩ (DHA)। বৈচিত্র্যময় দৈনিক খাদ্য এবং নির্ধারিত প্রসব-পূর্ব সাপ্লিমেন্ট বেশিরভাগ চাহিদা পূরণ করে। উচ্চ মাত্রায় ভিটামিন A (কলিজা, মেগাভিটামিন) এড়িয়ে চলুন কারণ এটি শিশুর ক্ষতি করতে পারে।',
      },
      {
        id: 'iron-rich-foods',
        title: 'Iron-Rich Foods',
        title_bn: 'আয়রন সমৃদ্ধ খাবার',
        body: 'Include daily: dark green leafy vegetables (spinach, amaranth), lentils and beans, jaggery, lean red meat, chicken liver, eggs, dried fish (in moderation), and fortified cereals. Take iron tablets with vitamin C (lemon, orange, tomato) and avoid tea/coffee within 1 hour.',
        body_bn: 'প্রতিদিন অন্তর্ভুক্ত করুন: গাঢ় সবুজ শাকসবজি (পালং শাক, শাজনা), মসুর ডাল ও বিভিন্ন ডাল, গুড়, চর্বিহীন লাল মাংস, মুরগির কলিজা, ডিম, শুঁটকি মাছ (পরিমিত) এবং পুষ্টিগুণ সম্বলিত সিরিয়াল। আয়রন ট্যাবলেট ভিটামিন সি (লেবু, কমলা, টমেটো) সহ নিন এবং ১ ঘণ্টার মধ্যে চা/কফি এড়িয়ে চলুন।',
      },
      {
        id: 'calcium-rich-foods',
        title: 'Calcium-Rich Foods',
        title_bn: 'ক্যালসিয়াম সমৃদ্ধ খাবার',
        body: 'Milk, yogurt, cheese, small fish eaten with bones (e.g. anchovies, mola), sesame seeds (til), ragi, almonds, and dark leafy greens. Aim for 1000 mg per day. Take calcium tablets at a different time of day from iron tablets, as they reduce each other\'s absorption.',
        body_bn: 'দুধ, দই, পনির, হাড়সহ ছোট মাছ (যেমন মলা মাছ), তিল, রাগি, বাদাম এবং গাঢ় শাকসবজি। প্রতিদিন ১০০০ মিগ্রা লক্ষ্য রাখুন। আয়রন ট্যাবলেট থেকে আলাদা সময়ে ক্যালসিয়াম ট্যাবলেট নিন, কারণ এগুলো একে অপরের শোষণ কমায়।',
      },
      {
        id: 'folic-acid',
        title: 'Folic Acid',
        title_bn: 'ফলিক অ্যাসিড',
        body: 'Take 400 micrograms (0.4 mg) of folic acid daily from at least 1 month before conception through the first 12 weeks of pregnancy. It prevents serious brain and spine defects. Higher doses (5 mg) are needed if you have had a previous affected pregnancy or are on certain medicines — your health worker will advise.',
        body_bn: 'গর্ভধারণের কমপক্ষে ১ মাস আগে থেকে গর্ভাবস্থার প্রথম ১২ সপ্তাহ পর্যন্ত প্রতিদিন ৪০০ মাইক্রোগ্রাম (০.৪ মিগ্রা) ফলিক অ্যাসিড নিন। এটি মস্তিষ্ক ও মেরুদণ্ডের গুরুতর ত্রুটি প্রতিরোধ করে। আগে আক্রান্ত গর্ভাবস্থা থাকলে বা কিছু ওষুধে থাকলে বেশি ডোজ (৫ মিগ্রা) লাগতে পারে — আপনার স্বাস্থ্যকর্মী পরামর্শ দেবেন।',
      },
      {
        id: 'protein',
        title: 'Protein Requirements',
        title_bn: 'প্রোটিনের চাহিদা',
        body: 'You need about 60 to 80 grams of protein per day (about 25 g more than before). Include in every meal: pulses, eggs, dairy, fish, chicken, lean meat, soy, nuts, and seeds. Vegetarians can combine dal with whole grains or dairy to get all essential amino acids.',
        body_bn: 'আপনার প্রতিদিন প্রায় ৬০ থেকে ৮০ গ্রাম প্রোটিন দরকার (আগের চেয়ে প্রায় ২৫ গ্রাম বেশি)। প্রতি বেলায় অন্তর্ভুক্ত করুন: ডাল, ডিম, দুগ্ধজাত, মাছ, মুরগি, চর্বিহীন মাংস, সয়া, বাদাম এবং বীজ। নিরামিষাশীরা সমস্ত প্রয়োজনীয় অ্যামিনো অ্যাসিড পেতে ডাল ও দানাশস্য বা দুগ্ধজাত একত্রিত করতে পারেন।',
      },
      {
        id: 'foods-to-avoid',
        title: 'Foods to Avoid',
        title_bn: 'যেসব খাবার এড়ানো উচিত',
        body: 'Avoid: raw/undercooked meat, fish, and eggs; unpasteurised milk and soft cheeses; unwashed salads; excess caffeine (limit to 200 mg/day, about 1 cup of coffee); alcohol; liver and high-dose vitamin A; large predator fish high in mercury (swordfish, king mackerel); street food of doubtful hygiene.',
        body_bn: 'এড়িয়ে চলুন: কাঁচা/কম রান্না করা মাংস, মাছ ও ডিম; পাস্তুরিত নয় এমন দুধ ও নরম পনির; না ধোয়া সালাদ; অতিরিক্ত ক্যাফেইন (দিনে ২০০ মিগ্রার মধ্যে রাখুন, প্রায় ১ কাপ কফি); অ্যালকোহল; কলিজা ও উচ্চ-ডোজ ভিটামিন A; পারদ বেশি আছে এমন বড় শিকারি মাছ; সন্দেহজনক পরিচ্ছন্নতার রাস্তার খাবার।',
      },
    ],
  },

  {
    id: 'D',
    key: 'EDU_LIB_CAT_D',
    articles: [
      {
        id: 'safe-exercises-by-trimester',
        title: 'Safe Exercises by Trimester',
        title_bn: 'ত্রৈমাসিক অনুযায়ী নিরাপদ ব্যায়াম',
        trimester: 'first',
        benefits: 'Reduces back pain, improves sleep, lowers risk of gestational diabetes and pre-eclampsia, boosts mood, prepares your body for labour, and helps with healthy weight gain.',
        benefits_bn: 'পিঠের ব্যথা কমায়, ঘুম উন্নত করে, গর্ভকালীন ডায়াবেটিস ও প্রি-এক্লাম্পসিয়ার ঝুঁকি কমায়, মেজাজ ভালো করে, শরীরকে প্রসবের জন্য প্রস্তুত করে এবং স্বাস্থ্যকর ওজন বৃদ্ধিতে সাহায্য করে।',
        precautions: 'Warm up and cool down, wear supportive shoes and a good bra, stay hydrated, stop if you feel dizzy, short of breath, or have pain, and avoid lying flat on your back after the first trimester.',
        precautions_bn: 'ওয়ার্মআপ ও কুলডাউন করুন, সহায়ক জুতা ও ভালো ব্রা পরুন, হাইড্রেটেড থাকুন, মাথা ঘোরা, শ্বাসকষ্ট বা ব্যথা হলে থামুন এবং প্রথম ত্রৈমাসিকের পরে চিত হয়ে শোয়া এড়িয়ে চলুন।',
        contraindications: 'Do NOT start a new strenuous programme. Avoid: contact sports, activities with falling risk (cycling, skiing, horse riding after week 12), scuba diving, exercising at high altitude, and hot yoga. Stop any exercise if you have bleeding, contractions, fluid leaking, chest pain, or reduced baby movement.',
        contraindications_bn: 'নতুন কঠোর প্রোগ্রাম শুরু করবেন না। এড়িয়ে চলুন: যোগাযোগ খেলাধুলা, পড়ে যাওয়ার ঝুঁকির কার্যকলাপ (১২ সপ্তাহের পরে সাইকেল, স্কিইং), স্কুবা ডাইভিং, উচ্চ উচ্চতায় ব্যায়াম এবং হট যোগা। রক্তপাত, সংকোচন, তরল বের হওয়া, বুকে ব্যথা বা শিশুর নড়াচড়া কমলে যেকোনো ব্যায়াম বন্ধ করুন।',
      },
      {
        id: 'walking',
        title: 'Walking',
        title_bn: 'হাঁটা',
        trimester: 'first',
        benefits: 'Easy, free, and safe in all trimesters. Improves heart fitness, helps control weight gain, reduces swelling, and boosts mood. Aim for 30 minutes at a comfortable pace on most days.',
        benefits_bn: 'সহজ, বিনামূল্যে এবং সব ত্রৈমাসিকে নিরাপদ। হৃদযন্ত্রের সুস্থতা উন্নত করে, ওজন বৃদ্ধি নিয়ন্ত্রণে সাহায্য করে, ফোলা কমায় এবং মেজাজ ভালো করে। বেশিরভাগ দিনে আরামদায়ক গতিতে ৩০ মিনিট লক্ষ্য রাখুন।',
        precautions: 'Wear flat supportive shoes, walk on even ground, carry water, avoid hot midday sun, and walk with someone after week 28 in case you need help. Stop and rest if you feel tired, dizzy, or have cramps.',
        precautions_bn: 'সমতল সহায়ক জুতা পরুন, সমতল জমিতে হাঁটুন, পানি সাথে রাখুন, গরম দুপুরের রোদ এড়িয়ে চলুন এবং ২৮ সপ্তাহের পরে সহায়তার জন্য কারো সাথে হাঁটুন। ক্লান্ত, মাথা ঘোরা বা ব্যথা হলে থামুন ও বিশ্রাম নিন।',
        contraindications: 'Placenta previa (after week 20), preterm labour signs, severe anaemia, ruptured membranes, cervical insufficiency, or pre-eclampsia with severe symptoms — check with your health worker first.',
        contraindications_bn: 'প্লাসেন্টা প্রিভিয়া (২০ সপ্তাহের পরে), অকাল প্রসবের লক্ষণ, তীব্র রক্তস্বল্পতা, ঝিল্লি ফেটে যাওয়া, সার্ভিক্যাল অপর্যাপ্ততা বা গুরুতর লক্ষণসহ প্রি-এক্লাম্পসিয়া — আগে স্বাস্থ্যকর্মীর সাথে পরামর্শ করুন।',
      },
      {
        id: 'stretching',
        title: 'Stretching',
        title_bn: 'স্ট্রেচিং',
        trimester: 'first',
        benefits: 'Eases back, hip, and leg tension; improves posture; helps relaxation; and prepares muscles for labour. Gentle stretching can be done daily.',
        benefits_bn: 'পিঠ, নিতম্ব ও পায়ের টান কমায়; ভঙ্গি উন্নত করে; শিথিলায়নে সাহায্য করে; এবং প্রসবের জন্য মাংসপেশী প্রস্তুত করে। হালকা স্ট্রেচিং প্রতিদিন করা যায়।',
        precautions: 'Move slowly, do not bounce, avoid deep twisting of the abdomen, do not stretch a joint past its normal range, and breathe steadily. Stop if you feel pain or cramping.',
        precautions_bn: 'ধীরে নড়ুন, লাফ দেবেন না, পেটের গভীর মোচড় এড়িয়ে চলুন, জয়েন্টকে স্বাভাবিক সীমার বাইরে না নিন এবং স্থিরভাবে শ্বাস নিন। ব্যথা বা খিঁচুনি হলে থামুন।',
        contraindications: 'Avoid stretches that require lying flat on your back after the first trimester, deep forward bends that compress the belly, and any stretch that causes dizziness or contractions.',
        contraindications_bn: 'প্রথম ত্রৈমাসিকের পরে চিত হয়ে শোয়ার প্রয়োজন এমন স্ট্রেচ, পেট চাপে এমন গভীর সামনে ঝোঁকা এবং মাথা ঘোরা বা সংকোচন ঘটায় এমন যেকোনো স্ট্রেচ এড়িয়ে চলুন।',
      },
      {
        id: 'pelvic-floor',
        title: 'Pelvic Floor Exercises (Kegels)',
        title_bn: 'পেলভিক ফ্লোর ব্যায়াম (কেগেল)',
        trimester: 'second',
        benefits: 'Strengthens the muscles that support the uterus, bladder, and bowel. Reduces urine leakage during and after pregnancy, helps with recovery, and may ease the pushing stage of labour.',
        benefits_bn: 'জরায়ু, মূত্রাশয় ও অন্ত্রকে সহায়তাকারী মাংসপেশী শক্তিশালী করে। গর্ভাবস্থায় ও পরে প্রস্রাব লিক কমায়, পুনরুদ্ধারে সাহায্য করে এবং প্রসবের ঠেলা পর্বকে সহজ করতে পারে।',
        precautions: 'Empty your bladder first. Tighten as if stopping urine mid-flow and holding back gas — that is the right muscle. Do not hold your breath. Begin with 5 second holds, 5 second rests, 10 repetitions, 3 times a day. Avoid practising by actually stopping urine flow regularly.',
        precautions_bn: 'আগে মূত্রাশয় খালি করুন। মাঝপথে প্রস্রাব বন্ধ করার মতো শক্ত করুন — এটিই সঠিক মাংসপেশী। শ্বাস ধরে রাখবেন না। ৫ সেকেন্ড ধরে রাখা ও ৫ সেকেন্ড বিশ্রাম দিয়ে শুরু করুন, ১০ বার, দিনে ৩ বার। প্রস্রাবের প্রবাহ নিয়মিতভাবে বন্ধ করে অনুশীলন করবেন না।',
        contraindications: 'If you have pain during pelvic floor exercise, a prolapse diagnosis, or recent pelvic surgery, ask your health worker for individual guidance before continuing.',
        contraindications_bn: 'পেলভিক ফ্লোর ব্যায়ামের সময় ব্যথা, প্রল্যাপস নির্ণয়, বা সাম্প্রতিক পেলভিক সার্জারি থাকলে চলিয়ে যাওয়ার আগে পৃথক নির্দেশনার জন্য স্বাস্থ্যকর্মীকে জিজ্ঞাসা করুন।',
      },
    ],
  },

  {
    id: 'E',
    key: 'EDU_LIB_CAT_E',
    articles: [
      {
        id: 'anc',
        term: 'ANC',
        term_bn: 'ANC (প্রসবপূর্ব পরিচর্যা)',
        meaning: 'Antenatal Care — the regular check-ups you have during pregnancy with a health worker.',
        meaning_bn: 'অ্যান্টেনেটাল কেয়ার — গর্ভাবস্থায় স্বাস্থ্যকর্মীর সাথে নিয়মিত চেকআপ।',
        why_it_matters: 'ANC visits screen for and detect problems early (anaemia, high blood pressure, gestational diabetes, growth issues) and give you a chance to ask questions. WHO recommends at least 8 contacts.',
        why_it_matters_bn: 'প্রসবপূর্ব পরিদর্শন সমস্যা (রক্তস্বল্পতা, উচ্চ রক্তচাপ, গর্ভকালীন ডায়াবেটিস, বৃদ্ধির সমস্যা) প্রাথমিকভাবে পরীক্ষা ও সনাক্ত করে এবং প্রশ্ন জিজ্ঞাসার সুযোগ দেয়। WHO কমপক্ষে ৮টি যোগাযোগের সুপারিশ করে।',
        normal_range: 'At least 8 visits for an uncomplicated pregnancy.',
        normal_range_bn: 'জটিলতা ছাড়া গর্ভাবস্থার জন্য কমপক্ষে ৮টি পরিদর্শন।',
      },
      {
        id: 'edd',
        term: 'EDD',
        term_bn: 'EDD (সম্ভাব্য প্রসব তারিখ)',
        meaning: 'Estimated Date of Delivery — the calculated date your baby is most likely to be born, based on your last menstrual period (LMP) or early ultrasound.',
        meaning_bn: 'এস্টিমেটেড ডেট অব ডেলিভারি — শেষ মাসিক চক্র (LMP) বা প্রাথমিক আল্ট্রাসাউন্ডের উপর ভিত্তি করে আপনার শিশুর সম্ভবত জন্মের তারিখ।',
        why_it_matters: 'It guides timing of tests, decisions about travel, and when to prepare for delivery. Most babies are born within 2 weeks before or after the EDD.',
        why_it_matters_bn: 'এটি পরীক্ষার সময়, ভ্রমণের সিদ্ধান্ত এবং প্রসবের প্রস্তুতির সময় নির্দেশ করে। বেশিরভাগ শিশু EDD-এর ২ সপ্তাহ আগে বা পরে জন্মায়।',
        normal_range: 'Full term is 37 to 42 completed weeks.',
        normal_range_bn: 'পূর্ণমেয়াদ হলো ৩৭ থেকে ৪২ সম্পূর্ণ সপ্তাহ।',
      },
      {
        id: 'ga',
        term: 'GA',
        term_bn: 'GA (গর্ভকালীন বয়স)',
        meaning: 'Gestational Age — how many weeks and days the pregnancy has progressed, counted from the first day of your last menstrual period.',
        meaning_bn: 'জেস্টেশনাল এজ — শেষ মাসিক চক্রের প্রথম দিন থেকে গণনা করে গর্ভাবস্থা কত সপ্তাহ ও দিন অগ্রসর হয়েছে।',
        why_it_matters: 'GA tells you which trimester you are in, what tests are due, what baby development to expect, and when it is safe to deliver.',
        why_it_matters_bn: 'GA আপনাকে বলে আপনি কোন ত্রৈমাসিকে আছেন, কোন পরীক্ষা করার সময় হয়েছে, শিশুর কী বিকাশ আশা করা যায় এবং কখন প্রসব নিরাপদ।',
        normal_range: 'A pregnancy lasts about 40 weeks (280 days) from LMP.',
        normal_range_bn: 'গর্ভাবস্থা LMP থেকে প্রায় ৪০ সপ্তাহ (২৮০ দিন) স্থায়ী হয়।',
      },
      {
        id: 'fhr',
        term: 'FHR',
        term_bn: 'FHR (ভ্রূণের হৃদস্পন্দন হার)',
        meaning: 'Fetal Heart Rate — the baby\'s heartbeats per minute, heard with a doppler or fetoscope.',
        meaning_bn: 'ফেটাল হার্ট রেট — শিশুর প্রতি মিনিটে হৃদস্পন্দন, ডপলার বা ফেটোস্কোপ দিয়ে শোনা যায়।',
        why_it_matters: 'A normal FHR reassures that the baby is getting enough oxygen. Sudden changes can be a sign of distress and need review.',
        why_it_matters_bn: 'একটি স্বাভাবিক FHR নিশ্চিত করে যে শিশু পর্যাপ্ত অক্সিজেন পাচ্ছে। হঠাৎ পরিবর্তন কষ্টের লক্ষণ হতে পারে এবং পর্যালোচনা করা দরকার।',
        normal_range: '110 to 160 beats per minute is normal.',
        normal_range_bn: 'প্রতি মিনিটে ১১০ থেকে ১৬০ বিট স্বাভাবিক।',
      },
      {
        id: 'bp',
        term: 'BP',
        term_bn: 'BP (রক্তচাপ)',
        meaning: 'Blood Pressure — the force of blood against artery walls, written as systolic/diastolic (e.g. 120/80).',
        meaning_bn: 'ব্লাড প্রেশার — ধমনীর দেয়ালের বিরুদ্ধে রক্তের চাপ, সিস্টোলিক/ডায়াস্টোলিক হিসেবে লেখা হয় (যেমন ১২০/৮০)।',
        why_it_matters: 'High BP in pregnancy can mean pre-eclampsia — a serious condition for mother and baby. Low BP can cause dizziness and falls.',
        why_it_matters_bn: 'গর্ভাবস্থায় উচ্চ রক্তচাপ প্রি-এক্লাম্পসিয়া মানে হতে পারে — মা ও শিশুর জন্য গুরুতর অবস্থা। কম রক্তচাপ মাথা ঘোরা ও পড়ে যাওয়ার কারণ হতে পারে।',
        normal_range: 'Around 110 to 130 / 70 to 85 mmHg. High: ≥140/90. Urgent: ≥160/110.',
        normal_range_bn: 'প্রায় ১১০ থেকে ১৩০ / ৭০ থেকে ৮৫ মিমিHg। উচ্চ: ≥১৪০/৯০। জরুরি: ≥১৬০/১১০।',
      },
      {
        id: 'hb',
        term: 'Hb',
        term_bn: 'Hb (হিমোগ্লোবিন)',
        meaning: 'Haemoglobin — the protein in red blood cells that carries oxygen. Measured from a small blood sample.',
        meaning_bn: 'হিমোগ্লোবিন — লাল রক্ত কোষের প্রোটিন যা অক্সিজেন বহন করে। একটি ছোট রক্তের নমুনা থেকে পরিমাপ করা হয়।',
        why_it_matters: 'Low Hb means anaemia, which makes you tired, increases infection risk, and can lead to bleeding problems at delivery.',
        why_it_matters_bn: 'কম Hb মানে রক্তস্বল্পতা, যা আপনাকে ক্লান্ত করে, সংক্রমণের ঝুঁকি বাড়ায় এবং প্রসবে রক্তপাতের সমস্যা হতে পারে।',
        normal_range: 'At least 11 g/dL in pregnancy. Below 7 g/dL is severe and needs urgent treatment.',
        normal_range_bn: 'গর্ভাবস্থায় কমপক্ষে ১১ গ্রাম/ডেসিলিটার। ৭ গ্রাম/ডেসিলিটারের নিচে গুরুতর এবং জরুরি চিকিৎসার প্রয়োজন।',
      },
      {
        id: 'placenta',
        term: 'Placenta',
        term_bn: 'প্লাসেন্টা (অমরা)',
        meaning: 'The organ attached to the inside of the uterus, connected to the baby by the umbilical cord. It delivers oxygen and nutrients and removes waste.',
        meaning_bn: 'জরায়ুর ভেতরের দেয়ালে সংযুক্ত অঙ্গ, নাভিনালি দ্বারা শিশুর সাথে সংযুক্ত। এটি অক্সিজেন ও পুষ্টি সরবরাহ করে এবং বর্জ্য সরিয়ে দেয়।',
        why_it_matters: 'A healthy placenta is essential for baby growth. Problems include placenta previa (covering the birth canal), placental abruption (early separation), and placenta accreta. All need specialist care.',
        why_it_matters_bn: 'শিশুর বৃদ্ধির জন্য সুস্থ প্লাসেন্টা অপরিহার্য। সমস্যাগুলির মধ্যে রয়েছে প্লাসেন্টা প্রিভিয়া (জন্ম নালি ঢাকা), প্লাসেন্টাল অ্যাব্রাপশন (প্রাথমিক বিচ্ছেদ) এবং প্লাসেন্টা অ্যাক্রেটা। সবগুলোতে বিশেষজ্ঞ পরিচর্যা দরকার।',
      },
      {
        id: 'amniotic-fluid',
        term: 'Amniotic Fluid',
        term_bn: 'অ্যামনিওটিক তরল',
        meaning: 'The clear warm fluid inside the amniotic sac that surrounds and protects the baby.',
        meaning_bn: 'অ্যামনিওটিক স্যাকের ভেতরের স্বচ্ছ উষ্ণ তরল যা শিশুকে ঘিরে ও রক্ষা করে।',
        why_it_matters: 'Too little (oligohydramnios) or too much (polyhydramnios) fluid can signal problems with the baby or pregnancy. Sudden leaking of fluid before term may mean the sac has broken and needs assessment.',
        why_it_matters_bn: 'খুব কম বা খুব বেশি তরল শিশু বা গর্ভাবস্থার সমস্যার সংকেত দিতে পারে। মেয়াদের আগে হঠাৎ তরল বের হওয়া মানে থলি ভেঙে গেছে এবং মূল্যায়ন দরকার।',
        normal_range: 'Amniotic Fluid Index (AFI) usually 8 to 18 cm.',
        normal_range_bn: 'অ্যামনিওটিক ফ্লুইড ইনডেক্স (AFI) সাধারণত ৮ থেকে ১৮ সেমি।',
      },
      {
        id: 'gestational-diabetes-term',
        term: 'Gestational Diabetes',
        term_bn: 'গর্ভকালীন ডায়াবেটিস',
        meaning: 'High blood glucose that develops in pregnancy, usually diagnosed with a glucose test between weeks 24 and 28.',
        meaning_bn: 'গর্ভাবস্থায় বিকশিত উচ্চ রক্তে গ্লুকোজ, সাধারণত ২৪ থেকে ২৮ সপ্তাহের মধ্যে গ্লুকোজ পরীক্ষায় নির্ণয় করা হয়।',
        why_it_matters: 'Untreated, it can lead to a very large baby, birth difficulties, low baby blood sugar after birth, and increased risk of type 2 diabetes for the mother later in life. It is usually managed well with diet, activity, and sometimes insulin.',
        why_it_matters_bn: 'চিকিৎসা না হলে, খুব বড় শিশু, প্রসবের সমস্যা, জন্মের পরে শিশুর রক্তে শর্করা কম হওয়া এবং মায়ের পরবর্তী জীবনে টাইপ ২ ডায়াবেটিসের ঝুঁকি বেড়ে যায়। এটি সাধারণত খাদ্য, কার্যকলাপ এবং কখনো কখনো ইনসুলিন দিয়ে ভালোভাবে পরিচালনা করা যায়।',
        normal_range: 'Fasting glucose < 92 mg/dL; 1-hour after 75 g glucose < 180 mg/dL; 2-hour < 153 mg/dL.',
        normal_range_bn: 'ফাস্টিং গ্লুকোজ < ৯২ মিগ্রা/ডেসিলিটার; ৭৫ গ্রাম গ্লুকোজের ১ ঘণ্টা পরে < ১৮০; ২ ঘণ্টা পরে < ১৫৩ মিগ্রা/ডেসিলিটার।',
      },
    ],
  },

  {
    id: 'F',
    key: 'EDU_LIB_CAT_F',
    articles: [
      {
        id: 'signs-of-labor',
        title: 'Signs of Labor',
        title_bn: 'প্রসবের লক্ষণ',
        body: '1) Regular contractions that get stronger and closer (about every 5 minutes for an hour). 2) A "show" — pink or blood-stained mucus from the vagina. 3) Your water breaking — a gush or slow leak of clear fluid. 4) Lower back pain or pelvic pressure that comes and goes. 5) Period-like cramps. Call your health worker when contractions are 5 minutes apart for an hour, your water breaks, or you have bleeding.',
        body_bn: '১) নিয়মিত সংকোচন যা শক্তিশালী ও কাছাকাছি হয় (প্রায় প্রতি ৫ মিনিটে এক ঘণ্টার জন্য)। ২) "শো" — যোনি থেকে গোলাপী বা রক্তমাখা মিউকাস। ৩) পানি ভাঙা — পরিষ্কার তরলের প্রবাহ বা ধীরে ধীরে বের হওয়া। ৪) নিচের পিঠে ব্যথা বা পেলভিক চাপ যা আসে ও যায়। ৫) পিরিয়ডের মতো ব্যথা। এক ঘণ্টার জন্য ৫ মিনিট অন্তর সংকোচন হলে, পানি ভাঙলে বা রক্তপাত হলে স্বাস্থ্যকর্মীকে ফোন করুন।',
      },
      {
        id: 'hospital-admission',
        title: 'Hospital Admission Process',
        title_bn: 'হাসপাতালে ভর্তির প্রক্রিয়া',
        body: 'On arrival you will be: 1) registered with your ID and ANC records, 2) examined (BP, temperature, pulse, baby heart rate, contractions, cervical check), 3) classified (early labour, active labour, or a complication needing urgent care). Bring your ANC card, ultrasound reports, ID, and the hospital bag. A companion is usually allowed; ask in advance about your facility\'s policy.',
        body_bn: 'আগমনের পরে আপনাকে: ১) পরিচয়পত্র ও প্রসবপূর্ব রেকর্ড দিয়ে নিবন্ধন, ২) পরীক্ষা (রক্তচাপ, তাপমাত্রা, নাড়ি, শিশুর হৃদস্পন্দন, সংকোচন, সার্ভিক্যাল চেক), ৩) শ্রেণীবদ্ধ (প্রাথমিক প্রসব, সক্রিয় প্রসব বা জরুরি পরিচর্যার প্রয়োজন জটিলতা) করা হবে। প্রসবপূর্ব কার্ড, আল্ট্রাসাউন্ড রিপোর্ট, পরিচয়পত্র এবং হাসপাতালের ব্যাগ নিয়ে আসুন। একজন সঙ্গী সাধারণত অনুমোদিত; আপনার সুবিধার নীতি আগে থেকে জিজ্ঞাসা করুন।',
      },
      {
        id: 'birth-plan',
        title: 'Birth Plan',
        title_bn: 'বার্থ প্ল্যান (প্রসব পরিকল্পনা)',
        body: 'A simple 1-page note covering: who you want with you, your preferred birth position, pain relief preferences, who cuts the cord, immediate skin-to-skin, breastfeeding intention, and any cultural/religious practices. Discuss it with your health worker in advance and bring two copies — one for you, one for the team. Be flexible: plans can change if the medical situation requires.',
        body_bn: 'একটি সহজ ১-পৃষ্ঠার নোট যাতে থাকবে: আপনার সাথে কে চান, পছন্দের প্রসব অবস্থান, ব্যথা নিরাময়ের পছন্দ, কে কর্ড কাটবেন, তাৎক্ষণিক ত্বকে-ত্বক যোগাযোগ, বুকের দুধ খাওয়ানোর ইচ্ছা এবং যেকোনো সাংস্কৃতিক/ধর্মীয় অনুশীলন। আগে থেকে স্বাস্থ্যকর্মীর সাথে আলোচনা করুন এবং দুটি কপি আনুন। নমনীয় থাকুন: চিকিৎসা পরিস্থিতি পরিবর্তন হলে পরিকল্পনা পরিবর্তন হতে পারে।',
      },
      {
        id: 'emergency-contacts',
        title: 'Emergency Contacts',
        title_bn: 'জরুরি যোগাযোগ নম্বর',
        body: 'Keep these written somewhere visible at home: your health worker\'s number, the ambulance / hospital emergency number, the nearest hospital address, a trusted family member or neighbour, and your own blood group. Save them in your phone under speed-dial before week 32. If you live far from the hospital, ask your health worker about a closer place for the last weeks.',
        body_bn: 'বাড়িতে দৃশ্যমান স্থানে লিখে রাখুন: স্বাস্থ্যকর্মীর নম্বর, অ্যাম্বুলেন্স/হাসপাতাল ইমার্জেন্সি নম্বর, নিকটতম হাসপাতালের ঠিকানা, বিশ্বস্ত পরিবারের সদস্য বা প্রতিবেশী এবং নিজের রক্তের গ্রুপ। ৩২ সপ্তাহের আগে ফোনে স্পিড-ডায়ালে সেভ করুন। হাসপাতাল থেকে দূরে থাকলে শেষ সপ্তাহগুলোর জন্য কাছাকাছি স্থান সম্পর্কে স্বাস্থ্যকর্মীকে জিজ্ঞাসা করুন।',
      },
      {
        id: 'transportation',
        title: 'Transportation Planning',
        title_bn: 'পরিবহন পরিকল্পনা',
        body: 'Before week 34, decide: 1) who will drive / accompany you, 2) the route and an alternate route, 3) backup if your first driver is unavailable, 4) money set aside for transport at any hour, 5) care for other children or pets. Pre-arrange a vehicle that can fit you lying down if needed. Re-check the plan every week from week 36.',
        body_bn: '৩৪ সপ্তাহের আগে সিদ্ধান্ত নিন: ১) কে চালাবেন/সঙ্গে যাবেন, ২) রাস্তা ও বিকল্প রাস্তা, ৩) প্রথম চালক অনুপলব্ধ হলে বিকল্প, ৪) যেকোনো সময় পরিবহনের জন্য আলাদা টাকা, ৫) অন্য শিশু বা পোষা প্রাণীর যত্ন। প্রয়োজনে শুয়ে পরিবহন করতে পারে এমন একটি গাড়ি আগে থেকে ব্যবস্থা করুন। ৩৬ সপ্তাহ থেকে প্রতি সপ্তাহে পরিকল্পনা পুনরায় পরীক্ষা করুন।',
      },
    ],
  },
]

// ─── Section 3: Hospital Bag Checklist ──────────────────────
const RAW_BAG = {
  mother: [
    { en: 'ID card', bn: 'পরিচয়পত্র' },
    { en: 'Medical records', bn: 'চিকিৎসা নথি' },
    { en: 'Comfortable clothing', bn: 'আরামদায়ক পোশাক' },
    { en: 'Toiletries', bn: 'টয়লেটরিজ' },
    { en: 'Sanitary pads (maternity)', bn: 'স্যানিটারি প্যাড (মাতৃত্ব)' },
    { en: 'Nursing bras', bn: 'নার্সিং ব্রা' },
    { en: 'Slippers', bn: 'স্লিপার' },
    { en: 'Mobile phone and charger', bn: 'মোবাইল ফোন ও চার্জার' },
  ],
  baby: [
    { en: 'Newborn clothes (3 sets)', bn: 'নবজাতকের পোশাক (৩ সেট)' },
    { en: 'Soft blanket', bn: 'নরম কম্বল' },
    { en: 'Diapers (newborn size)', bn: 'ডায়াপার (নবজাতক সাইজ)' },
    { en: 'Baby wipes', bn: 'বেবি ওয়াইপস' },
    { en: 'Hat and socks', bn: 'টুপি ও মোজা' },
    { en: 'Towel', bn: 'তোয়ালে' },
    { en: 'Burp cloths', bn: 'বার্প ক্লথ' },
  ],
  documents: [
    { en: 'ANC card / records', bn: 'প্রসবপূর্ব কার্ড / রেকর্ড' },
    { en: 'Ultrasound reports', bn: 'আল্ট্রাসাউন্ড রিপোর্ট' },
    { en: 'Blood group report', bn: 'রক্তের গ্রুপ রিপোর্ট' },
    { en: 'Insurance information (if applicable)', bn: 'বীমার তথ্য (প্রযোজ্য ক্ষেত্রে)' },
    { en: 'Government ID copies', bn: 'সরকারি পরিচয়পত্রের কপি' },
    { en: 'Birth plan (1 printed copy)', bn: 'বার্থ প্ল্যান (১ মুদ্রিত কপি)' },
  ],
}

export const HOSPITAL_BAG = {
  mother: RAW_BAG.mother.map((item) => ({
    id: 'mother.' + item.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label: item.en,
    label_bn: item.bn,
  })),
  baby: RAW_BAG.baby.map((item) => ({
    id: 'baby.' + item.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label: item.en,
    label_bn: item.bn,
  })),
  documents: RAW_BAG.documents.map((item) => ({
    id: 'docs.' + item.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label: item.en,
    label_bn: item.bn,
  })),
}

export const HOSPITAL_BAG_TOTAL =
  HOSPITAL_BAG.mother.length + HOSPITAL_BAG.baby.length + HOSPITAL_BAG.documents.length

export const HOSPITAL_BAG_STORAGE_KEY = 'pg_hospital_bag_packed:v1'
