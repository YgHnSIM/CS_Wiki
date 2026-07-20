---
title: Excel formula recalculation and dependencies
aliases: [Excel recalculation, Excel formula dependencies, Excel 수식 재계산과 의존 관계]
summary: "Excel의 선행·종속 셀, 자동·수동 재계산, 순환 참조, 상대·절대 참조와 수치 정밀도를 설명해 현대 스프레드시트의 실행 구조와 오류 경계를 정리하는 공식 문서 묶음."
tags: [type/reference, domain/software-engineering, domain/mathematics, status/draft]
created: 2026-07-20
updated: 2026-07-20
historical_layer: software
capability_layers: [programmability, reliable-results]
sources: ["Microsoft Support - Change formula recalculation, iteration, or precision in Excel", "Microsoft Support - Display the relationships between formulas and cells", "Microsoft Support - Switch between relative, absolute, and mixed references"]
source_id: ref-062
source_kind: external
primary_sources: ["Microsoft Support - Change formula recalculation, iteration, or precision in Excel", "Microsoft Support - Display the relationships between formulas and cells", "Microsoft Support - Switch between relative, absolute, and mixed references"]
supporting_sources: []
source_urls: ["https://support.microsoft.com/en-US/Excel/change-formula-recalculation-iteration-or-precision-in-excel", "https://support.microsoft.com/en-us/excel/display-the-relationships-between-formulas-and-cells", "https://support.microsoft.com/en-us/excel/switch-between-relative-absolute-and-mixed-references"]
retrieved: 2026-07-20
version: "Microsoft 365 / Excel 2024 / Excel 2021 documentation, retrieved 2026-07-20"
snapshot_status: external-only
status: draft
---

## 자료 개요

[[Excel formula recalculation and dependencies]]는 Microsoft가 제공하는 세 공식 지원 문서를 묶어, 현대 [[스프레드시트]]에서 수식이 셀을 참조하고 변경이 관련 결과로 전파되는 구조를 정리한 참고 자료다. 이 묶음은 VisiCalc의 역사를 재구성하는 근거가 아니라, 오늘날 널리 쓰이는 스프레드시트가 재계산·참조·정밀도를 어떻게 사용자에게 노출하는지 설명하는 근거다.

## 선행 셀과 종속 셀

Microsoft는 다른 셀의 수식에서 참조되는 셀을 선행 셀(precedent), 그 값을 참조하는 수식을 가진 셀을 종속 셀(dependent)로 설명한다. 사용자는 추적 화살표를 통해 수식이 어디에서 값을 받고 어느 결과에 영향을 주는지 일부 확인할 수 있다.

이 용어는 격자 뒤에 계산 의존 관계가 있음을 드러낸다. 화면에서 셀이 가까이 있다고 계산상 연결된 것은 아니며, 멀리 있거나 다른 시트·통합 문서에 있는 셀도 수식으로 연결될 수 있다. 따라서 표의 시각적 배치만 보고 영향 범위를 판단하면 숨은 의존 관계를 놓칠 수 있다.

## 자동·수동 재계산

Excel은 기본적으로 수식이 의존하는 값이 바뀌면 관련 수식을 자동 재계산한다. 계산 모드를 수동으로 바꾸면 사용자가 재계산을 지시할 때까지 화면에 이전 결과가 남을 수 있다. 자동 모드에서도 외부 연결, 데이터 테이블과 기능별 조건에 따라 갱신 방식이 달라질 수 있다.

재계산은 모델의 일관성을 유지하는 실행 메커니즘이지 수식의 타당성을 판정하는 검증기는 아니다. 잘못된 참조나 잘못 세운 공식도 규칙대로 빠르게 다시 계산된다. 수동 모드의 오래된 값은 수식 자체가 맞더라도 현재 입력과 일치하지 않는 결과를 보여 줄 수 있다.

## 순환 참조와 반복 계산

수식이 직접 또는 간접으로 자기 자신에 되돌아오면 순환 참조가 생긴다. 반복 계산을 의도적으로 켤 수 있지만 종료 조건과 허용 오차가 적절하지 않으면 계산이 끝나지 않거나 기대와 다른 근사값에 멈출 수 있다.

이는 스프레드시트가 단순한 문서가 아니라 실행 순서와 수렴 조건을 가진 계산 환경임을 보여 준다. 종이 표의 잘못된 숫자와 달리 오류가 하나의 셀에 고정되지 않고 의존 관계를 따라 전파되거나 반복될 수 있다.

## 상대·절대·혼합 참조

상대 참조는 수식을 다른 위치에 복사할 때 행과 열이 함께 이동하고, 절대 참조는 `$` 표시로 특정 행이나 열을 고정한다. 혼합 참조는 둘 가운데 하나만 고정한다. 이 기능은 하나의 수식을 여러 항목과 기간에 재사용하게 하지만, 고정해야 할 기준을 놓치면 복사된 수식 전체가 잘못된 위치를 참조할 수 있다.

## 수치 정밀도와 표시값

공식 문서는 Excel이 숫자를 제한된 유효 자릿수로 저장하고 계산하며, 화면에 표시된 자릿수와 내부 저장값이 다를 수 있음을 설명한다. 표시된 정밀도로 계산하는 선택은 저장값 자체를 바꿀 수 있으므로 되돌릴 수 없는 정밀도 손실을 일으킬 수 있다.

따라서 스프레드시트 결과를 검토할 때는 수식뿐 아니라 숫자 표현, 반올림·표시 형식과 재계산 모드도 확인해야 한다. 보이는 표가 같아도 내부 수식과 저장값, 계산 설정이 다르면 같은 계산 모형이라고 할 수 없다.

## 해석상 주의점

- 이 페이지는 접근일에 확인한 Microsoft 365·Excel 2024·Excel 2021 지원 문서를 정리한다. 이후 제품 동작이나 문서 범위가 바뀔 수 있다.
- Excel의 구체적 기능을 모든 스프레드시트 프로그램에 일반화하지 않는다.
- 의존 관계 추적 도구가 모든 외부·동적 참조를 완전하게 시각화한다고 가정하지 않는다.
- 자동 재계산과 오류 표시는 수식의 목적·단위·현실 가정이 옳다는 보장이 아니다.

## 위키 반영

이 자료는 [[스프레드시트]]의 의존 관계, 수식 복사와 재계산을 설명하고, [[수학 표에서 스프레드시트로]]에서 오류가 잘못 인쇄된 값에서 잘못된 수식·참조·의존 관계·계산 상태로 이동한 과정을 분석하는 근거로 사용한다.

## 출처

- Microsoft Support, [Change formula recalculation, iteration, or precision in Excel](https://support.microsoft.com/en-US/Excel/change-formula-recalculation-iteration-or-precision-in-excel).
- Microsoft Support, [Display the relationships between formulas and cells](https://support.microsoft.com/en-us/excel/display-the-relationships-between-formulas-and-cells).
- Microsoft Support, [Switch between relative, absolute, and mixed references](https://support.microsoft.com/en-us/excel/switch-between-relative-absolute-and-mixed-references).

## 관련 항목

- [[VisiCalc Apple II Version 1.0 Manual]]
- [[DLMF Standard Reference Tables on Demand]]
