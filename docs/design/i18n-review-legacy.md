# 번역 검수 요청 — 레거시에서 옮긴 문구

> 상태: 초안 · 생성: `node scripts/i18n-review-table.mjs` (손으로 고치지 말 것)
> 미검수 185 / 전체 185 · 레거시(`app/index.html` STR·CAT_LABELS)의 번역을 그대로 옮긴 것 — 출처·검수 이력 없음
> 레거시 이후 바꾼 키(변경 1·삭제 4)는 [i18n-review](i18n-review.md)에 있다.

## 검수 방법
- 각 언어 칸의 뜻이 ko 원문과 같은지, 앱 버튼·안내문으로 자연스러운지 **원어민**이 확인한다(공개 전 전부 대상).
- `{{이름}}`은 숫자·시각이 들어가는 자리표시자다. **지우거나 이름을 바꾸면 안 된다.**
- 고칠 문구는 `src/i18n/locales/<언어>.json`을 고친 뒤 검수 완료를 기록하고 이 표를 다시 만든다. 검수 완료는 `src/i18n/legacy-review.json`의 `reviewed` 배열에 키를 추가.

| 키 | ko(원문) | en | zh | ja | vi | 상태 |
|---|---|---|---|---|---|---|
| `common.next` | 다음 | Next | 下一步 | 次へ | Tiếp theo | **미검수** |
| `common.more` | 더보기 | More | 更多 | もっと見る | Xem thêm | **미검수** |
| `common.showMoreCount` | 더보기 ({{n}}곳 더 있음) | Show more ({{n}} more spots) | 显示更多(还有{{n}}个) | もっと見る(あと{{n}}件) | Xem thêm ({{n}} địa điểm nữa) | **미검수** |
| `common.remove` | 삭제 | Remove | 删除 | 削除 | Xóa | **미검수** |
| `common.dismiss` | 닫기 | Dismiss | 关闭 | 閉じる | Đóng | **미검수** |
| `common.comingSoon` | 준비중 | Coming soon | 即将推出 | 準備中 | Sắp ra mắt | **미검수** |
| `common.backToHome` | 홈으로 | Back to home | 返回首页 | ホームへ | Về trang chủ | **미검수** |
| `common.badge.live` | 실시간 | Live | 实时 | リアルタイム | Trực tiếp | **미검수** |
| `common.badge.demo` | 데모값 | Demo | 示例 | デモ | Demo | **미검수** |
| `common.badge.partnerAd` | 제휴 AD | Partner AD | 合作 广告 | 提携 広告 | Đối tác QC | **미검수** |
| `common.badge.topPick` | 추천 | Top pick | 推荐 | おすすめ | Đề xuất | **미검수** |
| `unit.minutes` | {{n}}분 | {{n}} min | {{n}}分钟 | {{n}}分 | {{n}} phút | **미검수** |
| `unit.hours` | {{h}}시간 | {{h}}h | {{h}}小时 | {{h}}時間 | {{h}} giờ | **미검수** |
| `unit.hoursMinutes` | {{h}}시간 {{m}}분 | {{h}}h {{m}}m | {{h}}小时{{m}}分钟 | {{h}}時間{{m}}分 | {{h}} giờ {{m}} phút | **미검수** |
| `unit.nextDay` | 익일 | Next day | 次日 | 翌日 | Hôm sau | **미검수** |
| `unit.hourRange` | {{a}}–{{b}}시간 | {{a}}–{{b}} hrs | {{a}}–{{b}}小时 | {{a}}–{{b}}時間 | {{a}}–{{b}} giờ | **미검수** |
| `unit.minFromAirport` | 공항 {{n}}분 | {{n}} min from airport | 距机场{{n}}分钟 | 空港から{{n}}分 | Cách sân bay {{n}} phút | **미검수** |
| `unit.transferMin` | 이동 {{n}}분 | {{n}} min transfer | 移动{{n}}分钟 | 移動{{n}}分 | Di chuyển {{n}} phút | **미검수** |
| `unit.stayMin` | 체류 {{n}}분 | {{n}} min stay | 停留{{n}}分钟 | 滞在{{n}}分 | Lưu trú {{n}} phút | **미검수** |
| `brand.tagline.line1` | 짐은 맡기고, | Drop your bags, | 放下行李, | 荷物は預けて、 | Gửi hành lý lại, | **미검수** |
| `brand.tagline.line2` | 환승 시간을 인천에서 | and spend your layover in Incheon | 在仁川度过转机时光 | 乗継時間はインチョンで | và tận hưởng thời gian quá cảnh tại Incheon | **미검수** |
| `nav.home` | 홈 | Home | 首页 | ホーム | Trang chủ | **미검수** |
| `nav.luggage` | 짐 케어 | Luggage | 行李 | 荷物ケア | Hành lý | **미검수** |
| `nav.course` | 코스 | Course | 路线 | コース | Lộ trình | **미검수** |
| `nav.booking` | 예약 | Bookings | 预订 | 予約 | Đặt chỗ | **미검수** |
| `nav.my` | 마이 | My | 我的 | マイ | Của tôi | **미검수** |
| `onboarding.language.title` | 언어를 선택해주세요 | Choose your language | 请选择语言 | 言語を選択してください | Chọn ngôn ngữ của bạn | **미검수** |
| `onboarding.interests.title` | 관심 있는 활동을 골라주세요 | Pick your interests | 请选择您感兴趣的活动 | 興味のあるアクティビティを選んでください | Chọn hoạt động bạn quan tâm | **미검수** |
| `onboarding.interests.note` | 복수 선택 · Time-Fit 추천에 사용 | Select multiple · used for Time-Fit recommendations | 可多选 · 用于Time-Fit推荐 | 複数選択可・Time-Fitのおすすめに使用 | Chọn nhiều · dùng để gợi ý Time-Fit | **미검수** |
| `onboarding.flights.title` | 환승 항공편을 입력해주세요 | Enter your transit flights | 请输入您的转机航班 | 乗継便を入力してください | Nhập chuyến bay quá cảnh của bạn | **미검수** |
| `onboarding.flights.note` | Time-Safe 여유 시간 자동 계산 | Time-Safe auto-calculates your free time | Time-Safe 自动计算空闲时间 | Time-Safeが自由時間を自動計算 | Time-Safe tự động tính thời gian rảnh | **미검수** |
| `onboarding.flights.arrivalLabel` | 지금 타고 온 도착편 | The flight you just arrived on | 您刚搭乘抵达的航班 | 今乗ってきた到着便 | Chuyến bay bạn vừa đến | **미검수** |
| `onboarding.flights.arrivalPlaceholder` | 예: KE085 | e.g. KE085 | 例如: KE085 | 例: KE085 | VD: KE085 | **미검수** |
| `onboarding.flights.connectionLabel` | 다음 연결편 | Your next connecting flight | 下一段连接航班 | 次の乗継便 | Chuyến bay nối chuyến tiếp theo | **미검수** |
| `onboarding.flights.connectionPlaceholder` | 예: MU2043 | e.g. MU2043 | 例如: MU2043 | 例: MU2043 | VD: MU2043 | **미검수** |
| `onboarding.flights.lookup` | 실시간 조회 | Live lookup | 实时查询 | リアルタイム照会 | Tra cứu trực tiếp | **미검수** |
| `onboarding.flights.lookingUp` | 조회 중… | Looking up… | 查询中… | 照会中… | Đang tra cứu… | **미검수** |
| `onboarding.flights.retryHint` | 편명을 다시 확인하고 조회해주세요. | Please check the flight number and look up again. | 请核对航班号后重新查询。 | 便名をご確認の上、再度照会してください。 | Vui lòng kiểm tra lại số hiệu chuyến bay và tra cứu lại. | **미검수** |
| `onboarding.flights.needBothHint` | 도착편과 연결편을 모두 실시간 조회해야 다음으로 진행할 수 있어요. | Look up both your arrival and connecting flight to continue. | 需要实时查询到达航班和连接航班才能继续。 | 到着便と乗継便を両方リアルタイム照会すると次に進めます。 | Hãy tra cứu trực tiếp cả chuyến bay đến và chuyến bay nối chuyến để tiếp tục. | **미검수** |
| `onboarding.flights.cta` | 스마트 코스 추천 | Get smart course picks | 智能推荐路线 | スマートコースをおすすめ | Gợi ý lộ trình thông minh | **미검수** |
| `flight.error.notFound` | 일치하는 항공편이 없어요 | No matching flight found | 未找到匹配的航班 | 一致する便が見つかりません | Không tìm thấy chuyến bay phù hợp | **미검수** |
| `flight.error.noArrivalTime` | 도착 시각 정보가 없어요 | No arrival time available | 暂无到达时间信息 | 到着時刻の情報がありません | Không có thông tin giờ đến | **미검수** |
| `flight.error.noDepartureTime` | 출발 시각 정보가 없어요 | No departure time available | 暂无出发时间信息 | 出発時刻の情報がありません | Không có thông tin giờ khởi hành | **미검수** |
| `flight.from` | 출발지 | From | 出发地 | 出発地 | Từ | **미검수** |
| `flight.to` | 도착지 | To | 目的地 | 行き先 | Đến | **미검수** |
| `flight.terminal` | 터미널 | Terminal | 航站楼 | ターミナル | Nhà ga | **미검수** |
| `flight.gate` | 게이트 | Gate | 登机口 | ゲート | Cửa | **미검수** |
| `flight.departs` | 출발 | Departs | 起飞 | 出発 | Khởi hành | **미검수** |
| `flight.status` | 상태 | Status | 状态 | 状況 | Trạng thái | **미검수** |
| `flight.onTime` | 정상 | On time | 正常 | 定刻 | Đúng giờ | **미검수** |
| `flight.arrivalLine` | {{airline}} {{flightId}} · 도착 예상 {{time}} | {{airline}} {{flightId}} · Est. arrival {{time}} | {{airline}} {{flightId}} · 预计到达 {{time}} | {{airline}} {{flightId}}・到着予想 {{time}} | {{airline}} {{flightId}} · Dự kiến đến {{time}} | **미검수** |
| `flight.departureLine` | {{airline}} {{flightId}} · 출발 예정 {{time}} | {{airline}} {{flightId}} · Scheduled departure {{time}} | {{airline}} {{flightId}} · 预定出发 {{time}} | {{airline}} {{flightId}}・出発予定 {{time}} | {{airline}} {{flightId}} · Giờ khởi hành dự kiến {{time}} | **미검수** |
| `flight.delayed` | {{n}}분 지연 | {{n}} min delayed | 延误{{n}}分钟 | {{n}}分遅延 | Trễ {{n}} phút | **미검수** |
| `flight.notice.arrivalChanged` | 도착편 시각이 바뀌었어요 · 도착 {{old}} → {{new}} | Arrival time changed · {{old}} → {{new}} | 到达时间有变动 · {{old}} → {{new}} | 到着時刻が変更されました・{{old}} → {{new}} | Giờ đến đã thay đổi · {{old}} → {{new}} | **미검수** |
| `flight.notice.returnByChanged` | 연결편 시각이 바뀌었어요 · 복귀 추천 {{old}} → {{new}} | Connecting flight time changed · return by {{old}} → {{new}} | 连接航班时间有变动 · 建议返回 {{old}} → {{new}} | 乗継便の時刻が変更されました・復帰推奨 {{old}} → {{new}} | Giờ bay nối chuyến đã thay đổi · nên quay lại {{old}} → {{new}} | **미검수** |
| `flight.refresh` | 항공편 다시 조회 | Refresh flight status | 重新查询航班 | フライトを再照会 | Làm mới thông tin chuyến bay | **미검수** |
| `flight.change` | 다른 항공편 입력 | Enter a different flight | 输入其他航班 | 他のフライトを入力 | Nhập chuyến bay khác | **미검수** |
| `timeSafe.heading` | TIME-SAFE 계산 결과 | TIME-SAFE RESULT | TIME-SAFE 计算结果 | TIME-SAFE 計算結果 | KẾT QUẢ TIME-SAFE | **미검수** |
| `timeSafe.liveDepartureApplied` | 출발편 실시간 반영 | Live departure applied | 已应用实时出发数据 | 出発便のリアルタイム反映 | Đã áp dụng giờ khởi hành trực tiếp | **미검수** |
| `timeSafe.needArrival` | 도착편을 조회하면 환승 시간이 여기에 표시돼요. | Look up your arrival flight to see your layover time here. | 查询到达航班后,中转时间会显示在这里。 | 到着便を照会すると、ここに乗継時間が表示されます。 | Tra cứu chuyến bay đến để xem thời gian quá cảnh tại đây. | **미검수** |
| `timeSafe.needConnection` | 연결편을 조회하면 환승 시간이 계산돼요. | Look up your connecting flight to calculate your layover time. | 查询连接航班后即可计算中转时间。 | 乗継便を照会すると乗継時間が計算されます。 | Tra cứu chuyến bay nối chuyến để tính thời gian quá cảnh. | **미검수** |
| `timeSafe.cannotGoOut.title` | 외출 불가 | You can't leave the airport | 无法外出 | 外出不可 | Không thể ra ngoài | **미검수** |
| `timeSafe.cannotGoOut.description` | 연결편까지 수속·게이트 마감 시간을 빼면 밖에 나갔다 올 여유가 없어요. 공항 안에서 대기해주세요. | After security and gate cutoff time, there's no time left to leave and come back. Please stay inside the airport. | 扣除安检和登机截止时间后,已没有足够时间外出往返。请在机场内等候。 | 保安検査と搭乗締切の時間を引くと、外出して戻ってくる余裕がありません。空港内でお待ちください。 | Sau khi trừ thời gian an ninh và đóng cửa lên máy bay, bạn không còn đủ thời gian ra ngoài rồi quay lại. Vui lòng chờ trong sân bay. | **미검수** |
| `timeSafe.outingAvailable` | 공항 밖 체류 가능 | free outside the airport | 可在机场外停留 | 空港外で滞在可能 | có thể ở ngoài sân bay | **미검수** |
| `timeSafe.outingAvailableShort` | 실제 체류 가능(버퍼 제외) | Actual free time (buffer excluded) | 实际可停留(已扣除缓冲) | 実際に滞在可能(バッファ除く) | Thời gian rảnh thực tế (đã trừ đệm) | **미검수** |
| `timeSafe.arrive` | 도착 | Arrive | 到达 | 到着 | Đến | **미검수** |
| `timeSafe.returnBy` | 복귀 추천 | Return by | 建议返回 | 復帰推奨 | Nên quay lại | **미검수** |
| `timeSafe.returnRecommended` | 공항 복귀 추천 | Recommended return | 建议返回机场 | 空港復帰推奨 | Đề xuất quay lại sân bay | **미검수** |
| `timeSafe.totalConnection` | 도착~출발 총 환승 시간 {{dur}} | Total connection time {{dur}} (arrival to departure) | 从到达到出发的总中转时间 {{dur}} | 到着〜出発の総乗継時間 {{dur}} | Tổng thời gian quá cảnh {{dur}} (từ lúc đến đến lúc khởi hành) | **미검수** |
| `timeSafe.bufferNote` | 수속 {{sec}}분 + 게이트마감 {{gate}}분 = 총 {{total}}분 버퍼 반영(숙소→공항 이동시간은 일단 제외) | {{sec}}min security + {{gate}}min gate cutoff = {{total}}min buffer applied (stay→airport travel time excluded for now) | 安检{{sec}}分钟 + 登机截止{{gate}}分钟 = 共{{total}}分钟缓冲(暂不含住宿→机场移动时间) | 保安検査{{sec}}分+搭乗締切{{gate}}分=合計{{total}}分のバッファを反映(宿泊先→空港の移動時間は今は含みません) | An ninh {{sec}} phút + đóng cửa lên máy bay {{gate}} phút = tổng đệm {{total}} phút (chưa gồm thời gian di chuyển từ chỗ nghỉ ra sân bay) | **미검수** |
| `timeSafe.liveSecurityWait` | 출국장 실시간 대기시간 반영(T1) | Live security wait time (T1) | 已反映出境大厅实时等待时间(T1) | 出国場のリアルタイム待ち時間を反映(T1) | Áp dụng thời gian chờ an ninh thực tế (T1) | **미검수** |
| `home.greeting` | 안녕하세요, 여행자님! 👋 | Hello, Traveler! 👋 | 你好,旅行者!👋 | こんにちは、トラベラーさん!👋 | Xin chào, Nhà du hành! 👋 | **미검수** |
| `home.subtitle` | 여유 시간에 딱 맞는 인천 코스를 준비했어요. | We've prepped an Incheon course to fit your free time. | 我们为您准备了符合空闲时间的仁川行程。 | 自由時間にぴったりの仁川コースをご用意しました。 | Chúng tôi đã chuẩn bị lộ trình Incheon vừa vặn thời gian rảnh của bạn. | **미검수** |
| `home.timeFit.title` | Time-Fit 추천 코스 | Time-Fit Recommended Course | Time-Fit 推荐路线 | Time-Fit おすすめコース | Lộ trình đề xuất Time-Fit | **미검수** |
| `home.timeFit.subtitle` | 관심사별로 골라 환승 일정 자동 생성 | Pick your interests to auto-build a transit plan | 按兴趣挑选,自动生成转机行程 | 興味に合わせて選ぶと乗継予定を自動生成 | Chọn theo sở thích để tự động tạo lịch quá cảnh | **미검수** |
| `home.timeFit.build.prefix` | 카테고리를 골라 | Pick categories to build | 选择类别,打造 | カテゴリを選んで | Chọn danh mục để tạo | **미검수** |
| `home.timeFit.build.bold` | 나만의 환승 코스 | your own transit course | 专属转机路线 | 自分だけの乗継コース | lộ trình quá cảnh của riêng bạn | **미검수** |
| `home.timeFit.build.suffix` | 를 만들어보세요 |  |  | を作ってみましょう |  | **미검수** |
| `home.timeFit.build.cta` | 만들기 | Build | 制作 | 作成 | Tạo | **미검수** |
| `home.dayuse.title` | 데이유즈 · 타임블록 예약 | Day-Use · Time Block Booking | 钟点房 · 时段预订 | デイユース・タイムブロック予約 | Day-Use · Đặt theo khung giờ | **미검수** |
| `home.dayuse.subtitle` | 3–9시간 유연 예약 · 샤워/휴식 | Flexible 3–9 hr booking · shower/rest | 3–9小时灵活预订 · 淋浴/休息 | 3–9時間の柔軟予約・シャワー/休憩 | Đặt linh hoạt 3–9 giờ · tắm/nghỉ | **미검수** |
| `home.luggageBanner.title` | 수하물 케어 (Luggage-Free) | Luggage Care (Luggage-Free) | 行李管家 (无负重出行) | 手荷物ケア(Luggage-Free) | Chăm sóc hành lý (Luggage-Free) | **미검수** |
| `home.luggageBanner.subtitle` | 공항 보관 · 호텔/상권 배송 → 가볍게 이동 | Airport storage · hotel/area delivery → travel light | 机场寄存 · 酒店/商圈配送 → 轻装出行 | 空港保管・ホテル/商業エリア配送 → 身軽に移動 | Gửi tại sân bay · giao đến khách sạn/khu mua sắm → di chuyển nhẹ nhàng | **미검수** |
| `home.hotPlaces.title` | 핫플레이스 | Hot Places | 热门地点 | ホットプレイス | Địa điểm nổi bật | **미검수** |
| `home.hotPlaces.subtitle` | 제휴 스팟 모아보기 | Featured partner spots | 合作商家精选 | 提携スポットまとめ | Tổng hợp địa điểm đối tác | **미검수** |
| `dayuse.feature.shower` | 샤워 | Shower | 淋浴 | シャワー | Tắm | **미검수** |
| `dayuse.feature.rest` | 휴식 | Rest | 休息 | 休憩 | Nghỉ ngơi | **미검수** |
| `dayuse.feature.luggage` | 짐보관 | Storage | 寄存 | 荷物預かり | Gửi đồ | **미검수** |
| `dayuse.perBlock` | /블록 | /block | /时段 | /ブロック | /khung giờ | **미검수** |
| `dayuse.timeBlock` | 타임블록 | time block | 时段 | タイムブロック | khung giờ | **미검수** |
| `booking.title` | 데이유즈 예약 | Day-Use Booking | 钟点房预订 | デイユース予約 | Đặt chỗ Day-Use | **미검수** |
| `booking.subtitle` | Day-use booking | Book your time block | 预订您的时段 | タイムブロックを予約 | Đặt khung giờ của bạn | **미검수** |
| `booking.chooseTimeBlock` | 타임블록 선택 | Choose a time block | 选择时段 | タイムブロックを選択 | Chọn khung giờ | **미검수** |
| `booking.chooseCheckIn` | 체크인 시각 선택 | Choose check-in time | 选择入住时间 | チェックイン時刻を選択 | Chọn giờ nhận phòng | **미검수** |
| `booking.earliestCheckIn` | 숙소까지 이동시간 고려 시 {{time}} 이후부터 체크인 가능 | Earliest check-in is {{time}}, based on travel time to this stay | 考虑到前往住宿的移动时间,最早可于 {{time}} 后办理入住 | 宿泊先までの移動時間を考慮すると{{time}}以降にチェックイン可能 | Sớm nhất có thể nhận phòng từ {{time}}, tính theo thời gian di chuyển đến chỗ nghỉ | **미검수** |
| `booking.includes` | 샤워·휴식·짐보관 포함 | Includes shower, rest & luggage storage | 含淋浴·休息·行李寄存 | シャワー・休憩・荷物預かり込み | Bao gồm tắm, nghỉ ngơi & gửi hành lý | **미검수** |
| `booking.payment.title` | 결제 내역 | Payment details | 付款明细 | お支払い内容 | Chi tiết thanh toán | **미검수** |
| `booking.payment.total` | 총 결제금액 | Total payment | 支付总额 | 合計金額 | Tổng thanh toán | **미검수** |
| `booking.payment.methods` | 간편결제 · Alipay · WeChat Pay · Card | Easy pay · Alipay · WeChat Pay · Card | 简易支付 · 支付宝 · 微信支付 · 信用卡 | 簡単決済・Alipay・WeChat Pay・カード | Thanh toán nhanh · Alipay · WeChat Pay · Thẻ | **미검수** |
| `booking.payment.pay` | 결제하기 | Pay now | 立即支付 | 支払う | Thanh toán | **미검수** |
| `booking.plan.title` | 예약에 포함된 일정 | Planned itinerary | 已规划行程 | 予定に含まれるスケジュール | Lịch trình đã lên kế hoạch | **미검수** |
| `booking.plan.count` | 코스 빌더에서 담은 {{n}}개 활동 | {{n}} activities from your course builder | 路线规划中添加的{{n}}项活动 | コースビルダーで追加した{{n}}件のアクティビティ | {{n}} hoạt động từ trình tạo lộ trình | **미검수** |
| `booking.checkoutPastReturn` | 체크아웃이 복귀 추천 시각({{time}}) 이후예요. 실제로는 그 전에 나와야 해요. | Checkout falls after your recommended return time ({{time}}). You'll need to leave before then. | 退房时间晚于建议返回时间({{time}})。请提前离开。 | チェックアウトが復帰推奨時刻({{time}})より後です。実際にはその前に出る必要があります。 | Giờ trả phòng muộn hơn giờ nên quay lại ({{time}}). Bạn cần rời đi trước thời điểm đó. | **미검수** |
| `booking.empty` | 아직 예약 내역이 없어요 | No bookings yet | 暂无预订记录 | まだ予約履歴がありません | Chưa có lượt đặt chỗ nào | **미검수** |
| `booking.browseStays` | 숙소 보러가기 | Browse stays | 浏览住宿 | 宿泊先を見る | Xem chỗ nghỉ | **미검수** |
| `confirm.title` | 예약 확인 | Booking Confirmed | 预订确认 | 予約確認 | Xác nhận đặt chỗ | **미검수** |
| `confirm.subtitle` | My booking | My booking | 我的预订 | マイ予約 | Đặt chỗ của tôi | **미검수** |
| `confirm.complete` | 예약 완료 | Booking complete | 预订完成 | 予約完了 | Đặt chỗ thành công | **미검수** |
| `confirm.bookingNumber` | 예약번호 | Booking number | 预订编号 | 予約番号 | Mã đặt chỗ | **미검수** |
| `confirm.stay` | 숙소 | Stay | 住宿 | 宿泊先 | Chỗ nghỉ | **미검수** |
| `confirm.included` | 포함 | Included | 含 | 含む | Bao gồm | **미검수** |
| `confirm.includedValue` | 샤워 · 휴식 · 짐보관 | Shower · rest · luggage storage | 淋浴·休息·行李寄存 | シャワー・休憩・荷物預かり | Tắm · nghỉ ngơi · gửi hành lý | **미검수** |
| `confirm.returnAt` | 복귀 {{time}} | Return by {{time}} | 建议返回 {{time}} | 復帰 {{time}} | Quay lại {{time}} | **미검수** |
| `luggage.title` | 수하물 케어 | Luggage Care | 行李管家 | 手荷物ケア | Chăm sóc hành lý | **미검수** |
| `luggage.subtitle` | Luggage-Free | Luggage-Free | 无负重出行 | Luggage-Free | Luggage-Free | **미검수** |
| `luggage.banner.prefix` | 무거운 캐리어는 맡기고 | Check in your heavy suitcase and travel | 寄存沉重的行李箱, | 重いスーツケースは預けて | Gửi vali nặng lại và di chuyển | **미검수** |
| `luggage.banner.bold` | 가볍게 | light | 轻装出行 | 身軽に | nhẹ nhàng | **미검수** |
| `luggage.banner.suffix` | 이동하세요. 항공편 복귀 시간에 맞춰 짐을 공항으로 되돌려 드립니다. | . We'll return your bags to the airport in time for your flight. | 。我们会在您的航班返程前将行李送回机场。 | 移動しましょう。フライトの復帰時間に合わせて荷物を空港へお戻しします。 | . Chúng tôi sẽ trả hành lý về sân bay đúng giờ bay của bạn. | **미검수** |
| `luggage.option.inAirport.title` | 공항 내 보관 | In-Airport Storage | 机场内寄存 | 空港内保管 | Gửi đồ trong sân bay | **미검수** |
| `luggage.option.inAirport.description` | T1 · T2 스마트 락커 즉시 보관 | Instant smart lockers at T1 · T2 | T1·T2智能储物柜即时寄存 | T1・T2スマートロッカーで即時保管 | Tủ khóa thông minh T1 · T2, gửi ngay | **미검수** |
| `luggage.option.toHotel.title` | 호텔로 배송 | Delivery to Hotel | 配送至酒店 | ホテルへ配送 | Giao đến khách sạn | **미검수** |
| `luggage.option.toHotel.description` | 데이유즈 숙소로 짐 픽업·배송 | Pickup & delivery to your day-use stay | 行李接送至钟点房住宿 | デイユース宿泊先へ荷物ピックアップ・配送 | Lấy và giao hành lý đến chỗ nghỉ Day-Use | **미검수** |
| `luggage.option.toDistrict.title` | 상권으로 배송 | Delivery to Shopping Area | 配送至商圈 | 商業エリアへ配送 | Giao đến khu mua sắm | **미검수** |
| `luggage.option.toDistrict.description` | 영종도·차이나타운 거점 수령 | Pick up at Yeongjong-do / Chinatown hubs | 在永宗岛·唐人街据点领取 | 永宗島・チャイナタウン拠点で受取 | Nhận tại điểm Yeongjong-do · Phố người Hoa | **미검수** |
| `my.title` | 마이 페이지 | My Page | 我的页面 | マイページ | Trang của tôi | **미검수** |
| `my.subtitle` | My page | My page | 我的页面 | マイページ | Trang của tôi | **미검수** |
| `my.greeting` | 안녕하세요, 여행자님! | Hello, Traveler! | 你好,旅行者! | こんにちは、トラベラーさん! | Xin chào, Nhà du hành! | **미검수** |
| `my.bookingCount` | 예약 {{n}}건 | {{n}} bookings | {{n}}笔预订 | 予約{{n}}件 | {{n}} lượt đặt chỗ | **미검수** |
| `my.menu.bookingHistory` | 예약 내역 | Booking History | 预订记录 | 予約履歴 | Lịch sử đặt chỗ | **미검수** |
| `my.menu.coupons` | 쿠폰 | Coupons | 优惠券 | クーポン | Phiếu giảm giá | **미검수** |
| `my.menu.passport` | 여권 인증 | Passport Verification | 护照认证 | パスポート認証 | Xác minh hộ chiếu | **미검수** |
| `my.menu.language` | 언어 설정 | Language Settings | 语言设置 | 言語設定 | Cài đặt ngôn ngữ | **미검수** |
| `course.title` | 환승 코스 만들기 | Build Your Transit Course | 制作转机路线 | 乗継コースを作る | Tạo lộ trình quá cảnh | **미검수** |
| `course.subtitle` | 카테고리 → 장소 선택 → 일정 자동 생성 | Category → pick spots → auto-schedule | 类别 → 选地点 → 自动生成行程 | カテゴリ → スポット選択 → 予定自動生成 | Danh mục → chọn địa điểm → tự tạo lịch | **미검수** |
| `course.budget.hours` | 환승 여유 {{h}}시간 | {{h}}h transit time | 中转空闲 {{h}}小时 | 乗継の余裕 {{h}}時間 | Thời gian trống quá cảnh {{h}} giờ | **미검수** |
| `course.budget.over` | {{min}}분 초과 | {{min}} min over | 超出{{min}}分钟 | {{min}}分オーバー | Vượt quá {{min}} phút | **미검수** |
| `course.budget.spare` | 여유 {{min}}분 | {{min}} min to spare | 剩余{{min}}分钟 | 余裕{{min}}分 | Còn dư {{min}} phút | **미검수** |
| `course.budget.arriveReturn` | 도착 {{arrive}} · 복귀 추천 {{return}} | Arrive {{arrive}} · Return by {{return}} | 到达 {{arrive}} · 建议返回 {{return}} | 到着 {{arrive}} · 復帰推奨 {{return}} | Đến {{arrive}} · Nên quay lại {{return}} | **미검수** |
| `course.room.title` | ① 데이유즈 숙소 선택 | ① Choose your day-use stay | ① 选择钟点房 | ① デイユース宿泊先を選択 | ① Chọn chỗ nghỉ Day-Use | **미검수** |
| `course.room.required` | (필수 · 코스의 거점) | (Required · course home base) | (必选·行程据点) | (必須・コースの拠点) | (Bắt buộc · điểm trung tâm của lộ trình) | **미검수** |
| `course.category.title` | ② 활동 카테고리 합치기 | ② Add activity categories | ② 添加活动类别 | ② アクティビティカテゴリを追加 | ② Thêm danh mục hoạt động | **미검수** |
| `course.category.note` | (복수 선택) | (Select multiple) | (可多选) | (複数選択可) | (Chọn nhiều) | **미검수** |
| `course.autoBuild.cta` | Time-Fit 자동 코스 짜기 | Auto-build with Time-Fit | Time-Fit 自动排程 | Time-Fit 自動コース作成 | Tự động lên lịch Time-Fit | **미검수** |
| `course.places.title` | 활동 방문지 | Activity spots | 活动地点 | アクティビティスポット | Địa điểm hoạt động | **미검수** |
| `course.places.combined` | {{list}} 합침 | {{list}} combined | 已合并 {{list}} | {{list}} を組み合わせ | Kết hợp {{list}} | **미검수** |
| `course.places.chooseCategory` | 카테고리를 선택하세요 | Select a category | 请选择类别 | カテゴリを選択してください | Hãy chọn danh mục | **미검수** |
| `course.places.chooseRoomFirst` | 먼저 숙소를 선택하세요 | Choose your stay first | 请先选择住宿 | 先に宿泊先を選択してください | Hãy chọn chỗ nghỉ trước | **미검수** |
| `course.places.roomFirstHint` | ① 데이유즈 숙소를 먼저 선택하면 활동을 담을 수 있어요. | ① Choose a day-use stay first to start adding activities. | ① 先选择钟点房,才能添加活动。 | ① デイユース宿泊先を先に選ぶと、アクティビティを追加できます。 | ① Chọn chỗ nghỉ Day-Use trước để thêm hoạt động. | **미검수** |
| `course.places.fits` | 환승 내 가능 | Fits in layover | 中转时间内可行 | 乗継時間内で可能 | Phù hợp thời gian quá cảnh | **미검수** |
| `course.places.tight` | 시간 빠듯 | Tight on time | 时间紧张 | 時間がタイト | Thời gian gấp | **미검수** |
| `course.places.add` | 일정에 추가 | Add to plan | 加入行程 | 予定に追加 | Thêm vào lịch trình | **미검수** |
| `course.schedule.title` | 내 환승 일정 | My transit schedule | 我的中转行程 | マイ乗継スケジュール | Lịch trình quá cảnh của tôi | **미검수** |
| `course.schedule.summary` | {{n}}개 활동 · 총 {{h}}시간 {{m}}분 | {{n}} activities · {{h}}h {{m}}m total | {{n}}项活动 · 共{{h}}小时{{m}}分钟 | {{n}}件のアクティビティ · 合計{{h}}時間{{m}}分 | {{n}} hoạt động · tổng {{h}} giờ {{m}} phút | **미검수** |
| `course.schedule.emptyHint` | 숙소를 선택하면 일정이 생성돼요 | Pick a stay to generate your schedule | 选择住宿后将生成行程 | 宿泊先を選ぶとスケジュールが作成されます | Chọn chỗ nghỉ để tạo lịch trình | **미검수** |
| `course.schedule.pickRoom.prefix` | 데이유즈 숙소를 | Choose a day-use stay as your | 请先将钟点房选为 | デイユース宿泊先を | Hãy chọn chỗ nghỉ Day-Use làm | **미검수** |
| `course.schedule.pickRoom.bold` | 거점 | home base | 据点 | 拠点 | điểm trung tâm | **미검수** |
| `course.schedule.pickRoom.suffix` | 으로 먼저 골라주세요. | first. | 。 | として先に選んでください。 |  trước tiên. | **미검수** |
| `course.schedule.overWarning` | 환승 시간을 {{min}}분 초과했어요. 장소를 줄이거나 짧은 코스로 바꿔보세요. | You're {{min}} min over your transit time. Remove a spot or pick a shorter course. | 已超出中转时间{{min}}分钟。请减少地点或选择更短的行程。 | 乗継時間を{{min}}分超過しています。スポットを減らすか、短いコースに変更してください。 | Bạn đã vượt quá thời gian quá cảnh {{min}} phút. Hãy bớt điểm đến hoặc chọn lộ trình ngắn hơn. | **미검수** |
| `course.bookThisStay` | 이 숙소로 예약하기 → | Book this stay → | 预订此住宿 → | この宿泊先を予約する → | Đặt chỗ nghỉ này → | **미검수** |
| `course.save` | 코스 저장하기 | Save course | 保存行程 | コースを保存 | Lưu lộ trình | **미검수** |
| `course.step.arrive.title` | 공항 도착 · 짐 맡기기 | Arrive at airport · drop luggage | 抵达机场 · 寄存行李 | 空港到着・荷物を預ける | Đến sân bay · gửi hành lý | **미검수** |
| `course.step.arrive.sub` | 수하물 케어 픽업 | Luggage care pickup | 行李托管取件 | 手荷物ケア受付 | Nhận dịch vụ hành lý | **미검수** |
| `course.step.checkIn.title` | {{room}} 체크인 | Check in at {{room}} | 入住 {{room}} | {{room}} にチェックイン | Nhận phòng tại {{room}} | **미검수** |
| `course.step.checkIn.sub` | 데이유즈 거점 · 짐 보관·샤워 가능 (이동 {{move}}분) | Day-use base · luggage storage & shower available (transfer {{move}} min) | 钟点房据点 · 可寄存行李·淋浴(移动{{move}}分钟) | デイユース拠点・荷物預かり・シャワー利用可(移動{{move}}分) | Điểm trung tâm Day-Use · có thể gửi hành lý & tắm (di chuyển {{move}} phút) | **미검수** |
| `course.step.place.sub` | {{area}} · 체류 {{dur}}분 (이동 {{move}}분) | {{area}} · stay {{dur}} min (transfer {{move}} min) | {{area}} · 停留{{dur}}分钟(移动{{move}}分钟) | {{area}}・滞在{{dur}}分(移動{{move}}分) | {{area}} · lưu trú {{dur}} phút (di chuyển {{move}} phút) | **미검수** |
| `course.step.place.subNoStay` | {{area}} (이동 {{move}}분) | {{area}} (transfer {{move}} min) | {{area}}(移动{{move}}分钟) | {{area}}(移動{{move}}分) | {{area}} (di chuyển {{move}} phút) | **미검수** |
| `course.step.return.title` | 공항 복귀 | Return to airport | 返回机场 | 空港へ復帰 | Quay lại sân bay | **미검수** |
| `course.map.pickRoomNote` | 지도에 제휴 데이유즈 숙소가 전부 핀으로 떠요 · 핀을 탭하면 그 숙소가 바로 선택돼요 | All partner day-use stays show as pins on the map · tap a pin to select that stay | 地图上会显示所有合作钟点房住宿的图钉 · 点击图钉即可选择该住宿 | 地図に提携デイユース宿泊先が全てピンで表示されます・ピンをタップするとその宿泊先が選択されます | Mọi chỗ nghỉ Day-Use đối tác đều hiện thành ghim trên bản đồ · chạm vào ghim để chọn chỗ nghỉ đó | **미검수** |
| `course.map.allPlacesNote` | 숙소 주변 실제 음식점·카페·편의점·마트·관광명소·뷰티(올리브영 등)가 작은 점으로 떠요(지도를 확대해야 나타나요) · 점을 탭하면 정보가 뜨고 거기서 일정에 추가/제거 · 이미 담긴 곳은 순번이 붙은 큰 핀으로 표시 · 병원·약국은 확대 시 참고용 점으로만 표시(일정에는 안 담김) | Real nearby restaurants, cafes, convenience stores, marts, attractions & beauty shops (Olive Young, etc.) show as small dots once you zoom in · tap a dot to see info and add/remove it from your plan there · spots already in your plan show as bigger numbered pins · hospitals & pharmacies show as reference dots when zoomed in (not added to your plan) | 放大地图后,住宿附近的真实餐厅·咖啡馆·便利店·超市·景点·美妆店(Olive Young等)会显示为小点 · 点击小点可查看信息并在其中加入/移出行程 · 已加入行程的地点会显示为带编号的大图钉 · 放大后医院·药店仅以小点显示(仅供参考,不会加入行程) | 地図を拡大すると宿泊先周辺の実際の飲食店・カフェ・コンビニ・マート・観光名所・ビューティー(オリーブヤングなど)が小さな点で表示されます・点をタップすると情報が表示され、そこで予定に追加/削除できます・すでに予定に入っている場所は番号付きの大きなピンで表示・拡大時、病院・薬局は参考用の点のみ表示(予定には追加されません) | Phóng to bản đồ để thấy nhà hàng, quán cà phê, cửa hàng tiện lợi, siêu thị, điểm tham quan & cửa hàng làm đẹp (Olive Young, v.v.) thực tế gần chỗ nghỉ hiện thành chấm nhỏ · chạm vào chấm để xem thông tin và thêm/bớt khỏi lịch trình ngay tại đó · nơi đã có trong lịch trình hiện thành ghim lớn có đánh số · khi phóng to, bệnh viện & nhà thuốc hiện thành chấm để tham khảo (không thêm vào lịch trình) | **미검수** |
| `course.map.routeLegend` | 선 위 숫자·색이 방문 순서(핀 번호와 동일) · 선 모양은 이동수단: ●●● 자동차 · ┄┄ 도보 · ⋯⋯ 대중교통 | Number & color on the line = visit order (matches pin numbers) · line style = mode: ●●● car · ┄┄ walk · ⋯⋯ transit | 线上的数字和颜色代表访问顺序(与图钉编号一致) · 线型代表交通方式:●●● 驾车 · ┄┄ 步行 · ⋯⋯ 公共交通 | 線上の番号と色は訪問順(ピン番号と対応)・線の種類は移動手段: ●●● 車・┄┄ 徒歩・⋯⋯ 公共交通 | Số & màu trên đường = thứ tự ghé thăm (khớp số trên ghim) · kiểu đường = phương tiện: ●●● ô tô · ┄┄ đi bộ · ⋯⋯ phương tiện công cộng | **미검수** |
| `course.map.unavailable` | 지도를 불러올 수 없어요. 이 도메인이 카카오 개발자 콘솔에 등록됐는지 확인해주세요. | Couldn't load the map. Make sure this domain is registered in Kakao Developers. | 无法加载地图。请确认该域名已在 Kakao Developers 中注册。 | 地図を読み込めません。このドメインがKakao Developersに登録されているか確認してください。 | Không tải được bản đồ. Hãy chắc chắn tên miền này đã được đăng ký trong Kakao Developers. | **미검수** |
| `course.map.referenceOnly` | 참고용 · 일정에는 추가할 수 없어요 | For reference only · can't be added to your plan | 仅供参考 · 无法加入行程 | 参考用・予定には追加できません | Chỉ để tham khảo · không thể thêm vào lịch trình | **미검수** |
| `course.route.loading` | 실제 이동시간 조회 중… | Looking up real travel times… | 正在查询实际路程时间… | 実際の移動時間を照会中… | Đang tra cứu thời gian di chuyển thực tế… | **미검수** |
| `course.route.live` | 실제 이동시간(도보·대중교통·자동차) 반영중 | Live travel times applied (walk · transit · drive) | 已应用实际路程时间(步行·公交·驾车) | 実際の移動時間(徒歩・公共交通・車)を反映中 | Đang áp dụng thời gian di chuyển thực tế (đi bộ · phương tiện công cộng · lái xe) | **미검수** |
| `savedCourse.title` | 저장된 코스 | Saved Course | 已保存的行程 | 保存済みコース | Lộ trình đã lưu | **미검수** |
| `savedCourse.subtitle` | Saved course | Saved course | 已保存的行程 | 保存済みコース | Lộ trình đã lưu | **미검수** |
| `savedCourse.edit` | 수정하기 | Edit | 编辑 | 編集 | Chỉnh sửa | **미검수** |
| `savedCourse.empty` | 아직 저장된 코스가 없어요 | No saved course yet | 暂无已保存的行程 | まだ保存されたコースがありません | Chưa có lộ trình đã lưu | **미검수** |
| `category.food` | 맛집 | Food | 美食 | グルメ | Ẩm thực | **미검수** |
| `category.massage` | 마사지 | Massage | 按摩 | マッサージ | Massage | **미검수** |
| `category.shopping` | 쇼핑 | Shopping | 购物 | ショッピング | Mua sắm | **미검수** |
| `category.rest` | 휴식 | Rest | 休息 | 休憩 | Nghỉ ngơi | **미검수** |
| `category.beauty` | 뷰티 | Beauty | 美容 | ビューティー | Làm đẹp | **미검수** |
| `category.sightseeing` | 관광 | Sightseeing | 观光 | 観光 | Tham quan | **미검수** |
| `category.brand` | 브랜드 | Brand | 品牌 | ブランド | Thương hiệu | **미검수** |
