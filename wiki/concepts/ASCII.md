---
title: ASCII
aliases: [American Standard Code for Information Interchange, 아스키]
summary: "문자에 숫자 값을 대응시키는 7비트 문자 인코딩 표준이자 UTF-8 ASCII 범위 호환성의 기반."
tags: [type/concept, domain/computer-science, domain/systems, status/active]
created: 2026-05-12
updated: 2026-07-22
sources: ["데이터 표현과 인코딩.md", "The Unicode Standard 17.0.0", "RFC 3629 UTF-8"]
status: active
graph_id: concept-6a0c16a9841c87e8
---

## 개요

[[ASCII]]는 문자에 숫자 값을 대응시키는 초기 문자 인코딩 표준이다. 본래 128개 문자를 정의하는 7비트 체계이며, 8비트 바이트 환경에서는 보통 최상위 비트를 0으로 채워 저장한다.

## 비트 패턴

ASCII에서 대문자와 소문자의 차이는 값 32, 즉 `2^5` 위치의 비트 하나이다. 예를 들어 `A`는 65이고 `a`는 97이므로 둘의 차이는 32이다. 이 규칙은 문자 처리가 단순한 표가 아니라 비트 패턴의 규칙성을 활용할 수 있는 영역임을 보여준다.

## 한계

ASCII는 로마자 중심의 7비트 표준이므로 다른 언어 문자나 이모지를 표현할 수 없다. 이 한계는 더 넓은 문자 집합과 인코딩 체계를 제공하는 [[유니코드]]가 필요해진 중요한 배경이다.

## UTF-8과의 관계

[[UTF-8]]은 ASCII 범위 `U+0000`부터 `U+007F`까지를 같은 한 바이트 값으로 표현한다. 그래서 순수 ASCII 텍스트는 그대로 유효한 UTF-8 텍스트이기도 하다. 다만 이 호환성은 ASCII 범위에만 해당하며, 한글이나 이모지처럼 ASCII 밖의 문자는 여러 바이트가 필요하다.

## 출처

- [[데이터 표현과 인코딩]]
- [[The Unicode Standard 17.0.0]]
- [[RFC 3629 UTF-8]]

## 관련 항목

- [[인코딩]]
- [[데이터 표현]]
- [[비트와 바이트]]
- [[유니코드]]
- [[UTF-8]]
- [[코드 포인트]]
- [[인코딩 심화]]
- [[비트 연산]]
- [[비트 패턴과 해석 규칙]]
