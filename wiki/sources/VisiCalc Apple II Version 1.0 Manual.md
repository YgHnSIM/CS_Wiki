---
title: VisiCalc Apple II Version 1.0 Manual
aliases: [VisiCalc manual, VisiCalc 매뉴얼, VisiCalc Apple II 매뉴얼]
summary: "셀에 값과 수식을 함께 두고 입력 변경 시 관련 수식을 자동 재계산하는 VisiCalc의 작동을 설명하며, 개인용 컴퓨터용 전자 스프레드시트의 역사적 전환을 보여 주는 1979년 원 매뉴얼 자료."
tags: [type/reference, domain/computer-history, domain/software-engineering, status/draft]
created: 2026-07-20
updated: 2026-07-20
publication_year: 1979
event_start: 1979
historical_note: "Software Arts가 개발하고 Personal Software가 1979년 Apple II용으로 배포한 VisiCalc Version 1.0 매뉴얼과 동시대 제품의 기관 기록을 함께 대조한다."
historical_layer: software
capability_layers: [programmability, resource-efficiency]
sources: ["VisiCalc Apple II Version 1.0 Manual", "Dan Bricklin's VisiCalc archive", "Computer History Museum VisiCalc records", "Smithsonian VisiCalc object record"]
source_id: ref-061
source_kind: external
primary_sources: ["VisiCalc Apple II Version 1.0 Manual"]
supporting_sources: ["Dan Bricklin's VisiCalc archive", "Computer History Museum VisiCalc records", "Smithsonian VisiCalc object record"]
source_urls: ["https://mirrors.apple2.org.za/ftp.apple.asimov.net/documentation/applications/misc/personalsoftware_visicalc_v1.0_manual_ocr.pdf", "https://www.bricklin.com/visicalc.htm", "https://computerhistory.org/events/origins-impact-visicalc/", "https://computerhistory.org/profile/bob-frankston/", "https://www.si.edu/object/software-and-documentation-software-arts-inc-visicalc%3Anmah_1696121"]
retrieved: 2026-07-20
version: "Apple II Version 1.0, 1979"
snapshot_status: external-only
status: draft
---

## 자료 개요

[[VisiCalc Apple II Version 1.0 Manual]]은 Software Arts가 개발하고 Personal Software가 배포한 Apple II용 VisiCalc의 사용 설명서다. 매뉴얼은 화면을 행과 열로 나눈 뒤 각 위치에 레이블, 숫자값 또는 수식을 입력하고, 수식에서 다른 위치를 참조하는 방법을 설명한다.

이 자료가 보여 주는 핵심 변화는 표 안에 완성된 값만 저장하지 않는다는 점이다. 셀에는 입력값과 결과값뿐 아니라 결과를 만드는 수식도 들어간다. 참조된 값이 바뀌면 관련 수식을 다시 계산하므로, 같은 격자는 읽는 문서인 동시에 실행되는 계산 모형이 된다.

## 값과 수식이 공존하는 셀

매뉴얼은 입력 항목을 레이블(label), 값(value), 수식(formula)으로 구분한다. 수식은 다른 셀의 좌표를 피연산자로 사용할 수 있다. 예를 들어 한 셀에 원금이나 매출을 넣고 다른 셀에 그 좌표를 참조하는 비율식을 두면, 화면은 단순한 결과 목록이 아니라 입력과 계산 규칙의 연결을 표현한다.

셀 주소는 데이터가 놓인 장소인 동시에 수식이 다른 값을 찾는 인터페이스다. 사용자는 별도의 프로그래밍 언어 파일보다 표의 공간 배치 안에서 계산 관계를 작성하고 확인한다. 다만 위치가 의미를 대신하므로 행·열을 삽입하거나 수식을 복사할 때 참조가 의도대로 유지되는지 검토해야 한다.

## 수식과 자동 재계산

매뉴얼의 “Formulas and Recalculation” 절은 한 셀의 값이 바뀌면 그 셀을 참조하는 수식의 결과가 자동으로 갱신되는 예를 제시한다. 이 동작은 사용자가 모든 결과를 손으로 다시 계산하거나 새 표를 인쇄하지 않고도 가정을 바꾸어 결과를 비교하게 한다.

따라서 VisiCalc의 표는 계산 결과를 미리 저장한 전통적인 [[수학 표]]와 다른 시간 구조를 갖는다. 전통적인 계산표는 제작자가 사용 전에 값을 계산하지만, 스프레드시트는 사용자가 입력을 바꿀 때 저장된 수식을 다시 실행한다. 계산 비용은 중앙의 표 제작 단계에서 사용자의 상호작용 시점으로 이동한다.

## 복사와 반복 계산

VisiCalc는 수식과 값의 행·열 반복을 지원해 비슷한 계산을 여러 기간이나 항목에 적용하게 한다. 이는 하나의 계산 규칙을 표의 다른 위치에 재사용하는 기능이다. 그러나 복사는 수식의 의미가 아니라 셀 참조 규칙을 기계적으로 적용하므로, 잘못된 기준 위치나 누락된 항목도 빠르게 확산시킬 수 있다.

## 역사적 범위

Computer History Museum은 Dan Bricklin과 Bob Frankston이 만든 VisiCalc를 개인용 컴퓨터용 최초의 전자 스프레드시트 프로그램으로 설명하고, Smithsonian의 소장품 기록은 Apple II/II Plus용 제품과 1979년 배포 정보를 확인한다. 이 표현을 전자식 표 계산 시스템 전체를 포괄하는 “모든 스프레드시트의 최초”라는 주장으로 넓혀서는 안 된다.

VisiCalc가 고대나 인쇄 수학 표에서 직접 기술적으로 파생되었다고 단정할 근거도 없다. 역사적으로 비교할 수 있는 것은 행·열과 위치를 이용해 값을 조직하는 인터페이스의 연속성과, 완성된 값을 읽는 표에서 수식을 실행하는 표로 바뀐 기능적 차이다.

## 해석상 주의점

- 1979년 매뉴얼은 해당 판본의 작동을 보여 주며 오늘날 모든 스프레드시트의 기능을 대표하지 않는다.
- “개인용 컴퓨터용 최초의 전자 스프레드시트”라는 기관 기록의 범위를 “최초의 모든 스프레드시트 시스템”으로 넓히지 않는다.
- 자동 재계산은 입력 변경을 결과에 전파하지만 수식이 옳다는 사실을 검증하지 않는다.
- 표 형식의 유사성은 고대 수학 표에서 VisiCalc로 이어지는 직접 기술 계보의 증거가 아니다.

## 위키 반영

이 자료는 [[스프레드시트]]의 셀, 수식, 참조와 자동 재계산을 역사적 원문으로 설명한다. [[수학 표에서 스프레드시트로]]에서는 계산 결과를 배포하는 정적 표가 사용자가 계산 규칙을 작성하고 가정을 바꾸는 실행 환경으로 전환된 사례로 사용한다.

## 출처

- Personal Software / Software Arts, [VisiCalc Apple II Version 1.0 Manual](https://mirrors.apple2.org.za/ftp.apple.asimov.net/documentation/applications/misc/personalsoftware_visicalc_v1.0_manual_ocr.pdf), 1979.
- Dan Bricklin, [VisiCalc: The Early Days](https://www.bricklin.com/visicalc.htm).
- Computer History Museum, [The Origins and Impact of VisiCalc](https://computerhistory.org/events/origins-impact-visicalc/).
- Computer History Museum, [Bob Frankston](https://computerhistory.org/profile/bob-frankston/).
- Smithsonian Institution, [Software and documentation, Software Arts, Inc., VisiCalc](https://www.si.edu/object/software-and-documentation-software-arts-inc-visicalc%3Anmah_1696121).

## 관련 항목

- [[The History of Mathematical Tables: From Sumer to Spreadsheets]]
- [[Excel formula recalculation and dependencies]]
