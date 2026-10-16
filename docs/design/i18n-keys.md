# i18n 키 대응표 (레거시 → 새 키)

> 상태: 확정 · 생성: `node scripts/extract-legacy-i18n.mjs` (손으로 고치지 말 것)
> 레거시 `STR` 183개 + `CAT_LABELS` 7개 = 190개 · 언어: ko, en, zh, ja, vi · 자리표시자 `{x}` → `{{x}}`

| 레거시 키 | 새 키 | ko | 비고 |
|---|---|---|---|
| `next` | `common.next` | 다음 |  |
| `moreBtn` | `common.more` | 더보기 |  |
| `showMorePlacesBtn` | `common.showMoreCount` | 더보기 ({n}곳 더 있음) |  |
| `deleteBtn` | `common.remove` | 삭제 |  |
| `dismissNoticeLabel` | `common.dismiss` | 닫기 |  |
| `comingSoonLbl` | `common.comingSoon` | 준비중 |  |
| `homeBtn` | `common.backToHome` | 홈으로 |  |
| `realtimeBadge` | `common.badge.live` | 실시간 |  |
| `demoBadge` | `common.badge.demo` | 데모값 |  |
| `adBadge` | `common.badge.partnerAd` | 제휴 AD |  |
| `bestBadge` | `common.badge.topPick` | 추천 |  |
| `durationMin` | `unit.minutes` | {n}분 |  |
| `stayHoursOnly` | `unit.hours` | {h}시간 |  |
| `stayHoursMinutes` | `unit.hoursMinutes` | {h}시간 {m}분 |  |
| `nextDayLbl` | `unit.nextDay` | 익일 |  |
| `hourRange` | `unit.hourRange` | {a}–{b}시간 |  |
| `airportMinAway` | `unit.minFromAirport` | 공항 {n}분 |  |
| `moveMinLbl` | `unit.transferMin` | 이동 {n}분 |  |
| `stayMinLbl` | `unit.stayMin` | 체류 {n}분 |  |
| `taglineLine1` | `brand.tagline.line1` | 짐은 맡기고, |  |
| `taglineLine2` | `brand.tagline.line2` | 환승 시간을 인천에서 |  |
| `navHome` | `nav.home` | 홈 |  |
| `navLuggage` | `nav.luggage` | 짐 케어 |  |
| `navCourse` | `nav.course` | 코스 |  |
| `navBooking` | `nav.booking` | 예약 |  |
| `navMy` | `nav.my` | 마이 |  |
| `step0Title` | `onboarding.language.title` | 언어를 선택해주세요 |  |
| `step1Title` | `onboarding.interests.title` | 관심 있는 활동을 골라주세요 |  |
| `step1Note` | `onboarding.interests.note` | 복수 선택 · Time-Fit 추천에 사용 |  |
| `step2Title` | `onboarding.flights.title` | 환승 항공편을 입력해주세요 |  |
| `step2Note` | `onboarding.flights.note` | Time-Safe 여유 시간 자동 계산 |  |
| `arrivalLabel` | `onboarding.flights.arrivalLabel` | 지금 타고 온 도착편 |  |
| `arrivalPlaceholder` | `onboarding.flights.arrivalPlaceholder` | 예: KE085 |  |
| `connLabel` | `onboarding.flights.connectionLabel` | 다음 연결편 |  |
| `connPlaceholder` | `onboarding.flights.connectionPlaceholder` | 예: MU2043 |  |
| `lookupBtn` | `onboarding.flights.lookup` | 실시간 조회 |  |
| `lookupBtnLoading` | `onboarding.flights.lookingUp` | 조회 중… |  |
| `retryFlightHint` | `onboarding.flights.retryHint` | 편명을 다시 확인하고 조회해주세요. |  |
| `needFlightHint` | `onboarding.flights.needBothHint` | 도착편과 연결편을 모두 실시간 조회해야 다음으로 진행할 수 있어요. |  |
| `ctaSmartCourse` | `onboarding.flights.cta` | 스마트 코스 추천 |  |
| `errNotFound` | `flight.error.notFound` | 일치하는 항공편이 없어요 |  |
| `errNoArriveTime` | `flight.error.noArrivalTime` | 도착 시각 정보가 없어요 |  |
| `errNoDepartTime` | `flight.error.noDepartureTime` | 출발 시각 정보가 없어요 |  |
| `fromLbl` | `flight.from` | 출발지 |  |
| `toLbl` | `flight.to` | 도착지 |  |
| `terminalLbl` | `flight.terminal` | 터미널 |  |
| `gateLbl` | `flight.gate` | 게이트 |  |
| `departsLbl` | `flight.departs` | 출발 |  |
| `statusLbl` | `flight.status` | 상태 |  |
| `remarkNormal` | `flight.onTime` | 정상 |  |
| `flightArriveLine` | `flight.arrivalLine` | {airline} {flightId} · 도착 예상 {time} |  |
| `flightDepartLine` | `flight.departureLine` | {airline} {flightId} · 출발 예정 {time} |  |
| `delayedByLbl` | `flight.delayed` | {n}분 지연 |  |
| `flightArriveChangedNotice` | `flight.notice.arrivalChanged` | 도착편 시각이 바뀌었어요 · 도착 {old} → {new} |  |
| `flightDepartChangedNotice` | `flight.notice.returnByChanged` | 연결편 시각이 바뀌었어요 · 복귀 추천 {old} → {new} |  |
| `refreshFlightLabel` | `flight.refresh` | 항공편 다시 조회 |  |
| `changeFlightLabel` | `flight.change` | 다른 항공편 입력 |  |
| `timeSafeHeading` | `timeSafe.heading` | TIME-SAFE 계산 결과 |  |
| `statusRealtimeConn` | `timeSafe.liveDepartureApplied` | 출발편 실시간 반영 |  |
| `timeSafeNeedsFlight` | `timeSafe.needArrival` | 도착편을 조회하면 환승 시간이 여기에 표시돼요. |  |
| `timeSafeNeedsConnFlight` | `timeSafe.needConnection` | 연결편을 조회하면 환승 시간이 계산돼요. |  |
| `cannotGoOutTitle` | `timeSafe.cannotGoOut.title` | 외출 불가 |  |
| `cannotGoOutDesc` | `timeSafe.cannotGoOut.description` | 연결편까지 수속·게이트 마감 시간을 빼면 밖에 나갔다 올 여유가 없어요. 공항 안에서 대기해주세요. |  |
| `stayAvailable` | `timeSafe.outingAvailable` | 공항 밖 체류 가능 |  |
| `stayAvailableShort` | `timeSafe.outingAvailableShort` | 실제 체류 가능(버퍼 제외) |  |
| `arriveWord` | `timeSafe.arrive` | 도착 |  |
| `returnRecWord` | `timeSafe.returnBy` | 복귀 추천 |  |
| `returnRecommend` | `timeSafe.returnRecommended` | 공항 복귀 추천 |  |
| `totalConnTimeLbl` | `timeSafe.totalConnection` | 도착~출발 총 환승 시간 {dur} |  |
| `bufferAppliedNote` | `timeSafe.bufferNote` | 수속 {sec}분 + 게이트마감 {gate}분 = 총 {total}분 버퍼 반영(숙소→공항 이동시간은 일단 제외) | A7: 버퍼 3요소(입국심사 포함)와 불일치 |
| `securityWaitLiveBadge` | `timeSafe.liveSecurityWait` | 출국장 실시간 대기시간 반영(T1) |  |
| `pushNotice` | `timeSafe.pushScheduled` | 복귀 30분 전 푸시 알림 예약됨 | A7: 푸시 알림 기능 없음 |
| `greeting` | `home.greeting` | 안녕하세요, 여행자님! 👋 |  |
| `homeSub` | `home.subtitle` | 여유 시간에 딱 맞는 인천 코스를 준비했어요. |  |
| `sectionTimeFit` | `home.timeFit.title` | Time-Fit 추천 코스 |  |
| `sectionTimeFitSub` | `home.timeFit.subtitle` | 관심사별로 골라 환승 일정 자동 생성 |  |
| `homeBuildPrefix` | `home.timeFit.build.prefix` | 카테고리를 골라 |  |
| `homeBuildBold` | `home.timeFit.build.bold` | 나만의 환승 코스 |  |
| `homeBuildSuffix` | `home.timeFit.build.suffix` | 를 만들어보세요 |  |
| `makeBtn` | `home.timeFit.build.cta` | 만들기 |  |
| `sectionDayuse` | `home.dayuse.title` | 데이유즈 · 타임블록 예약 |  |
| `sectionDayuseSub` | `home.dayuse.subtitle` | 3–9시간 유연 예약 · 샤워/휴식 |  |
| `luggageCareTitle` | `home.luggageBanner.title` | 수하물 케어 (Luggage-Free) |  |
| `luggageCareSub` | `home.luggageBanner.subtitle` | 공항 보관 · 호텔/상권 배송 → 가볍게 이동 |  |
| `sectionLocal` | `home.hotPlaces.title` | 핫플레이스 |  |
| `sectionLocalSub` | `home.hotPlaces.subtitle` | 제휴 스팟 모아보기 |  |
| `featShower` | `dayuse.feature.shower` | 샤워 |  |
| `featRest` | `dayuse.feature.rest` | 휴식 |  |
| `featLuggage` | `dayuse.feature.luggage` | 짐보관 |  |
| `perBlock` | `dayuse.perBlock` | /블록 |  |
| `timeBlockWord` | `dayuse.timeBlock` | 타임블록 |  |
| `bookingTitle` | `booking.title` | 데이유즈 예약 |  |
| `bookingSub` | `booking.subtitle` | Day-use booking |  |
| `chooseTimeBlockLbl` | `booking.chooseTimeBlock` | 타임블록 선택 |  |
| `checkInSlotLbl` | `booking.chooseCheckIn` | 체크인 시각 선택 |  |
| `earliestCheckInNote` | `booking.earliestCheckIn` | 숙소까지 이동시간 고려 시 {time} 이후부터 체크인 가능 |  |
| `includesShowerRestLuggage` | `booking.includes` | 샤워·휴식·짐보관 포함 |  |
| `paymentDetails` | `booking.payment.title` | 결제 내역 |  |
| `totalPayment` | `booking.payment.total` | 총 결제금액 |  |
| `easyPayNote` | `booking.payment.methods` | 간편결제 · Alipay · WeChat Pay · Card |  |
| `payBtn` | `booking.payment.pay` | 결제하기 |  |
| `planSummaryTitle` | `booking.plan.title` | 예약에 포함된 일정 |  |
| `planSummaryCount` | `booking.plan.count` | 코스 빌더에서 담은 {n}개 활동 |  |
| `checkoutPastReturnWarning` | `booking.checkoutPastReturn` | 체크아웃이 복귀 추천 시각({time}) 이후예요. 실제로는 그 전에 나와야 해요. |  |
| `noBookingsYet` | `booking.empty` | 아직 예약 내역이 없어요 |  |
| `browseRoomsBtn` | `booking.browseStays` | 숙소 보러가기 |  |
| `confirmTitle` | `confirm.title` | 예약 확인 |  |
| `confirmSub` | `confirm.subtitle` | My booking |  |
| `bookingComplete` | `confirm.complete` | 예약 완료 |  |
| `bookingNumber` | `confirm.bookingNumber` | 예약번호 |  |
| `lodgingLbl` | `confirm.stay` | 숙소 |  |
| `includedLbl` | `confirm.included` | 포함 |  |
| `confirmIncludedVal` | `confirm.includedValue` | 샤워 · 휴식 · 짐보관 |  |
| `confirmReturnAt` | `confirm.returnAt` | 복귀 {time} |  |
| `alertOnLbl` | `confirm.alertOn` | 알림 ON |  |
| `luggageTitle` | `luggage.title` | 수하물 케어 |  |
| `luggageSub` | `luggage.subtitle` | Luggage-Free |  |
| `luggageBannerPrefix` | `luggage.banner.prefix` | 무거운 캐리어는 맡기고 |  |
| `luggageBannerBold` | `luggage.banner.bold` | 가볍게 |  |
| `luggageBannerSuffix` | `luggage.banner.suffix` | 이동하세요. 항공편 복귀 시간에 맞춰 짐을 공항으로 되돌려 드립니다. |  |
| `luggageOpt1Title` | `luggage.option.inAirport.title` | 공항 내 보관 |  |
| `luggageOpt1Desc` | `luggage.option.inAirport.description` | T1 · T2 스마트 락커 즉시 보관 |  |
| `luggageOpt2Title` | `luggage.option.toHotel.title` | 호텔로 배송 |  |
| `luggageOpt2Desc` | `luggage.option.toHotel.description` | 데이유즈 숙소로 짐 픽업·배송 |  |
| `luggageOpt3Title` | `luggage.option.toDistrict.title` | 상권으로 배송 |  |
| `luggageOpt3Desc` | `luggage.option.toDistrict.description` | 영종도·차이나타운 거점 수령 |  |
| `myPageTitle` | `my.title` | 마이 페이지 |  |
| `myPageSub` | `my.subtitle` | My page |  |
| `myPageGreeting` | `my.greeting` | 안녕하세요, 여행자님! |  |
| `bookingCountLabel` | `my.bookingCount` | 예약 {n}건 |  |
| `menuBookingHistory` | `my.menu.bookingHistory` | 예약 내역 |  |
| `menuCoupon` | `my.menu.coupons` | 쿠폰 |  |
| `menuTimeSafeAlert` | `my.menu.timeSafeAlerts` | Time-Safe 알림 |  |
| `menuPassport` | `my.menu.passport` | 여권 인증 |  |
| `menuLangSetting` | `my.menu.language` | 언어 설정 |  |
| `courseTitle` | `course.title` | 환승 코스 만들기 |  |
| `courseSub` | `course.subtitle` | 카테고리 → 장소 선택 → 일정 자동 생성 |  |
| `layoverFree` | `course.budget.hours` | 환승 여유 {h}시간 |  |
| `overBudget` | `course.budget.over` | {min}분 초과 |  |
| `spareBudget` | `course.budget.spare` | 여유 {min}분 |  |
| `arriveReturnLine` | `course.budget.arriveReturn` | 도착 {arrive} · 복귀 추천 {return} |  |
| `step1RoomTitle` | `course.room.title` | ① 데이유즈 숙소 선택 |  |
| `step1RoomRequired` | `course.room.required` | (필수 · 코스의 거점) |  |
| `step2CatTitle` | `course.category.title` | ② 활동 카테고리 합치기 |  |
| `step2CatSub` | `course.category.note` | (복수 선택) |  |
| `autoBuildBtn` | `course.autoBuild.cta` | Time-Fit 자동 코스 짜기 |  |
| `autoBuildNote` | `course.autoBuild.note` | OR-Tools 최적화 · 환승시간·이동동선 기준 자동 배치 | A7: OR-Tools 최적화라고 하지만 실제는 탐욕법 |
| `sectionVisitPlaces` | `course.places.title` | 활동 방문지 |  |
| `selCombined` | `course.places.combined` | {list} 합침 |  |
| `selChoose` | `course.places.chooseCategory` | 카테고리를 선택하세요 |  |
| `selChooseRoomFirst` | `course.places.chooseRoomFirst` | 먼저 숙소를 선택하세요 |  |
| `roomFirstHint` | `course.places.roomFirstHint` | ① 데이유즈 숙소를 먼저 선택하면 활동을 담을 수 있어요. |  |
| `fitsInTransit` | `course.places.fits` | 환승 내 가능 |  |
| `tightTime` | `course.places.tight` | 시간 빠듯 |  |
| `addToPlanBtn` | `course.places.add` | 일정에 추가 |  |
| `sectionMySchedule` | `course.schedule.title` | 내 환승 일정 |  |
| `scheduleSummary` | `course.schedule.summary` | {n}개 활동 · 총 {h}시간 {m}분 | 요약 표기 '사용 X / 가용 Y'로 교체 예정(STATUS 확인 필요) |
| `scheduleEmptyHint` | `course.schedule.emptyHint` | 숙소를 선택하면 일정이 생성돼요 |  |
| `pickRoomPrefix` | `course.schedule.pickRoom.prefix` | 데이유즈 숙소를 |  |
| `pickRoomBold` | `course.schedule.pickRoom.bold` | 거점 |  |
| `pickRoomSuffix` | `course.schedule.pickRoom.suffix` | 으로 먼저 골라주세요. |  |
| `overBudgetWarning` | `course.schedule.overWarning` | 환승 시간을 {min}분 초과했어요. 장소를 줄이거나 짧은 코스로 바꿔보세요. |  |
| `bookThisRoomBtn` | `course.bookThisStay` | 이 숙소로 예약하기 → |  |
| `saveCourseBtn` | `course.save` | 코스 저장하기 |  |
| `courseStepArrive` | `course.step.arrive.title` | 공항 도착 · 짐 맡기기 |  |
| `courseStepArriveSub` | `course.step.arrive.sub` | 수하물 케어 픽업 |  |
| `courseStepRoomCheckin` | `course.step.checkIn.title` | {room} 체크인 |  |
| `courseStepRoomSub` | `course.step.checkIn.sub` | 데이유즈 거점 · 짐 보관·샤워 가능 (이동 {move}분) |  |
| `courseStepPlaceSub` | `course.step.place.sub` | {area} · 체류 {dur}분 (이동 {move}분) |  |
| `courseStepPlaceSubNoDur` | `course.step.place.subNoStay` | {area} (이동 {move}분) |  |
| `courseStepReturn` | `course.step.return.title` | 공항 복귀 |  |
| `courseStepReturnSub` | `course.step.return.sub` | Time-Safe 알림 · 여유 30분 | A7: '여유 30분' 계산 없음 |
| `mapPickRoomNote` | `course.map.pickRoomNote` | 지도에 제휴 데이유즈 숙소가 전부 핀으로 떠요 · 핀을 탭하면 그 숙소가 바로 선택돼요 |  |
| `mapAllPlacesNote` | `course.map.allPlacesNote` | 숙소 주변 실제 음식점·카페·편의점·마트·관광명소·뷰티(올리브영 등)가 작은 점으로 떠요(지도를 확대해야 나타나요) · 점을 탭하면 정보가 뜨고 거기서 일정에 추가/제거 · 이미 담긴 곳은 순번이 붙은 큰 핀으로 표시 · 병원·약국은 확대 시 참고용 점으로만 표시(일정에는 안 담김) |  |
| `routeLegend` | `course.map.routeLegend` | 선 위 숫자·색이 방문 순서(핀 번호와 동일) · 선 모양은 이동수단: ●●● 자동차 · ┄┄ 도보 · ⋯⋯ 대중교통 |  |
| `mapUnavailable` | `course.map.unavailable` | 지도를 불러올 수 없어요. 이 도메인이 카카오 개발자 콘솔에 등록됐는지 확인해주세요. |  |
| `poiRefOnly` | `course.map.referenceOnly` | 참고용 · 일정에는 추가할 수 없어요 |  |
| `routeLoading` | `course.route.loading` | 실제 이동시간 조회 중… |  |
| `routeLive` | `course.route.live` | 실제 이동시간(도보·대중교통·자동차) 반영중 |  |
| `savedCourseTitle` | `savedCourse.title` | 저장된 코스 |  |
| `savedCourseSub` | `savedCourse.subtitle` | Saved course |  |
| `editCourseBtn` | `savedCourse.edit` | 수정하기 |  |
| `noSavedCourseMsg` | `savedCourse.empty` | 아직 저장된 코스가 없어요 |  |
| `CAT_LABELS.Food` | `category.food` | 맛집 | |
| `CAT_LABELS.Massage` | `category.massage` | 마사지 | |
| `CAT_LABELS.Shopping` | `category.shopping` | 쇼핑 | |
| `CAT_LABELS.Rest` | `category.rest` | 휴식 | |
| `CAT_LABELS.Beauty` | `category.beauty` | 뷰티 | |
| `CAT_LABELS.Sightseeing` | `category.sightseeing` | 관광 | |
| `CAT_LABELS.Brand` | `category.brand` | 브랜드 | |
