import { Bed, TriangleAlert } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";
import { useAppMode } from "@/app/app-mode";
import { useTrip } from "@/app/trip-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { KeyValueRow } from "@/components/ui/key-value-row";
import { PageHeader } from "@/components/ui/page-header";
import { Photo } from "@/components/ui/photo";
import { localize, roomById } from "@/data";
import { isListed, offerFor, partnerOf } from "@/data/partners";
import {
  bookingCheck,
  checkInSlots,
  defaultProduct,
  offerProducts,
  productStartsAt,
  type DayuseProduct,
} from "@/domain/dayuse-pricing";
import { CannotGoOutBox } from "@/features/course/CourseScreen";
import { useCourseModel } from "@/features/course/use-course";
import { useTimeFormat, useTimeSafe } from "@/features/time-safe/hooks";
import { formatKrw } from "@/lib/format";
import { cn } from "@/lib/utils";
import { activeRequest, useBookingRequests } from "./requests";

/** 공식 안내 링크(legal 0-2 — 출입국 공식 포털) */
const ENTRY_GUIDE_URL = "https://www.hikorea.go.kr";
const FEATURES = ["shower", "rest", "luggage"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 데모 띠(B6) — 데모 모드에서만 */
export function DemoBanner() {
  const { t } = useTranslation();
  const { demo } = useAppMode();
  if (!demo) return null;
  return (
    <p role="note" className="bg-ink px-4 py-1.5 text-center text-micro font-bold text-primary-foreground">
      {t("demo.banner")}
    </p>
  );
}

/** 데이유즈 예약 요청 작성 — docs/design/screens/booking.md */
export function BookingScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const fmt = useTimeFormat();
  const { roomId = "" } = useParams();
  const { demo } = useAppMode();
  const trip = useTrip();
  const store = useBookingRequests();
  const ts = useTimeSafe();

  const room = isListed(roomId, demo) ? (roomById(roomId) ?? null) : null;
  // 진입 ①: 이 숙소의 저장된 코스(실제 경로) / 진입 ②: 장소 없이 숙소만(근사)
  const saved = trip.savedCourse?.roomId === roomId ? trip.savedCourse : null;
  const plan = saved?.plan ?? [];
  const model = useCourseModel(room ? roomId : null, plan, { live: !!saved });

  const [slotPick, setSlotPick] = useState<number | null>(null);
  const [productPick, setProductPick] = useState<DayuseProduct | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");
  const [consents, setConsents] = useState({ privacy: false, thirdParty: false, terms: false });
  const [ack, setAck] = useState(false);
  // 비활성 버튼은 눌리지 않으므로 오류는 입력 중에 보여준다(이름은 칸을 벗어난 뒤)
  const [nameTouched, setNameTouched] = useState(false);

  if (!room) {
    return (
      <div>
        <PageHeader title={t("booking.title")} onBack={() => navigate("/")} />
        <div className="px-4 py-[60px] text-center">
          <p className="text-body text-faint">{t("booking.notFound")}</p>
          <Button variant="outline" size="md" className="mt-5" onClick={() => navigate("/")}>
            {t("common.backToHome")}
          </Button>
        </div>
      </div>
    );
  }

  const { offer, source } = offerFor(room.id, demo);
  const products = offerProducts(offer);
  const mode = products.length ? "product" : "quote";
  const returnBy = model.returnByMin;
  const course = model.course;
  const slots = course ? checkInSlots(course.checkInAt) : [];
  const slot = slotPick != null && slots.includes(slotPick) ? slotPick : (slots[0] ?? null);
  const product =
    mode === "product" && slot != null
      ? productPick && productStartsAt(productPick, slot)
        ? productPick
        : defaultProduct(products, slot, returnBy)
      : null;
  const check =
    course && slot != null && (mode === "quote" || product) ? bookingCheck(course, slot, product, returnBy) : null;
  const warn = !!check && (check.plan.blockOver || check.plan.late);
  // 견적 요청인데 숙소 출발 기한이 슬롯보다 이르면 이용할 시간이 없다
  const noTime = !!check && slot != null && check.endMin <= slot;
  const active = activeRequest(store.requests);
  const participation = partnerOf(room.id).participation;

  const errors = {
    name: !name.trim() ? t("booking.contact.error.name") : null,
    email: !EMAIL_RE.test(email.trim()) ? t("booking.contact.error.email") : null,
    email2: email.trim() !== email2.trim() ? t("booking.contact.error.emailMismatch") : null,
  };
  const contactOk = !errors.name && !errors.email && !errors.email2;
  const consentOk = consents.privacy && consents.thirdParty && consents.terms;
  const ready = ts.bothReady && !!check && !noTime;
  const canSubmit = demo && model.canGoOut && !active && ready && contactOk && consentOk && (!warn || ack);

  const submit = () => {
    if (!canSubmit || !check || slot == null) return;
    store.create({
      roomId: room.id,
      mode,
      checkInMin: slot,
      endMin: check.endMin,
      ...(product ? { hours: product.hours, price: product.price, priceSource: source ?? undefined } : {}),
      planIds: plan.map((p) => p.id),
      name: name.trim(),
      email: email.trim(),
      lang,
    });
    navigate("/bookings");
  };

  const typical = offer?.requestResponse?.typicalMinutes;
  // 포함 서비스는 아는 항목만 표시(호텔이 준 다른 항목은 데이터 정리 후)
  const includes = (offer?.includes ?? []).filter((k): k is (typeof FEATURES)[number] =>
    (FEATURES as readonly string[]).includes(k),
  );
  const text = (v: Record<string, string>) => v[lang] ?? v.ko ?? Object.values(v)[0] ?? "";

  return (
    <div>
      <DemoBanner />
      <PageHeader
        title={t(mode === "product" ? "booking.request.title" : "booking.quote.title")}
        subtitle={t("booking.subtitle")}
        onBack={() => navigate(-1)}
      />
      <div className="flex flex-col gap-3.5 p-4">
        {!model.canGoOut && ts.bothReady && <CannotGoOutBox />}
        {active && (
          <p role="alert" className="rounded-md bg-tint px-3 py-2.5 text-body text-blue-deep">
            {t("booking.active")}{" "}
            <Link to="/bookings" className="font-bold underline">
              {t("booking.activeLink")}
            </Link>
          </p>
        )}

        {/* 숙소 카드 — 사진 허락 확인 전이라 틴트 배경 + 아이콘(legal 0-1) */}
        <Card className="flex gap-3 p-3.5">
          <Photo tint={room.tint} height={66} className="w-[66px] shrink-0" icon={<Bed size={26} color="#fff" />} />
          <div className="min-w-0">
            <p className="font-extrabold text-ink">{localize(room.name, lang)}</p>
            <p className="mt-0.5 text-caption text-faint">
              {model.legs[0]?.approx
                ? t("booking.fromAirportApprox", { n: model.legs[0].min })
                : t("unit.minFromAirport", { n: model.legs[0]?.min ?? room.distMin })}
              {includes.length ? ` · ${includes.map((k) => t(`dayuse.feature.${k}`)).join(" · ")}` : ""}
            </p>
            {demo && participation !== "confirmed" && (
              <Badge variant="neutral" className="mt-1">
                {t(
                  participation === "negotiating" ? "booking.participation.negotiating" : "booking.participation.none",
                )}
              </Badge>
            )}
          </div>
        </Card>

        {/* 외출 ≠ 입국 (B7 안 A) */}
        <p className="rounded-md border border-line bg-card px-3 py-2.5 text-caption leading-normal text-sub">
          {t("booking.entryNotice")}{" "}
          <a href={ENTRY_GUIDE_URL} target="_blank" rel="noreferrer" className="font-bold text-blue underline">
            {t("booking.entryNoticeLink")}
          </a>
        </p>

        {/* 체크인 시각 */}
        <section aria-label={t("booking.chooseCheckIn")}>
          <h2 className="text-body font-extrabold text-ink">{t("booking.chooseCheckIn")}</h2>
          {course && (
            <p className="mt-0.5 text-micro text-faint">
              {t("booking.earliestCheckIn", { time: fmt.time(course.checkInAt) })}
            </p>
          )}
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1.5">
            {slots.map((s) => (
              <Chip key={s} active={s === slot} onClick={() => setSlotPick(s)}>
                {fmt.time(s)}
              </Chip>
            ))}
          </div>
        </section>

        {/* 상품(모드 a) / 희망 이용 시간(모드 b) */}
        {mode === "product" ? (
          <section aria-label={t("booking.chooseTimeBlock")}>
            <h2 className="text-body font-extrabold text-ink">
              {t("booking.chooseTimeBlock")}
              {source === "demo" && (
                <Badge variant="neutral" className="ml-1.5 align-middle">
                  {t("common.badge.demo")}
                </Badge>
              )}
            </h2>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1.5">
              {products.map((p) => {
                const ok = slot != null && productStartsAt(p, slot);
                const on = product === p;
                return (
                  <button
                    key={`${p.hours}-${p.price}`}
                    type="button"
                    disabled={!ok}
                    aria-pressed={on}
                    onClick={() => setProductPick(p)}
                    className={cn(
                      "min-w-[92px] shrink-0 cursor-pointer rounded-md border px-2 py-2.5 text-center disabled:cursor-not-allowed disabled:opacity-50",
                      on ? "border-2 border-blue bg-tint" : "border-line bg-card",
                    )}
                  >
                    <span className={cn("block text-body font-extrabold", on ? "text-blue-deep" : "text-ink")}>
                      {t("unit.hours", { h: p.hours })}
                    </span>
                    <span className="block text-caption text-sub">{formatKrw(p.price)}</span>
                    <span className="block text-micro text-faint">
                      {t(p.vatIncluded ? "booking.product.vatIncluded" : "booking.product.vatExcluded")}
                    </span>
                    {p.startWindow && (
                      <span className="block text-micro text-faint">
                        {t("booking.product.startWindow", p.startWindow)}
                      </span>
                    )}
                    {p.conditions && <span className="block text-micro text-faint">{text(p.conditions)}</span>}
                  </button>
                );
              })}
            </div>
            {slot != null && !product && (
              <p className="mt-1 text-caption font-bold text-red">{t("booking.product.noneStartable")}</p>
            )}
          </section>
        ) : (
          check &&
          slot != null && (
            <section aria-label={t("booking.quote.title")} className="rounded-md bg-tint px-3 py-2.5">
              {noTime ? (
                <p className="text-body font-bold text-red">{t("booking.quote.noTime")}</p>
              ) : (
                <>
                  <p className="text-body font-bold text-blue-deep">
                    {t("booking.quote.window", { from: fmt.time(slot), to: fmt.time(check.endMin) })}
                  </p>
                  <p className="mt-0.5 text-caption text-sub">{t("booking.quote.note")}</p>
                </>
              )}
            </section>
          )
        )}

        {/* 시간 확인 — 숙소 복귀 ≤ 이용 종료(B1·B3), 공항 복귀 ≤ 목표 */}
        {check && slot != null && (
          <Card className="p-4" aria-label={t("booking.timing.title")} role="region">
            <h2 className="mb-1.5 text-body font-extrabold text-ink">{t("booking.timing.title")}</h2>
            <KeyValueRow label={t("booking.timing.checkIn")} value={fmt.time(slot)} />
            {check.course.stops.length > 0 && (
              <KeyValueRow label={t("booking.timing.hotelReturn")} value={fmt.time(check.course.hotelReturnAt)} />
            )}
            <KeyValueRow label={t("booking.timing.end")} value={fmt.time(check.endMin)} />
            <KeyValueRow label={t("booking.timing.airport")} value={fmt.time(check.course.returnAt)} />
            <KeyValueRow label={t("course.summary.returnTarget")} value={fmt.time(returnBy)} />
            {check.course.waitMin > 0 && (
              <p className="mt-1.5 text-caption text-sub">{t("booking.timing.wait", { n: check.course.waitMin })}</p>
            )}
            {!saved && <p className="mt-1.5 text-caption text-faint">{t("booking.timing.noCourse")}</p>}
            {warn && (
              <div
                role="alert"
                className="mt-2.5 flex flex-col gap-1.5 rounded-md bg-danger-bg px-3 py-2.5 text-body font-bold text-role-return"
              >
                {check.plan.blockOver && (
                  <Warning>
                    {t("course.summary.blockOver", {
                      time: fmt.time(check.course.hotelReturnAt),
                      end: fmt.time(check.endMin),
                      min: check.plan.blockOverMin,
                    })}
                  </Warning>
                )}
                {check.plan.late && (
                  <Warning>
                    {t("booking.timing.late", {
                      time: fmt.time(check.course.returnAt),
                      target: fmt.time(returnBy),
                      min: check.plan.lateMin,
                    })}
                  </Warning>
                )}
                <label className="mt-1 flex items-center gap-2 font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={ack}
                    onChange={(e) => setAck(e.target.checked)}
                    className="size-4 accent-blue"
                  />
                  {t("booking.timing.ack")}
                </label>
              </div>
            )}
          </Card>
        )}

        {/* 포함 일정 */}
        {saved ? (
          <Card className="p-4">
            <h2 className="text-body font-extrabold text-ink">{t("booking.plan.title")}</h2>
            <p className="mb-2 text-micro text-faint">{t("booking.plan.count", { n: plan.length })}</p>
            <ul className="flex flex-col gap-1.5">
              {plan.map((p) => (
                <li key={p.id} className="flex justify-between text-caption">
                  <span className="font-bold text-ink">{localize(p.name, lang)}</span>
                  <span className="text-faint">{t("unit.stayMin", { n: p.durMin })}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              trip.setCourseRoomId(room.id);
              navigate("/course");
            }}
          >
            {t("booking.makeCourse")}
          </Button>
        )}

        {/* 요청 내용 */}
        {check && slot != null && (
          <Card className="p-4">
            <h2 className="mb-1.5 text-body font-extrabold text-ink">{t("booking.summary.title")}</h2>
            {product ? (
              <>
                <KeyValueRow
                  label={t("bookings.mode.product")}
                  value={t("booking.summary.block", {
                    h: product.hours,
                    from: fmt.time(slot),
                    to: fmt.time(check.endMin),
                  })}
                />
                <KeyValueRow label={t("booking.summary.price")} value={formatKrw(product.price)} />
                <p className="text-micro text-faint">{t("booking.summary.priceNote")}</p>
              </>
            ) : (
              <KeyValueRow label={t("bookings.mode.quote")} value={t("booking.summary.quote")} />
            )}
            <KeyValueRow
              label={t("booking.summary.policy")}
              value={offer?.cancellation ? text(offer.cancellation) : t("booking.summary.policyPending")}
            />
          </Card>
        )}

        {/* 연락처 — 이름(영문 가능)·이메일만(B4) */}
        <Card className="flex flex-col gap-2.5 p-4">
          <div>
            <h2 className="text-body font-extrabold text-ink">{t("booking.contact.title")}</h2>
            <p className="text-micro text-faint">{t("booking.contact.minimal")}</p>
          </div>
          <Field
            label={t("booking.contact.name")}
            hint={t("booking.contact.nameHint")}
            error={nameTouched ? errors.name : null}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              autoComplete="name"
              className={INPUT}
            />
          </Field>
          <Field label={t("booking.contact.email")} error={email ? errors.email : null}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={INPUT}
            />
          </Field>
          <Field label={t("booking.contact.emailConfirm")} error={email2 ? errors.email2 : null}>
            <input
              type="email"
              value={email2}
              onChange={(e) => setEmail2(e.target.value)}
              autoComplete="off"
              className={INPUT}
            />
          </Field>
        </Card>

        {/* 동의(legal 확인 전 초안) */}
        <Card className="flex flex-col gap-2 p-4" role="group" aria-label={t("booking.consent.title")}>
          <h2 className="text-body font-extrabold text-ink">{t("booking.consent.title")}</h2>
          {(["privacy", "thirdParty", "terms"] as const).map((k) => (
            <label key={k} className="flex items-start gap-2 text-caption text-sub">
              <input
                type="checkbox"
                checked={consents[k]}
                onChange={(e) => setConsents((c) => ({ ...c, [k]: e.target.checked }))}
                className="mt-0.5 size-4 shrink-0 accent-blue"
              />
              {t(`booking.consent.${k}`)}
            </label>
          ))}
        </Card>

        <p className="text-caption text-sub">{t("booking.entryNoticeShort")}</p>
        {!demo && <p className="text-caption font-bold text-red">{t("booking.submit.notReady")}</p>}
        <Button disabled={!canSubmit} onClick={submit}>
          {t(mode === "product" ? "booking.submit.product" : "booking.submit.quote")}
        </Button>
        <p className="text-center text-micro text-faint">
          {typical ? t("booking.submit.noteTypical", { n: typical }) : t("booking.submit.note")}
        </p>
      </div>
    </div>
  );
}

const INPUT = "w-full rounded-md border border-line bg-card px-3 py-2.5 text-body text-ink";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error: string | null;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-caption font-bold text-ink">{label}</span>
      {children}
      {hint && <span className="text-micro text-faint">{hint}</span>}
      {error && <span className="text-micro font-bold text-red">{error}</span>}
    </label>
  );
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-1.5">
      <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
      {children}
    </p>
  );
}
