# 번역 검수 요청 — 레거시 이후 추가 문구

> 상태: 초안 · 생성: `node scripts/i18n-review-table.mjs` (손으로 고치지 말 것)
> 미검수 5 / 전체 5 · 원문은 ko, en은 개발자 작성, **zh·ja·vi는 기계 수준 초안**

## 검수 방법
- 각 언어 칸의 뜻이 ko 원문과 같은지, 앱 버튼·안내문으로 자연스러운지 확인한다.
- `{{이름}}`은 숫자·시각이 들어가는 자리표시자다. **지우거나 이름을 바꾸면 안 된다.**
- 고칠 문구는 이 표에 메모하거나 `src/i18n/locales/<언어>.json`을 직접 고친 뒤, `src/i18n/added-keys.json`의 `reviewed`를 `true`로 바꾸고 이 표를 다시 만든다.

| 키 | 쓰이는 곳 | ko(원문) | en | zh | ja | vi | 상태 |
|---|---|---|---|---|---|---|---|
| `common.back` | 3단계 공통 UI(뒤로 버튼 aria-label) | 뒤로 | Back | 返回 | 戻る | Quay lại | **미검수** |
| `onboarding.flights.cannotGoOutHint` | 4단계 Time-Safe — 외출 불가 시 CTA 비활성 이유 | 외출 가능 시간이 없어 코스를 추천할 수 없어요. 공항 안에서 대기해주세요. | There is no time to leave the airport, so we can't suggest a course. Please wait inside the airport. | 没有可外出的时间，无法推荐路线。请在机场内等候。 | 外出できる時間がないため、コースをおすすめできません。空港内でお待ちください。 | Không có thời gian để ra ngoài sân bay nên chúng tôi không thể gợi ý lộ trình. Vui lòng chờ trong sân bay. | **미검수** |
| `timeSafe.bufferBreakdown` | 4단계 Time-Safe — 버퍼 구성 줄(예상치 표기) | 예상 소요 반영: 입국심사 약 {{immigration}}분 · 보안검색·출국심사 약 {{security}}분 · 게이트 여유 약 {{gate}}분 | Estimated times applied: immigration ~{{immigration}} min · security & exit check ~{{security}} min · gate margin ~{{gate}} min | 已计入预估时间：入境审查约{{immigration}}分钟 · 安检·出境审查约{{security}}分钟 · 登机口预留约{{gate}}分钟 | 予想所要時間を反映：入国審査 約{{immigration}}分・保安検査・出国審査 約{{security}}分・ゲート余裕 約{{gate}}分 | Đã tính thời gian ước tính: nhập cảnh khoảng {{immigration}} phút · an ninh & xuất cảnh khoảng {{security}} phút · dự phòng cửa ra máy bay khoảng {{gate}} phút | **미검수** |
| `timeSafe.warning.departBeforeArrival` | 4단계 Time-Safe — 출발이 도착보다 빠름 경고 | 연결편 출발이 도착보다 빨라요. 항공편을 확인해주세요. | Your connecting flight departs before you arrive. Please check your flights. | 连接航班的出发时间早于到达时间。请确认航班。 | 乗継便の出発が到着より早くなっています。フライトをご確認ください。 | Chuyến bay nối chuyến khởi hành trước khi bạn đến. Vui lòng kiểm tra chuyến bay. | **미검수** |
| `timeSafe.warning.over24h` | 4단계 Time-Safe — 24시간 초과 경고 | 도착부터 출발까지 24시간이 넘어요. 항공편 날짜를 확인해주세요. | More than 24 hours between arrival and departure. Please check your flight dates. | 从到达到出发超过24小时。请确认航班日期。 | 到着から出発まで24時間を超えています。フライトの日付をご確認ください。 | Từ lúc đến đến lúc khởi hành hơn 24 giờ. Vui lòng kiểm tra ngày bay. | **미검수** |
