import { useState, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

// Context
import { useCars } from "./context/CarContext";

// Components
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import SunsetDriveScene from "./components/ui/SunsetDriveScene";
import Scene3D from "./components/Scene3D";
import CarStory from "./components/CarStory";
import MarketplaceSections from "./components/MarketplaceSections";
import Navbar from "./components/Navbar";

// Public Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import SetRegisterPassword from "./pages/SetRegisterPassword";
import ForgotPassword from "./pages/ForgotPassword";
import ForgotPasswordOTP from "./pages/ForgotPasswordOTP";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Success from "./pages/Success";

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

// ── Home page wrapper that reads dynamic cars ──────────────────────
function HomePage() {
  const { cars, loading } = useCars();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentCar = cars[currentIndex] || null;

  const handleCarChange = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  return (
    <div className="relative bg-black w-full">
      {/* 3D Scene — fixed background, model swaps on scroll */}
      <div className="fixed top-0 left-0 w-full h-screen -z-10">
        <Scene3D 
          model={currentCar?.model_url || "/models/car.glb"} 
          allModels={cars.map(c => c.model_url)} 
        />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* One CarStory section per car — scroll drives currentIndex */}
        {!loading && cars.length > 0 && (
          <CarStory cars={cars} onCarChange={handleCarChange} />
        )}

        <div className="min-h-screen">
          <MarketplaceSections />
        </div>

        {/* Thank You section after last car */}
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050507] border-t border-white/5">
          <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] mb-6">End of Collection</p>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white text-center mb-4">
            Thank you for exploring<br />our collection
          </h2>
          <p className="text-white/40 text-sm mb-12">We'd love to hear what you think.</p>
          <button
            onClick={() => navigate("/contact")}
            className="px-10 py-4 border border-cyan-500 text-cyan-400 font-black uppercase text-[11px] tracking-[0.3em] hover:bg-cyan-500 hover:text-black transition-all"
          >
            Give Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<SunsetDriveScene />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/success" element={<Success />} />

      {/* Auth Routes (Public) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/set-register-password" element={<SetRegisterPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password-otp" element={<ForgotPasswordOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/payment-success" element={<Success />} />

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
        path="/payment/:slug"
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
    </Routes>
  );
}

export default App;