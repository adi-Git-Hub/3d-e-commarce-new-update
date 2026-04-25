import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";

// Components
import IntroLoader from "./components/IntroLoader";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import SunsetDriveScene from "./components/ui/SunsetDriveScene";

// Public Pages
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import SetRegisterPassword from "./pages/SetRegisterPassword";
import ForgotPassword from "./pages/ForgotPassword";
import ForgotPasswordOTP from "./pages/ForgotPasswordOTP";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SuccessPage from "./pages/SuccessPage";

// Protected Pages
import Profile from "./pages/Profile";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Booking from "./pages/Booking";
import Buy from "./pages/Buy";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAddCar from "./pages/AdminAddCar";

// ── Landing Wrapper ──────────────────────
// Dynamically switches between Landing and Showroom (Home) based on URL hash.
function LandingWrapper() {
  const { hash } = useLocation();
  
  // If the user lands on #main-content (e.g., after login), show the showroom.
  if (hash === "#main-content") {
    return <Home />;
  }
  
  // Default cinematic landing page.
  return <Landing />;
}

function App() {
  const [showIntro, setShowIntro] = useState(null);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("introPlayed");
    if (!hasPlayed) {
      setShowIntro(true);
    } else {
      setShowIntro(false);
    }
  }, []);

  if (showIntro === null) return null;

  return (
    <>
      {showIntro && <IntroLoader onComplete={() => setShowIntro(false)} />}
      
      {!showIntro && (
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<LandingWrapper />} />
          <Route path="/intro" element={<SunsetDriveScene />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/success" element={<SuccessPage />} />

          {/* Auth Routes (Public) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/set-register-password" element={<SetRegisterPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-password-otp" element={<ForgotPasswordOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/payment-success" element={<SuccessPage />} />

          {/* ================= PROTECTED ROUTES (USER) ================= */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cars"
            element={
              <ProtectedRoute>
                <Cars />
              </ProtectedRoute>
            }
          />
          <Route
            path="/car/:slug"
            element={
              <ProtectedRoute>
                <CarDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:slug"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buy/:slug"
            element={
              <ProtectedRoute>
                <Buy />
              </ProtectedRoute>
            }
          />

          {/* ================= ADMIN ROUTES ================= */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/add-car"
            element={
              <AdminRoute>
                <AdminAddCar />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/manage-cars"
            element={
              <AdminRoute>
                <div>Manage Cars</div>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <div>Bookings</div>
              </AdminRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  );
}

export default App;
