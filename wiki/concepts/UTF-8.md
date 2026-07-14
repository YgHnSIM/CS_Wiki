---
title: UTF-8
aliases: [Unicode Transformation Format 8-bit, UTF8]
summary: "Unicode scalar value를 1-4개의 8비트 코드 유닛으로 표현하는 ASCII 호환 가변 길이 인코딩."
tags: [type/concept, domain/computer-science, domain/internet, domain/text-processing, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["The Unicode Standard 17.0.0", "RFC 3629 UTF-8", "WHATWG Encoding Standard"]
status: active
---

## 개요

[[UTF-8]]은 [[Unicode scalar value]]를 1-4개의 8비트 [[코드 유닛]]으로 표현하는 가변 길이 인코딩 형식이다. ASCII 범위 `U+0000`부터 `U+007F`까지는 같은 값의 한 바이트로 표현되므로, ASCII 텍스트는 그대로 유효한 UTF-8 텍스트가 된다.

## 구조

UTF-8은 선행 바이트가 전체 길이를 나타내고, 이어지는 바이트는 `10xxxxxx` 형태의 continuation byte로 이어진다. 이 구조 덕분에 바이트 스트림 중간에서도 문자 경계를 비교적 쉽게 찾을 수 있다.

올바른 UTF-8은 가장 짧은 표현만 허용한다. 과거 보안 문제의 원인이 된 overlong sequence, surrogate 영역을 가리키는 시퀀스, Unicode 범위 밖의 값은 ill-formed로 다뤄야 한다.

## 장점과 주의점

UTF-8은 바이트 순서 문제가 없고, ASCII와 호환되며, 인터넷과 웹의 기본 텍스트 교환 인코딩으로 적합하다. 그러나 "한 문자 = 한 바이트"는 ASCII 범위에서만 맞다. 한글, 이모지, 결합 문자 시퀀스는 여러 바이트와 여러 코드 포인트가 필요할 수 있다.

## 출처

- [[The Unicode Standard 17.0.0]]
- [[RFC 3629 UTF-8]]
- [[WHATWG Encoding Standard]]

## 관련 항목

- [[유니코드]]
- [[ASCII]]
- [[코드 포인트]]
- [[Unicode scalar value]]
- [[코드 유닛]]
- [[UTF-16]]
- [[바이트 순서 표식]]
- [[인코딩 오류]]
- [[인코딩 심화]]
- [[그래핌 클러스터]]
- [[데이터 표현]]
- [[비트 패턴과 해석 규칙]]
- [[인코딩]]
