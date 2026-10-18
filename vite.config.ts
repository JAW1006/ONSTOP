import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    // 카카오맵 JS SDK는 Kakao Developers에 등록한 도메인에서만 뜬다 — http://localhost:5173 등록됨.
    // 포트가 바뀌면 지도가 조용히 실패하므로 다른 포트로 넘어가지 않게 고정한다.
    port: 5173,
    strictPort: true,
    // 기존 Express 프록시(server/, :3001)를 그대로 재사용한다 — 인천공항·카카오·ODsay 키는 서버에만 둔다.
    proxy: { "/api": "http://localhost:3001" },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
