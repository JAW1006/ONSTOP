import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// data.go.kr issues both an "Encoding" and a "Decoding" key; accept either by
// normalizing to the decoded form before URLSearchParams re-encodes it once.
const RAW_SERVICE_KEY = process.env.AIRPORT_SERVICE_KEY;
const SERVICE_KEY = RAW_SERVICE_KEY ? decodeURIComponent(RAW_SERVICE_KEY) : RAW_SERVICE_KEY;
const ARRIVALS_URL =
  "https://apis.data.go.kr/B551177/StatusOfPassengerFlightsOdp/getPassengerArrivalsOdp";

// data.go.kr wraps results as response.body.items, which can be a single
// object, an array, or an empty string when nothing matches — normalize here.
function normalizeItems(items) {
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

app.get("/api/flight/arrival", async (req, res) => {
  const flightId = String(req.query.flightId || "").trim().toUpperCase();
  const lang = String(req.query.lang || "K");

  if (!flightId) {
    return res.status(400).json({ error: "flightId query param is required" });
  }
  if (!SERVICE_KEY) {
    return res.status(500).json({ error: "AIRPORT_SERVICE_KEY is not configured on the server" });
  }

  const url = new URL(ARRIVALS_URL);
  url.searchParams.set("serviceKey", SERVICE_KEY);
  url.searchParams.set("flight_id", flightId);
  url.searchParams.set("lang", lang);
  url.searchParams.set("type", "json");

  try {
    const apiRes = await fetch(url);
    const raw = await apiRes.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      // The service returns XML on auth/quota errors even when type=json is requested.
      return res.status(502).json({ error: "airport API returned a non-JSON response", detail: raw.slice(0, 300) });
    }

    const header = data?.response?.header;
    if (header && header.resultCode !== "00") {
      return res.status(502).json({ error: header.resultMsg || "airport API error", resultCode: header.resultCode });
    }

    const items = normalizeItems(data?.response?.body?.items);
    if (!items.length) {
      return res.status(404).json({ error: `no arrival found for "${flightId}" today (this API only covers same-day flights)` });
    }

    const flights = items.map((it) => ({
      flightId: it.flightId,
      airline: it.airline,
      fromAirport: it.airport,
      scheduleDateTime: it.scheduleDateTime, // 예정 시각, HHMM
      estimatedDateTime: it.estimatedDateTime, // 변경(실제 예상) 시각, HHMM
      gate: it.gatenumber,
      terminal: it.terminalId,
      carousel: it.carousel,
      remark: it.remark,
    }));

    res.json({ flights });
  } catch (err) {
    res.status(502).json({ error: "failed to reach airport API", detail: String(err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Airport proxy listening on http://localhost:${PORT}`);
  if (!SERVICE_KEY) {
    console.warn("AIRPORT_SERVICE_KEY is not set — requests will fail until .env is configured.");
  }
});
