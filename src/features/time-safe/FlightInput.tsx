import type { UseQueryResult } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FlightLookupError, type FlightInfo } from "./api";

const ERROR_KEY = {
  notFound: "flight.error.notFound",
  noArrivalTime: "flight.error.noArrivalTime",
  noDepartureTime: "flight.error.noDepartureTime",
} as const;

/** 편명 입력 + 실시간 조회 버튼 + 오류 문구 */
export function FlightInput({
  label,
  placeholder,
  icon: Icon,
  iconClassName,
  value,
  onChange,
  onLookup,
  query,
}: {
  label: string;
  placeholder: string;
  icon: LucideIcon;
  iconClassName: string;
  value: string;
  onChange: (v: string) => void;
  onLookup: () => void;
  query: UseQueryResult<FlightInfo>;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const loading = query.isFetching;
  const error = query.isError && !query.data ? query.error : null;
  const errorText =
    error instanceof FlightLookupError && error.code !== "server" ? t(ERROR_KEY[error.code]) : error?.message;

  return (
    <div className="mt-4">
      <label htmlFor={inputId} className="mb-1.5 block text-caption font-bold text-faint">
        {label}
      </label>
      <div className="flex items-center gap-2.5 rounded-lg border-[1.5px] border-line bg-card px-4 py-3.5">
        <Icon size={18} className={iconClassName} aria-hidden />
        <input
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && value && !loading && onLookup()}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-transparent text-section font-bold text-ink outline-none placeholder:text-faint"
        />
        <Button variant="secondary" size="sm" className="shrink-0" disabled={!value || loading} onClick={onLookup}>
          {loading ? t("onboarding.flights.lookingUp") : t("onboarding.flights.lookup")}
        </Button>
      </div>
      {errorText && (
        <p role="alert" className="mt-2 text-caption text-red">
          {errorText} · {t("onboarding.flights.retryHint")}
        </p>
      )}
    </div>
  );
}
