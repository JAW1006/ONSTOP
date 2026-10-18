export const LANGUAGE_CODES = ["en", "zh", "ja", "vi", "ko"] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

/** 언어 선택 화면 표시용(레거시 LANGS와 같은 순서) */
export const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "中文(简体)", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
];

/** 인천공항공사 API lang 파라미터(K/E/C/J). 베트남어는 API 미지원이라 영어로 조회 */
export const AIRPORT_API_LANG: Record<LanguageCode, "K" | "E" | "C" | "J"> = {
  en: "E",
  zh: "C",
  ja: "J",
  vi: "E",
  ko: "K",
};
