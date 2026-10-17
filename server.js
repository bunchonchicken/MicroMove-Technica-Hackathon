require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
app.use(express.static(path.join(__dirname, "public"), { etag: true, maxAge: "1h" }));

const PORT = process.env.PORT || 3000;
const BASE_URL = (process.env.NESSIE_BASE_URL || "https://api.nessieisreal.com").replace(/\/$/, "");
const API_KEY = process.env.NESSIE_API_KEY;
const REQUEST_TIMEOUT_MS = Number(process.env.NESSIE_TIMEOUT_MS) || 8000;
const VALID_GOALS = new Set(["emergency", "goal", "debt"]);

async function nessieGet(resourcePath) {
  if (!API_KEY) throw new Error("Missing NESSIE_API_KEY. Add it to .env or use Demo Mode.");
  const separator = resourcePath.includes("?") ? "&" : "?";
  let response;
  try {
    response = await fetch(`${BASE_URL}${resourcePath}${separator}key=${encodeURIComponent(API_KEY)}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: "application/json" }
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new Error("Nessie request timed out. Please try again.");
    }
    throw new Error("Could not connect to Nessie. Check your connection and base URL.");
  }
  const body = await response.text();
  if (!response.ok) throw new Error(`Nessie returned HTTP ${response.status}. Check the account ID and API configuration.`);
  if (!body) return {};
  try { return JSON.parse(body); }
  catch { throw new Error("Nessie returned an unexpected response format."); }
}

const { buildPlan } = require("./lib/plan");


app.get("/api/health", (_req, res) => {
  res.json({ ok: true, nessieConfigured: Boolean(API_KEY) });
});

app.get("/api/customers", async (_req, res) => {
  try {
    const customers = await nessieGet("/customers");
    res.setHeader("Cache-Control", "no-store");
    res.json(Array.isArray(customers) ? customers : []);
  } catch (error) { res.status(502).json({ error: error.message }); }
});

app.get("/api/accounts/:accountId/plan", async (req, res) => {
  try {
    const accountId = String(req.params.accountId || "").trim();
    if (!accountId || accountId.length > 128) {
      return res.status(400).json({ error: "Enter a valid Nessie account ID (1–128 characters)." });
    }
    const goal = String(req.query.goal || "emergency").toLowerCase();
    if (!VALID_GOALS.has(goal)) {
      return res.status(400).json({ error: "Goal must be emergency, goal, or debt." });
    }
    const id = encodeURIComponent(accountId);
    const [account, purchases, deposits, withdrawals, bills] = await Promise.all([
      nessieGet(`/accounts/${id}`),
      nessieGet(`/accounts/${id}/purchases`).catch(() => []),
      nessieGet(`/accounts/${id}/deposits`).catch(() => []),
      nessieGet(`/accounts/${id}/withdrawals`).catch(() => []),
      nessieGet(`/accounts/${id}/bills`).catch(() => [])
    ]);
    const plan = buildPlan({
      account,
      purchases: Array.isArray(purchases) ? purchases : [],
      deposits: Array.isArray(deposits) ? deposits : [],
      withdrawals: Array.isArray(withdrawals) ? withdrawals : [],
      bills: Array.isArray(bills) ? bills : [],
      goal
    });
    res.setHeader("Cache-Control", "no-store");
    res.json(plan);
  } catch (error) { res.status(502).json({ error: error.message }); }
});

// Demo mode lets the UI be tested before an API key is configured.
app.get("/api/demo-plan", (_req, res) => {
  const now = new Date();
  const future = d => { const x = new Date(now); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
  const ago = d => { const x = new Date(now); x.setDate(x.getDate() - d); return x.toISOString().slice(0, 10); };
  const purchases = [
    { amount: 14.25, purchase_date: ago(2) }, { amount: 32.40, purchase_date: ago(4) },
    { amount: 8.75, purchase_date: ago(6) }, { amount: 21.10, purchase_date: ago(9) },
    { amount: 45.00, purchase_date: ago(13) }, { amount: 12.99, purchase_date: ago(18) },
    { amount: 28.50, purchase_date: ago(22) }, { amount: 19.30, purchase_date: ago(27) }
  ];
  const bills = [
    { amount: 180, payment_date: future(4), payee: "Rent contribution", status: "pending" },
    { amount: 42, payment_date: future(9), payee: "Phone bill", status: "pending" }
  ];
  const plan = buildPlan({
    account: { _id: "demo-checking-001", type: "Checking", balance: 620 },
    purchases,
    deposits: [{ amount: 520, transaction_date: ago(12) }],
    withdrawals: [],
    bills,
    goal: "emergency"
  });
  plan.demo = true;
  res.json(plan);
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`MicroMove running at http://localhost:${PORT}`));
}

module.exports = { app };
