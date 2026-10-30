const { spawn } = require("node:child_process");
const assert = require("node:assert/strict");

const port = Number(process.env.PORT || 3187);
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["server.js"], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"]
});

let logs = "";
child.stdout.on("data", chunk => { logs += chunk.toString(); });
child.stderr.on("data", chunk => { logs += chunk.toString(); });

async function request(path, options = {}) {
  return fetch(baseUrl + path, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });
}

async function waitForHealth() {
  const deadline = Date.now() + 30000;
  let lastError;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error("Server exited early.\n" + logs);
    try {
      const response = await request("/api/health");
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error("Server did not become healthy. " + (lastError?.message || "") + "\n" + logs);
}

async function main() {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL must point to the CI PostgreSQL service");
  await waitForHealth();

  const health = await request("/api/health");
  assert.equal(health.status, 200, "health endpoint should return HTTP 200");
  assert.equal((await health.json()).ok, true, "health response should report ok");

  const email = `postgres-smoke-${Date.now()}@example.com`;
  const password = "AutoNorth-CI-Password-123!";
  const registration = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "CI Smoke Test", email, password })
  });
  assert.equal(registration.status, 201, "registration should create a user");
  const registered = await registration.json();
  assert.ok(registered.token, "registration should return a session token");
  assert.ok(registered.user?.id, "registration should return a user id");

  const duplicate = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "CI Smoke Test", email, password })
  });
  assert.equal(duplicate.status, 409, "duplicate email should be rejected");

  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  assert.equal(login.status, 200, "login should work for the new user");
  const loggedIn = await login.json();
  assert.ok(loggedIn.token, "login should return a session token");

  const authHeaders = { authorization: `Bearer ${loggedIn.token}` };
  const me = await request("/api/me", { headers: authHeaders });
  assert.equal(me.status, 200, "authenticated profile lookup should work");

  const publicListings = await request("/api/listings");
  assert.equal(publicListings.status, 200, "public listings endpoint should work");

  const createdListing = await request("/api/listings", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      make: "Toyota",
      model: "Corolla",
      year: 2022,
      price: 1250000,
      currency: "KES",
      mileage: 25000
    })
  });
  assert.equal(createdListing.status, 201, "authenticated listing creation should work");
  const listingPayload = await createdListing.json();
  assert.equal(listingPayload.listing?.make, "Toyota", "created listing should be returned");

  const sellerListings = await request("/api/seller/listings", { headers: authHeaders });
  assert.equal(sellerListings.status, 200, "seller listings endpoint should work");
  const sellerPayload = await sellerListings.json();
  assert.ok(sellerPayload.listings.some(item => item.id === listingPayload.listing.id),
    "seller should see the listing they created");

  console.log("PostgreSQL smoke tests passed: health, registration, duplicate-email protection, login, profile, and listing create/read.");
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    child.kill("SIGTERM");
  });
