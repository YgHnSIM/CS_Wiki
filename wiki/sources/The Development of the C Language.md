---
title: The Development of the C Language
aliases: [Ritchie C history, C language history, Development of C]
tags: [type/reference, domain/programming-languages, domain/software-engineering, domain/computer-history, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["HOPL-II 1993", "Bell Labs/Lucent electronic reprint"]
source_id: ref-019
source_kind: external
primary_sources: ["HOPL-II 1993"]
supporting_sources: ["Bell Labs/Lucent electronic reprint", "ACM DOI", "PDF copy"]
source_urls: ["https://www.nokia.com/bell-labs/about/dennis-m-ritchie/chist.html", "https://dl.acm.org/doi/10.1145/234286.1057834", "https://brent.hailpern.com/wp-content/uploads/2020/02/p671-ritchie.pdf"]
retrieved: 2026-07-10
version: null
snapshot_status: external-only
status: active
---

## 개요

[[The Development of the C Language]]는 [[데니스 리치]]가 C 언어의 탄생과 변화를 회고한 논문이다. 이 문헌은 [[C 언어]]가 초기 [[Unix]]를 위한 [[시스템 프로그래밍]] 언어로 만들어졌고, BCPL과 B의 영향을 받아 타입 구조를 갖춘 언어로 진화했음을 설명한다.

Ritchie의 핵심 설명은 C가 추상적인 언어 설계에서 출발한 것이 아니라, 작고 제약이 심한 하드웨어 환경에서 운영체제와 도구를 더 쉽게 만들기 위한 실용적 필요에서 생겼다는 점이다. PDP-7의 B, [[PDP-11]]의 바이트 주소 지정, `char`와 포인터, 구조체, 전처리기, 별도 컴파일과 링커가 모두 이 맥락에서 등장한다.

## 주요 인사이트

- C는 1969-1973년 Unix의 초기 발전과 나란히 생겨났다.
- B는 BCPL을 바탕으로 한 작고 단순한 언어였지만, PDP-11의 바이트 주소 지정과 문자 처리, 부동소수점, 포인터 표현을 다루기에는 부족했다.
- C는 `char`, `int`, 포인터, 배열, 구조체 같은 타입 구조를 통해 기계 가까운 표현과 고급 언어의 표현력을 함께 제공했다.
- 1973년 Unix 커널을 C로 다시 작성한 일은 C가 시스템 프로그래밍 언어로 유용하고 효율적이라는 신뢰를 만든 전환점이었다.
- C의 전처리기, 라이브러리, 별도 컴파일, pcc, lint 같은 주변 도구는 언어와 개발 환경이 함께 진화했음을 보여준다.

## 위키 반영

이 자료는 [[C 언어]], [[시스템 프로그래밍]], [[C 문자열]], [[메모리 안전성]], [[컴파일러]], [[이식성]]을 보강하는 데 사용한다. [[Unix와 C]]는 이 자료를 중심으로 C가 Unix의 구현 언어가 되고, Unix가 C의 실험장과 배포 환경이 되는 상호작용을 정리한다.

## 출처

- Nokia Bell Labs, [The Development of the C Language](https://www.nokia.com/bell-labs/about/dennis-m-ritchie/chist.html)
- ACM Digital Library, [The development of the C programming language](https://dl.acm.org/doi/10.1145/234286.1057834)
- PDF copy, [The Development of the C Programming Language](https://brent.hailpern.com/wp-content/uploads/2020/02/p671-ritchie.pdf)

## 관련 항목

- [[데니스 리치]]
- [[켄 톰프슨]]
- [[Unix]]
- [[C 언어]]
- [[PDP-11]]
- [[시스템 프로그래밍]]
- [[컴파일러]]
- [[C 문자열]]
- [[메모리 안전성]]
- [[Unix와 C]]
