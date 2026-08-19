import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());

// 카카오맵 JS SDK는 등록된 도메인(http/https)에서만 동작하고 file://에서는 안 뜨므로,
// 같은 프로세스에서 app/ 정적 파일도 같이 서빙해서 http://localhost:3001 로 열 수 있게 한다.
app.use(express.static(path.join(__dirname, "..", "app")));

// data.go.kr issues both an "Encoding" and a "Decoding" key; accept either by
// normalizing to the decoded form before URLSearchParams re-encodes it once.
const RAW_SERVICE_KEY = process.env.AIRPORT_SERVICE_KEY;
const SERVICE_KEY = RAW_SERVICE_KEY ? decodeURIComponent(RAW_SERVICE_KEY) : RAW_SERVICE_KEY;
const ARRIVALS_URL =
  "https://apis.data.go.kr/B551177/StatusOfPassengerFlightsOdp/getPassengerArrivalsOdp";
const DEPARTURES_URL =
  "https://apis.data.go.kr/B551177/StatusOfPassengerFlightsOdp/getPassengerDeparturesOdp";

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

app.get("/api/flight/departure", async (req, res) => {
  const flightId = String(req.query.flightId || "").trim().toUpperCase();
  const lang = String(req.query.lang || "K");

  if (!flightId) {
    return res.status(400).json({ error: "flightId query param is required" });
  }
  if (!SERVICE_KEY) {
    return res.status(500).json({ error: "AIRPORT_SERVICE_KEY is not configured on the server" });
  }

  const url = new URL(DEPARTURES_URL);
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
      return res.status(404).json({ error: `no departure found for "${flightId}" today (this API only covers same-day flights)` });
    }

    const flights = items.map((it) => ({
      flightId: it.flightId,
      airline: it.airline,
      toAirport: it.airport,
      scheduleDateTime: it.scheduleDateTime, // 예정 시각, HHMM
      estimatedDateTime: it.estimatedDateTime, // 변경(실제 예상) 시각, HHMM
      gate: it.gatenumber,
      terminal: it.terminalId,
      checkInRange: it.chkinrange,
      remark: it.remark,
    }));

    res.json({ flights });
  } catch (err) {
    res.status(502).json({ error: "failed to reach airport API", detail: String(err) });
  }
});

// 카카오모빌리티 길찾기(자동차) API — Kakao Developers 앱의 REST API 키를 그대로 사용.
const KAKAO_REST_KEY = process.env.KAKAO_REST_API_KEY;
const KAKAO_DIRECTIONS_URL = "https://apis-navi.kakaomobility.com/v1/directions";

app.get("/api/route", async (req, res) => {
  const { originLat, originLng, destLat, destLng } = req.query;
  if (!originLat || !originLng || !destLat || !destLng) {
    return res.status(400).json({ error: "originLat, originLng, destLat, destLng query params are required" });
  }
  if (!KAKAO_REST_KEY) {
    return res.status(500).json({ error: "KAKAO_REST_API_KEY is not configured on the server" });
  }

  const url = new URL(KAKAO_DIRECTIONS_URL);
  // 카카오모빌리티는 좌표를 "경도,위도"(x,y) 순서로 받는다 — 위경도(lat,lng) 순서와 반대라 헷갈리기 쉬움.
  url.searchParams.set("origin", `${originLng},${originLat}`);
  url.searchParams.set("destination", `${destLng},${destLat}`);

  try {
    const apiRes = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } });
    const data = await apiRes.json().catch(() => ({}));
    if (!apiRes.ok) {
      return res.status(502).json({ error: data.msg || `kakao mobility API error (${apiRes.status})` });
    }
    const route = data.routes && data.routes[0];
    if (!route || route.result_code !== 0) {
      return res.status(404).json({ error: "no route found between the given points" });
    }
    const { duration, distance } = route.summary;
    // 실제 도로를 따라가는 폴리라인 좌표 — sections[].roads[].vertexes가 [lng,lat,lng,lat,...] 평탄 배열로 온다.
    const path = [];
    (route.sections || []).forEach((sec) => {
      (sec.roads || []).forEach((road) => {
        const v = road.vertexes || [];
        for (let i = 0; i + 1 < v.length; i += 2) path.push({ lng: v[i], lat: v[i + 1] });
      });
    });
    res.json({ durationSec: duration, distanceM: distance, path });
  } catch (err) {
    res.status(502).json({ error: "failed to reach kakao mobility API", detail: String(err) });
  }
});

// 카카오 로컬(장소 카테고리 검색) API — 코스 빌더 지도에 실제 주변 가게(카페/음식점 등)를 얹을 때 사용.
// 같은 Kakao 앱의 REST API 키를 그대로 쓴다(카카오모빌리티와 동일 키).
const KAKAO_LOCAL_URL = "https://dapi.kakao.com/v2/local/search/category.json";

app.get("/api/places", async (req, res) => {
  const { lat, lng, category, radius } = req.query;
  if (!lat || !lng || !category) {
    return res.status(400).json({ error: "lat, lng, category query params are required" });
  }
  if (!KAKAO_REST_KEY) {
    return res.status(500).json({ error: "KAKAO_REST_API_KEY is not configured on the server" });
  }

  const url = new URL(KAKAO_LOCAL_URL);
  url.searchParams.set("category_group_code", category);
  url.searchParams.set("x", lng);
  url.searchParams.set("y", lat);
  url.searchParams.set("radius", radius || "1000");
  url.searchParams.set("sort", "distance");
  url.searchParams.set("size", "15");

  try {
    const apiRes = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } });
    const data = await apiRes.json().catch(() => ({}));
    if (!apiRes.ok) {
      return res.status(502).json({ error: data.message || `kakao local API error (${apiRes.status})` });
    }
    const places = (data.documents || []).map((d) => ({
      name: d.place_name,
      lat: Number(d.y),
      lng: Number(d.x),
      category: d.category_name,
    }));
    res.json({ places });
  } catch (err) {
    res.status(502).json({ error: "failed to reach kakao local API", detail: String(err) });
  }
});

// ODsay 대중교통(지하철/버스) 경로 API — odsay.com 발급 키 사용. 응답 스키마는 실제 키로 검증 완료
// (result.path[0].info.totalTime/payment, subPath[].passStopList.stations[]).
const ODSAY_API_KEY = process.env.ODSAY_API_KEY;
const ODSAY_URL = "https://api.odsay.com/v1/api/searchPubTransPathT";

app.get("/api/transit", async (req, res) => {
  const { originLat, originLng, destLat, destLng } = req.query;
  if (!originLat || !originLng || !destLat || !destLng) {
    return res.status(400).json({ error: "originLat, originLng, destLat, destLng query params are required" });
  }
  if (!ODSAY_API_KEY) {
    return res.status(500).json({ error: "ODSAY_API_KEY is not configured on the server" });
  }

  const url = new URL(ODSAY_URL);
  url.searchParams.set("SX", originLng);
  url.searchParams.set("SY", originLat);
  url.searchParams.set("EX", destLng);
  url.searchParams.set("EY", destLat);
  url.searchParams.set("apiKey", ODSAY_API_KEY);

  try {
    const apiRes = await fetch(url);
    const data = await apiRes.json().catch(() => ({}));
    if (data.error) {
      return res.status(502).json({ error: data.error.message || "odsay API error" });
    }
    const best = data.result && Array.isArray(data.result.path) && data.result.path[0];
    const totalTime = best && best.info && best.info.totalTime;
    if (totalTime == null) {
      return res.status(404).json({ error: "no transit route found between the given points" });
    }
    // 지하철/버스 구간(subPath[].passStopList.stations)의 정류장 좌표를 순서대로 이어서 노선 폴리라인을 만든다.
    // 도보 환승 구간은 좌표가 안 오므로 자연스럽게 건너뛴다(양옆 정류장으로 이미 이어짐).
    const path = [];
    (best.subPath || []).forEach((sp) => {
      const stations = sp.passStopList && sp.passStopList.stations;
      if (stations) stations.forEach((st) => path.push({ lat: Number(st.y), lng: Number(st.x) }));
    });
    res.json({ durationMin: totalTime, fare: best.info.payment ?? null, path: path.length > 1 ? path : null });
  } catch (err) {
    res.status(502).json({ error: "failed to reach odsay API", detail: String(err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Airport proxy listening on http://localhost:${PORT}`);
  if (!SERVICE_KEY) {
    console.warn("AIRPORT_SERVICE_KEY is not set — requests will fail until .env is configured.");
  }
  if (!KAKAO_REST_KEY) {
    console.warn("KAKAO_REST_API_KEY is not set — /api/route will fail until .env is configured.");
  }
  if (!ODSAY_API_KEY) {
    console.warn("ODSAY_API_KEY is not set — /api/transit will fail until .env is configured (falls back to driving times).");
  }
});
