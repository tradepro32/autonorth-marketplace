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

// AutoNorth security layer.
// IPQualityScore is queried only from the server. Set IPQS_API_KEY in production.
// VPN/proxy/Tor traffic is blocked when BLOCK_ANONYMOUS_NETWORKS=true.
app.set("trust proxy", process.env.TRUST_PROXY === "true");

const securityCache = new Map();
const rateBuckets = new Map();
const suspiciousActivity = new Map();
const SECURITY_CACHE_MS = 15 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = Number(process.env.RATE_LIMIT_PER_MINUTE || 120);
const AUTH_RATE_LIMIT = Number(process.env.AUTH_RATE_LIMIT_PER_MINUTE || 10);
const LISTING_RATE_LIMIT = Number(process.env.LISTING_RATE_LIMIT_PER_HOUR || 10);
const SUSPICIOUS_WINDOW_MS = 60 * 60 * 1000;
const SUSPICIOUS_THRESHOLD = 5;

function getClientIp(req) {
  return String(req.ip || req.socket?.remoteAddress || "")
    .replace(/^::ffff:/, "")
    .trim();
}

function isPrivateIp(ip) {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\\.(1[6-9]|2\\d|3[0-1])\\./.test(ip) ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  );
}

function recordSuspiciousActivity(ip, reason) {
  const now = Date.now();
  let entry = suspiciousActivity.get(ip);
  if (!entry || now - entry.startedAt >= SUSPICIOUS_WINDOW_MS) {
    entry = { startedAt: now, count: 0, reasons: [] };
  }
  entry.count += 1;
  if (entry.reasons.length < 10) entry.reasons.push(reason);
  suspiciousActivity.set(ip, entry);
  return entry.count;
}

function strictRateLimit(key, limit, windowMs) {
  const now = Date.now();
  let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= windowMs) {
    bucket = { startedAt: now, count: 0 };
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  return bucket.count <= limit;
}

function securityRateLimit(req, res, next) {

  const ip = getClientIp(req) || "unknown";
  const now = Date.now();
  let bucket = rateBuckets.get(ip);

  if (!bucket || now - bucket.startedAt >= RATE_WINDOW_MS) {
    bucket = { startedAt: now, count: 0 };
  }
  bucket.count += 1;
  rateBuckets.set(ip, bucket);

  if (bucket.count > RATE_LIMIT) {
    const count = recordSuspiciousActivity(ip, "general-rate-limit");
    if (count >= SUSPICIOUS_THRESHOLD) {
      return res.status(429).json({ error: "Access temporarily restricted because of repeated automated activity." });
    }
    return res.status(429).json({ error: "Too many requests. Please wait a minute and try again." });
  }
  next();
}

async function checkNetworkRisk(req) {
  const ip = getClientIp(req);
  const apiKey = process.env.IPQS_API_KEY;
  const blockAnonymous = process.env.BLOCK_ANONYMOUS_NETWORKS === "true";

  // Local development/Codespaces stays usable until a production IPQS key is configured.
  if (!apiKey || !blockAnonymous || !ip || isPrivateIp(ip)) {
    return { allowed: true, checked: false };
  }

  const cached = securityCache.get(ip);
  if (cached && Date.now() - cached.checkedAt < SECURITY_CACHE_MS) {
    return cached.result;
  }

  const url = new URL("https://www.ipqualityscore.com/api/json/ip");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("ip", ip);
  url.searchParams.set("strictness", "1");
  url.searchParams.set("allow_public_access_points", "true");
  url.searchParams.set("user_agent", String(req.get("user-agent") || "").slice(0, 500));
  url.searchParams.set("user_language", String(req.get("accept-language") || "").slice(0, 200));

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("IP reputation service returned " + response.status);
    const data = await response.json();

    if (!data.success) throw new Error(data.message || "IP reputation lookup failed");

    const blocked =
      data.proxy === true ||
      data.vpn === true ||
      data.tor === true ||
      data.active_vpn === true ||
      data.active_tor === true;

    const result = {
      allowed: !blocked,
      checked: true,
      blocked,
      reason: blocked ? "VPN, proxy, or Tor connection detected." : null,
      fraudScore: Number.isFinite(Number(data.fraud_score)) ? Number(data.fraud_score) : null
    };

    securityCache.set(ip, { checkedAt: Date.now(), result });
    return result;
  } catch (error) {
    // Fail closed in production when the anti-fraud service cannot verify an IP.
    console.error("Network security check failed:", error.message);
    return {
      allowed: process.env.SECURITY_FAIL_OPEN === "true",
      checked: false,
      blocked: process.env.SECURITY_FAIL_OPEN !== "true",
      reason: "Network security verification is temporarily unavailable."
    };
  }
}

async function securityGuard(req, res, next) {
  const result = await checkNetworkRisk(req);
  if (!result.allowed) {
    return res.status(403).json({
      error: "Access denied. AutoNorth does not allow VPN, proxy, or Tor connections.",
      code: "NETWORK_BLOCKED"
    });
  }
  next();
}

app.use(securityRateLimit);
app.use(securityGuard);

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

app.use(["/api/auth/register", "/api/auth/login"], (req, res, next) => {
  const ip = getClientIp(req) || "unknown";
  if (!strictRateLimit("auth:" + ip, AUTH_RATE_LIMIT, RATE_WINDOW_MS)) {
    recordSuspiciousActivity(ip, "authentication-rate-limit");
    return res.status(429).json({ error: "Too many sign-in or registration attempts. Please wait before trying again." });
  }
  next();
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

app.post("/api/listings", auth, (req, res, next) => {
  const key = "listing:" + req.user.id;
  if (!strictRateLimit(key, LISTING_RATE_LIMIT, SUSPICIOUS_WINDOW_MS)) {
    recordSuspiciousActivity(getClientIp(req), "listing-creation-rate-limit");
    return res.status(429).json({ error: "Too many listings created recently. Please try again later." });
  }
  next();
}, (req, res) => {
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
