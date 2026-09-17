---
schema_version: 2
id: concept-6a0c16a9841c87e8
kind: concept
title: ASCII
aliases:
  - American Standard Code for Information Interchange
  - 아스키
summary: 문자에 숫자 값을 대응시키는 7비트 문자 인코딩 표준이자 UTF-8 ASCII 범위 호환성의 기반.
domains:
  - computer-science
  - systems
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-05-12
updated: 2026-09-17
review:
  mode: attested
  revision: sha256:c28173cde6a86fd15339f42dd2037259f79d33a48024b1dbdac8e3b75816f1cd
  reviewed_at: 2026-09-17
  reviewed_by: grok
evidence_ids:
  - src-006
  - ref-022
  - ref-023
capability_layers:
  - reliable-results
history:
  layer: software
redirect_from:
  - /concepts/ascii/
---

## 개요

[[ASCII]]는 문자에 숫자 값을 대응시키는 초기 문자 인코딩 표준이다. 본래 128개 문자를 정의하는 7비트 체계이며, 8비트 바이트 환경에서는 보통 최상위 비트를 0으로 채워 저장한다.

## 비트 패턴

ASCII에서 대문자와 소문자의 차이는 값 32, 즉 `2^5` 위치의 비트 하나에 해당한다. 예를 들어 `A`는 65이고 `a`는 97이므로 둘의 차이는 32이다. 이 규칙은 문자 처리가 단순한 표의 조회를 넘어 비트 패턴의 규칙성을 활용할 수 있는 영역임을 보여준다.

## 한계

ASCII는 로마자 중심의 7비트 표준이므로 다른 언어의 문자나 이모지를 표현할 수 없다. 이러한 한계는 더 넓은 문자 집합과 인코딩 체계를 제공하는 [[유니코드]]가 필요해진 중요한 배경이다.

## UTF-8과의 관계

[[UTF-8]]은 ASCII 범위 `U+0000`부터 `U+007F`까지를 같은 한 바이트 값으로 표현한다. 그래서 순수 ASCII 텍스트는 그대로 유효한 UTF-8 텍스트이기도 하다. 다만 이 호환성은 ASCII 범위에만 해당하며, 한글이나 이모지처럼 ASCII 밖의 문자는 여러 바이트가 필요하다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[인코딩]] | 7비트 문자 집합으로 바이트와 문자의 대응을 고정한다. | [[데이터 표현과 인코딩]] |
| precedes | [[유니코드]] | 이후 코드 공간의 하위 호환 기준이 된다. | [[The Unicode Standard 17.0.0]] |

## 출처
<!-- wiki-v2:evidence-start -->
### 근거 ID
- `src-006`
- `ref-022`
- `ref-023`
<!-- wiki-v2:evidence-end -->

- [[데이터 표현과 인코딩]]
- [[The Unicode Standard 17.0.0]]
- [[RFC 3629 UTF-8]]

## 관련 항목

- [[인코딩]] — 정보를 매체와 목적에 맞는 기호·비트 체계로 변환하고, 디코딩 정책과 텍스트 처리 층위를 함께 다루는 과정.
- [[데이터 표현]] — 비트 패턴을 타입, 인코딩, 텍스트 분할 규칙에 따라 의미 있는 데이터로 조직하는 방식.
- [[비트와 바이트]] — 비트와 8비트 바이트를 중심으로 데이터 표현의 최소 단위와 해석 범위를 정리한 개념.
- [[유니코드]] — 다양한 문자와 기호를 코드 포인트, 인코딩 형식, 정규화, 텍스트 경계 문제로 포괄하는 문자 체계.
- [[UTF-8]] — Unicode scalar value를 1-4개의 8비트 코드 유닛으로 표현하는 ASCII 호환 가변 길이 인코딩.
