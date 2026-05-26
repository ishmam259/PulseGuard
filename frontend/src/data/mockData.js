// ═══════════════════════════════════════════════════════════
// PulseGuard AI – Mock Data
// ═══════════════════════════════════════════════════════════

export const users = {
  patient: {
    id: 'u-001',
    name: 'Amina Rahman',
    phone: '+880 123 456 789',
    role: 'patient',
    initials: 'AR',
  },
  worker: {
    id: 'u-002',
    name: 'Dr. Karim Hossain',
    phone: '+880 987 654 321',
    role: 'worker',
    initials: 'KH',
  },
  admin: {
    id: 'u-003',
    name: 'Admin Farhan',
    phone: '+880 555 000 111',
    role: 'admin',
    initials: 'AF',
  },
}

export const patients = [
  {
    id: 'p-001',
    pid: 'PG-2048',
    name: 'Amina Rahman',
    age: 28,
    village: 'Kurigram Village A',
    gestationalWeek: 24,
    riskLevel: 'High',
    riskScore: 0.82,
    assignedWorker: 'Dr. Karim',
    lastVisit: 'May 24, 2026',
    bp: '140/90',
    weight: 63,
    temperature: 37.2,
    pulse: 88,
    symptoms: ['Headache', 'Dizziness'],
    initials: 'AR',
  },
  {
    id: 'p-002',
    pid: 'PG-1982',
    name: 'Salma Begum',
    age: 25,
    village: 'Kurigram Village B',
    gestationalWeek: 18,
    riskLevel: 'Moderate',
    riskScore: 0.45,
    assignedWorker: 'Nurse Tania',
    lastVisit: 'May 23, 2026',
    bp: '130/85',
    weight: 58,
    temperature: 36.8,
    pulse: 76,
    symptoms: ['Fatigue'],
    initials: 'SB',
  },
  {
    id: 'p-003',
    pid: 'PG-2103',
    name: 'Rahima Khatun',
    age: 32,
    village: 'Rangpur Village C',
    gestationalWeek: 30,
    riskLevel: 'Low',
    riskScore: 0.18,
    assignedWorker: 'Dr. Karim',
    lastVisit: 'May 22, 2026',
    bp: '118/76',
    weight: 65,
    temperature: 36.6,
    pulse: 72,
    symptoms: [],
    initials: 'RK',
  },
  {
    id: 'p-004',
    pid: 'PG-2067',
    name: 'Fatema Akter',
    age: 22,
    village: 'Dinajpur Village D',
    gestationalWeek: 12,
    riskLevel: 'Low',
    riskScore: 0.12,
    assignedWorker: 'Nurse Tania',
    lastVisit: 'May 21, 2026',
    bp: '115/75',
    weight: 55,
    temperature: 36.5,
    pulse: 70,
    symptoms: ['Nausea'],
    initials: 'FA',
  },
  {
    id: 'p-005',
    pid: 'PG-2091',
    name: 'Nasreen Jahan',
    age: 30,
    village: 'Kurigram Village A',
    gestationalWeek: 36,
    riskLevel: 'High',
    riskScore: 0.78,
    assignedWorker: 'Dr. Karim',
    lastVisit: 'May 25, 2026',
    bp: '145/95',
    weight: 72,
    temperature: 37.4,
    pulse: 92,
    symptoms: ['Headache', 'Swelling', 'Blurred Vision'],
    initials: 'NJ',
  },
]

export const vitalsHistory = [
  { date: 'May 25', bp_s: 140, bp_d: 90, weight: 63.2, pulse: 88, risk: 0.82 },
  { date: 'May 23', bp_s: 135, bp_d: 88, weight: 63.0, pulse: 84, risk: 0.72 },
  { date: 'May 20', bp_s: 130, bp_d: 85, weight: 62.8, pulse: 80, risk: 0.58 },
  { date: 'May 17', bp_s: 125, bp_d: 82, weight: 62.5, pulse: 78, risk: 0.42 },
  { date: 'May 14', bp_s: 122, bp_d: 80, weight: 62.2, pulse: 76, risk: 0.35 },
  { date: 'May 11', bp_s: 120, bp_d: 78, weight: 62.0, pulse: 74, risk: 0.28 },
  { date: 'May 08', bp_s: 118, bp_d: 76, weight: 61.8, pulse: 73, risk: 0.22 },
]

export const syncQueue = [
  { id: 's-001', type: 'vitals', patient: 'Amina Rahman', status: 'pending', timestamp: '2 min ago' },
  { id: 's-002', type: 'vitals', patient: 'Salma Begum', status: 'pending', timestamp: '5 min ago' },
  { id: 's-003', type: 'profile', patient: 'Rahima Khatun', status: 'synced', timestamp: '10 min ago' },
  { id: 's-004', type: 'vitals', patient: 'Fatema Akter', status: 'pending', timestamp: '15 min ago' },
  { id: 's-005', type: 'vitals', patient: 'Nasreen Jahan', status: 'conflict', timestamp: '20 min ago' },
]

export const conflicts = [
  {
    id: 'c-001',
    patient: 'Nasreen Jahan',
    field: 'Blood Pressure',
    localValue: '145/95',
    serverValue: '142/92',
    timestamp: '20 min ago',
  },
  {
    id: 'c-002',
    patient: 'Amina Rahman',
    field: 'Weight',
    localValue: '63.5 kg',
    serverValue: '63.2 kg',
    timestamp: '1 hour ago',
  },
]

export const alerts = [
  {
    id: 'a-001',
    type: 'emergency',
    title: 'Critical: Preeclampsia Risk',
    message: 'Amina Rahman — BP 140/90, risk score 0.82',
    time: '2 min ago',
    read: false,
  },
  {
    id: 'a-002',
    type: 'risk',
    title: 'High Risk Detection',
    message: 'Nasreen Jahan — BP 145/95, risk score 0.78',
    time: '15 min ago',
    read: false,
  },
  {
    id: 'a-003',
    type: 'sync',
    title: 'Sync Complete',
    message: '3 records synced successfully.',
    time: '30 min ago',
    read: true,
  },
  {
    id: 'a-004',
    type: 'info',
    title: 'Appointment Reminder',
    message: 'Next checkup for Salma Begum in 2 days.',
    time: '1 hour ago',
    read: true,
  },
]

export const chatMessages = [
  { id: 'm-001', role: 'ai', text: 'Hello! I am your PulseGuard AI health assistant. How are you feeling today? ' },
  { id: 'm-002', role: 'user', text: 'I feel dizzy and have a headache since morning.' },
  { id: 'm-003', role: 'ai', text: 'I understand you are experiencing dizziness and headache. These could indicate:\n\n• Low blood pressure (hypotension)\n• Mild dehydration\n• Early preeclampsia indicators\n\nRecommendation: Please drink plenty of water, rest, and check your blood pressure. If symptoms persist, inform your health worker immediately.' },
]

export const nutritionData = {
  recommended: [
    { name: 'Leafy Greens (Spinach, Kale)', benefit: 'Iron & Folate', icon: '' },
    { name: 'Lentils (Dal)', benefit: 'Protein & Iron', icon: '' },
    { name: 'Eggs', benefit: 'Protein & Choline', icon: '' },
    { name: 'Fish (Low Mercury)', benefit: 'Omega-3 & DHA', icon: '' },
    { name: 'Sweet Potatoes', benefit: 'Vitamin A', icon: '' },
    { name: 'Yogurt', benefit: 'Calcium & Probiotics', icon: '' },
  ],
  avoid: [
    { name: 'High Mercury Fish', reason: 'Fetal neurotoxicity risk', icon: '' },
    { name: 'Unpasteurized Dairy', reason: 'Listeria risk', icon: '' },
    { name: 'Raw Sprouts', reason: 'Bacterial contamination', icon: '' },
    { name: 'Excessive Caffeine', reason: 'Growth restriction risk', icon: '' },
  ],
  local: [
    { name: 'Spinach (Palong Shak)', tag: 'High Iron', icon: '' },
    { name: 'Red Lentils (Masoor Dal)', tag: 'Protein Rich', icon: '' },
    { name: 'Rice + Lentils', tag: 'Complete Protein', icon: '' },
    { name: 'Seasonal Fruits', tag: 'Low Cost', icon: '' },
    { name: 'Chickpeas (Chola)', tag: 'Folate Rich', icon: '' },
    { name: 'Milk', tag: 'Calcium', icon: '' },
  ],
}

export const adminKPIs = {
  totalPatients: 1248,
  highRiskCases: 47,
  activeWorkers: 86,
  offlineDevices: 32,
}

export const riskTrendData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  high: [12, 15, 18, 22, 30, 47],
  moderate: [45, 48, 52, 55, 58, 62],
  low: [180, 195, 210, 225, 240, 248],
}

export const regionData = {
  labels: ['Kurigram', 'Rangpur', 'Dinajpur', 'Lalmonirhat', 'Nilphamari'],
  patients: [320, 280, 210, 195, 243],
  highRisk: [15, 10, 8, 6, 8],
}

export const workerSchedule = [
  { id: 'ws-001', patient: 'Amina', time: '10:00 AM', village: 'Village A', risk: 'High' },
  { id: 'ws-002', patient: 'Rahima', time: '11:30 AM', village: 'Village C', risk: 'Low' },
  { id: 'ws-003', patient: 'Nasreen', time: '2:00 PM', village: 'Village A', risk: 'High' },
  { id: 'ws-004', patient: 'Fatema', time: '3:30 PM', village: 'Village D', risk: 'Low' },
]

export const records = [
  { id: 'r-001', title: 'Ultrasound Checkup', date: 'May 20', status: 'Complete', type: 'checkup' },
  { id: 'r-002', title: 'Blood Pressure Log', date: 'May 18', status: 'Synced', type: 'vitals' },
  { id: 'r-003', title: 'Blood Test Results', date: 'May 12', status: 'Complete', type: 'lab' },
  { id: 'r-004', title: 'Weight Tracking', date: 'May 10', status: 'Synced', type: 'vitals' },
]
