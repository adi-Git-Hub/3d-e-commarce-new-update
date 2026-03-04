require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const pool = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


const app = express();

// 🔥 MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 Payment rout 
const paymentRoutes = require("./routes/payment");
app.use("/api/payment", paymentRoutes);



// requst maail 

const contactRoute = require("./routes/contact");
app.use("/api/contact", contactRoute);



// 🔥 ROUTES LOAD KAR
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Booking rout 
const bookingRoutes = require("./routes/bookings");
app.use("/api/bookings", bookingRoutes);

// 🔥 SAFE FOLDER CREATION
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// 🔥 MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, "profile-" + Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
limits: { fileSize: 10 * 1024 * 1024 },
});

// 🔥 STATIC ACCESS
app.use("/uploads", express.static(uploadDir));

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// =====================================================================
// 🛡️ JWT AUTH
// =====================================================================
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// =====================================================================
// 👤 GET CURRENT USER
// =====================================================================
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, profile_pic, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch {
    res.status(500).json({ success: false });
  }
});

// =====================================================================
// 🔄 UPDATE PROFILE
// =====================================================================
app.put(
  "/api/auth/update-profile",
  authenticateToken,
  upload.single("profile_pic"),
  async (req, res) => {
    const { username } = req.body;
    const userId = req.user.id;

    let pic = null;
    if (req.file) {
      pic = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    try {
      const result = await pool.query(
        pic
          ? "UPDATE users SET username = COALESCE($1, username), profile_pic = $2 WHERE id = $3 RETURNING *"
          : "UPDATE users SET username = COALESCE($1, username) WHERE id = $2 RETURNING *",
        pic ? [username, pic, userId] : [username, userId]
      );

      res.json({ success: true, user: result.rows[0] });
    } catch {
      res.status(500).json({ success: false });
    }
  }
);

// =====================================================================
// 🏎️ BOOKINGS
// =====================================================================
app.post("/api/bookings/reserve", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT INTO bookings 
      (user_id, car_name, car_model_id, booking_type, city, price, duration, pickup_location, status, created_at) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Confirmed',NOW()) RETURNING *`,
      [
        req.user.id,
        req.body.car_name,
        req.body.car_model_id,
        req.body.booking_type,
        req.body.city,
        req.body.price,
        req.body.duration,
        req.body.pickup_location,
      ]
    );
    res.json({ success: true, booking: result.rows[0] });
  } catch {
    res.status(500).json({ success: false });
  }
});

// =====================================================================
// 🔥 REGISTER FLOW
// =====================================================================

app.post("/api/auth/register-step1", async (req, res) => {
  const { username, email } = req.body;

  try {
    // 🔥 CHECK USERNAME EXISTS
    const usernameCheck = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    // 🔥 CHECK EMAIL EXISTS
    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 300000);

    await pool.query(
      `INSERT INTO pending_registrations (username,email,otp,otp_expiry)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email)
       DO UPDATE SET otp=$3, otp_expiry=$4`,
      [username, email, otp, expiry]
    );

    // Email send
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "ADYX OTP",
      html: `<h2>${otp}</h2>`,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("REGISTER STEP1 ERROR:", err);
    res.status(500).json({ success: false });
  }
});

app.post("/api/auth/register-step2", async (req, res) => {
  const { email, otp } = req.body;
  const check = await pool.query(
    "SELECT * FROM pending_registrations WHERE email=$1 AND otp=$2",
    [email, otp]
  );
  if (check.rows.length === 0)
    return res.status(400).json({ success: false });
  res.json({ success: true });
});



app.post(
  "/api/auth/register-step3",
  upload.single("profile_pic"),
  async (req, res) => {

    console.log("STEP3 BODY:", req.body);
    console.log("STEP3 FILE:", req.file);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or Password missing",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 🔥 pending check
      const pend = await client.query(
        "SELECT username FROM pending_registrations WHERE email = $1",
        [email]
      );

      if (pend.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Registration expired. Please start again.",
        });
      }

      let username = pend.rows[0].username;

      // 🔥 unique username
      const existingUser = await client.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );

      if (existingUser.rows.length > 0) {
        username = username + "_" + Math.floor(Math.random() * 9999);
      }

      // 🔥 email check
      const existingEmail = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existingEmail.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      // 🔥 hash
      const hash = await bcrypt.hash(password, 10);

      // 🔥 profile pic handling
      let profilePic = null;
      if (req.file) {
        profilePic = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      }

      // 🔥 insert
      const result = await client.query(
        `INSERT INTO users (username, email, password, role, profile_pic)
         VALUES ($1, $2, $3, 'user', $4)
         RETURNING id, username, email, profile_pic`,
        [username, email, hash, profilePic]
      );

      await client.query(
        "DELETE FROM pending_registrations WHERE email = $1",
        [email]
      );

      await client.query("COMMIT");

      const token = jwt.sign(
        { id: result.rows[0].id },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        token,
        user: result.rows[0],
      });

    } catch (err) {
      console.error("REGISTER STEP3 ERROR:", err);
      await client.query("ROLLBACK");

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    } finally {
      client.release();
    }
  }
);


app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );
    if (!user.rows.length) return res.status(400).json({ success: false });

    const match = await bcrypt.compare(password, user.rows[0].password);
    if (!match) return res.status(400).json({ success: false });

    const token = jwt.sign(
      { id: user.rows[0].id },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ success: true, token, user: user.rows[0] });
  } catch {
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));

app.delete("/api/auth/delete-account", authenticateToken, async (req, res) => {
  const { password } = req.body;

  try {
    // 🔥 user fetch
    const user = await pool.query(
      "SELECT * FROM users WHERE id=$1",
      [req.user.id]
    );

    if (!user.rows.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔥 verify password
    const match = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // 🔥 delete bookings first (FK safe)
    await pool.query(
      "DELETE FROM bookings WHERE user_id=$1",
      [req.user.id]
    );

    // 🔥 delete user
    await pool.query(
      "DELETE FROM users WHERE id=$1",
      [req.user.id]
    );

    res.json({
      success: true,
      message: "Account deleted",
    });

  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});