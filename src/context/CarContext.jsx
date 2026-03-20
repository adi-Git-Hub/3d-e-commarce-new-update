import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CarContext = createContext();

export const CarProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = useCallback(async () => {
    try {
      // cache-busting param ensures browser doesn't serve stale response
      const res = await fetch(`http://localhost:5000/api/cars?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        console.log("CARS:", data.data);
        setCars(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch cars:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => { fetchCars(); }, [fetchCars]);

  // Refetch when user returns to tab (covers admin adding car in another tab)
  useEffect(() => {
    const onFocus = () => fetchCars();
    const onVisible = () => { if (document.visibilityState === "visible") fetchCars(); };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchCars]);

  return (
    <CarContext.Provider value={{ cars, loading, fetchCars }}>
      {children}
    </CarContext.Provider>
  );
};

export const useCars = () => useContext(CarContext);
