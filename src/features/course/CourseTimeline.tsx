import { Bed, Luggage, PlaneLanding } from "lucide-react";
import { useTranslation } from "react-i18next";
import { categoryIcon } from "@/app/categories";
import { Card } from "@/components/ui/card";
import { localize, type CoursePlace } from "@/data";
import { useTimeFormat } from "@/features/time-safe/hooks";
import type { CourseModel } from "./use-course";

/** 내 일정 — 공항 밖 → 체크인 → 장소들 → 숙소 복귀(B1, 장소가 있을 때) → 공항 복귀(시각). 복귀 줄은 레거시 "알림 · 여유 30분" 대신 복귀 도착 목표 */
export function CourseTimeline({ model, plan, onRemove }: { model: CourseModel; plan: readonly CoursePlace[]; onRemove?: (id: string) => void }) {
  const { t, i18n } = useTranslation();
  const fmt = useTimeFormat();
  const { course, room, legs } = model;
  if (!course || !room) return null;
  const steps = [
    { key: "arrive", at: model.exitAtMin, title: t("course.step.arrive.title"), sub: t("course.step.arrive.sub"), icon: Luggage, tone: "bg-ink" },
    {
      key: "checkin",
      at: course.checkInAt,
      title: t("course.step.checkIn.title", { room: localize(room.name, i18n.language) }),
      sub: t("course.step.checkIn.sub", { move: legs[0]?.min ?? 0 }),
      icon: Bed,
      tone: "bg-role-base",
    },
    ...plan.map((p, i) => ({
      key: p.id,
      at: course.stops[i]!.arriveAt,
      title: localize(p.name, i18n.language),
      sub: t(p.dur > 0 ? "course.step.place.sub" : "course.step.place.subNoStay", { area: localize(p.area, i18n.language), dur: p.dur, move: legs[i + 1]?.min ?? 0 }),
      icon: categoryIcon(p.cat),
      tone: "bg-role-place",
      id: p.id,
    })),
    ...(plan.length
      ? [
          {
            key: "hotelReturn",
            at: course.hotelReturnAt,
            title: t("course.step.hotelReturn.title", { room: localize(room.name, i18n.language) }),
            sub: t("course.step.hotelReturn.sub", { move: course.hotelReturnLegMin }),
            icon: Bed,
            tone: model.returnPlan?.blockOver ? "bg-role-return" : "bg-role-base",
          },
        ]
      : []),
    {
      key: "return",
      at: course.returnAt,
      title: t("course.step.return.title"),
      sub: t("course.step.return.target", { time: fmt.time(model.returnByMin) }),
      icon: PlaneLanding,
      tone: "bg-role-return",
    },
  ];
  const late = model.returnPlan?.late;

  return (
    <Card className="p-4">
      <ol>
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`flex size-[26px] items-center justify-center rounded-full text-white ${s.tone}`}>
                  <Icon size={14} aria-hidden />
                </span>
                {i < steps.length - 1 && <span className="min-h-4 w-0.5 flex-1 bg-line" />}
              </div>
              <div className={i < steps.length - 1 ? "flex-1 pb-3" : "flex-1"}>
                <div className="flex items-center justify-between">
                  <p className="text-body font-bold text-ink">
                    <span className={`mr-2 ${s.key === "return" && late ? "text-role-return" : "text-blue"}`}>{fmt.time(s.at)}</span>
                    {s.title}
                  </p>
                  {"id" in s && s.id && onRemove && (
                    <button type="button" onClick={() => onRemove(s.id!)} className="cursor-pointer text-caption text-faint">
                      {t("common.remove")}
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-caption text-faint">{s.sub}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
