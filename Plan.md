# PulseGuard i18n Implementation Plan
# Bangla ↔ English Translation

> **For Antigravity AI.** Every instruction is exact and implementation-ready.  
> Follow the phases in order. Do not skip ahead.

---

## Ground Rules (Read First)

1. **The `$` function is the only translation mechanism.** No i18n libraries, no React context for strings, no `useTranslation`, nothing new. Just `$`.
2. **`locale` lives in `AppContext`.** It is exposed via `useApp()`. Every component that needs to translate text calls `const { locale } = useApp()` and passes it to `$`.
3. **`config/strings.js` holds every string.** The outer shape is always `{ 'en': { ... }, 'bn': { ... } }`. The `$` function signature is `$(KEY, locale)` and returns `strings[locale][KEY]`.
4. **navItems become functions**, not static arrays, because they are defined outside React components and cannot call `useApp()`. Every page that uses navItems will call the function with `locale` to get the translated array.
5. **Admin pages are English-only** for this sprint (admin users are system operators). `AdminLayout` gets the language toggle button but admin page content strings are not translated. This keeps scope manageable.
6. **Worker pages ARE translated.** Health workers in the field are the primary Bangla speakers.

---

## File Map (Every File That Changes)

```
frontend/src/
├── config/
│   └── strings.js                  ← REBUILT from scratch
├── context/
│   └── AppContext.jsx               ← ADD locale state
├── data/
│   └── navItems.js                  ← CONVERT arrays to functions
├── components/layout/
│   ├── MobileLayout.jsx             ← ADD toggle button + translate layout text
│   └── AdminLayout.jsx              ← ADD toggle button only
├── pages/
│   ├── Splash.jsx                   ← TRANSLATE
│   ├── RoleSelection.jsx            ← TRANSLATE
│   ├── Login.jsx                    ← TRANSLATE
│   ├── Register.jsx                 ← TRANSLATE
│   ├── patient/
│   │   ├── Dashboard.jsx            ← TRANSLATE
│   │   ├── AIChat.jsx               ← FIX (already partial, complete it)
│   │   ├── DailyCheck.jsx           ← TRANSLATE
│   │   ├── Emergency.jsx            ← TRANSLATE
│   │   ├── Nutrition.jsx            ← TRANSLATE
│   │   ├── Records.jsx              ← TRANSLATE
│   │   ├── Alerts.jsx               ← TRANSLATE
│   │   ├── Profile.jsx              ← TRANSLATE
│   │   └── Onboarding.jsx           ← TRANSLATE
│   └── worker/
│       ├── Dashboard.jsx            ← TRANSLATE
│       ├── PatientList.jsx          ← TRANSLATE
│       ├── PatientDetails.jsx       ← TRANSLATE
│       ├── VitalsEntry.jsx          ← TRANSLATE
│       ├── AIAnalysis.jsx           ← TRANSLATE
│       ├── Alerts.jsx               ← TRANSLATE
│       └── SyncCenter.jsx           ← TRANSLATE
```

---

## Phase 0 — `config/strings.js` (Complete Rebuild)

Replace the entire file with the following. Every key used anywhere in the plan lives here.

```js
const strings = {
  'en': {

    // ─── Language Toggle ───
    LANG_TOGGLE: 'বাংলা',

    // ─── Shared Layout (MobileLayout) ───
    LAYOUT_ONLINE: 'Online',
    LAYOUT_OFFLINE: 'Offline',
    LAYOUT_SYNCING: 'Syncing',
    LAYOUT_ALERTS_BTN: 'Alerts',
    LAYOUT_LOGOUT_BTN: 'Logout',
    LAYOUT_RESPOND_BTN: 'Respond',
    LAYOUT_PORTAL_PATIENT: 'Patient Portal',
    LAYOUT_PORTAL_WORKER: 'Maternal Health Worker Portal',
    LAYOUT_ADMIN_CONSOLE: 'Admin Console',

    // ─── Nav Items (Patient) ───
    NAV_P_HOME: 'Home',
    NAV_P_AICHAT: 'AI Chat',
    NAV_P_HEALTH: 'Health',
    NAV_P_ALERTS: 'Alerts',
    NAV_P_PROFILE: 'Profile',

    // ─── Nav Items (Worker) ───
    NAV_W_HOME: 'Home',
    NAV_W_PATIENTS: 'Patients',
    NAV_W_AI: 'AI',
    NAV_W_SYNC: 'Sync',
    NAV_W_PROFILE: 'Profile',

    // ─── Splash ───
    SPLASH_HEADLINE: 'Offline-First AI Maternal Healthcare',
    SPLASH_SUBLINE: 'AI-powered pregnancy risk monitoring, symptom checking, and automatic database syncing for rural health workers and mothers.',
    SPLASH_CTA: 'Get Started →',
    SPLASH_DISCLAIMER_TITLE: 'Medical Disclaimer',
    SPLASH_DISCLAIMER_BODY: 'PulseGuard is a decision-support tool for trained health workers — it does not replace professional medical advice, diagnosis, or treatment. In case of an emergency, contact a qualified healthcare provider or the nearest clinic immediately.',

    // ─── Role Selection ───
    ROLE_HEADING: 'Choose Your Role',
    ROLE_SUBHEADING: 'Select how you want to log in to the PulseGuard platform',
    ROLE_PATIENT_TITLE: 'Patient / Mother',
    ROLE_PATIENT_DESC: 'Log health data, check pregnancy vitals, and consult the AI assistant offline.',
    ROLE_WORKER_TITLE: 'Health Worker',
    ROLE_WORKER_DESC: 'Register mothers, monitor local vitals, and review AI risk analysis in villages.',
    ROLE_ADMIN_TITLE: 'Administrator',
    ROLE_ADMIN_DESC: 'Manage clinical assignments, inspect system analytics, and view regional summaries.',
    ROLE_CONTINUE: 'Continue →',
    ROLE_BACK: '← Back to Welcome Screen',

    // ─── Login ───
    LOGIN_HEADING: 'Welcome Back',
    LOGIN_SUBHEADING_PREFIX: 'Sign in as',
    LOGIN_SUBHEADING_SUFFIX: 'to access PulseGuard AI',
    LOGIN_LABEL_EMAIL: 'Email Address',
    LOGIN_LABEL_PASSWORD: 'Password',
    LOGIN_PH_EMAIL: 'you@example.com',
    LOGIN_PH_PASSWORD: '••••••••',
    LOGIN_BTN: 'Sign In',
    LOGIN_BTN_LOADING: 'Signing in...',
    LOGIN_LINK_REGISTER: 'Create an Account',
    LOGIN_LINK_CHANGE_ROLE: 'Change Role',
    LOGIN_ERR_PREFIX: 'Error:',

    // ─── Register ───
    REGISTER_HEADING: 'Join PulseGuard AI',
    REGISTER_SUBHEADING_PREFIX: 'Create your',
    REGISTER_SUBHEADING_SUFFIX: 'account to get started',
    REGISTER_LABEL_NAME: 'Full Name *',
    REGISTER_LABEL_EMAIL: 'Email Address *',
    REGISTER_LABEL_PHONE: 'Phone Number',
    REGISTER_LABEL_PASSWORD: 'Password *',
    REGISTER_PH_NAME: "Dr. Sarah Connor or Mother's Name",
    REGISTER_PH_EMAIL: 'you@example.com',
    REGISTER_PH_PHONE: '+880 XXX XXX XXX',
    REGISTER_PH_PASSWORD: 'Create a strong password',
    REGISTER_BTN: 'Create Account',
    REGISTER_BTN_LOADING: 'Creating Account...',
    REGISTER_ALREADY_HAVE: 'Already have an account?',
    REGISTER_LINK_SIGNIN: 'Sign In',
    REGISTER_ERR_PREFIX: 'Error:',

    // ─── Patient Dashboard ───
    PAGE_TITLE_DASHBOARD: 'Dashboard',
    DASH_LOADING: 'Loading health profile…',
    DASH_WELCOME_HEADING_PREFIX: 'Welcome,',
    DASH_WELCOME_BODY: 'Your account is ready! Complete your pregnancy profile to unlock vitals tracking, AI health checks, and personalised guidance.',
    DASH_COMPLETE_PROFILE_BTN: '✓ Complete My Profile',
    DASH_GREETING_PREFIX: 'Hello,',
    DASH_WEEK_LABEL: 'Pregnancy Week',
    DASH_SECTION_QUICK_ACTIONS: 'Quick Actions',
    DASH_ACTION_DAILY_TITLE: 'Daily Health Check',
    DASH_ACTION_DAILY_DESC: "Record today's vitals",
    DASH_ACTION_AI_TITLE: 'AI Symptom Checker',
    DASH_ACTION_AI_DESC: 'Chat with PulseGuard AI',
    DASH_ACTION_NUTRITION_TITLE: 'Nutrition Plan',
    DASH_ACTION_NUTRITION_DESC: 'Personalized meal guide',
    DASH_ACTION_EMERGENCY_TITLE: 'Emergency SOS',
    DASH_ACTION_EMERGENCY_DESC: 'One-tap emergency alert',
    DASH_SECTION_HEALTH_SUMMARY: 'Health Summary',
    DASH_KPI_BP: 'Blood Pressure',
    DASH_KPI_WEIGHT: 'Weight',
    DASH_KPI_TEMP: 'Temperature',
    DASH_KPI_LAST_CHECKUP: 'Last Checkup',
    DASH_KPI_NO_RECORDS: 'No records',
    DASH_VIEW_ALL_RECORDS: 'View All Records →',

    // ─── AI Chat ───
    PAGE_TITLE_AI_CHAT: 'AI Symptom Checker',
    AI_CHAT_PH: 'Describe your symptoms...',
    AI_CHAT_SEND: 'Send',
    AI_CHAT_ERR_OFFLINE: 'Sorry, the AI service is currently offline or unreachable. Please try again later.',
    AI_CHAT_ERR_FAILED: "Sorry, I couldn't process that request.",

    // ─── Daily Health Check ───
    PAGE_TITLE_DAILY_CHECK: 'Daily Health Check',
    DAILY_LOADING: 'Loading daily health check form…',
    DAILY_NO_PROFILE_ICON: '📋',
    DAILY_NO_PROFILE_HEADING: 'Profile Setup Required',
    DAILY_NO_PROFILE_BODY: 'You need to complete your pregnancy profile before recording vitals.',
    DAILY_NO_PROFILE_BTN: 'Complete My Profile',
    DAILY_FORM_HEADING: "Record Today's Vitals",
    DAILY_FORM_DATE_PREFIX: 'Pregnancy Week',
    DAILY_LABEL_BP: 'Blood Pressure (mmHg) *',
    DAILY_PH_BP: 'e.g. 120/80',
    DAILY_LABEL_WEIGHT: 'Weight (kg)',
    DAILY_PH_WEIGHT: 'e.g. 62',
    DAILY_LABEL_TEMP: 'Temperature (°C)',
    DAILY_PH_TEMP: 'e.g. 36.8',
    DAILY_LABEL_PULSE: 'Pulse (bpm)',
    DAILY_PH_PULSE: 'e.g. 75',
    DAILY_LABEL_SYMPTOMS: 'Symptoms (comma-separated)',
    DAILY_PH_SYMPTOMS: 'e.g. Headache, Nausea',
    DAILY_BTN_SAVE: 'Save',
    DAILY_BTN_SAVING: 'Saving...',
    DAILY_BTN_SAVE_OFFLINE: 'Save Offline',
    DAILY_SUCCESS_OFFLINE: 'Saved to offline queue successfully! It will sync when connection is restored.',
    DAILY_ERR_NO_PROFILE: 'No patient profile found. Please complete your registration first.',
    DAILY_ERR_BP_REQUIRED: 'Blood pressure is required (e.g. 120/80).',
    DAILY_ERR_BP_FORMAT: 'Please enter blood pressure in the format "systolic/diastolic" (e.g. 120/80)',
    DAILY_ERR_BP_RANGE: 'Invalid BP. Out of range',
    DAILY_ERR_PULSE_RANGE: 'Invalid pulse. Out of range',
    DAILY_ERR_NETWORK: 'Network request failed. Please try saving offline instead.',
    DAILY_ERR_SAVE_LOCAL: 'Failed to save data locally.',

    // ─── Emergency SOS ───
    PAGE_TITLE_EMERGENCY: 'Emergency SOS',
    EMERGENCY_HEADING: 'Emergency Alert',
    EMERGENCY_STATUS_READY: 'PulseGuard Security System: Ready',
    EMERGENCY_STATUS_SENT: 'SOS Dispatched: Help is on the way!',
    EMERGENCY_STATUS_GPS: 'GPS Coordinates:',
    EMERGENCY_STATUS_OFFLINE: 'Offline Mode Active',
    EMERGENCY_BODY: 'Press the SOS button to alert nearby health workers and emergency services. Your GPS location will be shared automatically.',
    EMERGENCY_SOS_BTN: 'SOS',
    EMERGENCY_SOS_SENT: 'SENT',
    EMERGENCY_BTN_GPS_LOADING: 'Fetching Location…',
    EMERGENCY_BTN_GPS: 'Share GPS Location',
    EMERGENCY_BTN_NOTIFY: 'Notify Health Worker',
    EMERGENCY_BTN_CALL: 'Call Emergency Services',

    // ─── Nutrition ───
    PAGE_TITLE_NUTRITION: 'Nutrition Guide',
    NUTRITION_TAG_ALL: 'All',
    NUTRITION_TAG_IRON: 'Iron Rich',
    NUTRITION_TAG_PROTEIN: 'Protein',
    NUTRITION_TAG_CALCIUM: 'Calcium',
    NUTRITION_TAG_VITAMINS: 'Vitamins',
    NUTRITION_SECTION_RECOMMENDED: 'Recommended Foods',
    NUTRITION_SECTION_RECOMMENDED_DESC: 'Essential nutrients for your pregnancy',
    NUTRITION_SECTION_AVOID: 'Foods to Avoid',
    NUTRITION_SECTION_AVOID_DESC: 'Minimize risk during pregnancy',
    NUTRITION_SECTION_LOCAL: 'Local Affordable Foods',
    NUTRITION_SECTION_LOCAL_DESC: 'Nutritious options available in your region',
    NUTRITION_EMPTY_RECOMMENDED: 'No recommended foods match the selected filter.',
    NUTRITION_EMPTY_LOCAL: 'No local foods match the selected filter.',

    // ─── Records ───
    PAGE_TITLE_RECORDS: 'Medical Records',
    RECORDS_HEADING: 'Your Records',
    RECORDS_EXPORT_BTN: '⬇️ Export CSV',
    RECORDS_LOADING: 'Loading records…',
    RECORDS_EMPTY: 'No records recorded yet.',
    RECORDS_FIELD_BP: 'BP:',
    RECORDS_FIELD_WEIGHT: 'Weight:',
    RECORDS_FIELD_TEMP: 'Temp:',
    RECORDS_FIELD_PULSE: 'Pulse:',
    RECORDS_NA: 'N/A',

    // ─── Patient Alerts ───
    PAGE_TITLE_ALERTS: 'Alerts',
    ALERTS_HEADING: 'Notifications',

    // ─── Patient Profile ───
    PAGE_TITLE_PROFILE: 'Profile',
    PROFILE_LOADING: 'Loading profile details…',
    PROFILE_SECTION_DETAILS: 'Profile Details',
    PROFILE_SECTION_EDIT: 'Edit Profile',
    PROFILE_LABEL_PREG_WEEK: 'Pregnancy Week',
    PROFILE_LABEL_RISK: 'Risk Level',
    PROFILE_LABEL_VILLAGE: 'Village',
    PROFILE_LABEL_PHONE: 'Phone',
    PROFILE_LABEL_EMAIL: 'Email',
    PROFILE_LABEL_ASSIGNED_PATIENTS: 'Assigned Patients',
    PROFILE_LABEL_SYSTEM_ROLE: 'System Role',
    PROFILE_LABEL_ADMIN_VALUE: 'Administrator',
    PROFILE_LABEL_PROFILE_STATUS: 'Profile Status',
    PROFILE_LABEL_PENDING: 'Pending Registration Completion',
    PROFILE_BTN_COMPLETE_REG: 'Complete Registration',
    PROFILE_EDIT_LABEL_NAME: 'Full Name *',
    PROFILE_EDIT_LABEL_EMAIL: 'Email Address',
    PROFILE_EDIT_LABEL_PHONE: 'Phone Number',
    PROFILE_EDIT_LABEL_VILLAGE: 'Village Clinic Area',
    PROFILE_EDIT_LABEL_WEEK: 'Gestational Pregnancy Week',
    PROFILE_EDIT_PH_NAME: 'Enter your name',
    PROFILE_EDIT_PH_EMAIL: 'e.g. name@domain.com',
    PROFILE_EDIT_PH_PHONE: 'e.g. +880123456789',
    PROFILE_EDIT_PH_VILLAGE: 'e.g. Village A',
    PROFILE_EDIT_PH_WEEK: 'e.g. 24',
    PROFILE_BTN_SAVE_CHANGES: 'Save Changes',
    PROFILE_BTN_SAVING: 'Saving...',
    PROFILE_BTN_CANCEL: 'Cancel',
    PROFILE_BTN_EDIT: 'Edit Profile',
    PROFILE_BTN_LOGOUT: 'Logout',
    PROFILE_ERR_NAME_REQUIRED: 'Name is required',
    PROFILE_ERR_NAME_LETTERS: 'Name must contain only letters and spaces',
    PROFILE_ERR_PHONE_DIGITS: 'Phone number must be exactly 11 digits',
    PROFILE_SUCCESS: 'Profile updated successfully!',
    PROFILE_PATIENT_ID_PREFIX: 'Patient ID: PG-',
    PROFILE_WORKER_ID_PREFIX: 'Health Worker ID: HW-',

    // ─── Onboarding ───
    PAGE_TITLE_ONBOARDING: 'Set Up Profile',
    ONBOARD_WELCOME_PREFIX: 'Welcome,',
    ONBOARD_WELCOME_BODY: 'To get started with PulseGuard, we need a few details to set up your maternal health profile. This will unlock vitals tracking, AI health checks, and personalised guidance.',
    ONBOARD_SECTION_HEADING: 'Medical Profile Setup',
    ONBOARD_SECTION_SUBHEADING: 'All fields marked * are required.',
    ONBOARD_LABEL_WEEK: 'Current Pregnancy Week *',
    ONBOARD_PH_WEEK: 'e.g. 24',
    ONBOARD_HINT_WEEK: 'Enter a value between 1 and 45.',
    ONBOARD_LABEL_AGE: 'Your Age',
    ONBOARD_PH_AGE: 'e.g. 26',
    ONBOARD_LABEL_VILLAGE: 'Village / Clinic Area',
    ONBOARD_PH_VILLAGE: 'e.g. Kurigram Village A',
    ONBOARD_BTN_SUBMIT: '✓ Complete Registration',
    ONBOARD_BTN_LOADING: 'Setting up profile…',
    ONBOARD_ERR_WEEK_REQUIRED: 'Please enter your current gestational week.',
    ONBOARD_ERR_WEEK_RANGE: 'Gestational week must be between 1 and 45.',

    // ─── Worker Dashboard ───
    W_PAGE_TITLE_DASHBOARD: 'Health Worker',
    W_DASH_GREETING_PREFIX: 'Hello,',
    W_DASH_GREETING_DEFAULT: 'Health Worker',
    W_DASH_LOADING: 'Loading your assigned patient overview...',
    W_DASH_PATIENTS_SUFFIX: 'patients assigned, including',
    W_DASH_HIGH_RISK_CASE: 'high risk case today.',
    W_DASH_HIGH_RISK_CASES: 'high risk cases today.',
    W_DASH_BANNER_TITLE: 'Sync Center',
    W_DASH_BANNER_ACTION: 'Open Sync',
    W_DASH_KPI_HEADING: "Today's KPIs",
    W_DASH_KPI_TOTAL: 'Total Patients',
    W_DASH_KPI_HIGH: 'High Risk Cases',
    W_DASH_KPI_MODERATE: 'Moderate Risk Cases',
    W_DASH_KPI_LOW: 'Low Risk Cases',
    W_DASH_SECTION_QUICK: 'Quick Actions',
    W_DASH_QUICK_PATIENTS: 'Patient List',
    W_DASH_QUICK_AI: 'AI Assistant',
    W_DASH_QUICK_SYNC: 'Sync Center',
    W_DASH_SECTION_HIGH_RISK: 'High Risk Patients',
    W_DASH_HIGH_RISK_SUFFIX: 'patients',
    W_DASH_LOADING_LIST: 'Loading…',
    W_DASH_NO_HIGH_RISK: 'No high risk patients',
    W_DASH_VIEW_BTN: 'View',

    // ─── Worker Patient List ───
    W_PAGE_TITLE_PATIENTS: 'Patient List',
    W_PATIENTS_SEARCH_PH: 'Search patient by name or village…',
    W_PATIENTS_FILTER_ALL: 'All',
    W_PATIENTS_FILTER_HIGH: 'High Risk',
    W_PATIENTS_FILTER_MODERATE: 'Moderate',
    W_PATIENTS_FILTER_LOW: 'Low Risk',
    W_PATIENTS_HEADING: 'Patients',
    W_PATIENTS_RESULTS_SUFFIX: 'results',
    W_PATIENTS_LOADING: 'Loading patients…',
    W_PATIENTS_EMPTY: 'No patients match your search.',
    W_PATIENTS_WEEK_PREFIX: 'Week',
    W_PATIENTS_UNKNOWN: 'Unknown',
    W_PATIENTS_VIEW_BTN: 'View',

    // ─── Worker Patient Details ───
    W_PAGE_TITLE_PATIENT_DETAILS: 'Patient Details',
    W_DETAILS_LOADING: 'Loading patient…',
    W_DETAILS_NOT_FOUND: 'Patient not found',
    W_DETAILS_AGE_PREFIX: 'Age:',
    W_DETAILS_WEEK_PREFIX: 'Week',
    W_DETAILS_TAB_OVERVIEW: 'Overview',
    W_DETAILS_TAB_VITALS: 'Vitals',
    W_DETAILS_TAB_AI: 'AI Insights',
    W_DETAILS_TAB_HISTORY: 'History',
    W_DETAILS_PREG_WEEK: 'Pregnancy Week',
    W_DETAILS_RISK_SUFFIX: 'Risk',
    W_DETAILS_BP: 'Blood Pressure',
    W_DETAILS_WEIGHT: 'Weight',
    W_DETAILS_PULSE: 'Pulse',
    W_DETAILS_TEMPERATURE: 'Temperature',
    W_DETAILS_HIGH_RISK_ALERT: 'High Risk Alert',
    W_DETAILS_VITALS_HEADING: 'Vitals History',
    W_DETAILS_VITALS_EMPTY: 'No vitals recorded yet',
    W_DETAILS_AI_HEADING: 'Risk Assessment',
    W_DETAILS_AI_RISK_SCORE: 'AI Risk Score',
    W_DETAILS_AI_PREECLAMPSIA_TITLE: 'Preeclampsia Flag',
    W_DETAILS_AI_PREECLAMPSIA_BODY: 'AI model has flagged potential preeclampsia risk. Immediate clinical referral recommended.',
    W_DETAILS_AI_MODEL_PREFIX: 'Model:',
    W_DETAILS_AI_MODEL_SUFFIX: 'Click "Run AI Analysis" below to get fresh prediction',
    W_DETAILS_AI_NOT_YET: 'Not yet analyzed',
    W_DETAILS_HISTORY_HEADING: 'Visit History',
    W_DETAILS_HISTORY_COMPLETE: 'Complete',
    W_DETAILS_HISTORY_EMPTY: 'No visit history',
    W_DETAILS_HISTORY_WORKER_PREFIX: 'Assigned Worker:',
    W_DETAILS_HISTORY_VILLAGE_PREFIX: 'Recorded by',
    W_DETAILS_BTN_RECORD_VITALS: 'Record Vitals',
    W_DETAILS_BTN_RUN_AI: 'Run AI Analysis',

    // ─── Worker Vitals Entry ───
    W_PAGE_TITLE_VITALS: 'Record Vitals',
    W_VITALS_HEADING: 'Vitals Input',
    W_VITALS_LABEL_PATIENT: 'Patient',
    W_VITALS_PH_PATIENT: 'Select patient…',
    W_VITALS_LABEL_SYSTOLIC: 'BP Systolic (mmHg) *',
    W_VITALS_LABEL_DIASTOLIC: 'BP Diastolic (mmHg) *',
    W_VITALS_LABEL_WEIGHT: 'Weight (kg)',
    W_VITALS_LABEL_PULSE: 'Pulse (bpm)',
    W_VITALS_LABEL_TEMP: 'Temperature (°C)',
    W_VITALS_LABEL_SYMPTOMS: 'Symptoms (comma-separated)',
    W_VITALS_PH_SYMPTOMS: 'Headache, fatigue, swelling...',
    W_VITALS_BTN_SAVE: 'Save Vitals',
    W_VITALS_BTN_SAVING: 'Saving...',
    W_VITALS_BTN_BACK: '← Back to Patient',
    W_VITALS_SUCCESS: 'Vitals saved successfully',
    W_VITALS_ERR_REQUIRED: 'Please select a patient and enter BP readings',
    W_VITALS_ERR_NETWORK: 'Connection failed. Please try again.',

    // ─── Worker AI Analysis ───
    W_PAGE_TITLE_AI: 'AI Analysis',
    W_AI_HEADING: 'AI Risk Assessment',
    W_AI_LABEL_SELECT: 'Select Patient',
    W_AI_PH_SELECT: 'Choose patient…',
    W_AI_BTN_ANALYZE: 'Run AI Analysis',
    W_AI_BTN_ANALYZING: 'Analyzing…',
    W_AI_RISK_HEADING_PREFIX: 'Risk Prediction:',
    W_AI_RISK_SCORE_LABEL: 'Risk Score',
    W_AI_PREECLAMPSIA_TITLE: 'Preeclampsia Flag',
    W_AI_PREECLAMPSIA_BODY: 'AI model has flagged potential preeclampsia risk.',
    W_AI_FACTORS_LABEL: 'Contributing Factors:',
    W_AI_MODEL_PREFIX: 'Model:',
    W_AI_SUMMARY_HEADING: 'Longitudinal Summary',
    W_AI_SUMMARY_LABEL: 'AI Assessment',
    W_AI_RECOMMENDATIONS_HEADING: 'Recommendations',
    W_AI_SOURCES_PREFIX: 'Sources:',

    // ─── Worker Alerts ───
    W_PAGE_TITLE_ALERTS: 'Alerts Center',
    W_ALERTS_ACTIVE_HEADING: 'Active Emergency SOS',
    W_ALERTS_ACTIVE_BADGE_SUFFIX: 'Active',
    W_ALERTS_LOADING: 'Loading alerts…',
    W_ALERTS_ALL_QUIET: '🎉 All quiet. No pending emergency alerts.',
    W_ALERTS_TRIGGERED_PREFIX: 'Triggered:',
    W_ALERTS_LOCATION_LABEL: '📍 Location Shared:',
    W_ALERTS_MAP_LINK: 'Open in Google Maps',
    W_ALERTS_BTN_RESOLVE: 'Mark Resolved',
    W_ALERTS_BTN_DISMISS: 'Dismiss',
    W_ALERTS_HISTORY_HEADING: 'Resolved Alerts History',
    W_ALERTS_RESOLVED_PREFIX: 'Resolved:',
    W_ALERTS_HISTORY_EMPTY: 'No history of resolved alerts.',

    // ─── Worker Sync Center ───
    W_PAGE_TITLE_SYNC: 'Sync Center',
    W_SYNC_BANNER_TITLE: 'Sync Status',
    W_SYNC_BANNER_ONLINE: 'Connected to server',
    W_SYNC_BANNER_OFFLINE: 'Offline; data will sync when connected',
    W_SYNC_BANNER_REFRESH: 'Refresh',
    W_SYNC_STAT_STATUS: 'Status',
    W_SYNC_STAT_CONFLICTS: 'Conflicts',
    W_SYNC_STATUS_ONLINE: 'Online',
    W_SYNC_STATUS_OFFLINE: 'Offline',
    W_SYNC_CONN_HEADING: 'Connection Status',
    W_SYNC_CONN_SYNCED: 'All data synced',
    W_SYNC_CONN_WAITING: 'Waiting for connection...',
    W_SYNC_CONFLICTS_HEADING_PREFIX: 'Conflicts (',
    W_SYNC_CONFLICTS_HEADING_SUFFIX: ')',
    W_SYNC_CONFLICTS_LOADING: 'Loading conflicts…',
    W_SYNC_CONFLICTS_EMPTY: 'No conflicts; all data is in sync',
    W_SYNC_DIFF_LOCAL: 'Local',
    W_SYNC_DIFF_SERVER: 'Server',
    W_SYNC_BTN_KEEP_LOCAL: 'Keep Local',
    W_SYNC_BTN_KEEP_SERVER: 'Keep Server',

  },

  'bn': {

    // ─── Language Toggle ───
    LANG_TOGGLE: 'English',

    // ─── Shared Layout (MobileLayout) ───
    LAYOUT_ONLINE: 'অনলাইন',
    LAYOUT_OFFLINE: 'অফলাইন',
    LAYOUT_SYNCING: 'সিঙ্ক হচ্ছে',
    LAYOUT_ALERTS_BTN: 'সতর্কতা',
    LAYOUT_LOGOUT_BTN: 'লগআউট',
    LAYOUT_RESPOND_BTN: 'সাড়া দিন',
    LAYOUT_PORTAL_PATIENT: 'রোগী পোর্টাল',
    LAYOUT_PORTAL_WORKER: 'মাতৃস্বাস্থ্য কর্মী পোর্টাল',
    LAYOUT_ADMIN_CONSOLE: 'অ্যাডমিন কনসোল',

    // ─── Nav Items (Patient) ───
    NAV_P_HOME: 'হোম',
    NAV_P_AICHAT: 'এআই চ্যাট',
    NAV_P_HEALTH: 'স্বাস্থ্য',
    NAV_P_ALERTS: 'সতর্কতা',
    NAV_P_PROFILE: 'প্রোফাইল',

    // ─── Nav Items (Worker) ───
    NAV_W_HOME: 'হোম',
    NAV_W_PATIENTS: 'রোগীরা',
    NAV_W_AI: 'এআই',
    NAV_W_SYNC: 'সিঙ্ক',
    NAV_W_PROFILE: 'প্রোফাইল',

    // ─── Splash ───
    SPLASH_HEADLINE: 'অফলাইন-ফার্স্ট এআই মাতৃস্বাস্থ্য সেবা',
    SPLASH_SUBLINE: 'গ্রামীণ স্বাস্থ্যকর্মী ও মায়েদের জন্য এআই-চালিত গর্ভাবস্থা ঝুঁকি পর্যবেক্ষণ, লক্ষণ পরীক্ষা এবং স্বয়ংক্রিয় ডেটা সিঙ্ক।',
    SPLASH_CTA: 'শুরু করুন →',
    SPLASH_DISCLAIMER_TITLE: 'চিকিৎসা সংক্রান্ত দাবিত্যাগ',
    SPLASH_DISCLAIMER_BODY: 'পালসগার্ড প্রশিক্ষিত স্বাস্থ্যকর্মীদের জন্য একটি সিদ্ধান্ত-সহায়তা সরঞ্জাম — এটি পেশাদার চিকিৎসা পরামর্শ, রোগনির্ণয় বা চিকিৎসার বিকল্প নয়। জরুরি পরিস্থিতিতে অবিলম্বে একজন যোগ্য স্বাস্থ্যসেবা প্রদানকারী বা নিকটতম ক্লিনিকে যোগাযোগ করুন।',

    // ─── Role Selection ───
    ROLE_HEADING: 'আপনার ভূমিকা বেছে নিন',
    ROLE_SUBHEADING: 'পালসগার্ড প্ল্যাটফর্মে কীভাবে লগইন করতে চান তা নির্বাচন করুন',
    ROLE_PATIENT_TITLE: 'রোগী / মা',
    ROLE_PATIENT_DESC: 'স্বাস্থ্য তথ্য লগ করুন, গর্ভাবস্থার ভাইটাল পরীক্ষা করুন এবং অফলাইনে এআই সহায়তা নিন।',
    ROLE_WORKER_TITLE: 'স্বাস্থ্যকর্মী',
    ROLE_WORKER_DESC: 'মায়েদের নিবন্ধন করুন, স্থানীয় ভাইটাল পর্যবেক্ষণ করুন এবং গ্রামে এআই ঝুঁকি বিশ্লেষণ দেখুন।',
    ROLE_ADMIN_TITLE: 'প্রশাসক',
    ROLE_ADMIN_DESC: 'ক্লিনিকাল অ্যাসাইনমেন্ট পরিচালনা করুন, সিস্টেম বিশ্লেষণ পরীক্ষা করুন এবং আঞ্চলিক সারসংক্ষেপ দেখুন।',
    ROLE_CONTINUE: 'চালিয়ে যান →',
    ROLE_BACK: '← স্বাগত স্ক্রিনে ফিরুন',

    // ─── Login ───
    LOGIN_HEADING: 'স্বাগতম',
    LOGIN_SUBHEADING_PREFIX: 'প্রবেশ করুন',
    LOGIN_SUBHEADING_SUFFIX: 'হিসেবে পালসগার্ড এআই-তে',
    LOGIN_LABEL_EMAIL: 'ইমেইল ঠিকানা',
    LOGIN_LABEL_PASSWORD: 'পাসওয়ার্ড',
    LOGIN_PH_EMAIL: 'আপনার@ইমেইল.com',
    LOGIN_PH_PASSWORD: '••••••••',
    LOGIN_BTN: 'সাইন ইন',
    LOGIN_BTN_LOADING: 'সাইন ইন হচ্ছে...',
    LOGIN_LINK_REGISTER: 'অ্যাকাউন্ট তৈরি করুন',
    LOGIN_LINK_CHANGE_ROLE: 'ভূমিকা পরিবর্তন করুন',
    LOGIN_ERR_PREFIX: 'ত্রুটি:',

    // ─── Register ───
    REGISTER_HEADING: 'পালসগার্ড এআই-তে যোগ দিন',
    REGISTER_SUBHEADING_PREFIX: 'আপনার',
    REGISTER_SUBHEADING_SUFFIX: 'অ্যাকাউন্ট তৈরি করুন',
    REGISTER_LABEL_NAME: 'পূর্ণ নাম *',
    REGISTER_LABEL_EMAIL: 'ইমেইল ঠিকানা *',
    REGISTER_LABEL_PHONE: 'ফোন নম্বর',
    REGISTER_LABEL_PASSWORD: 'পাসওয়ার্ড *',
    REGISTER_PH_NAME: 'ডা. সারাহ বা মায়ের নাম',
    REGISTER_PH_EMAIL: 'আপনার@ইমেইল.com',
    REGISTER_PH_PHONE: '+৮৮০ XXX XXX XXX',
    REGISTER_PH_PASSWORD: 'একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন',
    REGISTER_BTN: 'অ্যাকাউন্ট তৈরি করুন',
    REGISTER_BTN_LOADING: 'অ্যাকাউন্ট তৈরি হচ্ছে...',
    REGISTER_ALREADY_HAVE: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    REGISTER_LINK_SIGNIN: 'সাইন ইন',
    REGISTER_ERR_PREFIX: 'ত্রুটি:',

    // ─── Patient Dashboard ───
    PAGE_TITLE_DASHBOARD: 'ড্যাশবোর্ড',
    DASH_LOADING: 'স্বাস্থ্য প্রোফাইল লোড হচ্ছে…',
    DASH_WELCOME_HEADING_PREFIX: 'স্বাগতম,',
    DASH_WELCOME_BODY: 'আপনার অ্যাকাউন্ট প্রস্তুত! ভাইটাল ট্র্যাকিং, এআই স্বাস্থ্য পরীক্ষা এবং ব্যক্তিগতকৃত নির্দেশনা আনলক করতে আপনার গর্ভাবস্থার প্রোফাইল সম্পন্ন করুন।',
    DASH_COMPLETE_PROFILE_BTN: '✓ আমার প্রোফাইল সম্পন্ন করুন',
    DASH_GREETING_PREFIX: 'হ্যালো,',
    DASH_WEEK_LABEL: 'গর্ভাবস্থার সপ্তাহ',
    DASH_SECTION_QUICK_ACTIONS: 'দ্রুত কার্যক্রম',
    DASH_ACTION_DAILY_TITLE: 'দৈনিক স্বাস্থ্য পরীক্ষা',
    DASH_ACTION_DAILY_DESC: 'আজকের ভাইটাল রেকর্ড করুন',
    DASH_ACTION_AI_TITLE: 'এআই লক্ষণ পরীক্ষক',
    DASH_ACTION_AI_DESC: 'পালসগার্ড এআই-এর সাথে চ্যাট করুন',
    DASH_ACTION_NUTRITION_TITLE: 'পুষ্টি পরিকল্পনা',
    DASH_ACTION_NUTRITION_DESC: 'ব্যক্তিগতকৃত খাবার গাইড',
    DASH_ACTION_EMERGENCY_TITLE: 'জরুরি এসওএস',
    DASH_ACTION_EMERGENCY_DESC: 'এক-ট্যাপ জরুরি সতর্কতা',
    DASH_SECTION_HEALTH_SUMMARY: 'স্বাস্থ্য সারসংক্ষেপ',
    DASH_KPI_BP: 'রক্তচাপ',
    DASH_KPI_WEIGHT: 'ওজন',
    DASH_KPI_TEMP: 'তাপমাত্রা',
    DASH_KPI_LAST_CHECKUP: 'শেষ পরীক্ষা',
    DASH_KPI_NO_RECORDS: 'কোনো রেকর্ড নেই',
    DASH_VIEW_ALL_RECORDS: 'সব রেকর্ড দেখুন →',

    // ─── AI Chat ───
    PAGE_TITLE_AI_CHAT: 'এআই লক্ষণ পরীক্ষক',
    AI_CHAT_PH: 'আপনার লক্ষণ বর্ণনা করুন...',
    AI_CHAT_SEND: 'পাঠান',
    AI_CHAT_ERR_OFFLINE: 'দুঃখিত, এআই সেবা বর্তমানে অফলাইন বা নাগালের বাইরে। পরে আবার চেষ্টা করুন।',
    AI_CHAT_ERR_FAILED: 'দুঃখিত, আপনার অনুরোধ প্রক্রিয়া করা সম্ভব হয়নি।',

    // ─── Daily Health Check ───
    PAGE_TITLE_DAILY_CHECK: 'দৈনিক স্বাস্থ্য পরীক্ষা',
    DAILY_LOADING: 'দৈনিক স্বাস্থ্য পরীক্ষার ফর্ম লোড হচ্ছে…',
    DAILY_NO_PROFILE_ICON: '📋',
    DAILY_NO_PROFILE_HEADING: 'প্রোফাইল সেটআপ প্রয়োজন',
    DAILY_NO_PROFILE_BODY: 'ভাইটাল রেকর্ড করার আগে আপনার গর্ভাবস্থার প্রোফাইল সম্পন্ন করতে হবে।',
    DAILY_NO_PROFILE_BTN: 'আমার প্রোফাইল সম্পন্ন করুন',
    DAILY_FORM_HEADING: 'আজকের ভাইটাল রেকর্ড করুন',
    DAILY_FORM_DATE_PREFIX: 'গর্ভাবস্থার সপ্তাহ',
    DAILY_LABEL_BP: 'রক্তচাপ (mmHg) *',
    DAILY_PH_BP: 'যেমন ১২০/৮০',
    DAILY_LABEL_WEIGHT: 'ওজন (কেজি)',
    DAILY_PH_WEIGHT: 'যেমন ৬২',
    DAILY_LABEL_TEMP: 'তাপমাত্রা (°C)',
    DAILY_PH_TEMP: 'যেমন ৩৬.৮',
    DAILY_LABEL_PULSE: 'নাড়ির গতি (bpm)',
    DAILY_PH_PULSE: 'যেমন ৭৫',
    DAILY_LABEL_SYMPTOMS: 'লক্ষণ (কমা দিয়ে আলাদা করুন)',
    DAILY_PH_SYMPTOMS: 'যেমন মাথাব্যথা, বমিভাব',
    DAILY_BTN_SAVE: 'সংরক্ষণ করুন',
    DAILY_BTN_SAVING: 'সংরক্ষণ হচ্ছে...',
    DAILY_BTN_SAVE_OFFLINE: 'অফলাইনে সংরক্ষণ করুন',
    DAILY_SUCCESS_OFFLINE: 'অফলাইন কিউতে সফলভাবে সংরক্ষিত! সংযোগ ফিরে এলে সিঙ্ক হবে।',
    DAILY_ERR_NO_PROFILE: 'রোগীর প্রোফাইল পাওয়া যায়নি। প্রথমে নিবন্ধন সম্পন্ন করুন।',
    DAILY_ERR_BP_REQUIRED: 'রক্তচাপ প্রয়োজন (যেমন ১২০/৮০)।',
    DAILY_ERR_BP_FORMAT: 'রক্তচাপ "সিস্টোলিক/ডায়াস্টোলিক" ফরম্যাটে লিখুন (যেমন ১২০/৮০)',
    DAILY_ERR_BP_RANGE: 'অবৈধ রক্তচাপ। পরিসীমার বাইরে',
    DAILY_ERR_PULSE_RANGE: 'অবৈধ নাড়ির গতি। পরিসীমার বাইরে',
    DAILY_ERR_NETWORK: 'নেটওয়ার্ক অনুরোধ ব্যর্থ হয়েছে। অফলাইনে সংরক্ষণ করুন।',
    DAILY_ERR_SAVE_LOCAL: 'স্থানীয়ভাবে তথ্য সংরক্ষণ ব্যর্থ হয়েছে।',

    // ─── Emergency SOS ───
    PAGE_TITLE_EMERGENCY: 'জরুরি এসওএস',
    EMERGENCY_HEADING: 'জরুরি সতর্কতা',
    EMERGENCY_STATUS_READY: 'পালসগার্ড নিরাপত্তা ব্যবস্থা: প্রস্তুত',
    EMERGENCY_STATUS_SENT: 'এসওএস পাঠানো হয়েছে: সাহায্য আসছে!',
    EMERGENCY_STATUS_GPS: 'জিপিএস স্থানাঙ্ক:',
    EMERGENCY_STATUS_OFFLINE: 'অফলাইন মোড সক্রিয়',
    EMERGENCY_BODY: 'কাছের স্বাস্থ্যকর্মী ও জরুরি সেবাকে সতর্ক করতে এসওএস বোতাম চাপুন। আপনার জিপিএস অবস্থান স্বয়ংক্রিয়ভাবে শেয়ার করা হবে।',
    EMERGENCY_SOS_BTN: 'এসওএস',
    EMERGENCY_SOS_SENT: 'পাঠানো হয়েছে',
    EMERGENCY_BTN_GPS_LOADING: 'অবস্থান নেওয়া হচ্ছে…',
    EMERGENCY_BTN_GPS: 'জিপিএস অবস্থান শেয়ার করুন',
    EMERGENCY_BTN_NOTIFY: 'স্বাস্থ্যকর্মীকে জানান',
    EMERGENCY_BTN_CALL: 'জরুরি সেবায় ফোন করুন',

    // ─── Nutrition ───
    PAGE_TITLE_NUTRITION: 'পুষ্টি গাইড',
    NUTRITION_TAG_ALL: 'সব',
    NUTRITION_TAG_IRON: 'আয়রন সমৃদ্ধ',
    NUTRITION_TAG_PROTEIN: 'প্রোটিন',
    NUTRITION_TAG_CALCIUM: 'ক্যালসিয়াম',
    NUTRITION_TAG_VITAMINS: 'ভিটামিন',
    NUTRITION_SECTION_RECOMMENDED: 'প্রস্তাবিত খাবার',
    NUTRITION_SECTION_RECOMMENDED_DESC: 'গর্ভাবস্থায় প্রয়োজনীয় পুষ্টি',
    NUTRITION_SECTION_AVOID: 'যে খাবার এড়িয়ে চলবেন',
    NUTRITION_SECTION_AVOID_DESC: 'গর্ভাবস্থায় ঝুঁকি কমান',
    NUTRITION_SECTION_LOCAL: 'স্থানীয় সাশ্রয়ী খাবার',
    NUTRITION_SECTION_LOCAL_DESC: 'আপনার এলাকায় পাওয়া পুষ্টিকর বিকল্প',
    NUTRITION_EMPTY_RECOMMENDED: 'নির্বাচিত ফিল্টারে কোনো প্রস্তাবিত খাবার নেই।',
    NUTRITION_EMPTY_LOCAL: 'নির্বাচিত ফিল্টারে কোনো স্থানীয় খাবার নেই।',

    // ─── Records ───
    PAGE_TITLE_RECORDS: 'চিকিৎসা রেকর্ড',
    RECORDS_HEADING: 'আপনার রেকর্ড',
    RECORDS_EXPORT_BTN: '⬇️ CSV রপ্তানি',
    RECORDS_LOADING: 'রেকর্ড লোড হচ্ছে…',
    RECORDS_EMPTY: 'এখনো কোনো রেকর্ড নেই।',
    RECORDS_FIELD_BP: 'রক্তচাপ:',
    RECORDS_FIELD_WEIGHT: 'ওজন:',
    RECORDS_FIELD_TEMP: 'তাপমাত্রা:',
    RECORDS_FIELD_PULSE: 'নাড়ি:',
    RECORDS_NA: 'N/A',

    // ─── Patient Alerts ───
    PAGE_TITLE_ALERTS: 'সতর্কতা',
    ALERTS_HEADING: 'বিজ্ঞপ্তি',

    // ─── Patient Profile ───
    PAGE_TITLE_PROFILE: 'প্রোফাইল',
    PROFILE_LOADING: 'প্রোফাইল বিবরণ লোড হচ্ছে…',
    PROFILE_SECTION_DETAILS: 'প্রোফাইল বিবরণ',
    PROFILE_SECTION_EDIT: 'প্রোফাইল সম্পাদনা',
    PROFILE_LABEL_PREG_WEEK: 'গর্ভাবস্থার সপ্তাহ',
    PROFILE_LABEL_RISK: 'ঝুঁকির মাত্রা',
    PROFILE_LABEL_VILLAGE: 'গ্রাম',
    PROFILE_LABEL_PHONE: 'ফোন',
    PROFILE_LABEL_EMAIL: 'ইমেইল',
    PROFILE_LABEL_ASSIGNED_PATIENTS: 'নির্ধারিত রোগী',
    PROFILE_LABEL_SYSTEM_ROLE: 'সিস্টেম ভূমিকা',
    PROFILE_LABEL_ADMIN_VALUE: 'প্রশাসক',
    PROFILE_LABEL_PROFILE_STATUS: 'প্রোফাইল অবস্থা',
    PROFILE_LABEL_PENDING: 'নিবন্ধন সম্পন্ন হওয়া বাকি',
    PROFILE_BTN_COMPLETE_REG: 'নিবন্ধন সম্পন্ন করুন',
    PROFILE_EDIT_LABEL_NAME: 'পূর্ণ নাম *',
    PROFILE_EDIT_LABEL_EMAIL: 'ইমেইল ঠিকানা',
    PROFILE_EDIT_LABEL_PHONE: 'ফোন নম্বর',
    PROFILE_EDIT_LABEL_VILLAGE: 'গ্রামের ক্লিনিক এলাকা',
    PROFILE_EDIT_LABEL_WEEK: 'গর্ভাবস্থার সপ্তাহ',
    PROFILE_EDIT_PH_NAME: 'আপনার নাম লিখুন',
    PROFILE_EDIT_PH_EMAIL: 'যেমন নাম@ডোমেইন.com',
    PROFILE_EDIT_PH_PHONE: 'যেমন +৮৮০১২৩৪৫৬৭৮৯',
    PROFILE_EDIT_PH_VILLAGE: 'যেমন গ্রাম-এ',
    PROFILE_EDIT_PH_WEEK: 'যেমন ২৪',
    PROFILE_BTN_SAVE_CHANGES: 'পরিবর্তন সংরক্ষণ করুন',
    PROFILE_BTN_SAVING: 'সংরক্ষণ হচ্ছে...',
    PROFILE_BTN_CANCEL: 'বাতিল করুন',
    PROFILE_BTN_EDIT: 'প্রোফাইল সম্পাদনা করুন',
    PROFILE_BTN_LOGOUT: 'লগআউট',
    PROFILE_ERR_NAME_REQUIRED: 'নাম আবশ্যিক',
    PROFILE_ERR_NAME_LETTERS: 'নামে শুধুমাত্র অক্ষর ও ফাঁকা স্থান থাকতে পারবে',
    PROFILE_ERR_PHONE_DIGITS: 'ফোন নম্বরে ঠিক ১১টি সংখ্যা থাকতে হবে',
    PROFILE_SUCCESS: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!',
    PROFILE_PATIENT_ID_PREFIX: 'রোগী আইডি: PG-',
    PROFILE_WORKER_ID_PREFIX: 'স্বাস্থ্যকর্মী আইডি: HW-',

    // ─── Onboarding ───
    PAGE_TITLE_ONBOARDING: 'প্রোফাইল সেটআপ',
    ONBOARD_WELCOME_PREFIX: 'স্বাগতম,',
    ONBOARD_WELCOME_BODY: 'শুরু করতে, আপনার মাতৃস্বাস্থ্য প্রোফাইল সেট করতে কিছু তথ্য দরকার। এটি ভাইটাল ট্র্যাকিং, এআই স্বাস্থ্য পরীক্ষা এবং ব্যক্তিগতকৃত নির্দেশনা আনলক করবে।',
    ONBOARD_SECTION_HEADING: 'চিকিৎসা প্রোফাইল সেটআপ',
    ONBOARD_SECTION_SUBHEADING: '* চিহ্নিত সব ঘর পূরণ করা বাধ্যতামূলক।',
    ONBOARD_LABEL_WEEK: 'বর্তমান গর্ভাবস্থার সপ্তাহ *',
    ONBOARD_PH_WEEK: 'যেমন ২৪',
    ONBOARD_HINT_WEEK: '১ থেকে ৪৫-এর মধ্যে মান দিন।',
    ONBOARD_LABEL_AGE: 'আপনার বয়স',
    ONBOARD_PH_AGE: 'যেমন ২৬',
    ONBOARD_LABEL_VILLAGE: 'গ্রাম / ক্লিনিক এলাকা',
    ONBOARD_PH_VILLAGE: 'যেমন কুড়িগ্রাম গ্রাম-এ',
    ONBOARD_BTN_SUBMIT: '✓ নিবন্ধন সম্পন্ন করুন',
    ONBOARD_BTN_LOADING: 'প্রোফাইল সেটআপ হচ্ছে…',
    ONBOARD_ERR_WEEK_REQUIRED: 'আপনার বর্তমান গর্ভাবস্থার সপ্তাহ লিখুন।',
    ONBOARD_ERR_WEEK_RANGE: 'গর্ভাবস্থার সপ্তাহ ১ থেকে ৪৫-এর মধ্যে হতে হবে।',

    // ─── Worker Dashboard ───
    W_PAGE_TITLE_DASHBOARD: 'স্বাস্থ্যকর্মী',
    W_DASH_GREETING_PREFIX: 'হ্যালো,',
    W_DASH_GREETING_DEFAULT: 'স্বাস্থ্যকর্মী',
    W_DASH_LOADING: 'নির্ধারিত রোগীর তথ্য লোড হচ্ছে...',
    W_DASH_PATIENTS_SUFFIX: 'জন রোগী নির্ধারিত, যার মধ্যে',
    W_DASH_HIGH_RISK_CASE: 'জন উচ্চ ঝুঁকির রোগী আজকে।',
    W_DASH_HIGH_RISK_CASES: 'জন উচ্চ ঝুঁকির রোগী আজকে।',
    W_DASH_BANNER_TITLE: 'সিঙ্ক কেন্দ্র',
    W_DASH_BANNER_ACTION: 'সিঙ্ক খুলুন',
    W_DASH_KPI_HEADING: 'আজকের কেপিআই',
    W_DASH_KPI_TOTAL: 'মোট রোগী',
    W_DASH_KPI_HIGH: 'উচ্চ ঝুঁকির ঘটনা',
    W_DASH_KPI_MODERATE: 'মাঝারি ঝুঁকির ঘটনা',
    W_DASH_KPI_LOW: 'কম ঝুঁকির ঘটনা',
    W_DASH_SECTION_QUICK: 'দ্রুত কার্যক্রম',
    W_DASH_QUICK_PATIENTS: 'রোগীর তালিকা',
    W_DASH_QUICK_AI: 'এআই সহকারী',
    W_DASH_QUICK_SYNC: 'সিঙ্ক কেন্দ্র',
    W_DASH_SECTION_HIGH_RISK: 'উচ্চ ঝুঁকির রোগী',
    W_DASH_HIGH_RISK_SUFFIX: 'জন রোগী',
    W_DASH_LOADING_LIST: 'লোড হচ্ছে…',
    W_DASH_NO_HIGH_RISK: 'কোনো উচ্চ ঝুঁকির রোগী নেই',
    W_DASH_VIEW_BTN: 'দেখুন',

    // ─── Worker Patient List ───
    W_PAGE_TITLE_PATIENTS: 'রোগীর তালিকা',
    W_PATIENTS_SEARCH_PH: 'নাম বা গ্রাম দিয়ে রোগী খুঁজুন…',
    W_PATIENTS_FILTER_ALL: 'সব',
    W_PATIENTS_FILTER_HIGH: 'উচ্চ ঝুঁকি',
    W_PATIENTS_FILTER_MODERATE: 'মাঝারি',
    W_PATIENTS_FILTER_LOW: 'কম ঝুঁকি',
    W_PATIENTS_HEADING: 'রোগীরা',
    W_PATIENTS_RESULTS_SUFFIX: 'ফলাফল',
    W_PATIENTS_LOADING: 'রোগীর তালিকা লোড হচ্ছে…',
    W_PATIENTS_EMPTY: 'আপনার অনুসন্ধানের সাথে কোনো রোগী মিলছে না।',
    W_PATIENTS_WEEK_PREFIX: 'সপ্তাহ',
    W_PATIENTS_UNKNOWN: 'অজানা',
    W_PATIENTS_VIEW_BTN: 'দেখুন',

    // ─── Worker Patient Details ───
    W_PAGE_TITLE_PATIENT_DETAILS: 'রোগীর বিবরণ',
    W_DETAILS_LOADING: 'রোগীর তথ্য লোড হচ্ছে…',
    W_DETAILS_NOT_FOUND: 'রোগী পাওয়া যায়নি',
    W_DETAILS_AGE_PREFIX: 'বয়স:',
    W_DETAILS_WEEK_PREFIX: 'সপ্তাহ',
    W_DETAILS_TAB_OVERVIEW: 'সারসংক্ষেপ',
    W_DETAILS_TAB_VITALS: 'ভাইটাল',
    W_DETAILS_TAB_AI: 'এআই অন্তর্দৃষ্টি',
    W_DETAILS_TAB_HISTORY: 'ইতিহাস',
    W_DETAILS_PREG_WEEK: 'গর্ভাবস্থার সপ্তাহ',
    W_DETAILS_RISK_SUFFIX: 'ঝুঁকি',
    W_DETAILS_BP: 'রক্তচাপ',
    W_DETAILS_WEIGHT: 'ওজন',
    W_DETAILS_PULSE: 'নাড়ি',
    W_DETAILS_TEMPERATURE: 'তাপমাত্রা',
    W_DETAILS_HIGH_RISK_ALERT: 'উচ্চ ঝুঁকি সতর্কতা',
    W_DETAILS_VITALS_HEADING: 'ভাইটালের ইতিহাস',
    W_DETAILS_VITALS_EMPTY: 'এখনো কোনো ভাইটাল রেকর্ড নেই',
    W_DETAILS_AI_HEADING: 'ঝুঁকি মূল্যায়ন',
    W_DETAILS_AI_RISK_SCORE: 'এআই ঝুঁকি স্কোর',
    W_DETAILS_AI_PREECLAMPSIA_TITLE: 'প্রিক্ল্যাম্পসিয়া সতর্কতা',
    W_DETAILS_AI_PREECLAMPSIA_BODY: 'এআই মডেল সম্ভাব্য প্রিক্ল্যাম্পসিয়া ঝুঁকি চিহ্নিত করেছে। তাৎক্ষণিক ক্লিনিকাল রেফারেল প্রস্তাবিত।',
    W_DETAILS_AI_MODEL_PREFIX: 'মডেল:',
    W_DETAILS_AI_MODEL_SUFFIX: 'নতুন পূর্বাভাসের জন্য নিচে "এআই বিশ্লেষণ চালান" ক্লিক করুন',
    W_DETAILS_AI_NOT_YET: 'এখনো বিশ্লেষণ হয়নি',
    W_DETAILS_HISTORY_HEADING: 'পরিদর্শন ইতিহাস',
    W_DETAILS_HISTORY_COMPLETE: 'সম্পন্ন',
    W_DETAILS_HISTORY_EMPTY: 'কোনো পরিদর্শন ইতিহাস নেই',
    W_DETAILS_HISTORY_WORKER_PREFIX: 'নির্ধারিত কর্মী:',
    W_DETAILS_HISTORY_VILLAGE_PREFIX: 'রেকর্ড করেছেন',
    W_DETAILS_BTN_RECORD_VITALS: 'ভাইটাল রেকর্ড করুন',
    W_DETAILS_BTN_RUN_AI: 'এআই বিশ্লেষণ চালান',

    // ─── Worker Vitals Entry ───
    W_PAGE_TITLE_VITALS: 'ভাইটাল রেকর্ড করুন',
    W_VITALS_HEADING: 'ভাইটাল ইনপুট',
    W_VITALS_LABEL_PATIENT: 'রোগী',
    W_VITALS_PH_PATIENT: 'রোগী নির্বাচন করুন…',
    W_VITALS_LABEL_SYSTOLIC: 'সিস্টোলিক রক্তচাপ (mmHg) *',
    W_VITALS_LABEL_DIASTOLIC: 'ডায়াস্টোলিক রক্তচাপ (mmHg) *',
    W_VITALS_LABEL_WEIGHT: 'ওজন (কেজি)',
    W_VITALS_LABEL_PULSE: 'নাড়ির গতি (bpm)',
    W_VITALS_LABEL_TEMP: 'তাপমাত্রা (°C)',
    W_VITALS_LABEL_SYMPTOMS: 'লক্ষণ (কমা দিয়ে আলাদা করুন)',
    W_VITALS_PH_SYMPTOMS: 'মাথাব্যথা, ক্লান্তি, ফোলা...',
    W_VITALS_BTN_SAVE: 'ভাইটাল সংরক্ষণ করুন',
    W_VITALS_BTN_SAVING: 'সংরক্ষণ হচ্ছে...',
    W_VITALS_BTN_BACK: '← রোগীর কাছে ফিরুন',
    W_VITALS_SUCCESS: 'ভাইটাল সফলভাবে সংরক্ষিত',
    W_VITALS_ERR_REQUIRED: 'একটি রোগী নির্বাচন করুন এবং রক্তচাপ লিখুন',
    W_VITALS_ERR_NETWORK: 'সংযোগ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',

    // ─── Worker AI Analysis ───
    W_PAGE_TITLE_AI: 'এআই বিশ্লেষণ',
    W_AI_HEADING: 'এআই ঝুঁকি মূল্যায়ন',
    W_AI_LABEL_SELECT: 'রোগী নির্বাচন করুন',
    W_AI_PH_SELECT: 'রোগী বেছে নিন…',
    W_AI_BTN_ANALYZE: 'এআই বিশ্লেষণ চালান',
    W_AI_BTN_ANALYZING: 'বিশ্লেষণ হচ্ছে…',
    W_AI_RISK_HEADING_PREFIX: 'ঝুঁকি পূর্বাভাস:',
    W_AI_RISK_SCORE_LABEL: 'ঝুঁকি স্কোর',
    W_AI_PREECLAMPSIA_TITLE: 'প্রিক্ল্যাম্পসিয়া সতর্কতা',
    W_AI_PREECLAMPSIA_BODY: 'এআই মডেল সম্ভাব্য প্রিক্ল্যাম্পসিয়া ঝুঁকি চিহ্নিত করেছে।',
    W_AI_FACTORS_LABEL: 'অবদানকারী কারণ:',
    W_AI_MODEL_PREFIX: 'মডেল:',
    W_AI_SUMMARY_HEADING: 'দীর্ঘমেয়াদী সারসংক্ষেপ',
    W_AI_SUMMARY_LABEL: 'এআই মূল্যায়ন',
    W_AI_RECOMMENDATIONS_HEADING: 'সুপারিশ',
    W_AI_SOURCES_PREFIX: 'সূত্র:',

    // ─── Worker Alerts ───
    W_PAGE_TITLE_ALERTS: 'সতর্কতা কেন্দ্র',
    W_ALERTS_ACTIVE_HEADING: 'সক্রিয় জরুরি এসওএস',
    W_ALERTS_ACTIVE_BADGE_SUFFIX: 'সক্রিয়',
    W_ALERTS_LOADING: 'সতর্কতা লোড হচ্ছে…',
    W_ALERTS_ALL_QUIET: '🎉 সব শান্ত। কোনো বিচারাধীন জরুরি সতর্কতা নেই।',
    W_ALERTS_TRIGGERED_PREFIX: 'সক্রিয় হয়েছে:',
    W_ALERTS_LOCATION_LABEL: '📍 অবস্থান শেয়ার হয়েছে:',
    W_ALERTS_MAP_LINK: 'গুগল ম্যাপে খুলুন',
    W_ALERTS_BTN_RESOLVE: 'সমাধান হয়েছে চিহ্নিত করুন',
    W_ALERTS_BTN_DISMISS: 'বাতিল করুন',
    W_ALERTS_HISTORY_HEADING: 'সমাধানকৃত সতর্কতার ইতিহাস',
    W_ALERTS_RESOLVED_PREFIX: 'সমাধান:',
    W_ALERTS_HISTORY_EMPTY: 'কোনো সমাধানকৃত সতর্কতার ইতিহাস নেই।',

    // ─── Worker Sync Center ───
    W_PAGE_TITLE_SYNC: 'সিঙ্ক কেন্দ্র',
    W_SYNC_BANNER_TITLE: 'সিঙ্ক অবস্থা',
    W_SYNC_BANNER_ONLINE: 'সার্ভারের সাথে সংযুক্ত',
    W_SYNC_BANNER_OFFLINE: 'অফলাইন; সংযোগ ফিরলে ডেটা সিঙ্ক হবে',
    W_SYNC_BANNER_REFRESH: 'রিফ্রেশ',
    W_SYNC_STAT_STATUS: 'অবস্থা',
    W_SYNC_STAT_CONFLICTS: 'দ্বন্দ্ব',
    W_SYNC_STATUS_ONLINE: 'অনলাইন',
    W_SYNC_STATUS_OFFLINE: 'অফলাইন',
    W_SYNC_CONN_HEADING: 'সংযোগ অবস্থা',
    W_SYNC_CONN_SYNCED: 'সব ডেটা সিঙ্ক হয়েছে',
    W_SYNC_CONN_WAITING: 'সংযোগের অপেক্ষায়...',
    W_SYNC_CONFLICTS_HEADING_PREFIX: 'দ্বন্দ্ব (',
    W_SYNC_CONFLICTS_HEADING_SUFFIX: ')',
    W_SYNC_CONFLICTS_LOADING: 'দ্বন্দ্ব লোড হচ্ছে…',
    W_SYNC_CONFLICTS_EMPTY: 'কোনো দ্বন্দ্ব নেই; সব ডেটা সিঙ্কে আছে',
    W_SYNC_DIFF_LOCAL: 'স্থানীয়',
    W_SYNC_DIFF_SERVER: 'সার্ভার',
    W_SYNC_BTN_KEEP_LOCAL: 'স্থানীয় রাখুন',
    W_SYNC_BTN_KEEP_SERVER: 'সার্ভার রাখুন',

  }
}

const $ = (item, locale = 'en') => {
  return strings[locale]?.[item] ?? strings['en'][item] ?? item
}

export default $
```

> **Note on the `$` function:** The updated version adds `?? strings['en'][item] ?? item` as a double fallback — if a Bangla key is missing it falls back to English, and if the key doesn't exist at all it shows the key name itself. This prevents blank text during development.

---

## Phase 1 — `context/AppContext.jsx`

### What to change

Find the line where `useState` calls are made at the top of `AppProvider`. Add the locale state immediately after the other state declarations. Then add it to the `useEffect` for persistence, and expose it in the `value` object.

### Exact diff

**Add this after the existing `useState` calls (after the `loading` state line):**

```js
const [locale, setLocale] = useState(() => {
  return localStorage.getItem('pg_locale') || 'en'
})
```

**Add this `useEffect` (put it after the existing connectivity useEffect):**

```js
useEffect(() => {
  localStorage.setItem('pg_locale', locale)
}, [locale])
```

**In the `value` object at the bottom of `AppProvider`, add `locale` and `setLocale`:**

```js
const value = {
  connectivity,
  currentUser,
  setCurrentUser,
  loading,
  login,
  register,
  logout,
  notifications,
  addNotification,
  locale,        // ← ADD
  setLocale,     // ← ADD
}
```

---

## Phase 2 — `data/navItems.js` (Full Replacement)

The static arrays cannot access `useApp()` because they're not React components. Convert both exports to functions that accept `locale` and use `$` to translate labels.

Replace the entire file:

```js
import $ from '../config/strings'

export const patientNavItems = (locale) => [
  { label: $('NAV_P_HOME', locale),    to: '/patient/dashboard',   icon: '' },
  { label: $('NAV_P_AICHAT', locale),  to: '/patient/ai-chat',     icon: '' },
  { label: $('NAV_P_HEALTH', locale),  to: '/patient/daily-check', icon: '' },
  { label: $('NAV_P_ALERTS', locale),  to: '/patient/alerts',      icon: '' },
  { label: $('NAV_P_PROFILE', locale), to: '/patient/profile',     icon: '' },
]

export const workerNavItems = (locale) => [
  { label: $('NAV_W_HOME', locale),     to: '/worker/dashboard',   icon: '' },
  { label: $('NAV_W_PATIENTS', locale), to: '/worker/patients',    icon: '' },
  { label: $('NAV_W_AI', locale),       to: '/worker/ai-analysis', icon: '' },
  { label: $('NAV_W_SYNC', locale),     to: '/worker/sync',        icon: '' },
  { label: $('NAV_W_PROFILE', locale),  to: '/worker/profile',     icon: '' },
]
```

> **Critical:** Every file that currently does `import { patientNavItems } from '../../data/navItems'` and uses it as `navItems={patientNavItems}` must be updated to `navItems={patientNavItems(locale)}`. The same applies to `workerNavItems`. This is handled in each file's section below.

---

## Phase 3 — `components/layout/MobileLayout.jsx`

### Three changes in this file

**Change 1 — Import `$` and pull `locale`/`setLocale` from context.**

At the top of the file, add the import:

```js
import $ from '../../config/strings'
```

In the component body, destructure `locale` and `setLocale` from `useApp()`:

```js
const { connectivity, toggleConnectivity, currentUser, logout, notifications, locale, setLocale } = useApp()
```

**Change 2 — Add the language toggle button.**

In the **mobile header** `top-actions` div (it currently has the badge, the "Alerts" button, and the avatar), add the toggle button between the badge and the Alerts button:

```jsx
<button
  type="button"
  className="icon-btn"
  onClick={() => setLocale(prev => prev === 'en' ? 'bn' : 'en')}
  style={{ fontSize: '12px', width: 'auto', padding: '0 8px' }}
>
  {$('LANG_TOGGLE', locale)}
</button>
```

Do the exact same thing in the **desktop header** `top-actions` div.

**Change 3 — Translate hardcoded text in the layout itself.**

Replace every hardcoded string in `MobileLayout.jsx`:

| Current hardcoded text            | Replace with                           |
| --------------------------------- | -------------------------------------- |
| `'Online'` (in badge)             | `{$('LAYOUT_ONLINE', locale)}`         |
| `'Offline'` (in badge)            | `{$('LAYOUT_OFFLINE', locale)}`        |
| `'Syncing'` (in badge)            | `{$('LAYOUT_SYNCING', locale)}`        |
| `'Alerts'` (button)               | `{$('LAYOUT_ALERTS_BTN', locale)}`     |
| `'Logout'` (sidebar button)       | `{$('LAYOUT_LOGOUT_BTN', locale)}`     |
| `'Respond'` (SOS toast button)    | `{$('LAYOUT_RESPOND_BTN', locale)}`    |
| `'Maternal Health Worker Portal'` | `{$('LAYOUT_PORTAL_WORKER', locale)}`  |
| `'Patient Portal'`                | `{$('LAYOUT_PORTAL_PATIENT', locale)}` |

The muted subtitle under the desktop header page title:
```jsx
// BEFORE:
<p className="muted">PulseGuard AI: {currentUser?.role === 'worker' ? 'Maternal Health Worker Portal' : 'Patient Portal'}</p>

// AFTER:
<p className="muted">PulseGuard AI: {currentUser?.role === 'worker' ? $('LAYOUT_PORTAL_WORKER', locale) : $('LAYOUT_PORTAL_PATIENT', locale)}</p>
```

---

## Phase 4 — `components/layout/AdminLayout.jsx`

Admin page *content* is not translated. But the layout chrome (header, sidebar) gets the toggle button.

**Change 1 — Import `$` and pull `locale`/`setLocale`:**

```js
import $ from '../../config/strings'
```

```js
const { connectivity, currentUser, logout, locale, setLocale } = useApp()
```

**Change 2 — Add toggle button to the admin header `top-actions` div:**

```jsx
<button
  type="button"
  className="icon-btn"
  onClick={() => setLocale(prev => prev === 'en' ? 'bn' : 'en')}
  style={{ fontSize: '12px', width: 'auto', padding: '0 12px' }}
>
  {$('LANG_TOGGLE', locale)}
</button>
```

**Change 3 — Translate the Online/Offline/Syncing badges in the admin header:**

```jsx
{connectivity === 'online' && $('LAYOUT_ONLINE', locale)}
{connectivity === 'offline' && $('LAYOUT_OFFLINE', locale)}
{connectivity === 'syncing' && $('LAYOUT_SYNCING', locale)}
```

---

## Phase 5 — Auth Pages

### `pages/Splash.jsx`

Add import at top:
```js
import $ from '../config/strings'
import { useState } from 'react'
```

Add locale state (Splash has no `useApp` call yet — it's a public page so it should read from `localStorage` directly, not from context, to avoid requiring `AppProvider` on the root):

```js
const locale = localStorage.getItem('pg_locale') || 'en'
```

Replace every hardcoded string:

```jsx
// h1
{$('SPLASH_HEADLINE', locale)}

// p (subline)
{$('SPLASH_SUBLINE', locale)}

// Link (CTA)
{$('SPLASH_CTA', locale)}

// h4 (disclaimer title)
{$('SPLASH_DISCLAIMER_TITLE', locale)}

// p (disclaimer body — note: remove <strong>not</strong> hardcode, move "not" into the string)
{$('SPLASH_DISCLAIMER_BODY', locale)}
```

> The disclaimer currently has `it does <strong>not</strong> replace...` — the Bangla string handles this naturally without needing bold. For English, since the string now contains the full sentence, remove the `<strong>` wrapper or keep it as a static `<strong>not</strong>` inserted separately. The simplest approach: keep the string as-is and just not use `<strong>`. The meaning is still clear.

### `pages/RoleSelection.jsx`

Add import:
```js
import $ from '../config/strings'
```

Add locale read:
```js
const locale = localStorage.getItem('pg_locale') || 'en'
```

Convert the `roles` array from a static constant to a computed value inside the component using `locale`:

```js
export default function RoleSelection() {
  const locale = localStorage.getItem('pg_locale') || 'en'

  const roles = [
    {
      icon: '',
      title: $('ROLE_PATIENT_TITLE', locale),
      desc: $('ROLE_PATIENT_DESC', locale),
      to: '/login/patient',
    },
    {
      icon: '',
      title: $('ROLE_WORKER_TITLE', locale),
      desc: $('ROLE_WORKER_DESC', locale),
      to: '/login/worker',
    },
    {
      icon: '',
      title: $('ROLE_ADMIN_TITLE', locale),
      desc: $('ROLE_ADMIN_DESC', locale),
      to: '/login/admin',
    },
  ]
  // ... rest of component
```

Replace JSX strings:
```jsx
// h1
{$('ROLE_HEADING', locale)}
// p
{$('ROLE_SUBHEADING', locale)}
// span inside each role card
{$('ROLE_CONTINUE', locale)}
// Link at bottom
{$('ROLE_BACK', locale)}
```

### `pages/Login.jsx`

Add import:
```js
import $ from '../config/strings'
```

Pull locale from `useApp()` — Login IS inside the provider because it's accessed after navigation:
```js
const { login, locale } = useApp()
```

Replace every hardcoded string:

```jsx
// h2
{$('LOGIN_HEADING', locale)}

// p (sign in as ...)
{$('LOGIN_SUBHEADING_PREFIX', locale)} <strong>{roleLabel}</strong> {$('LOGIN_SUBHEADING_SUFFIX', locale)}

// label
{$('LOGIN_LABEL_EMAIL', locale)}
// input placeholder
placeholder={$('LOGIN_PH_EMAIL', locale)}

// label
{$('LOGIN_LABEL_PASSWORD', locale)}
// input placeholder
placeholder={$('LOGIN_PH_PASSWORD', locale)}

// submit button
{submitting ? $('LOGIN_BTN_LOADING', locale) : $('LOGIN_BTN', locale)}

// error div prefix
{$('LOGIN_ERR_PREFIX', locale)} {error}

// Link (create account)
{$('LOGIN_LINK_REGISTER', locale)}

// Link (change role)
{$('LOGIN_LINK_CHANGE_ROLE', locale)}
```

### `pages/Register.jsx`

Add import:
```js
import $ from '../config/strings'
```

Pull locale:
```js
const { register, locale } = useApp()
```

Replace every hardcoded string:

```jsx
// h2
{$('REGISTER_HEADING', locale)}

// p
{$('REGISTER_SUBHEADING_PREFIX', locale)} <strong>{roleLabel}</strong> {$('REGISTER_SUBHEADING_SUFFIX', locale)}

// labels and placeholders for all 4 fields — follow same pattern as Login above

// submit button
{submitting ? $('REGISTER_BTN_LOADING', locale) : $('REGISTER_BTN', locale)}

// "Already have an account?" span
{$('REGISTER_ALREADY_HAVE', locale)}

// Sign In link
{$('REGISTER_LINK_SIGNIN', locale)}
```

---

## Phase 6 — Patient Pages

**Every patient page follows this pattern at the top of the component:**

```js
import $ from '../../config/strings'
// ...existing imports...

export default function SomePage() {
  const { locale } = useApp()          // add locale to existing useApp() destructure
  const navItems = patientNavItems(locale)  // call as function now
  // ...
```

### `pages/patient/Dashboard.jsx`

```jsx
// MobileLayout title
title={$('PAGE_TITLE_DASHBOARD', locale)}

// Loading state p
{$('DASH_LOADING', locale)}

// Welcome card (no profile yet)
<h2>{$('DASH_WELCOME_HEADING_PREFIX', locale)} {currentUser?.name?.split(' ')[0] || 'Mother'}!</h2>
<p className="muted">{$('DASH_WELCOME_BODY', locale)}</p>
<button ...>{$('DASH_COMPLETE_PROFILE_BTN', locale)}</button>

// Greeting card (has profile)
<h2>{$('DASH_GREETING_PREFIX', locale)} {patient.name}</h2>
<p className="muted">{$('DASH_WEEK_LABEL', locale)} <strong>{patient.gestational_week || 'N/A'}</strong></p>

// Section header
<h3>{$('DASH_SECTION_QUICK_ACTIONS', locale)}</h3>

// Action cards
<h4>{$('DASH_ACTION_DAILY_TITLE', locale)}</h4>
<p className="muted">{$('DASH_ACTION_DAILY_DESC', locale)}</p>

<h4>{$('DASH_ACTION_AI_TITLE', locale)}</h4>
<p className="muted">{$('DASH_ACTION_AI_DESC', locale)}</p>

<h4>{$('DASH_ACTION_NUTRITION_TITLE', locale)}</h4>
<p className="muted">{$('DASH_ACTION_NUTRITION_DESC', locale)}</p>

<h4>{$('DASH_ACTION_EMERGENCY_TITLE', locale)}</h4>
<p className="muted">{$('DASH_ACTION_EMERGENCY_DESC', locale)}</p>

// Health Summary section
<h3>{$('DASH_SECTION_HEALTH_SUMMARY', locale)}</h3>

// KPI labels
<span className="muted">{$('DASH_KPI_BP', locale)}</span>
<span className="muted">{$('DASH_KPI_WEIGHT', locale)}</span>
<span className="muted">{$('DASH_KPI_TEMP', locale)}</span>
<span className="muted">{$('DASH_KPI_LAST_CHECKUP', locale)}</span>

// "No records" fallback
{latestVitals ? new Date(latestVitals.recorded_at).toLocaleDateString() : $('DASH_KPI_NO_RECORDS', locale)}

// View all records link
{$('DASH_VIEW_ALL_RECORDS', locale)}
```

### `pages/patient/AIChat.jsx`

This page already imports `$`. The fix is:

1. Pull `locale` from `useApp()` instead of hardcoding `"bn"`.
2. Complete all remaining hardcoded strings.

```js
// BEFORE (wrong — hardcoded locale):
const { connectivity } = useApp()
// ...
title={$("AI_SYMPTOM_CHECKER", "bn")}

// AFTER (correct):
const { connectivity, locale } = useApp()
// ...
title={$('PAGE_TITLE_AI_CHAT', locale)}
```

Other replacements:
```jsx
// placeholder
placeholder={$('AI_CHAT_PH', locale)}

// Send button
{$('AI_CHAT_SEND', locale)}

// Error messages in sendMessage function (these are strings set into state, not JSX)
text: response.response || response.reply || $('AI_CHAT_ERR_FAILED', locale)
text: $('AI_CHAT_ERR_OFFLINE', locale)
```

> The `quickChips` array (`['Headache', 'Fever', 'Dizziness', 'Nausea', 'Swelling']`) — these are sent as API messages. **Do not translate them.** The AI model receives them as clinical terms. Leave `quickChips` in English.

### `pages/patient/DailyCheck.jsx`

```jsx
// MobileLayout title
title={$('PAGE_TITLE_DAILY_CHECK', locale)}

// Loading state
{$('DAILY_LOADING', locale)}

// No profile card
{$('DAILY_NO_PROFILE_ICON', locale)}
<h3>{$('DAILY_NO_PROFILE_HEADING', locale)}</h3>
<p className="muted">{$('DAILY_NO_PROFILE_BODY', locale)}</p>
<button ...>{$('DAILY_NO_PROFILE_BTN', locale)}</button>

// Form heading
<h3 className="text-gradient">{$('DAILY_FORM_HEADING', locale)}</h3>
<p className="muted">{currentDateStr}, {$('DAILY_FORM_DATE_PREFIX', locale)} {patientData.patient.gestational_week || 'N/A'}</p>

// Labels and placeholders
<label>{$('DAILY_LABEL_BP', locale)} <input placeholder={$('DAILY_PH_BP', locale)} .../></label>
<label>{$('DAILY_LABEL_WEIGHT', locale)} <input placeholder={$('DAILY_PH_WEIGHT', locale)} .../></label>
<label>{$('DAILY_LABEL_TEMP', locale)} <input placeholder={$('DAILY_PH_TEMP', locale)} .../></label>
<label>{$('DAILY_LABEL_PULSE', locale)} <input placeholder={$('DAILY_PH_PULSE', locale)} .../></label>
<label>{$('DAILY_LABEL_SYMPTOMS', locale)} <input placeholder={$('DAILY_PH_SYMPTOMS', locale)} .../></label>

// Buttons
{saving ? $('DAILY_BTN_SAVING', locale) : $('DAILY_BTN_SAVE', locale)}
{$('DAILY_BTN_SAVE_OFFLINE', locale)}

// Error and success strings (these are set with setError / setSuccess — replace the string literals)
setSuccess($('DAILY_SUCCESS_OFFLINE', locale))
setError($('DAILY_ERR_NO_PROFILE', locale))
setError($('DAILY_ERR_BP_REQUIRED', locale))
setError($('DAILY_ERR_BP_FORMAT', locale))
setError($('DAILY_ERR_BP_RANGE', locale))
setError($('DAILY_ERR_PULSE_RANGE', locale))
setError($('DAILY_ERR_NETWORK', locale))
setError($('DAILY_ERR_SAVE_LOCAL', locale))
```

> **Important for `setError`/`setSuccess` calls:** These are inside `handleSave`, not in JSX. `locale` is in scope from `useApp()` at the top of the component, so `$(KEY, locale)` works directly inside the function body.

Also, for the dynamic success message that includes risk level:
```js
// BEFORE:
setSuccess(`Daily check recorded! Risk status: ${res.riskLevel || 'low'}`)
// AFTER — keep the risk level in English as it's a technical value, only translate the prefix:
setSuccess(`${$('DAILY_SUCCESS_PREFIX', locale)}: ${res.riskLevel || 'low'}`)
```
Add these two keys to `strings.js`:
```js
// en
DAILY_SUCCESS_PREFIX: 'Daily check recorded! Risk status',
// bn
DAILY_SUCCESS_PREFIX: 'দৈনিক পরীক্ষা রেকর্ড হয়েছে! ঝুঁকির অবস্থা',
```

### `pages/patient/Emergency.jsx`

The `statusText` is computed from a ternary. Replace the string literals inside it:

```js
const statusText = connectivity === 'online'
  ? alertSent
    ? $('EMERGENCY_STATUS_SENT', locale)
    : gps
      ? `${$('EMERGENCY_STATUS_GPS', locale)} ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`
      : $('EMERGENCY_STATUS_READY', locale)
  : $('EMERGENCY_STATUS_OFFLINE', locale)
```

JSX replacements:
```jsx
title={$('PAGE_TITLE_EMERGENCY', locale)}

<h2>{$('EMERGENCY_HEADING', locale)}</h2>
<p className="muted">{statusText}</p>
<p className="muted">{$('EMERGENCY_BODY', locale)}</p>

// SOS button
{alertSent ? $('EMERGENCY_SOS_SENT', locale) : $('EMERGENCY_SOS_BTN', locale)}

// Action buttons
{loadingGps ? $('EMERGENCY_BTN_GPS_LOADING', locale) : $('EMERGENCY_BTN_GPS', locale)}
{$('EMERGENCY_BTN_NOTIFY', locale)}
{$('EMERGENCY_BTN_CALL', locale)}
```

### `pages/patient/Nutrition.jsx`

The `tags` array and the filter `map` keys are tightly coupled. The tags are used both as display labels and as keys into the `map` objects inside `filterRecommended` and `filterLocal`. **Do not translate the keys used for filtering** — only translate the display labels.

```js
// Keep the logic keys in English
const tagKeys = ['All', 'Iron Rich', 'Protein', 'Calcium', 'Vitamins']

// Map keys to display labels
const tagLabels = {
  'All': $('NUTRITION_TAG_ALL', locale),
  'Iron Rich': $('NUTRITION_TAG_IRON', locale),
  'Protein': $('NUTRITION_TAG_PROTEIN', locale),
  'Calcium': $('NUTRITION_TAG_CALCIUM', locale),
  'Vitamins': $('NUTRITION_TAG_VITAMINS', locale),
}

// selectedTag state stays as English key
const [selectedTag, setSelectedTag] = useState('All')
```

Then in JSX, render the display label but keep the key:
```jsx
{tagKeys.map((tagKey) => (
  <button
    type="button"
    key={tagKey}
    className={`chip ${selectedTag === tagKey ? 'active' : ''}`}
    onClick={() => setSelectedTag(tagKey)}
  >
    {tagLabels[tagKey]}
  </button>
))}
```

Section headings:
```jsx
title={$('PAGE_TITLE_NUTRITION', locale)}
<h3 className="text-gradient">{$('NUTRITION_SECTION_RECOMMENDED', locale)}</h3>
<p className="muted">{$('NUTRITION_SECTION_RECOMMENDED_DESC', locale)}</p>
<p className="muted">{$('NUTRITION_EMPTY_RECOMMENDED', locale)}</p>

<h3 className="text-gradient">{$('NUTRITION_SECTION_AVOID', locale)}</h3>
<p className="muted">{$('NUTRITION_SECTION_AVOID_DESC', locale)}</p>

<h3 className="text-gradient">{$('NUTRITION_SECTION_LOCAL', locale)}</h3>
<p className="muted">{$('NUTRITION_SECTION_LOCAL_DESC', locale)}</p>
<p className="muted">{$('NUTRITION_EMPTY_LOCAL', locale)}</p>
```

> **Do not translate food names** (`food.name`, `food.benefit`, `food.reason`, `food.tag`) — these come from `mockData.js` and are data, not UI strings. Translating mockData is a separate, optional concern.

### `pages/patient/Records.jsx`

```jsx
title={$('PAGE_TITLE_RECORDS', locale)}

<h3 className="text-gradient">{$('RECORDS_HEADING', locale)}</h3>
<button ...>{$('RECORDS_EXPORT_BTN', locale)}</button>

// Loading
<p className="muted">{$('RECORDS_LOADING', locale)}</p>

// Empty
<p className="muted">{$('RECORDS_EMPTY', locale)}</p>

// Record fields
<strong>{$('RECORDS_FIELD_BP', locale)} {rec.bp_systolic}/{rec.bp_diastolic} mmHg</strong>
<span>{$('RECORDS_FIELD_WEIGHT', locale)} {rec.weight_kg ? `${rec.weight_kg} kg` : $('RECORDS_NA', locale)}</span>
<span>{$('RECORDS_FIELD_TEMP', locale)} {rec.temperature_c ? `${rec.temperature_c} °C` : $('RECORDS_NA', locale)}</span>
<span>{$('RECORDS_FIELD_PULSE', locale)} {rec.pulse ? `${rec.pulse} bpm` : $('RECORDS_NA', locale)}</span>
```

### `pages/patient/Alerts.jsx`

```jsx
title={$('PAGE_TITLE_ALERTS', locale)}
<h3 className="text-gradient">{$('ALERTS_HEADING', locale)}</h3>
```

> The demo alert `title` and `message` strings inside `displayAlerts` are static mock data. Leave them in English. Only the page title and section heading are translated.

### `pages/patient/Profile.jsx`

This is the largest patient page. Every section has translatable text.

```jsx
// MobileLayout title
title={$('PAGE_TITLE_PROFILE', locale)}

// Loading
{$('PROFILE_LOADING', locale)}

// Section heading (switches between view and edit)
<h3>{isEditing ? $('PROFILE_SECTION_EDIT', locale) : $('PROFILE_SECTION_DETAILS', locale)}</h3>

// Patient detail labels (view mode)
<span className="profile-detail-label">{$('PROFILE_LABEL_PREG_WEEK', locale)}</span>
<span className="profile-detail-label">{$('PROFILE_LABEL_RISK', locale)}</span>
<span className="profile-detail-label">{$('PROFILE_LABEL_VILLAGE', locale)}</span>
<span className="profile-detail-label">{$('PROFILE_LABEL_PHONE', locale)}</span>
<span className="profile-detail-label">{$('PROFILE_LABEL_EMAIL', locale)}</span>

// Worker labels
<span className="profile-detail-label">{$('PROFILE_LABEL_ASSIGNED_PATIENTS', locale)}</span>

// Admin labels
<span className="profile-detail-label">{$('PROFILE_LABEL_SYSTEM_ROLE', locale)}</span>
<span className="profile-detail-value">{$('PROFILE_LABEL_ADMIN_VALUE', locale)}</span>

// Pending registration
<span className="profile-detail-label">{$('PROFILE_LABEL_PROFILE_STATUS', locale)}</span>
<span className="profile-detail-value">{$('PROFILE_LABEL_PENDING', locale)}</span>
<button ...>{$('PROFILE_BTN_COMPLETE_REG', locale)}</button>

// Edit form labels and placeholders
<label>{$('PROFILE_EDIT_LABEL_NAME', locale)} <input placeholder={$('PROFILE_EDIT_PH_NAME', locale)} .../></label>
<label>{$('PROFILE_EDIT_LABEL_EMAIL', locale)} <input placeholder={$('PROFILE_EDIT_PH_EMAIL', locale)} .../></label>
<label>{$('PROFILE_EDIT_LABEL_PHONE', locale)} <input placeholder={$('PROFILE_EDIT_PH_PHONE', locale)} .../></label>
<label>{$('PROFILE_EDIT_LABEL_VILLAGE', locale)} <input placeholder={$('PROFILE_EDIT_PH_VILLAGE', locale)} .../></label>
<label>{$('PROFILE_EDIT_LABEL_WEEK', locale)} <input placeholder={$('PROFILE_EDIT_PH_WEEK', locale)} .../></label>

// Action buttons
{saving ? $('PROFILE_BTN_SAVING', locale) : $('PROFILE_BTN_SAVE_CHANGES', locale)}
{$('PROFILE_BTN_CANCEL', locale)}
{$('PROFILE_BTN_EDIT', locale)}
{$('PROFILE_BTN_LOGOUT', locale)}

// Error/success strings set in handleSaveProfile
setError($('PROFILE_ERR_NAME_REQUIRED', locale))
setError($('PROFILE_ERR_NAME_LETTERS', locale))
setError($('PROFILE_ERR_PHONE_DIGITS', locale))
setSuccess($('PROFILE_SUCCESS', locale))
```

Also translate the Patient ID and Worker ID display strings:
```jsx
// BEFORE:
<p className="muted">Patient ID: PG-{patient.id.slice(0, 8).toUpperCase()}</p>
<p className="muted">Health Worker ID: HW-{currentUser?.id.slice(0, 8).toUpperCase()}</p>

// AFTER:
<p className="muted">{$('PROFILE_PATIENT_ID_PREFIX', locale)}{patient.id.slice(0, 8).toUpperCase()}</p>
<p className="muted">{$('PROFILE_WORKER_ID_PREFIX', locale)}{currentUser?.id.slice(0, 8).toUpperCase()}</p>
```

Also translate the nav items call — Profile is shared by patient and worker:
```js
// BEFORE:
const navItems = isPatient ? patientNavItems : isWorker ? workerNavItems : []
// AFTER:
const navItems = isPatient ? patientNavItems(locale) : isWorker ? workerNavItems(locale) : []
```

### `pages/patient/Onboarding.jsx`

```jsx
// MobileLayout title
title={$('PAGE_TITLE_ONBOARDING', locale)}

// Welcome card
<h2>{$('ONBOARD_WELCOME_PREFIX', locale)} {currentUser?.name?.split(' ')[0]}!</h2>
<p className="muted">{$('ONBOARD_WELCOME_BODY', locale)}</p>

// Form card heading
<h3>{$('ONBOARD_SECTION_HEADING', locale)}</h3>
<p className="muted">{$('ONBOARD_SECTION_SUBHEADING', locale)}</p>

// Gestational week field
<label>{$('ONBOARD_LABEL_WEEK', locale)}
  <input placeholder={$('ONBOARD_PH_WEEK', locale)} .../>
  <span>{$('ONBOARD_HINT_WEEK', locale)}</span>
</label>

// Age field
<label>{$('ONBOARD_LABEL_AGE', locale)}
  <input placeholder={$('ONBOARD_PH_AGE', locale)} .../>
</label>

// Village field
<label>{$('ONBOARD_LABEL_VILLAGE', locale)}
  <input placeholder={$('ONBOARD_PH_VILLAGE', locale)} .../>
</label>

// Submit button
{saving ? $('ONBOARD_BTN_LOADING', locale) : $('ONBOARD_BTN_SUBMIT', locale)}

// Error messages in handleSubmit
setError($('ONBOARD_ERR_WEEK_REQUIRED', locale))
setError($('ONBOARD_ERR_WEEK_RANGE', locale))
```

---

## Phase 7 — Worker Pages

Every worker page has a locally-defined `workerNavItems` array — a copy-paste of the same array. All of them need to be replaced with the function call from `data/navItems.js`.

**At the top of every worker page, replace:**
```js
// REMOVE this block (it appears at the top of every worker file):
const workerNavItems = [
  { label: 'Home', to: '/worker/dashboard', icon: '' },
  { label: 'Patients', to: '/worker/patients', icon: '' },
  ...
]

// ADD this import (if not already present):
import { workerNavItems } from '../../data/navItems'
```

**In the component body, add locale and call navItems as function:**
```js
const { locale } = useApp()  // add to existing useApp() call
// then in JSX:
navItems={workerNavItems(locale)}
```

### `pages/worker/Dashboard.jsx`

The locally-defined `workerNavItems` at the top of this file must be deleted and replaced with the import.

```jsx
// MobileLayout
title={$('W_PAGE_TITLE_DASHBOARD', locale)}

// Banner (these are passed as props — translate inline)
banner={{
  tone: 'syncing',
  title: $('W_DASH_BANNER_TITLE', locale),
  message: `${total} ${$('W_DASH_PATIENTS_SUFFIX', locale)}`,    // "5 patients assigned"
  action: { label: $('W_DASH_BANNER_ACTION', locale), onClick: () => navigate('/worker/sync') },
}}

// Greeting
<h2>{$('W_DASH_GREETING_PREFIX', locale)} {currentUser?.name || $('W_DASH_GREETING_DEFAULT', locale)}</h2>
<p className="muted">
  {loading
    ? $('W_DASH_LOADING', locale)
    : `${$('W_DASH_PATIENTS_SUFFIX_START', locale)} ${total} ${$('W_DASH_PATIENTS_SUFFIX', locale)}, ${$('W_DASH_INCL_PREFIX', locale)} ${highRisk} ${$('W_DASH_HIGH_RISK_CASES', locale)}`}
</p>
```

> The greeting message `"You have 5 patients assigned, including 2 high risk cases today."` is complex to translate word-for-word because Bangla sentence structure differs. Use a simpler template approach — store the whole sentence as a translated string with placeholders that you fill in:

```js
// Add to strings.js:
// en:
W_DASH_SUMMARY: (total, highRisk, caseWord) => `You have ${total} patients assigned, including ${highRisk} ${caseWord} today.`
// bn:
W_DASH_SUMMARY: (total, highRisk) => `আপনার ${total} জন রোগী নির্ধারিত, যার মধ্যে ${highRisk} জন উচ্চ ঝুঁকির রোগী আজকে।`
```

However, since `$` is a simple key-value lookup (it cannot hold functions per your teammate's format constraint), the safest approach is to build the sentence from parts:

```js
// In strings.js (both en and bn), add:
// en:
W_DASH_SUMMARY_A: 'You have',
W_DASH_SUMMARY_B: 'patients assigned, including',
W_DASH_SUMMARY_C: 'today.',
// bn:
W_DASH_SUMMARY_A: 'আপনার',
W_DASH_SUMMARY_B: 'জন রোগী নির্ধারিত, এর মধ্যে',
W_DASH_SUMMARY_C: 'জন উচ্চ ঝুঁকির রোগী আজকে।',
```

Then construct:
```jsx
`${$('W_DASH_SUMMARY_A', locale)} ${total} ${$('W_DASH_SUMMARY_B', locale)} ${highRisk} ${$('W_DASH_HIGH_RISK_CASES', locale)} ${$('W_DASH_SUMMARY_C', locale)}`
```

KPI cards:
```jsx
<h3>{$('W_DASH_KPI_HEADING', locale)}</h3>
<p className="stat-card-label">{$('W_DASH_KPI_TOTAL', locale)}</p>
<p className="stat-card-label">{$('W_DASH_KPI_HIGH', locale)}</p>
<p className="stat-card-label">{$('W_DASH_KPI_MODERATE', locale)}</p>
<p className="stat-card-label">{$('W_DASH_KPI_LOW', locale)}</p>
```

Quick Actions:
```jsx
<h3>{$('W_DASH_SECTION_QUICK', locale)}</h3>
<Link ...>{$('W_DASH_QUICK_PATIENTS', locale)}</Link>
<Link ...>{$('W_DASH_QUICK_AI', locale)}</Link>
<Link ...>{$('W_DASH_QUICK_SYNC', locale)}</Link>
```

High Risk section:
```jsx
<h3>{$('W_DASH_SECTION_HIGH_RISK', locale)}</h3>
<span className="muted">{highRisk} {$('W_DASH_HIGH_RISK_SUFFIX', locale)}</span>
// Loading:
{$('W_DASH_LOADING_LIST', locale)}
// Empty:
{$('W_DASH_NO_HIGH_RISK', locale)}
// View button:
<Link ...>{$('W_DASH_VIEW_BTN', locale)}</Link>
```

### `pages/worker/PatientList.jsx`

Delete the local `workerNavItems` array, import from `data/navItems`.

The `filters` array needs the same English-key / display-label split as Nutrition tags:

```js
const filterKeys = ['All', 'High Risk', 'Moderate', 'Low Risk']
const filterLabels = {
  'All': $('W_PATIENTS_FILTER_ALL', locale),
  'High Risk': $('W_PATIENTS_FILTER_HIGH', locale),
  'Moderate': $('W_PATIENTS_FILTER_MODERATE', locale),
  'Low Risk': $('W_PATIENTS_FILTER_LOW', locale),
}
```

The filter logic (`if (activeFilter === 'High Risk')` etc.) stays in English — it compares against `activeFilter` which is set to the key string, not the display label.

```jsx
title={$('W_PAGE_TITLE_PATIENTS', locale)}

<input placeholder={$('W_PATIENTS_SEARCH_PH', locale)} .../>

{filterKeys.map((key) => (
  <button key={key} className={`chip${activeFilter === key ? ' active' : ''}`} onClick={() => setActiveFilter(key)}>
    {filterLabels[key]}
  </button>
))}

<h3>{$('W_PATIENTS_HEADING', locale)}</h3>
<span className="muted">{filtered.length} {$('W_PATIENTS_RESULTS_SUFFIX', locale)}</span>

// Loading
{$('W_PATIENTS_LOADING', locale)}

// Each patient row
<p className="muted">{$('W_PATIENTS_WEEK_PREFIX', locale)} {patient.gestational_week || '—'} • {patient.village || $('W_PATIENTS_UNKNOWN', locale)}</p>
<Link ...>{$('W_PATIENTS_VIEW_BTN', locale)}</Link>

// Empty state
{$('W_PATIENTS_EMPTY', locale)}
```

### `pages/worker/PatientDetails.jsx`

Delete the local `workerNavItems` array, import from `data/navItems`.

The `tabs` array is used both for display and as the `activeTab` comparison value. Use the same English-key pattern:

```js
const tabKeys = ['Overview', 'Vitals', 'AI Insights', 'History']
const tabLabels = {
  'Overview': $('W_DETAILS_TAB_OVERVIEW', locale),
  'Vitals': $('W_DETAILS_TAB_VITALS', locale),
  'AI Insights': $('W_DETAILS_TAB_AI', locale),
  'History': $('W_DETAILS_TAB_HISTORY', locale),
}
```

Tab buttons:
```jsx
{tabKeys.map((tabKey) => (
  <button key={tabKey} className={`tab${activeTab === tabKey ? ' active' : ''}`} onClick={() => setActiveTab(tabKey)}>
    {tabLabels[tabKey]}
  </button>
))}
```

All remaining JSX strings:
```jsx
title={$('W_PAGE_TITLE_PATIENT_DETAILS', locale)}

// Loading / not found
{$('W_DETAILS_LOADING', locale)}
{$('W_DETAILS_NOT_FOUND', locale)}

// Patient header
<p className="muted">{$('W_DETAILS_AGE_PREFIX', locale)} {patient.age || '—'} • {$('W_DETAILS_WEEK_PREFIX', locale)} {patient.gestational_week || '—'}</p>

// Overview tab
<p className="muted">{$('W_DETAILS_PREG_WEEK', locale)}</p>
{riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} {$('W_DETAILS_RISK_SUFFIX', locale)}
<p className="muted">{$('W_DETAILS_BP', locale)}</p>
<p className="muted">{$('W_DETAILS_WEIGHT', locale)}</p>
<p className="muted">{$('W_DETAILS_PULSE', locale)}</p>
<p className="muted">{$('W_DETAILS_TEMPERATURE', locale)}</p>
<strong>{$('W_DETAILS_HIGH_RISK_ALERT', locale)}</strong>

// Vitals tab
<h4>{$('W_DETAILS_VITALS_HEADING', locale)}</h4>
{$('W_DETAILS_VITALS_EMPTY', locale)}

// AI Insights tab
<h4>{$('W_DETAILS_AI_HEADING', locale)}</h4>
<p className="muted">{$('W_DETAILS_AI_RISK_SCORE', locale)}</p>
<strong style={{ color: '#ef4444' }}>{$('W_DETAILS_AI_PREECLAMPSIA_TITLE', locale)}</strong>
<p className="muted">{$('W_DETAILS_AI_PREECLAMPSIA_BODY', locale)}</p>
<p className="muted">{$('W_DETAILS_AI_MODEL_PREFIX', locale)} {aiResult?.model || $('W_DETAILS_AI_NOT_YET', locale)} • {$('W_DETAILS_AI_MODEL_SUFFIX', locale)}</p>

// History tab
<h4>{$('W_DETAILS_HISTORY_HEADING', locale)}</h4>
{$('W_DETAILS_HISTORY_EMPTY', locale)}
<span className="badge badge--online">{$('W_DETAILS_HISTORY_COMPLETE', locale)}</span>
<p className="muted">{patient.village || 'Village'} • {$('W_DETAILS_HISTORY_VILLAGE_PREFIX', locale)} {v.recorded_by_name || 'Worker'}</p>
<p className="muted">{$('W_DETAILS_HISTORY_WORKER_PREFIX', locale)} {patient.worker_name || '—'}</p>

// Action buttons
<Link ...>{$('W_DETAILS_BTN_RECORD_VITALS', locale)}</Link>
<button ...>{$('W_DETAILS_BTN_RUN_AI', locale)}</button>
```

### `pages/worker/VitalsEntry.jsx`

Delete the local `workerNavItems` array, import from `data/navItems`.

```jsx
title={$('W_PAGE_TITLE_VITALS', locale)}
<h3>{$('W_VITALS_HEADING', locale)}</h3>

// Patient select
<label>{$('W_VITALS_LABEL_PATIENT', locale)}
  <select ...><option value="">{$('W_VITALS_PH_PATIENT', locale)}</option>...</select>
</label>

// Field labels
<label>{$('W_VITALS_LABEL_SYSTOLIC', locale)} ...</label>
<label>{$('W_VITALS_LABEL_DIASTOLIC', locale)} ...</label>
<label>{$('W_VITALS_LABEL_WEIGHT', locale)} ...</label>
<label>{$('W_VITALS_LABEL_PULSE', locale)} ...</label>
<label>{$('W_VITALS_LABEL_TEMP', locale)} ...</label>
<label>{$('W_VITALS_LABEL_SYMPTOMS', locale)}
  <input placeholder={$('W_VITALS_PH_SYMPTOMS', locale)} .../>
</label>

// Success message
<strong style={{ color: 'var(--color-success)' }}>{$('W_VITALS_SUCCESS', locale)}</strong>

// Buttons
{saving ? $('W_VITALS_BTN_SAVING', locale) : $('W_VITALS_BTN_SAVE', locale)}
<button ...>{$('W_VITALS_BTN_BACK', locale)}</button>

// Errors in handleSave
setError($('W_VITALS_ERR_REQUIRED', locale))
setError($('W_VITALS_ERR_NETWORK', locale))
```

### `pages/worker/AIAnalysis.jsx`

Delete the local `workerNavItems` array, import from `data/navItems`.

```jsx
title={$('W_PAGE_TITLE_AI', locale)}
<h3>{$('W_AI_HEADING', locale)}</h3>

<label>{$('W_AI_LABEL_SELECT', locale)}
  <select ...><option value="">{$('W_AI_PH_SELECT', locale)}</option>...</select>
</label>

{analyzing ? $('W_AI_BTN_ANALYZING', locale) : $('W_AI_BTN_ANALYZE', locale)}

// Prediction section
<h3>{$('W_AI_RISK_HEADING_PREFIX', locale)} {selectedName}</h3>
<p className="muted">{$('W_AI_RISK_SCORE_LABEL', locale)}</p>
<strong style={{ color: '#ef4444' }}>{$('W_AI_PREECLAMPSIA_TITLE', locale)}</strong>
<p className="muted">{$('W_AI_PREECLAMPSIA_BODY', locale)}</p>
<p className="muted">{$('W_AI_FACTORS_LABEL', locale)}</p>
<p className="muted">{$('W_AI_MODEL_PREFIX', locale)} {prediction.model}</p>

// Summary section
<h3>{$('W_AI_SUMMARY_HEADING', locale)}</h3>
<strong>{$('W_AI_SUMMARY_LABEL', locale)}</strong>
<h4>{$('W_AI_RECOMMENDATIONS_HEADING', locale)}</h4>
<p className="muted">{$('W_AI_SOURCES_PREFIX', locale)} {summary.sources.join(', ')}</p>
```

### `pages/worker/Alerts.jsx`

Delete the local `workerNavItems` array, import from `data/navItems`.

```jsx
title={$('W_PAGE_TITLE_ALERTS', locale)}

<h3>{$('W_ALERTS_ACTIVE_HEADING', locale)}</h3>
<span className="badge badge--high">{activeAlerts.length} {$('W_ALERTS_ACTIVE_BADGE_SUFFIX', locale)}</span>

// Loading
{$('W_ALERTS_LOADING', locale)}

// All quiet
{$('W_ALERTS_ALL_QUIET', locale)}

// Each active alert
<span>{$('W_ALERTS_TRIGGERED_PREFIX', locale)}</span> {new Date(alert.created_at).toLocaleString()}

// Location
<span style={{ color: 'var(--color-primary-light)' }}>{$('W_ALERTS_LOCATION_LABEL', locale)}</span>
<a ...>{$('W_ALERTS_MAP_LINK', locale)} (...)</a>

// Buttons
{$('W_ALERTS_BTN_RESOLVE', locale)}
{$('W_ALERTS_BTN_DISMISS', locale)}

// History section
<h3>{$('W_ALERTS_HISTORY_HEADING', locale)}</h3>
{$('W_ALERTS_HISTORY_EMPTY', locale)}
```

### `pages/worker/SyncCenter.jsx`

Delete the local `workerNavItems` array, import from `data/navItems`.

```jsx
title={$('W_PAGE_TITLE_SYNC', locale)}

// Banner
banner={{
  tone: connectivity === 'online' ? 'online' : 'offline',
  title: $('W_SYNC_BANNER_TITLE', locale),
  message: connectivity === 'online' ? $('W_SYNC_BANNER_ONLINE', locale) : $('W_SYNC_BANNER_OFFLINE', locale),
  action: { label: $('W_SYNC_BANNER_REFRESH', locale), onClick: loadConflicts },
}}

// Stats
<p className="muted">{$('W_SYNC_STAT_STATUS', locale)}</p>
<div className="kpi">{connectivity === 'online' ? $('W_SYNC_STATUS_ONLINE', locale) : $('W_SYNC_STATUS_OFFLINE', locale)}</div>
<p className="muted">{$('W_SYNC_STAT_CONFLICTS', locale)}</p>

// Connection section
<h3>{$('W_SYNC_CONN_HEADING', locale)}</h3>
{connectivity === 'online' && $('W_SYNC_STATUS_ONLINE', locale)}
{connectivity === 'offline' && $('W_SYNC_STATUS_OFFLINE', locale)}
<p className="muted">{connectivity === 'online' ? $('W_SYNC_CONN_SYNCED', locale) : $('W_SYNC_CONN_WAITING', locale)}</p>

// Conflicts section
<h3>{$('W_SYNC_CONFLICTS_HEADING_PREFIX', locale)}{conflicts ? conflicts.length : 0}{$('W_SYNC_CONFLICTS_HEADING_SUFFIX', locale)}</h3>
{$('W_SYNC_CONFLICTS_LOADING', locale)}
{$('W_SYNC_CONFLICTS_EMPTY', locale)}

// Diff view
<h4>{$('W_SYNC_DIFF_LOCAL', locale)}</h4>
<h4>{$('W_SYNC_DIFF_SERVER', locale)}</h4>

// Buttons
{$('W_SYNC_BTN_KEEP_LOCAL', locale)}
{$('W_SYNC_BTN_KEEP_SERVER', locale)}
```

---

## Phase 8 — Final Verification Checklist

Run through this before calling the implementation done.

### Code checks (read through each file after changes)

- [ ] Every `import { patientNavItems }` and `import { workerNavItems }` in every file is calling `patientNavItems(locale)` / `workerNavItems(locale)` — not just `patientNavItems`
- [ ] `workerNavItems` local array definition (the copy-paste block at the top of each worker page) has been **deleted** from all 7 worker pages: `Dashboard.jsx`, `PatientList.jsx`, `PatientDetails.jsx`, `VitalsEntry.jsx`, `AIAnalysis.jsx`, `Alerts.jsx`, `SyncCenter.jsx`
- [ ] `AIChat.jsx` no longer has `$("AI_SYMPTOM_CHECKER", "bn")` — it uses the locale from context
- [ ] `Profile.jsx` handles the nav correctly: `isPatient ? patientNavItems(locale) : isWorker ? workerNavItems(locale) : []`
- [ ] `AppContext.jsx` value object includes both `locale` and `setLocale`
- [ ] `strings.js` has no key in `'bn'` that is missing from `'en'` (and vice versa)
- [ ] The `$` fallback chain is: `strings[locale]?.[item] ?? strings['en'][item] ?? item`
- [ ] `Splash.jsx` and `RoleSelection.jsx` read locale from `localStorage` directly (they may render before `AppProvider` children are set up, so `useApp()` would throw)
- [ ] All other pages use `const { locale } = useApp()`
- [ ] The language toggle button appears in both the mobile header AND the desktop header in `MobileLayout.jsx`
- [ ] The language toggle button appears in `AdminLayout.jsx` header

### Functional checks (test in browser)

- [ ] Toggle from English to Bangla — entire UI switches on every page
- [ ] Refresh the browser — language choice persists
- [ ] Toggle back to English — works correctly
- [ ] AI Chat page title shows translated text
- [ ] Daily Check form labels and placeholders are translated
- [ ] Worker nav labels (Home, Patients, AI, Sync, Profile) translate
- [ ] Patient nav labels (Home, AI Chat, Health, Alerts, Profile) translate
- [ ] Nutrition filter tags display correctly in Bangla but filtering still works
- [ ] Patient List filter chips display correctly in Bangla but filtering still works
- [ ] Patient Details tabs display correctly in Bangla but tab switching still works
- [ ] Error messages in DailyCheck are translated when triggered
- [ ] Error messages in Profile edit are translated when triggered
- [ ] Emergency SOS status text translates correctly in all three states
- [ ] Admin pages: toggle button appears, connectivity badge translates, page content stays English

---

## Key Architectural Decisions (Why These Choices)

| Decision                                    | Reason                                                       |
| ------------------------------------------- | ------------------------------------------------------------ |
| `locale` in `AppContext`, not a new context | Teammate's explicit instruction: "onno kono context use korba na" |
| `localStorage` for persistence              | No backend change needed; survives page refresh              |
| `navItems` as functions, not arrays         | Arrays are evaluated at module load time, outside React — they cannot call `useApp()`. Functions are called inside components where `locale` is available |
| English keys in filter/tab logic            | Bangla display labels and English comparison values must be separated to avoid breaking `activeFilter === 'High Risk'` checks |
| Auth pages read `localStorage` directly     | `Splash` and `RoleSelection` are rendered inside `<Routes>` but may be the first component to mount — safer to read from storage than assume `useApp()` is available |
| Fallback chain in `$`                       | `strings[locale]?.[item] ?? strings['en'][item] ?? item` prevents blank UI if a Bangla string is accidentally missing |
| Food names / quick chips not translated     | These are data or clinical API terms — translating them would break AI model input or require mockData rewrite |