import { createElement, useEffect, useState } from "react";

type IconName =
  | "arrow"
  | "bag"
  | "bed"
  | "calendar"
  | "car"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "home"
  | "language"
  | "map"
  | "plane"
  | "route"
  | "search"
  | "shield"
  | "train"
  | "user"
  | "walk";

const paths: Record<IconName, string[]> = {
  arrow: ["M5 12h14", "m13 6 6 6-6 6"],
  bag: ["M7 8V6a5 5 0 0 1 10 0v2", "M5 8h14v11H5z", "M9 12v3", "M15 12v3"],
  bed: ["M4 18V7", "M4 14h16v4", "M8 14v-4h5a3 3 0 0 1 3 3v1", "M4 19v2", "M20 19v2"],
  calendar: ["M5 5h14v15H5z", "M8 3v4", "M16 3v4", "M5 10h14"],
  car: ["M4 16v-5l2-4h12l2 4v5", "M6 16h12", "M7 19h2", "M15 19h2", "M7 12h10"],
  check: ["m5 12 4 4L19 6"],
  chevron: ["m9 6 6 6-6 6"],
  clock: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18", "M12 7v5l3 2"],
  close: ["M6 6l12 12", "M18 6 6 18"],
  home: ["m4 11 8-7 8 7", "M6 10v10h12V10", "M10 20v-6h4v6"],
  language: ["M4 5h10", "M9 3v2c0 5-2 8-5 10", "M6 9c2 3 5 5 8 6", "m14 11 4 10", "m14 18 6 0"],
  map: ["m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2z", "M9 4v14", "M15 6v14"],
  plane: ["m3 11 18-7-7 17-3-6-5 2 2-5z"],
  route: ["M5 5h5a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h11", "m16 14 3 3-3 3"],
  search: ["M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12", "m15 15 5 5"],
  shield: ["M12 3 5 6v5c0 4 3 7 7 8 4-1 7-4 7-8V6z", "m9 12 2 2 4-5"],
  train: ["M6 4h12v12H6z", "M8 19l2-3", "M16 19l-2-3", "M9 8h6"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M5 21a7 7 0 0 1 14 0"],
  walk: ["M13 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0", "m11 8-2 5 3 2 2 6", "m9 13-4 7", "m11 9 4 3 4-1"],
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name].map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}

function Button({
  children,
  className = "",
  disabled,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return createElement(
    "button",
    { className: `button ${className}`, disabled, onClick, type },
    children,
  );
}

function Field({
  label,
  placeholder,
  value,
}: {
  label: string;
  placeholder?: string;
  value?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {createElement("input", { defaultValue: value, placeholder })}
    </label>
  );
}

type TimeSegment = {
  kind: "prep" | "travel" | "stay" | "margin" | "overrun";
  label: string;
  width: number;
};

const defaultTimeSegments: TimeSegment[] = [
  { kind: "prep", label: "준비 20분", width: 20 },
  { kind: "travel", label: "이동 28분", width: 28 },
  { kind: "stay", label: "체류 53분", width: 53 },
  { kind: "margin", label: "여유 30분", width: 30 },
];

const courseTimeSegments: TimeSegment[] = [
  { kind: "prep", label: "준비 20분", width: 20 },
  { kind: "travel", label: "이동 34분", width: 34 },
  { kind: "stay", label: "체류 42분", width: 42 },
  { kind: "margin", label: "여유 35분", width: 35 },
];

function TimeBar({
  compact = false,
  segments = defaultTimeSegments,
}: {
  compact?: boolean;
  segments?: TimeSegment[];
}) {
  const totalMinutes = segments.reduce((total, segment) => total + segment.width, 0);
  return (
    <div className={compact ? "timebar-wrap course-timebar compact" : "timebar-wrap course-timebar"}>
      <div className="timebar-labels">
        {segments.map((segment) => <span key={`${segment.kind}-${segment.label}`}>{segment.label}</span>)}
      </div>
      <div className="timebar" aria-label={`시간 구성: ${segments.map((segment) => segment.label).join(", ")}, 총 ${totalMinutes}분`}>
        {segments.map((segment) => <i className={segment.kind} data-size={segment.width} key={`${segment.kind}-${segment.label}`} />)}
      </div>
      {!compact && (
        <div className="bar-key">
          <span><i className="key prep" />준비</span>
          <span><i className="key travel" />이동</span>
          <span><i className="key stay" />체류</span>
          <span><i className="key margin" />여유</span>
        </div>
      )}
    </div>
  );
}

function TransitTimeBar({ courseSegments = defaultTimeSegments }: { courseSegments?: TimeSegment[] }) {
  const segments = [
    { kind: "deduction", label: "입국 심사", minutes: 50, source: "안전 기준" },
    { kind: "available", label: "외출 가능", minutes: 131, source: "실시간" },
    { kind: "deduction", label: "출국 보안", minutes: 50, source: "안전 기준" },
    { kind: "deduction", label: "탑승구 여유", minutes: 30, source: "안전 기준" },
  ];
  return (
    <div className="transit-timebar">
      <div className="transit-bar" aria-label="환승 총 시간 261분: 입국 심사 50분, 외출 가능 131분, 출국 보안 50분, 탑승구 여유 30분">
        {segments.map((segment) => <i className={segment.kind} data-minutes={segment.minutes} key={`${segment.label}-${segment.minutes}`} />)}
      </div>
      <div className="transit-labels">
        {segments.map((segment) => <span key={segment.label}><strong>{segment.label}</strong><b>{segment.minutes}분</b><small className="source-badge">{segment.source}</small></span>)}
      </div>
      <div className="nested-course-row"><span /><div><small>외출 가능 구간 안의 코스</small><TimeBar compact segments={courseSegments} /></div><span /></div>
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark"><span /></span>
      <span>TimeStay</span>
      <small>타임스테이</small>
    </div>
  );
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

const flight = (
  <div className="flight-line">
    <div><strong>KE 901</strong><small>도착</small><b>09:40</b></div>
    <div className="flight-rule"><Icon name="plane" size={17} /></div>
    <div><strong>KE 017</strong><small>출발</small><b>16:10</b></div>
  </div>
);

function AppHeader({ title, onFlight }: { title?: string; onFlight?: () => void }) {
  return (
    <div className="app-header">
      {title ? <div className="screen-title">{title}</div> : <Brand />}
      <Button className="flight-chip" onClick={onFlight}>
        <Icon name="plane" size={15} /> KE017 · T2
      </Button>
    </div>
  );
}

function SystemStatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`system-status-bar ${dark ? "dark" : "light"}`}>
      <strong>9:41</strong>
      <div className="system-status-icons" aria-label="신호 양호, 배터리 82%">
        <span className="signal-icon"><i /><i /><i /><i /></span>
        <span className="wifi-icon"><i /></span>
        <span className="battery-icon"><i /></span>
      </div>
    </div>
  );
}

function SplashScreen() {
  return <div className="start-screen splash-screen"><Brand /><div className="splash-time"><span className="loader" /><strong>안전한 시간을 준비하고 있어요</strong><small>TIME FIRST · STAY LIGHT</small></div></div>;
}

function MaintenanceScreen() {
  return <div className="start-screen system-message-screen"><span className="system-message-icon"><Icon name="clock" size={30} /></span><Pill tone="neutral">SERVER MAINTENANCE</Pill><div className="flow-title">잠시 점검 중이에요</div><p>더 안정적인 서비스를 위해 서버를 점검하고 있어요. 항공편 정보는 공항 공식 안내에서 확인해 주세요.</p><div className="maintenance-time"><span>예상 완료</span><strong>오늘 오전 6:30</strong></div><Button className="secondary full">다시 확인</Button></div>;
}

function UpdateRequiredScreen() {
  return <div className="start-screen system-message-screen"><span className="system-message-icon brand"><Icon name="arrow" size={30} /></span><Pill tone="blue">UPDATE REQUIRED</Pill><div className="flow-title">새 버전이 필요해요</div><p>정확한 실시간 계산과 알림을 위해 TimeStay를 업데이트해 주세요.</p><Button className="primary full large">업데이트하기 <Icon name="arrow" /></Button></div>;
}

function DeviceFrameOverlay() {
  return (
    <div className="device-frame-overlay" aria-hidden="true">
      <div className="device-frame-top">
        <SystemStatusBar />
        <span className="device-notch" />
      </div>
      <i className="device-rail left" />
      <i className="device-rail right" />
      <div className="device-frame-bottom"><i /></div>
    </div>
  );
}

function SafeCard({ onBarOpen, onOpen }: { onBarOpen: () => void; onOpen: () => void }) {
  return (
    <div className="safe-card">
      <div className="eyebrow"><Icon name="shield" size={15} /> TIME-SAFE · 실시간 계산</div>
      <div className="safe-main">
        <div><span>안심하고 쓸 수 있는 시간</span><strong>2<small>시간</small> 11<small>분</small></strong></div>
        <Pill tone="positive">여유 있음</Pill>
      </div>
      <Button className="transit-bar-button" onClick={onBarOpen}><TransitTimeBar /></Button>
      <div className="timebar-summary">사용 1시간 41분 · 가능 2시간 11분</div>
      <Button className="text-action" onClick={onOpen}>계산 근거 보기 <Icon name="chevron" size={16} /></Button>
    </div>
  );
}

function HotelCard({
  name,
  price,
  quote,
  onOpen,
}: {
  name: string;
  price?: string;
  quote?: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="hotel-card" onClick={onOpen}>
      <div className="hotel-photo">
        <Icon name="bed" size={28} />
        <span>사진 준비 중</span>
      </div>
      <div className="hotel-copy">
        <div><Pill tone="gold">HOTEL BASE</Pill>{price && <Pill tone="outline">데모 가격</Pill>}</div>
        <strong>{name}</strong>
        <span>공항 8.4km · 이용 11:00–17:00</span>
        <span className="hotel-amenities"><Icon name="bed" size={14} />샤워·휴식 <Icon name="bag" size={14} />보관</span>
        <b>{quote ? "가격 확인 중" : `${price}~ / 블록`}</b>
      </div>
      <Icon name="chevron" size={18} />
    </div>
  );
}

function HomeScreen({
  go,
  onFlight,
  refreshing = false,
}: {
  go: (screen: string) => void;
  onFlight: () => void;
  refreshing?: boolean;
}) {
  const [sheet, setSheet] = useState(false);
  const [timeSheet, setTimeSheet] = useState(false);
  return (
    <>
      <AppHeader onFlight={onFlight} />
      <main className="mobile-main">
        {refreshing && <div className="home-refreshing"><span className="small-loader" /><div><strong>최신 정보를 갱신하고 있어요</strong><small>저장된 항공편을 먼저 보여드려요.</small></div></div>}
        <div className="hello"><span>안전 계산 구간 4시간 21분</span><strong>지금, 공항 밖에서<br />숨을 돌릴 시간이 있어요.</strong></div>
        <SafeCard onBarOpen={() => setTimeSheet(true)} onOpen={() => go("safe")} />
        <div className="build-course-entry" onClick={() => go("course")}>
          <span className="round-icon"><Icon name="route" /></span>
          <div><Pill tone="blue">TIME-FIT</Pill><strong>내 시간에 맞춰 코스 만들기</strong><span>숙소를 베이스로 장소와 이동 시간을 자동 구성해요.</span></div>
          <Icon name="arrow" />
        </div>
        <div className="section-head"><div><small>TIME-FIT</small><strong>시간에 꼭 맞는 코스</strong></div><Button className="link">전체 보기</Button></div>
        <div className="course-card" onClick={() => go("course-detail")}>
          <div className="course-top">
            <div><Pill tone="blue">추천 01</Pill><strong>바다 가까이, 가볍게</strong><span>호텔 체크인 전 산책하기 좋은 코스</span></div>
            <div className="duration">1<small>시간</small> 36<small>분</small></div>
          </div>
          <div className="mini-route">
            <span className="airport"><Icon name="plane" size={14} /></span><i />
            <span className="hotel"><Icon name="bed" size={14} /></span><i />
            <span>1</span><i className="return" /><span className="airport"><Icon name="plane" size={14} /></span>
          </div>
          <div className="course-meta"><span>호텔 베이스</span><span>마시안 해변</span><b>18분 여유</b></div>
        </div>
        <div className="luggage-banner" onClick={() => go("luggage")}>
          <span className="round-icon"><Icon name="bag" /></span>
          <div><strong>가방 없이 가볍게 출발하세요</strong><span>호텔·공항 수하물 보관 안내</span></div>
          <Icon name="chevron" />
        </div>
        <div className="section-head"><div><small>DAY-USE BASE</small><strong>잠시 머무를 호텔</strong></div></div>
        <HotelCard name="에어포트 브릿지 호텔" price="₩48,000" onOpen={() => go("hotel")} />
        <HotelCard name="오션 파크 레지던스" quote onOpen={() => go("hotel")} />
        <div className="section-head"><div><small>NEARBY</small><strong>지금 갈 수 있는 인기 장소</strong></div></div>
        <div className="places">
          {["마시안 해변", "파라다이스 아트스페이스", "용유역 산책길"].map((place, i) => (
            <div className="place" key={place} onClick={() => setSheet(true)}>
              <span>{String(i + 1).padStart(2, "0")}</span><strong>{place}</strong><small>{28 + i * 12}분 체류 가능</small>
            </div>
          ))}
        </div>
      </main>
      {sheet && (
        <div className="sheet">
          <Button className="sheet-close" onClick={() => setSheet(false)}><Icon name="close" /></Button>
          <div className="place-visual"><span>01</span><div>SEA · WALK · REST</div></div>
          <Pill tone="blue">추천 장소</Pill>
          <div className="sheet-title">마시안 해변</div>
          <p>공항에서 가장 가까운 바다 산책로예요. 남은 시간 안에서 여유롭게 다녀올 수 있어요.</p>
          <div className="sheet-stats"><span><Icon name="car" />택시 14분</span><span><Icon name="clock" />추천 체류 35분</span></div>
          <Button className="primary full" onClick={() => go("course")}>이 장소로 코스 보기</Button>
        </div>
      )}
      {timeSheet && (
        <div className="sheet calculation-sheet">
          <Button className="sheet-close" onClick={() => setTimeSheet(false)}><Icon name="close" /></Button>
          <Pill tone="blue">TIME-SAFE CALCULATION</Pill>
          <div className="sheet-title">이 시간은 이렇게 계산됐어요</div>
          <p>환승 총 시간에서 공항 절차와 안전 여유를 차례로 뺀 값이에요.</p>
          <div className="calculation-formula"><div><span>환승 총 시간</span><strong>4시간 21분</strong><Pill tone="outline">실시간</Pill></div><i>−</i><div className="deducted"><span>입국 심사</span><strong>50분</strong><Pill tone="neutral">안전 기준</Pill></div><i>−</i><div className="deducted"><span>출국 보안</span><strong>50분</strong><Pill tone="neutral">안전 기준</Pill></div><i>−</i><div className="deducted"><span>탑승구 여유</span><strong>30분</strong><Pill tone="neutral">안전 기준</Pill></div><i>=</i><div className="available-result"><span>외출 가능</span><strong>2시간 11분</strong><Pill tone="outline">실시간</Pill></div></div>
          <TransitTimeBar />
          <Button className="primary full" onClick={() => { setTimeSheet(false); go("safe"); }}>계산 상세 보기</Button>
        </div>
      )}
    </>
  );
}

function getPreferredLanguage() {
  if (typeof window === "undefined") return "English";
  const stored = window.localStorage.getItem("timestay-language");
  if (stored) return stored;
  const deviceLanguage = window.navigator.language.toLowerCase();
  if (deviceLanguage.startsWith("ko")) return "한국어";
  if (deviceLanguage.startsWith("zh")) return "中文";
  if (deviceLanguage.startsWith("ja")) return "日本語";
  if (deviceLanguage.startsWith("vi")) return "Tiếng Việt";
  return "English";
}

function Onboarding({ demo = false, done, initialNotice = false, startStep }: { demo?: boolean; done: () => void; initialNotice?: boolean; startStep: 1 | 2 }) {
  type LookupState = "idle" | "loading" | "success";
  const languages = ["한국어", "English", "中文", "日本語", "Tiếng Việt"];
  const [step, setStep] = useState<1 | 2>(startStep);
  const [language, setLanguage] = useState(getPreferredLanguage);
  const [showEntryNotice, setShowEntryNotice] = useState(initialNotice);
  const [showNotificationSheet, setShowNotificationSheet] = useState(false);
  const [arrivalState, setArrivalState] = useState<LookupState>("idle");
  const [departureState, setDepartureState] = useState<LookupState>("idle");
  const lookup = (kind: "arrival" | "departure") => {
    const setState = kind === "arrival" ? setArrivalState : setDepartureState;
    setState("loading");
    window.setTimeout(() => setState("success"), 650);
  };
  const lookupComplete = arrivalState === "success" && departureState === "success";
  const advance = () => {
    if (step === 1) {
      if (!demo) window.localStorage.setItem("timestay-language", language);
      setShowEntryNotice(true);
    } else {
      setShowNotificationSheet(true);
    }
  };
  const confirmEntryNotice = () => {
    if (!demo) window.localStorage.setItem("timestay-entry-notice-seen", "true");
    setShowEntryNotice(false);
    setStep(2);
  };
  const finish = (notification: "allowed" | "later") => {
    if (!demo) {
      window.localStorage.setItem("timestay-flight-state", "active");
      window.localStorage.setItem("timestay-notification", notification);
    }
    done();
  };
  return (
    <div className="onboarding">
      <div className="onboarding-head"><Brand /><Pill tone="neutral">{language}</Pill></div>
      <div className="onboarding-progress" aria-label={`온보딩 ${step}/2단계`}>
        {[1, 2].map((item) => <span className={item === step ? "active" : item < step ? "complete" : ""} key={item}><i />{item}</span>)}
      </div>
      {showEntryNotice && (
        <div className="onboarding-stage entry-notice-stage">
          <div className="notice-illustration"><Icon name="shield" size={42} /><span>TIME-SAFE</span></div>
          <Pill tone="blue">BEFORE YOU GO</Pill>
          <div className="big-title">시간 계산은<br />입국 허가가 아니에요.</div>
          <p>공항 밖으로 나갈 수 있다는 계산이 대한민국 입국 허가를 보장하지 않아요. 비자와 입국 조건은 여행자가 직접 확인해야 합니다.</p>
          <div className="notice-checks"><span><Icon name="check" />여권과 비자 조건 확인</span><span><Icon name="check" />입국 심사관의 최종 판단</span><span><Icon name="check" />항공편 변경 수시 확인</span></div>
        </div>
      )}
      {!showEntryNotice && step === 1 && (
        <div className="onboarding-stage">
          <div className="onboarding-copy">
            <span className="step">01 — LANGUAGE</span>
            <div className="big-title">어떤 언어로<br />안내해 드릴까요?</div>
            <p>언어는 마이 화면에서 언제든 변경할 수 있어요.</p>
          </div>
          <div className="choice-list">
            {languages.map((item) => <Button className={language === item ? "choice-card selected" : "choice-card"} key={item} onClick={() => setLanguage(item)}><Icon name="language" /><span>{item}</span>{language === item && <span className="choice-check"><Icon name="check" size={16} /></span>}</Button>)}
          </div>
        </div>
      )}
      {!showEntryNotice && step === 2 && (
        <div className="onboarding-stage flight-stage">
          <div className="onboarding-copy">
            <span className="step">02 — FLIGHTS</span>
            <div className="big-title">두 항공편을<br />실시간으로 확인할게요.</div>
            <p>도착편과 다음 환승편을 모두 조회하면 안전하게 외출할 시간을 계산합니다.</p>
          </div>
          <div className="flight-query">
            <div className="lookup"><Field label="방금 도착한 항공편" value="KE 901" /><Button className="live-lookup" onClick={() => lookup("arrival")}>{arrivalState === "loading" ? <span className="small-loader" /> : <Icon name="search" />}실시간 조회</Button></div>
            <div className={`lookup-feedback ${arrivalState}`}>{arrivalState === "idle" ? "아직 조회하지 않았어요" : arrivalState === "loading" ? "운항 정보를 조회하고 있어요" : "KE 901 · 도착 정보 확인"}</div>
          </div>
          <div className="flight-query">
            <div className="lookup"><Field label="다음 환승 항공편" value="KE 017" /><Button className="live-lookup" onClick={() => lookup("departure")}>{departureState === "loading" ? <span className="small-loader" /> : <Icon name="search" />}실시간 조회</Button></div>
            <div className={`lookup-feedback ${departureState}`}>{departureState === "idle" ? "아직 조회하지 않았어요" : departureState === "loading" ? "운항 정보를 조회하고 있어요" : "KE 017 · 출발 정보 확인"}</div>
          </div>
          {lookupComplete && (
            <div className="transit-result">
              <div className="result-status"><span><Icon name="check" size={14} /></span>두 항공편 실시간 조회 완료 <Pill tone="positive">연결 확인</Pill></div>
              <div className="result-flight">
                <div><small>방금 도착</small><strong>Korean Air · KE 901</strong><span>Paris CDG → Seoul ICN</span><b>T2 · Gate 251</b></div>
                <Pill tone="danger">20분 지연</Pill>
              </div>
              <div className="result-flight">
                <div><small>다음 환승</small><strong>Korean Air · KE 017</strong><span>Seoul ICN → New York JFK</span><b>T2 · Gate 249</b></div>
                <Pill tone="positive">정상 운항</Pill>
              </div>
              <div className="transit-facts"><div><span>총 환승 시간</span><strong>4시간 21분</strong></div><div><span>권장 공항 복귀</span><strong>오후 3:10</strong></div></div>
              <div className="result-time"><span>외출 가능 시간</span><strong>2시간 11분</strong><TimeBar compact /><small>사용 1시간 41분 · 여유 30분</small></div>
            </div>
          )}
          <p className="fine-print">항공편 정보는 공항 및 항공사 상황에 따라 변경될 수 있어요.</p>
        </div>
      )}
      <div className="onboarding-actions">
        {showEntryNotice ? <Button className="primary large" onClick={confirmEntryNotice}>확인했어요 <Icon name="arrow" /></Button> : <Button className="primary large" disabled={step === 2 && !lookupComplete} onClick={advance}>{step === 2 ? "안전 시간 계산하기" : "다음"} <Icon name="arrow" /></Button>}
      </div>
      {showNotificationSheet && <div className="permission-sheet"><span className="permission-icon"><Icon name="shield" size={28} /></span><Pill tone="blue">TIME-SAFE ALERT</Pill><div className="flow-title">항공편 변경과 복귀 시각<br />알림을 받을까요?</div><p>출발 시간 변경, 복귀 임박, 안전 시간 재계산 결과를 알려드려요.</p><div><Button className="secondary" onClick={() => finish("later")}>나중에</Button><Button className="primary" onClick={() => finish("allowed")}>알림 허용</Button></div></div>}
    </div>
  );
}

function SafeScreen({ back }: { back: () => void }) {
  return (
    <>
      <AppHeader title="Time-Safe 계산" />
      <main className="mobile-main safe-page">
        <div className="changed-banner"><Icon name="clock" /><span><strong>출발 시간이 20분 변경됐어요</strong>최신 정보로 다시 계산했습니다.</span></div>
        <div className="safe-hero">
          <span>공항 밖에서 쓸 수 있는 시간</span>
          <strong>2<small>시간</small> 11<small>분</small></strong>
          <Pill tone="positive">안심 구간</Pill>
          <div className="asof">14:22 기준 · 실시간 계산 <Button className="refresh">새로고침</Button></div>
        </div>
        <div className="panel">
          <div className="panel-title">시간 계산 내역 <Pill tone="blue">안전 기준 적용</Pill></div>
          {[["입국 심사", "약 50분"], ["출국 보안", "약 50분"], ["탑승구 여유", "약 30분"]].map(([a, b]) => (
            <div className="calc-row" key={a}><span>{a}</span><b>{b}</b></div>
          ))}
          <div className="estimate-note"><Icon name="shield" />실시간 18분 · 안전 하한 50분 적용</div>
        </div>
        <TransitTimeBar />
        <Button className="primary full large" onClick={back}>이 시간에 맞는 코스 보기</Button>
        <Button className="text-action centered">항공편 변경하기</Button>
      </main>
    </>
  );
}

const builderPlaces = [
  { category: "관광", name: "마시안 해변", address: "인천 중구 마시란로 118", travel: "14분", stay: "35분", fits: true },
  { category: "음식", name: "영종 바다식당", address: "인천 중구 용유서로 272", travel: "11분", stay: "45분", fits: true },
  { category: "쇼핑", name: "인스파이어 몰", address: "인천 중구 공항문화로 127", travel: "18분", stay: "60분", fits: false },
];

function getStoredCourseCategories() {
  if (typeof window === "undefined") return ["휴식", "관광"];
  try {
    const raw = window.localStorage.getItem("timestay-course-categories");
    if (!raw) return ["휴식", "관광"];
    const stored = JSON.parse(raw);
    return Array.isArray(stored) ? stored : ["휴식", "관광"];
  } catch {
    return ["휴식", "관광"];
  }
}

function CourseBuilder({ openDetail, openHotels }: { openDetail: () => void; openHotels: () => void }) {
  const categories = ["음식", "마사지", "쇼핑", "휴식", "뷰티", "관광", "브랜드"];
  const [selectedHotel, setSelectedHotel] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(getStoredCourseCategories);
  const [selectedPlaces, setSelectedPlaces] = useState([0]);
  const [activePlace, setActivePlace] = useState(0);
  const [dwellMinutes, setDwellMinutes] = useState(35);
  const [mapZoomed, setMapZoomed] = useState(false);
  const overrun = selectedPlaces.length >= 3 || dwellMinutes > 55;
  const builderSegments: TimeSegment[] = overrun ? [
    { kind: "prep", label: "준비 20분", width: 20 },
    { kind: "travel", label: "이동 40분", width: 40 },
    { kind: "stay", label: "체류 71분", width: 71 },
    { kind: "overrun", label: "초과 24분", width: 24 },
  ] : courseTimeSegments;
  const toggleCategory = (category: string) => setSelectedCategories((current) => {
    const next = current.includes(category) ? current.filter((item) => item !== category) : [...current, category];
    window.localStorage.setItem("timestay-course-categories", JSON.stringify(next));
    return next;
  });
  const togglePlace = (index: number) => setSelectedPlaces((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  return (
    <>
      <AppHeader title="코스 만들기" />
      <main className="mobile-main course-builder">
        <section className={`builder-gauge ${overrun ? "over" : ""}`}>
          <div className="builder-gauge-head"><div><small>외출 가능 시간</small><strong>{overrun ? "2시간 35분 사용" : "1시간 36분 사용"}</strong></div><div><span>가능 2시간 11분</span><b>{overrun ? "24분 초과" : "35분 남음"}</b></div></div>
          <TimeBar compact segments={builderSegments} />
          <div className="builder-times"><span><Icon name="plane" size={15} />도착 10:30</span><span><Icon name="clock" size={15} />복귀 15:10</span></div>
        </section>

        <div className="section-head"><div><small>01 — HOME BASE</small><strong>숙소 선택 <em>필수</em></strong></div></div>
        <div className="hotel-scroll">
          {[
            ["에어포트 브릿지 호텔", "공항 8.4km", "11:00–17:00", "₩48,000"],
            ["오션 파크 레지던스", "공항 10.1km", "10:30–18:30", "₩55,000"],
          ].map((hotel, index) => (
            <Button className={selectedHotel === index ? "builder-hotel selected" : "builder-hotel"} key={hotel[0]} onClick={() => setSelectedHotel(index)}>
              <span className="builder-hotel-photo"><Icon name="bed" /><small>사진 준비 중</small></span>
              <span className="builder-hotel-copy"><span><Pill tone="gold">HOTEL BASE</Pill><Pill tone="outline">데모 가격</Pill></span><strong>{hotel[0]}</strong><small>{hotel[1]} · 이용 {hotel[2]}</small><span className="amenities"><Icon name="bag" size={15} />짐 보관 <Icon name="bed" size={15} />샤워 <Icon name="language" size={15} />EN</span><b>{hotel[3]}</b></span>
              {selectedHotel === index && <span className="hotel-selected"><Icon name="check" size={15} /></span>}
            </Button>
          ))}
          <Button className="all-hotels-card" onClick={openHotels}><span><Icon name="search" /></span><strong>호텔 전체 보기</strong><small>시간에 맞는 베이스 찾기</small><Icon name="arrow" /></Button>
        </div>

        <div className="section-head"><div><small>02 — PLACES</small><strong>주변 장소 탐색</strong></div><Pill tone="neutral">탭하여 보기</Pill></div>
        <div className={mapZoomed ? "builder-map zoomed" : "builder-map"}>
          <div className="builder-map-grid" />
          <Button className="map-zoom" onClick={() => setMapZoomed((zoomed) => !zoomed)}>{mapZoomed ? "− 축소" : "+ 확대"}</Button>
          <span className="builder-base-pin"><Icon name="bed" size={17} /></span>
          <i className="builder-route transit"><b /><b /></i><i className="builder-route taxi" /><i className="builder-route walk" /><i className="builder-route return" />
          {builderPlaces.map((place, index) => <Button className={selectedPlaces.includes(index) ? "builder-place-pin added" : "builder-place-pin"} key={place.name} onClick={() => setActivePlace(index)}>{selectedPlaces.includes(index) ? selectedPlaces.indexOf(index) + 1 : ""}</Button>)}
          <span className="reference-dot hospital">H<small>병원</small></span><span className="reference-dot pharmacy">+<small>약국</small></span>
          <div className="map-place-info"><div><Pill tone="blue">{builderPlaces[activePlace].category}</Pill><strong>{builderPlaces[activePlace].name}</strong><small>{builderPlaces[activePlace].address}</small></div><Button className={selectedPlaces.includes(activePlace) ? "secondary" : "primary"} disabled={!builderPlaces[activePlace].fits && !selectedPlaces.includes(activePlace)} onClick={() => togglePlace(activePlace)}>{selectedPlaces.includes(activePlace) ? "제거" : builderPlaces[activePlace].fits ? "+ 추가" : "추가 불가"}</Button></div>
        </div>
        <div className="map-legend"><span><i className="transit" />대중교통</span><span><i className="taxi" />택시</span><span><i className="walk" />도보</span><span><i className="return" />공항 복귀</span></div>

        <div className="category-chips">{categories.map((category) => <Button className={selectedCategories.includes(category) ? "category-chip selected" : "category-chip"} key={category} onClick={() => toggleCategory(category)}>{selectedCategories.includes(category) && <Icon name="check" size={14} />}{category}</Button>)}</div>
        <Button className="primary full large" onClick={() => setSelectedPlaces([0, 1])}><Icon name="route" />Time-Fit으로 자동 구성</Button>
        <div className="realtime-note"><Icon name="clock" /><span><strong>실시간 이동 시간 반영</strong>교통 상황이 바뀌면 남은 시간과 복귀 시각을 다시 계산해요.</span></div>

        <div className="section-head"><div><small>RECOMMENDED</small><strong>장소 목록</strong></div></div>
        <div className="builder-place-list">
          {builderPlaces.map((place, index) => (
            <div className={`builder-place-card ${!place.fits ? "unavailable" : ""}`} key={place.name}>
              <div><Pill tone="blue">{place.category}</Pill><Pill tone={place.fits ? "positive" : "danger"}>{place.fits ? "시간 내 가능" : "시간 초과 시 제외"}</Pill></div>
              <strong>{place.name}</strong><span>{place.address}</span>
              <div className="place-card-footer"><span><Icon name="car" size={16} />이동 {place.travel} <Pill tone="neutral">추정</Pill></span><Button className={selectedPlaces.includes(index) ? "secondary" : "primary"} disabled={!place.fits && !selectedPlaces.includes(index)} onClick={() => togglePlace(index)}>{selectedPlaces.includes(index) ? "제거" : "+ 추가"}</Button></div>
            </div>
          ))}
        </div>
        <Button className="secondary full">더 보기</Button>

        <div className="section-head"><div><small>MY ITINERARY</small><strong>내 일정</strong></div></div>
        <div className="itinerary">
          <div className="timeline-row"><time>10:55</time><i className="gold-dot" /><div><strong>에어포트 브릿지 호텔</strong><span>짐 맡기기 · 체크인 11:00</span></div></div>
          {selectedPlaces.map((placeIndex, index) => (
            <div className="timeline-row" key={builderPlaces[placeIndex].name}><time>{index === 0 ? "11:20" : "12:25"}</time><i className="blue-dot">{index + 1}</i><div><strong>{builderPlaces[placeIndex].name}</strong><span>체류 {index === 0 ? dwellMinutes : 45}분</span>{index === 0 && <span className="dwell-control"><Button onClick={() => setDwellMinutes((minutes) => Math.max(15, minutes - 10))}>−</Button><b>{dwellMinutes}분</b><Button onClick={() => setDwellMinutes((minutes) => minutes + 10)}>+</Button></span>}</div><Button className="remove-stop" onClick={() => togglePlace(placeIndex)}><Icon name="close" size={16} />제거</Button></div>
          ))}
          <div className="timeline-row return-row"><time>14:26</time><i className="red-dot" /><div><strong>인천공항 T2 복귀</strong><span>이동 14분 · 안전 여유 30분 포함</span></div></div>
        </div>
        {overrun && <div className="builder-warning"><Icon name="clock" /><span><strong>가능 시간을 24분 초과했어요</strong>장소를 제거하거나 체류 시간을 줄여 주세요.</span></div>}
        <Button className="primary full large" disabled={overrun || selectedPlaces.length === 0} onClick={openDetail}>코스 저장 <Icon name="arrow" /></Button>
      </main>
    </>
  );
}

const hotelSearchResults = [
  {
    name: "에어포트 브릿지 호텔",
    airport: "공항 10분",
    roundTrip: "왕복 20분",
    remaining: "남는 체류 1시간 21분",
    hours: "11:00–17:00",
    price: "₩48,000~",
    available: true,
    segments: [
      { kind: "travel", label: "이동 20분", width: 20 },
      { kind: "stay", label: "체류 81분", width: 81 },
      { kind: "margin", label: "여유 30분", width: 30 },
    ] as TimeSegment[],
  },
  {
    name: "오션 파크 레지던스",
    airport: "공항 17분",
    roundTrip: "왕복 34분",
    remaining: "남는 체류 1시간 7분",
    hours: "10:30–18:30",
    price: "₩55,000~",
    available: true,
    segments: [
      { kind: "travel", label: "이동 34분", width: 34 },
      { kind: "stay", label: "체류 67분", width: 67 },
      { kind: "margin", label: "여유 30분", width: 30 },
    ] as TimeSegment[],
  },
  {
    name: "영종 스카이 라운지",
    airport: "공항 32분",
    roundTrip: "왕복 64분",
    remaining: "남는 체류 37분",
    hours: "13:00–19:00",
    price: "₩42,000~",
    available: false,
    segments: [
      { kind: "travel", label: "이동 64분", width: 64 },
      { kind: "stay", label: "체류 37분", width: 37 },
      { kind: "margin", label: "여유 30분", width: 30 },
    ] as TimeSegment[],
  },
];

function HotelFindScreen({ selectHotel }: { selectHotel: () => void }) {
  const filterOptions = ["10분 이내", "10~20분", "20~30분", "30분 이상", "오전 이용", "오후 이용", "샤워", "휴식", "짐 보관", "₩5만 이하"];
  const sortOptions = ["남는 체류 시간 많은 순", "공항에서 가까운 순", "가격 낮은 순"];
  const [view, setView] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState(["10~20분", "샤워"]);
  const [sort, setSort] = useState(sortOptions[0]);
  const [activeHotel, setActiveHotel] = useState(0);
  const toggleFilter = (filter: string) => setFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
  return (
    <>
      <AppHeader title="호텔 찾기" />
      <main className="mobile-main hotel-find">
        <section className="hotel-time-summary">
          <div><span>외출 가능 시간</span><strong>사용 1시간 36분 / 가능 2시간 11분</strong><b>35분 남음</b></div>
          <TimeBar compact segments={courseTimeSegments} />
        </section>
        <div className="view-tabs"><Button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><Icon name="bed" />목록</Button><Button className={view === "map" ? "active" : ""} onClick={() => setView("map")}><Icon name="map" />지도</Button></div>
        <section className="hotel-filters">
          <div className="filter-head"><div><strong>필터</strong><Pill tone="blue">{filters.length}개 선택</Pill></div><Button className="text-action" onClick={() => setFilters([])}>초기화</Button></div>
          <div className="filter-scroll">{filterOptions.map((filter) => <Button className={filters.includes(filter) ? "filter-chip selected" : "filter-chip"} key={filter} onClick={() => toggleFilter(filter)}>{filters.includes(filter) && <Icon name="check" size={14} />}{filter}</Button>)}</div>
        </section>
        <div className="sort-section"><span>정렬</span><div>{sortOptions.map((option) => <Button className={sort === option ? "active" : ""} key={option} onClick={() => setSort(option)}>{option}</Button>)}</div></div>
        {view === "list" ? (
          <div className="hotel-result-list">
            {hotelSearchResults.map((hotel, index) => (
              <div className={hotel.available ? "hotel-result-card" : "hotel-result-card disabled"} key={hotel.name}>
                <div className="hotel-result-photo"><Icon name="bed" /><span>사진 준비 중</span>{!hotel.available && <Pill tone="danger">시간 부족</Pill>}</div>
                <div className="hotel-result-content">
                  <div><Pill tone="gold">HOTEL BASE</Pill><Pill tone="outline">데모 가격</Pill></div>
                  <strong>{hotel.name}</strong><span>{hotel.airport}</span>
                  <b>{hotel.roundTrip} → {hotel.remaining}</b>
                  <TimeBar compact segments={hotel.segments} />
                  <small>이용 {hotel.hours}</small>
                  <span className="hotel-result-amenities"><Icon name="bed" size={14} />샤워·휴식 <Icon name="bag" size={14} />짐 보관</span>
                  <div className="hotel-result-action"><strong>{hotel.price} <small>/ 블록</small></strong><Button className={hotel.available ? "primary" : "secondary"} disabled={!hotel.available} onClick={() => { setActiveHotel(index); selectHotel(); }}>선택</Button></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="hotel-map-view">
            <div className="hotel-map-grid" />
            <span className="airport-map-pin"><Icon name="plane" /></span>
            {hotelSearchResults.map((hotel, index) => <Button className={`hotel-map-pin pin-${index}${activeHotel === index ? " active" : ""}${!hotel.available ? " disabled" : ""}`} key={hotel.name} onClick={() => setActiveHotel(index)}><Icon name="bed" size={16} /></Button>)}
            <i className="hotel-map-route" />
            <div className={hotelSearchResults[activeHotel].available ? "map-hotel-preview" : "map-hotel-preview disabled"}><div><Pill tone={hotelSearchResults[activeHotel].available ? "gold" : "danger"}>{hotelSearchResults[activeHotel].available ? "HOTEL BASE" : "시간 부족"}</Pill><strong>{hotelSearchResults[activeHotel].name}</strong><span>{hotelSearchResults[activeHotel].airport} · {hotelSearchResults[activeHotel].remaining}</span><b>{hotelSearchResults[activeHotel].price} / 블록</b></div><Button className="primary" disabled={!hotelSearchResults[activeHotel].available} onClick={selectHotel}>이 호텔로 코스 만들기</Button></div>
          </div>
        )}
      </main>
    </>
  );
}

function CourseScreen() {
  return (
    <div className="map-screen">
      <AppHeader title="Time-Fit 코스" />
      <div className="map-canvas">
        <div className="map-grid" />
        <div className="water">YELLOW SEA</div>
        <div className="road r1" /><div className="road r2" /><div className="road r3" />
        <span className="map-pin airport-pin"><Icon name="plane" size={17} /><small>공항 T2</small></span>
        <span className="map-pin hotel-pin"><Icon name="bed" size={17} /><small>호텔</small></span>
        <span className="map-pin place-pin">1<small>마시안 해변</small></span>
        <div className="route-line transit" /><div className="route-line walk" /><div className="route-line return" />
        <span className="travel-chip chip-a"><Icon name="train" /> <b>12분</b><small>추정 · 8.4 km</small></span>
        <span className="travel-chip chip-b"><Icon name="walk" /> <b>8분</b><small>추정 · 620 m</small></span>
        <span className="travel-chip chip-c"><Icon name="car" /> <b>14분</b><small>공항 복귀</small></span>
      </div>
      <div className="map-sheet">
        <div className="handle" />
        <div className="map-title"><div><small>바다 가까이, 가볍게</small><strong>1시간 36분 사용</strong></div><span>가능 2시간 11분</span></div>
        <TimeBar compact segments={courseTimeSegments} />
        <div className="deadline"><Icon name="clock" /><div><span>마지막 장소에서 출발</span><strong>오후 2:46 이전</strong></div><div><span>공항 도착 목표</span><strong>오후 3:10</strong></div></div>
        <div className="sequence">
          <span className="gold-dot" /><div><strong>에어포트 브릿지 호텔</strong><small>짐 맡기기</small></div>
          <span className="blue-dot">1</span><div><strong>마시안 해변</strong><small>35분 머물기</small></div>
          <span className="red-dot" /><div><strong>호텔 → 인천공항 T2</strong><small>짐 찾고 공항 복귀</small></div>
        </div>
      </div>
    </div>
  );
}

function LuggageScreen() {
  return (
    <>
      <AppHeader title="수하물 케어" />
      <main className="mobile-main">
        <div className="editorial-hero"><span>TRAVEL LIGHT</span><strong>짐은 잠시 두고,<br />시간만 챙겨가세요.</strong><Icon name="bag" size={54} /></div>
        <div className="section-head"><div><small>OPTIONS</small><strong>수하물을 맡기는 방법</strong></div></div>
        {[
          ["01", "호텔 베이스에 맡기기", "체크인 전후로 프런트에 보관 요청할 수 있어요.", "무료"],
          ["02", "공항 보관소 이용하기", "T1·T2 교통센터의 유인 보관소를 이용하세요.", "₩8,000~"],
          ["03", "배송 서비스 이용하기", "목적지 호텔까지 당일 배송을 신청할 수 있어요.", "확인 중"],
        ].map(([n, title, body, price]) => <div className="info-row luggage-option" key={n}><span>{n}</span><div><strong>{title}</strong><p>{body}</p><b>{price}</b></div><Icon name="chevron" /></div>)}
        <div className="notice"><Icon name="shield" /><span><strong>여권과 귀중품은 직접 소지하세요.</strong>운영 시간과 보관 가능 여부는 현장에서 다시 확인해 주세요.</span></div>
      </main>
    </>
  );
}

function SavedScreen() {
  const savedCourses = [
    {
      name: "바다 가까이, 가볍게",
      places: "호텔 베이스 · 마시안 해변",
      summary: "사용 1시간 36분 / 가능 2시간 11분",
      segments: courseTimeSegments,
    },
    {
      name: "영종도의 오래된 거리",
      places: "카페거리 · 구읍뱃터",
      summary: "사용 1시간 52분 / 가능 2시간 11분",
      segments: [
        { kind: "prep", label: "준비 20분", width: 20 },
        { kind: "travel", label: "이동 34분", width: 34 },
        { kind: "stay", label: "체류 58분", width: 58 },
        { kind: "margin", label: "여유 19분", width: 19 },
      ] as TimeSegment[],
    },
  ];
  return (
    <>
      <AppHeader title="저장한 코스" />
      <main className="mobile-main">
        <div className="saved-count">저장한 코스 <strong>2</strong></div>
        {savedCourses.map((course, i) => (
          <div className="saved-card" key={course.name}>
            <div className="saved-index">0{i + 1}</div><div><strong>{course.name}</strong><span>{course.places}</span><b>{course.summary}</b><TimeBar compact segments={course.segments} /></div><Icon name="chevron" />
          </div>
        ))}
        <div className="empty-sample"><Icon name="route" /><strong>남은 시간에 맞는 장소가 없어요</strong><span>비행 시간이 바뀌면 다시 찾아드릴게요.</span></div>
      </main>
    </>
  );
}

function HotelFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const copy = [
    <div key="detail">
      <div className="hotel-hero"><Icon name="bed" size={48} /><span>PHOTO COMING SOON</span></div>
      <Pill tone="gold">HOTEL BASE</Pill><div className="flow-title">에어포트 브릿지 호텔</div>
      <p className="flow-desc">공항에서 가까운 데이유즈 베이스. 짐을 맡기고 씻거나 잠시 쉬어갈 수 있어요.</p>
      <div className="fact-grid"><span><Icon name="car" /><b>12분</b><small>공항에서</small></span><span><Icon name="bag" /><b>가능</b><small>짐 보관</small></span><span><Icon name="language" /><b>EN</b><small>영어 응대</small></span></div>
      <div className="policy"><strong>취소 정책</strong><span>정책 확인 중</span></div>
    </div>,
    <div key="slot">
      <span className="step">01 — CHECK-IN</span><div className="flow-title">언제 도착하시나요?</div>
      <p className="flow-desc">입국 심사 후 호텔 도착 예상 시간은 11:00예요.</p>
      <div className="slot-list">{["11:00", "11:30", "12:00"].map((x, i) => <div className={i === 1 ? "slot selected" : "slot"} key={x}><span>{x}</span>{i === 1 && <Pill tone="blue">선택</Pill>}<small>{i === 1 ? "도착 후 30분 대기" : "체크인 가능"}</small></div>)}</div>
    </div>,
    <div key="product">
      <span className="step">02 — PRODUCT</span><div className="flow-title">머무를 시간을 선택하세요</div>
      <div className="product selected"><div><strong>3시간 스테이</strong><span>11:30 — 14:30</span></div><b>₩48,000</b><Pill tone="outline">데모 가격</Pill></div>
      <div className="product"><div><strong>6시간 스테이</strong><span>11:30 — 17:30</span></div><b>견적 요청</b></div>
      <div className="notice compact"><Icon name="clock" /><span>가격표가 없는 상품은 호텔에 견적을 요청해요. 결제는 진행되지 않아요.</span></div>
    </div>,
    <div key="contact">
      <span className="step">03 — CONTACT</span><div className="flow-title">연락받을 정보를 입력하세요</div>
      <div className="fields"><Field label="이름 (영문 가능)" value="Jin Lee" /><Field label="이메일 (필수)" value="jin@example.com" /></div>
      <label className="consent">{createElement("input", { className: "consent-native", defaultChecked: true, type: "checkbox" })}<span className="consent-box"><Icon name="check" size={16} /></span><span className="consent-label">예약 요청을 위해 개인정보 제공에 동의합니다.</span></label>
      <div className="warning soft"><strong>알아두세요</strong>공항 밖으로 나갈 수 있다는 계산이 대한민국 입국 허가를 보장하지는 않습니다.</div>
    </div>,
  ];
  return (
    <>
      <AppHeader title={step === 0 ? "호텔 상세" : "데이유즈 요청"} />
      <main className="mobile-main booking-flow">
        {step > 0 && <div className={`progress step-${step}`}><i /></div>}
        {copy[step]}
        <Button className="primary full large sticky-action" onClick={() => step === 3 ? onDone() : setStep(step + 1)}>
          {step === 0 ? "데이유즈 요청하기" : step === 3 ? "요청 보내기" : "다음"}
        </Button>
      </main>
    </>
  );
}

function BookingScreen({ requestSent = false }: { requestSent?: boolean }) {
  const [status, setStatus] = useState(requestSent ? "requested" : "confirmed");
  const data: Record<string, [string, string]> = {
    requested: ["요청을 보냈어요", "호텔의 답변을 기다리고 있어요."],
    confirmed: ["예약이 확정됐어요", "호텔에서 요청을 확인했습니다."],
    declined: ["요청이 거절됐어요", "사유: 요청 시간에 이용 가능한 객실이 없습니다."],
    expired: ["요청 시간이 만료됐어요", "호텔의 응답 없이 30분이 지났습니다."],
    cancelled: ["요청을 취소했어요", "이 요청은 더 이상 유효하지 않습니다."],
  };
  return (
    <>
      <AppHeader title="예약 요청" />
      <main className="mobile-main">
        <div className={`status-card ${status}`}>
          <span className="status-icon"><Icon name={status === "confirmed" ? "check" : "clock"} size={26} /></span>
          <Pill tone={status === "confirmed" ? "positive" : status === "declined" ? "danger" : "neutral"}>{status.toUpperCase()}</Pill>
          <div className="flow-title">{data[status][0]}</div><p>{data[status][1]}</p>
        </div>
        <div className="panel request-detail">
          <div className="panel-title">에어포트 브릿지 호텔</div>
          <div><span>체크인</span><b>6월 18일 11:30</b></div><div><span>상품</span><b>3시간 스테이</b></div><div><span>요청 번호</span><b>TS-260618-041</b></div>
        </div>
        {status === "confirmed" && <div className="contact-hotel"><span><strong>변경이나 취소가 필요하신가요?</strong>확정 후에는 호텔로 직접 연락해 주세요.</span><b>+82 32 555 0192</b><small>취소 정책: 확인 중</small></div>}
        {status === "requested" && <Button className="secondary danger-text full" onClick={() => setStatus("cancelled")}>요청 취소</Button>}
      </main>
    </>
  );
}

function ReservationHistoryScreen({ openRequest }: { openRequest: () => void }) {
  const requests = [
    ["TS-260618-041", "에어포트 브릿지 호텔", "6월 18일 · 11:30", "3시간 스테이", "확정"],
    ["TS-260602-018", "오션 파크 레지던스", "6월 2일 · 13:00", "견적 요청", "요청"],
    ["TS-260511-096", "에어포트 브릿지 호텔", "5월 11일 · 10:30", "6시간 스테이", "만료"],
  ];
  return (
    <>
      <AppHeader title="예약 요청 내역" />
      <main className="mobile-main">
        <div className="history-summary"><div><span>전체 요청</span><strong>3</strong></div><div><span>확정</span><strong>1</strong></div><div><span>대기</span><strong>1</strong></div></div>
        <div className="reservation-list">
          {requests.map((request, index) => <Button className="reservation-item" key={request[0]} onClick={index === 0 ? openRequest : undefined}><div><span>{request[0]}</span><Pill tone={request[4] === "확정" ? "positive" : request[4] === "요청" ? "blue" : "neutral"}>{request[4]}</Pill></div><strong>{request[1]}</strong><span>{request[2]} · {request[3]}</span><Icon name="chevron" /></Button>)}
        </div>
        <div className="empty-sample compact-empty"><Icon name="calendar" /><strong>더 이전 요청이 없어요</strong><span>새로운 요청을 보내면 여기에 표시됩니다.</span></div>
      </main>
    </>
  );
}

function LanguageSettingsScreen() {
  const languages = [["한국어", "Korean"], ["English", "English"], ["中文", "Simplified Chinese"], ["日本語", "Japanese"], ["Tiếng Việt", "Vietnamese"]];
  const [selected, setSelected] = useState(getPreferredLanguage);
  const selectLanguage = (language: string) => {
    window.localStorage.setItem("timestay-language", language);
    setSelected(language);
  };
  return (
    <>
      <AppHeader title="언어 설정" />
      <main className="mobile-main">
        <div className="board-intro"><Pill tone="outline">LANGUAGE</Pill><strong>표시 언어를 선택하세요</strong><p>항공편과 호텔 고유 정보는 제공 언어에 따라 원문으로 표시될 수 있어요.</p></div>
        <div className="language-settings">
          {languages.map(([name, english]) => <Button className={selected === name ? "language-option selected" : "language-option"} key={name} onClick={() => selectLanguage(name)}><Icon name="language" /><span><strong>{name}</strong><small>{english}</small></span>{selected === name && <span className="choice-check"><Icon name="check" size={16} /></span>}</Button>)}
        </div>
        <div className="notice"><Icon name="shield" /><span><strong>선택한 언어로 즉시 변경됩니다.</strong>긴 문구도 잘리지 않도록 유동 레이아웃을 사용합니다.</span></div>
      </main>
    </>
  );
}

function MyScreen({
  deviceFrameEnabled,
  go,
  toggleDeviceFrame,
}: {
  deviceFrameEnabled: boolean;
  go: (screen: string) => void;
  toggleDeviceFrame: () => void;
}) {
  const [safeAlerts, setSafeAlerts] = useState(true);
  return (
    <>
      <AppHeader title="마이" />
      <main className="mobile-main my-screen-main">
        <div className="profile"><span><Icon name="user" size={28} /></span><div><strong>Jin Lee <span className="phase2">PHASE 2</span></strong><small>jin@example.com</small></div></div>
        <div className="menu-section"><small>MY TRIP</small>
          <div className="menu-link" onClick={() => go("reservations")}><Icon name="calendar" /><span>예약 요청 내역</span><Pill tone="positive">1 confirmed</Pill><Icon name="chevron" /></div>
          <div className="menu-link" onClick={() => go("saved")}><Icon name="route" /><span>저장한 코스</span><b>2</b><Icon name="chevron" /></div>
          <div><Icon name="calendar" /><span>쿠폰</span><span className="phase2">PHASE 2</span><Icon name="chevron" /></div>
        </div>
        <div className="menu-section"><small>SETTINGS</small>
          <Button className="settings-toggle" onClick={() => setSafeAlerts((enabled) => !enabled)}><Icon name="shield" /><span><strong>Time-Safe 알림</strong><small>항공편 변경과 복귀 시각을 알려드려요.</small></span><i className={safeAlerts ? "switch on" : "switch"}><span /></i></Button>
          <div className="menu-link" onClick={() => go("language")}><Icon name="language" /><span>언어 설정</span><b>한국어</b><Icon name="chevron" /></div>
        </div>
        <div className="menu-section"><small>DESIGN QA</small>
          <Button className="device-frame-toggle" onClick={toggleDeviceFrame}>
            <Icon name="home" /><span>기기 프레임으로 보기</span><Pill tone="outline">목업 전용</Pill><i className={deviceFrameEnabled ? "switch on" : "switch"}><span /></i>
          </Button>
          <div className="menu-link" onClick={() => go("start-flow")}><Icon name="arrow" /><span>시작 흐름</span><Pill tone="outline">FLOW</Pill><Icon name="chevron" /></div>
          <div className="menu-link" onClick={() => go("states")}><Icon name="shield" /><span>상태 보드</span><Pill tone="outline">QA</Pill><Icon name="chevron" /></div>
          <div className="menu-link" onClick={() => go("colors")}><Icon name="map" /><span>색 역할표</span><Icon name="chevron" /></div>
          <div className="menu-link" onClick={() => go("locales")}><Icon name="language" /><span>다국어 확장 테스트</span><Icon name="chevron" /></div>
          <div className="menu-link" onClick={() => go("system")}><Icon name="home" /><span>시스템 영역 규칙</span><Icon name="chevron" /></div>
        </div>
        <div className="offline"><span className="offline-dot" /><div><strong>오프라인에서도 일정 확인 가능 <span className="phase2">PHASE 2</span></strong><small>마지막 동기화 2분 전</small></div></div>
      </main>
    </>
  );
}

const statusGroups = [
  {
    title: "항공편 조회",
    states: [
      ["empty-input", "미입력", "항공편 번호가 아직 입력되지 않았어요.", "항공편 입력"],
      ["loading", "조회 중", "항공사와 공항의 최신 운항 정보를 확인하고 있어요.", "조회 취소"],
      ["invalid", "형식 오류", "항공편 번호 형식이 올바르지 않아요.", "입력 수정"],
      ["notfound", "못 찾음", "입력한 번호와 날짜에 맞는 항공편이 없어요.", "다시 조회"],
      ["service-error", "서비스 오류", "실시간 운항 정보 서비스에 연결하지 못했어요.", "다시 시도"],
      ["flight-cancelled", "결항", "이 항공편은 결항되어 환승 시간을 계산할 수 없어요.", "다른 항공편 입력"],
      ["departed", "이미 출발함", "다음 환승 항공편이 이미 출발했어요.", "항공편 변경"],
      ["insufficient", "환승 시간 부족", "입출국 여유를 제외하면 외출 가능 시간이 0분이에요.", "공항 안내 보기"],
      ["chronology", "도착편이 환승편보다 늦음", "항공편 순서나 날짜가 서로 맞지 않아요.", "날짜 확인"],
      ["duplicate-flight", "같은 항공편 입력", "도착편과 환승편에 같은 항공편을 입력했어요.", "환승편 수정"],
    ],
  },
  {
    title: "홈",
    states: [
      ["loading", "로딩", "항공편과 공항 혼잡도를 불러오고 있어요.", "기다리기"],
      ["normal", "정상", "외출 가능 시간 2시간 11분을 안전하게 사용할 수 있어요.", "코스 만들기"],
      ["low-margin", "여유 적음", "안전 여유가 15분만 남아 짧은 코스를 권장해요.", "짧은 코스 보기"],
      ["no-exit", "외출 불가", "외출 가능 시간이 0분이라 공항 안에 머물러야 해요.", "공항 편의시설 보기"],
      ["changed", "항공편 변경 배너", "출발 시간이 20분 변경되어 시간을 다시 계산했어요.", "변경 내용 보기"],
      ["return-soon", "복귀 임박", "권장 복귀 시각까지 15분 남았어요.", "복귀 경로 열기"],
      ["overdue", "복귀 시각 경과", "권장 복귀 시각이 지났어요. 즉시 공항으로 이동하세요.", "공항으로 길찾기"],
      ["offline", "오프라인", "오후 2:18에 갱신한 마지막 일정으로 보여드려요.", "연결 확인"],
      ["error", "불러오기 실패", "홈 정보를 불러오지 못했어요.", "다시 불러오기"],
    ],
  },
  {
    title: "안전 시간 상세",
    states: [
      ["realtime", "실시간 반영", "T2 보안검색 대기 56분을 계산에 반영했어요.", "계산 근거 보기"],
      ["safety-floor", "안전 하한 적용", "실시간 18분보다 안전 하한 50분을 적용했어요.", "하한 기준 보기"],
      ["stale", "데이터 오래됨", "마지막 공항 데이터 갱신 후 12분이 지났어요.", "새로고침"],
      ["refreshing", "새로고침 중", "항공편과 공항 대기 시간을 다시 확인하고 있어요.", "기다리기"],
      ["refresh-error", "새로고침 실패", "최신 정보를 받지 못해 이전 안전값을 유지해요.", "다시 시도"],
    ],
  },
  {
    title: "호텔 찾기",
    states: [
      ["loading", "로딩", "이용 가능한 호텔과 이동 시간을 확인하고 있어요.", "검색 취소"],
      ["empty", "결과 없음", "선택한 조건에 맞는 호텔이 없어요. 필터를 완화해 보세요.", "필터 초기화"],
      ["all-unavailable", "모두 시간 부족", "검색된 호텔 모두 안전 시간 안에 이용하기 어려워요.", "거리 필터 완화"],
      ["error", "오류", "호텔 정보를 불러오지 못했어요.", "다시 검색"],
    ],
  },
  {
    title: "코스 만들기",
    states: [
      ["hotel-required", "호텔 미선택", "코스의 홈 베이스가 될 호텔을 먼저 선택해야 해요.", "호텔 선택"],
      ["empty", "장소 없음", "남은 시간과 관심사에 맞는 장소가 없어요.", "카테고리 변경"],
      ["composing", "자동 구성 중", "실시간 이동 시간을 반영해 순서를 만들고 있어요.", "구성 취소"],
      ["valid", "가능", "사용 1시간 36분으로 가능 시간 안에 들어와요.", "코스 저장"],
      ["over", "시간 초과", "가능 시간을 24분 초과했어요.", "일정 조정"],
      ["estimate", "이동 시간 추정", "실시간 경로가 없어 안전한 추정 시간을 사용했어요.", "추정 기준 보기"],
      ["route-error", "경로 조회 실패", "일부 구간의 이동 경로를 불러오지 못했어요.", "경로 다시 조회"],
      ["saved", "저장 완료", "코스를 저장한 코스 목록에 추가했어요.", "저장한 코스 보기"],
    ],
  },
  {
    title: "예약",
    states: [
      ["photo-empty", "사진 없음", "호텔 사진을 준비하고 있어요.", "호텔 정보 보기"],
      ["quote", "가격 확인 중", "가격표가 없어 호텔에 견적을 요청해야 해요.", "견적 요청"],
      ["policy-pending", "취소 정책 확인 중", "호텔이 취소 정책을 등록하고 있어요.", "호텔에 문의"],
      ["slot-closed", "시간대 마감", "선택한 체크인 시간의 객실이 마감됐어요.", "다른 시간 선택"],
      ["invalid", "입력 오류", "이메일과 필수 동의 항목을 확인해 주세요.", "입력 확인"],
      ["sending", "전송 중", "호텔에 예약 요청을 안전하게 보내고 있어요.", "기다리기"],
      ["send-error", "전송 실패", "요청을 전송하지 못했어요.", "다시 보내기"],
      ["offline", "오프라인", "인터넷에 연결된 뒤 요청을 보낼 수 있어요.", "연결 확인"],
      ["duplicate-request", "이미 진행 중인 요청 있음", "같은 호텔과 시간에 대기 중인 요청이 있어요.", "기존 요청 보기"],
      ["requested", "요청됨", "호텔의 답변을 기다리고 있어요.", "요청 상세"],
      ["confirmed", "확정", "호텔에서 예약 요청을 확정했어요.", "호텔 연락하기"],
      ["declined", "거절", "선택 시간에 이용 가능한 객실이 없어요.", "다른 호텔 찾기"],
      ["expired", "만료", "호텔 응답 없이 요청 시간이 만료됐어요.", "다시 요청"],
      ["cancelled", "취소", "예약 요청을 취소했어요.", "새 요청 만들기"],
    ],
  },
  {
    title: "수하물",
    states: [
      ["unavailable", "옵션 이용 불가", "현재 시간에는 선택한 보관 서비스를 이용할 수 없어요.", "다른 옵션 보기"],
      ["quote", "가격 확인 중", "운영 업체에서 보관 가격을 확인하고 있어요.", "운영처 문의"],
    ],
  },
  {
    title: "마이",
    states: [
      ["empty", "예약 내역 없음", "아직 보낸 예약 요청이 없어요.", "호텔 찾기"],
      ["error", "목록 불러오기 실패", "예약 요청 내역을 불러오지 못했어요.", "다시 불러오기"],
      ["permission-denied", "알림 권한 거부", "Time-Safe 알림을 받으려면 기기 설정에서 권한을 허용해 주세요.", "설정 열기"],
    ],
  },
  {
    title: "정보 페이지",
    states: [
      ["terms", "이용약관", "TimeStay 서비스 이용 조건과 책임 범위를 확인할 수 있어요.", "약관 보기"],
      ["privacy", "개인정보 처리방침", "항공편·연락처 정보의 수집과 이용 기준을 안내해요.", "처리방침 보기"],
      ["contact", "고객 문의", "서비스 이용 중 도움이 필요하면 지원팀에 문의할 수 있어요.", "문의하기"],
    ],
  },
];

function StateScreenPreview({ kind, section }: { kind: string; section: string }) {
  if (section === "항공편 조회") return <div className={`state-screen flight-fragment ${kind}`}><div><span>항공편</span><strong>{kind === "empty-input" ? "예: KE017" : "KE 017"}</strong></div>{kind === "loading" ? <span className="loader" /> : <Icon name={kind.includes("error") || ["invalid", "notfound", "flight-cancelled", "departed", "insufficient", "chronology", "duplicate-flight"].includes(kind) ? "close" : "search"} />}</div>;
  if (section === "홈") return <div className={`state-screen home-fragment ${kind}`}><small>TIME-SAFE</small>{kind === "loading" ? <div className="state-skeleton"><i /><i /></div> : <><strong>{kind === "no-exit" ? "0분" : kind === "low-margin" ? "45분" : "2시간 11분"}</strong><TimeBar compact /></>}</div>;
  if (section === "안전 시간 상세") return <div className={`state-screen safe-fragment ${kind}`}><span><Icon name="shield" />보안검색</span><strong>{kind === "safety-floor" ? "실시간 18분 → 하한 50분" : kind === "stale" ? "12분 전 갱신" : "실시간 반영"}</strong></div>;
  if (section === "호텔 찾기") return <div className={`state-screen hotel-fragment ${kind}`}><span><Icon name="bed" /><small>사진 준비 중</small></span><div><strong>{kind === "empty" ? "조건에 맞는 호텔 없음" : "에어포트 브릿지 호텔"}</strong><small>왕복 20분 → 체류 81분</small></div></div>;
  if (section === "코스 만들기") return <div className={`state-screen course-fragment ${kind}`}><span className="mini-base"><Icon name="bed" size={14} /></span><i /><span>1</span><i className="return" /><span><Icon name="plane" size={14} /></span></div>;
  if (section === "예약") return <div className={`state-screen booking-fragment ${kind}`}><span><Icon name={kind === "confirmed" ? "check" : kind === "photo-empty" ? "bed" : "calendar"} /></span><div><small>BOOKING REQUEST</small><strong>{kind === "confirmed" ? "예약 확정" : kind === "requested" ? "응답 대기 중" : "에어포트 브릿지 호텔"}</strong></div></div>;
  if (section === "수하물") return <div className={`state-screen luggage-fragment ${kind}`}><Icon name="bag" /><div><strong>공항 보관소</strong><small>{kind === "quote" ? "가격 확인 중" : "현재 이용 불가"}</small></div></div>;
  if (section === "마이") return <div className={`state-screen my-fragment ${kind}`}><Icon name={kind === "permission-denied" ? "shield" : "calendar"} /><div><strong>{kind === "empty" ? "예약 요청 0" : kind === "permission-denied" ? "알림 꺼짐" : "예약 내역"}</strong><small>MY TIMESTAY</small></div></div>;
  return <div className="state-screen info-fragment"><Icon name={kind === "contact" ? "user" : "shield"} /><div><i /><i /><i /></div></div>;
}

const fullScreenStateKinds = new Set(["no-exit", "overdue", "flight-cancelled", "departed", "insufficient", "send-error", "duplicate-request"]);

function FullStateScreen({
  action,
  close,
  description,
  kind,
  title,
}: {
  action: string;
  close: () => void;
  description: string;
  kind: string;
  title: string;
}) {
  const isFlightState = ["flight-cancelled", "departed", "insufficient"].includes(kind);
  const isBookingState = ["send-error", "duplicate-request"].includes(kind);
  return (
    <div className="full-state-overlay">
      <AppHeader title={isBookingState ? "예약 요청" : isFlightState ? "항공편 조회" : "Time-Safe"} />
      <main className="mobile-main full-state-page">
        <Button className="full-state-back" onClick={close}>← 상태 보드로</Button>
        {kind === "no-exit" && <>
          <section className="full-safe-state danger"><span className="full-state-icon"><Icon name="shield" size={28} /></span><Pill tone="danger">NO EXIT</Pill><small>외출 가능 시간</small><strong>0<em>분</em></strong><p>{description}</p></section>
          <div className="panel"><div className="panel-title">안전 시간 계산</div><div className="calc-row"><span>입국 심사</span><b>약 50분</b></div><div className="calc-row"><span>출국 보안</span><b>약 50분</b></div><div className="calc-row"><span>탑승구 여유</span><b>약 30분</b></div></div>
          <div className="notice"><Icon name="shield" /><span><strong>공항 안에서 머물러 주세요.</strong>라운지, 샤워실, 식당 등 공항 내부 편의시설을 안내해 드릴게요.</span></div>
        </>}
        {kind === "overdue" && <>
          <section className="full-safe-state overdue"><span className="full-state-icon"><Icon name="clock" size={28} /></span><Pill tone="danger">RETURN NOW</Pill><div className="flow-title">권장 복귀 시각이 지났어요</div><p>{description}</p></section>
          <div className="deadline urgent"><Icon name="clock" /><div><span>권장 복귀 시각</span><strong>오후 3:10</strong></div><div><span>현재 시각</span><strong>오후 3:18</strong></div></div>
          <div className="urgent-route"><span><Icon name="car" />택시</span><strong>공항 T2까지 약 14분</strong><small>실시간 교통 기준 · 짐 찾기 시간 별도</small></div>
        </>}
        {isFlightState && <>
          <section className="full-flight-problem"><span className="full-state-icon"><Icon name="plane" size={28} /></span><Pill tone="danger">{kind === "flight-cancelled" ? "CANCELLED" : kind === "departed" ? "DEPARTED" : "NOT ENOUGH TIME"}</Pill><div className="flow-title">{title}</div><p>{description}</p></section>
          <div className="lookup-result problem"><div className="flight-line"><div><strong>KE 901</strong><small>도착</small><b>09:40</b></div><div className="flight-rule"><Icon name="plane" size={17} /></div><div><strong>KE 017</strong><small>출발</small><b>{kind === "departed" ? "출발함" : "10:55"}</b></div></div><div className="flight-meta"><span>2026. 06. 18</span><span>인천공항 T2</span><Pill tone="danger">{title}</Pill></div></div>
          {kind === "insufficient" && <div className="safe-hero danger"><span>공항 밖에서 쓸 수 있는 시간</span><strong>0<small>분</small></strong><Pill tone="danger">외출 불가</Pill></div>}
        </>}
        {isBookingState && <>
          <section className="status-card declined"><span className="status-icon"><Icon name="close" size={26} /></span><Pill tone="danger">{kind === "send-error" ? "SEND FAILED" : "REQUEST EXISTS"}</Pill><div className="flow-title">{title}</div><p>{description}</p></section>
          <div className="panel request-detail"><div className="panel-title">에어포트 브릿지 호텔</div><div><span>체크인</span><b>6월 18일 11:30</b></div><div><span>상품</span><b>3시간 스테이</b></div><div><span>요청 번호</span><b>{kind === "duplicate-request" ? "TS-260618-041" : "전송 전"}</b></div></div>
          {kind === "send-error" && <div className="notice error-notice"><Icon name="close" /><span><strong>요청은 접수되지 않았어요.</strong>입력한 내용은 보관되어 다시 전송할 수 있습니다.</span></div>}
        </>}
        <Button className="primary full large full-state-action" onClick={close}>{action} <Icon name="arrow" /></Button>
      </main>
    </div>
  );
}

function StatusBoard() {
  const [fullState, setFullState] = useState<{ action: string; description: string; kind: string; title: string } | null>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const toggleSection = (title: string) => setOpenSections((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title]);
  const moveToSection = (title: string, index: number) => {
    setOpenSections((current) => current.includes(title) ? current : [...current, title]);
    window.setTimeout(() => document.getElementById(`state-section-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };
  if (fullState) return <FullStateScreen {...fullState} close={() => setFullState(null)} />;
  return (
    <>
      <AppHeader title="상태 보드" />
      <main className="mobile-main qa-board">
        <div className="board-intro"><Pill tone="outline">STATE REFERENCE</Pill><strong>핵심 화면 상태</strong><p>실제 서비스 화면의 상태 전환 컨트롤은 제거하고 이 보드에서 한 번에 검수합니다.</p></div>
        <div className="state-section-chips">{statusGroups.map((group, index) => <Button className={openSections.includes(group.title) ? "active" : ""} key={group.title} onClick={() => moveToSection(group.title, index)}>{group.title}</Button>)}</div>
        {statusGroups.map((group, index) => {
          const open = openSections.includes(group.title);
          return <section className="state-group" id={`state-section-${index}`} key={group.title}>
            <Button className="state-accordion-head" onClick={() => toggleSection(group.title)}><span>{group.title}</span><Pill tone="neutral">{group.states.length}</Pill><span className={open ? "accordion-chevron open" : "accordion-chevron"}><Icon name="chevron" /></span></Button>
            {open && <><div className="state-grid">
                {group.states.map(([kind, title, description, action]) => (
                  <div className={`state-tile ${kind}${fullScreenStateKinds.has(kind) ? " opens-full" : ""}`} key={title} onClick={fullScreenStateKinds.has(kind) ? () => setFullState({ action, description, kind, title }) : undefined}>
                    <StateScreenPreview kind={kind} section={group.title} />
                    <div className="state-copy"><div><strong>{title}</strong>{kind === "estimate" && <Pill tone="neutral">추정</Pill>}{fullScreenStateKinds.has(kind) && <Pill tone="outline">전체 화면</Pill>}</div><p>{description}</p><Button className="secondary state-action" onClick={fullScreenStateKinds.has(kind) ? () => setFullState({ action, description, kind, title }) : undefined}>{action}</Button></div>
                  </div>
                ))}
              </div>
              {group.title === "호텔 찾기" && <div className="compact-filter-variant"><div><span>호텔 2개</span><strong>필터 3개 적용 중</strong></div><Button className="secondary">필터 펼치기 <Icon name="chevron" size={16} /></Button><small>호텔이 적을 때는 필터 칩을 접고 적용 개수만 표시합니다.</small></div>}
            </>}
          </section>;
        })}
      </main>
    </>
  );
}

const colorRoles = [
  ["brand", "브랜드 블루", "선택된 장소·선택 상태·주요 동작"],
  ["success", "성공 그린", "정상 운항·확정·완료"],
  ["travel", "이동 틸", "시간 바 이동·경로·이동 칩에만 사용"],
  ["stay", "체류 하늘색", "시간 바의 체류 구간"],
  ["margin", "여유 샌드", "시간 바의 안전 여유 구간"],
  ["hotel", "호텔 골드", "호텔 베이스·호텔 핀"],
  ["danger", "경고 레드", "경고·시간 초과·공항 복귀"],
  ["neutral", "뉴트럴", "준비·트랙·보조 정보"],
];

function ColorRoleBoard() {
  return (
    <>
      <AppHeader title="색 역할표" />
      <main className="mobile-main qa-board">
        <div className="board-intro"><Pill tone="outline">COLOR SEMANTICS</Pill><strong>한 색에는 한 가지 의미만</strong><p>상태와 이동 정보를 색만으로 구분하지 않고 아이콘과 문구를 함께 사용합니다.</p></div>
        <div className="color-role-list">
          {colorRoles.map(([role, title, description]) => <div className="color-role" key={role}><span className={`swatch ${role}`} /><div><strong>{title}</strong><p>{description}</p></div></div>)}
        </div>
        <div className="route-rules">
          <strong>이동 선 규칙</strong>
          <span><i className="transit"><b /><b /><b /></i>대중교통 · 굵은 실선 + 역 점</span>
          <span><i className="taxi" />택시 · 가는 실선</span>
          <span><i className="walk" />도보 · 점선</span>
          <span><i className="return" />공항 복귀 · 빨강 점선</span>
        </div>
        <div className="color-vision-check"><div><Pill tone="neutral">COLOR VISION CHECK</Pill><strong>색 없이도 구분되는 시간 막대</strong><p>회색조에서도 빗금은 공항 절차, 외곽선은 외출 가능, 텍스트 라벨은 구간과 출처를 구분합니다.</p></div><div className="grayscale-preview"><TransitTimeBar /></div></div>
      </main>
    </>
  );
}

const localeSamples = [
  ["ko", "한국어", "안심하고 쓸 수 있는 시간", "호텔에 데이유즈 예약 요청을 보냅니다"],
  ["en", "English", "Time you can safely spend outside the airport", "Send a day-use booking request to the hotel"],
  ["zh-CN", "简体中文", "您可以安全地在机场外停留的时间", "向酒店发送日间客房预订申请"],
  ["ja", "日本語", "空港の外で安心して過ごせる時間", "ホテルにデイユース予約リクエストを送信します"],
  ["vi", "Tiếng Việt", "Thời gian bạn có thể an tâm ở bên ngoài sân bay", "Gửi yêu cầu đặt phòng sử dụng ban ngày đến khách sạn"],
];

function LocaleStressBoard() {
  return (
    <>
      <AppHeader title="다국어 확장 테스트" />
      <main className="mobile-main qa-board">
        <div className="board-intro"><Pill tone="outline">5 LANGUAGES</Pill><strong>긴 문구 레이아웃</strong><p>독일어 수준으로 길어져도 잘리지 않도록 홈 카드와 예약 동작을 유동 높이로 검수합니다.</p></div>
        {localeSamples.map(([code, language, home, booking]) => (
          <section className="locale-sample" key={language} lang={code}>
            <strong>{language}</strong>
            <div className="locale-home"><small>HOME · TIME-SAFE</small><span>{home}</span><b>2시간 11분</b><TimeBar compact /></div>
            <div className="locale-booking"><small>BOOKING · PRIMARY ACTION</small><span>{booking}</span><Icon name="arrow" /></div>
          </section>
        ))}
      </main>
    </>
  );
}

const systemStyleRules = [
  ["홈·코스·호텔·예약·마이", "밝은 배경", "OS: 어두운 글자", "앱은 배경만 연결"],
  ["안전 시간 풀블리드·진한 온보딩", "진한 배경", "OS: 밝은 글자", "앱은 배경만 연결"],
  ["바텀시트 열림", "기존 상단 배경 유지", "기존 OS 스타일 유지", "앱은 상태바를 그리지 않음"],
  ["중앙 모달 열림", "배경 딤 처리", "OS 대비 유지", "safe-area 배경도 함께 딤"],
];

function SystemAreaRulesBoard() {
  return (
    <>
      <AppHeader title="시스템 영역 규칙" />
      <main className="mobile-main qa-board">
        <div className="board-intro"><Pill tone="outline">SYSTEM AREA</Pill><strong>상단과 하단 연결 규칙</strong><p>OS가 그리는 영역: 상단 safe-area, 하단 safe-area. 앱은 배경만 연결합니다.</p></div>
        <div className="mockup-only-note"><Pill tone="blue">목업 전용</Pill><span>아래의 9:41 상태바, 신호·배터리, 홈 인디케이터는 규칙 설명을 위한 목업이며 실제 앱 UI에는 그리지 않습니다.</span></div>
        <div className="system-measures">
          <div><span>STATUS BAR</span><strong>54px</strong><small>대표 기기 기준 예시값</small></div>
          <div><span>HOME INDICATOR</span><strong>34px</strong><small>대표 기기 기준 예시값</small></div>
        </div>
        <section className="system-rule-table">
          <div className="rule-table-head"><span>화면</span><span>스타일</span><span>글자</span><span>배경 연결</span></div>
          {systemStyleRules.map((row) => <div className="rule-table-row" key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}
        </section>
        <section className="map-comparison">
          <div className="state-group-title">지도 상단 비교</div>
          <div className="map-option-grid">
            <div className="map-option fullbleed">
              <SystemStatusBar dark />
              <div className="mini-map-surface"><span className="mini-map-pin">1</span><i /><b>FULL-BLEED</b></div>
              <strong>A. 지도가 상태바 뒤까지 · 목업 전용</strong>
              <p>몰입감이 높지만 지도 명암에 따라 밝은 상태바 아이콘을 유지합니다.</p>
            </div>
            <div className="map-option with-header">
              <SystemStatusBar />
              <div className="mini-app-header"><strong>Time-Fit 코스</strong><span>KE017 · T2</span></div>
              <div className="mini-map-surface"><span className="mini-map-pin">1</span><i /><b>HEADER</b></div>
              <strong>B. 헤더가 있는 안 · 목업 전용</strong>
              <p>상태바와 헤더를 같은 밝은 배경으로 연결해 정보 가독성을 우선합니다.</p>
            </div>
          </div>
        </section>
        <div className="system-bottom-demo"><span>탭바 콘텐츠 72px</span><div className="demo-tabs"><i /><i /><i /><i /><i /></div><div className="demo-indicator"><i /></div><strong>목업 전용 · 앱은 하단 safe-area에 배경만 연결</strong></div>
      </main>
    </>
  );
}

type StartFlowDemo =
  | "menu"
  | "splash"
  | "maintenance"
  | "update"
  | "first-run"
  | "relaunch-home"
  | "relaunch-flight"
  | "permission"
  | "offline"
  | "server-error"
  | "not-found"
  | "permission-denied"
  | "notification-entry"
  | "flowchart";

function QaDemoBack({ back }: { back: () => void }) {
  return <Button className="qa-demo-back" onClick={back}>← 시작 흐름 목록</Button>;
}

function NotificationPermissionDemo({ close }: { close: () => void }) {
  return <div className="qa-overlay-demo"><div className="permission-sheet static"><span className="permission-icon"><Icon name="shield" size={28} /></span><Pill tone="blue">TIME-SAFE ALERT</Pill><div className="flow-title">항공편 변경과 복귀 시각<br />알림을 받을까요?</div><p>출발 시간 변경, 복귀 임박, 안전 시간 재계산 결과를 알려드려요.</p><div><Button className="secondary" onClick={close}>나중에</Button><Button className="primary" onClick={close}>알림 허용</Button></div></div></div>;
}

function StartFlowBoard() {
  const [demo, setDemo] = useState<StartFlowDemo>("menu");
  const back = () => setDemo("menu");
  if (demo === "splash") return <div className="qa-full-demo"><QaDemoBack back={back} /><SplashScreen /></div>;
  if (demo === "maintenance") return <div className="qa-full-demo"><QaDemoBack back={back} /><MaintenanceScreen /></div>;
  if (demo === "update") return <div className="qa-full-demo"><QaDemoBack back={back} /><UpdateRequiredScreen /></div>;
  if (demo === "first-run") return <div className="qa-full-demo onboarding-demo"><QaDemoBack back={back} /><Onboarding demo done={back} startStep={1} /></div>;
  if (demo === "relaunch-home") return <div className="qa-full-demo"><QaDemoBack back={back} /><HomeScreen go={() => undefined} onFlight={() => undefined} refreshing /></div>;
  if (demo === "relaunch-flight") return <div className="qa-full-demo onboarding-demo"><QaDemoBack back={back} /><Onboarding demo done={back} startStep={2} /></div>;
  if (demo === "permission") return <div className="qa-full-demo"><QaDemoBack back={back} /><NotificationPermissionDemo close={back} /></div>;
  if (demo === "offline" || demo === "server-error") return <div className="qa-full-demo global-demo"><QaDemoBack back={back} /><HomeScreen go={() => undefined} onFlight={() => undefined} />{demo === "offline" ? <div className="global-offline-banner"><span className="offline-dot" /><div><strong>오프라인 상태예요</strong><small>마지막 갱신 오후 2:18</small></div><Button className="secondary">연결 확인</Button></div> : <div className="server-error-toast"><Icon name="close" /><span><strong>서버에 연결하지 못했어요</strong>잠시 후 다시 시도해 주세요.</span><Button>재시도</Button></div>}</div>;
  if (demo === "not-found") return <div className="qa-full-demo"><QaDemoBack back={back} /><div className="start-screen not-found-screen"><span>404</span><div className="flow-title">페이지를 찾을 수 없어요</div><p>주소가 변경되었거나 더 이상 제공되지 않는 화면이에요.</p><Button className="primary" onClick={back}>홈으로 돌아가기</Button></div></div>;
  if (demo === "permission-denied") return <div className="qa-full-demo"><QaDemoBack back={back} /><div className="start-screen system-message-screen"><span className="system-message-icon danger"><Icon name="shield" size={30} /></span><Pill tone="danger">NOTIFICATION OFF</Pill><div className="flow-title">알림 권한이 꺼져 있어요</div><p>항공편 변경과 복귀 임박 알림을 받으려면 기기 설정에서 TimeStay 알림을 허용해 주세요.</p><Button className="primary">기기 설정 열기</Button><Button className="text-action" onClick={back}>나중에</Button></div></div>;
  if (demo === "notification-entry") return <div className="qa-full-demo"><QaDemoBack back={back} /><FlowDiagram notificationOnly /></div>;
  if (demo === "flowchart") return <div className="qa-full-demo"><QaDemoBack back={back} /><FlowDiagram /></div>;
  const demos: [StartFlowDemo, IconName, string, string][] = [
    ["splash", "clock", "스플래시", "로고와 초기 로딩"],
    ["maintenance", "clock", "서버 점검", "예상 완료 시각과 재확인"],
    ["update", "arrow", "필수 업데이트", "스토어 업데이트 진입"],
    ["first-run", "language", "첫 실행 전체", "언어 → 1회 안내 → 항공편 → 알림"],
    ["relaunch-home", "home", "재실행 · 저장 항공편", "홈에서 최신 정보 갱신"],
    ["relaunch-flight", "plane", "재실행 · 항공편 없음", "항공편 조회로 진입"],
    ["permission", "shield", "알림 권한 시트", "허용 또는 나중에"],
    ["offline", "shield", "오프라인 배너", "마지막 갱신 시각"],
    ["server-error", "close", "서버 오류 토스트", "재시도 행동"],
    ["not-found", "map", "404", "홈 복귀 행동"],
    ["permission-denied", "shield", "알림 권한 거부", "기기 설정 안내"],
    ["notification-entry", "plane", "알림 진입 흐름", "복귀 임박 알림 → 홈"],
    ["flowchart", "route", "전체 분기도", "첫 실행과 재실행 분기"],
  ];
  return (
    <>
      <AppHeader title="시작 흐름" />
      <main className="mobile-main qa-board">
        <div className="board-intro"><Pill tone="outline">APP START</Pill><strong>시작과 전역 상태</strong><p>각 항목을 눌러 실제 화면과 다음 행동을 확인할 수 있어요.</p></div>
        <div className="start-flow-list">{demos.map(([id, icon, title, description]) => <Button className="start-flow-item" key={id} onClick={() => setDemo(id)}><span><Icon name={icon} /></span><div><strong>{title}</strong><small>{description}</small></div><Icon name="chevron" /></Button>)}</div>
      </main>
    </>
  );
}

function FlowDiagram({ notificationOnly = false }: { notificationOnly?: boolean }) {
  if (notificationOnly) return <div className="flow-diagram"><Pill tone="blue">NOTIFICATION ENTRY</Pill><div className="flow-title">복귀 임박 알림에서 홈까지</div><div className="flow-node danger"><Icon name="clock" /><strong>복귀까지 15분</strong><span>푸시 알림 탭</span></div><i /><div className="flow-node"><Icon name="home" /><strong>홈 열기</strong><span>복귀 임박 배너 강조</span></div><i /><div className="flow-node travel"><Icon name="route" /><strong>복귀 경로 확인</strong><span>실시간 이동 시간 반영</span></div><Button className="primary full">홈 화면 예시 보기</Button></div>;
  return <div className="flow-diagram"><Pill tone="outline">FULL FLOWCHART</Pill><div className="flow-title">TimeStay 앱 시작 분기도</div><div className="flow-node"><Icon name="clock" /><strong>스플래시</strong><span>환경과 서버 상태 확인</span></div><div className="flow-branch"><span>점검</span><span>업데이트</span><span>정상</span></div><i /><div className="flow-node brand"><Icon name="language" /><strong>첫 실행인가?</strong><span>예: 언어 선택 → 입국 안내 → 항공편</span></div><div className="flow-split"><div><small>저장 항공편 있음</small><strong>홈 · 최신 갱신</strong></div><div><small>없음·이미 출발</small><strong>항공편 조회</strong></div></div><i /><div className="flow-node"><Icon name="shield" /><strong>알림 권한 안내</strong><span>허용 또는 나중에</span></div><div className="flow-footnote">전역: 오프라인 배너 · 서버 오류 토스트 · 404 · 권한 거부 안내</div></div>;
}

const navItems: [string, IconName, string][] = [
  ["home", "home", "홈"], ["luggage", "bag", "수하물"], ["course", "route", "코스"], ["booking", "calendar", "예약"], ["my", "user", "마이"],
];

function MobileApp() {
  const hasStoredLanguage = typeof window !== "undefined" && Boolean(window.localStorage.getItem("timestay-language"));
  const hasSeenEntryNotice = typeof window !== "undefined" && window.localStorage.getItem("timestay-entry-notice-seen") === "true";
  const hasActiveFlight = typeof window !== "undefined" && window.localStorage.getItem("timestay-flight-state") === "active";
  const [screen, setScreen] = useState("home");
  const [booting, setBooting] = useState(true);
  const [onboard, setOnboard] = useState(() => !hasStoredLanguage || !hasSeenEntryNotice || !hasActiveFlight);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(() => hasStoredLanguage ? 2 : 1);
  const [showInitialNotice, setShowInitialNotice] = useState(() => hasStoredLanguage && !hasSeenEntryNotice);
  const [homeRefreshing, setHomeRefreshing] = useState(hasActiveFlight);
  const [requestSent, setRequestSent] = useState(false);
  const [deviceFrameEnabled, setDeviceFrameEnabled] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 900);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!homeRefreshing) return;
    const timer = window.setTimeout(() => setHomeRefreshing(false), 1800);
    return () => window.clearTimeout(timer);
  }, [homeRefreshing]);
  if (booting) return <div className="phone-app onboarding-shell"><SplashScreen /></div>;
  if (onboard) return <><div className="phone-app onboarding-shell"><Onboarding done={() => { setOnboard(false); setHomeRefreshing(true); }} initialNotice={showInitialNotice} startStep={onboardingStep} /></div>{deviceFrameEnabled && <DeviceFrameOverlay />}</>;
  const go = (x: string) => setScreen(x);
  let content: React.ReactNode;
  if (screen === "safe") content = <SafeScreen back={() => go("course")} />;
  else if (screen === "course") content = <CourseBuilder openDetail={() => go("course-detail")} openHotels={() => go("hotel-find")} />;
  else if (screen === "hotel-find") content = <HotelFindScreen selectHotel={() => go("course")} />;
  else if (screen === "course-detail") content = <CourseScreen />;
  else if (screen === "luggage") content = <LuggageScreen />;
  else if (screen === "saved") content = <SavedScreen />;
  else if (screen === "hotel") content = <HotelFlow onDone={() => { setRequestSent(true); setScreen("booking"); }} />;
  else if (screen === "booking") content = <BookingScreen requestSent={requestSent} />;
  else if (screen === "reservations") content = <ReservationHistoryScreen openRequest={() => go("booking")} />;
  else if (screen === "language") content = <LanguageSettingsScreen />;
  else if (screen === "my") content = <MyScreen deviceFrameEnabled={deviceFrameEnabled} go={go} toggleDeviceFrame={() => setDeviceFrameEnabled((enabled) => !enabled)} />;
  else if (screen === "states") content = <StatusBoard />;
  else if (screen === "colors") content = <ColorRoleBoard />;
  else if (screen === "locales") content = <LocaleStressBoard />;
  else if (screen === "system") content = <SystemAreaRulesBoard />;
  else if (screen === "start-flow") content = <StartFlowBoard />;
  else content = <HomeScreen go={go} onFlight={() => { setOnboardingStep(2); setShowInitialNotice(false); setOnboard(true); }} refreshing={homeRefreshing} />;
  const hasTabs = !["hotel", "safe"].includes(screen);
  return (
    <>
      <div className={`phone-app ${hasTabs ? "has-tabs" : "no-tabs"}`}>
        {content}
        {hasTabs && (
          <nav className="tabbar">
            {navItems.map(([id, icon, label]) => {
              const active = screen === id || (id === "course" && ["course-detail", "hotel-find"].includes(screen)) || (id === "my" && ["states", "colors", "locales", "system", "start-flow", "saved", "reservations", "language"].includes(screen));
              return <Button className={`${active ? "active" : ""}${id === "course" ? " featured" : ""}`} key={id} onClick={() => go(id)}><Icon name={icon} /><span>{label}</span></Button>;
            })}
          </nav>
        )}
      </div>
      {deviceFrameEnabled && <DeviceFrameOverlay />}
    </>
  );
}

function PreviewPhone() {
  return (
    <div className="preview-phone">
      <div className="preview-status"><span>9:41</span><span>LTE · 82%</span></div>
      <Brand />
      <div className="preview-copy">안심하고 쓸 수 있는 시간</div>
      <div className="preview-time">2<small>시간</small> 11<small>분</small></div>
      <Pill tone="positive">여유 있음</Pill>
      <TimeBar compact />
      <div className="preview-course"><span>TIME-FIT COURSE 01</span><strong>바다 가까이, 가볍게</strong><div className="preview-map"><i /><b>1</b><i /><span><Icon name="plane" /></span></div></div>
    </div>
  );
}

function Landing({ openConsole }: { openConsole: () => void }) {
  return (
    <div className="landing">
      <header className="site-header"><Brand /><nav><span>서비스</span><span>이용 방법</span><span>FAQ</span></nav><div><Button className="lang"><Icon name="language" /> 한국어</Button><Button className="outline-button" onClick={openConsole}>호텔 파트너</Button></div></header>
      <main>
        <section className="hero">
          <div className="hero-copy"><Pill tone="blue">INCHEON TRANSIT COMPANION</Pill><div className="display">다음 비행기까지,<br /><em>얼마나 멀리</em> 갈 수 있을까요?</div><p>입국부터 탑승구까지 필요한 시간을 계산하고,<br />안심하고 다녀올 수 있는 코스와 쉼의 베이스를 제안합니다.</p><div className="hero-actions"><Button className="primary large">앱에서 시간 계산하기 <Icon name="arrow" /></Button><span>결제 없이 · 항공편 번호만으로</span></div></div>
          <div className="hero-art"><div className="orbit one" /><div className="orbit two" /><div className="time-stamp">AVAILABLE<br /><strong>02:11</strong><span>SAFE WINDOW</span></div><PreviewPhone /></div>
        </section>
        <section className="desktop-timebar"><div><span>ICN 09:40</span><strong>환승 총 4시간 21분 / 외출 가능 2시간 11분</strong><span>BOARDING 16:10</span></div><TransitTimeBar /></section>
        <section className="features"><div className="section-label">01 — WHAT TIMESTAY DOES</div><div className="section-display">호텔을 고르기 전에,<br />먼저 <em>시간</em>을 설계합니다.</div><div className="feature-grid">
          {[
            ["01", "TIME-SAFE", "안전한 시간을 계산", "실시간 항공편과 공항 혼잡도를 반영해 밖에서 쓸 수 있는 시간만 정확히 보여드려요.", "clock"],
            ["02", "TIME-FIT", "시간에 맞는 코스", "남은 시간에 들어오는 장소만 연결하고, 언제 돌아와야 하는지 계속 안내해요.", "route"],
            ["03", "HOTEL BASE", "여행 사이의 베이스", "짐을 맡기고 씻고 쉴 수 있는 데이유즈 호텔을 이동 동선 안에 배치해요.", "bed"],
          ].map(([n, over, title, desc, icon]) => <div className="feature" key={n}><span>{n}</span><Icon name={icon as IconName} size={28} /><small>{over}</small><strong>{title}</strong><p>{desc}</p></div>)}
        </div></section>
        <section className="how"><div><div className="section-label">02 — HOW IT WORKS</div><div className="section-display">세 단계면<br />충분합니다.</div></div><div className="steps">
          {[
            ["항공편 입력", "도착·출발 시간을 실시간으로 확인합니다."],
            ["안전 시간 확인", "입출국과 이동 여유를 뺀 시간을 계산합니다."],
            ["코스와 베이스 선택", "호텔을 중심으로 딱 맞는 동선을 시작합니다."],
          ].map(([title, text], i) => <div className="desktop-step" key={title}><span>0{i + 1}</span><div><strong>{title}</strong><p>{text}</p></div></div>)}
        </div></section>
        <section className="app-preview"><PreviewPhone /><div><div className="section-label">03 — DESIGNED FOR PEACE OF MIND</div><div className="section-display">돌아올 시간까지,<br />한눈에 놓치지 않게.</div><p>모든 화면에서 같은 시간 바를 사용합니다. 준비, 이동, 체류, 여유 시간을 한 번에 이해하고 변화가 생기면 즉시 다시 계산해요.</p><div className="route-legend"><span><i className="solid" />대중교통</span><span><i />택시</span><span><i className="dotted" />도보</span><span><i className="red" />공항 복귀</span></div></div></section>
        <section className="faq"><div><div className="section-label">04 — FAQ</div><div className="section-display">자주 묻는 질문</div></div><div>{["환승객이면 누구나 공항 밖으로 나갈 수 있나요?", "실시간 정보가 없으면 어떻게 계산하나요?", "호텔 예약과 결제는 어떻게 진행되나요?", "비행 시간이 바뀌면 알려주나요?"].map((q, i) => <details key={q} open={i === 0}><summary>{q}<span>+</span></summary><p>{i === 0 ? "국적과 비자, 입국 심사 결과에 따라 달라요. TimeStay의 시간 계산은 입국 허가를 보장하지 않습니다." : "TimeStay는 안전 여유를 우선해 보수적으로 안내합니다."}</p></details>)}</div></section>
        <section className="partner-cta"><div><small>FOR HOTEL PARTNERS</small><strong>환승객의 짧은 시간을<br />새로운 숙박 경험으로.</strong><p>데이유즈 객실과 요청을 간단하게 관리하세요.</p></div><Button className="light-button large" onClick={openConsole}>파트너 시작하기 <Icon name="arrow" /></Button></section>
      </main>
      <footer><Brand /><span>TimeStay · Incheon, Korea</span><span>Terms · Privacy · Contact</span></footer>
    </div>
  );
}

function PartnerLogin({ enter, exit }: { enter: () => void; exit: () => void }) {
  return (
    <div className="partner-login">
      <div className="login-brand"><Brand /><Button className="text-action" onClick={exit}>TimeStay 홈으로</Button></div>
      <div className="login-layout">
        <div className="login-story">
          <span>HOTEL PARTNER CONSOLE</span>
          <strong>환승객의 짧은 머무름을<br />더 편안하게 운영하세요.</strong>
          <p>예약 요청부터 시간대별 객실, 가격, 취소 정책까지 한 곳에서 관리합니다.</p>
          <div className="login-time"><span>ARRIVAL</span><i /><b>3H</b><i /><span>DEPARTURE</span></div>
        </div>
        <div className="login-card">
          <div className="phase-heading"><Pill tone="blue">PARTNER LOGIN</Pill><span className="phase2">PHASE 2</span></div>
          <div className="dialog-title">파트너 로그인</div>
          <p>호텔에 등록된 계정으로 로그인하세요.</p>
          <Field label="이메일" value="manager@airportbridge.kr" />
          <Field label="비밀번호" value="••••••••••" />
          <label className="consent">{createElement("input", { defaultChecked: true, type: "checkbox" })}<span>로그인 상태 유지</span></label>
          <Button className="primary full large" onClick={enter}>콘솔로 이동 <Icon name="arrow" /></Button>
          <span className="login-help">로그인에 문제가 있나요? partner@timestay.kr</span>
        </div>
      </div>
    </div>
  );
}

function ConsoleSettings({ page }: { page: "rooms" | "hotel" }) {
  if (page === "hotel") {
    return (
      <div className="settings-layout">
        <section className="settings-card">
          <div className="settings-head"><div><small>HOTEL PROFILE · <span className="phase2">PHASE 2</span></small><strong>호텔 정보와 사진</strong></div><Button className="primary">변경 저장</Button></div>
          <div className="upload-zone"><Icon name="bed" size={35} /><strong>호텔 사진을 업로드하세요</strong><span>JPG, PNG · 최대 10MB · 객실을 정확히 보여주는 사진만 사용</span><Button className="secondary">파일 선택</Button></div>
          <div className="usage-notice"><Icon name="shield" /><div><strong>사진 사용 권한 확인</strong><span>업로드한 사진을 TimeStay 서비스와 홍보 채널에 표시할 수 있는 권한이 있음을 확인해 주세요.</span></div></div>
          <div className="photo-slots">{[1,2,3].map((x) => <div key={x}><span>0{x}</span><small>{x === 1 ? "대표 사진" : "추가 사진"}</small></div>)}</div>
        </section>
        <aside className="settings-card compact-card"><small>PUBLIC INFO</small><Field label="호텔명" value="에어포트 브릿지 호텔" /><Field label="대표 연락처" value="+82 32 555 0192" /><Field label="영어 응대" value="가능" /></aside>
      </div>
    );
  }
  return (
    <div className="settings-layout">
      <section className="settings-card">
        <div className="settings-head"><div><small>ROOM & PRICE TABLE · <span className="phase2">PHASE 2</span></small><strong>시간대별 객실과 가격</strong></div><Button className="primary">변경 저장</Button></div>
        <div className="price-head"><span>상품</span><span>운영 시간</span><span>가격</span><span>오늘 객실</span><span /></div>
        {[["3시간 스테이","10:00 — 18:00","₩48,000","3개"],["6시간 스테이","10:00 — 21:00","₩82,000","2개"],["샤워 & 리프레시","09:00 — 20:00","견적 요청","4개"]].map((row, i) => (
          <div className="price-row" key={row[0]}>{row.map((x) => <span key={x}>{x}</span>)}<Button className="icon-button"><Icon name="chevron" /></Button>{i === 0 && <Pill tone="outline">데모 가격</Pill>}</div>
        ))}
        <Button className="add-row">+ 시간 블록 추가</Button>
      </section>
      <aside className="settings-card compact-card"><small>CANCELLATION POLICY · <span className="phase2">PHASE 2</span></small><strong>취소 정책</strong>{createElement("textarea", { defaultValue: "체크인 2시간 전까지 무료 취소가 가능합니다. 이후 취소 또는 노쇼는 전액 청구됩니다.", rows: 7 })}<span>예약 확정 후 고객에게 표시됩니다.</span><Button className="secondary full">정책 저장</Button></aside>
    </div>
  );
}

function PartnerConsole({ exit }: { exit: () => void }) {
  const [selected, setSelected] = useState(0);
  const [modal, setModal] = useState<"confirm" | "decline" | null>(null);
  const [page, setPage] = useState<"requests" | "rooms" | "hotel">("requests");
  const requests = [
    ["TS-260618-041", "Jin Lee", "오늘 11:30", "3시간", "요청"],
    ["TS-260618-038", "Mai Nguyen", "오늘 13:00", "6시간", "확정"],
    ["TS-260618-032", "Sato Haru", "오늘 14:30", "3시간", "요청"],
    ["TS-260617-108", "Wang Lin", "어제 10:00", "6시간", "거절"],
  ];
  return (
    <div className="console">
      <aside><Brand /><div className="property"><span>AB</span><div><strong>에어포트 브릿지</strong><small>Partner Console</small></div></div>
        <nav><Button className={page === "requests" ? "active" : ""} onClick={() => setPage("requests")}><Icon name="calendar" />예약 요청 <b>2</b></Button><Button className={page === "rooms" ? "active" : ""} onClick={() => setPage("rooms")}><Icon name="bed" />객실과 가격</Button><Button className={page === "hotel" ? "active" : ""} onClick={() => setPage("hotel")}><Icon name="map" />호텔 정보</Button><Button><Icon name="user" />계정</Button></nav>
        <Button className="exit" onClick={exit}>← TimeStay 홈</Button>
      </aside>
      <div className="console-main">
        <header><div><small>2026년 6월 18일 목요일</small><strong>{page === "requests" ? "예약 요청" : page === "rooms" ? "객실과 가격" : "호텔 정보"}</strong></div><div><Pill tone="positive">운영 중</Pill><span className="avatar">HK</span></div></header>
        {page === "requests" ? <>
          <div className="metrics"><div><span>대기 중</span><strong>02</strong><small>30분 내 확인 권장</small></div><div><span>오늘 확정</span><strong>08</strong><small>객실 3개 남음</small></div><div><span>오늘 매출 예상 <span className="phase2">PHASE 2</span></span><strong>₩384,000</strong><small>데모 기준</small></div></div>
          <div className="console-grid">
          <section className="request-list"><div className="list-tools"><div className="search"><Icon name="search" />{createElement("input", { placeholder: "이름 또는 요청 번호 검색" })}</div><Button className="filter">상태: 전체</Button></div>
            <div className="table-head"><span>요청 번호 / 고객</span><span>체크인</span><span>상품</span><span>상태</span></div>
            {requests.map((r, i) => <div className={`table-row ${selected === i ? "selected" : ""}`} key={r[0]} onClick={() => setSelected(i)}><span><b>{r[0]}</b><small>{r[1]}</small></span><span>{r[2]}</span><span>{r[3]}</span><Pill tone={r[4] === "요청" ? "blue" : r[4] === "확정" ? "positive" : "danger"}>{r[4]}</Pill></div>)}
          </section>
          <aside className="request-panel"><div className="detail-head"><div><Pill tone="blue">REQUESTED</Pill><strong>{requests[selected][0]}</strong></div><Button className="icon-button"><Icon name="close" /></Button></div>
            <div className="guest"><span>JL</span><div><strong>{requests[selected][1]}</strong><small>jin.lee@example.com</small><small>+82 10 2918 4402</small></div></div>
            <div className="detail-block"><small>STAY DETAILS</small><div><span>체크인</span><b>6월 18일 11:30</b></div><div><span>상품</span><b>3시간 스테이</b></div><div><span>요청 가격</span><b>₩48,000</b></div></div>
            <div className="flight-summary"><Icon name="plane" /><div><small>환승 항공편</small><strong>KE901 09:40 → KE017 16:10</strong><span>공항 복귀 목표 15:10 · T2</span></div></div>
            <div className="detail-actions"><Button className="secondary" onClick={() => setModal("decline")}>거절</Button><Button className="primary" onClick={() => setModal("confirm")}>예약 확정</Button></div>
          </aside>
          </div>
        </> : <ConsoleSettings page={page} />}
      </div>
      {modal && <div className="modal-backdrop"><div className="dialog"><span className={`dialog-icon ${modal}`}><Icon name={modal === "confirm" ? "check" : "close"} size={26} /></span><div className="dialog-title">{modal === "confirm" ? "이 요청을 확정할까요?" : "거절 사유를 알려주세요"}</div><p>{modal === "confirm" ? "고객에게 예약 확정 안내와 호텔 연락처가 전달됩니다." : "고객이 이해할 수 있도록 구체적인 사유를 선택해 주세요."}</p>{modal === "decline" && <div className="reason-list"><label>{createElement("input", { name: "reason", type: "radio" })}이용 가능한 객실 없음</label><label>{createElement("input", { name: "reason", type: "radio" })}요청 시간 운영 불가</label></div>}<div><Button className="secondary" onClick={() => setModal(null)}>취소</Button><Button className={modal === "confirm" ? "primary" : "primary danger-button"} onClick={() => setModal(null)}>{modal === "confirm" ? "확정하기" : "거절하기"}</Button></div></div></div>}
    </div>
  );
}

export default function App() {
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [partnerLoggedIn, setPartnerLoggedIn] = useState(false);
  return (
    <>
      <div className="mobile-only"><MobileApp /></div>
      <div className="desktop-only">{consoleOpen ? partnerLoggedIn ? <PartnerConsole exit={() => { setConsoleOpen(false); setPartnerLoggedIn(false); }} /> : <PartnerLogin enter={() => setPartnerLoggedIn(true)} exit={() => setConsoleOpen(false)} /> : <Landing openConsole={() => setConsoleOpen(true)} />}</div>
    </>
  );
}
