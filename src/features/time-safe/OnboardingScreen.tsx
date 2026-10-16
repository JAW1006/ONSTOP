import { Check, Plane, PlaneLanding, Route } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { CATEGORIES } from "@/app/categories";
import { useTrip } from "@/app/trip-state";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/i18n/languages";
import { cn } from "@/lib/utils";
import { FlightInput } from "./FlightInput";
import { useArrivalLookup, useDepartureLookup, useTimeSafe } from "./hooks";
import { TimeSafeCard } from "./TimeSafeCard";

/** 온보딩: 언어 → 관심사 → 항공편 + Time-Safe — docs/design/screens/time-safe.md */
export function OnboardingScreen() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const step = Math.min(2, Math.max(0, Number(params.get("step")) || 0));
  const goStep = (s: number) => setParams({ step: String(s) });

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="flex min-h-full flex-col [background:var(--ts-grad-primary)]">
        <header className="px-6 pt-[38px] pb-4 text-white">
          <BrandLogo height={40} />
          <h1 className="mt-[18px] text-title leading-tight font-black">
            {t("brand.tagline.line1")}
            <br />
            {t("brand.tagline.line2")}
          </h1>
          {/* 브랜드 고정 슬로건 — 번역하지 않는다(레거시 동일) */}
          <p className="mt-2 text-body opacity-90">Transit · Drop · Fly Light</p>
        </header>
        <div className="flex-1 rounded-t-panel bg-background px-5 pt-5 pb-7">
          <ol className="mb-5 flex justify-center gap-1.5" aria-label={`${step + 1} / 3`}>
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                aria-current={i === step ? "step" : undefined}
                className={cn("h-[7px] rounded-full", i === step ? "w-[22px] bg-blue" : "w-[7px] bg-line")}
              />
            ))}
          </ol>
          {step === 0 && <LanguageStep onNext={() => goStep(1)} />}
          {step === 1 && <InterestsStep onNext={() => goStep(2)} />}
          {step === 2 && <FlightsStep />}
        </div>
      </div>
    </div>
  );
}

function StepTitle({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-section font-extrabold text-ink">{title}</h2>
      {note && <span className="max-w-[130px] text-right text-micro text-faint">{note}</span>}
    </div>
  );
}

function SelectRow({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3.5",
        selected ? "border-2 border-blue bg-tint" : "border-[1.5px] border-line bg-card",
      )}
    >
      {children}
    </button>
  );
}

function LanguageStep({ onNext }: { onNext: () => void }) {
  const { t, i18n } = useTranslation();
  return (
    <>
      <StepTitle title={t("onboarding.language.title")} />
      <div className="mt-4 flex flex-col gap-2.5">
        {LANGUAGES.map((l) => (
          <SelectRow key={l.code} selected={i18n.language === l.code} onClick={() => i18n.changeLanguage(l.code)}>
            <span className="text-xl" aria-hidden>
              {l.flag}
            </span>
            <span className="flex-1 text-left font-semibold text-ink" lang={l.code}>
              {l.label}
            </span>
            {i18n.language === l.code && <Check size={18} className="text-blue" aria-hidden />}
          </SelectRow>
        ))}
      </div>
      <Button className="mt-5" onClick={onNext}>
        {t("common.next")}
      </Button>
    </>
  );
}

function InterestsStep({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const { interests, toggleInterest } = useTrip();
  return (
    <>
      <StepTitle title={t("onboarding.interests.title")} note={t("onboarding.interests.note")} />
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {CATEGORIES.map(({ key, icon: Icon, labelKey }) => {
          const on = interests.includes(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => toggleInterest(key)}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-lg px-1.5 py-4",
                on ? "border-2 border-blue bg-tint" : "border-[1.5px] border-line bg-card",
              )}
            >
              <Icon size={22} className={on ? "text-blue" : "text-sub"} aria-hidden />
              <span className={cn("text-body font-bold", on ? "text-blue-deep" : "text-ink")}>{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
      <Button className="mt-5" onClick={onNext}>
        {t("common.next")}
      </Button>
    </>
  );
}

function FlightsStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const trip = useTrip();
  const arrival = useArrivalLookup();
  const departure = useDepartureLookup();
  const { bothReady, result } = useTimeSafe();
  // 외출 불가면 코스 추천으로 넘어가지 않는다(레거시는 허용 — 명세 "레거시와 다르게 하는 점")
  const canProceed = bothReady && result.canGoOut;

  // 같은 편명으로 다시 누르면 재조회, 다른 편명이면 쿼리 키가 바뀌어 새로 조회
  const lookup = (input: string, current: string | null, set: (v: string) => void, refetch: () => unknown) =>
    input === current ? refetch() : set(input);

  return (
    <>
      <StepTitle title={t("onboarding.flights.title")} note={t("onboarding.flights.note")} />
      <FlightInput
        label={t("onboarding.flights.arrivalLabel")}
        placeholder={t("onboarding.flights.arrivalPlaceholder")}
        icon={PlaneLanding}
        iconClassName="text-blue"
        value={trip.arrivalInput}
        onChange={trip.setArrivalInput}
        onLookup={() => lookup(trip.arrivalInput, trip.arrivalFlightId, trip.setArrivalFlightId, arrival.refetch)}
        query={arrival}
      />
      <FlightInput
        label={t("onboarding.flights.connectionLabel")}
        placeholder={t("onboarding.flights.connectionPlaceholder")}
        icon={Plane}
        iconClassName="text-gold"
        value={trip.departureInput}
        onChange={trip.setDepartureInput}
        onLookup={() => lookup(trip.departureInput, trip.departureFlightId, trip.setDepartureFlightId, departure.refetch)}
        query={departure}
      />
      <TimeSafeCard />
      <Button
        className="mt-[18px]"
        disabled={!canProceed}
        onClick={() => {
          trip.setOnboarded(true);
          navigate("/");
        }}
      >
        {t("onboarding.flights.cta")} <Route size={16} aria-hidden />
      </Button>
      {!canProceed && (
        <p className="mt-2 text-center text-caption text-faint">
          {bothReady ? t("onboarding.flights.cannotGoOutHint") : t("onboarding.flights.needBothHint")}
        </p>
      )}
    </>
  );
}
