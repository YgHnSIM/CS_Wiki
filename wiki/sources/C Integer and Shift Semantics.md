---
title: C Integer and Shift Semantics
aliases: [C 정수와 시프트 의미론, C integer overflow rules, WG14 integer semantics]
summary: "WG14 문서를 바탕으로 C의 unsigned 래핑, signed overflow, 시프트 연산 조건을 정리한 참고 자료."
tags: [type/reference, domain/programming-languages, domain/systems, domain/security, status/active]
created: 2026-07-10
updated: 2026-07-22
sources: ["WG14 N1570", "WG14 N2817"]
source_id: ref-029
source_kind: external
primary_sources: ["WG14 N1570 Committee Draft — ISO/IEC 9899:201x"]
supporting_sources: ["WG14 N2817 — Can Signed Integers Overflow?"]
source_urls: ["https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf", "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n2817.pdf"]
retrieved: 2026-07-10
version: "N1570 / N2817"
snapshot_status: external-only
status: active
publication_year: 2011
historical_note: "주요 직접 근거인 WG14 N1570 공개 위원회 초안의 발행 연도다."
---

## 개요

[[C Integer and Shift Semantics]]는 C의 정수 산술과 비트 시프트를 설명할 때 필요한 WG14 문서를 묶은 참고 자료다. N1570은 C11 최종 표준에 가까운 공개 위원회 초안이며, N2817은 부호 있는 정수와 부호 없는 정수의 범위 초과 결과를 구분해 설명한다.

## 주요 인사이트

- C의 부호 없는 정수 산술은 `2^N`을 법으로 하는 산술을 따르므로 범위를 넘는 결과가 래핑된다.
- 표현 가능한 범위를 벗어난 부호 있는 정수 산술 결과는 일반적으로 정의되지 않은 동작이다.
- 시프트 연산은 정수 승격 뒤 피연산자 타입, 값의 부호, 시프트 횟수, 표현 가능 범위에 영향을 받는다.
- 시프트 횟수가 음수이거나 승격된 왼쪽 피연산자의 비트 폭 이상이면 동작이 정의되지 않는다.
- 비트 추출과 마스킹에서는 부호 없는 타입과 명시적 범위 검사를 사용해야 의도를 명확하게 보존할 수 있다.

## 위키 반영

이 자료는 [[비트 연산]]의 곱셈·나눗셈 비유에 필요한 조건을 명시하고, [[정수 오버플로]]에서 unsigned wrapping과 signed undefined behavior를 구분하는 근거로 사용한다.

## 출처

- ISO/IEC JTC1/SC22/WG14, [N1570 Committee Draft — Programming Languages — C](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf)
- ISO/IEC JTC1/SC22/WG14, [N2817 — Can Signed Integers Overflow?](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n2817.pdf)

## 관련 항목

- [[C 언어]]
- [[비트 연산]]
- [[정수 오버플로]]
- [[데이터 표현]]
- [[메모리 안전성]]
