# 번역 검수 요청 — 레거시 이후 추가·변경 문구

> 상태: 초안 · 생성: `node scripts/i18n-review-table.mjs` (손으로 고치지 말 것)
> 미검수 37 / 전체 37 · 원문은 ko, en은 개발자 작성, **zh·ja·vi는 기계 수준 초안** · 레거시에서 옮긴 문구는 [i18n-review-legacy](i18n-review-legacy.md)

## 검수 방법
- 각 언어 칸의 뜻이 ko 원문과 같은지, 앱 버튼·안내문으로 자연스러운지 **원어민**이 확인한다(공개 전 전부 대상).
- `{{이름}}`은 숫자·시각이 들어가는 자리표시자다. **지우거나 이름을 바꾸면 안 된다.**
- 고칠 문구는 `src/i18n/locales/<언어>.json`을 고친 뒤 검수 완료를 기록하고 이 표를 다시 만든다. 검수 완료는 `src/i18n/added-keys.json`의 `reviewed`를 `true`로.

| 키 | 종류 | 쓰이는 곳 | ko(원문) | en | zh | ja | vi | 상태 |
|---|---|---|---|---|---|---|---|---|
| `common.back` | 추가 | 3단계 공통 UI(뒤로 버튼 aria-label) | 뒤로 | Back | 返回 | 戻る | Quay lại | **미검수** |
| `course.autoBuild.empty` | 추가 | 코스 지도 — 자동 추천 결과가 0곳일 때 안내 | 남은 시간 안에 들어가는 장소가 없어요. 카테고리를 바꾸거나 공항에서 가까운 숙소를 골라 보세요. | No spot fits in the time left. Try other categories or a stay closer to the airport. | 没有能放进剩余时间的地点。请更换类别或选择离机场更近的住宿。 | 残り時間に収まるスポットがありません。カテゴリを変えるか、空港に近い宿泊先を選んでみてください。 | Không có địa điểm nào vừa với thời gian còn lại. Hãy đổi danh mục hoặc chọn chỗ nghỉ gần sân bay hơn. | **미검수** |
| `course.autoBuild.note` | 레거시 변경 | A7 — 레거시 "OR-Tools 최적화…"를 실제 동작(카테고리별 탐욕 추천)에 맞게 변경 | 시간에 맞춰 자동 추천 · 카테고리마다 남은 시간에 들어가는 장소를 1곳씩 담아요 | Auto-picks to fit your time · adds one spot per category that fits the time left | 按时间自动推荐 · 每个类别添加一处能放进剩余时间的地点 | 時間に合わせて自動おすすめ・カテゴリごとに残り時間に収まるスポットを1件ずつ追加 | Tự động gợi ý theo thời gian · mỗi danh mục thêm 1 địa điểm vừa với thời gian còn lại | **미검수** |
| `course.header.terminal` | 추가 | 코스 지도 — 헤더 도착 터미널 | 인천 {{terminal}} | Incheon {{terminal}} | 仁川 {{terminal}} | 仁川 {{terminal}} | Incheon {{terminal}} | **미검수** |
| `course.header.title` | 추가 | 코스 지도 — 헤더 제목 | 내 코스 | My course | 我的路线 | マイコース | Lộ trình của tôi | **미검수** |
| `course.leg.approxMinutes` | 추가 | 코스 지도 — 구간 칩 시간(근사값) | 약 {{n}}분 | ~{{n}} min | 约{{n}}分钟 | 約{{n}}分 | khoảng {{n}} phút | **미검수** |
| `course.leg.km` | 추가 | 코스 지도 — 구간 칩 거리(실제 값일 때만) | {{km}}km | {{km}} km | {{km}}公里 | {{km}}km | {{km}} km | **미검수** |
| `course.leg.minutes` | 추가 | 코스 지도 — 구간 칩 시간(실제 경로) | {{n}}분 | {{n}} min | {{n}}分钟 | {{n}}分 | {{n}} phút | **미검수** |
| `course.leg.mode.taxi` | 추가 | 코스 지도 — 이동수단 이름 | 택시 | Taxi | 出租车 | タクシー | Taxi | **미검수** |
| `course.leg.mode.transit` | 추가 | 코스 지도 — 이동수단 이름(칩·목록 접근성) | 대중교통 | Transit | 公共交通 | 公共交通 | Phương tiện công cộng | **미검수** |
| `course.leg.mode.walk` | 추가 | 코스 지도 — 이동수단 이름 | 도보 | Walk | 步行 | 徒歩 | Đi bộ | **미검수** |
| `course.leg.return` | 추가 | 코스 지도 — 공항 복귀 구간 칩 | 복귀 | Return | 返回 | 復帰 | Quay về | **미검수** |
| `course.leg.transfers` | 추가 | 코스 지도 — 선택한 구간 정보 | 환승 {{n}}회 | {{n}} transfer(s) | 换乘{{n}}次 | 乗り換え{{n}}回 | Chuyển {{n}} lần | **미검수** |
| `course.map.legend` | 추가 | 코스 지도 — 선 범례(레거시 routeLegend 대체) | 선 모양 = 이동수단: 굵은 실선 대중교통 · 보통 실선 택시 · 점선 도보 · 빨간 긴 파선 공항 복귀. "약" = 실제 경로를 못 받아 어림한 값 | Line style = mode: thick solid transit · solid taxi · dotted walk · red long dash return to airport. "~" = estimated (no live route) | 线型 = 交通方式：粗实线 公共交通 · 实线 出租车 · 点线 步行 · 红色长虚线 返回机场。"约" = 未取得实际路线的估算值 | 線の形 = 移動手段：太い実線 公共交通・実線 タクシー・点線 徒歩・赤い長い破線 空港への復帰。「約」= 実際の経路を取得できず概算した値 | Kiểu đường = phương tiện: nét liền đậm phương tiện công cộng · nét liền taxi · chấm đi bộ · gạch dài đỏ quay về sân bay. "khoảng" = ước tính (không có tuyến thực tế) | **미검수** |
| `course.route.estimateNote` | 추가 | 코스 빌더 — 보수적 근사 안내(실제 경로는 저장 후) | 만드는 동안은 넉넉하게 어림한 이동시간(약 N분)으로 계산해요. 저장하면 실제 경로로 다시 확인해요. | While building, travel times are generous estimates (~N min). Save the course to check real routes. | 制作过程中按宽松估算的移动时间（约N分钟）计算。保存后将按实际路线重新确认。 | 作成中は余裕を持って見積もった移動時間（約N分）で計算します。保存すると実際の経路で確認します。 | Khi đang tạo, thời gian di chuyển được ước tính rộng (khoảng N phút). Lưu lộ trình để kiểm tra tuyến thực tế. | **미검수** |
| `course.step.return.target` | 추가 | 코스 지도 — 일정의 공항 복귀 줄(레거시 "알림 · 여유 30분" 대체) | 복귀 도착 목표 {{time}} | Target arrival {{time}} | 目标到达 {{time}} | 到着目標 {{time}} | Mục tiêu đến {{time}} | **미검수** |
| `course.summary.available` | 추가 | 코스 지도 — 요약 "/ 가용 Y" | / 가용 {{time}} | / available {{time}} | / 可用 {{time}} | / 利用可能 {{time}} | / khả dụng {{time}} | **미검수** |
| `course.summary.expectedReturn` | 추가 | 코스 지도 — 초과 시 복귀 도착 예상 | 복귀 도착 예상 | Expected airport arrival | 预计返回机场 | 空港到着の予想 | Dự kiến về sân bay | **미검수** |
| `course.summary.lastDeparture` | 추가 | 코스 지도 — 마지막 장소 출발 기한 | 마지막 장소에서 출발 | Leave your last stop by | 从最后一个地点出发 | 最後のスポットを出発 | Rời điểm cuối trước | **미검수** |
| `course.summary.lastDepartureHotel` | 추가 | 코스 지도 — 장소가 없을 때 숙소 출발 기한 | 숙소에서 출발 | Leave your stay by | 从住宿出发 | 宿泊先を出発 | Rời chỗ nghỉ trước | **미검수** |
| `course.summary.lateThan` | 추가 | 코스 지도 — 목표보다 늦음 명시 | {{time}} (목표 {{target}}보다 늦음) | {{time}} (later than target {{target}}) | {{time}}（晚于目标 {{target}}） | {{time}}（目標 {{target}} より遅い） | {{time}} (muộn hơn mục tiêu {{target}}) | **미검수** |
| `course.summary.noRoom` | 추가 | 코스 지도 — 숙소 미선택 요약 | 숙소를 고르면 이동 시간이 계산돼요 | Pick a stay to calculate travel time | 选择住宿后将计算移动时间 | 宿泊先を選ぶと移動時間が計算されます | Chọn chỗ nghỉ để tính thời gian di chuyển | **미검수** |
| `course.summary.overWarning` | 추가 | 코스 지도 — 초과 경고 | 이대로면 비행기 시간에 맞추지 못할 수 있어요. 장소를 빼거나 체류 시간을 줄여 주세요. | You may miss your flight with this plan. Remove a spot or shorten your stays. | 按此计划可能赶不上航班。请删除地点或缩短停留时间。 | このままでは飛行機に間に合わない可能性があります。スポットを減らすか滞在時間を短くしてください。 | Với lịch này bạn có thể lỡ chuyến bay. Hãy bớt điểm đến hoặc rút ngắn thời gian lưu trú. | **미검수** |
| `course.summary.returnTarget` | 추가 | 코스 지도 — 복귀 도착 목표 시각 | 복귀 도착 목표 | Target airport arrival | 返回机场目标时间 | 空港到着の目標 | Mục tiêu về sân bay | **미검수** |
| `course.summary.segment.over` | 추가 | 코스 지도 — 시간 막대 구간 이름 | 초과 {{n}}분 | Over {{n}} min | 超出 {{n}}分钟 | 超過 {{n}}分 | Vượt {{n}} phút | **미검수** |
| `course.summary.segment.prep` | 추가 | 코스 지도 — 시간 막대 구간 이름 | 준비 {{n}}분 | Prep {{n}} min | 准备 {{n}}分钟 | 準備 {{n}}分 | Chuẩn bị {{n}} phút | **미검수** |
| `course.summary.segment.spare` | 추가 | 코스 지도 — 시간 막대 구간 이름 | 여유 {{n}}분 | Spare {{n}} min | 剩余 {{n}}分钟 | 余裕 {{n}}分 | Còn dư {{n}} phút | **미검수** |
| `course.summary.segment.stay` | 추가 | 코스 지도 — 시간 막대 구간 이름 | 체류 {{n}}분 | Stay {{n}} min | 停留 {{n}}分钟 | 滞在 {{n}}分 | Lưu trú {{n}} phút | **미검수** |
| `course.summary.segment.travel` | 추가 | 코스 지도 — 시간 막대 구간 이름 | 이동 {{n}}분 | Travel {{n}} min | 移动 {{n}}分钟 | 移動 {{n}}分 | Di chuyển {{n}} phút | **미검수** |
| `course.summary.until` | 추가 | 코스 지도 — "HH:MM까지" | {{time}}까지 | {{time}} | {{time}}之前 | {{time}}まで | {{time}} | **미검수** |
| `course.summary.used` | 추가 | 코스 지도 — 요약 "사용 X" | 사용 {{time}} | Used {{time}} | 已用 {{time}} | 使用 {{time}} | Đã dùng {{time}} | **미검수** |
| `onboarding.flights.cannotGoOutHint` | 추가 | 4단계 Time-Safe — 외출 불가 시 CTA 비활성 이유 | 외출 가능 시간이 없어 코스를 추천할 수 없어요. 공항 안에서 대기해주세요. | There is no time to leave the airport, so we can't suggest a course. Please wait inside the airport. | 没有可外出的时间，无法推荐路线。请在机场内等候。 | 外出できる時間がないため、コースをおすすめできません。空港内でお待ちください。 | Không có thời gian để ra ngoài sân bay nên chúng tôi không thể gợi ý lộ trình. Vui lòng chờ trong sân bay. | **미검수** |
| `timeSafe.bufferBreakdown` | 추가 | 4단계 Time-Safe — 버퍼 구성 줄(예상치 표기) | 예상 소요 반영: 입국심사 약 {{immigration}}분 · 보안검색·출국심사 약 {{security}}분 · 게이트 여유 약 {{gate}}분 | Estimated times applied: immigration ~{{immigration}} min · security & exit check ~{{security}} min · gate margin ~{{gate}} min | 已计入预估时间：入境审查约{{immigration}}分钟 · 安检·出境审查约{{security}}分钟 · 登机口预留约{{gate}}分钟 | 予想所要時間を反映：入国審査 約{{immigration}}分・保安検査・出国審査 約{{security}}分・ゲート余裕 約{{gate}}分 | Đã tính thời gian ước tính: nhập cảnh khoảng {{immigration}} phút · an ninh & xuất cảnh khoảng {{security}} phút · dự phòng cửa ra máy bay khoảng {{gate}} phút | **미검수** |
| `timeSafe.security.live` | 추가 | 4단계 T2 연동 — 홈 버퍼 줄의 출국장 실시간 배지(터미널·현재 대기) | 출국장 실시간 확인({{terminal}}) · 현재 대기 약 {{n}}분 | Live security wait checked ({{terminal}}) · now ~{{n}} min | 已查看出境大厅实时等待（{{terminal}}）· 当前约{{n}}分钟 | 出国場リアルタイム確認（{{terminal}}）・現在 約{{n}}分 | Đã kiểm tra thời gian chờ an ninh trực tiếp ({{terminal}}) · hiện khoảng {{n}} phút | **미검수** |
| `timeSafe.security.notLive` | 추가 | 4단계 T2 연동 — 실시간 대기를 못 받은 경우(탑승동·조회 실패) | 출국장 실시간 아님 · 예상치 사용 | No live security data · using estimate | 无出境大厅实时数据 · 使用预估值 | 出国場のリアルタイム情報なし・予想値を使用 | Không có dữ liệu an ninh trực tiếp · dùng ước tính | **미검수** |
| `timeSafe.warning.departBeforeArrival` | 추가 | 4단계 Time-Safe — 출발이 도착보다 빠름 경고 | 연결편 출발이 도착보다 빨라요. 항공편을 확인해주세요. | Your connecting flight departs before you arrive. Please check your flights. | 连接航班的出发时间早于到达时间。请确认航班。 | 乗継便の出発が到着より早くなっています。フライトをご確認ください。 | Chuyến bay nối chuyến khởi hành trước khi bạn đến. Vui lòng kiểm tra chuyến bay. | **미검수** |
| `timeSafe.warning.over24h` | 추가 | 4단계 Time-Safe — 24시간 초과 경고 | 도착부터 출발까지 24시간이 넘어요. 항공편 날짜를 확인해주세요. | More than 24 hours between arrival and departure. Please check your flight dates. | 从到达到出发超过24小时。请确认航班日期。 | 到着から出発まで24時間を超えています。フライトの日付をご確認ください。 | Từ lúc đến đến lúc khởi hành hơn 24 giờ. Vui lòng kiểm tra ngày bay. | **미검수** |

## 삭제한 레거시 키 (검수 대상 아님)
| 키 | 사유 |
|---|---|
| `confirm.alertOn` | 알림 기능 없음 — 예약 확인의 "알림 ON" 삭제 |
| `course.step.return.sub` | 알림 기능 없음 — "Time-Safe 알림 · 여유 30분" 삭제, 일정 복귀 줄은 course.step.return.target |
| `my.menu.timeSafeAlerts` | 알림 기능 없음 — 마이의 "Time-Safe 알림" 토글 삭제 |
| `timeSafe.pushScheduled` | 알림 기능 없음 — "복귀 30분 전 푸시 알림 예약됨" 삭제(2026-10-16 사용자 지시) |
