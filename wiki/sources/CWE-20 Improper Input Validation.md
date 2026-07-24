---
title: CWE-20 Improper Input Validation
aliases: ["CWE-20: Improper Input Validation", CWE-20, CWE 입력 검증, MITRE CWE-20]
summary: "입력이 안전하고 올바르게 처리되기 위해 필요한 속성을 검증하지 않거나 잘못 검증하는 약점을, 입력 형식·길이·타입·범위·일관성·도메인 규칙의 경계로 정리한 MITRE CWE 항목."
tags: [type/reference, domain/security, domain/software-engineering, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2026
historical_note: "확인한 현재 CWE 항목은 CWE 4.20(2026-04-30) 판본이다. CWE는 계속 갱신되는 약점 분류 체계이므로 특정 판본의 용어와 권고를 기록한다."
historical_layer: measurement
capability_layers: [reliable-results]
sources: [CWE-20 Improper Input Validation]
source_id: ref-090
source_kind: external
primary_sources: ["MITRE, CWE-20: Improper Input Validation, CWE 4.20"]
supporting_sources: ["MITRE Common Weakness Enumeration current catalog"]
source_urls: ["https://cwe.mitre.org/data/definitions/20.html"]
retrieved: 2026-07-25
version: "CWE 4.20"
snapshot_status: external-only
status: active
graph_id: reference-cwe-20-input-validation
graph_visibility: public
---

## 개요

[[CWE-20 Improper Input Validation]]은 제품이 입력이나 데이터를 받았지만, 그 데이터를 안전하고 올바르게 처리하는 데 필요한 속성을 검증하지 않거나 잘못 검증하는 약점을 정리한 MITRE CWE 항목이다. 이 항목은 단일 언어의 버그가 아니라 입력이 내부 표현·연산·권한 결정으로 넘어가는 경계의 계약 문제를 다룬다.

검증 대상은 단순 문자열 형식만이 아니다. 지정된 길이·개수·빈도·가격·시간 같은 수치, 실제 파일 크기처럼 추론한 속성, 인덱스·오프셋, 타입, 문법, 필드 사이의 일관성, 업무 규칙, 동등성, 출처·소유 증명까지 포함될 수 있다. 입력이 네트워크 요청뿐 아니라 파일, 환경 변수, 헤더, 데이터베이스 결과, 외부 API에서 간접적으로 들어올 수도 있다는 점도 명시한다.

## 검증과 다른 조치의 구분

이 항목에서 입력 검증은 입력이 이미 기대한 명세에 맞는지를 확인하는 좁은 의미다. 위험한 문자를 제거하는 필터링, 다른 구성요소가 오해하지 않도록 출력에 맞춰 이스케이프·인코딩하는 조치, 여러 표현을 하나로 바꾸는 정규화·정준화는 관련되지만 같은 작업이 아니다.

예를 들어 식별자 정책이 정규화된 표현을 기준으로 한다면, 어느 시점에 디코드·정규화하고 어느 표현을 검증·저장·권한 확인에 사용할지를 일관되게 정해야 한다. 한 표현을 검사한 뒤 다른 표현을 소비하면 검증과 해석의 경계가 다시 갈라질 수 있다. [[유니코드 정규화]]와 [[동형이의 문자]]는 이 문제를 텍스트에, [[정수 오버플로]]는 수치와 메모리 크기에 드러낸다.

## 허용 목록과 세부 원인

CWE는 허용된 명세에 맞는 입력을 받아들이는 accept-known-good 전략을 권한다. 단순 차단 목록만으로는 환경·파서·표현이 바뀔 때 놓치는 입력이 생기기 쉽다. 다만 CWE-20은 매우 높은 수준의 Class 항목이므로, 구체적인 취약점을 기록할 수 있을 때는 길이·타입·인덱스·동등성 같은 더 구체적인 하위 약점이나 실제 원인을 선택해야 한다.

입력이 형식에 맞는다고 해서 사용자가 그 값을 사용할 권한이 있거나, 출력 맥락에서 안전하다는 뜻도 아니다. 인증·인가, 자원 제한, 오류 처리, 출력 이스케이프는 검증 뒤에도 따로 유지해야 하는 계약이다.

## 인용할 만한 구절

> “accept known good”

정의된 명세에 맞는 입력을 받아들이고 나머지를 거부하는 검증 전략을 압축한다.

## 위키 반영

이 자료는 [[입력 검증]]에서 디코드·파싱·정규화·검증·인가·출력 처리를 구분하는 직접 근거다. [[입력을 해석하는 경계는 왜 보안 경계인가]]에서는 Unicode 텍스트와 C의 길이·정수 연산이 같은 “검증한 표현과 소비한 표현이 같은가”라는 질문으로 만나는 과정을 분석한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[입력 검증]] | 입력의 길이·타입·문법·범위·일관성·도메인 규칙을 소비 경계 전에 확인해야 하는 범위를 제공한다. | [[CWE-20 Improper Input Validation]] |
| constrains | [[입력을 해석하는 경계는 왜 보안 경계인가]] | 검증·필터링·출력 인코딩·정준화를 하나의 동의어로 합치지 않고, 각 단계의 원인과 소비 표현을 구분하게 한다. | [[CWE-20 Improper Input Validation]] |

## 출처

- MITRE, [CWE-20: Improper Input Validation](https://cwe.mitre.org/data/definitions/20.html)

## 관련 항목

- [[입력 검증]] — 입력 계약을 해석·검증·권한·출력 처리와 구분해 정리한다.
- [[유니코드 정규화]] — 동등성 정책이 필요한 텍스트 표현을 정한다.
- [[동형이의 문자]] — 정규화만으로 해결되지 않는 시각적 식별자 혼동을 다룬다.
- [[정수 오버플로]] — 수치 범위와 파생된 크기를 잘못 검증할 때 생기는 경계 오류다.
- [[입력을 해석하는 경계는 왜 보안 경계인가]] — 텍스트·수치·메모리 경계를 종합한다.
