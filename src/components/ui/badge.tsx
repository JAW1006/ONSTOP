import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-micro font-bold", {
  variants: {
    variant: {
      success: "bg-success-bg text-success", // 실시간, 환승 내 가능
      danger: "bg-danger-bg text-red", // 시간 빠듯, 초과
      ad: "border border-ad-border bg-ad-bg text-gold-deep", // 제휴 AD
      info: "bg-tint text-blue-deep",
      neutral: "bg-muted text-sub", // 데모값
      solid: "bg-blue text-primary-foreground", // 사진 위 추천 배지
    },
  },
  defaultVariants: { variant: "info" },
});

export function Badge({ className, variant, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export const CATEGORY_KEYS = ["Food", "Massage", "Shopping", "Rest", "Beauty", "Sightseeing", "Brand"] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

/** 카테고리 색(tokens.css --ts-cat-*) */
export const categoryColor = (cat: CategoryKey) => `var(--ts-cat-${cat.toLowerCase()})`;

/** 카테고리 색 배경 + 흰 글씨 배지 */
export function CategoryBadge({ category, className, style, ...props }: ComponentProps<"span"> & { category: CategoryKey }) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants(), "text-white", className)}
      style={{ backgroundColor: categoryColor(category), ...style }}
      {...props}
    />
  );
}
