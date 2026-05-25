import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import RealtimeNotifications from "./components/RealtimeNotifications";
import Dashboard from "./pages/Dashboard";
import FormateurAbsences from "./pages/FormateurAbsences";
import FormateurDashboard from "./pages/FormateurDashboard";
import FormateurNotes from "./pages/FormateurNotes";
import StagiaireAbsences from "./pages/StagiaireAbsences";
import StagiaireDashboard from "./pages/StagiaireDashboard";
import StagiaireNotes from "./pages/StagiaireNotes";
import Unauthorized from "./pages/Unauthorized";
import Groupes from "./pages/Groupes.js";
import Login from "./pages/login.js";
import Modules from "./pages/Modules.js";
import Notes from "./pages/Notes.js";
import Register from "./pages/Register";
import Stagiaires from "./pages/Stagiaires.js";
import Absences from "./pages/Absences.js";
import { getDashboardPathByRole, getStoredRoleId } from "./utils/auth";

function DashboardRedirect() {
  const roleId = getStoredRoleId();

  if (!roleId) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={getDashboardPathByRole(roleId)} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        hideProgressBar={false}
      />
      <RealtimeNotifications />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/formateur/dashboard"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <FormateurDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/formateur/notes"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <FormateurNotes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/formateur/absences"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <FormateurAbsences />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stagiaire/dashboard"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <StagiaireDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stagiaire/notes"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <StagiaireNotes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stagiaire/absences"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <StagiaireAbsences />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/stagiaires"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <Stagiaires />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groupes"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <Groupes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modules"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <Modules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/absences"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <Absences />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <Notes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
