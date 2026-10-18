import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// 카카오맵 JS SDK는 등록된 도메인(http/https)에서만 동작하고 file://에서는 안 뜨므로,
// 같은 프로세스에서 app/ 정적 파일도 같이 서빙해서 http://localhost:3001 로 열 수 있게 한다.
app.use(express.static(path.join(__dirname, "..", "app")));
// 예약 요청을 사람이 보기 편하게 확인하는 내부용 페이지 — 고객용 앱과 분리된 별도 정적 파일.
app.use("/admin", express.static(path.join(__dirname, "admin")));

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

// 인천공항 출국장 혼잡도 API — 같은 AIRPORT_SERVICE_KEY로 T1/T2 둘 다 자동 승인되어 있었다
// (T1은 2026-09-18, T2는 별도 서비스(statusOfDepartureCongestionT2)로 같은 날 확인). 터미널마다
// 엔드포인트 자체가 분리돼 있어서 요청 시 terminal 쿼리로 어느 쪽을 부를지 고른다.
const CONGESTION_URLS = {
  P01: "https://apis.data.go.kr/B551177/statusOfDepartureCongestion/getDepartureCongestion",
  P03: "https://apis.data.go.kr/B551177/statusOfDepartureCongestionT2/getDepartureCongestionT2",
};

app.get("/api/security-wait", async (req, res) => {
  const terminal = req.query.terminal === "P03" ? "P03" : "P01";
  if (!SERVICE_KEY) {
    return res.status(500).json({ error: "AIRPORT_SERVICE_KEY is not configured on the server" });
  }

  const url = new URL(CONGESTION_URLS[terminal]);
  url.searchParams.set("serviceKey", SERVICE_KEY);
  url.searchParams.set("type", "json");
  url.searchParams.set("numOfRows", "50");

  try {
    const apiRes = await fetch(url);
    const raw = await apiRes.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: "congestion API returned a non-JSON response", detail: raw.slice(0, 300) });
    }

    const header = data?.response?.header;
    if (header && header.resultCode !== "00") {
      return res.status(502).json({ error: header.resultMsg || "congestion API error", resultCode: header.resultCode });
    }

    const items = normalizeItems(data?.response?.body?.items);
    // waitTime="" 인 항목(미운영 게이트)은 숫자로 못 바꾸니 제외.
    const gates = items
      .filter((it) => it.terminalId === terminal && it.waitTime !== "")
      .map((it) => ({ gateId: it.gateId, waitTimeMin: Number(it.waitTime), waitLength: Number(it.waitLength) || 0 }));

    res.json({ gates });
  } catch (err) {
    res.status(502).json({ error: "failed to reach congestion API", detail: String(err) });
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

  try {
    // 카카오 로컬 카테고리 검색은 한 번에 최대 15개(size)까지만 주므로, 페이지(최대 3장 = 45개)를
    // 끝까지 넘기면서 다 모은다 — "지도에 있는 가게가 다 안 뜬다"는 문제의 실제 원인이 이 캡이었다.
    let places = [];
    for (let page = 1; page <= 3; page++) {
      const url = new URL(KAKAO_LOCAL_URL);
      url.searchParams.set("category_group_code", category);
      url.searchParams.set("x", lng);
      url.searchParams.set("y", lat);
      url.searchParams.set("radius", radius || "1500");
      url.searchParams.set("sort", "distance");
      url.searchParams.set("size", "15");
      url.searchParams.set("page", String(page));

      const apiRes = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } });
      const data = await apiRes.json().catch(() => ({}));
      if (!apiRes.ok) {
        if (page === 1) return res.status(502).json({ error: data.message || `kakao local API error (${apiRes.status})` });
        break; // 이미 1페이지는 받았으니 이후 페이지 실패는 조용히 무시하고 지금까지 모은 것만 반환
      }
      const docs = data.documents || [];
      places.push(...docs.map((d) => ({
        id: d.id,
        name: d.place_name,
        lat: Number(d.y),
        lng: Number(d.x),
        category: d.category_name,
      })));
      if (data.meta?.is_end !== false || docs.length < 15) break; // 다음 페이지가 없으면 그만 멈춘다
    }
    res.json({ places });
  } catch (err) {
    res.status(502).json({ error: "failed to reach kakao local API", detail: String(err) });
  }
});

// 카카오 로컬(키워드 검색) API — 올리브영·에뛰드처럼 카카오의 18개 category_group_code 어디에도
// 속하지 않는 리테일 브랜드(뷰티 등)를 이름으로 직접 찾을 때 쓴다. 같은 REST API 키를 그대로 쓴다.
const KAKAO_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

app.get("/api/places/search", async (req, res) => {
  const { lat, lng, query, radius } = req.query;
  if (!lat || !lng || !query) {
    return res.status(400).json({ error: "lat, lng, query query params are required" });
  }
  if (!KAKAO_REST_KEY) {
    return res.status(500).json({ error: "KAKAO_REST_API_KEY is not configured on the server" });
  }

  const url = new URL(KAKAO_KEYWORD_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("x", lng);
  url.searchParams.set("y", lat);
  url.searchParams.set("radius", radius || "3000");
  url.searchParams.set("sort", "distance");
  url.searchParams.set("size", "5");

  try {
    const apiRes = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } });
    const data = await apiRes.json().catch(() => ({}));
    if (!apiRes.ok) {
      return res.status(502).json({ error: data.message || `kakao local API error (${apiRes.status})` });
    }
    const places = (data.documents || []).map((d) => ({
      id: d.id,
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
      // ODsay returns errors as an array of {code, message}, not a single object.
      const detail = Array.isArray(data.error) ? data.error[0] : data.error;
      return res.status(502).json({ error: detail?.message || "odsay API error" });
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

// 예약 "요청" 저장소 — 아직 결제·재고 연동이 없는 제휴 호텔용. 고객은 결제 없이 연락처만 남기고,
// 실제 확정은 호텔이 그 연락처로 직접 회신하는 구조(MOU 초안 제3조)라 결제 API가 필요 없다.
// Supabase Postgres에 저장한다 — Render 등에 배포하면 로컬 파일시스템이 재배포마다 초기화돼서
// JSON 파일 방식으로는 데이터가 날아가기 때문에(2026-09-18 확인) DB로 옮겼다.
const DATABASE_URL = process.env.DATABASE_URL;
const pool = DATABASE_URL ? new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } }) : null;

async function ensureBookingRequestsTable() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_requests (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      room_name TEXT,
      check_in INTEGER NOT NULL,
      check_out INTEGER NOT NULL,
      price INTEGER,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      plan JSONB NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'requested',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

// DB row(snake_case) → API 응답 모양(camelCase). 프론트/관리자 페이지는 이 모양 그대로 기대한다.
function rowToRequest(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    roomName: row.room_name,
    checkIn: row.check_in,
    checkOut: row.check_out,
    price: row.price,
    name: row.name,
    phone: row.phone,
    plan: row.plan,
    status: row.status,
    createdAt: row.created_at.toISOString(),
  };
}

app.get("/api/booking-requests", async (req, res) => {
  if (!pool) return res.status(500).json({ error: "DATABASE_URL is not configured on the server" });
  const { rows } = await pool.query("SELECT * FROM booking_requests ORDER BY created_at DESC");
  res.json({ requests: rows.map(rowToRequest) });
});

app.post("/api/booking-requests", async (req, res) => {
  const { roomId, roomName, checkIn, checkOut, price, name, phone, plan } = req.body || {};
  if (!roomId || checkIn == null || checkOut == null || !name || !phone) {
    return res.status(400).json({ error: "roomId, checkIn, checkOut, name, phone are required" });
  }
  if (!pool) return res.status(500).json({ error: "DATABASE_URL is not configured on the server" });

  const id = `REQ${Date.now()}`;
  const { rows } = await pool.query(
    `INSERT INTO booking_requests (id, room_id, room_name, check_in, check_out, price, name, phone, plan)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [id, roomId, roomName || null, checkIn, checkOut, price ?? null, name, phone, JSON.stringify(Array.isArray(plan) ? plan : [])]
  );
  res.status(201).json({ request: rowToRequest(rows[0]) });
});

// 관리자 페이지에서 "확정/취소 처리" 버튼으로 쓰는 상태 변경 — 호텔에 전화로 확인한 결과를 수기로 반영.
const BOOKING_STATUSES = ["requested", "confirmed", "cancelled"];
app.patch("/api/booking-requests/:id", async (req, res) => {
  const { status } = req.body || {};
  if (!BOOKING_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${BOOKING_STATUSES.join(", ")}` });
  }
  if (!pool) return res.status(500).json({ error: "DATABASE_URL is not configured on the server" });

  const { rows } = await pool.query("UPDATE booking_requests SET status=$1 WHERE id=$2 RETURNING *", [status, req.params.id]);
  if (!rows.length) return res.status(404).json({ error: `no booking request with id "${req.params.id}"` });
  res.json({ request: rowToRequest(rows[0]) });
});

const PORT = process.env.PORT || 3001;
ensureBookingRequestsTable()
  .catch((err) => console.error("failed to set up booking_requests table:", err))
  .finally(() => {
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
      if (!DATABASE_URL) {
        console.warn("DATABASE_URL is not set — /api/booking-requests will fail until .env is configured.");
      }
    });
  });
