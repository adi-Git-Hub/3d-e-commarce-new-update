import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cars } from "../data/cars";
import BookingCarViewer from "../components/BookingCarViewer";
import emailjs from "@emailjs/browser";
import axios from "axios"; 
import confetti from "canvas-confetti";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    preferredTime: "Morning",
    bookingType: "Direct Booking",
    specialRequest: "",
  });

  useEffect(() => {
    const car = cars.find((c) => c.id === parseInt(id) || c.id === id);
    if (car) setSelectedCar(car);
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const token = localStorage.getItem("token");

      // 🔥 STEP 1: Database mein premium booking save karo
      // Isme price, duration aur location backend ko ja rahe hain
      await axios.post("http://localhost:5000/api/bookings/reserve", {
        car_name: selectedCar.name,
        car_model_id: selectedCar.id,
        booking_type: formData.bookingType,
        city: formData.city,
        price: selectedCar.price, // Car data se price uthayega
        duration: "Full-Ownership", // Static for premium feel
        pickup_location: `ADYX ${formData.city} Experience Center` // Location sync
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 📧 STEP 2: EmailJS Confirmation bhejo
      const templateParams = {
        user_name: formData.fullName,
        user_email: formData.email,
        car_name: selectedCar.name,
        city: formData.city,
        booking_type: formData.bookingType,
        message: formData.specialRequest || "No special request",
      };

      await emailjs.send(
        'service_jek930p', 
        'template_pkbn74b', 
        templateParams,
        'zoSJWbcjfVA0rYOwx' 
      );

      setIsSending(false);
      setIsSubmitted(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#ffffff']
      });

    } catch (err) {
      console.error("Booking Error:", err);
      alert("Booking failed. Please ensure you are logged in.");
      setIsSending(false);
    }
  };

  if (!selectedCar) return <div className="bg-[#050507] h-screen text-white flex items-center justify-center font-sans uppercase tracking-[0.5em]">Initializing ADYX...</div>;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
        <div className="space-y-6 max-w-2xl">
          <h2 className="text-7xl font-black italic uppercase tracking-tighter leading-none">Legend Reserved.</h2>
          <p className="text-blue-500 font-bold uppercase tracking-[0.4em] text-sm italic">The ADYX Concierge will reach out soon.</p>
          <div className="py-12">
             <div className="h-[1px] w-24 bg-white/20 mx-auto" />
          </div>
          <p className="text-white/40 tracking-widest text-[10px] leading-loose max-w-md mx-auto normal-case">
            A confirmation for your <span className="text-white font-bold uppercase">{selectedCar.name}</span> has been sent to <span className="text-blue-400">{formData.email}</span>.
          </p>
          <button 
            onClick={() => navigate("/profile")} 
            className="mt-12 bg-white text-black px-12 py-5 rounded-none font-black uppercase tracking-[0.3em] text-[10px] hover:bg-blue-600 hover:text-white transition-all duration-500"
          >
            Go To Concierge Log
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans selection:bg-blue-500 selection:text-white pt-20 italic">
      <div className="fixed top-20 left-10 opacity-[0.02] pointer-events-none select-none">
        <h1 className="text-[20vw] font-black italic uppercase leading-none">ADYX</h1>
      </div>

      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-screen">
        <div className="lg:col-span-7 p-8 lg:p-20 flex flex-col justify-between sticky top-0 h-screen">
          <div className="space-y-2">
            <span className="text-blue-500 font-bold uppercase tracking-[0.4em] text-xs">Premium Selection</span>
            <h1 className="text-8xl font-black italic uppercase tracking-tighter leading-none">{selectedCar.name}</h1>
            <p className="text-2xl text-white/40 italic font-light capitalize">{selectedCar.variant || "Performance Edition"}</p>
          </div>

          <div className="relative w-full h-full flex items-center justify-center scale-125">
             <BookingCarViewer modelPath={selectedCar.modelPath} />
          </div>

          <div className="flex items-end justify-between border-t border-white/5 pt-8 min-w-0">
            <p className="text-3xl md:text-4xl font-mono break-all font-bold tracking-tighter">
  ₹{new Intl.NumberFormat("en-IN").format(selectedCar.price)}
</p>
            <div className="text-right space-y-1">
               <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Delivery Status</p>
               <p className="text-xl italic font-bold">8-12 WEEKS</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white/[0.01] backdrop-blur-3xl border-l border-white/5 p-8 lg:p-20 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-black italic uppercase tracking-tight">Reserve Your Legend</h2>
              <p className="text-white/40 text-[11px] uppercase tracking-widest leading-relaxed">Fill in your details to begin the bespoke acquisition process.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <input type="text" name="fullName" required placeholder="Full Name" value={formData.fullName} onChange={handleChange} 
                  className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-blue-500 transition-all placeholder:text-white/20 text-sm tracking-widest capitalize font-bold" />
                <div className="grid grid-cols-2 gap-8">
                  <input type="tel" name="phone" required placeholder="Phone" value={formData.phone} onChange={handleChange} 
                    className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-blue-500 transition-all placeholder:text-white/20 text-sm tracking-widest font-bold" />
                  <input type="text" name="city" required placeholder="City" value={formData.city} onChange={handleChange} 
                    className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-blue-500 transition-all placeholder:text-white/20 text-sm tracking-widest capitalize font-bold" />
                </div>
                <input type="email" name="email" required placeholder="Email Address" value={formData.email} onChange={handleChange} 
                  className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-blue-500 transition-all placeholder:text-white/20 text-sm tracking-widest font-bold" />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Booking Type</p>
                <div className="flex gap-4">
                  {["Test Drive", "Direct Booking"].map((type) => (
                    <button key={type} type="button" onClick={() => setFormData({...formData, bookingType: type})} 
                      className={`flex-1 py-4 border transition-all text-[9px] font-black uppercase tracking-widest ${formData.bookingType === type ? "bg-white text-black border-white" : "bg-transparent border-white/10 text-white/40 hover:border-white/30"}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isSending} 
                className={`w-full py-6 font-black uppercase tracking-[0.4em] text-xs transition-all duration-500 ${isSending ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-white hover:text-black shadow-[0_20px_50px_rgba(59,130,246,0.2)] hover:shadow-none'}`}>
                {isSending ? "Processing Request..." : "Confirm Reservation"}
              </button>
            </form>

            <p className="text-[8px] text-center text-white/20 uppercase tracking-[0.5em]">© 2026 ADYX AUTOMOTIVE GROUP</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;