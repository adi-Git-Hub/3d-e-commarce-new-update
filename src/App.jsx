import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

import SunsetDriveScene from "./components/ui/SunsetDriveScene";

import Scene3D from "./components/Scene3D";
import CarStory from "./components/CarStory";
import MarketplaceSections from "./components/MarketplaceSections";
import ParkingLot from "./components/ParkingLot";
import Navbar from "./components/Navbar";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import { cars } from "./data/cars";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import SetRegisterPassword from "./pages/SetRegisterPassword";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";

import ForgotPassword from "./pages/ForgotPassword";
import ForgotPasswordOTP from "./pages/ForgotPasswordOTP";
import ResetPassword from "./pages/ResetPassword";

import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Booking from "./pages/Booking";
import Buy from "./pages/Buy";

import SuccessPage from "./pages/SuccessPage";

function App() {
  const { user } = useAuth();

  // preload car models
  useEffect(() => {
    if (cars && Array.isArray(cars)) {
      cars.forEach((car) => {
        if (car.modelPath) {
          useGLTF.preload(car.modelPath);
        }
      });
    }
  }, []);

  return (
    <Routes>

      {/* SUNSET LANDING PAGE */}
      <Route path="/" element={<SunsetDriveScene />} />

      {/* MAIN WEBSITE */}
      <Route
        path="/home"
        element={
          <div className="relative bg-black w-full">

            {/* 3D Scene Background */}
            <div className="fixed top-0 left-0 w-full h-screen -z-10">
              <Scene3D />
            </div>

            {/* UI Scroll Sections */}
            <div className="relative z-10">

              <Navbar />

              <div className="min-h-screen flex items-center justify-center">
                <CarStory />
              </div>

              <div className="min-h-screen">
                <MarketplaceSections />
              </div>

              <div className="min-h-screen">
                <ParkingLot />
              </div>

            </div>

          </div>
        }
      />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/set-register-password" element={<SetRegisterPassword />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password-otp" element={<ForgotPasswordOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* STATIC */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* PROFILE */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* CARS */}
      <Route
        path="/cars"
        element={
          <ProtectedRoute>
            <Cars />
          </ProtectedRoute>
        }
      />

      <Route
        path="/car/:id"
        element={
          <ProtectedRoute>
            <CarDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking/:id"
        element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buy/:id"
        element={
          <ProtectedRoute>
            <Buy />
          </ProtectedRoute>
        }
      />

      {/* PAYMENT */}
      <Route path="/payment-success" element={<SuccessPage />} />

    </Routes>
  );
}

export default App;