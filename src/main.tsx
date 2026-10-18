import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { APP_NAME } from "@/branding";
import "@/i18n";
import "@/styles/index.css";

// index.html의 <title>은 정적 문자열이라(빌드 전에 열어도 보이게) 그대로 두되, 실제 출처인
// APP_NAME과 런타임에 맞춘다 — 이름을 바꿀 때 index.html을 따로 고치는 걸 잊어도 어긋나지 않는다.
document.title = APP_NAME;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
