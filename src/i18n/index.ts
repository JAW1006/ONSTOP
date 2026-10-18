import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ko from "./locales/ko.json";
import en from "./locales/en.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";
import vi from "./locales/vi.json";
import { DEFAULT_LANGUAGE } from "./languages";

// 키 원본은 ko.json — 문구 추가는 5개 파일에 같은 키로. 레거시 대응표: docs/design/i18n-keys.md
export const resources = {
  ko: { translation: ko },
  en: { translation: en },
  zh: { translation: zh },
  ja: { translation: ja },
  vi: { translation: vi },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  // 키가 없으면 ko → en 순으로 폴백(레거시 동작은 ko 폴백)
  fallbackLng: ["ko", "en"],
  // en/zh/vi의 일부 문장 끝 조각은 의도적으로 빈 문자열이다 — 폴백하지 않는다
  returnEmptyString: true,
  interpolation: { escapeValue: false },
});

export default i18n;
