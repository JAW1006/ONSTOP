import { Bed, Route } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useTrip } from "@/app/trip-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { localize, roomImage } from "@/data";
import { CannotGoOutBox, CourseHeader, LegDetail } from "./CourseScreen";
import { CourseMap } from "./CourseMap";
import { CourseTimeline } from "./CourseTimeline";
import { SummaryPanel } from "./SummaryPanel";
import { useActiveBlock } from "@/features/booking/requests";
import { useCourseModel } from "./use-course";

/** 저장된 코스(읽기 전용) — 수정하기 / 이 숙소로 예약하기만(레거시 SavedCourseScreen) */
export function SavedCourseScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const trip = useTrip();
  const saved = trip.savedCourse;
  // 확정된 코스 — 여기서만 실제 경로를 조회한다
  const model = useCourseModel(saved?.roomId ?? null, saved?.plan ?? [], {
    live: true,
    booking: useActiveBlock(saved?.roomId ?? null),
  });
  const [selectedLeg, setSelectedLeg] = useState<number | null>(null);

  if (!saved || !model.room) {
    return (
      <div>
        <PageHeader title={t("savedCourse.title")} subtitle={t("savedCourse.subtitle")} onBack={() => navigate("/")} />
        <div className="px-4 py-[60px] text-center">
          <Route size={40} className="mx-auto mb-3 text-faint" aria-hidden />
          <p className="text-body text-faint">{t("savedCourse.empty")}</p>
        </div>
      </div>
    );
  }
  const room = model.room;
  return (
    <div>
      <CourseHeader model={model} onBack={() => navigate("/")} titleKey="savedCourse.title" />
      <div className="p-4">
        {!model.canGoOut && <CannotGoOutBox />}
        <Card className="mb-3.5 flex gap-3 p-3.5">
          <div
            className="flex size-[66px] shrink-0 items-center justify-center overflow-hidden rounded-md"
            style={{ background: room.tint }}
          >
            {roomImage(room) ? (
              <img src={roomImage(room)} alt="" className="size-full object-cover" />
            ) : (
              <Bed size={26} color="#fff" aria-hidden />
            )}
          </div>
          <div>
            <p className="font-extrabold text-ink">{localize(room.name, i18n.language)}</p>
            <p className="mt-0.5 text-caption text-faint">{t("booking.plan.count", { n: saved.plan.length })}</p>
          </div>
        </Card>
        <CourseMap
          roomId={room.id}
          plan={saved.plan}
          legs={model.legs}
          showOtherHotels={false}
          selectedLeg={selectedLeg}
          onSelectLeg={setSelectedLeg}
        />
        {model.legs.length > 0 && <p className="mt-2 text-micro text-faint">{t("course.map.legend")}</p>}
        {selectedLeg != null && model.legs[selectedLeg] && <LegDetail leg={model.legs[selectedLeg]!} />}
        <p className={model.routeLoading ? "mt-1 text-micro text-faint" : "mt-1 text-micro font-bold text-success"}>
          {model.routeLoading ? t("course.route.loading") : t("course.route.live")}
        </p>
        <SummaryPanel model={model} />
        <div className="mt-4">
          <CourseTimeline model={model} plan={saved.plan} />
        </div>
        <div className="mt-4 flex gap-2.5">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={() => {
              trip.setCourseRoomId(saved.roomId);
              trip.setCoursePlan(saved.plan);
              trip.setCourseCats(saved.cats);
              navigate("/course");
            }}
          >
            {t("savedCourse.edit")}
          </Button>
          <Button
            size="md"
            className="flex-1"
            disabled={!model.canGoOut}
            onClick={() => navigate(`/booking/${saved.roomId}`)}
          >
            {t("course.bookThisStay")}
          </Button>
        </div>
      </div>
    </div>
  );
}
