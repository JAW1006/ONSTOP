import type { ParseKeys } from "i18next";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/page-header";

/** 3단계 자리 화면 — 4단계에서 각 feature 화면으로 교체 */
export function PlaceholderPage({ titleKey }: { titleKey: ParseKeys }) {
  const { t } = useTranslation();
  return <PageHeader title={t(titleKey)} />;
}
