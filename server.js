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
CREATE TABLE IF NOT EXISTS phone_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS seller_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'unverified',
  document_type TEXT,
  document_reference TEXT,
  notes TEXT,
  reviewed_by INTEGER,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_user_id INTEGER,
  listing_id INTEGER,
  reported_user_id INTEGER,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  FOREIGN KEY (reporter_user_id) REFERENCES users(id),
  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (reported_user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  ip TEXT,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  listing_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  provider_reference TEXT,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (listing_id) REFERENCES listings(id)
);
`);

app.use(express.json({ limit: "1mb" }));

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

function clean(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}
function validEmail(value) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(String(value));
}
function audit(userId, action, targetType, targetId, ip, details = "") {
  db.prepare("INSERT INTO audit_logs (user_id,action,target_type,target_id,ip,details) VALUES (?,?,?,?,?,?)")
    .run(userId || null, action, targetType || null, targetId || null, ip || null, clean(details, 1000));
}


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
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
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
  if (!validEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (phone && !/^[+0-9 ()-]{7,25}$/.test(String(phone))) {
    return res.status(400).json({ error: "Enter a valid phone number." });
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
    db.prepare("INSERT OR IGNORE INTO seller_verifications (user_id) VALUES (?)").run(user.id);
    audit(user.id, "register", "user", user.id, getClientIp(req));
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
  audit(user.id, "login", "user", user.id, getClientIp(req));
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
  const year = Number(d.year), price = Number(d.price), mileage = Number(d.mileage) || 0;
  if (!d.make || !d.model || !Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1 || !Number.isFinite(price) || price <= 0 || mileage < 0) {
    return res.status(400).json({ error: "Enter valid vehicle, year, price and mileage details." });
  }
  const seller = db.prepare("SELECT phone_verified FROM users WHERE id=?").get(req.user.id);
  if (!seller?.phone_verified && process.env.REQUIRE_PHONE_FOR_LISTINGS === "true") {
    return res.status(403).json({ error: "Phone verification is required before listing a vehicle.", code: "PHONE_VERIFICATION_REQUIRED" });
  }
  const result = db.prepare(
    "INSERT INTO listings (seller_id,make,model,year,price,mileage,transmission,fuel,location,city,image,description,plan,plan_price) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
  ).run(
    req.user.id, clean(d.make,80), clean(d.model,80), year,
    price, mileage, d.transmission || null, d.fuel || null,
    d.location || null, d.city || null, d.image || null, d.description || null,
    d.plan || null, Number(d.planPrice) || 0
  );
  const listingId = Number(result.lastInsertRowid);
  audit(req.user.id, "listing_created", "listing", listingId, getClientIp(req));
  res.status(201).json({ listing: db.prepare("SELECT * FROM listings WHERE id=?").get(listingId) });
});

app.delete("/api/listings/:id", auth, (req, res) => {
  const result = db.prepare(
    "DELETE FROM listings WHERE id=? AND seller_id=?"
  ).run(Number(req.params.id), req.user.id);
  if (!result.changes) return res.status(404).json({ error: "Listing not found" });
  audit(req.user.id, "listing_status_changed", "listing", Number(req.params.id), getClientIp(req), req.body.status);
  res.json({ ok: true });
});


app.patch("/api/listings/:id", auth, (req, res) => {
  const d = req.body;
  const existing = db.prepare(
    "SELECT * FROM listings WHERE id=? AND seller_id=?"
  ).get(Number(req.params.id), req.user.id);
  if (!existing) return res.status(404).json({ error: "Listing not found" });

  // Sellers may edit a listing, but cannot approve their own listing.
  const nextStatus = existing.status === "live" ? "pending" : "pending";

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

  audit(req.user.id, "listing_updated", "listing", Number(req.params.id), getClientIp(req));
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


app.post("/api/phone/send-code", auth, async (req, res) => {
  const phone = clean(req.body.phone, 30);
  if (!/^[+0-9 ()-]{7,25}$/.test(phone)) return res.status(400).json({ error: "Enter a valid phone number." });
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const hash = await bcrypt.hash(code, 10);
  const expires = Date.now() + 10 * 60 * 1000;
  db.prepare("UPDATE phone_verifications SET used=1 WHERE user_id=? AND used=0").run(req.user.id);
  db.prepare("INSERT INTO phone_verifications (user_id,phone,code_hash,expires_at) VALUES (?,?,?,?)").run(req.user.id, phone, hash, expires);
  db.prepare("UPDATE users SET phone=? WHERE id=?").run(phone, req.user.id);

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    const body = new URLSearchParams({ To: phone, From: process.env.TWILIO_FROM_NUMBER, Body: "Your AutoNorth verification code is " + code });
    const authHeader = Buffer.from(process.env.TWILIO_ACCOUNT_SID + ":" + process.env.TWILIO_AUTH_TOKEN).toString("base64");
    const response = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + process.env.TWILIO_ACCOUNT_SID + "/Messages.json", {
      method: "POST", headers: { Authorization: "Basic " + authHeader, "Content-Type": "application/x-www-form-urlencoded" }, body
    });
    if (!response.ok) return res.status(502).json({ error: "SMS provider could not send the verification code." });
  } else if (process.env.NODE_ENV === "production") {
    return res.status(503).json({ error: "Phone verification is not configured yet." });
  }

  audit(req.user.id, "phone_code_sent", "user", req.user.id, getClientIp(req));
  res.json({ ok: true, message: "Verification code sent." });
});

app.post("/api/phone/verify", auth, async (req, res) => {
  const code = clean(req.body.code, 10);
  const record = db.prepare("SELECT * FROM phone_verifications WHERE user_id=? AND used=0 ORDER BY id DESC LIMIT 1").get(req.user.id);
  if (!record || Date.now() > record.expires_at || record.attempts >= 5) return res.status(400).json({ error: "Verification code is invalid or expired." });
  const ok = await bcrypt.compare(code, record.code_hash);
  db.prepare("UPDATE phone_verifications SET attempts=attempts+1 WHERE id=?").run(record.id);
  if (!ok) {
    recordSuspiciousActivity(getClientIp(req), "phone-verification-failure");
    return res.status(400).json({ error: "Verification code is invalid or expired." });
  }
  db.prepare("UPDATE phone_verifications SET used=1 WHERE id=?").run(record.id);
  db.prepare("UPDATE users SET phone_verified=1 WHERE id=?").run(req.user.id);
  audit(req.user.id, "phone_verified", "user", req.user.id, getClientIp(req));
  res.json({ ok: true, phone_verified: true });
});

app.post("/api/verifications/seller", auth, (req, res) => {
  const documentType = clean(req.body.documentType, 40);
  if (!["national_id", "passport", "business_registration"].includes(documentType)) {
    return res.status(400).json({ error: "Select a supported verification document." });
  }
  db.prepare("INSERT INTO seller_verifications (user_id,status,document_type,document_reference,notes,updated_at) VALUES (?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET status='pending',document_type=excluded.document_type,document_reference=excluded.document_reference,notes=excluded.notes,updated_at=CURRENT_TIMESTAMP")
    .run(req.user.id, "pending", documentType, clean(req.body.documentReference, 120), clean(req.body.notes, 500));
  audit(req.user.id, "seller_verification_submitted", "user", req.user.id, getClientIp(req));
  res.json({ ok: true, status: "pending" });
});

app.get("/api/me/security", auth, (req, res) => {
  const user = db.prepare("SELECT id,phone_verified FROM users WHERE id=?").get(req.user.id);
  const verification = db.prepare("SELECT status,document_type,created_at,updated_at FROM seller_verifications WHERE user_id=?").get(req.user.id);
  res.json({ phoneVerified: Boolean(user?.phone_verified), sellerVerification: verification || { status: "unverified" } });
});

app.post("/api/reports", auth, (req, res) => {
  const listingId = req.body.listingId ? Number(req.body.listingId) : null;
  const reportedUserId = req.body.reportedUserId ? Number(req.body.reportedUserId) : null;
  const reason = clean(req.body.reason, 80);
  const details = clean(req.body.details, 1000);
  const allowed = ["suspected_scam","fake_vehicle","incorrect_information","stolen_vehicle_concern","fake_documents","payment_scam","harassment","other"];
  if (!allowed.includes(reason) || (!listingId && !reportedUserId)) return res.status(400).json({ error: "A valid report target and reason are required." });
  if (listingId && !db.prepare("SELECT id FROM listings WHERE id=?").get(listingId)) return res.status(404).json({ error: "Listing not found." });
  const result = db.prepare("INSERT INTO reports (reporter_user_id,listing_id,reported_user_id,reason,details) VALUES (?,?,?,?,?)").run(req.user.id,listingId,reportedUserId,reason,details);
  audit(req.user.id, "report_created", "report", Number(result.lastInsertRowid), getClientIp(req), reason);
  res.status(201).json({ ok: true, reportId: Number(result.lastInsertRowid) });
});

app.get("/api/admin/reports", auth, adminOnly, (req, res) => {
  res.json({ reports: db.prepare("SELECT r.*,l.make,l.model,u.name AS reporter_name FROM reports r LEFT JOIN listings l ON l.id=r.listing_id LEFT JOIN users u ON u.id=r.reporter_user_id ORDER BY r.created_at DESC").all() });
});

app.patch("/api/admin/reports/:id", auth, adminOnly, (req, res) => {
  const allowed = ["open","reviewing","resolved","dismissed"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: "Invalid report status." });
  const result = db.prepare("UPDATE reports SET status=?,reviewed_at=CURRENT_TIMESTAMP WHERE id=?").run(req.body.status,Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "Report not found." });
  audit(req.user.id,"report_reviewed","report",Number(req.params.id),getClientIp(req),req.body.status);
  res.json({ ok:true });
});

app.get("/api/admin/security", auth, adminOnly, (req, res) => {
  res.json({
    suspicious: Array.from(suspiciousActivity.entries()).map(([ip,v]) => ({ ip, count:v.count, reasons:v.reasons })),
    recentAudit: db.prepare("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100").all()
  });
});

app.get("/api/admin/verifications", auth, adminOnly, (req, res) => {
  res.json({ verifications: db.prepare("SELECT s.*,u.name,u.email,u.phone,u.phone_verified FROM seller_verifications s JOIN users u ON u.id=s.user_id ORDER BY s.updated_at DESC").all() });
});

app.patch("/api/admin/verifications/:userId", auth, adminOnly, (req, res) => {
  const allowed = ["unverified","pending","verified","rejected"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error:"Invalid verification status." });
  const userId=Number(req.params.userId);
  const result=db.prepare("UPDATE seller_verifications SET status=?,reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE user_id=?").run(req.body.status,req.user.id,userId);
  if (!result.changes) return res.status(404).json({error:"Verification request not found."});
  audit(req.user.id,"seller_verification_reviewed","user",userId,getClientIp(req),req.body.status);
  res.json({ok:true});
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
