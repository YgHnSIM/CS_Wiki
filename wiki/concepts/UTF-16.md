---
title: UTF-16
aliases: [Unicode Transformation Format 16-bit, surrogate pair, 서로게이트 페어]
summary: "Unicode scalar value를 16비트 코드 유닛 하나 또는 surrogate pair 두 개로 표현하는 인코딩 형식."
tags: [type/concept, domain/computer-science, domain/text-processing, status/active]
created: 2026-07-10
updated: 2026-07-22
sources: ["The Unicode Standard 17.0.0", "WHATWG Encoding Standard"]
status: active
graph_id: concept-c854e2f6358212d1
---

## 개요

[[UTF-16]]은 [[Unicode scalar value]]를 16비트 [[코드 유닛]] 하나 또는 두 개로 표현하는 인코딩 형식이다. `U+0000`부터 `U+D7FF`, `U+E000`부터 `U+FFFF`까지는 하나의 16비트 코드 유닛으로 표현되고, `U+10000`부터 `U+10FFFF`까지는 surrogate pair 두 코드 유닛으로 표현된다.

## Surrogate pair

Surrogate pair는 높은 surrogate와 낮은 surrogate가 쌍을 이루어 하나의 scalar value를 나타내는 방식이다. surrogate 코드 포인트 자체는 [[Unicode scalar value]]가 아니므로, 단독 surrogate 코드 유닛은 ill-formed UTF-16이다.

## 바이트 직렬화

UTF-16 코드 유닛은 16비트 값이므로 바이트열로 저장하거나 전송할 때 big-endian 또는 little-endian 순서가 필요하다. 이때 [[바이트 순서 표식]]이 있으면 바이트 순서를 구분하는 데 쓰일 수 있다. BOM이 없을 때 어떤 순서로 볼지는 형식이나 상위 프로토콜이 정해야 한다.

## 실무적 주의점

많은 플랫폼과 언어가 내부 문자열 표현으로 UTF-16 또는 UTF-16에 가까운 코드 유닛 모델을 사용해 왔다. 이 경우 문자열 길이가 사용자 지각 문자 수가 아니라 UTF-16 코드 유닛 수일 수 있다. 이모지나 일부 역사 문자처럼 surrogate pair가 필요한 문자는 코드 유닛 두 개로 계산된다.

## 출처

- [[The Unicode Standard 17.0.0]]
- [[WHATWG Encoding Standard]]

## 관련 항목

- [[유니코드]]
- [[코드 포인트]]
- [[Unicode scalar value]]
- [[코드 유닛]]
- [[UTF-8]]
- [[바이트 순서 표식]]
- [[그래핌 클러스터]]
- [[인코딩 오류]]
- [[인코딩 심화]]
- [[데이터 표현]]
- [[비트 패턴과 해석 규칙]]
- [[인코딩]]
