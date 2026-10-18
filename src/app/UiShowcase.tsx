import { Bed, Utensils } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, CategoryBadge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { FakeQR } from "@/components/ui/fake-qr";
import { KeyValueRow } from "@/components/ui/key-value-row";
import { PageHeader } from "@/components/ui/page-header";
import { Photo } from "@/components/ui/photo";
import { SectionHeader } from "@/components/ui/section-header";
import { Switch } from "@/components/ui/switch";
import { LANGUAGES } from "@/i18n/languages";

/** 개발 모드 전용(/dev/ui) — 공통 컴포넌트 견본. 문구는 기존 i18n 키만 쓴다. */
export function UiShowcase() {
  const { t, i18n } = useTranslation();
  const [sheet, setSheet] = useState(false);
  const [food, setFood] = useState(true);
  return (
    <div>
      <PageHeader title={t("my.title")} subtitle={t("my.subtitle")} onBack={() => history.back()} />
      <div className="space-y-4 p-4">
        <div className="rounded-xl p-4 [background:var(--ts-grad-primary)]">
          <BrandLogo height={30} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <Chip key={l.code} active={i18n.language === l.code} onClick={() => i18n.changeLanguage(l.code)}>
              {l.flag} {l.label}
            </Chip>
          ))}
        </div>
        <SectionHeader
          title={t("home.dayuse.title")}
          subtitle={t("home.dayuse.subtitle")}
          onMore={() => setSheet(true)}
        />
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Photo icon={<Bed size={30} color="#fff" />} tint="#BBD3F5" badge={t("common.badge.topPick")} />
            <Photo
              icon={<Utensils size={22} color="#fff" />}
              tint="#F3C4B8"
              height={82}
              badge={t("common.badge.partnerAd")}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="success">{t("course.places.fits")}</Badge>
            <Badge variant="danger">{t("course.places.tight")}</Badge>
            <Badge variant="ad">{t("common.badge.partnerAd")}</Badge>
            <Badge variant="neutral">{t("common.badge.demo")}</Badge>
            <CategoryBadge category="Food">{t("category.food")}</CategoryBadge>
            <CategoryBadge category="Brand">{t("category.brand")}</CategoryBadge>
          </div>
          <div className="mt-3 flex gap-1.5">
            <Chip active={food} onClick={() => setFood(!food)}>
              {t("category.food")}
            </Chip>
            <Chip>{t("category.shopping")}</Chip>
          </div>
        </Card>
        <Card className="space-y-2 p-4">
          <KeyValueRow label={t("confirm.stay")} value="Hotel Aura" />
          <KeyValueRow label={t("booking.payment.total")} value="₩50,000" size="md" />
          <div className="flex items-center justify-between">
            <span className="text-emph text-ink">{t("my.menu.coupons")}</span>
            <Switch defaultChecked aria-label={t("my.menu.coupons")} />
          </div>
        </Card>
        <Button onClick={() => setSheet(true)}>{t("booking.payment.pay")}</Button>
        <Button disabled>{t("onboarding.flights.cta")}</Button>
        <div className="flex gap-2.5">
          <Button variant="outline" size="md" className="flex-1">
            {t("savedCourse.edit")}
          </Button>
          <Button variant="secondary" size="sm">
            {t("onboarding.flights.lookup")}
          </Button>
        </div>
        <div className="flex justify-center">
          <FakeQR />
        </div>
      </div>
      <BottomSheet open={sheet} onOpenChange={setSheet} title={t("my.menu.language")}>
        <p className="text-body text-sub">{t("course.map.referenceOnly")}</p>
      </BottomSheet>
    </div>
  );
}
