---
title: ASCII
aliases: [American Standard Code for Information Interchange, 아스키]
tags: [type/concept, domain/computer-science, domain/systems, status/active]
created: 2026-05-12
updated: 2026-05-12
sources: ["데이터 표현과 인코딩.md"]
status: active
---

## 개요

[[ASCII]]는 문자에 숫자 값을 대응시키는 초기 문자 인코딩 표준이다. 본래 128개 문자를 정의하는 7비트 체계이며, 8비트 바이트 환경에서는 보통 최상위 비트를 0으로 채워 저장한다.

## 비트 패턴

ASCII에서 대문자와 소문자의 차이는 값 32, 즉 `2^5` 위치의 비트 하나이다. 예를 들어 `A`는 65이고 `a`는 97이므로 둘의 차이는 32이다. 이 규칙은 문자 처리가 단순한 표가 아니라 비트 패턴의 규칙성을 활용할 수 있는 영역임을 보여준다.

## 한계

ASCII는 로마자 중심의 7비트 표준이므로 다른 언어 문자나 이모지를 표현할 수 없다. 이 한계는 더 넓은 문자 집합과 인코딩 체계를 제공하는 [[유니코드]]가 필요해진 중요한 배경이다.

## 출처

- [[데이터 표현과 인코딩]]

## 관련 항목

- [[인코딩]]
- [[데이터 표현]]
- [[비트와 바이트]]
- [[유니코드]]
- [[비트 연산]]
