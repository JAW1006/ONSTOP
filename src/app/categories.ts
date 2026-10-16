import { Bed, Camera, Scissors, ShoppingBag, Sparkles, Tag, Utensils, type LucideIcon } from "lucide-react";
import type { CategoryKey } from "@/components/ui/badge";

/** 활동 카테고리 표시 순서·아이콘(레거시 CATS). 이름은 i18n `category.<소문자>` */
export const CATEGORIES: { key: CategoryKey; icon: LucideIcon; labelKey: `category.${Lowercase<CategoryKey>}` }[] = [
  { key: "Food", icon: Utensils, labelKey: "category.food" },
  { key: "Massage", icon: Sparkles, labelKey: "category.massage" },
  { key: "Shopping", icon: ShoppingBag, labelKey: "category.shopping" },
  { key: "Rest", icon: Bed, labelKey: "category.rest" },
  { key: "Beauty", icon: Scissors, labelKey: "category.beauty" },
  { key: "Sightseeing", icon: Camera, labelKey: "category.sightseeing" },
  { key: "Brand", icon: Tag, labelKey: "category.brand" },
];

export const categoryIcon = (key: CategoryKey): LucideIcon => CATEGORIES.find((c) => c.key === key)!.icon;
