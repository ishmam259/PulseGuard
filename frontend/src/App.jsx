import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'

// Auth pages
import Splash from './pages/Splash'
import RoleSelection from './pages/RoleSelection'
import Login from './pages/Login'
import Register from './pages/Register'

// Patient pages
import PatientDashboard from './pages/patient/Dashboard'
import PatientChat from './pages/patient/AIChat'
import DailyHealthCheck from './pages/patient/DailyCheck'
import NutritionPlan from './pages/patient/Nutrition'
import EmergencySOS from './pages/patient/Emergency'
import PatientRecords from './pages/patient/Records'
import PatientAlerts from './pages/patient/Alerts'
import PatientProfile from './pages/patient/Profile'

// Worker pages
import WorkerDashboard from './pages/worker/Dashboard'
import WorkerPatientList from './pages/worker/PatientList'
import WorkerPatientDetails from './pages/worker/PatientDetails'
import WorkerVitalsEntry from './pages/worker/VitalsEntry'
import WorkerAIAnalysis from './pages/worker/AIAnalysis'
import SyncCenter from './pages/worker/SyncCenter'
import WorkerAlerts from './pages/worker/Alerts'


// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminPatients from './pages/admin/Patients'
import AdminAnalytics from './pages/admin/Analytics'
import AdminReports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'
import AdminUsers from './pages/admin/Users'

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Auth — public */}
        <Route path="/" element={<Splash />} />
        <Route path="/role" element={<RoleSelection />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/register/:role" element={<Register />} />

        {/* Patient — protected */}
        <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/ai-chat" element={<ProtectedRoute allowedRoles={['patient']}><PatientChat /></ProtectedRoute>} />
        <Route path="/patient/daily-check" element={<ProtectedRoute allowedRoles={['patient']}><DailyHealthCheck /></ProtectedRoute>} />
        <Route path="/patient/nutrition" element={<ProtectedRoute allowedRoles={['patient']}><NutritionPlan /></ProtectedRoute>} />
        <Route path="/patient/emergency" element={<ProtectedRoute allowedRoles={['patient']}><EmergencySOS /></ProtectedRoute>} />
        <Route path="/patient/records" element={<ProtectedRoute allowedRoles={['patient']}><PatientRecords /></ProtectedRoute>} />
        <Route path="/patient/alerts" element={<ProtectedRoute allowedRoles={['patient']}><PatientAlerts /></ProtectedRoute>} />
        <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['patient']}><PatientProfile /></ProtectedRoute>} />

        {/* Worker — protected */}
        <Route path="/worker/dashboard" element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/worker/patients" element={<ProtectedRoute allowedRoles={['worker']}><WorkerPatientList /></ProtectedRoute>} />
        <Route path="/worker/patient/:id" element={<ProtectedRoute allowedRoles={['worker', 'admin']}><WorkerPatientDetails /></ProtectedRoute>} />
        <Route path="/worker/vitals/:patientId" element={<ProtectedRoute allowedRoles={['worker']}><WorkerVitalsEntry /></ProtectedRoute>} />
        <Route path="/worker/vitals" element={<ProtectedRoute allowedRoles={['worker']}><WorkerVitalsEntry /></ProtectedRoute>} />
        <Route path="/worker/ai-analysis" element={<ProtectedRoute allowedRoles={['worker']}><WorkerAIAnalysis /></ProtectedRoute>} />
        <Route path="/worker/sync" element={<ProtectedRoute allowedRoles={['worker']}><SyncCenter /></ProtectedRoute>} />
        <Route path="/worker/alerts" element={<ProtectedRoute allowedRoles={['worker']}><WorkerAlerts /></ProtectedRoute>} />
        <Route path="/worker/profile" element={<ProtectedRoute allowedRoles={['worker']}><PatientProfile /></ProtectedRoute>} />


        {/* Admin — protected */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={['admin']}><AdminPatients /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
