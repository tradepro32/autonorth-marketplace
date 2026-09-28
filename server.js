const express = require("express");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_THIS_SECRET_BEFORE_PRODUCTION";

fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
const db = new Database(path.join(__dirname, "data", "autonorth.db"));
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'seller',
  phone_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price REAL NOT NULL,
  mileage INTEGER DEFAULT 0,
  transmission TEXT,
  fuel TEXT,
  location TEXT,
  city TEXT,
  image TEXT,
  description TEXT,
  plan TEXT,
  plan_price REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id)
);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
`);

app.use(express.json({ limit: "1mb" }));

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "AutoNorth API" });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password || String(password).length < 8) {
    return res.status(400).json({ error: "Name, email and password of at least 8 characters are required." });
  }
  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const hash = await bcrypt.hash(String(password), 12);
    const result = db.prepare(
      "INSERT INTO users (name,email,phone,password_hash) VALUES (?,?,?,?)"
    ).run(String(name).trim(), normalizedEmail, phone || null, hash);
    const user = {
      id: Number(result.lastInsertRowid),
      name: String(name).trim(),
      email: normalizedEmail,
      role: "seller"
    };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user, token });
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }
    res.status(500).json({ error: "Could not create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user || !(await bcrypt.compare(String(req.body.password || ""), user.password_hash))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    phone_verified: user.phone_verified
  };
  res.json({ user: safeUser, token: jwt.sign(safeUser, JWT_SECRET, { expiresIn: "7d" }) });
});

app.get("/api/me", auth, (req, res) => {
  const user = db.prepare(
    "SELECT id,name,email,phone,role,phone_verified FROM users WHERE id=?"
  ).get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

app.get("/api/listings", (req, res) => {
  const listings = db.prepare(
    "SELECT l.*, u.name AS seller_name FROM listings l JOIN users u ON u.id=l.seller_id WHERE l.status='live' ORDER BY l.created_at DESC"
  ).all();
  res.json({ listings });
});

app.get("/api/seller/listings", auth, (req, res) => {
  res.json({
    listings: db.prepare(
      "SELECT * FROM listings WHERE seller_id=? ORDER BY created_at DESC"
    ).all(req.user.id)
  });
});

app.post("/api/listings", auth, (req, res) => {
  const d = req.body;
  if (!d.make || !d.model || !d.year || !d.price) {
    return res.status(400).json({ error: "Make, model, year and price are required." });
  }
  const result = db.prepare(
    "INSERT INTO listings (seller_id,make,model,year,price,mileage,transmission,fuel,location,city,image,description,plan,plan_price) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
  ).run(
    req.user.id, String(d.make).trim(), String(d.model).trim(), Number(d.year),
    Number(d.price), Number(d.mileage) || 0, d.transmission || null, d.fuel || null,
    d.location || null, d.city || null, d.image || null, d.description || null,
    d.plan || null, Number(d.planPrice) || 0
  );
  res.status(201).json({
    listing: db.prepare("SELECT * FROM listings WHERE id=?").get(result.lastInsertRowid)
  });
});

app.delete("/api/listings/:id", auth, (req, res) => {
  const result = db.prepare(
    "DELETE FROM listings WHERE id=? AND seller_id=?"
  ).run(Number(req.params.id), req.user.id);
  if (!result.changes) return res.status(404).json({ error: "Listing not found" });
  res.json({ ok: true });
});


app.patch("/api/listings/:id", auth, (req, res) => {
  const d = req.body;
  const existing = db.prepare(
    "SELECT * FROM listings WHERE id=? AND seller_id=?"
  ).get(Number(req.params.id), req.user.id);
  if (!existing) return res.status(404).json({ error: "Listing not found" });

  const allowedStatuses = ["pending", "live", "rejected", "sold"];
  const nextStatus = allowedStatuses.includes(d.status) ? d.status : existing.status;

  db.prepare(`
    UPDATE listings SET
      make=?, model=?, year=?, price=?, mileage=?, transmission=?, fuel=?,
      location=?, city=?, image=?, description=?, status=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=? AND seller_id=?
  `).run(
    String(d.make || existing.make).trim(),
    String(d.model || existing.model).trim(),
    Number(d.year || existing.year),
    Number(d.price || existing.price),
    Number(d.mileage ?? existing.mileage ?? 0),
    d.transmission || existing.transmission,
    d.fuel || existing.fuel,
    d.location || existing.location,
    d.city || existing.city,
    d.image || existing.image,
    d.description || existing.description,
    nextStatus,
    Number(req.params.id),
    req.user.id
  );

  res.json({ listing: db.prepare("SELECT * FROM listings WHERE id=?").get(Number(req.params.id)) });
});

app.post("/api/inquiries", (req, res) => {
  const d = req.body;
  if (!d.listingId || !d.name || !d.email || !d.message) {
    return res.status(400).json({ error: "All inquiry fields are required." });
  }
  const listing = db.prepare(
    "SELECT id FROM listings WHERE id=? AND status='live'"
  ).get(Number(d.listingId));
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  const result = db.prepare(
    "INSERT INTO inquiries (listing_id,buyer_name,buyer_email,message) VALUES (?,?,?,?)"
  ).run(Number(d.listingId), String(d.name).trim(), String(d.email).trim(), String(d.message).trim());
  res.status(201).json({ inquiryId: Number(result.lastInsertRowid) });
});

app.get("/api/seller/inquiries", auth, (req, res) => {
  const inquiries = db.prepare(
    "SELECT i.*,l.make,l.model,l.year FROM inquiries i JOIN listings l ON l.id=i.listing_id WHERE l.seller_id=? ORDER BY i.created_at DESC"
  ).all(req.user.id);
  res.json({ inquiries });
});

app.get("/api/admin/listings", auth, adminOnly, (req, res) => {
  res.json({
    listings: db.prepare(
      "SELECT l.*,u.name AS seller_name,u.email AS seller_email FROM listings l JOIN users u ON u.id=l.seller_id ORDER BY l.created_at DESC"
    ).all()
  });
});

app.patch("/api/admin/listings/:id/status", auth, adminOnly, (req, res) => {
  const allowed = ["pending", "live", "rejected", "sold"];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const result = db.prepare(
    "UPDATE listings SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?"
  ).run(req.body.status, Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "Listing not found" });
  res.json({ ok: true });
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log("AutoNorth API running on port " + PORT);
});
