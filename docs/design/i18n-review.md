# 번역 검수 요청 — 레거시 이후 추가·변경 문구

> 상태: 초안 · 생성: `node scripts/i18n-review-table.mjs` (손으로 고치지 말 것)
> 미검수 123 / 전체 123 · 원문은 ko, en은 개발자 작성, **zh·ja·vi는 기계 수준 초안** · 레거시에서 옮긴 문구는 [i18n-review-legacy](i18n-review-legacy.md)

## 검수 방법
- 각 언어 칸의 뜻이 ko 원문과 같은지, 앱 버튼·안내문으로 자연스러운지 **원어민**이 확인한다(공개 전 전부 대상).
- `{{이름}}`은 숫자·시각이 들어가는 자리표시자다. **지우거나 이름을 바꾸면 안 된다.**
- 고칠 문구는 `src/i18n/locales/<언어>.json`을 고친 뒤 검수 완료를 기록하고 이 표를 다시 만든다. 검수 완료는 `src/i18n/added-keys.json`의 `reviewed`를 `true`로.

| 키 | 종류 | 쓰이는 곳 | ko(원문) | en | zh | ja | vi | 상태 |
|---|---|---|---|---|---|---|---|---|
| `booking.active` | 추가 | 예약 — 진행 중 요청 1건(B8) | 진행 중인 요청이 있어요. 한 번에 1건만 요청할 수 있어요. | You already have an active request. Only one request at a time. | 您已有进行中的请求，每次只能提交一个。 | 進行中のリクエストがあります。リクエストは一度に1件までです。 | Bạn đang có một yêu cầu. Mỗi lần chỉ gửi được một yêu cầu. | **미검수** |
| `booking.activeLink` | 추가 | 예약 — 진행 중 요청 링크 | 내 예약 보기 | View my bookings | 查看我的预订 | 予約を見る | Xem đặt chỗ của tôi | **미검수** |
| `booking.consent.privacy` | 추가 | 예약 — 개인정보 수집·이용 동의(초안) | 이름·이메일 수집·이용에 동의해요 (예약 요청 전달과 회신에만 사용) | I agree to the collection and use of my name and email (only to send this request and reply) | 同意收集和使用我的姓名和电子邮箱（仅用于发送此请求和回复） | 氏名・メールアドレスの収集・利用に同意します（リクエストの送信と返信のみに使用） | Tôi đồng ý cho thu thập và sử dụng tên, email (chỉ để gửi yêu cầu và phản hồi) | **미검수** |
| `booking.consent.terms` | 추가 | 예약 — 계산 참고용·탑승 책임 동의(초안) | 시간 계산은 참고용이며 탑승 책임은 저에게 있다는 데 동의해요 | I understand the time estimates are for reference and catching my flight is my responsibility | 我理解时间计算仅供参考，按时登机是我自己的责任 | 時間の計算は参考値であり、搭乗の責任は自分にあることに同意します | Tôi hiểu thời gian tính toán chỉ để tham khảo và việc lên máy bay là trách nhiệm của tôi | **미검수** |
| `booking.consent.thirdParty` | 추가 | 예약 — 숙소 제공(제3자 제공) 동의(초안) | 예약 요청을 위해 이름·이메일을 숙소에 제공하는 데 동의해요 | I agree to share my name and email with the stay for this request | 同意为此请求向住宿提供我的姓名和电子邮箱 | このリクエストのため氏名・メールアドレスを宿泊先に提供することに同意します | Tôi đồng ý cung cấp tên và email cho chỗ nghỉ để gửi yêu cầu | **미검수** |
| `booking.consent.title` | 추가 | 예약 — 동의 제목(legal 확인 전 초안) | 동의 | Consent | 同意事项 | 同意事項 | Đồng ý | **미검수** |
| `booking.contact.email` | 추가 | 예약 — 이메일 입력 | 이메일 | Email | 电子邮箱 | メールアドレス | Email | **미검수** |
| `booking.contact.emailConfirm` | 추가 | 예약 — 이메일 확인 입력 | 이메일 확인 | Confirm email | 确认电子邮箱 | メールアドレス（確認） | Xác nhận email | **미검수** |
| `booking.contact.error.email` | 추가 | 예약 — 이메일 형식 오류 | 이메일 형식을 확인해 주세요 | Please check the email format | 请检查电子邮箱格式 | メールアドレスの形式をご確認ください | Vui lòng kiểm tra định dạng email | **미검수** |
| `booking.contact.error.emailMismatch` | 추가 | 예약 — 이메일 확인 불일치 | 이메일이 서로 달라요 | The emails don't match | 两次输入的电子邮箱不一致 | メールアドレスが一致しません | Hai email không khớp | **미검수** |
| `booking.contact.error.name` | 추가 | 예약 — 이름 오류 | 이름을 입력해 주세요 | Please enter your name | 请输入姓名 | お名前を入力してください | Vui lòng nhập họ tên | **미검수** |
| `booking.contact.minimal` | 추가 | 예약 — 최소 수집 안내 | 예약 요청에는 이름과 이메일만 받아요 | We only ask for your name and email | 预订请求只需要姓名和电子邮箱 | リクエストに必要なのはお名前とメールアドレスだけです | Chúng tôi chỉ cần tên và email của bạn | **미검수** |
| `booking.contact.name` | 추가 | 예약 — 이름 입력(영문 허용) | 이름 (영문 가능) | Name (Latin letters OK) | 姓名（可用英文） | お名前（ローマ字可） | Họ tên (có thể dùng chữ Latin) | **미검수** |
| `booking.contact.nameHint` | 추가 | 예약 — 이름 입력 힌트 | 여권과 같은 로마자 표기를 권장해요 | We recommend the same spelling as your passport | 建议与护照上的拼写一致 | パスポートと同じローマ字表記をおすすめします | Nên ghi giống trên hộ chiếu | **미검수** |
| `booking.contact.title` | 추가 | 예약 — 연락처(B4 최소 수집) | 연락처 | Contact | 联系方式 | 連絡先 | Liên hệ | **미검수** |
| `booking.entryNotice` | 추가 | 예약 — 외출≠입국 안내(B7 안 A) | 입국 가능 여부(국적·비자·환승 조건)는 {{appName}}가 확인하지 않아요. 공항 밖으로 나가기 전에 공식 안내에서 확인해 주세요. | {{appName}} doesn't check whether you can enter Korea (nationality, visa, transit rules). Check the official guidance before leaving the airport. | {{appName}}不会核实您能否入境（国籍、签证、转机条件）。离开机场前请查看官方指南。 | 入国できるかどうか（国籍・ビザ・乗継条件）は{{appName}}では確認していません。空港を出る前に公式案内でご確認ください。 | {{appName}} không kiểm tra bạn có được nhập cảnh hay không (quốc tịch, thị thực, điều kiện quá cảnh). Hãy xem hướng dẫn chính thức trước khi rời sân bay. | **미검수** |
| `booking.entryNoticeLink` | 추가 | 예약 — 외출≠입국 안내 공식 링크 | 하이코리아 입국 안내 | HiKorea entry guide | HiKorea入境指南 | HiKorea入国案内 | Hướng dẫn nhập cảnh HiKorea | **미검수** |
| `booking.entryNoticeShort` | 추가 | 예약 — 버튼 위 입국 안내 한 줄 | 입국 조건은 공식 안내에서 먼저 확인해 주세요. | Please check entry requirements in the official guidance first. | 请先在官方指南中确认入境条件。 | 入国条件は先に公式案内でご確認ください。 | Vui lòng kiểm tra điều kiện nhập cảnh trong hướng dẫn chính thức trước. | **미검수** |
| `booking.fromAirportApprox` | 추가 | 예약 — 숙소 카드 근사 이동시간 | 공항 약 {{n}}분 | ~{{n}} min from airport | 距机场约{{n}}分钟 | 空港から約{{n}}分 | Cách sân bay ~{{n}} phút | **미검수** |
| `booking.makeCourse` | 추가 | 예약 — 코스 만들기 버튼 | 코스 만들기 | Build a course | 制定行程 | コースを作る | Tạo lộ trình | **미검수** |
| `booking.notFound` | 추가 | 예약 — 노출 안 되는 숙소·잘못된 주소 | 숙소를 찾을 수 없어요 | We couldn't find this stay | 找不到该住宿 | 宿泊先が見つかりません | Không tìm thấy chỗ nghỉ này | **미검수** |
| `booking.participation.negotiating` | 추가 | 예약 — 데모의 호텔 참여 상태 표시 | 제휴 협의 중 | Partnership in talks | 合作洽谈中 | 提携協議中 | Đang đàm phán hợp tác | **미검수** |
| `booking.participation.none` | 추가 | 예약 — 데모의 호텔 참여 상태 표시 | 제휴 전 | Not a partner yet | 尚未合作 | 未提携 | Chưa hợp tác | **미검수** |
| `booking.product.noneStartable` | 추가 | 예약 — 슬롯에 시작 가능한 상품 없음 | 이 시각에는 시작할 수 있는 상품이 없어요. 다른 시각을 골라 주세요. | No block can start at this time. Please pick another time. | 此时间没有可开始的时段，请选择其他时间。 | この時刻に開始できるプランはありません。別の時刻を選んでください。 | Không có gói nào bắt đầu vào giờ này. Hãy chọn giờ khác. | **미검수** |
| `booking.product.startWindow` | 추가 | 예약 — 상품 시작 가능 시각 | {{from}}–{{to}} 시작만 가능 | Start {{from}}–{{to}} only | 仅限{{from}}–{{to}}开始 | {{from}}–{{to}}開始のみ | Chỉ bắt đầu {{from}}–{{to}} | **미검수** |
| `booking.product.vatExcluded` | 추가 | 예약 — 상품 칩 부가세 표시 | 부가세 별도 | VAT excl. | 不含增值税 | 税別 | Chưa gồm VAT | **미검수** |
| `booking.product.vatIncluded` | 추가 | 예약 — 상품 칩 부가세 표시 | 부가세 포함 | VAT incl. | 含增值税 | 税込 | Đã gồm VAT | **미검수** |
| `booking.quote.noTime` | 추가 | 예약 — 견적 요청인데 숙소 출발 기한이 슬롯보다 이름(이용할 시간 없음) | 이 시각에는 숙소를 이용할 시간이 남지 않아요. 더 이른 시각이나 공항에서 가까운 숙소를 골라 주세요. | There's no time left to use the stay from this time. Pick an earlier time or a stay closer to the airport. | 从这个时间开始已没有可使用住宿的时间。请选择更早的时间或离机场更近的住宿。 | この時刻からは宿泊先を利用する時間が残りません。早い時刻か空港に近い宿泊先を選んでください。 | Từ giờ này không còn thời gian để dùng chỗ nghỉ. Hãy chọn giờ sớm hơn hoặc chỗ nghỉ gần sân bay hơn. | **미검수** |
| `booking.quote.note` | 추가 | 예약 — 견적 요청 안내 | 가격과 가능 여부는 호텔이 알려드려요 | The hotel will reply with the price and availability | 酒店会回复价格和是否可用 | 料金と利用可否はホテルからご連絡します | Khách sạn sẽ báo giá và tình trạng phòng | **미검수** |
| `booking.quote.title` | 추가 | 예약 — 요청 작성 헤더(견적 요청) | 데이유즈 견적 요청 | Day-use quote request | 日间使用报价请求 | デイユース見積もりリクエスト | Yêu cầu báo giá day-use | **미검수** |
| `booking.quote.window` | 추가 | 예약 — 견적 요청 희망 이용 시간 | 희망 이용 시간 {{from}} – {{to}} (숙소 출발 기한까지) | Requested time {{from}} – {{to}} (until you must leave the stay) | 希望使用时间 {{from}} – {{to}}（至离开住宿的最晚时间） | 希望利用時間 {{from}} – {{to}}（宿泊先の出発期限まで） | Thời gian mong muốn {{from}} – {{to}} (đến hạn rời chỗ nghỉ) | **미검수** |
| `booking.request.title` | 추가 | 예약 — 요청 작성 헤더(상품 요청) | 데이유즈 예약 요청 | Day-use booking request | 日间使用预订请求 | デイユース予約リクエスト | Yêu cầu đặt day-use | **미검수** |
| `booking.submit.notReady` | 추가 | 예약 — 데모 아닌 환경(B6) | 예약 요청은 아직 준비 중이에요 | Booking requests aren't available yet | 预订请求功能尚未开放 | 予約リクエストはまだ準備中です | Tính năng yêu cầu đặt chỗ chưa sẵn sàng | **미검수** |
| `booking.submit.note` | 추가 | 예약 — 버튼 아래 안내 | 호텔이 확인하면 이메일로 알려드려요 | We'll email you when the hotel responds | 酒店回复后我们会发邮件通知您 | ホテルから返答があればメールでお知らせします | Chúng tôi sẽ gửi email khi khách sạn phản hồi | **미검수** |
| `booking.submit.noteTypical` | 추가 | 예약 — 버튼 아래 안내(응답 시간 있음) | 호텔이 확인하면 이메일로 알려드려요 · 보통 {{n}}분 안에 답해요 | We'll email you when the hotel responds · usually within {{n}} min | 酒店回复后我们会发邮件通知您 · 通常{{n}}分钟内回复 | ホテルから返答があればメールでお知らせします · 通常{{n}}分以内 | Chúng tôi sẽ gửi email khi khách sạn phản hồi · thường trong {{n}} phút | **미검수** |
| `booking.submit.product` | 추가 | 예약 — 요청 버튼(결제 아님) | 예약 요청 보내기 | Send booking request | 发送预订请求 | 予約リクエストを送る | Gửi yêu cầu đặt chỗ | **미검수** |
| `booking.submit.quote` | 추가 | 예약 — 견적 요청 버튼 | 견적 요청 보내기 | Send quote request | 发送报价请求 | 見積もりリクエストを送る | Gửi yêu cầu báo giá | **미검수** |
| `booking.summary.block` | 추가 | 예약 — 요청 내용 블록·시각 | {{h}}시간 · {{from}}–{{to}} | {{h}} h · {{from}}–{{to}} | {{h}}小时 · {{from}}–{{to}} | {{h}}時間 · {{from}}–{{to}} | {{h}} giờ · {{from}}–{{to}} | **미검수** |
| `booking.summary.policy` | 추가 | 예약 — 규정 줄 | 취소·노쇼·연장 규정 | Cancellation / no-show / extension | 取消·未到·延长规定 | キャンセル・ノーショー・延長の規定 | Quy định hủy / không đến / gia hạn | **미검수** |
| `booking.summary.policyPending` | 추가 | 예약 — 규정 없음 | 호텔 확인 후 안내 | Shared after the hotel confirms | 酒店确认后告知 | ホテル確認後にご案内 | Thông báo sau khi khách sạn xác nhận | **미검수** |
| `booking.summary.price` | 추가 | 예약 — 예상 금액 | 예상 금액 | Estimated price | 预计金额 | 予定金額 | Giá dự kiến | **미검수** |
| `booking.summary.priceNote` | 추가 | 예약 — 결제 없음 안내 | 결제는 호텔 확인 후 안내해요 | Payment details come after the hotel confirms | 酒店确认后再告知付款方式 | お支払いはホテル確認後にご案内します | Thông tin thanh toán sẽ có sau khi khách sạn xác nhận | **미검수** |
| `booking.summary.quote` | 추가 | 예약 — 견적 대기 | 견적 대기 | Awaiting quote | 等待报价 | 見積もり待ち | Chờ báo giá | **미검수** |
| `booking.summary.title` | 추가 | 예약 — 요청 내용 제목 | 요청 내용 | Request details | 请求内容 | リクエスト内容 | Nội dung yêu cầu | **미검수** |
| `booking.timing.ack` | 추가 | 예약 — 경고 확인 체크(B3) | 일정을 줄이거나 호텔과 조정할게요 | I'll shorten my plan or arrange it with the hotel | 我会缩短行程或与酒店协调 | 予定を減らすか、ホテルと調整します | Tôi sẽ rút ngắn lịch hoặc trao đổi với khách sạn | **미검수** |
| `booking.timing.airport` | 추가 | 예약 — 시간 확인 줄 | 공항 복귀 예상 | Expected airport arrival | 预计返回机场 | 空港到着予定 | Dự kiến về sân bay | **미검수** |
| `booking.timing.checkIn` | 추가 | 예약 — 시간 확인 줄 | 체크인 | Check-in | 入住 | チェックイン | Nhận phòng | **미검수** |
| `booking.timing.end` | 추가 | 예약 — 시간 확인 줄 | 이용 종료 | Day-use ends | 使用结束 | 利用終了 | Kết thúc day-use | **미검수** |
| `booking.timing.hotelReturn` | 추가 | 예약 — 시간 확인 줄 | 숙소 복귀(짐 찾기) | Back at stay (luggage) | 返回住宿（取行李） | 宿泊先に戻る（荷物） | Về chỗ nghỉ (lấy hành lý) | **미검수** |
| `booking.timing.late` | 추가 | 예약 — 공항 복귀 늦음 경고 | 공항 복귀 예상 {{time}} — 복귀 목표 {{target}}보다 {{min}}분 늦어요. 장소를 빼거나 더 이른 시각을 골라 주세요. | Expected airport arrival {{time}} is {{min}} min after your target {{target}}. Remove a spot or pick an earlier time. | 预计{{time}}返回机场，比目标{{target}}晚{{min}}分钟。请删除地点或选择更早的时间。 | 空港到着予定{{time}}は目標{{target}}より{{min}}分遅れます。スポットを減らすか早い時刻を選んでください。 | Dự kiến về sân bay lúc {{time}}, trễ {{min}} phút so với mục tiêu {{target}}. Hãy bớt điểm đến hoặc chọn giờ sớm hơn. | **미검수** |
| `booking.timing.noCourse` | 추가 | 예약 — 코스 없이 진입(B2) | 코스를 만들면 숙소 복귀 시각까지 함께 확인해요 | Build a course to also check when you'll be back at the stay | 制定行程后可一并确认返回住宿的时间 | コースを作ると宿泊先に戻る時刻まで確認できます | Tạo lộ trình để kiểm tra cả giờ về chỗ nghỉ | **미검수** |
| `booking.timing.title` | 추가 | 예약 — 시간 맞춤 확인 제목 | 시간 확인 | Time check | 时间确认 | 時間の確認 | Kiểm tra thời gian | **미검수** |
| `booking.timing.wait` | 추가 | 예약 — 늦은 슬롯 안내(코스 지연) | 체크인까지 {{n}}분 기다려요 — 코스 전체가 그만큼 늦어져요 | You'll wait {{n}} min for check-in — your whole course shifts later | 需等待{{n}}分钟才能入住 — 整个行程相应推迟 | チェックインまで{{n}}分待ちます — コース全体がその分遅れます | Bạn chờ {{n}} phút để nhận phòng — cả lộ trình lùi lại tương ứng | **미검수** |
| `bookings.alt.courseHint` | 추가 | 요청 내역 — 대안 숙소 코스 안내 | 숙소가 바뀌면 코스를 새 숙소로 다시 만들어 주세요 | If you switch stays, rebuild your course from the new stay | 更换住宿后，请以新住宿重新制定行程 | 宿泊先を変える場合は、新しい宿泊先でコースを作り直してください | Nếu đổi chỗ nghỉ, hãy tạo lại lộ trình từ chỗ nghỉ mới | **미검수** |
| `bookings.alt.price` | 추가 | 요청 내역 — 대안 숙소(가격표 있음) | 가격 보기 | See prices | 查看价格 | 料金を見る | Xem giá | **미검수** |
| `bookings.alt.quote` | 추가 | 요청 내역 — 대안 숙소(가격표 없음) | 견적 요청 | Request a quote | 请求报价 | 見積もりを依頼 | Yêu cầu báo giá | **미검수** |
| `bookings.alt.title` | 추가 | 요청 내역 — 대안 숙소 제안(B5) | 다른 숙소 제안 | Other stays nearby | 推荐其他住宿 | ほかの宿泊先 | Gợi ý chỗ nghỉ khác | **미검수** |
| `bookings.cancel` | 추가 | 요청 내역 — 요청됨 취소(B8) | 요청 취소 | Cancel request | 取消请求 | リクエストを取り消す | Hủy yêu cầu | **미검수** |
| `bookings.cancelConfirm.body` | 추가 | 요청 내역 — 취소 확인 | 호텔 확인 전이라 바로 취소돼요. | The hotel hasn't confirmed yet, so it's cancelled right away. | 酒店尚未确认，将立即取消。 | ホテル確認前のため、すぐに取り消されます。 | Khách sạn chưa xác nhận nên yêu cầu sẽ bị hủy ngay. | **미검수** |
| `bookings.cancelConfirm.title` | 추가 | 요청 내역 — 취소 확인 | 요청을 취소할까요? | Cancel this request? | 要取消此请求吗？ | このリクエストを取り消しますか？ | Hủy yêu cầu này? | **미검수** |
| `bookings.cancelConfirm.yes` | 추가 | 요청 내역 — 취소 확인 | 취소하기 | Cancel request | 确认取消 | 取り消す | Hủy | **미검수** |
| `bookings.confirmed.cancelHint` | 추가 | 요청 내역 — 확정 후 취소 안내(B8) | 취소는 호텔에 문의해 주세요 | To cancel, please contact the hotel | 如需取消，请联系酒店 | キャンセルはホテルにお問い合わせください | Để hủy, vui lòng liên hệ khách sạn | **미검수** |
| `bookings.confirmed.note` | 추가 | 요청 내역 — 확정 안내 | 호텔이 확인했어요 | The hotel confirmed | 酒店已确认 | ホテルが確認しました | Khách sạn đã xác nhận | **미검수** |
| `bookings.contact` | 추가 | 요청 내역 — 호텔 연락처 | 호텔 연락처 | Hotel contact | 酒店联系方式 | ホテル連絡先 | Liên hệ khách sạn | **미검수** |
| `bookings.contactPending` | 추가 | 요청 내역 — 연락처 없음 | 연락처 확인 중 | Contact being confirmed | 联系方式确认中 | 連絡先確認中 | Đang xác nhận thông tin liên hệ | **미검수** |
| `bookings.declined.note` | 추가 | 요청 내역 — 거절 안내 | 호텔이 이번 요청을 받을 수 없어요 | The hotel can't accept this request | 酒店无法接受此请求 | ホテルはこのリクエストをお受けできません | Khách sạn không thể nhận yêu cầu này | **미검수** |
| `bookings.declined.reason` | 추가 | 요청 내역 — 거절 사유 | 사유: {{reason}} | Reason: {{reason}} | 原因：{{reason}} | 理由：{{reason}} | Lý do: {{reason}} | **미검수** |
| `bookings.expired.note` | 추가 | 요청 내역 — 만료 안내 | 응답 기한이 지났어요 | The response time has passed | 已超过回复期限 | 回答期限が過ぎました | Đã quá hạn phản hồi | **미검수** |
| `bookings.mode.product` | 추가 | 요청 내역 — 모드 | 예약 요청 | Booking request | 预订请求 | 予約リクエスト | Yêu cầu đặt chỗ | **미검수** |
| `bookings.mode.quote` | 추가 | 요청 내역 — 모드 | 견적 요청 | Quote request | 报价请求 | 見積もりリクエスト | Yêu cầu báo giá | **미검수** |
| `bookings.policy` | 추가 | 요청 내역 — 취소 규정 | 취소 규정 | Cancellation policy | 取消规定 | キャンセル規定 | Chính sách hủy | **미검수** |
| `bookings.policyPending` | 추가 | 요청 내역 — 규정 없음 | 규정 확인 중 | Policy being confirmed | 规定确认中 | 規定確認中 | Đang xác nhận chính sách | **미검수** |
| `bookings.requestId` | 추가 | 요청 내역 — 요청번호 | 요청번호 {{id}} | Request no. {{id}} | 请求编号 {{id}} | リクエスト番号 {{id}} | Mã yêu cầu {{id}} | **미검수** |
| `bookings.requested.note` | 추가 | 요청 내역 — 요청됨 안내 | 호텔 확인 중 | Waiting for the hotel | 等待酒店确认 | ホテル確認中 | Đang chờ khách sạn | **미검수** |
| `bookings.status.cancelled` | 추가 | 요청 내역 — 상태 | 취소됨 | Cancelled | 已取消 | キャンセル済み | Đã hủy | **미검수** |
| `bookings.status.confirmed` | 추가 | 요청 내역 — 상태 | 확정 | Confirmed | 已确认 | 確定 | Đã xác nhận | **미검수** |
| `bookings.status.declined` | 추가 | 요청 내역 — 상태 | 거절됨 | Declined | 已拒绝 | お断り | Bị từ chối | **미검수** |
| `bookings.status.expired` | 추가 | 요청 내역 — 상태 | 만료 | Expired | 已过期 | 期限切れ | Hết hạn | **미검수** |
| `bookings.status.requested` | 추가 | 요청 내역 — 상태 | 요청됨 | Requested | 已请求 | リクエスト済み | Đã gửi | **미검수** |
| `bookings.title` | 추가 | 요청 내역 — 헤더 | 내 예약 | My bookings | 我的预订 | 予約一覧 | Đặt chỗ của tôi | **미검수** |
| `common.back` | 추가 | 3단계 공통 UI(뒤로 버튼 aria-label) | 뒤로 | Back | 返回 | 戻る | Quay lại | **미검수** |
| `course.autoBuild.empty` | 추가 | 코스 지도 — 자동 추천 결과가 0곳일 때 안내 | 남은 시간 안에 들어가는 장소가 없어요. 카테고리를 바꾸거나 공항에서 가까운 숙소를 골라 보세요. | No spot fits in the time left. Try other categories or a stay closer to the airport. | 没有能放进剩余时间的地点。请更换类别或选择离机场更近的住宿。 | 残り時間に収まるスポットがありません。カテゴリを変えるか、空港に近い宿泊先を選んでみてください。 | Không có địa điểm nào vừa với thời gian còn lại. Hãy đổi danh mục hoặc chọn chỗ nghỉ gần sân bay hơn. | **미검수** |
| `course.autoBuild.note` | 레거시 변경 | A7 — 레거시 "OR-Tools 최적화…"를 실제 동작(카테고리별 탐욕 추천)에 맞게 변경 | 시간에 맞춰 자동 추천 · 카테고리마다 남은 시간에 들어가는 장소를 1곳씩 담아요 | Auto-picks to fit your time · adds one spot per category that fits the time left | 按时间自动推荐 · 每个类别添加一处能放进剩余时间的地点 | 時間に合わせて自動おすすめ・カテゴリごとに残り時間に収まるスポットを1件ずつ追加 | Tự động gợi ý theo thời gian · mỗi danh mục thêm 1 địa điểm vừa với thời gian còn lại | **미검수** |
| `course.header.terminal` | 추가 | 코스 지도 — 헤더 도착 터미널 | 인천 {{terminal}} | Incheon {{terminal}} | 仁川 {{terminal}} | 仁川 {{terminal}} | Incheon {{terminal}} | **미검수** |
| `course.header.title` | 추가 | 코스 지도 — 헤더 제목 | 내 코스 | My course | 我的路线 | マイコース | Lộ trình của tôi | **미검수** |
| `course.leg.approxMinutes` | 추가 | 코스 지도 — 구간 칩 시간(근사값) | 약 {{n}}분 | ~{{n}} min | 约{{n}}分钟 | 約{{n}}分 | khoảng {{n}} phút | **미검수** |
| `course.leg.hotelReturn` | 추가 | B1 호텔 복귀 — 지도 칩·구간 정보 "숙소로" | 숙소로 | To stay | 返回住宿 | 宿泊先へ | Về chỗ nghỉ | **미검수** |
| `course.leg.km` | 추가 | 코스 지도 — 구간 칩 거리(실제 값일 때만) | {{km}}km | {{km}} km | {{km}}公里 | {{km}}km | {{km}} km | **미검수** |
| `course.leg.minutes` | 추가 | 코스 지도 — 구간 칩 시간(실제 경로) | {{n}}분 | {{n}} min | {{n}}分钟 | {{n}}分 | {{n}} phút | **미검수** |
| `course.leg.mode.taxi` | 추가 | 코스 지도 — 이동수단 이름 | 택시 | Taxi | 出租车 | タクシー | Taxi | **미검수** |
| `course.leg.mode.transit` | 추가 | 코스 지도 — 이동수단 이름(칩·목록 접근성) | 대중교통 | Transit | 公共交通 | 公共交通 | Phương tiện công cộng | **미검수** |
| `course.leg.mode.walk` | 추가 | 코스 지도 — 이동수단 이름 | 도보 | Walk | 步行 | 徒歩 | Đi bộ | **미검수** |
| `course.leg.return` | 추가 | 코스 지도 — 공항 복귀 구간 칩 | 복귀 | Return | 返回 | 復帰 | Quay về | **미검수** |
| `course.leg.transfers` | 추가 | 코스 지도 — 선택한 구간 정보 | 환승 {{n}}회 | {{n}} transfer(s) | 换乘{{n}}次 | 乗り換え{{n}}回 | Chuyển {{n}} lần | **미검수** |
| `course.map.legend` | 추가 | 코스 지도 — 선 범례(레거시 routeLegend 대체) | 선 모양 = 이동수단: 굵은 실선 대중교통 · 보통 실선 택시 · 점선 도보 · 빨간 긴 파선 공항 복귀. "약" = 실제 경로를 못 받아 어림한 값 | Line style = mode: thick solid transit · solid taxi · dotted walk · red long dash return to airport. "~" = estimated (no live route) | 线型 = 交通方式：粗实线 公共交通 · 实线 出租车 · 点线 步行 · 红色长虚线 返回机场。"约" = 未取得实际路线的估算值 | 線の形 = 移動手段：太い実線 公共交通・実線 タクシー・点線 徒歩・赤い長い破線 空港への復帰。「約」= 実際の経路を取得できず概算した値 | Kiểu đường = phương tiện: nét liền đậm phương tiện công cộng · nét liền taxi · chấm đi bộ · gạch dài đỏ quay về sân bay. "khoảng" = ước tính (không có tuyến thực tế) | **미검수** |
| `course.route.estimateNote` | 추가 | 코스 빌더 — 보수적 근사 안내(실제 경로는 저장 후) | 만드는 동안은 넉넉하게 어림한 이동시간(약 N분)으로 계산해요. 저장하면 실제 경로로 다시 확인해요. | While building, travel times are generous estimates (~N min). Save the course to check real routes. | 制作过程中按宽松估算的移动时间（约N分钟）计算。保存后将按实际路线重新确认。 | 作成中は余裕を持って見積もった移動時間（約N分）で計算します。保存すると実際の経路で確認します。 | Khi đang tạo, thời gian di chuyển được ước tính rộng (khoảng N phút). Lưu lộ trình để kiểm tra tuyến thực tế. | **미검수** |
| `course.step.hotelReturn.sub` | 추가 | B1 호텔 복귀 — 일정의 숙소 복귀 줄 보조 문구 | 이동 {{move}}분 · 데이유즈 이용 시간 안에 돌아와야 해요 | Transfer {{move}} min · be back before your day-use time ends | 交通{{move}}分钟 · 请在日间使用时间结束前返回 | 移動{{move}}分 · デイユース終了までに戻ってください | Di chuyển {{move}} phút · hãy quay lại trước khi hết giờ day-use | **미검수** |
| `course.step.hotelReturn.title` | 추가 | B1 호텔 복귀 — 일정의 숙소 복귀 줄 | {{room}} 복귀 · 짐 찾기 | Back to {{room}} · pick up luggage | 返回{{room}} · 取行李 | {{room}}に戻る · 荷物受け取り | Quay lại {{room}} · nhận hành lý | **미검수** |
| `course.step.return.target` | 추가 | 코스 지도 — 일정의 공항 복귀 줄(레거시 "알림 · 여유 30분" 대체) | 복귀 도착 목표 {{time}} | Target arrival {{time}} | 目标到达 {{time}} | 到着目標 {{time}} | Mục tiêu đến {{time}} | **미검수** |
| `course.summary.available` | 추가 | 코스 지도 — 요약 "/ 가용 Y" | / 가용 {{time}} | / available {{time}} | / 可用 {{time}} | / 利用可能 {{time}} | / khả dụng {{time}} | **미검수** |
| `course.summary.blockOver` | 추가 | B1 호텔 복귀 — 호텔 복귀가 데이유즈 블록 종료보다 늦을 때 경고 | 숙소 복귀 예상 {{time}} — 이용 종료 {{end}}보다 {{min}}분 늦어요. 장소를 빼거나 더 긴 이용 시간을 골라 주세요. | You'd be back at your stay at {{time}}, {{min}} min after your day-use ends ({{end}}). Remove a spot or choose a longer block. | 预计{{time}}返回住宿，比日间使用结束时间{{end}}晚{{min}}分钟。请删除地点或选择更长的时段。 | 宿泊先に戻るのは{{time}}の予定で、デイユース終了（{{end}}）より{{min}}分遅れます。スポットを減らすか、より長い時間を選んでください。 | Bạn sẽ về chỗ nghỉ lúc {{time}}, trễ {{min}} phút so với giờ kết thúc day-use ({{end}}). Hãy bớt điểm đến hoặc chọn gói dài hơn. | **미검수** |
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
| `course.summary.segment.wait` | 추가 | 예약 — 체크인 슬롯 대기(코스 지연) 막대 구간 | 체크인 대기 {{n}}분 | Check-in wait {{n}} min | 等待入住{{n}}分钟 | チェックイン待ち{{n}}分 | Chờ nhận phòng {{n}} phút | **미검수** |
| `course.summary.until` | 추가 | 코스 지도 — "HH:MM까지" | {{time}}까지 | {{time}} | {{time}}之前 | {{time}}まで | {{time}} | **미검수** |
| `course.summary.used` | 추가 | 코스 지도 — 요약 "사용 X" | 사용 {{time}} | Used {{time}} | 已用 {{time}} | 使用 {{time}} | Đã dùng {{time}} | **미검수** |
| `demo.banner` | 추가 | 예약 — 데모 띠(B6) | 데모 — 요청이 호텔에 전송되지 않아요 | Demo — requests are not sent to hotels | 演示 — 请求不会发送给酒店 | デモ — リクエストはホテルに送信されません | Bản demo — yêu cầu không được gửi tới khách sạn | **미검수** |
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
