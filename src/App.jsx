import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import PublicPortfolio from "./pages/portfolio/PublicPortfolio";
import NotFound from "./pages/NotFound";

// Dashboard
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Profile from "./pages/dashboard/Profile";
import Projects from "./pages/dashboard/Projects";
import Skills from "./pages/dashboard/Skills";
import Achievements from "./pages/dashboard/Achievements";
import Customize from "./pages/dashboard/Customize";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  const { currentUser } = useAuth();
  
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/portfolio/:username" element={<PublicPortfolio />} />
      
      {/* Auth Pages */}
      <Route path="/login" element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={currentUser ? <Navigate to="/dashboard" replace /> : <Signup />} />
      
      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/profile" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="projects" element={<Projects />} />
          <Route path="skills" element={<Skills />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="customize" element={<Customize />} />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)'
            }
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
