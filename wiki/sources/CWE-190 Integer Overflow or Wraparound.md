---
title: CWE-190 Integer Overflow or Wraparound
aliases: ["CWE-190: Integer Overflow or Wraparound", CWE-190, CWE 정수 오버플로, MITRE CWE-190]
summary: "계산 결과가 정수 표현 범위를 넘어 매우 작거나 음수인 값으로 바뀌어 할당·인덱스·권한·루프 제어를 잘못 만들 수 있는 정수 오버플로 또는 래핑 약점을 정리한 MITRE CWE 항목."
tags: [type/reference, domain/security, domain/software-engineering, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2026
historical_note: "확인한 현재 CWE 항목은 CWE 4.20(2026-04-30) 판본이다. 언어별 실제 오버플로 의미는 별도 언어 명세와 함께 읽어야 한다."
historical_layer: measurement
capability_layers: [reliable-results]
sources: [CWE-190 Integer Overflow or Wraparound]
source_id: ref-091
source_kind: external
primary_sources: ["MITRE, CWE-190: Integer Overflow or Wraparound, CWE 4.20"]
supporting_sources: ["MITRE Common Weakness Enumeration current catalog"]
source_urls: ["https://cwe.mitre.org/data/definitions/190.html"]
retrieved: 2026-07-25
version: "CWE 4.20"
snapshot_status: external-only
status: active
graph_id: reference-cwe-190-integer-overflow
graph_visibility: public
---

## 개요

[[CWE-190 Integer Overflow or Wraparound]]은 계산 결과가 관련 정수 표현에 저장하기에 너무 커져 오버플로 또는 래핑이 생기는데도, 프로그램 논리가 결과가 원래 값보다 커질 것이라고 가정하는 약점을 다룬다. 결과가 매우 작은 값이나 음수가 되면 길이·개수·오프셋·할당 크기·권한 한계·루프 조건이 의도와 다른 의미를 갖게 될 수 있다.

이 항목은 메모리 할당 크기 계산이 작은 값으로 변해 부족한 버퍼를 만들고, 이후 코드가 원래 큰 개수만큼 접근하는 연결을 예시로 든다. 따라서 정수 오버플로는 계산 정확성 문제에만 그치지 않고 서비스 거부, 데이터 손상, 메모리 경계 위반, 접근 제어 우회로 이어질 수 있다.

## 검증할 값과 계산할 값

수치 입력은 최솟값과 최댓값을 모두 포함한 기대 범위에서 검증해야 한다. 하지만 입력값 하나가 범위 안이라고 해서 `개수 × 항목 크기`, `오프셋 + 길이`, 형 변환·부호 확장처럼 **파생된 값**도 안전하다는 뜻은 아니다. 연산이 일어나기 전에 결과 범위를 확인하거나, 더 넓은 표현·checked arithmetic·명시적인 오류 경로를 사용해야 한다.

부호 없는 타입을 쓴다고 보안 문제가 사라지지도 않는다. 어떤 언어·타입은 범위 초과를 정의된 모듈러 연산으로 다루고, 다른 경우는 정의되지 않았거나 예외가 될 수 있다. [[C Integer and Shift Semantics]]는 C의 unsigned 래핑과 signed overflow의 정의되지 않은 동작을 구분한다. CWE-190의 언어 일반적인 약점 설명과 C의 실제 의미론을 함께 보아야 한다.

## 탐지와 완화의 경계

정적 분석과 다양한 큰 입력을 주는 동적 시험·퍼징은 오버플로 가능성을 찾는 데 도움이 될 수 있다. 그러나 숫자 단위, 자료형 변환, 최대 입력, 메모리·프로토콜 한계, 오류 처리의 업무 의미는 설계·코드 검토에서 확인해야 한다. 검사 한 번을 통과한 수치를 다른 폭·부호·단위로 다시 해석하면 검증 경계가 끊어진다.

## 인용할 만한 구절

> “Integer Overflow or Wraparound”

표현 범위를 넘는 계산이 값의 의미를 바꾸는 약점의 이름 자체를 간결하게 보여 준다.

## 위키 반영

이 자료는 [[정수 오버플로]]에서 범위 검사가 할당·인덱스·오프셋 계산 전후에 모두 필요한 이유를 보강한다. [[입력 검증]]과 [[입력을 해석하는 경계는 왜 보안 경계인가]]에는 입력값·파생값·타입 변환을 같은 계약 안에서 점검해야 하는 연결로 반영한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[정수 오버플로]] | 표현 범위를 넘은 계산이 할당 크기·루프·권한 결정과 메모리 경계 오류로 이어질 수 있는 약점 경로를 제공한다. | [[CWE-190 Integer Overflow or Wraparound]] |
| constrains | [[입력 검증]] | 수치 입력의 범위뿐 아니라 곱셈·덧셈·변환으로 생긴 길이·오프셋·할당 크기의 범위도 확인하게 한다. | [[CWE-190 Integer Overflow or Wraparound]] |

## 출처

- MITRE, [CWE-190: Integer Overflow or Wraparound](https://cwe.mitre.org/data/definitions/190.html)

## 관련 항목

- [[정수 오버플로]] — C의 signed·unsigned 의미론과 저수준 위험을 구분한다.
- [[입력 검증]] — 입력과 파생된 수치의 범위를 소비 전 확인한다.
- [[C 문자열]] — 길이·버퍼 경계가 실제 메모리 접근 의미를 결정하는 표현이다.
- [[메모리 안전성]] — 잘못된 할당 크기와 인덱스가 경계 위반으로 이어지는 결과를 다룬다.
- [[입력을 해석하는 경계는 왜 보안 경계인가]] — 수치 변환과 텍스트 해석을 공통 경계 문제로 종합한다.
