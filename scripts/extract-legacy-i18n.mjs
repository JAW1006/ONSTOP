// 레거시 app/index.html의 STR(183) + CAT_LABELS(7) = 190개 문구를 언어별 JSON으로 추출한다.
// 실행: node scripts/extract-legacy-i18n.mjs
// 결과: src/i18n/locales/<lang>.json, docs/design/i18n-keys.md (레거시 키 → 새 키 대응표)
// 레거시가 legacy/로 옮겨진 뒤에는 SOURCE 경로만 바꾸면 된다. JSON을 직접 고친 뒤에는 다시 실행하지 않는다.
import fs from "node:fs";

const SOURCE = "app/index.html";
const LANGS = ["ko", "en", "zh", "ja", "vi"];

// 레거시 키 → 의미 기반 키
const KEY_MAP = {
  // 공통
  next: "common.next",
  moreBtn: "common.more",
  showMorePlacesBtn: "common.showMoreCount",
  deleteBtn: "common.remove",
  dismissNoticeLabel: "common.dismiss",
  comingSoonLbl: "common.comingSoon",
  homeBtn: "common.backToHome",
  realtimeBadge: "common.badge.live",
  demoBadge: "common.badge.demo",
  adBadge: "common.badge.partnerAd",
  bestBadge: "common.badge.topPick",
  // 단위·시간 표기
  durationMin: "unit.minutes",
  stayHoursOnly: "unit.hours",
  stayHoursMinutes: "unit.hoursMinutes",
  nextDayLbl: "unit.nextDay",
  hourRange: "unit.hourRange",
  airportMinAway: "unit.minFromAirport",
  moveMinLbl: "unit.transferMin",
  stayMinLbl: "unit.stayMin",
  // 브랜드
  taglineLine1: "brand.tagline.line1",
  taglineLine2: "brand.tagline.line2",
  // 탭
  navHome: "nav.home",
  navLuggage: "nav.luggage",
  navCourse: "nav.course",
  navBooking: "nav.booking",
  navMy: "nav.my",
  // 온보딩
  step0Title: "onboarding.language.title",
  step1Title: "onboarding.interests.title",
  step1Note: "onboarding.interests.note",
  step2Title: "onboarding.flights.title",
  step2Note: "onboarding.flights.note",
  arrivalLabel: "onboarding.flights.arrivalLabel",
  arrivalPlaceholder: "onboarding.flights.arrivalPlaceholder",
  connLabel: "onboarding.flights.connectionLabel",
  connPlaceholder: "onboarding.flights.connectionPlaceholder",
  lookupBtn: "onboarding.flights.lookup",
  lookupBtnLoading: "onboarding.flights.lookingUp",
  retryFlightHint: "onboarding.flights.retryHint",
  needFlightHint: "onboarding.flights.needBothHint",
  ctaSmartCourse: "onboarding.flights.cta",
  // 항공편
  errNotFound: "flight.error.notFound",
  errNoArriveTime: "flight.error.noArrivalTime",
  errNoDepartTime: "flight.error.noDepartureTime",
  fromLbl: "flight.from",
  toLbl: "flight.to",
  terminalLbl: "flight.terminal",
  gateLbl: "flight.gate",
  departsLbl: "flight.departs",
  statusLbl: "flight.status",
  remarkNormal: "flight.onTime",
  flightArriveLine: "flight.arrivalLine",
  flightDepartLine: "flight.departureLine",
  delayedByLbl: "flight.delayed",
  flightArriveChangedNotice: "flight.notice.arrivalChanged",
  flightDepartChangedNotice: "flight.notice.returnByChanged",
  refreshFlightLabel: "flight.refresh",
  changeFlightLabel: "flight.change",
  // Time-Safe
  timeSafeHeading: "timeSafe.heading",
  statusRealtimeConn: "timeSafe.liveDepartureApplied",
  timeSafeNeedsFlight: "timeSafe.needArrival",
  timeSafeNeedsConnFlight: "timeSafe.needConnection",
  cannotGoOutTitle: "timeSafe.cannotGoOut.title",
  cannotGoOutDesc: "timeSafe.cannotGoOut.description",
  stayAvailable: "timeSafe.outingAvailable",
  stayAvailableShort: "timeSafe.outingAvailableShort",
  arriveWord: "timeSafe.arrive",
  returnRecWord: "timeSafe.returnBy",
  returnRecommend: "timeSafe.returnRecommended",
  totalConnTimeLbl: "timeSafe.totalConnection",
  bufferAppliedNote: "timeSafe.bufferNote",
  securityWaitLiveBadge: "timeSafe.liveSecurityWait",
  pushNotice: "timeSafe.pushScheduled",
  // 홈
  greeting: "home.greeting",
  homeSub: "home.subtitle",
  sectionTimeFit: "home.timeFit.title",
  sectionTimeFitSub: "home.timeFit.subtitle",
  homeBuildPrefix: "home.timeFit.build.prefix",
  homeBuildBold: "home.timeFit.build.bold",
  homeBuildSuffix: "home.timeFit.build.suffix",
  makeBtn: "home.timeFit.build.cta",
  sectionDayuse: "home.dayuse.title",
  sectionDayuseSub: "home.dayuse.subtitle",
  luggageCareTitle: "home.luggageBanner.title",
  luggageCareSub: "home.luggageBanner.subtitle",
  sectionLocal: "home.hotPlaces.title",
  sectionLocalSub: "home.hotPlaces.subtitle",
  // 데이유즈 공통
  featShower: "dayuse.feature.shower",
  featRest: "dayuse.feature.rest",
  featLuggage: "dayuse.feature.luggage",
  perBlock: "dayuse.perBlock",
  timeBlockWord: "dayuse.timeBlock",
  // 예약
  bookingTitle: "booking.title",
  bookingSub: "booking.subtitle",
  chooseTimeBlockLbl: "booking.chooseTimeBlock",
  checkInSlotLbl: "booking.chooseCheckIn",
  earliestCheckInNote: "booking.earliestCheckIn",
  includesShowerRestLuggage: "booking.includes",
  paymentDetails: "booking.payment.title",
  totalPayment: "booking.payment.total",
  easyPayNote: "booking.payment.methods",
  payBtn: "booking.payment.pay",
  planSummaryTitle: "booking.plan.title",
  planSummaryCount: "booking.plan.count",
  checkoutPastReturnWarning: "booking.checkoutPastReturn",
  noBookingsYet: "booking.empty",
  browseRoomsBtn: "booking.browseStays",
  // 예약 확인
  confirmTitle: "confirm.title",
  confirmSub: "confirm.subtitle",
  bookingComplete: "confirm.complete",
  bookingNumber: "confirm.bookingNumber",
  lodgingLbl: "confirm.stay",
  includedLbl: "confirm.included",
  confirmIncludedVal: "confirm.includedValue",
  confirmReturnAt: "confirm.returnAt",
  alertOnLbl: "confirm.alertOn",
  // 짐 케어
  luggageTitle: "luggage.title",
  luggageSub: "luggage.subtitle",
  luggageBannerPrefix: "luggage.banner.prefix",
  luggageBannerBold: "luggage.banner.bold",
  luggageBannerSuffix: "luggage.banner.suffix",
  luggageOpt1Title: "luggage.option.inAirport.title",
  luggageOpt1Desc: "luggage.option.inAirport.description",
  luggageOpt2Title: "luggage.option.toHotel.title",
  luggageOpt2Desc: "luggage.option.toHotel.description",
  luggageOpt3Title: "luggage.option.toDistrict.title",
  luggageOpt3Desc: "luggage.option.toDistrict.description",
  // 마이
  myPageTitle: "my.title",
  myPageSub: "my.subtitle",
  myPageGreeting: "my.greeting",
  bookingCountLabel: "my.bookingCount",
  menuBookingHistory: "my.menu.bookingHistory",
  menuCoupon: "my.menu.coupons",
  menuTimeSafeAlert: "my.menu.timeSafeAlerts",
  menuPassport: "my.menu.passport",
  menuLangSetting: "my.menu.language",
  // 코스 빌더
  courseTitle: "course.title",
  courseSub: "course.subtitle",
  layoverFree: "course.budget.hours",
  overBudget: "course.budget.over",
  spareBudget: "course.budget.spare",
  arriveReturnLine: "course.budget.arriveReturn",
  step1RoomTitle: "course.room.title",
  step1RoomRequired: "course.room.required",
  step2CatTitle: "course.category.title",
  step2CatSub: "course.category.note",
  autoBuildBtn: "course.autoBuild.cta",
  autoBuildNote: "course.autoBuild.note",
  sectionVisitPlaces: "course.places.title",
  selCombined: "course.places.combined",
  selChoose: "course.places.chooseCategory",
  selChooseRoomFirst: "course.places.chooseRoomFirst",
  roomFirstHint: "course.places.roomFirstHint",
  fitsInTransit: "course.places.fits",
  tightTime: "course.places.tight",
  addToPlanBtn: "course.places.add",
  sectionMySchedule: "course.schedule.title",
  scheduleSummary: "course.schedule.summary",
  scheduleEmptyHint: "course.schedule.emptyHint",
  pickRoomPrefix: "course.schedule.pickRoom.prefix",
  pickRoomBold: "course.schedule.pickRoom.bold",
  pickRoomSuffix: "course.schedule.pickRoom.suffix",
  overBudgetWarning: "course.schedule.overWarning",
  bookThisRoomBtn: "course.bookThisStay",
  saveCourseBtn: "course.save",
  courseStepArrive: "course.step.arrive.title",
  courseStepArriveSub: "course.step.arrive.sub",
  courseStepRoomCheckin: "course.step.checkIn.title",
  courseStepRoomSub: "course.step.checkIn.sub",
  courseStepPlaceSub: "course.step.place.sub",
  courseStepPlaceSubNoDur: "course.step.place.subNoStay",
  courseStepReturn: "course.step.return.title",
  courseStepReturnSub: "course.step.return.sub",
  mapPickRoomNote: "course.map.pickRoomNote",
  mapAllPlacesNote: "course.map.allPlacesNote",
  routeLegend: "course.map.routeLegend",
  mapUnavailable: "course.map.unavailable",
  poiRefOnly: "course.map.referenceOnly",
  routeLoading: "course.route.loading",
  routeLive: "course.route.live",
  // 저장된 코스
  savedCourseTitle: "savedCourse.title",
  savedCourseSub: "savedCourse.subtitle",
  editCourseBtn: "savedCourse.edit",
  noSavedCourseMsg: "savedCourse.empty",
};

const CATEGORY_MAP = {
  Food: "category.food",
  Massage: "category.massage",
  Shopping: "category.shopping",
  Rest: "category.rest",
  Beauty: "category.beauty",
  Sightseeing: "category.sightseeing",
  Brand: "category.brand",
};

// 문구가 기능·계산과 어긋나 수정이 필요한 키(STATUS A7). 문구는 그대로 추출하고 표시만 한다.
const FLAGGED = {
  autoBuildNote: "A7: OR-Tools 최적화라고 하지만 실제는 탐욕법",
  pushNotice: "A7: 푸시 알림 기능 없음",
  courseStepReturnSub: "A7: '여유 30분' 계산 없음",
  bufferAppliedNote: "A7: 버퍼 3요소(입국심사 포함)와 불일치",
  scheduleSummary: "요약 표기 '사용 X / 가용 Y'로 교체 예정(STATUS 확인 필요)",
};

const src = fs.readFileSync(SOURCE, "utf8").split("\r\n").join("\n");
const evalObject = (name) => {
  const m = src.match(new RegExp(`const ${name} = (\\{[\\s\\S]*?\\n\\});\\n`));
  if (!m) throw new Error(`${name} not found in ${SOURCE}`);
  return new Function(`return ${m[1]}`)();
};
const STR = evalObject("STR");
const CAT_LABELS = evalObject("CAT_LABELS");

const unmapped = Object.keys(STR).filter((k) => !KEY_MAP[k]);
const stale = Object.keys(KEY_MAP).filter((k) => !STR[k]);
if (unmapped.length || stale.length) throw new Error(`unmapped: ${unmapped} / stale: ${stale}`);
const targets = [...Object.values(KEY_MAP), ...Object.values(CATEGORY_MAP)];
if (new Set(targets).size !== targets.length) throw new Error("duplicate target key");

// 레거시 "{name}" → i18next "{{name}}"
const toI18next = (s) => s.replace(/\{(\w+)\}/g, "{{$1}}");
const setPath = (obj, path, value) => {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts.slice(0, -1)) cur = cur[p] ??= {};
  const leaf = parts[parts.length - 1];
  if (leaf in cur) throw new Error(`path collision: ${path}`);
  cur[leaf] = value;
};
const sortDeep = (o) =>
  typeof o === "object"
    ? Object.fromEntries(
        Object.keys(o)
          .sort()
          .map((k) => [k, sortDeep(o[k])]),
      )
    : o;

fs.mkdirSync("src/i18n/locales", { recursive: true });
for (const lang of LANGS) {
  const out = {};
  for (const [legacy, key] of Object.entries(KEY_MAP)) setPath(out, key, toI18next(STR[legacy][lang]));
  for (const [legacy, key] of Object.entries(CATEGORY_MAP)) setPath(out, key, CAT_LABELS[legacy][lang]);
  fs.writeFileSync(`src/i18n/locales/${lang}.json`, JSON.stringify(sortDeep(out), null, 2) + "\n");
}

const rows = [
  ...Object.entries(KEY_MAP).map(
    ([l, k]) => `| \`${l}\` | \`${k}\` | ${STR[l].ko.replace(/\|/g, "\\|")} | ${FLAGGED[l] ?? ""} |`,
  ),
  ...Object.entries(CATEGORY_MAP).map(([l, k]) => `| \`CAT_LABELS.${l}\` | \`${k}\` | ${CAT_LABELS[l].ko} | |`),
];
fs.writeFileSync(
  "docs/design/i18n-keys.md",
  `# i18n 키 대응표 (레거시 → 새 키)

> 상태: 확정 · 생성: \`node scripts/extract-legacy-i18n.mjs\` (손으로 고치지 말 것)
> 레거시 \`STR\` ${Object.keys(STR).length}개 + \`CAT_LABELS\` ${Object.keys(CAT_LABELS).length}개 = ${rows.length}개 · 언어: ${LANGS.join(", ")} · 자리표시자 \`{x}\` → \`{{x}}\`

| 레거시 키 | 새 키 | ko | 비고 |
|---|---|---|---|
${rows.join("\n")}
`,
);
console.log(`extracted ${rows.length} keys × ${LANGS.length} languages`);
