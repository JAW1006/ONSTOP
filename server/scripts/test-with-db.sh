#!/usr/bin/env bash
# 일회용 Postgres를 띄우고 통합 테스트를 돌린 뒤 반드시 내린다.
# 명세: docs/api/booking-requests.md · 확인 항목: docs/STATUS.md
set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE_FILE=docker-compose.test.yml
# 테스트 DB 주소는 여기서만 정한다 — server/.env의 DATABASE_URL은 쓰지 않는다.
export TEST_DATABASE_URL="postgresql://timestay:timestay-test-only@127.0.0.1:5433/timestay_test"
# .env의 DATABASE_URL이 테스트로 새지 않게 비운다(booking.js는 process.env를 읽는다).
export DATABASE_URL=""

if ! docker info >/dev/null 2>&1; then
  # 설치는 됐는데 엔진만 꺼진 경우가 흔하다 — 두 상황을 구분해서 안내한다.
  if [ -d /Applications/Docker.app ] || command -v docker >/dev/null 2>&1; then
    cat >&2 <<'MSG'
✗ Docker는 설치돼 있지만 엔진이 꺼져 있다.

     open -a Docker          # macOS — 엔진이 뜰 때까지 10~30초
     cd server && npm test

  엔진을 켜지 않고 돌리려면 아래 "CI에서만 돌리기"를 보라.
MSG
  else
    cat >&2 <<'MSG'
✗ Docker가 설치되지 않았다.

     brew install --cask docker     # 또는 https://docker.com/products/docker-desktop
     open -a Docker                 # 처음 한 번 실행해 엔진을 켠다
     cd server && npm test
MSG
  fi
  cat >&2 <<'MSG'

  CI에서만 돌리기
     GitHub Actions가 Postgres 서비스 컨테이너로 자동 실행한다(.github/workflows/ci.yml).
     로컬에서는 DB가 필요 없는 경로만 돌린다(통합 테스트는 건너뛴다):
       cd server && npm run test:nodb

  이미 다른 Postgres가 있다면 직접 지정해도 된다 — 테이블을 TRUNCATE하니 일회용 DB만:
       TEST_DATABASE_URL=postgresql://user:pw@127.0.0.1:5432/throwaway \
         node --test booking.test.js
MSG
  exit 1
fi

cleanup() {
  docker compose -f "$COMPOSE_FILE" down -v --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "→ 일회용 Postgres 시작"
docker compose -f "$COMPOSE_FILE" up -d --wait

echo "→ 통합 테스트 실행"
node --test booking.test.js
