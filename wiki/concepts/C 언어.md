---
title: C 언어
aliases: [C, C programming language, C language]
tags: [type/concept, domain/programming-languages, domain/software-engineering, domain/computer-history, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["The Development of the C Language", "The Evolution of the Unix Time-sharing System", "Portability of C Programs and the UNIX System"]
status: active
---

## 개요

[[C 언어]]는 초기 [[Unix]]를 위한 [[시스템 프로그래밍]] 언어로 발전한 프로그래밍 언어다. BCPL과 B의 영향을 받았고, [[PDP-11]]의 바이트 주소 지정과 운영체제 구현 요구에 맞춰 `char`, `int`, 포인터, 배열, 구조체 같은 타입 구조를 갖추었다.

## 시스템 구현 언어

C의 역사적 의미는 고급 언어와 기계 가까운 제어 사이의 균형에 있다. C는 어셈블리 언어보다 읽고 유지보수하기 쉬우면서도, 메모리 주소, 바이트, 포인터, 구조체, 비트 연산 같은 저수준 표현을 직접 다룰 수 있었다. 이 성질 덕분에 Unix 커널과 유틸리티를 C로 작성할 수 있었다.

## Unix와의 관계

1973년 Unix 커널을 C로 다시 작성한 일은 C가 운영체제 구현에 충분히 빠르고 표현력이 있다는 신뢰를 만들었다. 이후 Unix 유틸리티와 도구도 C로 옮겨졌고, pcc 같은 이식 가능한 컴파일러와 함께 다른 기계로 확산되었다.

## 주의점

C는 기계에 가까운 표현력을 제공하는 만큼 [[메모리 안전성]]의 책임을 프로그래머에게 많이 남긴다. [[C 문자열]]의 널 종단, 포인터 연산, 타입 변환, 정수 범위는 시스템 프로그래밍의 힘이면서 동시에 오류와 취약점의 원천이 될 수 있다.

## 출처

- [[The Development of the C Language]]
- [[The Evolution of the Unix Time-sharing System]]
- [[Portability of C Programs and the UNIX System]]

## 관련 항목

- [[데니스 리치]]
- [[켄 톰프슨]]
- [[Unix]]
- [[PDP-11]]
- [[시스템 프로그래밍]]
- [[컴파일러]]
- [[이식성]]
- [[C 문자열]]
- [[메모리 안전성]]
- [[Unix와 C]]
- [[데이터 표현]]
- [[비트와 바이트]]
- [[소프트웨어 공학]]
- [[소프트웨어 재사용의 역사]]
- [[스티븐 C. 존슨]]
- [[시스템 호출]]
- [[운영체제]]
- [[초기 소프트웨어의 계층화]]
- [[프로그래밍 언어]]
