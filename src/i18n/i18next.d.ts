import "i18next";
import type ko from "./locales/ko.json";

// t("nav.home")처럼 키를 타입 검사한다. 원본 키는 ko.json.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: typeof ko };
  }
}
