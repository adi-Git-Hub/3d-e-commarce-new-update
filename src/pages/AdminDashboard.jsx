import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const AddCar = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleAddCar = async () => {
    if (!name || !price || !file) {
      setStatusMessage("❌ All fields are required");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setStatusMessage("❌ Unauthorized. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setStatusMessage("");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("model", file);

      const response = await fetch(
        "http://localhost:5000/api/admin/add-car",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatusMessage("✅ Car added successfully");

        setName("");
        setPrice("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setStatusMessage(data.message || "❌ Failed to add car");
      }
    } catch (error) {
      console.error(error);
      setStatusMessage("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #0a0a0f, #000)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          padding: "30px",
          borderRadius: "16px",
          width: "350px",
          backdropFilter: "blur(15px)",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(0,255,255,0.2)",
          boxShadow:
            "0 0 20px rgba(0,255,255,0.2), 0 0 60px rgba(0,255,255,0.05)",
        }}
      >
        <h2
          style={{
            color: "#0ff",
            textAlign: "center",
            marginBottom: "20px",
            textShadow: "0 0 10px #0ff",
          }}
        >
          🚗 Add New Car
        </h2>

        {/* STATUS */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "8px",
              textAlign: "center",
              background: statusMessage.includes("success")
                ? "rgba(0,255,100,0.1)"
                : "rgba(255,0,80,0.1)",
              color: statusMessage.includes("success")
                ? "#00ff88"
                : "#ff4d6d",
              boxShadow: "0 0 10px rgba(0,255,255,0.2)",
            }}
          >
            {statusMessage}
          </motion.div>
        )}

        {/* INPUTS */}
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Car Name"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <input
            type="file"
            accept=".glb"
            onChange={(e) => setFile(e.target.files[0])}
            ref={fileInputRef}
            style={{ color: "#ccc" }}
          />
        </div>

        {/* BUTTON */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddCar}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "#0ff",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 0 15px #0ff",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Adding..." : "Add Car"}
        </motion.button>
      </motion.div>
    </div>
  );
};

// INPUT STYLE
const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid rgba(0,255,255,0.3)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  outline: "none",
  boxShadow: "0 0 10px rgba(0,255,255,0.1)",
};

export default AddCar;